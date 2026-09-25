import { useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import type * as THREE from 'three';
import { SHARED_BUILDING_MATS } from '../buildingMaterials';
import { MedievalDoor, MedievalWindow, TimberBarrel } from '../common/BuildingPrimitives';

export function WindmillModel({
  isLightOn = false,
}: {
  isLightOn?: boolean;
}) {
  const mats = SHARED_BUILDING_MATS;
  const windmillSailsRef = useRef<THREE.Group>(null);

  useFrame(({ clock }) => {
    if (windmillSailsRef.current) {
      windmillSailsRef.current.rotation.z = clock.getElapsedTime() * 0.8;
    }
  });

  return (
    <group>
      <mesh material={mats.stoneMed} position={[0, 0.35, 0]} castShadow receiveShadow>
        <cylinderGeometry args={[1.15, 1.35, 0.7, 8]} />
      </mesh>
      <mesh material={mats.timberLogs} position={[0, 1.45, 0]} castShadow receiveShadow>
        <cylinderGeometry args={[0.9, 1.15, 1.8, 8]} />
      </mesh>

      <group position={[0, 0, -0.92]} rotation={[0, Math.PI, 0]}>
        <mesh material={mats.stoneMed} position={[0, 0.04, 0.18]} receiveShadow>
          <boxGeometry args={[0.88, 0.08, 0.55]} />
        </mesh>
        <mesh material={mats.timberLogs} position={[-0.4, 0.45, 0.18]} castShadow receiveShadow>
          <boxGeometry args={[0.08, 0.9, 0.55]} />
        </mesh>
        <mesh material={mats.timberLogs} position={[0.4, 0.45, 0.18]} castShadow receiveShadow>
          <boxGeometry args={[0.08, 0.9, 0.55]} />
        </mesh>
        <mesh material={mats.timberLogs} position={[0, 0.92, 0.18]} castShadow receiveShadow>
          <boxGeometry args={[0.88, 0.08, 0.55]} />
        </mesh>
        <mesh material={mats.thatchRoof} position={[0, 1.02, 0.18]} rotation={[0.2, 0, 0]} castShadow>
          <boxGeometry args={[0.94, 0.06, 0.62]} />
        </mesh>
        <MedievalDoor position={[0, 0.08, 0.45]} width={0.62} height={0.88} hasCanopy={false} />
      </group>

      <MedievalWindow position={[0, 1.5, 0.95]} width={0.4} height={0.4} isLightOn={isLightOn} hasFlowerBox={false} />

      <group position={[-1.1, 0, -0.8]}>
        <mesh material={mats.flourSack} position={[0, 0.14, 0]} rotation={[0.2, 0.3, 0]} castShadow>
          <sphereGeometry args={[0.18, 7, 7]} />
        </mesh>
        <TimberBarrel position={[0.3, 0, -0.2]} scale={0.8} />
      </group>

      <mesh material={mats.thatchRoof} position={[0, 2.75, 0]} castShadow receiveShadow>
        <coneGeometry args={[1.25, 1.1, 8]} />
      </mesh>
      <mesh material={mats.thatchRidge} position={[0, 3.25, 0]} castShadow>
        <coneGeometry args={[0.3, 0.3, 8]} />
      </mesh>

      <group ref={windmillSailsRef} position={[0, 2.15, 1.24]}>
        <mesh material={mats.timberDark} rotation={[Math.PI / 2, 0, 0]}>
          <cylinderGeometry args={[0.14, 0.14, 0.18, 6]} />
        </mesh>
        {[0, 1, 2, 3].map((bi) => (
          <group key={`b-${bi}`} rotation={[0, 0, (bi * Math.PI) / 2]}>
            <mesh material={mats.timberDark} position={[0, 0.9, 0]} castShadow>
              <boxGeometry args={[0.07, 1.8, 0.04]} />
            </mesh>
            <mesh material={mats.awningWhite} position={[0.18, 0.9, 0.01]} castShadow>
              <boxGeometry args={[0.32, 1.4, 0.01]} />
            </mesh>
          </group>
        ))}
      </group>
    </group>
  );
}
