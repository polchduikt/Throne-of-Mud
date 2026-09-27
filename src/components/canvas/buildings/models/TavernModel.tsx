import type { RefObject } from 'react';
import type * as THREE from 'three';
import { SHARED_BUILDING_MATS } from '../buildingMaterials';
import {
  MedievalDoor,
  MedievalWindow,
  ChimneySmoke,
  TimberBarrel,
  TriangularGable,
} from '../common/BuildingPrimitives';

export function TavernModel({
  isLightOn = false,
  roofRef,
}: {
  isLightOn?: boolean;
  roofRef?: RefObject<THREE.Group | null>;
}) {
  const mats = SHARED_BUILDING_MATS;

  return (
    <group>

      <mesh material={mats.stoneDark} position={[0, 0.05, 0]} castShadow receiveShadow>
        <boxGeometry args={[3.92, 0.10, 2.92]} />
      </mesh>
      <mesh material={mats.floorPlanks} position={[0, 0.11, 0]} receiveShadow>
        <boxGeometry args={[3.76, 0.04, 2.76]} />
      </mesh>

      <mesh material={mats.timberPlanks} position={[0, 0.785, -1.36]} castShadow receiveShadow>
        <boxGeometry args={[3.76, 1.35, 0.12]} />
      </mesh>

      <mesh material={mats.timberPlanks} position={[-1.86, 0.785, 0]} castShadow receiveShadow>
        <boxGeometry args={[0.12, 1.35, 2.76]} />
      </mesh>

      <mesh material={mats.timberPlanks} position={[1.86, 0.785, 0]} castShadow receiveShadow>
        <boxGeometry args={[0.12, 1.35, 2.76]} />
      </mesh>

      <mesh material={mats.timberPlanks} position={[-1.14, 0.785, 1.36]} castShadow receiveShadow>
        <boxGeometry args={[1.44, 1.35, 0.12]} />
      </mesh>
      <mesh material={mats.timberPlanks} position={[1.14, 0.785, 1.36]} castShadow receiveShadow>
        <boxGeometry args={[1.44, 1.35, 0.12]} />
      </mesh>
      <mesh material={mats.timberPlanks} position={[0, 1.32, 1.36]} castShadow receiveShadow>
        <boxGeometry args={[0.84, 0.28, 0.12]} />
      </mesh>

      {[-1.86, 1.86].map((px) =>
        [-1.36, 1.36].map((pz) => (
          <mesh
            key={`post-${px}-${pz}`}
            material={mats.timberDark}
            position={[px, 0.785, pz]}
            castShadow
          >
            <boxGeometry args={[0.15, 1.38, 0.15]} />
          </mesh>
        ))
      )}

      {[-0.43, 0.43].map((px) => (
        <mesh
          key={`door-post-${px}`}
          material={mats.timberDark}
          position={[px, 0.785, 1.36]}
          castShadow
        >
          <boxGeometry args={[0.10, 1.35, 0.14]} />
        </mesh>
      ))}

      <mesh material={mats.timberDark} position={[0, 1.44, -1.36]} castShadow>
        <boxGeometry args={[3.80, 0.08, 0.14]} />
      </mesh>
      <mesh material={mats.timberDark} position={[-1.86, 1.44, 0]} castShadow>
        <boxGeometry args={[0.14, 0.08, 2.80]} />
      </mesh>
      <mesh material={mats.timberDark} position={[1.86, 1.44, 0]} castShadow>
        <boxGeometry args={[0.14, 0.08, 2.80]} />
      </mesh>
      <mesh material={mats.timberDark} position={[0, 1.44, 1.36]} castShadow>
        <boxGeometry args={[3.80, 0.08, 0.14]} />
      </mesh>

      <MedievalDoor position={[0, 0.12, 1.36]} width={0.84} height={1.12} />

      <MedievalWindow position={[-1.15, 0.75, 1.38]} width={0.52} height={0.52} isLightOn={isLightOn} />
      <MedievalWindow position={[1.15, 0.75, 1.38]} width={0.52} height={0.52} isLightOn={isLightOn} />
      <MedievalWindow position={[-1.87, 0.75, 0]} rotation={[0, -Math.PI / 2, 0]} width={0.52} height={0.52} isLightOn={isLightOn} />
      <MedievalWindow position={[1.87, 0.75, 0.5]} rotation={[0, Math.PI / 2, 0]} width={0.52} height={0.52} isLightOn={isLightOn} />
      <MedievalWindow position={[-0.85, 0.75, -1.38]} rotation={[0, Math.PI, 0]} width={0.52} height={0.52} isLightOn={isLightOn} />
      <MedievalWindow position={[0.85, 0.75, -1.38]} rotation={[0, Math.PI, 0]} width={0.52} height={0.52} isLightOn={isLightOn} />

      <group position={[0.55, 1.25, 1.44]}>
        <mesh material={mats.ironSteel} position={[-0.12, 0, 0]}>
          <boxGeometry args={[0.26, 0.03, 0.03]} />
        </mesh>
        <mesh material={mats.ironSteel} position={[0, -0.05, 0]}>
          <boxGeometry args={[0.025, 0.10, 0.025]} />
        </mesh>
        <group position={[0, -0.15, 0]}>
          <mesh material={mats.timberDark} castShadow>
            <boxGeometry args={[0.24, 0.20, 0.025]} />
          </mesh>
          <mesh material={mats.goldTrim} position={[0, 0, 0.018]} castShadow>
            <cylinderGeometry args={[0.035, 0.04, 0.08, 8]} />
          </mesh>
          <mesh material={mats.goldTrim} position={[0.035, 0, 0.018]}>
            <torusGeometry args={[0.022, 0.007, 4, 8]} />
          </mesh>
        </group>
      </group>

      <group position={[1.45, 0.11, -0.45]}>
        <mesh material={mats.stoneDark} position={[0, 0.04, 0]} receiveShadow>
          <boxGeometry args={[0.55, 0.08, 0.95]} />
        </mesh>
        <mesh material={mats.stoneMed} position={[0.14, 0.40, 0]} castShadow receiveShadow>
          <boxGeometry args={[0.10, 0.72, 0.88]} />
        </mesh>
        <mesh material={mats.charredWood} position={[0.09, 0.32, 0]} receiveShadow>
          <boxGeometry args={[0.03, 0.54, 0.54]} />
        </mesh>
        <mesh material={mats.stoneMed} position={[-0.03, 0.40, -0.36]} castShadow receiveShadow>
          <boxGeometry args={[0.32, 0.72, 0.20]} />
        </mesh>
        <mesh material={mats.stoneMed} position={[-0.03, 0.40, 0.36]} castShadow receiveShadow>
          <boxGeometry args={[0.32, 0.72, 0.20]} />
        </mesh>
        <mesh material={mats.stoneLight} position={[-0.03, 0.74, 0]} castShadow receiveShadow>
          <boxGeometry args={[0.34, 0.15, 0.88]} />
        </mesh>
        <mesh material={mats.timberDark} position={[-0.08, 0.83, 0]} castShadow>
          <boxGeometry args={[0.40, 0.05, 0.98]} />
        </mesh>

        <mesh material={mats.ashBed} position={[0, 0.07, 0]} receiveShadow>
          <boxGeometry args={[0.22, 0.03, 0.45]} />
        </mesh>
        <mesh material={mats.timberLogs} position={[0, 0.12, 0]} rotation={[0, 0, Math.PI / 2]} castShadow>
          <cylinderGeometry args={[0.035, 0.04, 0.35, 6]} />
        </mesh>
        <mesh material={mats.timberLogs} position={[-0.02, 0.17, -0.03]} rotation={[0.2, 0.1, Math.PI / 2]} castShadow>
          <cylinderGeometry args={[0.032, 0.035, 0.32, 6]} />
        </mesh>
        <mesh material={mats.fireOrange} position={[-0.02, 0.19, 0]}>
          <dodecahedronGeometry args={[0.11, 0]} />
        </mesh>
        <mesh material={mats.fireYellow} position={[-0.03, 0.24, 0]}>
          <coneGeometry args={[0.065, 0.18, 5]} />
        </mesh>
        <pointLight color="#f97316" intensity={1.5} distance={3.8} position={[-0.15, 0.28, 0]} />

        <mesh material={mats.stoneMed} position={[0.05, 2.05, 0]} castShadow receiveShadow>
          <boxGeometry args={[0.38, 2.45, 0.44]} />
        </mesh>
        <mesh material={mats.stoneLight} position={[0.05, 3.28, 0]} castShadow>
          <boxGeometry args={[0.46, 0.07, 0.52]} />
        </mesh>
        <mesh material={mats.stoneMed} position={[0.05, 3.42, 0]} castShadow>
          <cylinderGeometry args={[0.15, 0.18, 0.20, 10, 1, true]} />
        </mesh>
        <mesh material={mats.stoneMed} position={[0.05, 3.52, 0]}>
          <torusGeometry args={[0.15, 0.02, 6, 10]} />
        </mesh>
        <mesh material={mats.charredWood} position={[0.05, 3.48, 0]} rotation={[-Math.PI / 2, 0, 0]}>
          <circleGeometry args={[0.14, 10]} />
        </mesh>
        <ChimneySmoke position={[0.05, 3.60, 0]} />

        <mesh material={mats.ironHardware} position={[-0.10, 0.88, 0.26]} castShadow>
          <cylinderGeometry args={[0.04, 0.06, 0.08, 6]} />
        </mesh>
        <mesh material={mats.candleGlow} position={[-0.10, 0.88, -0.26]}>
          <cylinderGeometry args={[0.012, 0.016, 0.07, 5]} />
        </mesh>
      </group>

      <group position={[-0.95, 0.11, -0.55]}>

        <mesh material={mats.timberDark} position={[0.25, 0.23, 0.12]} castShadow receiveShadow>
          <boxGeometry args={[1.35, 0.46, 0.26]} />
        </mesh>
        <mesh material={mats.timberLight} position={[0.25, 0.47, 0.12]} castShadow>
          <boxGeometry args={[1.42, 0.035, 0.32]} />
        </mesh>

        <mesh material={mats.timberDark} position={[-0.38, 0.23, 0.34]} castShadow receiveShadow>
          <boxGeometry args={[0.26, 0.46, 0.34]} />
        </mesh>
        <mesh material={mats.timberLight} position={[-0.38, 0.47, 0.34]} castShadow>
          <boxGeometry args={[0.32, 0.035, 0.38]} />
        </mesh>

        <mesh material={mats.timberDark} position={[0.15, 0.55, -0.72]} castShadow>
          <boxGeometry args={[1.6, 0.95, 0.05]} />
        </mesh>
        <mesh material={mats.timberPlanks} position={[0.15, 0.28, -0.58]} castShadow>
          <boxGeometry args={[1.55, 0.035, 0.26]} />
        </mesh>
        <mesh material={mats.timberPlanks} position={[0.15, 0.70, -0.62]} castShadow>
          <boxGeometry args={[1.55, 0.035, 0.18]} />
        </mesh>

        <TimberBarrel position={[-0.40, 0.30, -0.58]} scale={0.58} />
        <TimberBarrel position={[0.15, 0.30, -0.58]} scale={0.58} />
        <TimberBarrel position={[0.65, 0.30, -0.58]} scale={0.58} />

        <mesh material={mats.copperBrew} position={[-0.3, 0.74, -0.62]} castShadow>
          <cylinderGeometry args={[0.03, 0.035, 0.07, 6]} />
        </mesh>
        <mesh material={mats.copperBrew} position={[0.2, 0.74, -0.62]} castShadow>
          <cylinderGeometry args={[0.03, 0.035, 0.07, 6]} />
        </mesh>
        <mesh material={mats.candleGlow} position={[0.5, 0.74, -0.62]}>
          <cylinderGeometry args={[0.012, 0.018, 0.05, 5]} />
        </mesh>

        <mesh material={mats.copperBrew} position={[0.0, 0.52, 0.12]} castShadow>
          <cylinderGeometry args={[0.03, 0.038, 0.07, 8]} />
        </mesh>
        <mesh material={mats.copperBrew} position={[0.25, 0.52, 0.12]} castShadow>
          <cylinderGeometry args={[0.03, 0.038, 0.07, 8]} />
        </mesh>
        <mesh material={mats.breadCrust} position={[0.5, 0.51, 0.15]} castShadow>
          <boxGeometry args={[0.14, 0.04, 0.09]} />
        </mesh>
      </group>

      <group position={[0.65, 0.11, 0.55]}>
        <mesh material={mats.timberDark} position={[0, 0.34, 0]} castShadow receiveShadow>
          <boxGeometry args={[1.05, 0.04, 0.52]} />
        </mesh>
        <mesh material={mats.timberDark} position={[-0.44, 0.16, -0.19]} castShadow>
          <boxGeometry args={[0.04, 0.32, 0.04]} />
        </mesh>
        <mesh material={mats.timberDark} position={[0.44, 0.16, -0.19]} castShadow>
          <boxGeometry args={[0.04, 0.32, 0.04]} />
        </mesh>
        <mesh material={mats.timberDark} position={[-0.44, 0.16, 0.19]} castShadow>
          <boxGeometry args={[0.04, 0.32, 0.04]} />
        </mesh>
        <mesh material={mats.timberDark} position={[0.44, 0.16, 0.19]} castShadow>
          <boxGeometry args={[0.04, 0.32, 0.04]} />
        </mesh>

        <mesh material={mats.timberPlanks} position={[0, 0.18, -0.38]} castShadow>
          <boxGeometry args={[1.0, 0.035, 0.18]} />
        </mesh>
        <mesh material={mats.timberPlanks} position={[0, 0.18, 0.38]} castShadow>
          <boxGeometry args={[1.0, 0.035, 0.18]} />
        </mesh>

        <mesh material={mats.copperBrew} position={[-0.25, 0.39, 0]} castShadow>
          <cylinderGeometry args={[0.03, 0.035, 0.06, 7]} />
        </mesh>
        <mesh material={mats.copperBrew} position={[0.25, 0.39, 0]} castShadow>
          <cylinderGeometry args={[0.03, 0.035, 0.06, 7]} />
        </mesh>
        <mesh material={mats.candleGlow} position={[0, 0.39, -0.04]}>
          <cylinderGeometry args={[0.012, 0.016, 0.05, 5]} />
        </mesh>
        <mesh material={mats.breadCrust} position={[0.10, 0.38, 0.04]} castShadow>
          <boxGeometry args={[0.13, 0.04, 0.09]} />
        </mesh>
      </group>

      <group position={[-0.95, 0.11, 0.60]}>
        <mesh material={mats.timberDark} position={[0, 0.34, 0]} castShadow receiveShadow>
          <boxGeometry args={[0.65, 0.04, 0.65]} />
        </mesh>
        <mesh material={mats.timberDark} position={[-0.25, 0.16, -0.25]} castShadow>
          <boxGeometry args={[0.04, 0.32, 0.04]} />
        </mesh>
        <mesh material={mats.timberDark} position={[0.25, 0.16, -0.25]} castShadow>
          <boxGeometry args={[0.04, 0.32, 0.04]} />
        </mesh>
        <mesh material={mats.timberDark} position={[-0.25, 0.16, 0.25]} castShadow>
          <boxGeometry args={[0.04, 0.32, 0.04]} />
        </mesh>
        <mesh material={mats.timberDark} position={[0.25, 0.16, 0.25]} castShadow>
          <boxGeometry args={[0.04, 0.32, 0.04]} />
        </mesh>

        {[-0.38, 0.38].map((px) =>
          [-0.38, 0.38].map((pz) => (
            <mesh
              key={`stool-${px}-${pz}`}
              material={mats.timberPlanks}
              position={[px, 0.16, pz]}
              castShadow
            >
              <cylinderGeometry args={[0.09, 0.10, 0.16, 6]} />
            </mesh>
          ))
        )}

        <mesh material={mats.copperBrew} position={[0.10, 0.39, 0.08]} castShadow>
          <cylinderGeometry args={[0.03, 0.035, 0.06, 7]} />
        </mesh>
        <mesh material={mats.candleGlow} position={[-0.08, 0.39, -0.08]}>
          <cylinderGeometry args={[0.012, 0.016, 0.05, 5]} />
        </mesh>
      </group>

      {isLightOn && (
        <pointLight color="#fde047" intensity={1.1} distance={4.5} position={[0, 1.05, 0]} />
      )}

      <group ref={roofRef}>

        <TriangularGable
          baseWidth={2.76}
          height={1.30}
          thickness={0.12}
          position={[-1.86, 1.44, 0]}
          rotation={[0, Math.PI / 2, 0]}
          material={mats.timberPlanks}
        />
        <TriangularGable
          baseWidth={2.76}
          height={1.30}
          thickness={0.12}
          position={[1.86, 1.44, 0]}
          rotation={[0, -Math.PI / 2, 0]}
          material={mats.timberPlanks}
        />

        <mesh
          material={mats.shingleRoof}
          position={[0, 2.05, -0.69]}
          rotation={[-0.67, 0, 0]}
          castShadow
          receiveShadow
        >
          <boxGeometry args={[3.96, 0.10, 1.85]} />
        </mesh>
        <mesh
          material={mats.timberDark}
          position={[0, 1.46, -1.40]}
          rotation={[-0.67, 0, 0]}
          castShadow
        >
          <boxGeometry args={[3.98, 0.10, 0.12]} />
        </mesh>

        <mesh
          material={mats.shingleRoof}
          position={[0, 2.05, 0.69]}
          rotation={[0.67, 0, 0]}
          castShadow
          receiveShadow
        >
          <boxGeometry args={[3.96, 0.10, 1.85]} />
        </mesh>
        <mesh
          material={mats.timberDark}
          position={[0, 1.46, 1.40]}
          rotation={[0.67, 0, 0]}
          castShadow
        >
          <boxGeometry args={[3.98, 0.10, 0.12]} />
        </mesh>

        <mesh material={mats.timberDark} position={[0, 2.72, 0]} castShadow>
          <boxGeometry args={[4.0, 0.10, 0.14]} />
        </mesh>
      </group>
    </group>
  );
}

