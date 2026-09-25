import type { RefObject } from 'react';
import type * as THREE from 'three';
import { SHARED_BUILDING_MATS } from '../buildingMaterials';
import { TimberBarrel, TriangularGable } from '../common/BuildingPrimitives';

export function TentModel({
  isLightOn = false,
  roofRef,
}: {
  isLightOn?: boolean;
  roofRef?: RefObject<THREE.Group | null>;
}) {
  const mats = SHARED_BUILDING_MATS;

  return (
    <group>
      <mesh material={mats.richSoil} position={[0, 0.02, 0]} receiveShadow>
        <boxGeometry args={[2.92, 0.04, 1.92]} />
      </mesh>
      <mesh material={mats.goldWheat} position={[0, 0.04, 0]} receiveShadow>
        <boxGeometry args={[2.7, 0.04, 1.7]} />
      </mesh>

      <mesh material={mats.timberDark} position={[-1.35, 0.08, 0]} castShadow>
        <boxGeometry args={[0.08, 0.08, 1.8]} />
      </mesh>
      <mesh material={mats.timberDark} position={[1.35, 0.08, 0]} castShadow>
        <boxGeometry args={[0.08, 0.08, 1.8]} />
      </mesh>

      <group position={[0.55, 0, 0]}>
        <mesh material={mats.timberDark} position={[0, 0.012, 0]} castShadow>
          <boxGeometry args={[0.68, 0.024, 1.20]} />
        </mesh>
        <mesh material={mats.bedStraw} position={[0, 0.022, 0]} receiveShadow>
          <boxGeometry args={[0.62, 0.018, 1.12]} />
        </mesh>
        <mesh material={mats.pillowWhite} position={[0, 0.032, -0.42]}>
          <boxGeometry args={[0.46, 0.016, 0.22]} />
        </mesh>
        <mesh material={mats.bedLinenGreen} position={[0, 0.028, 0.12]} castShadow>
          <boxGeometry args={[0.63, 0.018, 0.78]} />
        </mesh>
      </group>

      <group position={[-0.75, 0, -0.25]}>
        <mesh material={mats.timberMed} position={[0, 0.15, 0]} castShadow receiveShadow>
          <boxGeometry args={[0.48, 0.24, 0.52]} />
        </mesh>
        <mesh material={mats.goldTrim} position={[0, 0.18, 0.27]}>
          <boxGeometry args={[0.1, 0.06, 0.02]} />
        </mesh>
        <mesh material={mats.timberDark} position={[0, 0.28, 0]}>
          <boxGeometry args={[0.52, 0.04, 0.56]} />
        </mesh>
      </group>

      <TimberBarrel position={[-0.75, 0, -0.6]} scale={0.75} />

      <group position={[-0.75, 0, 0.4]}>
        <mesh material={mats.timberDark} position={[0, 0.14, 0]} castShadow>
          <cylinderGeometry args={[0.12, 0.14, 0.26, 6]} />
        </mesh>
        <mesh material={isLightOn ? mats.candleGlow : mats.candleUnlit} position={[0, 0.32, 0]}>
          <cylinderGeometry args={[0.018, 0.022, 0.09, 5]} />
        </mesh>
        {isLightOn && (
          <pointLight color="#fde047" intensity={0.7} distance={2.8} position={[0, 0.42, 0]} />
        )}
      </group>

      <group ref={roofRef}>
        <mesh material={mats.timberDark} position={[0, 1.45, 0]} castShadow>
          <boxGeometry args={[0.1, 0.1, 2.05]} />
        </mesh>

        {[-0.9, 0.9].map((pz) => (
          <group key={`tent-frame-${pz}`} position={[0, 0, pz]}>
            <mesh material={mats.timberDark} position={[-0.72, 0.72, 0]} rotation={[0, 0, -0.78]} castShadow>
              <cylinderGeometry args={[0.04, 0.05, 2.0, 5]} />
            </mesh>
            <mesh material={mats.timberDark} position={[0.72, 0.72, 0]} rotation={[0, 0, 0.78]} castShadow>
              <cylinderGeometry args={[0.04, 0.05, 2.0, 5]} />
            </mesh>
          </group>
        ))}

        <mesh material={mats.tentFabric} position={[-0.78, 0.74, 0]} rotation={[0, 0, -0.78]} castShadow receiveShadow>
          <boxGeometry args={[0.04, 2.05, 1.95]} />
        </mesh>

        <mesh material={mats.tentFabric} position={[0.78, 0.74, 0]} rotation={[0, 0, 0.78]} castShadow receiveShadow>
          <boxGeometry args={[0.04, 2.05, 1.95]} />
        </mesh>

        <mesh material={mats.thatchRidge} position={[0, 1.48, 0]} castShadow>
          <boxGeometry args={[0.16, 0.12, 2.1]} />
        </mesh>

        <TriangularGable
          baseWidth={2.4}
          height={1.38}
          thickness={0.06}
          position={[0, 0.06, -0.94]}
          material={mats.tentFabric}
        />

        <group position={[0, 1.32, 0.92]}>
          <mesh material={mats.tentFabric} rotation={[0, 0, Math.PI / 2]} castShadow>
            <cylinderGeometry args={[0.08, 0.08, 0.85, 6]} />
          </mesh>
          <mesh material={mats.bootsLeather} position={[-0.3, 0, 0]}>
            <cylinderGeometry args={[0.085, 0.085, 0.04, 6]} />
          </mesh>
          <mesh material={mats.bootsLeather} position={[0.3, 0, 0]}>
            <cylinderGeometry args={[0.085, 0.085, 0.04, 6]} />
          </mesh>
        </group>

        {[
          [-1.4, -0.95],
          [1.4, -0.95],
          [-1.4, 0.95],
          [1.4, 0.95],
        ].map(([px, pz], idx) => (
          <group key={`tent-peg-${idx}`} position={[px, 0.04, pz]}>
            <mesh material={mats.timberDark} rotation={[0.2, 0, px > 0 ? -0.3 : 0.3]} castShadow>
              <cylinderGeometry args={[0.02, 0.01, 0.2, 4]} />
            </mesh>
          </group>
        ))}
      </group>
    </group>
  );
}
