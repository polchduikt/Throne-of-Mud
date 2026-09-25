import type { RefObject } from 'react';
import type * as THREE from 'three';
import { SHARED_BUILDING_MATS } from '../buildingMaterials';
import {
  MedievalDoor,
  MedievalWindow,
  MedievalBed,
  FirewoodStack,
  TriangularGable,
} from '../common/BuildingPrimitives';

export function LumberjackHutModel({
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
        <boxGeometry args={[3.92, 0.10, 1.92]} />
      </mesh>

      <mesh material={mats.floorPlanks} position={[0, 0.11, 0]} receiveShadow>
        <boxGeometry args={[3.80, 0.03, 1.80]} />
      </mesh>

      <mesh material={mats.timberLogs} position={[-0.49, 0.65, -0.88]} castShadow receiveShadow>
        <boxGeometry args={[2.78, 1.05, 0.12]} />
      </mesh>
      <mesh material={mats.timberLogs} position={[-1.88, 0.65, 0]} castShadow receiveShadow>
        <boxGeometry args={[0.12, 1.05, 1.76]} />
      </mesh>
      <mesh material={mats.timberLogs} position={[0.90, 0.65, 0]} castShadow receiveShadow>
        <boxGeometry args={[0.12, 1.05, 1.76]} />
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

      <mesh material={mats.timberLogs} position={[1.85, 0.65, 0.88]} castShadow>
        <cylinderGeometry args={[0.09, 0.09, 1.05, 6]} />
      </mesh>
      <mesh material={mats.timberLogs} position={[1.85, 0.65, -0.88]} castShadow>
        <cylinderGeometry args={[0.09, 0.09, 1.05, 6]} />
      </mesh>
      <mesh material={mats.timberLogs} position={[0.90, 0.65, 0.88]} castShadow>
        <cylinderGeometry args={[0.09, 0.09, 1.05, 6]} />
      </mesh>
      <mesh material={mats.timberLogs} position={[0.90, 0.65, -0.88]} castShadow>
        <cylinderGeometry args={[0.09, 0.09, 1.05, 6]} />
      </mesh>
      <mesh material={mats.timberDark} position={[1.38, 1.15, 0.88]} castShadow>
        <boxGeometry args={[0.98, 0.08, 0.08]} />
      </mesh>
      <mesh material={mats.timberDark} position={[1.38, 1.15, -0.88]} castShadow>
        <boxGeometry args={[0.98, 0.08, 0.08]} />
      </mesh>

      <MedievalDoor position={[0.15, 0.12, 0.88]} width={0.65} height={1.0} />
      <MedievalWindow position={[-1.03, 0.66, 0.89]} width={0.44} height={0.44} isLightOn={isLightOn} hasFlowerBox={false} />

      <MedievalBed position={[-1.25, 0.12, -0.2]} quiltMaterial={mats.bedLinenGreen} />

      <group position={[-0.2, 0.12, -0.2]}>
        <mesh material={mats.timberLight} position={[0, 0.2, 0]} castShadow receiveShadow>
          <boxGeometry args={[0.45, 0.05, 0.45]} />
        </mesh>
        <mesh material={isLightOn ? mats.candleGlow : mats.candleUnlit} position={[0, 0.25, 0]}>
          <cylinderGeometry args={[0.016, 0.02, 0.06, 5]} />
        </mesh>
        {isLightOn && (
          <pointLight color="#fde047" intensity={0.5} distance={2.0} position={[0, 0.32, 0]} />
        )}
      </group>

      <group position={[1.38, 0.12, 0]}>
        <mesh material={mats.woodShavings} position={[0, 0.02, 0]} receiveShadow>
          <cylinderGeometry args={[0.55, 0.55, 0.02, 8]} />
        </mesh>
        <mesh material={mats.timberDark} position={[-0.15, 0.18, 0.2]} castShadow receiveShadow>
          <cylinderGeometry args={[0.2, 0.23, 0.36, 6]} />
        </mesh>
        <mesh material={mats.axeBlade} position={[-0.15, 0.42, 0.2]} rotation={[0, 0, -0.4]} castShadow>
          <boxGeometry args={[0.12, 0.08, 0.03]} />
        </mesh>
        <mesh material={mats.sawBlade} position={[0.3, 0.38, 0.3]} rotation={[0, 0, 0.3]} castShadow>
          <boxGeometry args={[0.08, 0.8, 0.015]} />
        </mesh>
        <FirewoodStack position={[0.05, 0, -0.45]} />
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
          material={mats.timberPlanks}
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
      </group>
    </group>
  );
}
