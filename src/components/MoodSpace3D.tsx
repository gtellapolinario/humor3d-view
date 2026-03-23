import React, { Suspense, useEffect, useMemo, useRef } from 'react';
import { Canvas, useFrame, useLoader, useThree } from '@react-three/fiber';
import { Html, Line, OrbitControls, useProgress } from '@react-three/drei';
import * as THREE from 'three';
import { Water } from 'three/examples/jsm/objects/Water.js';
import { Sky } from 'three/examples/jsm/objects/Sky.js';
import { MoodNode } from '@u/types';
import { MOOD_NODES } from '@u/constants';

function CanvasLoader() {
  const { progress } = useProgress();
  return (
    <Html center>
      <div className="flex flex-col items-center justify-center">
        <div className="mb-3 h-8 w-8 animate-spin rounded-full border-4 border-indigo-200 border-t-indigo-600"></div>
        <span className="text-xs font-bold tracking-widest text-indigo-600 uppercase">
          Carregando {progress.toFixed(0)}%
        </span>
      </div>
    </Html>
  );
}

interface MoodSpace3DProps {
  onSelectNode?: (node: MoodNode | null) => void;
  selectedNodeId?: string | null;
  elevation?: number;
}

const MOOD_SCENE_SCALE = 4.5;
const WATER_CLEARANCE = 8;
const AXIS_EXTENT = 10;

const MOOD_MIN_Y = Math.min(...MOOD_NODES.map((node) => node.position.y));
const MOOD_MAX_Y = Math.max(...MOOD_NODES.map((node) => node.position.y));

const MOOD_SCENE_Y = Math.abs(MOOD_MIN_Y * MOOD_SCENE_SCALE) + WATER_CLEARANCE;
const MOOD_TARGET_Y =
  MOOD_SCENE_Y + ((MOOD_MIN_Y + MOOD_MAX_Y) / 2) * MOOD_SCENE_SCALE;

const ConnectionLine = ({
  end,
  color,
  isActive,
}: {
  end: { x: number; y: number; z: number };
  color: string;
  isActive: boolean;
}) => {
  const points = useMemo(
    () => [new THREE.Vector3(0, 0, 0), new THREE.Vector3(end.x, end.y, end.z)],
    [end]
  );

  return (
    <Line
      points={points}
      color={isActive ? color : '#fff'}
      transparent
      opacity={isActive ? 0.85 : 0.8}
      lineWidth={isActive ? 6.2 : 2.2}
    />
  );
};

const NodeSphere = ({
  node,
  isSelected,
  onNodeClick,
}: {
  node: MoodNode;
  isSelected: boolean;
  onNodeClick: (node: MoodNode) => void;
}) => {
  const meshRef = useRef<THREE.Mesh>(null);
  const targetScaleVec = useMemo(() => new THREE.Vector3(), []);
  const hoveredRef = useRef(false);

  useEffect(() => {
    return () => {
      document.body.style.cursor = 'default';
    };
  }, []);

  useFrame(() => {
    if (!meshRef.current) return;

    meshRef.current.rotation.y += 0.01;

    const targetScale = isSelected ? 1.2 : hoveredRef.current ? 1.08 : 1;
    targetScaleVec.set(targetScale, targetScale, targetScale);
    meshRef.current.scale.lerp(targetScaleVec, 0.1);
  });

  const handleClick = (e: any) => {
    e.stopPropagation();
    onNodeClick(node);
  };

  return (
    <group position={[node.position.x, node.position.y, node.position.z]}>
      <mesh
        ref={meshRef}
        onClick={handleClick}
        onPointerOver={() => {
          document.body.style.cursor = 'pointer';
          hoveredRef.current = true;
        }}
        onPointerOut={() => {
          document.body.style.cursor = 'default';
          hoveredRef.current = false;
        }}
      >
        <sphereGeometry args={[0.28, 32, 32]} />
        <meshStandardMaterial
          color={node.color}
          emissive={node.color}
          emissiveIntensity={isSelected ? 0.95 : hoveredRef.current ? 0.55 : 0.18}
          roughness={0.18}
          metalness={0.82}
          envMapIntensity={1.6}
        />
      </mesh>
    </group>
  );
};

const SeaAndSky = ({ elevation, activeId }: { elevation: number; activeId?: string | null }) => {
  const { gl, scene } = useThree();

  const waterNormals = useLoader(
    THREE.TextureLoader,
    './textures/waternormals.jpg'
  );

  const sun = useMemo(() => new THREE.Vector3(), []);
  const pmremRef = useRef<THREE.PMREMGenerator | null>(null);
  const envTargetRef = useRef<THREE.WebGLRenderTarget | null>(null);

  useEffect(() => {
    waterNormals.wrapS = THREE.RepeatWrapping;
    waterNormals.wrapT = THREE.RepeatWrapping;
    waterNormals.needsUpdate = true;
  }, [waterNormals]);

  const displaySky = useMemo(() => {
    const skyObj = new Sky();
    skyObj.scale.setScalar(10000);
    skyObj.raycast = () => null;
    return skyObj;
  }, []);

  const envSky = useMemo(() => {
    const skyObj = new Sky();
    skyObj.scale.setScalar(10000);
    return skyObj;
  }, []);

  const envScene = useMemo(() => {
    const skyScene = new THREE.Scene();
    skyScene.add(envSky);
    return skyScene;
  }, [envSky]);

  const water = useMemo(() => {
    const waterGeometry = new THREE.PlaneGeometry(10000, 10000);

    const waterObj = new Water(waterGeometry, {
      textureWidth: 512,
      textureHeight: 512,
      waterNormals,
      sunDirection: new THREE.Vector3(),
      sunColor: 0xffffff,
      waterColor: 0x001e0f,
      distortionScale: 3.7,
      fog: false,
    });

    waterObj.rotation.x = -Math.PI / 2;
    waterObj.raycast = () => null;

    return waterObj;
  }, [waterNormals]);

  useEffect(() => {
    pmremRef.current = new THREE.PMREMGenerator(gl);
    pmremRef.current.compileEquirectangularShader();

    return () => {
      envTargetRef.current?.dispose();
      pmremRef.current?.dispose();
      scene.environment = null;

      water.geometry.dispose();
      (water.material as THREE.Material).dispose();

      displaySky.geometry.dispose();
      (displaySky.material as THREE.Material).dispose();

      envSky.geometry.dispose();
      (envSky.material as THREE.Material).dispose();
    };
  }, [gl, scene, water, displaySky, envSky]);

  useEffect(() => {
    const phi = 2 * Math.PI * (0.25 - 0.5);

    // Correção da orientação:
    // elevation baixo  -> noite / sol baixo
    // elevation alto   -> dia / sol alto
    const theta = Math.PI * (0.5 - elevation);

    sun.x = Math.cos(phi);
    sun.y = Math.sin(phi) * Math.sin(theta);
    sun.z = Math.sin(phi) * Math.cos(theta);

    const displaySkyMaterial = displaySky.material as THREE.ShaderMaterial;
    displaySkyMaterial.uniforms.sunPosition.value.copy(sun);

    const envSkyMaterial = envSky.material as THREE.ShaderMaterial;
    envSkyMaterial.uniforms.sunPosition.value.copy(sun);

    const waterMaterial = water.material as THREE.ShaderMaterial;
    waterMaterial.uniforms.sunDirection.value.copy(sun).normalize();

    // gl.toneMappingExposure = 0.3 + elevation * 0.4;

    if (pmremRef.current) {
      envTargetRef.current?.dispose();
      envTargetRef.current = pmremRef.current.fromScene(envScene);
      scene.environment = envTargetRef.current.texture;
    }
  }, [displaySky, elevation, envScene, envSky, gl, scene, sun, water]);

  useFrame((state, delta) => {
    // 1. Anima a água (já estava no seu código)
    const waterMaterial = water.material as THREE.ShaderMaterial;
    waterMaterial.uniforms.time.value += delta;

    // 2. Lógica de Oscilação de Luz (Agitação)
    const baseExposure = 0.3 + elevation * 0.4; // O brilho base que calculamos

    if (activeId === 'agitated-depression' || activeId === 'mixed-state') {
      const time = state.clock.getElapsedTime();

      // Cria uma onda matemática errática e nervosa (misturando duas velocidades)
      const agitationFlicker =
        Math.sin(time * 15) * 0.08 + // tremor rápido
        Math.sin(time * 3) * 0.12;   // pulsação mais lenta

      // Aplica o tremor na luz da tela
      gl.toneMappingExposure = Math.max(0.1, baseExposure + agitationFlicker);

    } else {
      // Se for qualquer outro nodo, a luz fica paradinha e estável
      gl.toneMappingExposure = baseExposure;
    }
  });

  return (
    <>
      <primitive object={displaySky} />
      <primitive object={water} />
    </>
  );
};

const CameraAnimator = ({ activeId }: { activeId?: string }) => {
  const { controls } = useThree();
  const lookAtPos = useMemo(() => new THREE.Vector3(), []);

  useFrame((_, delta) => {
    if (!controls) return;
    
    if (activeId) {
      const node = MOOD_NODES.find((n) => n.id === activeId);
      if (node) {
        const x = node.position.x * MOOD_SCENE_SCALE;
        const y = node.position.y * MOOD_SCENE_SCALE + MOOD_SCENE_Y;
        const z = node.position.z * MOOD_SCENE_SCALE;

        lookAtPos.set(x, y, z);
        
        // Apenas movemos o alvo (lookAt) para centralizar o nodo.
        // NÃO mexemos na camera.position para preservar o zoom e a órbita do usuário.
        (controls as any).target.lerp(lookAtPos, 3 * delta);
      }
    } else {
      lookAtPos.set(0, MOOD_TARGET_Y, 0);
      (controls as any).target.lerp(lookAtPos, 3 * delta);
    }
    (controls as any).update();
  });

  return null;
};

const Scene = ({
  elevation,
  onSelectNode,
  selectedNodeId,
}: MoodSpace3DProps & {
  elevation: number;
}) => {
  const activeId = selectedNodeId ?? undefined;

  const handleNodeClick = (node: MoodNode) => {
    onSelectNode?.(node);
  };

  const handleMiss = () => {
    onSelectNode?.(null);
  };

  return (
    <>
      <CameraAnimator activeId={activeId} />
      <SeaAndSky elevation={elevation} activeId={selectedNodeId} />

      <ambientLight intensity={0.22} />
      <directionalLight position={[50, 100, 25]} intensity={0.5} color="#ffffff" />

      <group onPointerMissed={handleMiss}>
        <group
          position={[0, MOOD_SCENE_Y, 0]}
          scale={[MOOD_SCENE_SCALE, MOOD_SCENE_SCALE, MOOD_SCENE_SCALE]}
        >
          <group position={[0, 0, 0]}>
            <Line
              points={[
                new THREE.Vector3(-AXIS_EXTENT, 0, 0),
                new THREE.Vector3(AXIS_EXTENT, 0, 0),
              ]}
              color="#fff"
              transparent
              opacity={0.9}
              lineWidth={3.5}
            />
            <Line
              points={[
                new THREE.Vector3(0, -AXIS_EXTENT, 0),
                new THREE.Vector3(0, AXIS_EXTENT, 0),
              ]}
              color="#fff"
              transparent
              opacity={0.9}
              lineWidth={3.5}
            />
            <Line
              points={[
                new THREE.Vector3(0, 0, -AXIS_EXTENT),
                new THREE.Vector3(0, 0, AXIS_EXTENT),
              ]}
              color="#fff"
              transparent
              opacity={0.9}
              lineWidth={3.5}
            />
          </group>

          {MOOD_NODES.map((node) => (
            <React.Fragment key={node.id}>
              <NodeSphere
                node={node}
                isSelected={activeId === node.id}
                onNodeClick={handleNodeClick}
              />
              <ConnectionLine
                end={node.position}
                color={node.color}
                isActive={activeId === node.id}
              />
            </React.Fragment>
          ))}
        </group>
      </group>

      <OrbitControls
        makeDefault
        maxPolarAngle={Math.PI * 0.495}
        target={[0, MOOD_TARGET_Y, 0]}
        minDistance={14}
        maxDistance={95}
        enableDamping
      />
    </>
  );
};

class ErrorBoundary extends React.Component<
  { children: React.ReactNode },
  { hasError: boolean }
> {
  constructor(props: { children: React.ReactNode }) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(_error: unknown) {
    return { hasError: true };
  }

  componentDidCatch(error: unknown, errorInfo: unknown) {
    console.error('3D Canvas Error:', error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="flex h-full w-full items-center justify-center bg-slate-900 text-red-400">
          Erro ao renderizar 3D
        </div>
      );
    }

    return this.props.children;
  }
}

const MoodSpace3D: React.FC<MoodSpace3DProps> = ({
  elevation = 0.49,
  ...props
}) => {
  return (
    <div className="relative h-full w-full bg-slate-100">
      <ErrorBoundary>
        <Canvas
          camera={{
            position: [30, MOOD_TARGET_Y + 8, 38],
            fov: 60,
            near: 0.1,
            far: 20000,
          }}
          gl={{ antialias: true }}
          onCreated={({ gl }) => {
            gl.setPixelRatio(Math.min(window.devicePixelRatio, 2));
            gl.toneMapping = THREE.ACESFilmicToneMapping;
            gl.toneMappingExposure = 0.5;
          }}
        >
          <Suspense fallback={<CanvasLoader />}>
            <Scene {...props} elevation={elevation} />
          </Suspense>
        </Canvas>
      </ErrorBoundary>
    </div>
  );
};

export default MoodSpace3D;
