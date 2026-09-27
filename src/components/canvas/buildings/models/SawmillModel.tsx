import type { RefObject } from 'react';
import type * as THREE from 'three';
import { SHARED_BUILDING_MATS } from '../buildingMaterials';

export function SawmillModel({
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

      <group position={[-1.0, 0.11, 0]}>

        <mesh material={mats.timberDark} position={[-0.85, 0.65, 0]} castShadow>
          <boxGeometry args={[0.16, 1.20, 0.85]} />
        </mesh>
        <mesh material={mats.timberDark} position={[0.85, 0.65, 0]} castShadow>
          <boxGeometry args={[0.16, 1.20, 0.85]} />
        </mesh>

        <mesh material={mats.timberDark} position={[0, 1.25, 0]} castShadow>
          <boxGeometry args={[1.86, 0.12, 0.20]} />
        </mesh>

        <mesh material={mats.timberLogs} position={[0, 0.70, 0]} rotation={[0, 0, Math.PI / 2]} castShadow>
          <cylinderGeometry args={[0.22, 0.24, 2.10, 12]} />
        </mesh>

        <mesh material={mats.sawBlade} position={[0, 0.60, 0]} castShadow>
          <boxGeometry args={[0.04, 1.25, 0.18]} />
        </mesh>

        <mesh material={mats.timberDark} position={[0, 1.22, 0]} castShadow>
          <boxGeometry args={[0.08, 0.08, 0.45]} />
        </mesh>
        <mesh material={mats.timberDark} position={[0, -0.01, 0]} castShadow>
          <boxGeometry args={[0.08, 0.08, 0.45]} />
        </mesh>

        <mesh material={mats.woodShavings} position={[0, 0.10, 0]}>
          <coneGeometry args={[0.55, 0.20, 10]} />
        </mesh>
      </group>

      <group position={[1.35, 0.11, -0.65]}>

        <mesh material={mats.timberPlanks} position={[0, 0.08, 0]} castShadow receiveShadow>
          <boxGeometry args={[1.50, 0.12, 0.75]} />
        </mesh>

        <mesh material={mats.timberDark} position={[-0.55, 0.15, 0]} castShadow>
          <boxGeometry args={[0.04, 0.03, 0.72]} />
        </mesh>
        <mesh material={mats.timberDark} position={[0.55, 0.15, 0]} castShadow>
          <boxGeometry args={[0.04, 0.03, 0.72]} />
        </mesh>

        <mesh material={mats.timberPlanks} position={[0, 0.22, 0]} castShadow receiveShadow>
          <boxGeometry args={[1.45, 0.12, 0.70]} />
        </mesh>

        <mesh material={mats.timberPlanks} position={[0, 0.35, 0]} castShadow receiveShadow>
          <boxGeometry args={[1.40, 0.12, 0.65]} />
        </mesh>
      </group>

      <group position={[1.35, 0.11, 0.65]}>
        <mesh material={mats.timberLogs} position={[0, 0.12, -0.22]} rotation={[0, 0, Math.PI / 2]} castShadow>
          <cylinderGeometry args={[0.13, 0.13, 1.45, 8]} />
        </mesh>
        <mesh material={mats.timberLogs} position={[0, 0.12, 0.22]} rotation={[0, 0, Math.PI / 2]} castShadow>
          <cylinderGeometry args={[0.14, 0.14, 1.45, 8]} />
        </mesh>
        <mesh material={mats.timberLogs} position={[0, 0.34, 0]} rotation={[0, 0, Math.PI / 2]} castShadow>
          <cylinderGeometry args={[0.13, 0.13, 1.35, 8]} />
        </mesh>

        <group position={[-0.60, 0.22, 0]} rotation={[0, 0, 0.35]}>
          <mesh material={mats.timberLight} position={[0, 0.25, 0]} castShadow>
            <cylinderGeometry args={[0.015, 0.015, 0.55, 5]} />
          </mesh>
          <mesh material={mats.axeBlade} position={[0, 0.50, 0]} rotation={[0, 0, 0.2]} castShadow>
            <boxGeometry args={[0.12, 0.10, 0.02]} />
          </mesh>
        </group>
      </group>

      <group ref={roofRef}>

        {[-2.20, -0.70, 0.70, 2.20].map((x, idx) => (
          <group key={`saw-post-${idx}`}>
            <mesh material={mats.timberDark} position={[x, 0.95, 1.25]} castShadow>
              <boxGeometry args={[0.14, 1.70, 0.14]} />
            </mesh>
            <mesh material={mats.timberDark} position={[x, 0.95, -1.25]} castShadow>
              <boxGeometry args={[0.14, 1.70, 0.14]} />
            </mesh>
          </group>
        ))}

        <mesh material={mats.timberDark} position={[0, 1.80, 1.25]} castShadow>
          <boxGeometry args={[4.70, 0.10, 0.14]} />
        </mesh>
        <mesh material={mats.timberDark} position={[0, 1.80, -1.25]} castShadow>
          <boxGeometry args={[4.70, 0.10, 0.14]} />
        </mesh>

        <mesh
          material={mats.thatchRoof}
          position={[0, 2.12, -0.68]}
          rotation={[-0.42, 0, 0]}
          castShadow
          receiveShadow
        >
          <boxGeometry args={[4.98, 0.09, 1.55]} />
        </mesh>
        <mesh
          material={mats.thatchRoof}
          position={[0, 2.12, 0.68]}
          rotation={[0.42, 0, 0]}
          castShadow
          receiveShadow
        >
          <boxGeometry args={[4.98, 0.09, 1.55]} />
        </mesh>
        <mesh material={mats.thatchRidge} position={[0, 2.45, 0]} castShadow>
          <boxGeometry args={[5.02, 0.10, 0.16]} />
        </mesh>
      </group>
    </group>
  );
}

