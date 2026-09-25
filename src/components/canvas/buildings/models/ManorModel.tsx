import type { RefObject } from 'react';
import type * as THREE from 'three';
import { SHARED_BUILDING_MATS } from '../buildingMaterials';
import {
  GothicButtress,
  GothicPortal,
  GothicLancetWindow,
  GothicManorFireplace,
  LordManorBed,
  TriangularGable,
  DetailedChimney,
} from '../common/BuildingPrimitives';

export function ManorModel({
  isLightOn = false,
  roofRef,
}: {
  isLightOn?: boolean;
  roofRef?: RefObject<THREE.Group | null>;
}) {
  const mats = SHARED_BUILDING_MATS;

  return (
    <group>
      <mesh material={mats.stoneDark} position={[0, 0.16, 0]} castShadow receiveShadow>
        <boxGeometry args={[5.06, 0.32, 4.06]} />
      </mesh>
      <mesh material={mats.stoneMed} position={[0, 0.18, 0]} receiveShadow>
        <boxGeometry args={[4.88, 0.04, 3.88]} />
      </mesh>

      <mesh material={mats.velvetRed} position={[0, 0.19, 0.1]} receiveShadow>
        <boxGeometry args={[1.5, 0.01, 2.9]} />
      </mesh>
      <mesh material={mats.goldTrim} position={[-0.76, 0.192, 0.1]}>
        <boxGeometry args={[0.03, 0.005, 2.9]} />
      </mesh>
      <mesh material={mats.goldTrim} position={[0.76, 0.192, 0.1]}>
        <boxGeometry args={[0.03, 0.005, 2.9]} />
      </mesh>

      <mesh material={mats.stoneMed} position={[0, 1.0, -1.88]} castShadow receiveShadow>
        <boxGeometry args={[4.88, 1.68, 0.16]} />
      </mesh>
      <mesh material={mats.stoneMed} position={[-2.38, 1.0, 0]} castShadow receiveShadow>
        <boxGeometry args={[0.16, 1.68, 3.88]} />
      </mesh>
      <mesh material={mats.stoneMed} position={[2.38, 1.0, 0]} castShadow receiveShadow>
        <boxGeometry args={[0.16, 1.68, 3.88]} />
      </mesh>
      <mesh material={mats.stoneMed} position={[-1.72, 1.0, 1.88]} castShadow receiveShadow>
        <boxGeometry args={[1.28, 1.68, 0.16]} />
      </mesh>
      <mesh material={mats.stoneMed} position={[1.72, 1.0, 1.88]} castShadow receiveShadow>
        <boxGeometry args={[1.28, 1.68, 0.16]} />
      </mesh>
      <mesh material={mats.stoneMed} position={[0, 1.72, 1.88]} castShadow receiveShadow>
        <boxGeometry args={[2.2, 0.28, 0.16]} />
      </mesh>

      <mesh material={mats.stoneLight} position={[0, 1.86, 1.94]} castShadow>
        <boxGeometry args={[5.06, 0.08, 0.14]} />
      </mesh>
      <mesh material={mats.stoneLight} position={[0, 1.86, -1.94]} castShadow>
        <boxGeometry args={[5.06, 0.08, 0.14]} />
      </mesh>
      <mesh material={mats.stoneLight} position={[-2.44, 1.86, 0]} castShadow>
        <boxGeometry args={[0.14, 0.08, 4.02]} />
      </mesh>
      <mesh material={mats.stoneLight} position={[2.44, 1.86, 0]} castShadow>
        <boxGeometry args={[0.14, 0.08, 4.02]} />
      </mesh>

      <GothicButtress position={[-2.48, 0.16, 1.98]} rotation={[0, -Math.PI / 4, 0]} height={1.75} />
      <GothicButtress position={[2.48, 0.16, 1.98]} rotation={[0, Math.PI / 4, 0]} height={1.75} />
      <GothicButtress position={[-2.48, 0.16, -1.98]} rotation={[0, -Math.PI * 0.75, 0]} height={1.75} />
      <GothicButtress position={[2.48, 0.16, -1.98]} rotation={[0, Math.PI * 0.75, 0]} height={1.75} />

      <GothicButtress position={[-0.96, 0.16, 1.96]} rotation={[0, 0, 0]} height={1.75} />
      <GothicButtress position={[0.96, 0.16, 1.96]} rotation={[0, 0, 0]} height={1.75} />
      <GothicButtress position={[-1.2, 0.16, -1.96]} rotation={[0, Math.PI, 0]} height={1.75} />
      <GothicButtress position={[1.2, 0.16, -1.96]} rotation={[0, Math.PI, 0]} height={1.75} />
      <GothicButtress position={[-2.46, 0.16, 0]} rotation={[0, -Math.PI / 2, 0]} height={1.75} />
      <GothicButtress position={[2.46, 0.16, 0]} rotation={[0, Math.PI / 2, 0]} height={1.75} />

      <GothicPortal position={[0, 0.18, 1.88]} width={1.25} height={1.42} />

      <GothicLancetWindow position={[-1.72, 1.05, 1.90]} width={0.48} height={0.78} isLightOn={isLightOn} />
      <GothicLancetWindow position={[1.72, 1.05, 1.90]} width={0.48} height={0.78} isLightOn={isLightOn} />
      <GothicLancetWindow position={[-2.40, 1.05, -0.9]} rotation={[0, -Math.PI / 2, 0]} width={0.48} height={0.78} isLightOn={isLightOn} />
      <GothicLancetWindow position={[-2.40, 1.05, 0.9]} rotation={[0, -Math.PI / 2, 0]} width={0.48} height={0.78} isLightOn={isLightOn} />
      <GothicLancetWindow position={[2.40, 1.05, -0.9]} rotation={[0, Math.PI / 2, 0]} width={0.48} height={0.78} isLightOn={isLightOn} />
      <GothicLancetWindow position={[2.40, 1.05, 0.9]} rotation={[0, Math.PI / 2, 0]} width={0.48} height={0.78} isLightOn={isLightOn} />
      <GothicLancetWindow position={[-1.72, 1.05, -1.90]} rotation={[0, Math.PI, 0]} width={0.48} height={0.78} isLightOn={isLightOn} />
      <GothicLancetWindow position={[1.72, 1.05, -1.90]} rotation={[0, Math.PI, 0]} width={0.48} height={0.78} isLightOn={isLightOn} />

      <mesh material={mats.redBanner} position={[-0.88, 1.15, 1.97]} castShadow>
        <boxGeometry args={[0.26, 0.85, 0.03]} />
      </mesh>
      <mesh material={mats.goldTrim} position={[-0.88, 1.55, 1.98]}>
        <boxGeometry args={[0.3, 0.04, 0.04]} />
      </mesh>
      <mesh material={mats.redBanner} position={[0.88, 1.15, 1.97]} castShadow>
        <boxGeometry args={[0.26, 0.85, 0.03]} />
      </mesh>
      <mesh material={mats.goldTrim} position={[0.88, 1.55, 1.98]}>
        <boxGeometry args={[0.3, 0.04, 0.04]} />
      </mesh>

      <group position={[0, 0.18, -1.25]}>
        <mesh material={mats.stoneDark} position={[0, 0.06, 0]} castShadow receiveShadow>
          <boxGeometry args={[2.2, 0.12, 1.1]} />
        </mesh>
        <mesh material={mats.stoneLight} position={[0, 0.12, 0]} castShadow receiveShadow>
          <boxGeometry args={[2.0, 0.04, 0.95]} />
        </mesh>

        <group position={[0, 0.14, -0.1]}>
          <mesh material={mats.timberDark} position={[0, 0.24, 0]} castShadow>
            <boxGeometry args={[0.7, 0.44, 0.6]} />
          </mesh>
          <mesh material={mats.velvetRed} position={[0, 0.47, 0.02]} castShadow>
            <boxGeometry args={[0.54, 0.06, 0.48]} />
          </mesh>
          <mesh material={mats.timberDark} position={[0, 0.82, -0.26]} castShadow>
            <boxGeometry args={[0.7, 0.82, 0.08]} />
          </mesh>
          <mesh material={mats.velvetRed} position={[0, 0.8, -0.22]} castShadow>
            <boxGeometry args={[0.52, 0.65, 0.04]} />
          </mesh>
          <group position={[0, 1.28, -0.26]} rotation={[0, 0, Math.PI / 4]}>
            <mesh material={mats.timberDark} castShadow>
              <boxGeometry args={[0.32, 0.32, 0.08]} />
            </mesh>
          </group>
          <mesh material={mats.goldTrim} position={[0, 1.3, -0.21]} castShadow>
            <dodecahedronGeometry args={[0.1, 0]} />
          </mesh>
          <mesh material={mats.timberDark} position={[-0.32, 0.58, 0.04]} castShadow>
            <boxGeometry args={[0.08, 0.28, 0.48]} />
          </mesh>
          <mesh material={mats.timberDark} position={[0.32, 0.58, 0.04]} castShadow>
            <boxGeometry args={[0.08, 0.28, 0.48]} />
          </mesh>
        </group>
      </group>

      <group position={[0, 0.18, 0.35]}>
        <mesh material={mats.timberDark} position={[0, 0.32, 0]} castShadow receiveShadow>
          <boxGeometry args={[1.0, 0.06, 1.7]} />
        </mesh>
        {[-0.42, 0.42].map((tx) =>
          [-0.75, 0.75].map((tz) => (
            <mesh key={`ct-leg-${tx}-${tz}`} material={mats.timberDark} position={[tx, 0.16, tz]} castShadow>
              <cylinderGeometry args={[0.04, 0.04, 0.32, 6]} />
            </mesh>
          ))
        )}
        <mesh material={mats.goldTrim} position={[0, 0.38, -0.4]} castShadow>
          <cylinderGeometry args={[0.04, 0.06, 0.12, 6]} />
        </mesh>
        <mesh material={isLightOn ? mats.candleGlow : mats.candleUnlit} position={[0, 0.48, -0.4]}>
          <cylinderGeometry args={[0.015, 0.02, 0.1, 5]} />
        </mesh>
        <mesh material={mats.goldTrim} position={[0, 0.38, 0.4]} castShadow>
          <cylinderGeometry args={[0.04, 0.06, 0.12, 6]} />
        </mesh>
        <mesh material={isLightOn ? mats.candleGlow : mats.candleUnlit} position={[0, 0.48, 0.4]}>
          <cylinderGeometry args={[0.015, 0.02, 0.1, 5]} />
        </mesh>
        <mesh material={mats.flourSack} position={[-0.1, 0.36, 0]} rotation={[0, 0.4, Math.PI / 2]} castShadow>
          <cylinderGeometry args={[0.05, 0.05, 0.35, 6]} />
        </mesh>
        {isLightOn && (
          <pointLight color="#fde047" intensity={1.2} distance={4.8} position={[0, 0.65, 0]} />
        )}
      </group>

      <GothicManorFireplace
        position={[2.28, 0.18, 0]}
        rotation={[0, -Math.PI / 2, 0]}
        isLightOn={isLightOn}
      />

      <LordManorBed
        position={[-1.55, 0.18, -0.2]}
        rotation={[0, 0, 0]}
      />

      <group ref={roofRef}>
        <TriangularGable
          baseWidth={3.88}
          height={1.58}
          thickness={0.16}
          position={[-2.38, 1.84, 0]}
          rotation={[0, -Math.PI / 2, 0]}
          material={mats.stoneMed}
        />
        <TriangularGable
          baseWidth={3.88}
          height={1.58}
          thickness={0.16}
          position={[2.38, 1.84, 0]}
          rotation={[0, Math.PI / 2, 0]}
          material={mats.stoneMed}
        />

        <mesh material={mats.gothicSlateRoof} position={[0, 2.62, 0.98]} rotation={[-0.679, 0, 0]} castShadow receiveShadow>
          <boxGeometry args={[5.06, 2.52, 0.18]} />
        </mesh>
        <mesh material={mats.gothicSlateRidge} position={[0, 1.86, 1.94]} rotation={[-0.679, 0, 0]}>
          <boxGeometry args={[5.06, 0.14, 0.2]} />
        </mesh>
        <mesh material={mats.gothicSlateRoof} position={[0, 2.62, -0.98]} rotation={[0.679, 0, 0]} castShadow receiveShadow>
          <boxGeometry args={[5.06, 2.52, 0.18]} />
        </mesh>
        <mesh material={mats.gothicSlateRidge} position={[0, 1.86, -1.94]} rotation={[0.679, 0, 0]}>
          <boxGeometry args={[5.06, 0.14, 0.2]} />
        </mesh>
        <mesh material={mats.gothicSlateRidge} position={[0, 3.42, 0]} castShadow>
          <boxGeometry args={[5.08, 0.18, 0.2]} />
        </mesh>

        {[-2.52, 2.52].map((cx) =>
          [-2.02, 2.02].map((cz) => (
            <group key={`gothic-pinnacle-${cx}-${cz}`} position={[cx, 1.9, cz]}>
              <mesh material={mats.stoneLight} position={[0, 0.3, 0]} castShadow>
                <boxGeometry args={[0.2, 0.6, 0.2]} />
              </mesh>
              <mesh material={mats.stoneLight} position={[0, 0.72, 0]} castShadow>
                <coneGeometry args={[0.14, 0.32, 4]} />
              </mesh>
            </group>
          ))
        )}

        {[-2.52, 2.52].map((gx) => (
          <group key={`m-spire-${gx}`} position={[gx, 3.44, 0]}>
            <mesh material={mats.stoneLight} position={[0, 0.3, 0]} castShadow>
              <boxGeometry args={[0.14, 0.6, 0.14]} />
            </mesh>
            <mesh material={mats.stoneLight} position={[0, 0.72, 0]} castShadow>
              <coneGeometry args={[0.11, 0.36, 4]} />
            </mesh>
            <mesh material={mats.goldTrim} position={[0, 0.92, 0]} castShadow>
              <sphereGeometry args={[0.05, 6, 6]} />
            </mesh>
          </group>
        ))}

        <DetailedChimney
          position={[2.28, 2.85, 0]}
          width={0.52}
          depth={0.64}
          height={1.45}
          potCount={2}
        />
      </group>
    </group>
  );
}
