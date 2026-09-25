import { useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import type * as THREE from 'three';
import { SHARED_BUILDING_MATS } from '../buildingMaterials';

export function CampfireModel() {
  const mats = SHARED_BUILDING_MATS;
  const fireFlameRef = useRef<THREE.Group>(null);
  const fireSparksRef = useRef<THREE.Group>(null);
  const fireLightRef = useRef<THREE.PointLight>(null);

  useFrame(({ clock }) => {
    const t = clock.getElapsedTime();

    if (fireFlameRef.current) {
      const flames = fireFlameRef.current.children;
      for (let i = 0; i < flames.length; i++) {
        const flame = flames[i];
        const seed = i * 2.1;
        const wobbleX = Math.sin(t * 10 + seed) * 0.05 + Math.cos(t * 17 + seed * 1.5) * 0.03;
        const wobbleZ = Math.cos(t * 12 + seed * 1.3) * 0.05 + Math.sin(t * 19 + seed) * 0.03;
        const scaleY = 0.8 + Math.sin(t * 13 + seed * 2) * 0.28 + Math.cos(t * 21 + seed) * 0.18;
        const scaleXZ = 0.75 + Math.cos(t * 11 + seed * 1.5) * 0.2;
        flame.scale.set(scaleXZ, scaleY, scaleXZ);
        flame.position.x = wobbleX;
        flame.position.z = wobbleZ;
        flame.rotation.y = t * (2.0 + (i % 2 === 0 ? 1.2 : -1.2));
      }
    }

    if (fireSparksRef.current) {
      const sparks = fireSparksRef.current.children;
      for (let i = 0; i < sparks.length; i++) {
        const spark = sparks[i];
        const offset = (t * 1.4 + i * 0.38) % 1.6;
        spark.position.y = 0.2 + offset * 0.85;
        spark.position.x = Math.sin(offset * 4.5 + i * 2.2) * (0.07 + offset * 0.14);
        spark.position.z = Math.cos(offset * 5.2 + i * 3.1) * (0.07 + offset * 0.14);
        const s = Math.max(0.01, (1 - offset / 1.6) * 0.045);
        spark.scale.set(s, s, s);
      }
    }

    if (fireLightRef.current) {
      fireLightRef.current.intensity = 2.4 + Math.sin(t * 15) * 0.5 + Math.cos(t * 23) * 0.3;
    }
  });

  return (
    <group>
      <mesh material={mats.ashBed} position={[0, 0.02, 0]} receiveShadow>
        <cylinderGeometry args={[0.75, 0.75, 0.02, 12]} />
      </mesh>
      {[0, 1, 2, 3, 4, 5, 6, 7].map((i) => {
        const angle = (i / 8) * Math.PI * 2;
        return (
          <mesh
            key={`c-stone-${i}`}
            material={mats.stoneMed}
            position={[Math.cos(angle) * 0.52, 0.08, Math.sin(angle) * 0.52]}
            rotation={[i * 0.4, i * 0.8, 0]}
            scale={[0.2, 0.15, 0.2]}
            castShadow
            receiveShadow
          >
            <dodecahedronGeometry args={[1, 0]} />
          </mesh>
        );
      })}

      <mesh material={mats.charredWood} position={[0, 0.08, 0]} rotation={[0.2, 0.4, 0.1]} castShadow>
        <cylinderGeometry args={[0.06, 0.08, 0.65, 5]} />
      </mesh>
      <mesh material={mats.charredWood} position={[0, 0.09, 0]} rotation={[-0.2, -0.7, 0.1]} castShadow>
        <cylinderGeometry args={[0.06, 0.08, 0.65, 5]} />
      </mesh>
      <mesh material={mats.charredWood} position={[0, 0.10, 0]} rotation={[0.6, 0.2, -0.4]} castShadow>
        <cylinderGeometry args={[0.05, 0.07, 0.62, 5]} />
      </mesh>
      <mesh material={mats.charredWood} position={[0, 0.10, 0]} rotation={[-0.5, 0.6, 0.3]} castShadow>
        <cylinderGeometry args={[0.05, 0.07, 0.62, 5]} />
      </mesh>

      {[-0.08, 0.08].map((ex, ei) =>
        [-0.08, 0.08].map((ez, zi) => (
          <mesh
            key={`ember-${ei}-${zi}`}
            material={mats.emberGlow}
            position={[ex, 0.05, ez]}
            scale={[0.05, 0.03, 0.05]}
          >
            <dodecahedronGeometry args={[1, 0]} />
          </mesh>
        ))
      )}

      <group position={[-0.75, 0.08, 0]}>
        <mesh material={mats.timberLight} castShadow receiveShadow>
          <boxGeometry args={[0.2, 0.14, 0.8]} />
        </mesh>
      </group>
      <group position={[0.75, 0.08, 0]}>
        <mesh material={mats.timberLight} castShadow receiveShadow>
          <boxGeometry args={[0.2, 0.14, 0.8]} />
        </mesh>
      </group>
      <group position={[0, 0.08, -0.75]}>
        <mesh material={mats.timberLight} castShadow receiveShadow>
          <boxGeometry args={[0.8, 0.14, 0.2]} />
        </mesh>
      </group>
      <group position={[0, 0.08, 0.75]}>
        <mesh material={mats.timberLight} castShadow receiveShadow>
          <boxGeometry args={[0.8, 0.14, 0.2]} />
        </mesh>
      </group>

      <group ref={fireFlameRef} position={[0, 0.10, 0]}>
        <group position={[0, 0, 0]}>
          <mesh material={mats.fireOrange} position={[0, 0.22, 0]}>
            <coneGeometry args={[0.16, 0.54, 6]} />
          </mesh>
          <mesh material={mats.fireYellow} position={[0, 0.18, 0]}>
            <coneGeometry args={[0.11, 0.42, 5]} />
          </mesh>
          <mesh material={mats.fireCore} position={[0, 0.12, 0]}>
            <coneGeometry args={[0.06, 0.26, 4]} />
          </mesh>
        </group>

        <group position={[-0.08, 0, 0.06]} rotation={[0.15, 0.4, -0.15]}>
          <mesh material={mats.fireOrange} position={[0, 0.16, 0]}>
            <coneGeometry args={[0.10, 0.40, 5]} />
          </mesh>
          <mesh material={mats.fireYellow} position={[0, 0.13, 0]}>
            <coneGeometry args={[0.07, 0.30, 4]} />
          </mesh>
        </group>

        <group position={[0.08, 0, 0.05]} rotation={[-0.2, -0.5, 0.15]}>
          <mesh material={mats.fireOrange} position={[0, 0.15, 0]}>
            <coneGeometry args={[0.09, 0.38, 5]} />
          </mesh>
          <mesh material={mats.fireYellow} position={[0, 0.12, 0]}>
            <coneGeometry args={[0.06, 0.28, 4]} />
          </mesh>
        </group>

        <group position={[-0.01, 0, -0.08]} rotation={[-0.15, 0.3, 0.1]}>
          <mesh material={mats.fireOrange} position={[0, 0.17, 0]}>
            <coneGeometry args={[0.10, 0.42, 5]} />
          </mesh>
          <mesh material={mats.fireYellow} position={[0, 0.14, 0]}>
            <coneGeometry args={[0.07, 0.32, 4]} />
          </mesh>
        </group>
      </group>

      <group ref={fireSparksRef} position={[0, 0.15, 0]}>
        {[0, 1, 2, 3, 4, 5].map((si) => (
          <mesh key={`spark-${si}`} material={si % 2 === 0 ? mats.fireYellow : mats.fireOrange}>
            <dodecahedronGeometry args={[1, 0]} />
          </mesh>
        ))}
      </group>

      <pointLight ref={fireLightRef} color="#f59e0b" intensity={2.8} distance={8} decay={2} position={[0, 0.55, 0]} />
    </group>
  );
}
