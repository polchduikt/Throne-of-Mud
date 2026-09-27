import type { RefObject } from 'react';
import type * as THREE from 'three';
import { SHARED_BUILDING_MATS } from '../buildingMaterials';
import {
  MedievalDoor,
  MedievalWindow,
  TriangularGable,
  MedievalStoneHearth,
  RusticCabinBed,
  RusticCabinTable,
  RusticWallShelf,
  RusticChest,
  FirewoodStack,
} from '../common/BuildingPrimitives';

export function ForestersHutModel({
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
        <boxGeometry args={[3.92, 0.10, 2.92]} />
      </mesh>
      <mesh material={mats.floorPlanks} position={[0, 0.11, 0]} receiveShadow>
        <boxGeometry args={[3.76, 0.04, 2.76]} />
      </mesh>

      <mesh material={mats.timberLogs} position={[0, 0.68, -1.31]} castShadow receiveShadow>
        <boxGeometry args={[3.76, 1.10, 0.14]} />
      </mesh>

      <mesh material={mats.timberLogs} position={[-1.81, 0.68, 0]} castShadow receiveShadow>
        <boxGeometry args={[0.14, 1.10, 2.76]} />
      </mesh>

      <mesh material={mats.timberLogs} position={[1.81, 0.68, 0]} castShadow receiveShadow>
        <boxGeometry args={[0.14, 1.10, 2.76]} />
      </mesh>

      <mesh material={mats.timberLogs} position={[-1.40, 0.68, 1.31]} castShadow receiveShadow>
        <boxGeometry args={[0.82, 1.10, 0.14]} />
      </mesh>

      <mesh material={mats.timberLogs} position={[-0.80, 1.12, 1.31]} castShadow receiveShadow>
        <boxGeometry args={[0.72, 0.22, 0.14]} />
      </mesh>

      <mesh material={mats.timberLogs} position={[0.60, 0.68, 1.31]} castShadow receiveShadow>
        <boxGeometry args={[2.28, 1.10, 0.14]} />
      </mesh>

      {[-1.84, 1.84].map((px) =>
        [-1.34, 1.34].map((pz) => (
          <group key={`for-notch-${px}-${pz}`} position={[px, 0.68, pz]}>
            <mesh material={mats.timberDark} castShadow>
              <boxGeometry args={[0.18, 1.16, 0.18]} />
            </mesh>
          </group>
        ))
      )}

      <MedievalDoor position={[-0.80, 0.12, 1.31]} width={0.66} height={1.0} />
      <MedievalWindow position={[0.85, 0.68, 1.33]} width={0.48} height={0.48} isLightOn={isLightOn} hasFlowerBox={true} />
      <MedievalWindow position={[0, 0.68, -1.33]} rotation={[0, Math.PI, 0]} width={0.48} height={0.48} isLightOn={isLightOn} hasFlowerBox={false} />

      <MedievalStoneHearth
        position={[0, 0.12, -1.18]}
        isLightOn={isLightOn}
        hasSmoke={true}
        chimneyHeight={2.35}
      />

      <RusticCabinBed
        position={[-1.25, 0.12, -0.40]}
        rotation={[0, 0, 0]}
        blanketMaterial={mats.bedLinenGreen}
      />

      <RusticChest position={[-1.25, 0.12, 0.70]} rotation={[0, 0, 0]} />

      <RusticCabinTable
        position={[0.85, 0.12, -0.30]}
        hasBenches={true}
        hasFood={true}
      />

      <RusticWallShelf position={[0.85, 0.95, -1.22]} width={0.80} />

      <group position={[1.25, 0.12, 0.75]}>

        <mesh material={mats.timberPlanks} position={[0, 0.20, 0]} castShadow receiveShadow>
          <boxGeometry args={[0.85, 0.40, 0.65]} />
        </mesh>
        <mesh material={mats.richSoil} position={[0, 0.41, 0]} castShadow>
          <boxGeometry args={[0.78, 0.04, 0.58]} />
        </mesh>

        {[-0.24, 0, 0.24].map((x, idx) => (
          <group key={`sapling-${idx}`} position={[x, 0.45, (idx % 2 === 0 ? 0.12 : -0.12)]}>
            <mesh material={mats.timberDark} position={[0, 0.04, 0]}>
              <cylinderGeometry args={[0.012, 0.015, 0.10, 5]} />
            </mesh>
            <mesh material={mats.leafGreen} position={[0, 0.14, 0]} castShadow>
              <coneGeometry args={[0.08, 0.18, 6]} />
            </mesh>
          </group>
        ))}

        <group position={[0.26, 0.45, 0.16]}>
          <mesh material={mats.clayPottery} position={[0, 0.04, 0]} castShadow>
            <cylinderGeometry args={[0.04, 0.03, 0.08, 6]} />
          </mesh>
          <mesh material={mats.leafGreen} position={[0, 0.11, 0]} castShadow>
            <sphereGeometry args={[0.05, 5, 5]} />
          </mesh>
        </group>
      </group>

      <group position={[-1.25, 0.12, 1.85]}>

        <mesh material={mats.timberLogs} position={[0, 0.18, 0]} castShadow receiveShadow>
          <cylinderGeometry args={[0.22, 0.26, 0.36, 8]} />
        </mesh>

        <mesh material={mats.timberLight} position={[0.04, 0.45, 0]} rotation={[0.2, 0, -0.4]} castShadow>
          <cylinderGeometry args={[0.015, 0.015, 0.55, 5]} />
        </mesh>
        <mesh material={mats.ironSteel} position={[0.18, 0.36, 0]} rotation={[0.2, 0, -0.4]} castShadow>
          <boxGeometry args={[0.08, 0.14, 0.03]} />
        </mesh>
      </group>

      <FirewoodStack position={[-1.92, 0.12, 0]} rotation={[0, Math.PI / 2, 0]} />

      <group position={[-1.89, 0.85, 0.4]} rotation={[0, -Math.PI / 2, 0]}>
        <mesh material={mats.sawBlade} castShadow>
          <boxGeometry args={[1.10, 0.08, 0.015]} />
        </mesh>
        <mesh material={mats.timberDark} position={[-0.52, 0.04, 0]} castShadow>
          <cylinderGeometry args={[0.02, 0.02, 0.16, 5]} />
        </mesh>
        <mesh material={mats.timberDark} position={[0.52, 0.04, 0]} castShadow>
          <cylinderGeometry args={[0.02, 0.02, 0.16, 5]} />
        </mesh>
      </group>

      <group ref={roofRef}>
        <TriangularGable
          baseWidth={2.76}
          height={1.05}
          thickness={0.14}
          position={[-1.81, 1.23, 0]}
          rotation={[0, Math.PI / 2, 0]}
          material={mats.timberLogs}
        />
        <TriangularGable
          baseWidth={2.76}
          height={1.05}
          thickness={0.14}
          position={[1.81, 1.23, 0]}
          rotation={[0, -Math.PI / 2, 0]}
          material={mats.timberLogs}
        />

        <mesh
          material={mats.thatchDark}
          position={[0, 1.76, -0.80]}
          rotation={[-0.72, 0, 0]}
          castShadow
          receiveShadow
        >
          <boxGeometry args={[3.96, 0.10, 1.95]} />
        </mesh>
        <mesh
          material={mats.thatchDark}
          position={[0, 1.76, 0.80]}
          rotation={[0.72, 0, 0]}
          castShadow
          receiveShadow
        >
          <boxGeometry args={[3.96, 0.10, 1.95]} />
        </mesh>
        <mesh material={mats.thatchRidge} position={[0, 2.34, 0]} castShadow>
          <boxGeometry args={[4.02, 0.12, 0.20]} />
        </mesh>
      </group>

      {isLightOn && (
        <pointLight color="#fde047" intensity={0.9} distance={4.5} position={[0, 0.9, 0]} />
      )}
    </group>
  );
}

