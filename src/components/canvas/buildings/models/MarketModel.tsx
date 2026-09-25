import type { RefObject } from 'react';
import type * as THREE from 'three';
import { SHARED_BUILDING_MATS } from '../buildingMaterials';
import { TimberBarrel } from '../common/BuildingPrimitives';

export function MarketModel({
  roofRef,
}: {
  roofRef?: RefObject<THREE.Group | null>;
}) {
  const mats = SHARED_BUILDING_MATS;

  return (
    <group>
      <mesh visible={false} position={[0, 0.9, 0]}>
        <boxGeometry args={[3.96, 1.8, 1.96]} />
        <meshBasicMaterial transparent opacity={0} />
      </mesh>
      <mesh material={mats.stoneDark} position={[0, 0.05, 0]} castShadow receiveShadow>
        <boxGeometry args={[3.96, 0.1, 1.96]} />
      </mesh>
      <mesh material={mats.floorPlanks} position={[0, 0.13, 0]} receiveShadow>
        <boxGeometry args={[3.92, 0.06, 1.92]} />
      </mesh>
      <mesh material={mats.timberDark} position={[0, 0.15, 0.94]} castShadow>
        <boxGeometry args={[3.96, 0.08, 0.08]} />
      </mesh>
      <mesh material={mats.timberDark} position={[0, 0.15, -0.94]} castShadow>
        <boxGeometry args={[3.96, 0.08, 0.08]} />
      </mesh>
      <mesh material={mats.timberDark} position={[-1.94, 0.15, 0]} castShadow>
        <boxGeometry args={[0.08, 0.08, 1.96]} />
      </mesh>
      <mesh material={mats.timberDark} position={[1.94, 0.15, 0]} castShadow>
        <boxGeometry args={[0.08, 0.08, 1.96]} />
      </mesh>

      {[-1.6, 0, 1.6].map((cx) =>
        [-0.75, 0.75].map((cz, idx) => (
          <group key={`mkt-post-${cx}-${cz}-${idx}`} position={[cx, 0.82, cz]}>
            <mesh material={mats.timberDark} castShadow>
              <cylinderGeometry args={[0.06, 0.08, 1.45, 6]} />
            </mesh>
            <mesh material={mats.timberMed} position={[0, 0.58, 0]} rotation={[0.4, 0, 0]} castShadow>
              <boxGeometry args={[0.06, 0.35, 0.06]} />
            </mesh>
          </group>
        ))
      )}

      <group position={[-0.9, 0.16, 0]}>
        {[-0.52, 0.52].map((lx) =>
          [-0.18, 0.18].map((lz) => (
            <mesh key={`mkt-lleg-${lx}-${lz}`} material={mats.timberDark} position={[lx, 0.14, lz]} castShadow>
              <cylinderGeometry args={[0.03, 0.035, 0.28, 6]} />
            </mesh>
          ))
        )}
        <mesh material={mats.timberPlanks} position={[0, 0.06, 0]} castShadow receiveShadow>
          <boxGeometry args={[1.06, 0.02, 0.36]} />
        </mesh>
        <mesh material={mats.flourSack} position={[-0.28, 0.13, 0]} rotation={[0, 0.3, 0]} castShadow>
          <cylinderGeometry args={[0.09, 0.11, 0.14, 6]} />
        </mesh>
        <mesh material={mats.flourSack} position={[-0.24, 0.21, 0]} rotation={[0, -0.2, 0]} castShadow>
          <cylinderGeometry args={[0.08, 0.1, 0.12, 6]} />
        </mesh>
        <mesh material={mats.timberDark} position={[0.28, 0.12, 0]} castShadow>
          <boxGeometry args={[0.3, 0.12, 0.24]} />
        </mesh>

        <mesh material={mats.timberPlanks} position={[0, 0.28, 0]} castShadow receiveShadow>
          <boxGeometry args={[1.18, 0.04, 0.46]} />
        </mesh>
        <mesh material={mats.redBanner} position={[0, 0.18, 0.23]} castShadow>
          <boxGeometry args={[0.56, 0.18, 0.02]} />
        </mesh>
        <mesh material={mats.goldTrim} position={[0, 0.27, 0.235]}>
          <boxGeometry args={[0.58, 0.02, 0.015]} />
        </mesh>

        <group position={[-0.34, 0.3, 0.02]}>
          <mesh material={mats.timberDark} position={[0, 0.04, 0]} castShadow>
            <boxGeometry args={[0.32, 0.08, 0.24]} />
          </mesh>
          <mesh material={mats.flowerRed} position={[-0.06, 0.07, 0.04]} castShadow>
            <sphereGeometry args={[0.032, 6, 6]} />
          </mesh>
          <mesh material={mats.flowerRed} position={[0.04, 0.07, 0.04]} castShadow>
            <sphereGeometry args={[0.032, 6, 6]} />
          </mesh>
          <mesh material={mats.flowerRed} position={[-0.03, 0.07, -0.04]} castShadow>
            <sphereGeometry args={[0.032, 6, 6]} />
          </mesh>
          <mesh material={mats.flowerRed} position={[0.06, 0.07, -0.03]} castShadow>
            <sphereGeometry args={[0.032, 6, 6]} />
          </mesh>
          <mesh material={mats.flowerRed} position={[0.01, 0.11, 0]} castShadow>
            <sphereGeometry args={[0.032, 6, 6]} />
          </mesh>
        </group>

        <mesh material={mats.breadCrust} position={[0.04, 0.33, -0.06]} castShadow>
          <cylinderGeometry args={[0.065, 0.075, 0.055, 8]} />
        </mesh>
        <mesh material={mats.breadCrust} position={[0.06, 0.32, 0.09]} rotation={[Math.PI / 2, 0, 0.3]} castShadow>
          <cylinderGeometry args={[0.028, 0.032, 0.26, 6]} />
        </mesh>
        <mesh material={mats.breadCrust} position={[-0.07, 0.32, 0.08]} castShadow>
          <sphereGeometry args={[0.032, 6, 6]} />
        </mesh>

        <mesh material={mats.flowerYellow} position={[0.36, 0.33, -0.05]} castShadow>
          <cylinderGeometry args={[0.06, 0.065, 0.05, 8]} />
        </mesh>
        <mesh material={mats.flowerYellow} position={[0.4, 0.32, 0.09]} castShadow>
          <cylinderGeometry args={[0.03, 0.03, 0.04, 3]} />
        </mesh>

        <mesh material={mats.ceramicPot} position={[-0.46, 0.35, -0.12]} castShadow>
          <cylinderGeometry args={[0.045, 0.035, 0.09, 8]} />
        </mesh>
      </group>

      <group position={[0.9, 0.16, 0]}>
        {[-0.52, 0.52].map((lx) =>
          [-0.18, 0.18].map((lz) => (
            <mesh key={`mkt-rleg-${lx}-${lz}`} material={mats.timberDark} position={[lx, 0.14, lz]} castShadow>
              <cylinderGeometry args={[0.03, 0.035, 0.28, 6]} />
            </mesh>
          ))
        )}
        <mesh material={mats.timberPlanks} position={[0, 0.06, 0]} castShadow receiveShadow>
          <boxGeometry args={[1.06, 0.02, 0.36]} />
        </mesh>
        <mesh material={mats.timberDark} position={[-0.26, 0.13, 0]} castShadow>
          <boxGeometry args={[0.26, 0.14, 0.2]} />
        </mesh>
        <mesh material={mats.ironHardware} position={[-0.26, 0.13, 0.105]}>
          <boxGeometry args={[0.04, 0.06, 0.02]} />
        </mesh>
        <mesh material={mats.pillowWhite} position={[0.26, 0.1, 0]} rotation={[0, 0, Math.PI / 2]} castShadow>
          <cylinderGeometry args={[0.04, 0.04, 0.24, 6]} />
        </mesh>

        <mesh material={mats.timberPlanks} position={[0, 0.28, 0]} castShadow receiveShadow>
          <boxGeometry args={[1.18, 0.04, 0.46]} />
        </mesh>
        <mesh material={mats.awningGreen} position={[0, 0.18, 0.23]} castShadow>
          <boxGeometry args={[0.56, 0.18, 0.02]} />
        </mesh>
        <mesh material={mats.goldTrim} position={[0, 0.27, 0.235]}>
          <boxGeometry args={[0.58, 0.02, 0.015]} />
        </mesh>

        <group position={[-0.32, 0.3, 0]}>
          <mesh material={mats.goldTrim} position={[0, 0.01, 0]} castShadow>
            <cylinderGeometry args={[0.04, 0.045, 0.02, 8]} />
          </mesh>
          <mesh material={mats.goldTrim} position={[0, 0.09, 0]} castShadow>
            <cylinderGeometry args={[0.008, 0.012, 0.16, 6]} />
          </mesh>
          <mesh material={mats.goldTrim} position={[0, 0.16, 0]} rotation={[0, 0, 0.08]} castShadow>
            <boxGeometry args={[0.18, 0.01, 0.01]} />
          </mesh>
          <mesh material={mats.goldTrim} position={[-0.08, 0.09, 0]} castShadow>
            <cylinderGeometry args={[0.03, 0.03, 0.006, 8]} />
          </mesh>
          <mesh material={mats.goldTrim} position={[0.08, 0.1, 0]} castShadow>
            <cylinderGeometry args={[0.03, 0.03, 0.006, 8]} />
          </mesh>
        </group>

        <mesh material={mats.flourSack} position={[-0.08, 0.31, 0.06]} rotation={[0, 0.2, 0]} castShadow>
          <boxGeometry args={[0.14, 0.015, 0.16]} />
        </mesh>
        <mesh material={mats.goldTrim} position={[-0.12, 0.32, -0.08]} castShadow>
          <cylinderGeometry args={[0.022, 0.022, 0.035, 6]} />
        </mesh>
        <mesh material={mats.goldTrim} position={[-0.06, 0.315, -0.09]} castShadow>
          <cylinderGeometry args={[0.02, 0.02, 0.025, 6]} />
        </mesh>

        <mesh material={mats.flowerRed} position={[0.12, 0.34, 0.06]} castShadow>
          <cylinderGeometry args={[0.015, 0.032, 0.08, 6]} />
        </mesh>
        <mesh material={mats.awningGreen} position={[0.2, 0.34, -0.04]} castShadow>
          <cylinderGeometry args={[0.018, 0.03, 0.09, 6]} />
        </mesh>
        <mesh material={mats.goldTrim} position={[0.14, 0.35, -0.1]} castShadow>
          <cylinderGeometry args={[0.016, 0.026, 0.1, 6]} />
        </mesh>

        <TimberBarrel position={[0.55, 0, 0.05]} scale={0.55} />
      </group>

      <group ref={roofRef}>
        <mesh material={mats.timberDark} position={[0, 1.62, 0]} castShadow>
          <boxGeometry args={[3.95, 0.1, 0.1]} />
        </mesh>
        <mesh material={mats.thatchRoof} position={[0, 1.45, 0.5]} rotation={[-0.55, 0, 0]} castShadow>
          <boxGeometry args={[3.96, 1.15, 0.1]} />
        </mesh>
        <mesh material={mats.thatchRoof} position={[0, 1.45, -0.5]} rotation={[0.55, 0, 0]} castShadow>
          <boxGeometry args={[3.96, 1.15, 0.1]} />
        </mesh>
        <mesh material={mats.thatchRidge} position={[0, 1.76, 0]} castShadow>
          <boxGeometry args={[3.98, 0.12, 0.15]} />
        </mesh>
      </group>
    </group>
  );
}
