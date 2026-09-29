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
} from '../common/BuildingPrimitives';

export function FishermansHutModel({
  isLightOn = false,
  roofRef,
}: {
  isLightOn?: boolean;
  roofRef?: RefObject<THREE.Group | null>;
}) {
  const mats = SHARED_BUILDING_MATS;

  return (
    <group>

      {[-1.65, -0.55, 0.55, 1.65].map((px) =>
        [-1.15, 0, 1.15].map((pz) => (
          <mesh
            key={`fish-stilt-${px}-${pz}`}
            material={mats.timberDark}
            position={[px, 0.08, pz]}
            castShadow
          >
            <cylinderGeometry args={[0.07, 0.08, 0.22, 6]} />
          </mesh>
        ))
      )}

      <mesh material={mats.floorPlanks} position={[0, 0.16, 0]} receiveShadow castShadow>
        <boxGeometry args={[3.92, 0.06, 2.92]} />
      </mesh>

      <mesh material={mats.timberLogs} position={[-0.45, 0.72, -1.31]} castShadow receiveShadow>
        <boxGeometry args={[2.86, 1.05, 0.14]} />
      </mesh>

      <mesh material={mats.timberLogs} position={[-1.81, 0.72, 0]} castShadow receiveShadow>
        <boxGeometry args={[0.14, 1.05, 2.76]} />
      </mesh>

      <mesh material={mats.timberLogs} position={[-1.40, 0.72, 1.31]} castShadow receiveShadow>
        <boxGeometry args={[0.82, 1.05, 0.14]} />
      </mesh>
      <mesh material={mats.timberLogs} position={[-0.80, 1.14, 1.31]} castShadow receiveShadow>
        <boxGeometry args={[0.72, 0.22, 0.14]} />
      </mesh>
      <mesh material={mats.timberLogs} position={[0.20, 0.72, 1.31]} castShadow receiveShadow>
        <boxGeometry args={[1.56, 1.05, 0.14]} />
      </mesh>

      {[-1.81, -0.45, 0.98, 1.81].map((px) =>
        [-1.31, 1.31].map((pz) => (
          <mesh
            key={`fish-post-${px}-${pz}`}
            material={mats.timberDark}
            position={[px, 0.72, pz]}
            castShadow
          >
            <boxGeometry args={[0.14, 1.12, 0.14]} />
          </mesh>
        ))
      )}
      <mesh material={mats.timberDark} position={[0, 1.25, 1.31]} castShadow>
        <boxGeometry args={[3.76, 0.08, 0.14]} />
      </mesh>
      <mesh material={mats.timberDark} position={[0, 1.25, -1.31]} castShadow>
        <boxGeometry args={[3.76, 0.08, 0.14]} />
      </mesh>

      <MedievalDoor position={[-0.80, 0.19, 1.31]} width={0.66} height={0.96} />
      <MedievalWindow position={[0.25, 0.72, 1.33]} width={0.48} height={0.48} isLightOn={isLightOn} hasFlowerBox={false} />
      <MedievalWindow position={[-0.45, 0.72, -1.33]} rotation={[0, Math.PI, 0]} width={0.48} height={0.48} isLightOn={isLightOn} hasFlowerBox={false} />

      <MedievalStoneHearth
        position={[-0.45, 0.19, -1.18]}
        isLightOn={isLightOn}
        hasSmoke={true}
        chimneyHeight={2.35}
      />

      <RusticCabinBed
        position={[-1.25, 0.19, -0.40]}
        rotation={[0, 0, 0]}
        blanketMaterial={mats.bedLinenBlue}
      />

      <RusticChest position={[-1.25, 0.19, 0.70]} rotation={[0, 0, 0]} />

      <RusticCabinTable
        position={[-0.10, 0.19, 0.30]}
        hasBenches={true}
        hasFood={true}
      />

      <RusticWallShelf position={[-1.25, 1.0, -1.22]} width={0.75} />

      <group position={[1.40, 0.19, 0]}>

        <mesh material={mats.timberDark} position={[0.42, 0.18, 1.15]} castShadow>
          <cylinderGeometry args={[0.06, 0.07, 0.36, 6]} />
        </mesh>
        <mesh material={mats.timberDark} position={[0.42, 0.18, -1.15]} castShadow>
          <cylinderGeometry args={[0.06, 0.07, 0.36, 6]} />
        </mesh>

        <group position={[-0.05, 0, -0.45]}>
          <mesh material={mats.timberDark} position={[-0.25, 0.40, 0]} castShadow>
            <boxGeometry args={[0.04, 0.80, 0.04]} />
          </mesh>
          <mesh material={mats.timberDark} position={[0.25, 0.40, 0]} castShadow>
            <boxGeometry args={[0.04, 0.80, 0.04]} />
          </mesh>
          <mesh material={mats.timberDark} position={[0, 0.72, 0]} castShadow>
            <boxGeometry args={[0.54, 0.03, 0.03]} />
          </mesh>

          {[-0.18, -0.06, 0.06, 0.18].map((fx, i) => (
            <mesh key={`fish-${i}`} material={mats.fishSilver} position={[fx, 0.55, 0]} rotation={[0, 0, 0.1]} castShadow>
              <coneGeometry args={[0.04, 0.22, 5]} />
            </mesh>
          ))}
        </group>

        <group position={[-0.05, 0, 0.55]}>

          <mesh material={mats.barrelWood} position={[0.15, 0.16, 0]} castShadow>
            <cylinderGeometry args={[0.16, 0.13, 0.32, 8]} />
          </mesh>
          <mesh material={mats.fishSilver} position={[0.15, 0.31, 0]} castShadow>
            <cylinderGeometry args={[0.13, 0.13, 0.04, 8]} />
          </mesh>

          <mesh material={mats.clothWhite} position={[-0.20, 0.08, 0]} rotation={[0, 0.4, 0]} castShadow>
            <torusGeometry args={[0.12, 0.04, 6, 12]} />
          </mesh>
        </group>

        <mesh material={mats.timberLight} position={[0.28, 0.55, 0.30]} rotation={[-0.35, 0, 0.15]} castShadow>
          <cylinderGeometry args={[0.010, 0.016, 1.35, 5]} />
        </mesh>
      </group>

      <group ref={roofRef}>
        <TriangularGable
          baseWidth={2.76}
          height={1.05}
          thickness={0.14}
          position={[-1.81, 1.25, 0]}
          rotation={[0, Math.PI / 2, 0]}
          material={mats.timberLogs}
        />
        <TriangularGable
          baseWidth={2.76}
          height={1.05}
          thickness={0.14}
          position={[1.81, 1.25, 0]}
          rotation={[0, -Math.PI / 2, 0]}
          material={mats.timberPlanks}
        />

        <mesh
          material={mats.thatchRoof}
          position={[0, 1.78, -0.80]}
          rotation={[-0.72, 0, 0]}
          castShadow
          receiveShadow
        >
          <boxGeometry args={[3.96, 0.10, 1.95]} />
        </mesh>
        <mesh
          material={mats.thatchRoof}
          position={[0, 1.78, 0.80]}
          rotation={[0.72, 0, 0]}
          castShadow
          receiveShadow
        >
          <boxGeometry args={[3.96, 0.10, 1.95]} />
        </mesh>
        <mesh material={mats.thatchRidge} position={[0, 2.36, 0]} castShadow>
          <boxGeometry args={[4.02, 0.12, 0.20]} />
        </mesh>
      </group>
    </group>
  );
}

