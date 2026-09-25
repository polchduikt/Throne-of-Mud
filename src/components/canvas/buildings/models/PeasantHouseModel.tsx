import type { RefObject } from 'react';
import type * as THREE from 'three';
import { SHARED_BUILDING_MATS } from '../buildingMaterials';
import {
  WallBeams4x2,
  MedievalDoor,
  MedievalWindow,
  TimberBarrel,
  FirewoodStack,
  MedievalBed,
  TriangularGable,
  DetailedChimney,
} from '../common/BuildingPrimitives';

export function PeasantHouseModel({
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

      <mesh material={mats.rugPattern} position={[0, 0.13, -0.15]} receiveShadow>
        <boxGeometry args={[1.4, 0.015, 0.9]} />
      </mesh>

      <mesh material={mats.timberPlanks} position={[0, 0.65, -0.88]} castShadow receiveShadow>
        <boxGeometry args={[3.78, 1.05, 0.12]} />
      </mesh>
      <mesh material={mats.timberPlanks} position={[-1.88, 0.65, 0]} castShadow receiveShadow>
        <boxGeometry args={[0.12, 1.05, 1.78]} />
      </mesh>
      <mesh material={mats.timberPlanks} position={[1.88, 0.65, 0]} castShadow receiveShadow>
        <boxGeometry args={[0.12, 1.05, 1.78]} />
      </mesh>
      <mesh material={mats.timberPlanks} position={[-1.125, 0.65, 0.88]} castShadow receiveShadow>
        <boxGeometry args={[1.51, 1.05, 0.12]} />
      </mesh>
      <mesh material={mats.timberPlanks} position={[1.125, 0.65, 0.88]} castShadow receiveShadow>
        <boxGeometry args={[1.51, 1.05, 0.12]} />
      </mesh>
      <mesh material={mats.timberDark} position={[0, 1.12, 0.88]} castShadow>
        <boxGeometry args={[0.76, 0.12, 0.12]} />
      </mesh>

      <WallBeams4x2 />

      <MedievalDoor position={[0, 0.12, 0.88]} width={0.74} height={1.05} hasCanopy={false} />

      <MedievalWindow position={[-1.125, 0.68, 0.89]} width={0.52} height={0.52} isLightOn={isLightOn} />
      <MedievalWindow position={[1.125, 0.68, 0.89]} width={0.52} height={0.52} isLightOn={isLightOn} />
      <MedievalWindow position={[-1.89, 0.68, 0]} rotation={[0, -Math.PI / 2, 0]} width={0.48} height={0.48} isLightOn={isLightOn} />
      <MedievalWindow position={[1.89, 0.68, 0]} rotation={[0, Math.PI / 2, 0]} width={0.48} height={0.48} isLightOn={isLightOn} />

      <TimberBarrel position={[1.60, 0.05, 1.15]} scale={0.85} />
      <FirewoodStack position={[-1.60, 0.05, 1.15]} rotation={[0, 0, 0]} />

      <MedievalBed position={[-1.25, 0.12, -0.15]} quiltMaterial={mats.bedLinenRed} />
      <MedievalBed position={[1.25, 0.12, -0.15]} quiltMaterial={mats.bedLinenGreen} />

      <group position={[0, 0.05, -0.68]}>
        <mesh material={mats.stoneMed} position={[0, 0.48, -0.06]} castShadow receiveShadow>
          <boxGeometry args={[0.92, 0.94, 0.14]} />
        </mesh>
        <mesh material={mats.stoneMed} position={[-0.42, 0.48, 0.04]} castShadow>
          <boxGeometry args={[0.12, 0.94, 0.14]} />
        </mesh>
        <mesh material={mats.stoneMed} position={[0.42, 0.48, 0.04]} castShadow>
          <boxGeometry args={[0.12, 0.94, 0.14]} />
        </mesh>
        <mesh material={mats.timberDark} position={[0, 0.96, 0.06]} castShadow>
          <boxGeometry args={[1.04, 0.08, 0.22]} />
        </mesh>
        <mesh material={isLightOn ? mats.fireOrange : mats.fireplaceCold} position={[0, 0.20, 0.02]}>
          <dodecahedronGeometry args={[0.14, 0]} />
        </mesh>
        {isLightOn && (
          <pointLight color="#f97316" intensity={1.3} distance={3.8} position={[0, 0.28, 0.08]} />
        )}
      </group>

      <group position={[0, 0.12, 0.18]}>
        <mesh material={mats.timberLight} position={[0, 0.22, 0]} castShadow receiveShadow>
          <boxGeometry args={[0.75, 0.04, 0.48]} />
        </mesh>
        <mesh material={mats.breadCrust} position={[-0.2, 0.26, 0]} castShadow>
          <boxGeometry args={[0.15, 0.08, 0.12]} />
        </mesh>
        <mesh material={mats.ceramicPot} position={[0.2, 0.28, 0]} castShadow>
          <cylinderGeometry args={[0.05, 0.06, 0.12, 6]} />
        </mesh>
        <mesh material={isLightOn ? mats.candleGlow : mats.candleUnlit} position={[0, 0.28, 0]}>
          <cylinderGeometry args={[0.016, 0.02, 0.08, 5]} />
        </mesh>
        {isLightOn && (
          <pointLight color="#fde047" intensity={0.6} distance={2.4} position={[0, 0.35, 0]} />
        )}
        <mesh material={mats.timberDark} position={[-0.5, 0.12, 0]} castShadow>
          <boxGeometry args={[0.18, 0.18, 0.44]} />
        </mesh>
        <mesh material={mats.timberDark} position={[0.5, 0.12, 0]} castShadow>
          <boxGeometry args={[0.18, 0.18, 0.44]} />
        </mesh>
      </group>

      <group ref={roofRef}>
        <TriangularGable
          baseWidth={1.76}
          height={0.94}
          thickness={0.12}
          position={[-1.88, 1.18, 0]}
          rotation={[0, -Math.PI / 2, 0]}
          material={mats.timberPlanks}
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

        {[-1.98, 1.98].map((gx) => (
          <group key={`ph-finial-${gx}`} position={[gx, 2.16, 0]}>
            <mesh material={mats.timberLight} rotation={[0.55, 0, 0]} castShadow>
              <boxGeometry args={[0.06, 0.44, 0.05]} />
            </mesh>
            <mesh material={mats.timberLight} rotation={[-0.55, 0, 0]} castShadow>
              <boxGeometry args={[0.06, 0.44, 0.05]} />
            </mesh>
          </group>
        ))}

        <DetailedChimney
          position={[0, 1.95, -0.42]}
          width={0.42}
          depth={0.42}
          height={1.05}
        />
      </group>
    </group>
  );
}
