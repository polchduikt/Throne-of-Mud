import type { RefObject } from 'react';
import type * as THREE from 'three';
import { SHARED_BUILDING_MATS } from '../buildingMaterials';
import {
  MedievalDoor,
  MedievalWindow,
  TriangularGable,
  MedievalStoneHearth,
  RusticWallShelf,
} from '../common/BuildingPrimitives';

export function WeaversWorkshopModel({
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

      <mesh material={mats.plaster} position={[0, 0.68, -1.31]} castShadow receiveShadow>
        <boxGeometry args={[3.76, 1.10, 0.12]} />
      </mesh>

      <mesh material={mats.plaster} position={[-1.81, 0.68, 0]} castShadow receiveShadow>
        <boxGeometry args={[0.12, 1.10, 2.76]} />
      </mesh>

      <mesh material={mats.plaster} position={[1.81, 0.68, 0]} castShadow receiveShadow>
        <boxGeometry args={[0.12, 1.10, 2.76]} />
      </mesh>

      <mesh material={mats.plaster} position={[-0.85, 0.68, 1.31]} castShadow receiveShadow>
        <boxGeometry args={[1.92, 1.10, 0.12]} />
      </mesh>

      <mesh material={mats.timberDark} position={[0.50, 1.12, 1.31]} castShadow receiveShadow>
        <boxGeometry args={[0.78, 0.22, 0.14]} />
      </mesh>

      <mesh material={mats.plaster} position={[1.40, 0.68, 1.31]} castShadow receiveShadow>
        <boxGeometry args={[0.82, 1.10, 0.12]} />
      </mesh>

      {[-1.81, 1.81].map((px) =>
        [-1.31, 1.31].map((pz) => (
          <mesh
            key={`weave-post-${px}-${pz}`}
            material={mats.timberDark}
            position={[px, 0.68, pz]}
            castShadow
          >
            <boxGeometry args={[0.14, 1.14, 0.14]} />
          </mesh>
        ))
      )}

      <MedievalDoor position={[0.50, 0.12, 1.31]} width={0.70} height={1.0} />
      <MedievalWindow position={[-0.85, 0.68, 1.33]} width={0.52} height={0.52} isLightOn={isLightOn} hasFlowerBox={true} />
      <MedievalWindow position={[0, 0.68, -1.33]} rotation={[0, Math.PI, 0]} width={0.52} height={0.52} isLightOn={isLightOn} hasFlowerBox={false} />

      <MedievalStoneHearth
        position={[0, 0.12, -1.18]}
        isLightOn={isLightOn}
        hasSmoke={true}
        chimneyHeight={2.35}
      />

      <group position={[-1.05, 0.12, -0.20]}>

        {[-0.42, 0.42].map((lx) =>
          [-0.45, 0.45].map((lz) => (
            <mesh key={`loom-post-${lx}-${lz}`} material={mats.timberDark} position={[lx, 0.55, lz]} castShadow>
              <boxGeometry args={[0.06, 1.10, 0.06]} />
            </mesh>
          ))
        )}

        <mesh material={mats.timberDark} position={[-0.42, 1.05, 0]} castShadow>
          <boxGeometry args={[0.06, 0.06, 0.96]} />
        </mesh>
        <mesh material={mats.timberDark} position={[0.42, 1.05, 0]} castShadow>
          <boxGeometry args={[0.06, 0.06, 0.96]} />
        </mesh>

        <mesh material={mats.timberLight} position={[0, 1.05, -0.42]} rotation={[0, 0, Math.PI / 2]} castShadow>
          <cylinderGeometry args={[0.04, 0.04, 0.82, 6]} />
        </mesh>
        <mesh material={mats.timberLight} position={[0, 0.35, 0.42]} rotation={[0, 0, Math.PI / 2]} castShadow>
          <cylinderGeometry args={[0.05, 0.05, 0.82, 6]} />
        </mesh>

        <mesh material={mats.clothCrimson} position={[0, 0.70, 0]} rotation={[0.25, 0, 0]} castShadow>
          <boxGeometry args={[0.76, 0.65, 0.015]} />
        </mesh>
        <mesh material={mats.clothRoyalBlue} position={[0, 0.42, 0.28]} rotation={[0.5, 0, 0]} castShadow>
          <boxGeometry args={[0.76, 0.32, 0.015]} />
        </mesh>

        <mesh material={mats.timberLight} position={[0.15, 0.65, 0.08]} rotation={[0, 0.3, 0.2]} castShadow>
          <boxGeometry args={[0.24, 0.03, 0.06]} />
        </mesh>

        <mesh material={mats.timberDark} position={[0, 0.16, 0.65]} castShadow>
          <boxGeometry args={[0.55, 0.04, 0.24]} />
        </mesh>
        <mesh material={mats.timberDark} position={[-0.20, 0.08, 0.65]} castShadow>
          <boxGeometry args={[0.04, 0.16, 0.20]} />
        </mesh>
        <mesh material={mats.timberDark} position={[0.20, 0.08, 0.65]} castShadow>
          <boxGeometry args={[0.04, 0.16, 0.20]} />
        </mesh>
      </group>

      <group position={[0.95, 0.12, -0.30]} rotation={[0, -0.5, 0]}>

        <mesh material={mats.timberDark} position={[0, 0.26, 0]} rotation={[0, 0, 0.15]} castShadow>
          <boxGeometry args={[0.65, 0.04, 0.24]} />
        </mesh>

        <mesh material={mats.timberDark} position={[-0.25, 0.12, 0]} rotation={[0, 0, 0.2]} castShadow>
          <cylinderGeometry args={[0.015, 0.02, 0.28, 5]} />
        </mesh>
        <mesh material={mats.timberDark} position={[0.22, 0.14, -0.08]} rotation={[-0.15, 0, -0.2]} castShadow>
          <cylinderGeometry args={[0.015, 0.02, 0.32, 5]} />
        </mesh>
        <mesh material={mats.timberDark} position={[0.22, 0.14, 0.08]} rotation={[0.15, 0, -0.2]} castShadow>
          <cylinderGeometry args={[0.015, 0.02, 0.32, 5]} />
        </mesh>

        <group position={[0.20, 0.52, 0]}>
          <mesh material={mats.timberDark} rotation={[Math.PI / 2, 0, 0]} castShadow>
            <torusGeometry args={[0.22, 0.018, 6, 16]} />
          </mesh>
          <mesh material={mats.timberDark} rotation={[Math.PI / 2, 0, 0]} castShadow>
            <cylinderGeometry args={[0.01, 0.01, 0.44, 4]} />
          </mesh>
          <mesh material={mats.timberDark} rotation={[0, 0, Math.PI / 2]} castShadow>
            <cylinderGeometry args={[0.01, 0.01, 0.44, 4]} />
          </mesh>
        </group>

        <mesh material={mats.timberLight} position={[-0.22, 0.58, 0]} castShadow>
          <cylinderGeometry args={[0.012, 0.015, 0.65, 5]} />
        </mesh>
        <mesh material={mats.rawWool} position={[-0.22, 0.78, 0]} castShadow>
          <dodecahedronGeometry args={[0.12, 0]} />
        </mesh>
      </group>

      <group position={[1.55, 0.12, 0.45]} rotation={[0, -Math.PI / 2, 0]}>
        <mesh material={mats.timberPlanks} position={[0, 0.50, 0]} castShadow receiveShadow>
          <boxGeometry args={[1.05, 1.0, 0.42]} />
        </mesh>

        <mesh material={mats.clothRoyalBlue} position={[0, 0.30, 0.06]} castShadow>
          <boxGeometry args={[0.85, 0.14, 0.28]} />
        </mesh>
        <mesh material={mats.clothGold} position={[-0.05, 0.50, 0.06]} castShadow>
          <boxGeometry args={[0.75, 0.14, 0.26]} />
        </mesh>
        <mesh material={mats.clothEmerald} position={[0.05, 0.70, 0.06]} castShadow>
          <boxGeometry args={[0.78, 0.14, 0.26]} />
        </mesh>
        <mesh material={mats.clothCrimson} position={[0, 0.88, 0.06]} castShadow>
          <boxGeometry args={[0.82, 0.12, 0.24]} />
        </mesh>
      </group>

      <RusticWallShelf position={[-0.85, 0.95, -1.22]} width={0.85} />

      <group position={[-1.94, 0.12, 0]} rotation={[0, -Math.PI / 2, 0]}>

        <mesh material={mats.timberDark} position={[-0.65, 0.65, 0]} castShadow>
          <cylinderGeometry args={[0.03, 0.04, 1.30, 5]} />
        </mesh>
        <mesh material={mats.timberDark} position={[0.65, 0.65, 0]} castShadow>
          <cylinderGeometry args={[0.03, 0.04, 1.30, 5]} />
        </mesh>
        <mesh material={mats.timberDark} position={[0, 1.25, 0]} rotation={[0, 0, Math.PI / 2]} castShadow>
          <cylinderGeometry args={[0.025, 0.025, 1.45, 5]} />
        </mesh>

        <mesh material={mats.clothRoyalBlue} position={[-0.35, 0.70, 0.02]} castShadow>
          <boxGeometry args={[0.55, 0.95, 0.015]} />
        </mesh>
        <mesh material={mats.clothCrimson} position={[0.35, 0.65, 0.02]} castShadow>
          <boxGeometry args={[0.55, 1.05, 0.015]} />
        </mesh>

        <group position={[0, 0, 0.55]}>
          <mesh material={mats.stoneDark} position={[0, 0.08, 0]} castShadow>
            <cylinderGeometry args={[0.26, 0.30, 0.16, 8]} />
          </mesh>
          <mesh material={mats.copperBronze} position={[0, 0.28, 0]} castShadow>
            <cylinderGeometry args={[0.24, 0.20, 0.32, 8]} />
          </mesh>
          <mesh material={mats.clothEmerald} position={[0, 0.40, 0]}>
            <circleGeometry args={[0.21, 8]} />
          </mesh>
        </group>
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
          material={mats.wattleDaub}
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

