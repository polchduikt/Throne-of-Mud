import type { RefObject } from 'react';
import type * as THREE from 'three';
import { SHARED_BUILDING_MATS } from '../buildingMaterials';

export function StoneQuarryModel({
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

      <mesh material={mats.stoneDark} position={[0, 0.04, 0]} receiveShadow>
        <boxGeometry args={[3.92, 0.08, 2.92]} />
      </mesh>

      <group position={[-0.85, 0.08, -0.65]}>

        <mesh material={mats.stoneMed} position={[0, 0.22, 0]} castShadow receiveShadow>
          <boxGeometry args={[1.90, 0.44, 1.40]} />
        </mesh>

        <mesh material={mats.stoneMed} position={[0, 0.60, -0.25]} castShadow receiveShadow>
          <boxGeometry args={[1.70, 0.40, 0.85]} />
        </mesh>

        <mesh material={mats.ironSteel} position={[-0.40, 0.82, -0.20]} rotation={[0.2, 0, 0]} castShadow>
          <boxGeometry args={[0.04, 0.12, 0.04]} />
        </mesh>
        <mesh material={mats.ironSteel} position={[0.40, 0.82, -0.20]} rotation={[0.2, 0, 0]} castShadow>
          <boxGeometry args={[0.04, 0.12, 0.04]} />
        </mesh>
      </group>

      <group position={[1.05, 0.08, -0.45]}>

        <mesh material={mats.timberDark} position={[0, 1.25, 0]} castShadow>
          <boxGeometry args={[0.18, 2.50, 0.18]} />
        </mesh>

        <mesh material={mats.timberDark} position={[-0.28, 0.45, 0]} rotation={[0, 0, 0.58]} castShadow>
          <boxGeometry args={[0.10, 1.15, 0.10]} />
        </mesh>
        <mesh material={mats.timberDark} position={[0.28, 0.45, 0]} rotation={[0, 0, -0.58]} castShadow>
          <boxGeometry args={[0.10, 1.15, 0.10]} />
        </mesh>
        <mesh material={mats.timberDark} position={[0, 0.45, 0.28]} rotation={[-0.58, 0, 0]} castShadow>
          <boxGeometry args={[0.10, 1.15, 0.10]} />
        </mesh>

        <mesh material={mats.timberDark} position={[-0.45, 2.05, 0]} rotation={[0, 0, 0.70]} castShadow>
          <boxGeometry args={[0.14, 1.70, 0.14]} />
        </mesh>

        <mesh material={mats.timberPlanks} position={[0.12, 0.70, 0]} rotation={[0, 0, Math.PI / 2]} castShadow>
          <cylinderGeometry args={[0.12, 0.12, 0.28, 8]} />
        </mesh>
        <mesh material={mats.ironSteel} position={[0.28, 0.70, 0]} castShadow>
          <boxGeometry args={[0.04, 0.22, 0.04]} />
        </mesh>

        <mesh material={mats.ironSteel} position={[-0.95, 2.50, 0]} castShadow>
          <cylinderGeometry args={[0.10, 0.10, 0.05, 10]} />
        </mesh>

        <mesh material={mats.clothWhite} position={[-0.95, 1.75, 0]}>
          <cylinderGeometry args={[0.015, 0.015, 1.45, 6]} />
        </mesh>

        <mesh material={mats.stoneLight} position={[-0.95, 0.85, 0]} castShadow receiveShadow>
          <boxGeometry args={[0.55, 0.45, 0.50]} />
        </mesh>

        <mesh material={mats.clothWhite} position={[-0.95, 0.85, 0]}>
          <boxGeometry args={[0.57, 0.03, 0.52]} />
        </mesh>
      </group>

      <group position={[0.95, 0.08, 0.75]}>
        <mesh material={mats.timberLight} position={[0, 0.02, -0.18]} castShadow>
          <boxGeometry args={[1.10, 0.04, 0.08]} />
        </mesh>
        <mesh material={mats.timberLight} position={[0, 0.02, 0.18]} castShadow>
          <boxGeometry args={[1.10, 0.04, 0.08]} />
        </mesh>

        <mesh material={mats.stoneLight} position={[-0.28, 0.18, 0]} castShadow receiveShadow>
          <boxGeometry args={[0.45, 0.32, 0.45]} />
        </mesh>
        <mesh material={mats.stoneLight} position={[0.28, 0.16, 0]} castShadow receiveShadow>
          <boxGeometry args={[0.42, 0.28, 0.42]} />
        </mesh>
        <mesh material={mats.stoneLight} position={[0.0, 0.44, 0]} castShadow receiveShadow>
          <boxGeometry args={[0.40, 0.24, 0.38]} />
        </mesh>
      </group>

      <group position={[-0.15, 0.08, 0.85]}>
        <mesh material={mats.stoneRaw} position={[0, 0.10, 0]} castShadow>
          <dodecahedronGeometry args={[0.22, 0]} />
        </mesh>
        <mesh material={mats.stoneRaw} position={[0.22, 0.08, 0.10]} castShadow>
          <dodecahedronGeometry args={[0.16, 0]} />
        </mesh>
        <mesh material={mats.stoneRaw} position={[-0.20, 0.07, -0.08]} castShadow>
          <dodecahedronGeometry args={[0.15, 0]} />
        </mesh>
      </group>

      <group ref={roofRef} position={[-1.10, 0.08, 0.55]}>

        <mesh material={mats.timberDark} position={[-0.50, 0.65, -0.32]} castShadow>
          <boxGeometry args={[0.08, 1.30, 0.08]} />
        </mesh>
        <mesh material={mats.timberDark} position={[0.50, 0.65, -0.32]} castShadow>
          <boxGeometry args={[0.08, 1.30, 0.08]} />
        </mesh>
        <mesh material={mats.timberDark} position={[-0.50, 0.50, 0.32]} castShadow>
          <boxGeometry args={[0.08, 1.00, 0.08]} />
        </mesh>
        <mesh material={mats.timberDark} position={[0.50, 0.50, 0.32]} castShadow>
          <boxGeometry args={[0.08, 1.00, 0.08]} />
        </mesh>

        <mesh material={mats.timberPlanks} position={[0, 0.26, 0]} castShadow receiveShadow>
          <boxGeometry args={[0.90, 0.05, 0.45]} />
        </mesh>

        <mesh material={mats.ironSteel} position={[-0.20, 0.32, 0]} rotation={[0, 0.4, 0]} castShadow>
          <boxGeometry args={[0.16, 0.06, 0.06]} />
        </mesh>
        <mesh material={mats.timberLight} position={[-0.12, 0.32, 0]} rotation={[0, 0.4, 0]} castShadow>
          <boxGeometry args={[0.22, 0.03, 0.03]} />
        </mesh>
        <mesh material={mats.ironSteel} position={[0.20, 0.31, 0]} rotation={[0, -0.3, 0]} castShadow>
          <boxGeometry args={[0.18, 0.04, 0.04]} />
        </mesh>

        <mesh
          material={mats.shingleRoof}
          position={[0, 1.25, 0]}
          rotation={[0.24, 0, 0]}
          castShadow
          receiveShadow
        >
          <boxGeometry args={[1.25, 0.07, 0.85]} />
        </mesh>
      </group>
    </group>
  );
}

