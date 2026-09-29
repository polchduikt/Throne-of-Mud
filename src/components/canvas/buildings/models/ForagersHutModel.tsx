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

export function ForagersHutModel({
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

      <mesh material={mats.wattleDaub} position={[-0.45, 0.68, -1.31]} castShadow receiveShadow>
        <boxGeometry args={[2.86, 1.10, 0.12]} />
      </mesh>

      <mesh material={mats.wattleDaub} position={[-1.81, 0.68, 0]} castShadow receiveShadow>
        <boxGeometry args={[0.12, 1.10, 2.76]} />
      </mesh>

      <mesh material={mats.wattleDaub} position={[-1.40, 0.68, 1.31]} castShadow receiveShadow>
        <boxGeometry args={[0.82, 1.10, 0.12]} />
      </mesh>
      <mesh material={mats.wattleDaub} position={[-0.80, 1.12, 1.31]} castShadow receiveShadow>
        <boxGeometry args={[0.72, 0.22, 0.12]} />
      </mesh>
      <mesh material={mats.wattleDaub} position={[0.20, 0.68, 1.31]} castShadow receiveShadow>
        <boxGeometry args={[1.56, 1.10, 0.12]} />
      </mesh>

      {[-1.81, -0.45, 0.98, 1.81].map((px) =>
        [-1.31, 1.31].map((pz) => (
          <mesh
            key={`forage-post-${px}-${pz}`}
            material={mats.timberDark}
            position={[px, 0.68, pz]}
            castShadow
          >
            <boxGeometry args={[0.14, 1.14, 0.14]} />
          </mesh>
        ))
      )}
      <mesh material={mats.timberDark} position={[0, 1.22, 1.31]} castShadow>
        <boxGeometry args={[3.76, 0.08, 0.14]} />
      </mesh>
      <mesh material={mats.timberDark} position={[0, 1.22, -1.31]} castShadow>
        <boxGeometry args={[3.76, 0.08, 0.14]} />
      </mesh>

      <MedievalDoor position={[-0.80, 0.12, 1.31]} width={0.66} height={1.0} />
      <MedievalWindow position={[0.25, 0.68, 1.33]} width={0.48} height={0.48} isLightOn={isLightOn} hasFlowerBox={true} />
      <MedievalWindow position={[-0.45, 0.68, -1.33]} rotation={[0, Math.PI, 0]} width={0.48} height={0.48} isLightOn={isLightOn} hasFlowerBox={false} />

      <MedievalStoneHearth
        position={[-0.45, 0.12, -1.18]}
        isLightOn={isLightOn}
        hasSmoke={true}
        chimneyHeight={2.35}
      />

      <RusticCabinBed
        position={[-1.25, 0.12, -0.40]}
        rotation={[0, 0, 0]}
        blanketMaterial={mats.bedLinenBlue}
      />

      <RusticChest position={[-1.25, 0.12, 0.70]} rotation={[0, 0, 0]} />

      <RusticCabinTable
        position={[-0.10, 0.12, 0.30]}
        hasBenches={true}
        hasFood={true}
      />

      <RusticWallShelf position={[-1.25, 0.95, -1.22]} width={0.75} />

      <group position={[1.40, 0.11, 0]}>

        <group position={[-0.05, 0.04, -0.45]}>
          <mesh material={mats.timberPlanks} position={[0, 0.28, 0]} castShadow receiveShadow>
            <boxGeometry args={[0.68, 0.04, 1.10]} />
          </mesh>
          <mesh material={mats.timberDark} position={[-0.28, 0.13, -0.45]} castShadow>
            <boxGeometry args={[0.05, 0.26, 0.05]} />
          </mesh>
          <mesh material={mats.timberDark} position={[0.28, 0.13, -0.45]} castShadow>
            <boxGeometry args={[0.05, 0.26, 0.05]} />
          </mesh>
          <mesh material={mats.timberDark} position={[-0.28, 0.13, 0.45]} castShadow>
            <boxGeometry args={[0.05, 0.26, 0.05]} />
          </mesh>
          <mesh material={mats.timberDark} position={[0.28, 0.13, 0.45]} castShadow>
            <boxGeometry args={[0.05, 0.26, 0.05]} />
          </mesh>

          <mesh material={mats.stoneDark} position={[-0.15, 0.35, -0.28]} castShadow>
            <cylinderGeometry args={[0.06, 0.045, 0.08, 8]} />
          </mesh>
          <mesh material={mats.timberMed} position={[-0.12, 0.40, -0.28]} rotation={[0.3, 0, 0.2]} castShadow>
            <cylinderGeometry args={[0.014, 0.014, 0.12, 5]} />
          </mesh>

          <mesh material={mats.ceramicPot} position={[0.16, 0.36, -0.32]} castShadow>
            <cylinderGeometry args={[0.04, 0.045, 0.10, 7]} />
          </mesh>
          <mesh material={mats.clayPottery} position={[0.16, 0.34, -0.15]} castShadow>
            <cylinderGeometry args={[0.035, 0.04, 0.08, 7]} />
          </mesh>

          <mesh material={mats.timberLight} position={[-0.05, 0.32, 0.22]} castShadow>
            <boxGeometry args={[0.36, 0.02, 0.32]} />
          </mesh>
          <mesh material={mats.berriesRed} position={[-0.05, 0.36, 0.22]} castShadow>
            <sphereGeometry args={[0.09, 6, 6]} />
          </mesh>
        </group>

        <group position={[-0.05, 0.04, 0.65]}>

          <mesh material={mats.barrelWood} position={[-0.16, 0.12, 0]} castShadow>
            <cylinderGeometry args={[0.14, 0.11, 0.22, 8]} />
          </mesh>
          <mesh material={mats.berriesBlue} position={[-0.16, 0.23, 0]} castShadow>
            <sphereGeometry args={[0.11, 7, 7]} />
          </mesh>

          <mesh material={mats.barrelWood} position={[0.16, 0.10, 0.12]} castShadow>
            <cylinderGeometry args={[0.13, 0.10, 0.20, 8]} />
          </mesh>
          <mesh material={mats.berriesPurple} position={[0.16, 0.20, 0.12]} castShadow>
            <sphereGeometry args={[0.10, 7, 7]} />
          </mesh>

          <mesh material={mats.timberPlanks} position={[0.12, 0.08, -0.32]} castShadow>
            <boxGeometry args={[0.28, 0.14, 0.30]} />
          </mesh>
          <mesh material={mats.antlerBone} position={[0.08, 0.16, -0.32]} castShadow>
            <sphereGeometry args={[0.05, 5, 5]} />
          </mesh>
          <mesh material={mats.redBanner} position={[0.16, 0.18, -0.28]} castShadow>
            <coneGeometry args={[0.05, 0.04, 6]} />
          </mesh>
        </group>

        {[-0.85, -0.40, 0.05, 0.50, 0.95].map((z, idx) => (
          <group key={`herbs-${idx}`} position={[0.25, 1.05, z]}>
            <mesh material={mats.timberDark} position={[0, 0.08, 0]}>
              <cylinderGeometry args={[0.005, 0.005, 0.14, 4]} />
            </mesh>
            <mesh
              material={idx % 2 === 0 ? mats.driedHerbs : mats.flowerRed}
              position={[0, -0.06, 0]}
              castShadow
            >
              <coneGeometry args={[0.055, 0.18, 5]} />
            </mesh>
          </group>
        ))}
      </group>

      <group ref={roofRef}>
        <TriangularGable
          baseWidth={2.76}
          height={1.05}
          thickness={0.14}
          position={[-1.81, 1.23, 0]}
          rotation={[0, Math.PI / 2, 0]}
          material={mats.wattleDaub}
        />
        <TriangularGable
          baseWidth={2.76}
          height={1.05}
          thickness={0.14}
          position={[1.81, 1.23, 0]}
          rotation={[0, -Math.PI / 2, 0]}
          material={mats.timberPlanks}
        />

        <mesh
          material={mats.thatchRoof}
          position={[0, 1.76, -0.80]}
          rotation={[-0.72, 0, 0]}
          castShadow
          receiveShadow
        >
          <boxGeometry args={[3.96, 0.10, 1.95]} />
        </mesh>
        <mesh
          material={mats.thatchRoof}
          position={[0, 1.76, 0.80]}
          rotation={[0.72, 0, 0]}
          castShadow
          receiveShadow
        >
          <boxGeometry args={[3.96, 0.10, 1.95]} />
        </mesh>

        <mesh material={mats.mossGreen} position={[-0.85, 1.81, 0.72]} rotation={[0.72, 0, 0.1]}>
          <boxGeometry args={[0.85, 0.02, 0.85]} />
        </mesh>
        <mesh material={mats.mossGreen} position={[0.65, 1.81, -0.72]} rotation={[-0.72, 0, -0.1]}>
          <boxGeometry args={[0.75, 0.02, 0.75]} />
        </mesh>

        <mesh material={mats.thatchRidge} position={[0, 2.34, 0]} castShadow>
          <boxGeometry args={[4.02, 0.12, 0.20]} />
        </mesh>
      </group>
    </group>
  );
}

