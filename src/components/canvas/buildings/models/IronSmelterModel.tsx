import type { RefObject } from 'react';
import type * as THREE from 'three';
import { SHARED_BUILDING_MATS } from '../buildingMaterials';
import { ChimneySmoke } from '../common/BuildingPrimitives';

export function IronSmelterModel({
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
        <boxGeometry args={[4.85, 0.10, 2.85]} />
      </mesh>
      <mesh material={mats.stoneMed} position={[0, 0.105, 0]} receiveShadow>
        <boxGeometry args={[4.70, 0.03, 2.70]} />
      </mesh>

      <group position={[-1.45, 0.11, 0.0]}>

        <mesh material={mats.stoneDark} position={[0, 0.28, 0]} castShadow receiveShadow>
          <cylinderGeometry args={[0.80, 0.88, 0.56, 12]} />
        </mesh>

        <mesh material={mats.stoneMed} position={[0, 0.85, 0]} castShadow receiveShadow>
          <cylinderGeometry args={[0.64, 0.80, 0.60, 12]} />
        </mesh>

        <mesh material={mats.clayOrange} position={[0, 1.45, 0]} castShadow receiveShadow>
          <cylinderGeometry args={[0.42, 0.64, 0.62, 12]} />
        </mesh>

        <mesh material={mats.stoneLight} position={[0, 1.82, 0]} castShadow>
          <cylinderGeometry args={[0.40, 0.44, 0.14, 12]} />
        </mesh>
        <mesh material={mats.stoneDark} position={[0, 1.92, 0]} castShadow>
          <boxGeometry args={[0.64, 0.06, 0.64]} />
        </mesh>

        <mesh material={mats.stoneLight} position={[0, 1.95, 0]} rotation={[Math.PI / 2, 0, 0]} castShadow>
          <torusGeometry args={[0.22, 0.035, 8, 16]} />
        </mesh>

        <mesh material={mats.charcoalBlack} position={[0, 1.95, 0]} rotation={[-Math.PI / 2, 0, 0]}>
          <circleGeometry args={[0.21, 12]} />
        </mesh>

        <ChimneySmoke position={[0, 2.02, 0]} />

        <mesh material={mats.stoneLight} position={[0, 0.32, 0.74]} castShadow>
          <boxGeometry args={[0.54, 0.48, 0.18]} />
        </mesh>
        <mesh material={mats.charredWood} position={[0, 0.26, 0.80]} castShadow>
          <boxGeometry args={[0.38, 0.36, 0.08]} />
        </mesh>

        <mesh material={mats.moltenIron} position={[0, 0.20, 0.82]}>
          <boxGeometry args={[0.26, 0.24, 0.04]} />
        </mesh>
        <mesh material={mats.moltenIron} position={[0, 0.04, 0.98]} receiveShadow>
          <boxGeometry args={[0.20, 0.04, 0.32]} />
        </mesh>
        <pointLight color="#ea580c" intensity={2.4} distance={4.2} position={[0, 0.35, 1.1]} />

        <group position={[-0.72, 0, 0]} rotation={[0, Math.PI / 2, 0]}>
          <mesh material={mats.bootsLeather} position={[0, 0.24, 0]} rotation={[0.15, 0, 0]} castShadow>
            <boxGeometry args={[0.42, 0.28, 0.68]} />
          </mesh>
          <mesh material={mats.timberDark} position={[0, 0.38, 0]} rotation={[0.15, 0, 0]} castShadow>
            <boxGeometry args={[0.44, 0.04, 0.70]} />
          </mesh>
          <mesh material={mats.timberDark} position={[0, 0.46, 0.26]} rotation={[0.38, 0, 0]} castShadow>
            <boxGeometry args={[0.07, 0.65, 0.07]} />
          </mesh>

          <mesh material={mats.ironSteel} position={[0, 0.18, -0.42]} castShadow>
            <cylinderGeometry args={[0.045, 0.045, 0.22, 8]} />
          </mesh>
        </group>
      </group>

      <group position={[0.40, 0.11, 0.45]}>
        <mesh material={mats.timberDark} position={[0, 0.05, 0]} castShadow receiveShadow>
          <boxGeometry args={[1.05, 0.10, 0.95]} />
        </mesh>
        <mesh material={mats.richSoil} position={[0, 0.08, 0]} receiveShadow>
          <boxGeometry args={[0.95, 0.04, 0.85]} />
        </mesh>

        {[-0.26, 0.0, 0.26].map((x, i) => (
          <group key={`sand-mold-${i}`} position={[x, 0.09, 0]}>
            <mesh material={mats.moltenIron} position={[0, 0.01, -0.18]}>
              <boxGeometry args={[0.18, 0.02, 0.36]} />
            </mesh>
            <mesh material={mats.ironSteel} position={[0, 0.01, 0.18]}>
              <boxGeometry args={[0.18, 0.02, 0.36]} />
            </mesh>
          </group>
        ))}
      </group>

      <group position={[0.40, 0.11, -0.65]}>

        <mesh material={mats.timberDark} position={[0, 0.18, 0]} castShadow receiveShadow>
          <boxGeometry args={[0.70, 0.36, 0.85]} />
        </mesh>
        <mesh material={mats.stoneDark} position={[0, 0.31, 0]}>
          <boxGeometry args={[0.58, 0.08, 0.73]} />
        </mesh>

        <mesh material={mats.timberLogs} position={[-0.42, 0.15, 0]} castShadow>
          <cylinderGeometry args={[0.16, 0.18, 0.30, 8]} />
        </mesh>
        <mesh material={mats.ironSteel} position={[-0.42, 0.35, 0]} castShadow>
          <boxGeometry args={[0.18, 0.12, 0.28]} />
        </mesh>

        <mesh material={mats.timberLight} position={[0.38, 0.28, 0.10]} rotation={[0.3, 0, 0.25]} castShadow>
          <cylinderGeometry args={[0.016, 0.016, 0.65, 5]} />
        </mesh>
        <mesh material={mats.ironSteel} position={[0.38, 0.54, 0.10]} rotation={[0.3, 0, 0.25]} castShadow>
          <boxGeometry args={[0.12, 0.09, 0.09]} />
        </mesh>
      </group>

      <group position={[1.48, 0.11, 0.48]}>
        <mesh material={mats.timberPlanks} position={[0, 0.03, 0]} castShadow receiveShadow>
          <boxGeometry args={[0.95, 0.04, 0.80]} />
        </mesh>

        {[-0.26, 0.0, 0.26].map((x, i) => (
          <mesh key={`ingot-t1-${i}`} material={mats.ironSteel} position={[x, 0.07, -0.12]} castShadow>
            <boxGeometry args={[0.20, 0.07, 0.42]} />
          </mesh>
        ))}

        {[-0.14, 0.14].map((z, i) => (
          <mesh key={`ingot-t2-${i}`} material={mats.ironSteel} position={[0, 0.14, z]} castShadow>
            <boxGeometry args={[0.72, 0.07, 0.18]} />
          </mesh>
        ))}

        {[-0.12, 0.12].map((x, i) => (
          <mesh key={`ingot-t3-${i}`} material={mats.ironSteel} position={[x, 0.21, 0]} castShadow>
            <boxGeometry args={[0.20, 0.07, 0.36]} />
          </mesh>
        ))}
      </group>

      <group position={[1.48, 0.11, -0.65]}>

        <mesh material={mats.ironOre} position={[-0.30, 0.16, 0]} castShadow>
          <dodecahedronGeometry args={[0.24, 0]} />
        </mesh>
        <mesh material={mats.ironOre} position={[-0.14, 0.11, 0.24]} castShadow>
          <dodecahedronGeometry args={[0.18, 0]} />
        </mesh>
        <mesh material={mats.ironOre} position={[-0.38, 0.09, -0.22]} castShadow>
          <dodecahedronGeometry args={[0.16, 0]} />
        </mesh>

        <mesh material={mats.timberDark} position={[0.28, 0.18, 0]} castShadow>
          <boxGeometry args={[0.54, 0.36, 0.75]} />
        </mesh>
        <mesh material={mats.charcoalBlack} position={[0.28, 0.34, 0]} castShadow>
          <dodecahedronGeometry args={[0.22, 0]} />
        </mesh>
      </group>

      {[
        [-0.35, 1.20],
        [2.15, 1.20],
        [-0.35, -1.20],
        [2.15, -1.20],
      ].map(([px, pz], idx) => (
        <mesh key={`smelter-post-${idx}`} material={mats.timberDark} position={[px, 0.95, pz]} castShadow>
          <boxGeometry args={[0.11, 1.70, 0.11]} />
        </mesh>
      ))}

      <mesh material={mats.timberDark} position={[0.90, 1.80, 1.20]} castShadow>
        <boxGeometry args={[2.60, 0.10, 0.11]} />
      </mesh>
      <mesh material={mats.timberDark} position={[0.90, 1.80, -1.20]} castShadow>
        <boxGeometry args={[2.60, 0.10, 0.11]} />
      </mesh>
      <mesh material={mats.timberDark} position={[-0.35, 1.80, 0.0]} castShadow>
        <boxGeometry args={[0.11, 0.10, 2.40]} />
      </mesh>
      <mesh material={mats.timberDark} position={[2.15, 1.80, 0.0]} castShadow>
        <boxGeometry args={[0.11, 0.10, 2.40]} />
      </mesh>

      <group ref={roofRef}>
        <mesh
          material={mats.shingleRoof}
          position={[0.90, 2.12, -0.62]}
          rotation={[-0.42, 0, 0]}
          castShadow
          receiveShadow
        >
          <boxGeometry args={[2.75, 0.08, 1.50]} />
        </mesh>
        <mesh
          material={mats.shingleRoof}
          position={[0.90, 2.12, 0.62]}
          rotation={[0.42, 0, 0]}
          castShadow
          receiveShadow
        >
          <boxGeometry args={[2.75, 0.08, 1.50]} />
        </mesh>
        <mesh material={mats.timberDark} position={[0.90, 2.44, 0.0]} castShadow>
          <boxGeometry args={[2.78, 0.09, 0.15]} />
        </mesh>
      </group>
    </group>
  );
}

