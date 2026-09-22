import { useRef, useEffect } from 'react';
import * as THREE from 'three';
import { audioManager } from '../../engine/audio/AudioManager';

interface PositionalSoundEmitterProps {
  position: [number, number, number];
  refDistance?: number;
  maxDistance?: number;
  soundType?: 'woodchop' | 'campfire' | 'mining';
}

export function PositionalSoundEmitter({
  position,
  refDistance = 10,
  maxDistance = 45,
  soundType = 'woodchop',
}: PositionalSoundEmitterProps) {
  const groupRef = useRef<THREE.Group>(null);
  const positionalAudioRef = useRef<THREE.PositionalAudio | null>(null);

  useEffect(() => {
    const group = groupRef.current;
    if (!group) return;

    const positionalSound = audioManager.createPositionalAudio(refDistance, maxDistance);
    if (!positionalSound) return;

    positionalAudioRef.current = positionalSound;
    group.add(positionalSound);

    return () => {
      if (positionalAudioRef.current) {
        group.remove(positionalAudioRef.current);
        positionalAudioRef.current = null;
      }
    };
  }, [refDistance, maxDistance, soundType]);

  return (
    <group ref={groupRef} position={position} />
  );
}
