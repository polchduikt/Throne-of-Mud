import type { RefObject } from 'react';
import type * as THREE from 'three';
import { SHARED_BUILDING_MATS } from '../buildingMaterials';
import { TriangularGable } from '../common/BuildingPrimitives';

export function StonecutterModel({
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
        <boxGeometry args={[4.92, 0.10, 2.92]} />
      </mesh>
      <mesh material={mats.floorPlanks} position={[0, 0.11, 0]} receiveShadow>
        <boxGeometry args={[4.76, 0.04, 2.76]} />
      </mesh>

      <group position={[-1.35, 0.11, -0.15]}>

        <mesh material={mats.stoneDark} position={[0, 0.28, 0]} castShadow receiveShadow>
          <boxGeometry args={[1.55, 0.52, 0.85]} />
        </mesh>
        <mesh material={mats.timberPlanks} position={[0, 0.56, 0]} castShadow receiveShadow>
          <boxGeometry args={[1.62, 0.04, 0.92]} />
        </mesh>

        <mesh material={mats.stoneLight} position={[-0.35, 0.74, 0]} castShadow>
          <cylinderGeometry args={[0.20, 0.22, 0.32, 12]} />
        </mesh>
        <mesh material={mats.gothicTrim} position={[-0.35, 0.92, 0]} castShadow>
          <boxGeometry args={[0.44, 0.05, 0.44]} />
        </mesh>

        <mesh material={mats.timberDark} position={[0.38, 0.62, 0.15]} rotation={[0, 0.35, 0]} castShadow>
          <boxGeometry args={[0.08, 0.08, 0.20]} />
        </mesh>
        <mesh material={mats.timberLight} position={[0.38, 0.62, 0.27]} rotation={[0, 0.35, 0]} castShadow>
          <cylinderGeometry args={[0.016, 0.016, 0.20, 5]} />
        </mesh>
        <mesh material={mats.ironSteel} position={[0.35, 0.60, -0.18]} rotation={[0, -0.25, 0]} castShadow>
          <boxGeometry args={[0.04, 0.03, 0.24]} />
        </mesh>
      </group>

      <group position={[0, 0.11, 0.35]}>

        <mesh material={mats.timberDark} position={[0, 0.22, 0]} castShadow receiveShadow>
          <cylinderGeometry args={[0.35, 0.40, 0.44, 8]} />
        </mesh>

        <mesh material={mats.stoneLight} position={[0, 0.55, 0]} castShadow>
          <dodecahedronGeometry args={[0.22, 0]} />
        </mesh>
        <mesh material={mats.stoneDark} position={[0, 0.72, 0]} castShadow>
          <coneGeometry args={[0.12, 0.20, 5]} />
        </mesh>
      </group>

      <group position={[1.45, 0.11, 0]}>

        <mesh material={mats.stoneLight} position={[-0.38, 0.18, -0.25]} castShadow receiveShadow>
          <boxGeometry args={[0.60, 0.34, 0.55]} />
        </mesh>
        <mesh material={mats.stoneLight} position={[0.38, 0.18, -0.25]} castShadow receiveShadow>
          <boxGeometry args={[0.60, 0.34, 0.55]} />
        </mesh>

        <mesh material={mats.stoneLight} position={[0, 0.48, -0.25]} castShadow receiveShadow>
          <boxGeometry args={[0.60, 0.28, 0.55]} />
        </mesh>

        <mesh material={mats.stoneLight} position={[-0.15, 0.10, 0.55]} castShadow receiveShadow>
          <boxGeometry args={[0.72, 0.16, 0.55]} />
        </mesh>
        <mesh material={mats.stoneLight} position={[-0.15, 0.21, 0.55]} castShadow receiveShadow>
          <boxGeometry args={[0.65, 0.06, 0.48]} />
        </mesh>

        <mesh material={mats.stoneLight} position={[0.55, 0.05, 0.55]}>
          <coneGeometry args={[0.28, 0.10, 8]} />
        </mesh>
      </group>

      {[
        [-2.25, -1.30],
        [0, -1.30],
        [2.25, -1.30],
        [-2.25, 1.30],
        [0, 1.30],
        [2.25, 1.30],
      ].map(([px, pz], idx) => (
        <group key={`sc-post-${idx}`} position={[px, 0, pz]}>
          <mesh material={mats.timberDark} position={[0, 0.95, 0]} castShadow>
            <boxGeometry args={[0.14, 1.70, 0.14]} />
          </mesh>
        </group>
      ))}

      <group ref={roofRef}>

        <mesh material={mats.timberDark} position={[0, 1.80, -1.30]} castShadow>
          <boxGeometry args={[4.70, 0.12, 0.14]} />
        </mesh>
        <mesh material={mats.timberDark} position={[0, 1.80, 1.30]} castShadow>
          <boxGeometry args={[4.70, 0.12, 0.14]} />
        </mesh>
        <mesh material={mats.timberDark} position={[-2.25, 1.80, 0]} castShadow>
          <boxGeometry args={[0.14, 0.12, 2.70]} />
        </mesh>
        <mesh material={mats.timberDark} position={[2.25, 1.80, 0]} castShadow>
          <boxGeometry args={[0.14, 0.12, 2.70]} />
        </mesh>

        <TriangularGable
          baseWidth={2.70}
          height={0.95}
          thickness={0.14}
          position={[-2.25, 1.85, 0]}
          rotation={[0, Math.PI / 2, 0]}
          material={mats.timberPlanks}
        />
        <TriangularGable
          baseWidth={2.70}
          height={0.95}
          thickness={0.14}
          position={[2.25, 1.85, 0]}
          rotation={[0, -Math.PI / 2, 0]}
          material={mats.timberPlanks}
        />

        <mesh
          material={mats.shingleRoof}
          position={[0, 2.26, -0.72]}
          rotation={[-0.65, 0, 0]}
          castShadow
          receiveShadow
        >
          <boxGeometry args={[4.96, 0.09, 1.75]} />
        </mesh>
        <mesh
          material={mats.shingleRoof}
          position={[0, 2.26, 0.72]}
          rotation={[0.65, 0, 0]}
          castShadow
          receiveShadow
        >
          <boxGeometry args={[4.96, 0.09, 1.75]} />
        </mesh>
        <mesh material={mats.timberDark} position={[0, 2.76, 0]} castShadow>
          <boxGeometry args={[5.02, 0.12, 0.16]} />
        </mesh>
      </group>
    </group>
  );
}

