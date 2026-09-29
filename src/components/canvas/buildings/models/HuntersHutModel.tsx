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

export function HuntersHutModel({
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
          <group key={`hunt-notch-${px}-${pz}`} position={[px, 0.68, pz]}>
            <mesh material={mats.timberDark} castShadow>
              <boxGeometry args={[0.18, 1.16, 0.18]} />
            </mesh>
          </group>
        ))
      )}

      <MedievalDoor position={[-0.80, 0.12, 1.31]} width={0.66} height={1.0} />
      <MedievalWindow position={[0.85, 0.68, 1.33]} width={0.48} height={0.48} isLightOn={isLightOn} hasFlowerBox={false} />
      <MedievalWindow position={[0, 0.68, -1.33]} rotation={[0, Math.PI, 0]} width={0.48} height={0.48} isLightOn={isLightOn} hasFlowerBox={false} />

      <group position={[-0.80, 1.28, 1.41]}>

        <mesh material={mats.antlerBone} position={[0, 0, 0]} castShadow>
          <coneGeometry args={[0.045, 0.11, 5]} />
        </mesh>

        <mesh material={mats.antlerBone} position={[-0.10, 0.10, 0]} rotation={[0, 0, 0.6]} castShadow>
          <cylinderGeometry args={[0.014, 0.022, 0.22, 5]} />
        </mesh>
        <mesh material={mats.antlerBone} position={[-0.16, 0.18, 0]} rotation={[0, 0, -0.4]} castShadow>
          <cylinderGeometry args={[0.01, 0.014, 0.12, 4]} />
        </mesh>

        <mesh material={mats.antlerBone} position={[0.10, 0.10, 0]} rotation={[0, 0, -0.6]} castShadow>
          <cylinderGeometry args={[0.014, 0.022, 0.22, 5]} />
        </mesh>
        <mesh material={mats.antlerBone} position={[0.16, 0.18, 0]} rotation={[0, 0, 0.4]} castShadow>
          <cylinderGeometry args={[0.01, 0.014, 0.12, 4]} />
        </mesh>
      </group>

      <MedievalStoneHearth
        position={[0, 0.12, -1.18]}
        isLightOn={isLightOn}
        hasSmoke={true}
        chimneyHeight={2.35}
      />

      <RusticCabinBed
        position={[-1.25, 0.12, -0.40]}
        rotation={[0, 0, 0]}
        blanketMaterial={mats.furPelt}
      />

      <mesh material={mats.furPelt} position={[-0.20, 0.115, -0.20]} rotation={[-Math.PI / 2, 0, 0.2]} receiveShadow>
        <planeGeometry args={[1.10, 0.85]} />
      </mesh>

      <RusticChest position={[-1.25, 0.12, 0.70]} rotation={[0, 0, 0]} />

      <RusticCabinTable
        position={[0.85, 0.12, -0.30]}
        hasBenches={true}
        hasFood={true}
      />

      <RusticWallShelf position={[0.85, 0.95, -1.22]} width={0.80} />

      <group position={[0.22, 0.12, 1.15]} rotation={[0.12, 0, -0.15]}>

        <mesh material={mats.timberDark} position={[0, 0.50, 0]} castShadow>
          <cylinderGeometry args={[0.012, 0.016, 1.05, 6]} />
        </mesh>

        <mesh material={mats.bootsLeather} position={[0.10, 0.35, 0]} castShadow>
          <cylinderGeometry args={[0.05, 0.04, 0.60, 6]} />
        </mesh>

        <mesh material={mats.timberLight} position={[0.20, 0.60, -0.02]} castShadow>
          <cylinderGeometry args={[0.012, 0.014, 1.25, 5]} />
        </mesh>
        <mesh material={mats.ironSteel} position={[0.20, 1.25, -0.02]} castShadow>
          <coneGeometry args={[0.035, 0.16, 4]} />
        </mesh>
      </group>

      <group position={[-1.94, 0.12, 0]} rotation={[0, -Math.PI / 2, 0]}>

        <mesh material={mats.timberDark} position={[-0.45, 0.55, 0]} castShadow>
          <boxGeometry args={[0.05, 1.10, 0.05]} />
        </mesh>
        <mesh material={mats.timberDark} position={[0.45, 0.55, 0]} castShadow>
          <boxGeometry args={[0.05, 1.10, 0.05]} />
        </mesh>
        <mesh material={mats.timberDark} position={[0, 1.05, 0]} castShadow>
          <boxGeometry args={[0.95, 0.05, 0.05]} />
        </mesh>
        <mesh material={mats.timberDark} position={[0, 0.05, 0]} castShadow>
          <boxGeometry args={[0.95, 0.05, 0.05]} />
        </mesh>

        <mesh material={mats.hideTan} position={[0, 0.55, 0.01]} castShadow>
          <boxGeometry args={[0.78, 0.88, 0.02]} />
        </mesh>
      </group>

      <group position={[1.94, 0.12, 0]} rotation={[0, Math.PI / 2, 0]}>

        <mesh material={mats.timberDark} position={[-0.40, 0.45, 0]} castShadow>
          <boxGeometry args={[0.04, 0.90, 0.04]} />
        </mesh>
        <mesh material={mats.timberDark} position={[0.40, 0.45, 0]} castShadow>
          <boxGeometry args={[0.04, 0.90, 0.04]} />
        </mesh>
        <mesh material={mats.timberDark} position={[0, 0.85, 0]} castShadow>
          <boxGeometry args={[0.88, 0.04, 0.04]} />
        </mesh>

        <mesh material={mats.meatRed} position={[-0.24, 0.65, 0.04]} castShadow>
          <cylinderGeometry args={[0.05, 0.07, 0.30, 6]} />
        </mesh>
        <mesh material={mats.meatRed} position={[0, 0.68, 0.04]} castShadow>
          <cylinderGeometry args={[0.04, 0.06, 0.24, 6]} />
        </mesh>
        <mesh material={mats.meatRed} position={[0.24, 0.62, 0.04]} castShadow>
          <cylinderGeometry args={[0.055, 0.075, 0.32, 6]} />
        </mesh>
      </group>

      <FirewoodStack position={[1.45, 0.12, 1.45]} rotation={[0, 0, 0]} />

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

        {[-1.81, 1.81].map((gx) => (
          <group key={`hunt-finial-${gx}`} position={[gx, 2.42, 0]}>
            <mesh material={mats.timberDark} rotation={[0.45, 0, 0]} castShadow>
              <boxGeometry args={[0.06, 0.40, 0.05]} />
            </mesh>
            <mesh material={mats.timberDark} rotation={[-0.45, 0, 0]} castShadow>
              <boxGeometry args={[0.06, 0.40, 0.05]} />
            </mesh>
          </group>
        ))}
      </group>
    </group>
  );
}

