import type { RefObject } from 'react';
import type * as THREE from 'three';
import { SHARED_BUILDING_MATS } from '../buildingMaterials';

export function ClayPitModel({
  isLightOn = false,
  roofRef,
}: {
  isLightOn?: boolean;
  roofRef?: RefObject<THREE.Group | null>;
}) {
  const mats = SHARED_BUILDING_MATS;
  void isLightOn;

  return (
    <group>

      <mesh material={mats.richSoil} position={[0, 0.04, 0]} receiveShadow>
        <boxGeometry args={[3.92, 0.08, 2.92]} />
      </mesh>

      <group position={[-0.55, 0.08, -0.40]}>

        <mesh material={mats.clayOrange} position={[0, 0.16, 0]} castShadow receiveShadow>
          <boxGeometry args={[2.40, 0.24, 1.80]} />
        </mesh>

        <mesh material={mats.clayOrange} position={[-0.25, 0.32, -0.20]} castShadow receiveShadow>
          <boxGeometry args={[1.70, 0.22, 1.20]} />
        </mesh>

        <mesh material={mats.timberLogs} position={[1.18, 0.22, 0]} rotation={[0, 0, 0.08]} castShadow>
          <boxGeometry args={[0.12, 0.45, 1.76]} />
        </mesh>
        <mesh material={mats.timberLogs} position={[-0.05, 0.22, 0.88]} rotation={[0.08, 0, 0]} castShadow>
          <boxGeometry args={[2.36, 0.45, 0.12]} />
        </mesh>

        {[-1.15, 0.10, 1.15].map((x, i) => (
          <mesh key={`shoring-post-${i}`} material={mats.timberDark} position={[x, 0.28, 0.88]} castShadow>
            <boxGeometry args={[0.12, 0.60, 0.12]} />
          </mesh>
        ))}
      </group>

      <group position={[1.05, 0.08, 0.65]}>

        <mesh material={mats.timberDark} position={[0, 0.14, 0]} castShadow receiveShadow>
          <boxGeometry args={[0.95, 0.28, 0.55]} />
        </mesh>

        <mesh material={mats.clayOrange} position={[0, 0.24, 0]} castShadow>
          <boxGeometry args={[0.85, 0.08, 0.45]} />
        </mesh>

        <group position={[0.35, 0.25, -0.05]} rotation={[0.25, 0.20, -0.25]}>
          <mesh material={mats.timberDark} position={[0, 0.25, 0]} castShadow>
            <cylinderGeometry args={[0.015, 0.015, 0.65, 5]} />
          </mesh>
          <mesh material={mats.ironSteel} position={[0, -0.08, 0]} castShadow>
            <boxGeometry args={[0.12, 0.18, 0.02]} />
          </mesh>
        </group>

        <mesh material={mats.barrelWood} position={[-0.38, 0.12, 0.38]} castShadow>
          <cylinderGeometry args={[0.10, 0.08, 0.22, 8]} />
        </mesh>
      </group>

      <group position={[-1.10, 0.08, 0.70]}>
        <mesh material={mats.clayOrange} position={[0, 0.14, 0]} castShadow>
          <sphereGeometry args={[0.28, 8, 8]} />
        </mesh>
        <mesh material={mats.clayOrange} position={[0.26, 0.09, 0.12]} castShadow>
          <sphereGeometry args={[0.20, 8, 8]} />
        </mesh>
        <mesh material={mats.clayOrange} position={[-0.22, 0.10, -0.10]} castShadow>
          <sphereGeometry args={[0.18, 8, 8]} />
        </mesh>
      </group>

      <group ref={roofRef} position={[1.05, 0.08, -0.65]}>

        <mesh material={mats.timberDark} position={[-0.45, 0.60, -0.35]} castShadow>
          <boxGeometry args={[0.08, 1.20, 0.08]} />
        </mesh>
        <mesh material={mats.timberDark} position={[0.45, 0.60, -0.35]} castShadow>
          <boxGeometry args={[0.08, 1.20, 0.08]} />
        </mesh>
        <mesh material={mats.timberDark} position={[-0.45, 0.45, 0.35]} castShadow>
          <boxGeometry args={[0.08, 0.90, 0.08]} />
        </mesh>
        <mesh material={mats.timberDark} position={[0.45, 0.45, 0.35]} castShadow>
          <boxGeometry args={[0.08, 0.90, 0.08]} />
        </mesh>

        <mesh material={mats.barrelWood} position={[0.15, 0.22, 0]} castShadow>
          <cylinderGeometry args={[0.20, 0.17, 0.42, 8]} />
        </mesh>

        <mesh
          material={mats.thatchRoof}
          position={[0, 1.15, 0]}
          rotation={[0.28, 0, 0]}
          castShadow
          receiveShadow
        >
          <boxGeometry args={[1.25, 0.08, 0.95]} />
        </mesh>
      </group>
    </group>
  );
}

