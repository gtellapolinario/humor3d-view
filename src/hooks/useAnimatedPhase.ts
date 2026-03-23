import { useEffect, useState } from 'react';

interface UseAnimatedPhaseOptions {
  enabled?: boolean;
  fps?: number;
  speed?: number;
  initialPhase?: number;
}

export function useAnimatedPhase({
  enabled = true,
  fps = 30,
  speed = 0.0015,
  initialPhase = 0,
}: UseAnimatedPhaseOptions = {}) {
  const [phase, setPhase] = useState<number>(initialPhase);

  useEffect(() => {
    if (!enabled) return;
    
    let currentPhase = phase;
    const intervalMs = 1000 / fps;
    
    const intervalId = window.setInterval(() => {
      currentPhase += intervalMs * speed;
      setPhase(currentPhase);
    }, intervalMs);

    return () => {
      window.clearInterval(intervalId);
    };
  }, [enabled, fps, speed]);

  return phase;
}

export default useAnimatedPhase;