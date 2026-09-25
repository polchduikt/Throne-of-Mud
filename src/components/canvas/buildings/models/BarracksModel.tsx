import type { RefObject } from 'react';
import type * as THREE from 'three';
import { SHARED_BUILDING_MATS } from '../buildingMaterials';
import {
  MedievalDoor,
  MedievalWindow,
  BarracksBunkBed,
  TriangularGable,
} from '../common/BuildingPrimitives';

export function BarracksModel({
  isLightOn = false,
  roofRef,
}: {
  isLightOn?: boolean;
  roofRef?: RefObject<THREE.Group | null>;
}) {
  const mats = SHARED_BUILDING_MATS;

  return (
    <group>
      <mesh material={mats.stoneDark} position={[0, 0.12, 0]} castShadow receiveShadow>
        <boxGeometry args={[4.96, 0.24, 2.96]} />
      </mesh>
      <mesh material={mats.floorPlanks} position={[0, 0.14, 0]} receiveShadow>
        <boxGeometry args={[4.76, 0.04, 2.76]} />
      </mesh>

      <mesh material={mats.timberLogs} position={[0, 0.8, -1.35]} castShadow receiveShadow>
        <boxGeometry args={[4.84, 1.25, 0.14]} />
      </mesh>
      <mesh material={mats.timberLogs} position={[-2.35, 0.8, 0]} castShadow receiveShadow>
        <boxGeometry args={[0.14, 1.25, 2.74]} />
      </mesh>
      <mesh material={mats.timberLogs} position={[2.35, 0.8, 0]} castShadow receiveShadow>
        <boxGeometry args={[0.14, 1.25, 2.74]} />
      </mesh>
      <mesh material={mats.timberLogs} position={[-1.48, 0.8, 1.35]} castShadow receiveShadow>
        <boxGeometry args={[1.76, 1.25, 0.14]} />
      </mesh>
      <mesh material={mats.timberLogs} position={[1.48, 0.8, 1.35]} castShadow receiveShadow>
        <boxGeometry args={[1.76, 1.25, 0.14]} />
      </mesh>
      <mesh material={mats.timberDark} position={[0, 1.32, 1.35]} castShadow>
        <boxGeometry args={[1.24, 0.22, 0.16]} />
      </mesh>

      {[-2.38, 2.38].map((cx) =>
        [-1.38, 1.38].map((cz) => (
          <mesh key={`barracks-cp-${cx}-${cz}`} material={mats.timberDark} position={[cx, 0.8, cz]} castShadow>
            <boxGeometry args={[0.18, 1.4, 0.18]} />
          </mesh>
        ))
      )}

      {[-0.62, 0.62].map((dx) => (
        <mesh key={`barracks-dp-${dx}`} material={mats.timberDark} position={[dx, 0.8, 1.36]} castShadow>
          <boxGeometry args={[0.14, 1.35, 0.16]} />
        </mesh>
      ))}

      <MedievalDoor position={[0, 0.16, 1.35]} width={1.1} height={1.22} isDouble />

      <MedievalWindow position={[-1.48, 0.82, 1.36]} width={0.48} height={0.48} isLightOn={isLightOn} hasFlowerBox={false} />
      <MedievalWindow position={[1.48, 0.82, 1.36]} width={0.48} height={0.48} isLightOn={isLightOn} hasFlowerBox={false} />
      <MedievalWindow position={[-2.36, 0.82, -0.45]} rotation={[0, -Math.PI / 2, 0]} width={0.48} height={0.48} isLightOn={isLightOn} hasFlowerBox={false} />
      <MedievalWindow position={[-2.36, 0.82, 0.45]} rotation={[0, -Math.PI / 2, 0]} width={0.48} height={0.48} isLightOn={isLightOn} hasFlowerBox={false} />
      <MedievalWindow position={[2.36, 0.82, -0.45]} rotation={[0, Math.PI / 2, 0]} width={0.48} height={0.48} isLightOn={isLightOn} hasFlowerBox={false} />
      <MedievalWindow position={[2.36, 0.82, 0.45]} rotation={[0, Math.PI / 2, 0]} width={0.48} height={0.48} isLightOn={isLightOn} hasFlowerBox={false} />

      <mesh material={mats.redBanner} position={[-0.62, 0.95, 1.45]} castShadow>
        <boxGeometry args={[0.24, 0.65, 0.03]} />
      </mesh>
      <mesh material={mats.redBanner} position={[0.62, 0.95, 1.45]} castShadow>
        <boxGeometry args={[0.24, 0.65, 0.03]} />
      </mesh>

      <BarracksBunkBed position={[-1.65, 0.14, -0.5]} />

      <group position={[-1.65, 0.14, 0.55]}>
        <mesh material={mats.timberDark} position={[0, 0.14, 0]} castShadow>
          <boxGeometry args={[0.62, 0.28, 0.38]} />
        </mesh>
        <mesh material={mats.ironHardware} position={[-0.2, 0.14, 0]}>
          <boxGeometry args={[0.03, 0.29, 0.39]} />
        </mesh>
        <mesh material={mats.ironHardware} position={[0.2, 0.14, 0]}>
          <boxGeometry args={[0.03, 0.29, 0.39]} />
        </mesh>
        <mesh material={mats.ironHardware} position={[0, 0.18, 0.195]}>
          <boxGeometry args={[0.06, 0.08, 0.02]} />
        </mesh>
      </group>

      <group position={[1.75, 0.14, -0.6]}>
        <mesh material={mats.timberDark} position={[0, 0.45, 0]} castShadow>
          <boxGeometry args={[0.1, 0.85, 1.1]} />
        </mesh>
        {[-0.35, 0, 0.35].map((sz, si) => (
          <group key={`spear-${si}`} position={[0.06, 0.45, sz]} rotation={[0.1, 0, 0.1]}>
            <mesh material={mats.timberLight} castShadow>
              <cylinderGeometry args={[0.015, 0.015, 1.0, 4]} />
            </mesh>
            <mesh material={mats.axeBlade} position={[0, 0.52, 0]} castShadow>
              <coneGeometry args={[0.035, 0.14, 4]} />
            </mesh>
          </group>
        ))}
      </group>

      <group position={[1.75, 0.14, 0.55]}>
        <mesh material={mats.timberDark} position={[0, 0.45, 0]} castShadow>
          <cylinderGeometry args={[0.03, 0.03, 0.9, 4]} />
        </mesh>
        <mesh material={mats.timberDark} position={[0, 0.65, 0]} rotation={[0, 0, Math.PI / 2]} castShadow>
          <cylinderGeometry args={[0.025, 0.025, 0.55, 4]} />
        </mesh>
        <mesh material={mats.bedStraw} position={[0, 0.8, 0]} castShadow>
          <dodecahedronGeometry args={[0.14, 0]} />
        </mesh>
        <mesh material={mats.shieldWood} position={[0, 0.5, 0.12]} castShadow>
          <cylinderGeometry args={[0.2, 0.2, 0.04, 8]} />
        </mesh>
      </group>

      <group position={[0, 0.14, 0]}>
        <mesh material={mats.timberDark} position={[0, 0.3, 0]} castShadow receiveShadow>
          <boxGeometry args={[1.0, 0.05, 0.68]} />
        </mesh>
        {[-0.42, 0.42].map((tx) =>
          [-0.26, 0.26].map((tz) => (
            <mesh key={`b-leg-${tx}-${tz}`} material={mats.timberDark} position={[tx, 0.15, tz]} castShadow>
              <cylinderGeometry args={[0.035, 0.035, 0.3, 4]} />
            </mesh>
          ))
        )}
        <mesh material={mats.flourSack} position={[0, 0.33, 0]} castShadow>
          <boxGeometry args={[0.45, 0.015, 0.35]} />
        </mesh>
        <mesh material={mats.goldTrim} position={[0.28, 0.35, 0.12]} castShadow>
          <cylinderGeometry args={[0.03, 0.04, 0.04, 6]} />
        </mesh>
        <mesh material={isLightOn ? mats.candleGlow : mats.candleUnlit} position={[0.28, 0.41, 0.12]}>
          <cylinderGeometry args={[0.015, 0.02, 0.08, 5]} />
        </mesh>
        {isLightOn && (
          <pointLight color="#fde047" intensity={1.1} distance={4.2} position={[0, 0.5, 0]} />
        )}

        <group position={[0, 0, -0.52]}>
          <mesh material={mats.timberPlanks} position={[0, 0.18, 0]} castShadow>
            <boxGeometry args={[0.88, 0.04, 0.2]} />
          </mesh>
          {[-0.34, 0.34].map((bx) => (
            <mesh key={`b-nleg-${bx}`} material={mats.timberDark} position={[bx, 0.09, 0]} castShadow>
              <boxGeometry args={[0.04, 0.18, 0.18]} />
            </mesh>
          ))}
        </group>

        <group position={[0, 0, 0.52]}>
          <mesh material={mats.timberPlanks} position={[0, 0.18, 0]} castShadow>
            <boxGeometry args={[0.88, 0.04, 0.2]} />
          </mesh>
          {[-0.34, 0.34].map((bx) => (
            <mesh key={`b-sleg-${bx}`} material={mats.timberDark} position={[bx, 0.09, 0]} castShadow>
              <boxGeometry args={[0.04, 0.18, 0.18]} />
            </mesh>
          ))}
        </group>
      </group>

      <group ref={roofRef}>
        <TriangularGable
          baseWidth={2.74}
          height={1.25}
          thickness={0.14}
          position={[-2.35, 1.42, 0]}
          rotation={[0, -Math.PI / 2, 0]}
          material={mats.timberLogs}
        />
        <TriangularGable
          baseWidth={2.74}
          height={1.25}
          thickness={0.14}
          position={[2.35, 1.42, 0]}
          rotation={[0, Math.PI / 2, 0]}
          material={mats.timberLogs}
        />
        <mesh material={mats.thatchRoof} position={[0, 2.05, 0.69]} rotation={[-0.738, 0, 0]} castShadow receiveShadow>
          <boxGeometry args={[4.96, 1.86, 0.16]} />
        </mesh>
        <mesh material={mats.thatchDark} position={[0, 1.42, 1.36]} rotation={[-0.738, 0, 0]}>
          <boxGeometry args={[4.96, 0.14, 0.18]} />
        </mesh>
        <mesh material={mats.thatchRoof} position={[0, 2.05, -0.69]} rotation={[0.738, 0, 0]} castShadow receiveShadow>
          <boxGeometry args={[4.96, 1.86, 0.16]} />
        </mesh>
        <mesh material={mats.thatchDark} position={[0, 1.42, -1.36]} rotation={[0.738, 0, 0]}>
          <boxGeometry args={[4.96, 0.14, 0.18]} />
        </mesh>
        <mesh material={mats.thatchRidge} position={[0, 2.68, 0]} castShadow>
          <boxGeometry args={[4.98, 0.16, 0.18]} />
        </mesh>

        {[-2.48, 2.48].map((gx) => (
          <group key={`b-finial-${gx}`} position={[gx, 2.72, 0]}>
            <mesh material={mats.timberLight} rotation={[0.55, 0, 0]} castShadow>
              <boxGeometry args={[0.08, 0.48, 0.06]} />
            </mesh>
            <mesh material={mats.timberLight} rotation={[-0.55, 0, 0]} castShadow>
              <boxGeometry args={[0.08, 0.48, 0.06]} />
            </mesh>
          </group>
        ))}
      </group>
    </group>
  );
}
