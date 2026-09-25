import type { RefObject } from 'react';
import type * as THREE from 'three';
import { SHARED_BUILDING_MATS } from '../buildingMaterials';
import { FirewoodStack, TimberBarrel, TriangularGable } from '../common/BuildingPrimitives';

export function StockpileModel({
  isLightOn = false,
  roofRef,
}: {
  isLightOn?: boolean;
  roofRef?: RefObject<THREE.Group | null>;
}) {
  const mats = SHARED_BUILDING_MATS;

  return (
    <group>
      <mesh material={mats.stoneDark} position={[0, 0.06, 0]} castShadow receiveShadow>
        <boxGeometry args={[3.96, 0.12, 1.96]} />
      </mesh>
      <mesh material={mats.floorPlanks} position={[0, 0.14, 0]} receiveShadow>
        <boxGeometry args={[3.84, 0.04, 1.84]} />
      </mesh>
      <mesh material={mats.timberDark} position={[0, 0.15, 0.92]} castShadow>
        <boxGeometry args={[3.92, 0.06, 0.08]} />
      </mesh>
      <mesh material={mats.timberDark} position={[0, 0.15, -0.92]} castShadow>
        <boxGeometry args={[3.92, 0.06, 0.08]} />
      </mesh>
      <mesh material={mats.timberDark} position={[-1.92, 0.15, 0]} castShadow>
        <boxGeometry args={[0.08, 0.06, 1.92]} />
      </mesh>
      <mesh material={mats.timberDark} position={[1.92, 0.15, 0]} castShadow>
        <boxGeometry args={[0.08, 0.06, 1.92]} />
      </mesh>

      {[-1.85, -0.65, 0.65, 1.85].map((bx) =>
        [-0.88, 0.88].map((bz) => (
          <mesh key={`sp-post-${bx}-${bz}`} material={mats.timberDark} position={[bx, 0.72, bz]} castShadow>
            <boxGeometry args={[0.14, 1.28, 0.14]} />
          </mesh>
        ))
      )}

      <mesh material={mats.timberDark} position={[0, 1.32, 0.88]} castShadow>
        <boxGeometry args={[3.92, 0.1, 0.12]} />
      </mesh>
      <mesh material={mats.timberDark} position={[0, 1.32, -0.88]} castShadow>
        <boxGeometry args={[3.92, 0.1, 0.12]} />
      </mesh>

      <mesh material={mats.timberLogs} position={[0, 0.65, -0.88]} castShadow receiveShadow>
        <boxGeometry args={[3.82, 1.05, 0.08]} />
      </mesh>
      <mesh material={mats.timberLogs} position={[-1.88, 0.65, 0]} castShadow receiveShadow>
        <boxGeometry args={[0.08, 1.05, 1.82]} />
      </mesh>
      <mesh material={mats.timberLogs} position={[1.88, 0.65, 0]} castShadow receiveShadow>
        <boxGeometry args={[0.08, 1.05, 1.82]} />
      </mesh>

      <group position={[-1.15, 0.16, -0.35]}>
        <FirewoodStack position={[0, 0, 0]} />
      </group>

      <group position={[1.15, 0.16, -0.35]}>
        <mesh material={mats.stoneLight} position={[0, 0.12, 0]} castShadow receiveShadow>
          <boxGeometry args={[0.55, 0.24, 0.45]} />
        </mesh>
        <mesh material={mats.stoneMed} position={[-0.05, 0.31, 0.05]} castShadow receiveShadow>
          <boxGeometry args={[0.42, 0.16, 0.35]} />
        </mesh>
        <mesh material={mats.ironHardware} position={[0.14, 0.25, 0.12]} rotation={[0, 0.3, 0]} castShadow>
          <boxGeometry args={[0.04, 0.025, 0.16]} />
        </mesh>
      </group>

      <group position={[-1.15, 0.16, 0.4]}>
        <mesh material={mats.timberPlanks} position={[0, 0.18, 0]} castShadow>
          <boxGeometry args={[0.55, 0.36, 0.45]} />
        </mesh>
        <mesh material={mats.ironHardware} position={[0, 0.18, 0.23]}>
          <boxGeometry args={[0.57, 0.04, 0.02]} />
        </mesh>
        <mesh material={mats.ironHardware} position={[0, 0.28, 0.23]}>
          <boxGeometry args={[0.06, 0.08, 0.02]} />
        </mesh>
      </group>

      <group position={[1.15, 0.16, 0.38]}>
        <TimberBarrel position={[0, 0, 0]} scale={0.9} />
      </group>

      <group position={[0, 0.16, 0.35]}>
        <mesh material={mats.flourSack} position={[-0.2, 0.12, 0]} rotation={[0, 0.2, 0]} castShadow>
          <cylinderGeometry args={[0.13, 0.16, 0.24, 7]} />
        </mesh>
        <mesh material={mats.flourSack} position={[-0.2, 0.25, 0]} castShadow>
          <cylinderGeometry args={[0.06, 0.08, 0.06, 6]} />
        </mesh>

        <mesh material={mats.flourSack} position={[0.2, 0.12, 0.02]} rotation={[0, -0.3, 0]} castShadow>
          <cylinderGeometry args={[0.14, 0.16, 0.24, 7]} />
        </mesh>
        <mesh material={mats.flourSack} position={[0.2, 0.25, 0.02]} castShadow>
          <cylinderGeometry args={[0.06, 0.08, 0.06, 6]} />
        </mesh>

        <mesh material={mats.flourSack} position={[0, 0.26, -0.05]} rotation={[0, 0, Math.PI / 2]} castShadow>
          <cylinderGeometry args={[0.1, 0.11, 0.32, 6]} />
        </mesh>
      </group>

      <group position={[0, 0.16, -0.4]}>
        <mesh material={mats.ironHardware} position={[-0.1, 0.03, 0]} castShadow>
          <boxGeometry args={[0.2, 0.06, 0.12]} />
        </mesh>
        <mesh material={mats.ironHardware} position={[0.1, 0.03, 0]} castShadow>
          <boxGeometry args={[0.2, 0.06, 0.12]} />
        </mesh>
        <mesh material={mats.ironHardware} position={[0, 0.08, 0]} castShadow>
          <boxGeometry args={[0.18, 0.05, 0.1]} />
        </mesh>
      </group>

      <group position={[0, 1.15, 0.92]}>
        <mesh material={isLightOn ? mats.candleGlow : mats.candleUnlit} position={[0, 0, 0]}>
          <cylinderGeometry args={[0.03, 0.04, 0.1, 5]} />
        </mesh>
        {isLightOn && (
          <pointLight color="#fde047" intensity={0.7} distance={2.8} position={[0, 0, 0.1]} />
        )}
      </group>

      <group ref={roofRef}>
        <TriangularGable
          baseWidth={1.82}
          height={0.85}
          thickness={0.12}
          position={[-1.88, 1.32, 0]}
          rotation={[0, -Math.PI / 2, 0]}
          material={mats.timberPlanks}
        />
        <TriangularGable
          baseWidth={1.82}
          height={0.85}
          thickness={0.12}
          position={[1.88, 1.32, 0]}
          rotation={[0, Math.PI / 2, 0]}
          material={mats.timberPlanks}
        />
        <mesh material={mats.thatchRoof} position={[0, 1.74, 0.45]} rotation={[-0.75, 0, 0]} castShadow receiveShadow>
          <boxGeometry args={[3.96, 1.32, 0.14]} />
        </mesh>
        <mesh material={mats.thatchDark} position={[0, 1.32, 0.91]} rotation={[-0.75, 0, 0]}>
          <boxGeometry args={[3.96, 0.12, 0.16]} />
        </mesh>
        <mesh material={mats.thatchRoof} position={[0, 1.74, -0.45]} rotation={[0.75, 0, 0]} castShadow receiveShadow>
          <boxGeometry args={[3.96, 1.32, 0.14]} />
        </mesh>
        <mesh material={mats.thatchDark} position={[0, 1.32, -0.91]} rotation={[0.75, 0, 0]}>
          <boxGeometry args={[3.96, 0.12, 0.16]} />
        </mesh>
        <mesh material={mats.thatchRidge} position={[0, 2.17, 0]} castShadow>
          <boxGeometry args={[3.98, 0.14, 0.14]} />
        </mesh>
      </group>
    </group>
  );
}
