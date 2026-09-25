import type { RefObject } from 'react';
import type * as THREE from 'three';
import { SHARED_BUILDING_MATS } from '../buildingMaterials';
import {
  MedievalDoor,
  MedievalWindow,
  FirewoodStack,
  TriangularGable,
  DetailedChimney,
} from '../common/BuildingPrimitives';

export function BakeryModel({
  isLightOn = false,
  roofRef,
}: {
  isLightOn?: boolean;
  roofRef?: RefObject<THREE.Group | null>;
}) {
  const mats = SHARED_BUILDING_MATS;

  return (
    <group>
      <mesh material={mats.stoneMed} position={[0, 0.05, 0]} castShadow receiveShadow>
        <boxGeometry args={[3.96, 0.10, 1.96]} />
      </mesh>
      <mesh material={mats.floorPlanks} position={[0, 0.11, 0]} receiveShadow>
        <boxGeometry args={[3.80, 0.03, 1.80]} />
      </mesh>

      <mesh material={mats.wattleDaub} position={[-0.95, 0.65, -0.88]} castShadow receiveShadow>
        <boxGeometry args={[1.9, 1.05, 0.12]} />
      </mesh>
      <mesh material={mats.stoneMed} position={[1.0, 0.65, -0.88]} castShadow receiveShadow>
        <boxGeometry args={[1.85, 1.05, 0.12]} />
      </mesh>
      <mesh material={mats.wattleDaub} position={[-1.88, 0.65, 0]} castShadow receiveShadow>
        <boxGeometry args={[0.12, 1.05, 1.78]} />
      </mesh>
      <mesh material={mats.stoneMed} position={[1.88, 0.65, 0]} castShadow receiveShadow>
        <boxGeometry args={[0.12, 1.05, 1.78]} />
      </mesh>
      <mesh material={mats.timberPlanks} position={[0.0, 0.65, -0.6]} castShadow receiveShadow>
        <boxGeometry args={[0.12, 1.05, 0.58]} />
      </mesh>
      <mesh material={mats.timberPlanks} position={[0.0, 0.65, 0.68]} castShadow receiveShadow>
        <boxGeometry args={[0.12, 1.05, 0.42]} />
      </mesh>
      <mesh material={mats.timberDark} position={[0.0, 1.12, 0.04]} castShadow>
        <boxGeometry args={[0.14, 0.12, 0.88]} />
      </mesh>
      <mesh material={mats.timberDark} position={[0.0, 0.65, -0.31]} castShadow>
        <boxGeometry args={[0.14, 1.05, 0.08]} />
      </mesh>
      <mesh material={mats.timberDark} position={[0.0, 0.65, 0.47]} castShadow>
        <boxGeometry args={[0.14, 1.05, 0.08]} />
      </mesh>

      <mesh material={mats.stoneMed} position={[-0.95, 0.22, 0.88]} castShadow receiveShadow>
        <boxGeometry args={[1.85, 0.44, 0.12]} />
      </mesh>
      <mesh material={mats.timberPlanks} position={[-0.95, 0.46, 0.88]} castShadow receiveShadow>
        <boxGeometry args={[1.95, 0.06, 0.36]} />
      </mesh>

      <mesh material={mats.breadCrust} position={[-1.45, 0.53, 0.88]} castShadow>
        <boxGeometry args={[0.18, 0.08, 0.14]} />
      </mesh>
      <mesh material={mats.breadCrust} position={[-1.2, 0.53, 0.88]} castShadow>
        <boxGeometry args={[0.16, 0.07, 0.13]} />
      </mesh>
      <mesh material={mats.breadCrust} position={[-0.95, 0.54, 0.88]} castShadow>
        <dodecahedronGeometry args={[0.08, 0]} />
      </mesh>
      <group position={[-0.6, 0.53, 0.88]} rotation={[0, 0.3, Math.PI / 2]}>
        <mesh material={mats.breadCrust} castShadow>
          <cylinderGeometry args={[0.035, 0.035, 0.26, 6]} />
        </mesh>
      </group>
      <group position={[-0.38, 0.53, 0.88]} rotation={[0, -0.2, Math.PI / 2]}>
        <mesh material={mats.breadCrust} castShadow>
          <cylinderGeometry args={[0.035, 0.035, 0.26, 6]} />
        </mesh>
      </group>

      <mesh material={mats.timberDark} position={[-1.88, 0.8, 0.88]} castShadow>
        <cylinderGeometry args={[0.06, 0.06, 0.72, 6]} />
      </mesh>
      <mesh material={mats.timberDark} position={[0.0, 0.8, 0.88]} castShadow>
        <cylinderGeometry args={[0.06, 0.06, 0.72, 6]} />
      </mesh>
      <mesh material={mats.timberDark} position={[-0.95, 1.15, 0.88]} castShadow>
        <boxGeometry args={[1.95, 0.1, 0.12]} />
      </mesh>

      <group position={[-0.95, 1.26, 0.98]}>
        <mesh material={mats.ironHardware} position={[0, 0, 0]}>
          <boxGeometry args={[0.4, 0.03, 0.03]} />
        </mesh>
        <mesh material={mats.ironHardware} position={[0, -0.06, 0]}>
          <cylinderGeometry args={[0.008, 0.008, 0.12, 4]} />
        </mesh>
        <mesh material={mats.goldTrim} position={[0, -0.16, 0]} castShadow>
          <torusGeometry args={[0.08, 0.02, 6, 12]} />
        </mesh>
      </group>

      <mesh material={mats.stoneMed} position={[0.4, 0.65, 0.88]} castShadow receiveShadow>
        <boxGeometry args={[0.7, 1.05, 0.12]} />
      </mesh>
      <mesh material={mats.stoneMed} position={[1.65, 0.65, 0.88]} castShadow receiveShadow>
        <boxGeometry args={[0.5, 1.05, 0.12]} />
      </mesh>

      <MedievalDoor position={[1.05, 0.12, 0.88]} width={0.72} height={1.05} />

      <MedievalWindow position={[-1.89, 0.68, 0]} rotation={[0, -Math.PI / 2, 0]} width={0.48} height={0.48} isLightOn={isLightOn} />
      <MedievalWindow position={[1.89, 0.68, 0]} rotation={[0, Math.PI / 2, 0]} width={0.48} height={0.48} isLightOn={isLightOn} />

      <mesh material={mats.flourSack} position={[-1.6, 0.16, 0.7]} castShadow>
        <sphereGeometry args={[0.15, 6, 6]} />
      </mesh>
      <mesh material={mats.flourSack} position={[-1.75, 0.14, 0.5]} castShadow>
        <sphereGeometry args={[0.14, 6, 6]} />
      </mesh>
      <FirewoodStack position={[1.85, 0.05, -0.45]} rotation={[0, Math.PI / 2, 0]} />

      <group position={[-1.1, 0.12, -0.15]}>
        <mesh material={mats.timberLight} position={[0, 0.28, 0]} castShadow receiveShadow>
          <boxGeometry args={[1.0, 0.05, 0.65]} />
        </mesh>
        <mesh material={mats.timberDark} position={[-0.42, 0.14, -0.26]} castShadow>
          <boxGeometry args={[0.06, 0.28, 0.06]} />
        </mesh>
        <mesh material={mats.timberDark} position={[0.42, 0.14, -0.26]} castShadow>
          <boxGeometry args={[0.06, 0.28, 0.06]} />
        </mesh>
        <mesh material={mats.timberDark} position={[-0.42, 0.14, 0.26]} castShadow>
          <boxGeometry args={[0.06, 0.28, 0.06]} />
        </mesh>
        <mesh material={mats.timberDark} position={[0.42, 0.14, 0.26]} castShadow>
          <boxGeometry args={[0.06, 0.28, 0.06]} />
        </mesh>
        <mesh material={mats.breadCrust} position={[-0.22, 0.34, 0]} castShadow>
          <boxGeometry args={[0.18, 0.08, 0.14]} />
        </mesh>
        <mesh material={mats.flourSack} position={[0.26, 0.38, -0.05]} castShadow>
          <sphereGeometry args={[0.16, 6, 6]} />
        </mesh>
      </group>

      <group position={[1.15, 0.08, -0.28]}>
        <mesh material={mats.stoneMed} position={[0, 0.30, 0]} castShadow receiveShadow>
          <boxGeometry args={[1.05, 0.58, 0.95]} />
        </mesh>
        <mesh material={mats.stoneMed} position={[0, 0.68, 0]} castShadow receiveShadow>
          <sphereGeometry args={[0.48, 8, 8]} />
        </mesh>
        <mesh material={mats.stoneDark} position={[0, 0.38, 0.48]} castShadow>
          <boxGeometry args={[0.44, 0.32, 0.08]} />
        </mesh>
        <mesh material={mats.fireOrange} position={[0, 0.36, 0.50]}>
          <boxGeometry args={[0.32, 0.24, 0.04]} />
        </mesh>
        <pointLight color="#f97316" intensity={1.6} distance={3.8} position={[0, 0.44, 0.62]} />
      </group>

      <group ref={roofRef}>
        <TriangularGable
          baseWidth={1.76}
          height={0.94}
          thickness={0.12}
          position={[-1.88, 1.18, 0]}
          rotation={[0, -Math.PI / 2, 0]}
          material={mats.wattleDaub}
        />
        <TriangularGable
          baseWidth={1.76}
          height={0.94}
          thickness={0.12}
          position={[1.88, 1.18, 0]}
          rotation={[0, Math.PI / 2, 0]}
          material={mats.stoneMed}
        />
        <mesh material={mats.shingleRoof} position={[0, 1.65, 0.44]} rotation={[-0.818, 0, 0]} castShadow receiveShadow>
          <boxGeometry args={[3.96, 1.40, 0.14]} />
        </mesh>
        <mesh material={mats.timberDark} position={[0, 1.18, 0.88]} rotation={[-0.818, 0, 0]}>
          <boxGeometry args={[3.96, 0.12, 0.16]} />
        </mesh>
        <mesh material={mats.shingleRoof} position={[0, 1.65, -0.44]} rotation={[0.818, 0, 0]} castShadow receiveShadow>
          <boxGeometry args={[3.96, 1.40, 0.14]} />
        </mesh>
        <mesh material={mats.timberDark} position={[0, 1.18, -0.88]} rotation={[0.818, 0, 0]}>
          <boxGeometry args={[3.96, 0.12, 0.16]} />
        </mesh>
        <mesh material={mats.timberDark} position={[0, 2.12, 0]} castShadow>
          <boxGeometry args={[3.98, 0.14, 0.14]} />
        </mesh>

        {[-1.98, 1.98].map((gx) => (
          <group key={`bk-finial-${gx}`} position={[gx, 2.16, 0]}>
            <mesh material={mats.timberLight} rotation={[0.55, 0, 0]} castShadow>
              <boxGeometry args={[0.06, 0.44, 0.05]} />
            </mesh>
            <mesh material={mats.timberLight} rotation={[-0.55, 0, 0]} castShadow>
              <boxGeometry args={[0.06, 0.44, 0.05]} />
            </mesh>
          </group>
        ))}

        <DetailedChimney
          position={[1.15, 1.95, -0.38]}
          width={0.44}
          depth={0.44}
          height={1.05}
        />
      </group>
    </group>
  );
}
