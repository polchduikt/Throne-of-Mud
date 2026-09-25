import type { RefObject } from 'react';
import type * as THREE from 'three';
import { SHARED_BUILDING_MATS } from '../buildingMaterials';
import {
  MedievalDoor,
  MedievalWindow,
  TimberBarrel,
  TriangularGable,
  ChimneySmoke,
} from '../common/BuildingPrimitives';

export function BreweryModel({
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

      <mesh material={mats.timberLogs} position={[-0.49, 0.65, -0.88]} castShadow receiveShadow>
        <boxGeometry args={[2.78, 1.05, 0.12]} />
      </mesh>
      <mesh material={mats.timberLogs} position={[-1.88, 0.65, 0]} castShadow receiveShadow>
        <boxGeometry args={[0.12, 1.05, 1.78]} />
      </mesh>
      <mesh material={mats.timberLogs} position={[0.90, 0.65, 0]} castShadow receiveShadow>
        <boxGeometry args={[0.12, 1.05, 1.78]} />
      </mesh>

      <mesh material={mats.timberLogs} position={[-1.57, 0.65, 0.88]} castShadow receiveShadow>
        <boxGeometry args={[0.62, 1.05, 0.12]} />
      </mesh>
      <mesh material={mats.timberLogs} position={[-1.03, 0.28, 0.88]} castShadow receiveShadow>
        <boxGeometry args={[0.46, 0.32, 0.12]} />
      </mesh>
      <mesh material={mats.timberLogs} position={[-1.03, 1.04, 0.88]} castShadow receiveShadow>
        <boxGeometry args={[0.46, 0.28, 0.12]} />
      </mesh>
      <mesh material={mats.timberLogs} position={[-0.49, 0.65, 0.88]} castShadow receiveShadow>
        <boxGeometry args={[0.62, 1.05, 0.12]} />
      </mesh>
      <mesh material={mats.timberLogs} position={[0.15, 1.10, 0.88]} castShadow receiveShadow>
        <boxGeometry args={[0.66, 0.16, 0.12]} />
      </mesh>
      <mesh material={mats.timberLogs} position={[0.69, 0.65, 0.88]} castShadow receiveShadow>
        <boxGeometry args={[0.42, 1.05, 0.12]} />
      </mesh>

      <MedievalDoor position={[0.15, 0.12, 0.88]} width={0.65} height={1.02} />
      <MedievalWindow position={[-1.03, 0.66, 0.89]} width={0.44} height={0.44} isLightOn={isLightOn} hasFlowerBox={false} />

      <group position={[0.90, 1.2, 0.98]}>
        <mesh material={mats.ironHardware}>
          <boxGeometry args={[0.04, 0.04, 0.35]} />
        </mesh>
        <mesh material={mats.barrelWood} position={[0, -0.15, 0.15]} castShadow>
          <cylinderGeometry args={[0.08, 0.08, 0.14, 6]} />
        </mesh>
        <mesh material={mats.ironHardware} position={[0, -0.15, 0.15]}>
          <cylinderGeometry args={[0.085, 0.085, 0.02, 6]} />
        </mesh>
      </group>

      <group position={[-0.75, 0.12, -0.2]}>
        <mesh material={mats.stoneDark} position={[0, 0.1, 0]} castShadow receiveShadow>
          <cylinderGeometry args={[0.48, 0.52, 0.2, 10]} />
        </mesh>
        <mesh material={mats.copperBrew} position={[0, 0.42, 0]} castShadow receiveShadow>
          <cylinderGeometry args={[0.42, 0.46, 0.48, 12]} />
        </mesh>
        <mesh material={mats.copperBrew} position={[0, 0.72, 0]} castShadow>
          <cylinderGeometry args={[0.1, 0.42, 0.22, 12]} />
        </mesh>
        <mesh material={mats.copperBrew} position={[0, 1.2, 0]} castShadow>
          <cylinderGeometry args={[0.06, 0.06, 0.8, 8]} />
        </mesh>
        <pointLight color="#f59e0b" intensity={1.4} distance={3.2} position={[0, 0.3, 0.4]} />
      </group>

      <mesh material={mats.timberDark} position={[1.85, 0.65, 0.88]} castShadow>
        <cylinderGeometry args={[0.08, 0.08, 1.05, 6]} />
      </mesh>
      <mesh material={mats.timberDark} position={[1.85, 0.65, -0.88]} castShadow>
        <cylinderGeometry args={[0.08, 0.08, 1.05, 6]} />
      </mesh>
      <mesh material={mats.timberDark} position={[0.90, 0.65, 0.88]} castShadow>
        <cylinderGeometry args={[0.08, 0.08, 1.05, 6]} />
      </mesh>
      <mesh material={mats.timberDark} position={[0.90, 0.65, -0.88]} castShadow>
        <cylinderGeometry args={[0.08, 0.08, 1.05, 6]} />
      </mesh>
      <mesh material={mats.timberDark} position={[1.38, 1.15, 0.88]} castShadow>
        <boxGeometry args={[0.98, 0.08, 0.08]} />
      </mesh>
      <mesh material={mats.timberDark} position={[1.38, 1.15, -0.88]} castShadow>
        <boxGeometry args={[0.98, 0.08, 0.08]} />
      </mesh>

      <group position={[1.38, 0.12, -0.28]}>
        <mesh material={mats.barrelWood} position={[0, 0.42, 0]} castShadow receiveShadow>
          <cylinderGeometry args={[0.45, 0.5, 0.75, 10]} />
        </mesh>
        <mesh material={mats.ironHardware} position={[0, 0.65, 0]}>
          <cylinderGeometry args={[0.47, 0.47, 0.025, 10]} />
        </mesh>
        <mesh material={mats.ironHardware} position={[0, 0.2, 0]}>
          <cylinderGeometry args={[0.51, 0.51, 0.025, 10]} />
        </mesh>
        <mesh material={mats.goldTrim} position={[0, 0.18, 0.52]} rotation={[Math.PI / 2, 0, 0]} castShadow>
          <cylinderGeometry args={[0.03, 0.03, 0.08, 6]} />
        </mesh>
      </group>

      <group position={[1.15, 0.12, 0.45]}>
        <TimberBarrel position={[-0.4, 0, 0]} scale={0.82} />
        <TimberBarrel position={[0.4, 0, 0]} scale={0.82} />
        <TimberBarrel position={[0, 0.38, 0]} scale={0.78} />
      </group>

      <group position={[0.45, 0.12, 0.55]}>
        <mesh material={mats.timberPlanks} position={[0, 0.18, 0]} castShadow receiveShadow>
          <boxGeometry args={[0.3, 0.04, 0.3]} />
        </mesh>
        <group position={[0.05, 0.24, 0.05]}>
          <mesh material={mats.barrelWood} castShadow>
            <cylinderGeometry args={[0.03, 0.03, 0.07, 6]} />
          </mesh>
          <mesh material={mats.pillowWhite} position={[0, 0.04, 0]}>
            <sphereGeometry args={[0.032, 6, 6]} />
          </mesh>
        </group>
      </group>

      <group ref={roofRef}>
        <TriangularGable
          baseWidth={1.76}
          height={0.94}
          thickness={0.12}
          position={[-1.88, 1.18, 0]}
          rotation={[0, -Math.PI / 2, 0]}
          material={mats.timberLogs}
        />
        <TriangularGable
          baseWidth={1.76}
          height={0.94}
          thickness={0.12}
          position={[1.88, 1.18, 0]}
          rotation={[0, Math.PI / 2, 0]}
          material={mats.timberLogs}
        />
        <mesh material={mats.thatchRoof} position={[0, 1.65, 0.44]} rotation={[-0.818, 0, 0]} castShadow receiveShadow>
          <boxGeometry args={[3.96, 1.40, 0.14]} />
        </mesh>
        <mesh material={mats.thatchDark} position={[0, 1.18, 0.88]} rotation={[-0.818, 0, 0]}>
          <boxGeometry args={[3.96, 0.12, 0.16]} />
        </mesh>
        <mesh material={mats.thatchRoof} position={[0, 1.65, -0.44]} rotation={[0.818, 0, 0]} castShadow receiveShadow>
          <boxGeometry args={[3.96, 1.40, 0.14]} />
        </mesh>
        <mesh material={mats.thatchDark} position={[0, 1.18, -0.88]} rotation={[0.818, 0, 0]}>
          <boxGeometry args={[3.96, 0.12, 0.16]} />
        </mesh>
        <mesh material={mats.thatchRidge} position={[0, 2.12, 0]} castShadow>
          <boxGeometry args={[3.98, 0.14, 0.14]} />
        </mesh>

        {[-1.98, 1.98].map((gx) => (
          <group key={`br-finial-${gx}`} position={[gx, 2.16, 0]}>
            <mesh material={mats.timberLight} rotation={[0.55, 0, 0]} castShadow>
              <boxGeometry args={[0.06, 0.44, 0.05]} />
            </mesh>
            <mesh material={mats.timberLight} rotation={[-0.55, 0, 0]} castShadow>
              <boxGeometry args={[0.06, 0.44, 0.05]} />
            </mesh>
          </group>
        ))}

        <mesh material={mats.copperBrew} position={[-0.75, 2.05, -0.2]} castShadow>
          <cylinderGeometry args={[0.07, 0.07, 0.6, 8]} />
        </mesh>
        <mesh material={mats.copperBrew} position={[-0.75, 2.38, -0.2]} castShadow>
          <coneGeometry args={[0.14, 0.12, 8]} />
        </mesh>
        <ChimneySmoke position={[-0.75, 2.45, -0.2]} />
      </group>
    </group>
  );
}
