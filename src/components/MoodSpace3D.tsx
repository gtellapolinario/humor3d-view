import React, { Suspense, useEffect, useMemo, useRef, useState } from 'react';
import { Canvas, useFrame, useLoader, useThree } from '@react-three/fiber';
import { Line, OrbitControls } from '@react-three/drei';
import { useNavigate, useMatchRoute } from '@tanstack/react-router';
import * as THREE from 'three';
import { Water } from 'three/examples/jsm/objects/Water.js';
import { Sky } from 'three/examples/jsm/objects/Sky.js';
import { MoodNode } from '@/types';
import { MOOD_NODES } from '@/constants';

interface MoodSpace3DProps {
  onSelectNode?: (node: MoodNode | null) => void;
  selectedNodeId?: string | null;
}

const MOOD_SCENE_SCALE = 4.5;
const WATER_CLEARANCE = 8;
const AXIS_EXTENT = 10;

const MOOD_MIN_Y = Math.min(...MOOD_NODES.map((node) => node.position.y));
const MOOD_MAX_Y = Math.max(...MOOD_NODES.map((node) => node.position.y));

/**
 * Eleva o sistema inteiro acima da água.
 * O menor ponto do grafo, depois da escala, sempre ficará ao menos
 * WATER_CLEARANCE unidades acima do plano da água.
 */
const MOOD_SCENE_Y = Math.abs(MOOD_MIN_Y * MOOD_SCENE_SCALE) + WATER_CLEARANCE;

/**
 * Centro vertical do conjunto já elevado.
 * Serve para posicionamento inicial da câmera e target dos controles.
 */
const MOOD_TARGET_Y =
  MOOD_SCENE_Y + ((MOOD_MIN_Y + MOOD_MAX_Y) / 2) * MOOD_SCENE_SCALE;

function getTimeLabel(elevation: number): string {
  if (elevation < 0.1) return 'Noite';
  if (elevation < 0.3) return 'Amanhecer';
  if (elevation < 0.48) return 'Dia';
  if (elevation < 0.52) return 'Pôr do Sol';
  return 'Dia Claro';
}

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
      opacity={isActive ? 0.95 : 0.85}
      lineWidth={isActive ? 4.8 : 2.2}
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
  const [hovered, setHovered] = useState(false);
  const targetScaleVec = useMemo(() => new THREE.Vector3(), []);

  useEffect(() => {
    return () => {
      document.body.style.cursor = 'default';
    };
  }, []);

  useFrame(() => {
    if (!meshRef.current) return;

    meshRef.current.rotation.y += 0.01;

    const targetScale = isSelected ? 1.45 : hovered ? 1.18 : 1;
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
          setHovered(true);
        }}
        onPointerOut={() => {
          document.body.style.cursor = 'default';
          setHovered(false);
        }}
      >
        <sphereGeometry args={[0.28, 32, 32]} />
        <meshStandardMaterial
          color={node.color}
          emissive={node.color}
          emissiveIntensity={isSelected ? 0.95 : hovered ? 0.55 : 0.18}
          roughness={0.18}
          metalness={0.82}
          envMapIntensity={1.6}
        />
      </mesh>
    </group>
  );
};

const SeaAndSky = ({ elevation }: { elevation: number }) => {
  const { gl, scene } = useThree();

  const waterNormals = useLoader(
    THREE.TextureLoader,
    'https://threejs.org/examples/textures/waternormals.jpg'
  );

  const sun = useMemo(() => new THREE.Vector3(), []);
  const pmremRef = useRef<THREE.PMREMGenerator | null>(null);
  const envTargetRef = useRef<THREE.WebGLRenderTarget | null>(null);

  useEffect(() => {
    waterNormals.wrapS = THREE.RepeatWrapping;
    waterNormals.wrapT = THREE.RepeatWrapping;
    waterNormals.needsUpdate = true;
  }, [waterNormals]);

  const sky = useMemo(() => {
    const skyObj = new Sky();
    skyObj.scale.setScalar(10000);
    skyObj.raycast = () => null;
    return skyObj;
  }, []);

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

      sky.geometry.dispose();
      (sky.material as THREE.Material).dispose();
    };
  }, [gl, scene, sky, water]);

  useEffect(() => {
    const phi = 2 * Math.PI * (0.25 - 0.5);
    const theta = Math.PI * (elevation - 0.5);

    sun.x = Math.cos(phi);
    sun.y = Math.sin(phi) * Math.sin(theta);
    sun.z = Math.sin(phi) * Math.cos(theta);

    const skyMaterial = sky.material as THREE.ShaderMaterial;
    skyMaterial.uniforms.sunPosition.value.copy(sun);

    const waterMaterial = water.material as THREE.ShaderMaterial;
    waterMaterial.uniforms.sunDirection.value.copy(sun).normalize();

    gl.toneMappingExposure = 0.3 + elevation * 0.4;

    if (pmremRef.current) {
      envTargetRef.current?.dispose();
      envTargetRef.current = pmremRef.current.fromScene(
        sky as unknown as THREE.Scene
      );
      scene.environment = envTargetRef.current.texture;
    }
  }, [elevation, gl, scene, sky, sun, water]);

  useFrame((_state, delta) => {
    const waterMaterial = water.material as THREE.ShaderMaterial;
    waterMaterial.uniforms.time.value += delta;
  });

  return (
    <>
      <primitive object={sky} />
      <primitive object={water} />
    </>
  );
};

const Scene = ({
  elevation,
  onSelectNode,
  selectedNodeId,
  routerSelectedId,
  onNavigate,
}: MoodSpace3DProps & {
  elevation: number;
  routerSelectedId?: string;
  onNavigate?: (id: string) => void;
}) => {
  const activeId =
    selectedNodeId !== undefined ? selectedNodeId || undefined : routerSelectedId;

  const handleNodeClick = (node: MoodNode) => {
    if (onSelectNode) {
      onSelectNode(node);
    }

    if (!onSelectNode && onNavigate) {
      onNavigate(node.id);
    }
  };

  const handleMiss = () => {
    if (onSelectNode) {
      onSelectNode(null);
    } else if (onNavigate && routerSelectedId) {
      onNavigate('');
    }
  };

  return (
    <>
      <SeaAndSky elevation={elevation} />

      <ambientLight intensity={0.22} />
      <directionalLight
        position={[50, 100, 25]}
        intensity={0.5}
        color="#ffffff"
      />

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
              opacity={0.65}
              lineWidth={3}
            />
            <Line
              points={[
                new THREE.Vector3(0, -AXIS_EXTENT, 0),
                new THREE.Vector3(0, AXIS_EXTENT, 0),
              ]}
              color="#fff"
              transparent
              opacity={0.65}
              lineWidth={3}
            />
            <Line
              points={[
                new THREE.Vector3(0, 0, -AXIS_EXTENT),
                new THREE.Vector3(0, 0, AXIS_EXTENT),
              ]}
              color="#fff"
              transparent
              opacity={0.6}
              lineWidth={3}
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
        minDistance={12}
        maxDistance={90}
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

  static getDerivedStateFromError(_error: any) {
    return { hasError: true };
  }

  componentDidCatch(error: any, errorInfo: any) {
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

const MoodSpace3D: React.FC<MoodSpace3DProps> = (props) => {
  const matchRoute = useMatchRoute();
  const navigate = useNavigate();
  const [elevation, setElevation] = useState(0.49);

  const match = matchRoute({ to: '/mood/$moodId' });
  const routerSelectedId = match ? (match as any).moodId : undefined;

  const handleNavigate = (id: string) => {
    if (!navigate) return;

    if (id) {
      // @ts-ignore
      navigate({ to: '/mood/$moodId', params: { moodId: id } });
    } else {
      navigate({ to: '/' });
    }
  };

  return (
    <div className="relative h-full w-full">
      <ErrorBoundary>
        <Canvas
          camera={{
            position: [18, MOOD_TARGET_Y + 6, 44],
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
          <Suspense fallback={null}>
            <Scene
              {...props}
              elevation={elevation}
              routerSelectedId={routerSelectedId}
              onNavigate={handleNavigate}
            />
          </Suspense>
        </Canvas>
      </ErrorBoundary>

      <div
        className="pointer-events-auto absolute left-5 top-24 z-20 rounded-lg text-white shadow-2xl"
        style={{
          background: 'rgba(0,0,0,0.7)',
          padding: '15px',
          borderRadius: '8px',
          fontFamily: 'Arial, sans-serif',
        }}
      >
        <label htmlFor="timeSlider" className="block text-sm">
          Hora do dia: <span>{getTimeLabel(elevation)}</span>
        </label>

        <input
          id="timeSlider"
          type="range"
          min={0}
          max={100}
          step={1}
          value={Math.round(elevation * 100)}
          onChange={(e) => setElevation(Number(e.target.value) / 100)}
          style={{ width: '200px' }}
          className="mt-2"
        />
      </div>
    </div>
  );
};

export default MoodSpace3D;