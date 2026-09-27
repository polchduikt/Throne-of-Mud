import type { RefObject } from 'react';
import type * as THREE from 'three';
import { SHARED_BUILDING_MATS } from '../buildingMaterials';
import { ChimneySmoke } from '../common/BuildingPrimitives';

export function CharcoalKilnModel({
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

      <mesh material={mats.richSoil} position={[0, 0.03, 0]} receiveShadow>
        <boxGeometry args={[4.85, 0.06, 2.85]} />
      </mesh>

      <mesh material={mats.ashBed} position={[-1.15, 0.065, 0]} receiveShadow>
        <cylinderGeometry args={[1.35, 1.45, 0.02, 16]} />
      </mesh>

      <group position={[-1.15, 0.08, 0]}>

        <mesh material={mats.stoneMed} position={[0, 0.1, 0]} castShadow receiveShadow>
          <torusGeometry args={[1.22, 0.11, 8, 20]} />
        </mesh>
        <mesh material={mats.stoneDark} position={[0, 0.06, 0]} castShadow receiveShadow>
          <cylinderGeometry args={[1.32, 1.35, 0.1, 16]} />
        </mesh>

        <mesh material={mats.soilFurrow} position={[0, 0.52, 0]} castShadow receiveShadow>
          <cylinderGeometry args={[0.55, 1.25, 0.92, 16]} />
        </mesh>

        <mesh material={mats.richSoil} position={[0, 0.98, 0]} castShadow>
          <sphereGeometry args={[0.58, 14, 10, 0, Math.PI * 2, 0, Math.PI / 2]} />
        </mesh>

        <mesh material={mats.mossGreen} position={[0.42, 0.62, 0.35]} rotation={[0.4, 0.2, 0]}>
          <boxGeometry args={[0.45, 0.04, 0.40]} />
        </mesh>
        <mesh material={mats.mossGreen} position={[-0.35, 0.68, -0.42]} rotation={[-0.3, 0.2, 0]}>
          <boxGeometry args={[0.40, 0.04, 0.38]} />
        </mesh>
        <mesh material={mats.mossGreen} position={[-0.45, 0.45, 0.38]} rotation={[0.5, -0.3, 0]}>
          <boxGeometry args={[0.35, 0.04, 0.32]} />
        </mesh>

        <mesh material={mats.clayOrange} position={[0, 1.22, 0]} castShadow>
          <cylinderGeometry args={[0.18, 0.22, 0.32, 10]} />
        </mesh>

        <mesh material={mats.stoneDark} position={[0, 1.38, 0]} castShadow>
          <cylinderGeometry args={[0.22, 0.22, 0.04, 10]} />
        </mesh>

        <mesh material={mats.charcoalBlack} position={[0, 1.39, 0]}>
          <cylinderGeometry args={[0.14, 0.14, 0.02, 12]} />
        </mesh>

        <ChimneySmoke position={[0, 1.45, 0]} />

        {[0, Math.PI / 3, (2 * Math.PI) / 3, Math.PI, (4 * Math.PI) / 3, (5 * Math.PI) / 3].map((angle, i) => {
          const vx = Math.cos(angle) * 1.12;
          const vz = Math.sin(angle) * 1.12;
          return (
            <group key={`char-vent-${i}`} position={[vx, 0.12, vz]}>
              <mesh material={mats.stoneLight} rotation={[0, -angle, 0]} castShadow>
                <boxGeometry args={[0.22, 0.14, 0.12]} />
              </mesh>

              <mesh material={mats.fireOrange} position={[0, 0, 0.03]} rotation={[0, -angle, 0]}>
                <boxGeometry args={[0.13, 0.08, 0.06]} />
              </mesh>
            </group>
          );
        })}
        <pointLight color="#ea580c" intensity={1.8} distance={4.5} position={[0, 0.35, 0]} />
      </group>

      <group position={[0.35, 0.08, -0.75]}>

        <mesh material={mats.timberDark} position={[-0.55, 0.35, 0]} castShadow>
          <boxGeometry args={[0.08, 0.70, 0.75]} />
        </mesh>
        <mesh material={mats.timberDark} position={[0.55, 0.35, 0]} castShadow>
          <boxGeometry args={[0.08, 0.70, 0.75]} />
        </mesh>
        <mesh material={mats.timberPlanks} position={[0, 0.04, 0]} castShadow>
          <boxGeometry args={[1.15, 0.08, 0.75]} />
        </mesh>

        {[-0.38, -0.19, 0.0, 0.19, 0.38].map((x, i) => (
          <mesh key={`cord-t1-${i}`} material={mats.timberLogs} position={[x, 0.14, 0]} rotation={[0, 0, Math.PI / 2]} castShadow>
            <cylinderGeometry args={[0.075, 0.075, 0.70, 6]} />
          </mesh>
        ))}

        {[-0.28, -0.09, 0.09, 0.28].map((x, i) => (
          <mesh key={`cord-t2-${i}`} material={mats.timberLogs} position={[x, 0.28, 0]} rotation={[0, 0, Math.PI / 2]} castShadow>
            <cylinderGeometry args={[0.07, 0.07, 0.68, 6]} />
          </mesh>
        ))}

        {[-0.19, 0.0, 0.19].map((x, i) => (
          <mesh key={`cord-t3-${i}`} material={mats.timberLogs} position={[x, 0.41, 0]} rotation={[0, 0, Math.PI / 2]} castShadow>
            <cylinderGeometry args={[0.065, 0.065, 0.66, 6]} />
          </mesh>
        ))}

        {[-0.09, 0.09].map((x, i) => (
          <mesh key={`cord-t4-${i}`} material={mats.timberLogs} position={[x, 0.53, 0]} rotation={[0, 0, Math.PI / 2]} castShadow>
            <cylinderGeometry args={[0.06, 0.06, 0.64, 6]} />
          </mesh>
        ))}
      </group>

      <group position={[0.35, 0.08, 0.25]}>

        <mesh material={mats.timberLogs} position={[0, 0.18, 0]} castShadow receiveShadow>
          <cylinderGeometry args={[0.25, 0.28, 0.36, 8]} />
        </mesh>

        <mesh material={mats.timberLight} position={[0.05, 0.46, 0]} rotation={[0.2, 0, -0.35]} castShadow>
          <cylinderGeometry args={[0.016, 0.016, 0.55, 5]} />
        </mesh>
        <mesh material={mats.ironSteel} position={[0.18, 0.37, 0]} rotation={[0.2, 0, -0.35]} castShadow>
          <boxGeometry args={[0.09, 0.15, 0.03]} />
        </mesh>

        <mesh material={mats.timberPlanks} position={[-0.32, 0.06, 0.18]} rotation={[0, 0.6, 0]} castShadow>
          <cylinderGeometry args={[0.06, 0.06, 0.35, 5]} />
        </mesh>
        <mesh material={mats.timberPlanks} position={[-0.36, 0.06, -0.15]} rotation={[0, -0.4, 0]} castShadow>
          <cylinderGeometry args={[0.05, 0.05, 0.32, 5]} />
        </mesh>
      </group>

      <group position={[-0.15, 0.08, 0.95]} rotation={[0.2, -0.3, 0.1]}>

        <mesh material={mats.timberDark} position={[0, 0.35, 0]} castShadow>
          <boxGeometry args={[0.45, 0.70, 0.08]} />
        </mesh>

        <mesh material={mats.timberLight} position={[-0.12, 0.45, 0.06]} castShadow>
          <cylinderGeometry args={[0.014, 0.014, 0.92, 5]} />
        </mesh>
        <mesh material={mats.ironSteel} position={[-0.12, 0.91, 0.06]} castShadow>
          <boxGeometry args={[0.22, 0.06, 0.04]} />
        </mesh>

        <mesh material={mats.timberLight} position={[0.12, 0.42, 0.06]} castShadow>
          <cylinderGeometry args={[0.014, 0.014, 0.88, 5]} />
        </mesh>
        <mesh material={mats.ironSteel} position={[0.12, 0.86, 0.06]} castShadow>
          <boxGeometry args={[0.16, 0.20, 0.03]} />
        </mesh>
      </group>

      <group position={[-0.75, 0.08, 0.95]}>

        <mesh material={mats.timberPlanks} position={[-0.20, 0.14, 0]} castShadow>
          <cylinderGeometry args={[0.18, 0.14, 0.28, 8]} />
        </mesh>
        <mesh material={mats.charcoalBlack} position={[-0.20, 0.28, 0]} castShadow>
          <dodecahedronGeometry args={[0.16, 0]} />
        </mesh>

        <mesh material={mats.charcoalBlack} position={[0.16, 0.07, 0]} castShadow>
          <dodecahedronGeometry args={[0.14, 0]} />
        </mesh>
        <mesh material={mats.charcoalBlack} position={[0.32, 0.06, 0.12]} castShadow>
          <dodecahedronGeometry args={[0.10, 0]} />
        </mesh>
      </group>

      <group position={[1.65, 0.08, -0.45]}>

        <mesh material={mats.timberDark} position={[-0.65, 0.70, -0.65]} castShadow>
          <boxGeometry args={[0.09, 1.40, 0.09]} />
        </mesh>
        <mesh material={mats.timberDark} position={[0.65, 0.70, -0.65]} castShadow>
          <boxGeometry args={[0.09, 1.40, 0.09]} />
        </mesh>
        <mesh material={mats.timberDark} position={[-0.65, 0.55, 0.65]} castShadow>
          <boxGeometry args={[0.09, 1.10, 0.09]} />
        </mesh>
        <mesh material={mats.timberDark} position={[0.65, 0.55, 0.65]} castShadow>
          <boxGeometry args={[0.09, 1.10, 0.09]} />
        </mesh>

        <mesh material={mats.timberPlanks} position={[0, 0.32, -0.25]} castShadow receiveShadow>
          <boxGeometry args={[0.85, 0.06, 0.45]} />
        </mesh>
        <mesh material={mats.flourSack} position={[-0.32, 0.18, 0.25]} castShadow>
          <sphereGeometry args={[0.19, 6, 6]} />
        </mesh>
        <mesh material={mats.flourSack} position={[-0.32, 0.44, 0.25]} castShadow>
          <sphereGeometry args={[0.17, 6, 6]} />
        </mesh>
        <mesh material={mats.flourSack} position={[0.32, 0.18, 0.25]} castShadow>
          <sphereGeometry args={[0.18, 6, 6]} />
        </mesh>

        <mesh material={mats.charcoalBlack} position={[0, 0.38, -0.25]} castShadow>
          <dodecahedronGeometry args={[0.08, 0]} />
        </mesh>

        <group ref={roofRef}>

          <mesh material={mats.timberDark} position={[0, 1.38, -0.65]} castShadow>
            <boxGeometry args={[1.45, 0.08, 0.08]} />
          </mesh>
          <mesh material={mats.timberDark} position={[0, 1.08, 0.65]} castShadow>
            <boxGeometry args={[1.45, 0.08, 0.08]} />
          </mesh>

          <mesh
            material={mats.thatchRoof}
            position={[0, 1.26, 0]}
            rotation={[0.23, 0, 0]}
            castShadow
            receiveShadow
          >
            <boxGeometry args={[1.55, 0.08, 1.55]} />
          </mesh>
        </group>
      </group>

      <group position={[1.45, 0.08, 0.85]} rotation={[0, -0.2, 0]}>

        <mesh material={mats.timberPlanks} position={[0, 0.22, 0]} castShadow receiveShadow>
          <boxGeometry args={[0.95, 0.04, 0.60]} />
        </mesh>

        <mesh material={mats.timberDark} position={[0, 0.34, -0.29]} castShadow>
          <boxGeometry args={[0.95, 0.20, 0.03]} />
        </mesh>
        <mesh material={mats.timberDark} position={[0, 0.34, 0.29]} castShadow>
          <boxGeometry args={[0.95, 0.20, 0.03]} />
        </mesh>
        <mesh material={mats.timberDark} position={[-0.46, 0.34, 0]} castShadow>
          <boxGeometry args={[0.03, 0.20, 0.58]} />
        </mesh>

        <mesh material={mats.timberDark} position={[0.62, 0.26, -0.20]} rotation={[0, 0, -0.15]} castShadow>
          <cylinderGeometry args={[0.02, 0.02, 0.70, 5]} />
        </mesh>
        <mesh material={mats.timberDark} position={[0.62, 0.26, 0.20]} rotation={[0, 0, -0.15]} castShadow>
          <cylinderGeometry args={[0.02, 0.02, 0.70, 5]} />
        </mesh>

        <mesh material={mats.timberDark} position={[0, 0.16, -0.34]} rotation={[Math.PI / 2, 0, 0]} castShadow>
          <cylinderGeometry args={[0.16, 0.16, 0.04, 8]} />
        </mesh>
        <mesh material={mats.timberDark} position={[0, 0.16, 0.34]} rotation={[Math.PI / 2, 0, 0]} castShadow>
          <cylinderGeometry args={[0.16, 0.16, 0.04, 8]} />
        </mesh>

        <mesh material={mats.flourSack} position={[-0.18, 0.34, 0]} castShadow>
          <sphereGeometry args={[0.18, 6, 6]} />
        </mesh>
        <mesh material={mats.flourSack} position={[0.16, 0.32, 0.05]} castShadow>
          <sphereGeometry args={[0.16, 6, 6]} />
        </mesh>

        <mesh material={mats.charcoalBlack} position={[-0.02, 0.36, -0.12]} castShadow>
          <dodecahedronGeometry args={[0.09, 0]} />
        </mesh>
      </group>
    </group>
  );
}

