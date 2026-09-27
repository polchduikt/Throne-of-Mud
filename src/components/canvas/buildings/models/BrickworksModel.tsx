import type { RefObject } from 'react';
import type * as THREE from 'three';
import { SHARED_BUILDING_MATS } from '../buildingMaterials';
import { ChimneySmoke } from '../common/BuildingPrimitives';

export function BrickworksModel({
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
      <mesh material={mats.richSoil} position={[0, 0.105, 0]} receiveShadow>
        <boxGeometry args={[4.76, 0.03, 2.76]} />
      </mesh>

      <group position={[-1.45, 0.11, -0.10]}>

        <mesh material={mats.stoneDark} position={[0, 0.20, 0]} castShadow receiveShadow>
          <boxGeometry args={[1.68, 0.40, 2.10]} />
        </mesh>

        <mesh material={mats.brickRed} position={[0, 0.75, 0]} castShadow receiveShadow>
          <boxGeometry args={[1.56, 0.75, 2.0]} />
        </mesh>
        <mesh material={mats.brickRed} position={[0, 1.25, 0]} castShadow receiveShadow>
          <cylinderGeometry args={[0.74, 0.78, 0.35, 12]} />
        </mesh>
        <mesh material={mats.stoneDark} position={[0, 1.45, 0]} castShadow>
          <cylinderGeometry args={[0.55, 0.74, 0.15, 12]} />
        </mesh>

        <mesh material={mats.stoneLight} position={[0, 0.45, 1.02]} castShadow>
          <boxGeometry args={[0.72, 0.58, 0.14]} />
        </mesh>
        <mesh material={mats.charredWood} position={[0, 0.38, 1.07]} castShadow>
          <boxGeometry args={[0.52, 0.46, 0.06]} />
        </mesh>

        <mesh material={mats.fireOrange} position={[0, 0.34, 1.08]}>
          <boxGeometry args={[0.42, 0.36, 0.04]} />
        </mesh>
        <mesh material={mats.fireYellow} position={[0, 0.26, 1.09]}>
          <boxGeometry args={[0.28, 0.24, 0.04]} />
        </mesh>
        <pointLight color="#ea580c" intensity={2.2} distance={4.5} position={[0, 0.40, 1.25]} />

        <mesh material={mats.brickRed} position={[0, 1.90, -0.45]} castShadow>
          <boxGeometry args={[0.52, 0.95, 0.52]} />
        </mesh>
        <mesh material={mats.stoneLight} position={[0, 2.40, -0.45]} castShadow>
          <boxGeometry args={[0.60, 0.08, 0.60]} />
        </mesh>
        <mesh material={mats.brickRed} position={[0, 2.52, -0.45]} castShadow>
          <cylinderGeometry args={[0.16, 0.19, 0.20, 8]} />
        </mesh>

        <mesh material={mats.stoneLight} position={[0, 2.63, -0.45]} rotation={[Math.PI / 2, 0, 0]} castShadow>
          <torusGeometry args={[0.15, 0.035, 8, 16]} />
        </mesh>

        <mesh material={mats.charcoalBlack} position={[0, 2.63, -0.45]} rotation={[-Math.PI / 2, 0, 0]}>
          <circleGeometry args={[0.145, 12]} />
        </mesh>
        <ChimneySmoke position={[0, 2.68, -0.45]} />

        <group position={[-0.75, 0, 0.45]} rotation={[0, Math.PI / 2, 0]}>
          <mesh material={mats.timberLogs} position={[0, 0.08, -0.15]} rotation={[0, 0, Math.PI / 2]} castShadow>
            <cylinderGeometry args={[0.07, 0.07, 0.75, 6]} />
          </mesh>
          <mesh material={mats.timberLogs} position={[0, 0.08, 0.15]} rotation={[0, 0, Math.PI / 2]} castShadow>
            <cylinderGeometry args={[0.07, 0.07, 0.75, 6]} />
          </mesh>
          <mesh material={mats.timberLogs} position={[0, 0.20, 0]} rotation={[0, 0, Math.PI / 2]} castShadow>
            <cylinderGeometry args={[0.065, 0.065, 0.72, 6]} />
          </mesh>
        </group>
      </group>

      <group position={[0.0, 0.11, -0.75]}>
        <mesh material={mats.timberDark} position={[0, 0.20, 0]} castShadow receiveShadow>
          <boxGeometry args={[0.85, 0.40, 1.05]} />
        </mesh>
        <mesh material={mats.richSoil} position={[0, 0.35, 0]}>
          <boxGeometry args={[0.72, 0.10, 0.92]} />
        </mesh>

        <mesh material={mats.clayOrange} position={[0.10, 0.42, 0.12]} castShadow>
          <dodecahedronGeometry args={[0.16, 0]} />
        </mesh>
      </group>

      <group position={[0.0, 0.11, 0.65]}>
        <mesh material={mats.timberPlanks} position={[0, 0.32, 0]} castShadow receiveShadow>
          <boxGeometry args={[1.15, 0.05, 0.68]} />
        </mesh>
        <mesh material={mats.timberDark} position={[-0.50, 0.15, -0.26]} castShadow>
          <boxGeometry args={[0.06, 0.30, 0.06]} />
        </mesh>
        <mesh material={mats.timberDark} position={[0.50, 0.15, -0.26]} castShadow>
          <boxGeometry args={[0.06, 0.30, 0.06]} />
        </mesh>
        <mesh material={mats.timberDark} position={[-0.50, 0.15, 0.26]} castShadow>
          <boxGeometry args={[0.06, 0.30, 0.06]} />
        </mesh>
        <mesh material={mats.timberDark} position={[0.50, 0.15, 0.26]} castShadow>
          <boxGeometry args={[0.06, 0.30, 0.06]} />
        </mesh>

        <mesh material={mats.timberDark} position={[-0.24, 0.38, 0]} castShadow>
          <boxGeometry args={[0.36, 0.07, 0.24]} />
        </mesh>
        <mesh material={mats.clayOrange} position={[-0.24, 0.39, 0]}>
          <boxGeometry args={[0.30, 0.06, 0.18]} />
        </mesh>

        <mesh material={mats.clayOrange} position={[0.26, 0.38, 0]} castShadow>
          <boxGeometry args={[0.24, 0.07, 0.14]} />
        </mesh>

        <mesh material={mats.barrelWood} position={[0.46, 0.16, 0.42]} castShadow>
          <cylinderGeometry args={[0.14, 0.11, 0.28, 8]} />
        </mesh>
      </group>

      <group position={[1.45, 0.11, -0.30]}>
        <mesh material={mats.timberDark} position={[-0.60, 0.70, -0.45]} castShadow>
          <boxGeometry args={[0.08, 1.40, 0.08]} />
        </mesh>
        <mesh material={mats.timberDark} position={[0.60, 0.70, -0.45]} castShadow>
          <boxGeometry args={[0.08, 1.40, 0.08]} />
        </mesh>
        <mesh material={mats.timberDark} position={[-0.60, 0.70, 0.45]} castShadow>
          <boxGeometry args={[0.08, 1.40, 0.08]} />
        </mesh>
        <mesh material={mats.timberDark} position={[0.60, 0.70, 0.45]} castShadow>
          <boxGeometry args={[0.08, 1.40, 0.08]} />
        </mesh>

        {[0.32, 0.70, 1.08].map((y, idx) => (
          <group key={`shelf-${idx}`} position={[0, y, 0]}>
            <mesh material={mats.timberPlanks} position={[0, 0, 0]} castShadow>
              <boxGeometry args={[1.32, 0.035, 0.95]} />
            </mesh>
            {[-0.45, -0.22, 0.0, 0.22, 0.45].map((bx, bIdx) => (
              <mesh
                key={`dry-brick-${idx}-${bIdx}`}
                material={idx === 0 ? mats.brickRed : mats.clayOrange}
                position={[bx, 0.06, (bIdx % 2 === 0 ? 0.18 : -0.18)]}
                castShadow
              >
                <boxGeometry args={[0.18, 0.07, 0.13]} />
              </mesh>
            ))}
          </group>
        ))}
      </group>

      <group position={[1.45, 0.11, 0.75]}>
        <mesh material={mats.timberPlanks} position={[0, 0.03, 0]} castShadow>
          <boxGeometry args={[0.95, 0.04, 0.70]} />
        </mesh>

        <mesh material={mats.brickRed} position={[-0.24, 0.10, 0]} castShadow>
          <boxGeometry args={[0.36, 0.09, 0.56]} />
        </mesh>
        <mesh material={mats.brickRed} position={[0.24, 0.10, 0]} castShadow>
          <boxGeometry args={[0.36, 0.09, 0.56]} />
        </mesh>

        <mesh material={mats.brickRed} position={[0, 0.19, 0]} castShadow>
          <boxGeometry args={[0.78, 0.09, 0.52]} />
        </mesh>

        <mesh material={mats.brickRed} position={[0, 0.28, 0]} castShadow>
          <boxGeometry args={[0.56, 0.08, 0.40]} />
        </mesh>
      </group>

      {[
        [-0.45, 1.25],
        [2.25, 1.25],
        [-0.45, -1.30],
        [2.25, -1.30],
      ].map(([px, pz], idx) => (
        <mesh key={`bw-post-${idx}`} material={mats.timberDark} position={[px, 0.95, pz]} castShadow>
          <boxGeometry args={[0.12, 1.70, 0.12]} />
        </mesh>
      ))}

      <mesh material={mats.timberDark} position={[0.90, 1.80, 1.25]} castShadow>
        <boxGeometry args={[2.80, 0.10, 0.12]} />
      </mesh>
      <mesh material={mats.timberDark} position={[0.90, 1.80, -1.30]} castShadow>
        <boxGeometry args={[2.80, 0.10, 0.12]} />
      </mesh>
      <mesh material={mats.timberDark} position={[-0.45, 1.80, -0.025]} castShadow>
        <boxGeometry args={[0.12, 0.10, 2.55]} />
      </mesh>
      <mesh material={mats.timberDark} position={[2.25, 1.80, -0.025]} castShadow>
        <boxGeometry args={[0.12, 0.10, 2.55]} />
      </mesh>

      <group ref={roofRef}>
        <mesh
          material={mats.shingleRoof}
          position={[0.90, 2.12, -0.68]}
          rotation={[-0.45, 0, 0]}
          castShadow
          receiveShadow
        >
          <boxGeometry args={[2.92, 0.09, 1.65]} />
        </mesh>
        <mesh
          material={mats.shingleRoof}
          position={[0.90, 2.12, 0.62]}
          rotation={[0.45, 0, 0]}
          castShadow
          receiveShadow
        >
          <boxGeometry args={[2.92, 0.09, 1.65]} />
        </mesh>
        <mesh material={mats.brickRed} position={[0.90, 2.46, -0.03]} castShadow>
          <boxGeometry args={[2.96, 0.10, 0.16]} />
        </mesh>
      </group>
    </group>
  );
}

