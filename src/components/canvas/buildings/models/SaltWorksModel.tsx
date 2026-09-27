import type { RefObject } from 'react';
import type * as THREE from 'three';
import { SHARED_BUILDING_MATS } from '../buildingMaterials';
import { ChimneySmoke } from '../common/BuildingPrimitives';

export function SaltWorksModel({
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

      <mesh material={mats.stoneDark} position={[0, 0.05, 0]} castShadow receiveShadow>
        <boxGeometry args={[3.92, 0.10, 2.92]} />
      </mesh>
      <mesh material={mats.stoneMed} position={[0, 0.105, 0]} receiveShadow>
        <boxGeometry args={[3.76, 0.03, 2.76]} />
      </mesh>

      <group position={[-0.95, 0.11, -0.05]}>

        <mesh material={mats.stoneDark} position={[0, 0.35, 0]} castShadow receiveShadow>
          <boxGeometry args={[1.75, 0.60, 2.00]} />
        </mesh>

        <mesh material={mats.charredWood} position={[0, 0.22, 1.01]} castShadow>
          <boxGeometry args={[0.55, 0.40, 0.06]} />
        </mesh>
        <mesh material={mats.fireOrange} position={[0, 0.20, 1.02]}>
          <boxGeometry args={[0.42, 0.30, 0.04]} />
        </mesh>
        <pointLight color="#ea580c" intensity={1.6} distance={3.8} position={[0, 0.30, 1.15]} />

        <mesh material={mats.ironSteel} position={[0, 0.68, 0]} castShadow>
          <boxGeometry args={[1.65, 0.08, 1.90]} />
        </mesh>

        <mesh material={mats.saltWhite} position={[0, 0.72, 0]} castShadow>
          <boxGeometry args={[1.50, 0.03, 1.75]} />
        </mesh>

        <mesh material={mats.stoneMed} position={[-0.60, 1.35, -0.75]} castShadow>
          <boxGeometry args={[0.36, 1.50, 0.36]} />
        </mesh>
        <mesh material={mats.stoneLight} position={[-0.60, 2.12, -0.75]} castShadow>
          <boxGeometry args={[0.42, 0.08, 0.42]} />
        </mesh>
        <mesh material={mats.stoneMed} position={[-0.60, 2.22, -0.75]} castShadow>
          <cylinderGeometry args={[0.11, 0.13, 0.16, 8]} />
        </mesh>
        <mesh material={mats.stoneLight} position={[-0.60, 2.30, -0.75]} castShadow>
          <cylinderGeometry args={[0.13, 0.13, 0.03, 8]} />
        </mesh>

        <mesh material={mats.charcoalBlack} position={[-0.60, 2.29, -0.75]}>
          <cylinderGeometry args={[0.085, 0.085, 0.04, 8]} />
        </mesh>
        <ChimneySmoke position={[-0.60, 2.34, -0.75]} />
      </group>

      <group position={[0.95, 0.11, -0.55]}>
        <mesh material={mats.timberPlanks} position={[0, 0.28, 0]} castShadow receiveShadow>
          <boxGeometry args={[1.35, 0.05, 0.75]} />
        </mesh>
        <mesh material={mats.timberDark} position={[-0.58, 0.14, -0.30]} castShadow>
          <boxGeometry args={[0.05, 0.28, 0.05]} />
        </mesh>
        <mesh material={mats.timberDark} position={[0.58, 0.14, -0.30]} castShadow>
          <boxGeometry args={[0.05, 0.28, 0.05]} />
        </mesh>
        <mesh material={mats.timberDark} position={[-0.58, 0.14, 0.30]} castShadow>
          <boxGeometry args={[0.05, 0.28, 0.05]} />
        </mesh>
        <mesh material={mats.timberDark} position={[0.58, 0.14, 0.30]} castShadow>
          <boxGeometry args={[0.05, 0.28, 0.05]} />
        </mesh>

        <mesh material={mats.saltWhite} position={[-0.40, 0.44, 0]} castShadow>
          <coneGeometry args={[0.22, 0.26, 6]} />
        </mesh>
        <mesh material={mats.saltWhite} position={[0.05, 0.44, 0]} castShadow>
          <coneGeometry args={[0.24, 0.28, 6]} />
        </mesh>
        <mesh material={mats.saltWhite} position={[0.45, 0.42, 0]} castShadow>
          <coneGeometry args={[0.20, 0.24, 6]} />
        </mesh>
      </group>

      <group position={[0.95, 0.11, 0.65]}>

        <mesh material={mats.barrelWood} position={[-0.35, 0.18, 0]} castShadow>
          <cylinderGeometry args={[0.20, 0.17, 0.36, 8]} />
        </mesh>
        <mesh material={mats.saltWhite} position={[-0.35, 0.36, 0]} castShadow>
          <cylinderGeometry args={[0.16, 0.16, 0.04, 8]} />
        </mesh>

        <mesh material={mats.flourSack} position={[0.15, 0.14, -0.10]} castShadow>
          <sphereGeometry args={[0.17, 6, 6]} />
        </mesh>
        <mesh material={mats.flourSack} position={[0.35, 0.12, 0.12]} castShadow>
          <sphereGeometry args={[0.15, 6, 6]} />
        </mesh>
      </group>

      <group position={[-0.05, 0.11, 0.85]} rotation={[0.25, 0, 0.2]}>
        <mesh material={mats.timberLight} position={[0, 0.45, 0]} castShadow>
          <cylinderGeometry args={[0.015, 0.015, 0.95, 5]} />
        </mesh>
        <mesh material={mats.timberDark} position={[0, 0.92, 0]} castShadow>
          <boxGeometry args={[0.28, 0.06, 0.03]} />
        </mesh>
      </group>

      {[
        [0.10, 1.15],
        [1.75, 1.15],
        [0.10, -1.25],
        [1.75, -1.25],
      ].map(([px, pz], idx) => (
        <mesh key={`salt-post-${idx}`} material={mats.timberDark} position={[px, 0.95, pz]} castShadow>
          <boxGeometry args={[0.12, 1.70, 0.12]} />
        </mesh>
      ))}

      <mesh material={mats.timberDark} position={[0.925, 1.80, 1.15]} castShadow>
        <boxGeometry args={[1.75, 0.10, 0.12]} />
      </mesh>
      <mesh material={mats.timberDark} position={[0.925, 1.80, -1.25]} castShadow>
        <boxGeometry args={[1.75, 0.10, 0.12]} />
      </mesh>

      <group ref={roofRef}>

        <mesh
          material={mats.shingleRoof}
          position={[0.925, 2.08, -0.60]}
          rotation={[-0.42, 0, 0]}
          castShadow
          receiveShadow
        >
          <boxGeometry args={[1.85, 0.08, 1.45]} />
        </mesh>
        <mesh
          material={mats.shingleRoof}
          position={[0.925, 2.08, 0.50]}
          rotation={[0.42, 0, 0]}
          castShadow
          receiveShadow
        >
          <boxGeometry args={[1.85, 0.08, 1.45]} />
        </mesh>
        <mesh material={mats.timberDark} position={[0.925, 2.36, -0.05]} castShadow>
          <boxGeometry args={[1.88, 0.10, 0.14]} />
        </mesh>
      </group>
    </group>
  );
}

