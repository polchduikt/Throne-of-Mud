import { useRef, useEffect } from 'react';
import { useFrame, useThree } from '@react-three/fiber';
import * as THREE from 'three';
import { buildingEntities, characterEntities } from '../../engine/ecs/world';
import { audioManager } from '../../engine/audio/AudioManager';

export function SpatialAudioListener() {
  const { camera } = useThree();
  const lastUpdateRef = useRef(0);
  const lastChatterRef = useRef(0);
  const listenerRef = useRef<THREE.AudioListener | null>(null);

  useEffect(() => {
    const listener = new THREE.AudioListener();
    camera.add(listener);
    listenerRef.current = listener;
    audioManager.setCameraListener(listener);

    return () => {
      camera.remove(listener);
      listenerRef.current = null;
    };
  }, [camera]);

  useFrame(() => {
    const now = performance.now();
    if (now - lastUpdateRef.current < 100) return;
    lastUpdateRef.current = now;

    const orthoCam = camera as THREE.OrthographicCamera;
    const currentZoom = orthoCam.zoom ?? 38.0;

    const camTarget = (window as any).__lastCameraTarget as [number, number] | undefined;
    const camX = camTarget ? camTarget[0] : camera.position.x;
    const camZ = camTarget ? camTarget[1] : camera.position.z;

    const SCAN_RADIUS = 30.0;
    const radiusSq = SCAN_RADIUS * SCAN_RADIUS;

    let nearbyBuildingsCount = 0;
    let minCampfireDist = Infinity;

    for (const b of buildingEntities) {
      if (!b.position) continue;
      const dx = b.position[0] - camX;
      const dz = b.position[2] - camZ;
      const distSq = dx * dx + dz * dz;

      if (distSq <= radiusSq) {
        nearbyBuildingsCount++;
      }
      if (b.buildingType === 'campfire') {
        const dist = Math.sqrt(distSq);
        if (dist < minCampfireDist) minCampfireDist = dist;
      }
    }

    const campfireProximity = (minCampfireDist <= 6.5 && currentZoom >= 36.0)
      ? Math.pow(1.0 - minCampfireDist / 6.5, 2.5)
      : 0.0;

    if (now - lastChatterRef.current > 7500 && currentZoom >= 36.0) {
      const charArr = Array.from(characterEntities);
      for (let i = 0; i < charArr.length; i++) {
        const c1 = charArr[i];
        if (!c1.position) continue;
        const dx1 = c1.position[0] - camX;
        const dz1 = c1.position[2] - camZ;
        if (dx1 * dx1 + dz1 * dz1 > 22 * 22) continue;

        for (let j = i + 1; j < charArr.length; j++) {
          const c2 = charArr[j];
          if (!c2.position) continue;
          const distBetween = Math.hypot(c1.position[0] - c2.position[0], c1.position[2] - c2.position[2]);
          if (distBetween < 3.2) {
            audioManager.playPeasantVocal(c1.position[0], c1.position[2], 'greet');
            lastChatterRef.current = now + Math.random() * 4500;
            break;
          }
        }
      }
    }

    const villageDensity = Math.min(1.0, nearbyBuildingsCount / 6.0);
    const forestDensity = Math.max(0.15, 1.0 - villageDensity * 0.85);
    const waterProximity = 0.0;

    audioManager.updateAreaAmbience({
      villageDensity,
      forestDensity,
      waterProximity,
      campfireProximity,
      zoom: currentZoom,
      camX,
      camZ,
    });
  });

  return null;
}
