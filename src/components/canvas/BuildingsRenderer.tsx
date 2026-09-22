import { useRef, memo, useState } from 'react';
import { useFrame } from '@react-three/fiber';
import { Html } from '@react-three/drei';
import * as THREE from 'three';
import { buildingEntities, characterEntities } from '../../engine/ecs/world';
import type { GameEntity } from '../../engine/ecs/world';
import { useGameStore } from '../../store/useGameStore';

export function BuildingsRenderer() {
  const selectedEntityId = useGameStore((state) => state.selectedEntityId);
  const setSelectedEntityId = useGameStore((state) => state.setSelectedEntityId);
  const buildingVersion = useGameStore((state) => state.buildingVersion);
  const isStrategicView = useGameStore((state) => state.isStrategicView);

  void buildingVersion;

  if (isStrategicView) return null;

  return (
    <group>
      {Array.from(buildingEntities).map((building) => (
        <Building3DMemo
          key={building.id}
          building={building}
          isSelected={selectedEntityId === building.id}
          onSelect={setSelectedEntityId}
        />
      ))}
    </group>
  );
}
import { SHARED_BUILDING_MATS } from './buildings/buildingMaterials';


function Building3D({
  building,
  isSelected,
  onSelect,
}: {
  building: GameEntity;
  isSelected: boolean;
  onSelect: (id: string) => void;
}) {
  const pos = building.position || [0, 0, 0];
  const width = building.buildingWidth || 1;
  const height = building.buildingHeight || 1;
  const [completed, setCompleted] = useState(() => Boolean(building.isCompleted || (building.constructionProgress || 0) >= 100));
  const progress = building.constructionProgress || 0;
  const type = building.buildingType || 'peasant_house';

  const roofRef = useRef<THREE.Group>(null);
  const windmillSailsRef = useRef<THREE.Group>(null);
  const fireFlameRef = useRef<THREE.Group>(null);
  const smokePuffsRef = useRef<THREE.Group>(null);
  const progressTextRef = useRef<HTMLSpanElement>(null);
  const progressBarRef = useRef<HTMLDivElement>(null);
  const lastRoofCheck = useRef(0);
  const lastLightCheck = useRef(0);
  const [isLightOn, setIsLightOn] = useState(false);

  const mats = SHARED_BUILDING_MATS;

  useFrame(({ clock }) => {
    if (!completed && (building.isCompleted || (building.constructionProgress || 0) >= 100)) {
      setCompleted(true);
      return;
    }

    const t = clock.getElapsedTime();

    if (!completed && progressTextRef.current && progressBarRef.current) {
      const curProg = Math.round(building.constructionProgress || 0);
      progressTextRef.current.innerText = `🔨 ${curProg}%`;
      progressBarRef.current.style.width = `${Math.max(4, curProg)}%`;
    }

    if (roofRef.current) {
      if (isSelected) {
        roofRef.current.visible = false;
      } else if (t - lastRoofCheck.current > 0.25) {
        lastRoofCheck.current = t;
        const bx = building.gridPosition ? building.gridPosition[0] : pos[0] - width / 2;
        const bz = building.gridPosition ? building.gridPosition[1] : pos[2] - height / 2;
        const bWidth = building.buildingWidth || width || 2;
        const bHeight = building.buildingHeight || height || 2;

        let hasOccupantInside = false;
        for (const u of characterEntities) {
          if (!u.position) continue;
          const [ux, , uz] = u.position;
          if (
            (ux >= bx + 0.1 && ux <= bx + bWidth - 0.1 && uz >= bz + 0.1 && uz <= bz + bHeight - 0.1) ||
            (u.currentJob?.targetBuildingId === building.id && u.currentJob?.type === 'sleep')
          ) {
            hasOccupantInside = true;
            break;
          }
        }

        roofRef.current.visible = !hasOccupantInside;
      }
    }

    if (t - lastLightCheck.current > 0.3) {
      lastLightCheck.current = t;
      const hour = useGameStore.getState().time.hour ?? 12;
      const isNight = hour >= 20 || hour < 6;
      let hasSleeper = false;

      if (isNight) {
        const bx = building.gridPosition ? building.gridPosition[0] : pos[0] - width / 2;
        const bz = building.gridPosition ? building.gridPosition[1] : pos[2] - height / 2;
        const bWidth = building.buildingWidth || width || 2;
        const bHeight = building.buildingHeight || height || 2;

        for (const u of characterEntities) {
          if (u.currentJob?.type === 'sleep') {
            if (u.currentJob.targetBuildingId === building.id) {
              hasSleeper = true;
              break;
            }
            if (u.position) {
              const [ux, , uz] = u.position;
              if (
                ux >= bx + 0.1 &&
                ux <= bx + bWidth - 0.1 &&
                uz >= bz + 0.1 &&
                uz <= bz + bHeight - 0.1
              ) {
                hasSleeper = true;
                break;
              }
            }
          }
        }
      }

      const shouldLight = isNight && hasSleeper;
      if (shouldLight !== isLightOn) {
        setIsLightOn(shouldLight);
      }
    }

    if (windmillSailsRef.current) {
      windmillSailsRef.current.rotation.z = t * 0.8;
    }

    if (fireFlameRef.current) {
      const s = 0.9 + Math.sin(t * 8) * 0.15;
      fireFlameRef.current.scale.set(s, 1 + Math.cos(t * 11) * 0.25, s);
      fireFlameRef.current.rotation.y = t * 2;
    }

    if (smokePuffsRef.current) {
      const children = smokePuffsRef.current.children;
      for (let i = 0; i < children.length; i++) {
        const puff = children[i];
        const offset = (t * 0.8 + i * 0.65) % 2.0;
        puff.position.y = offset * 0.8;
        puff.position.x = Math.sin(offset * 3 + i) * 0.12;
        const scale = 0.15 + offset * 0.2;
        puff.scale.set(scale, scale, scale);
      }
    }
  });

  const posY = pos[1] !== undefined ? pos[1] : 0.05;

  return (
    <group
      position={[
        building.gridPosition ? building.gridPosition[0] + width / 2 : pos[0],
        posY,
        building.gridPosition ? building.gridPosition[1] + height / 2 : pos[2],
      ]}
      onClick={(e) => {
        e.stopPropagation();
        onSelect(building.id);
      }}
    >
      <mesh material={mats.stoneDark} position={[0, -0.06, 0]} receiveShadow>
        <boxGeometry args={[width * 0.96, 0.16, height * 0.96]} />
      </mesh>

      {completed ? (
        <group>
          {type === 'tent' && (
            <group>
              <mesh material={mats.richSoil} position={[0, 0.02, 0]} receiveShadow>
                <boxGeometry args={[1.85, 0.04, 1.85]} />
              </mesh>
              <mesh material={mats.goldWheat} position={[0, 0.04, 0]} receiveShadow>
                <boxGeometry args={[1.65, 0.04, 1.65]} />
              </mesh>

              {[
                [-0.75, -0.75],
                [0.75, -0.75],
                [-0.75, 0.75],
                [0.75, 0.75],
              ].map(([px, pz], idx) => (
                <group key={`tent-post-${idx}`} position={[px, 0.58, pz]}>
                  <mesh material={mats.timberDark} castShadow>
                    <cylinderGeometry args={[0.04, 0.045, 1.15, 6]} />
                  </mesh>
                  <mesh material={mats.tentFabric} position={[0, 0.1, 0]} castShadow>
                    <cylinderGeometry args={[0.075, 0.075, 0.75, 6]} />
                  </mesh>
                  <mesh material={mats.bootsLeather} position={[0, 0.1, 0]}>
                    <cylinderGeometry args={[0.082, 0.082, 0.06, 6]} />
                  </mesh>
                </group>
              ))}

              <mesh material={mats.timberDark} position={[0, 1.15, -0.75]} castShadow>
                <boxGeometry args={[1.58, 0.06, 0.06]} />
              </mesh>
              <mesh material={mats.timberDark} position={[0, 1.15, 0.75]} castShadow>
                <boxGeometry args={[1.58, 0.06, 0.06]} />
              </mesh>
              <mesh material={mats.timberDark} position={[-0.75, 1.15, 0]} castShadow>
                <boxGeometry args={[0.06, 0.06, 1.58]} />
              </mesh>
              <mesh material={mats.timberDark} position={[0.75, 1.15, 0]} castShadow>
                <boxGeometry args={[0.06, 0.06, 1.58]} />
              </mesh>

              <mesh material={mats.royalBlueRoof} position={[0, 1.08, -0.76]} castShadow>
                <boxGeometry args={[1.56, 0.12, 0.02]} />
              </mesh>
              <mesh material={mats.royalBlueRoof} position={[-0.76, 1.08, 0]} castShadow>
                <boxGeometry args={[0.02, 0.12, 1.56]} />
              </mesh>
              <mesh material={mats.royalBlueRoof} position={[0.76, 1.08, 0]} castShadow>
                <boxGeometry args={[0.02, 0.12, 1.56]} />
              </mesh>
              <mesh material={mats.goldTrim} position={[0, 1.02, -0.76]}>
                <boxGeometry args={[1.56, 0.02, 0.025]} />
              </mesh>

              <group position={[0, 0, -0.05]}>
                <mesh material={mats.timberDark} position={[0, 0.08, 0]} castShadow>
                  <boxGeometry args={[0.68, 0.12, 1.16]} />
                </mesh>
                <mesh material={mats.timberDark} position={[0, 0.28, -0.54]} castShadow>
                  <boxGeometry args={[0.70, 0.36, 0.06]} />
                </mesh>
                <mesh material={mats.timberDark} position={[0, 0.18, 0.54]} castShadow>
                  <boxGeometry args={[0.70, 0.20, 0.06]} />
                </mesh>
                <mesh material={mats.bedStraw} position={[0, 0.14, 0]} receiveShadow>
                  <boxGeometry args={[0.60, 0.08, 1.02]} />
                </mesh>
                <mesh material={mats.pillowWhite} position={[0, 0.19, -0.36]}>
                  <boxGeometry args={[0.50, 0.08, 0.24]} />
                </mesh>
                <mesh material={mats.royalBlueRoof} position={[0, 0.18, 0.08]} castShadow>
                  <boxGeometry args={[0.62, 0.10, 0.72]} />
                </mesh>
                <mesh material={mats.goldTrim} position={[0, 0.20, -0.24]}>
                  <boxGeometry args={[0.62, 0.02, 0.08]} />
                </mesh>
              </group>

              <group position={[-0.50, 0, -0.25]}>
                <mesh material={mats.timberLight} position={[0, 0.18, 0]} castShadow receiveShadow>
                  <boxGeometry args={[0.28, 0.04, 0.36]} />
                </mesh>
                <mesh material={mats.timberDark} position={[-0.10, 0.09, -0.12]} castShadow>
                  <cylinderGeometry args={[0.018, 0.018, 0.18, 4]} />
                </mesh>
                <mesh material={mats.timberDark} position={[0.10, 0.09, -0.12]} castShadow>
                  <cylinderGeometry args={[0.018, 0.018, 0.18, 4]} />
                </mesh>
                <mesh material={mats.timberDark} position={[-0.10, 0.09, 0.12]} castShadow>
                  <cylinderGeometry args={[0.018, 0.018, 0.18, 4]} />
                </mesh>
                <mesh material={mats.timberDark} position={[0.10, 0.09, 0.12]} castShadow>
                  <cylinderGeometry args={[0.018, 0.018, 0.18, 4]} />
                </mesh>
                <mesh material={mats.plaster} position={[-0.04, 0.21, 0]} rotation={[0, 0.2, 0]}>
                  <boxGeometry args={[0.14, 0.02, 0.12]} />
                </mesh>
                <mesh material={isLightOn ? mats.candleGlow : mats.candleUnlit} position={[0.06, 0.23, 0]}>
                  <cylinderGeometry args={[0.016, 0.018, 0.07, 5]} />
                </mesh>
                {isLightOn && (
                  <pointLight color="#fde047" intensity={0.7} distance={2.5} position={[0.06, 0.32, 0]} />
                )}
              </group>

              <group position={[0.50, 0, -0.25]}>
                <mesh material={mats.timberMed} position={[0, 0.14, 0]} castShadow receiveShadow>
                  <boxGeometry args={[0.28, 0.24, 0.36]} />
                </mesh>
                <mesh material={mats.goldTrim} position={[-0.10, 0.14, 0]}>
                  <boxGeometry args={[0.02, 0.04, 0.06]} />
                </mesh>
              </group>

              <group ref={roofRef}>
                <mesh material={mats.timberDark} position={[0, 1.92, 0]} castShadow>
                  <boxGeometry args={[1.68, 0.08, 0.08]} />
                </mesh>

                <mesh material={mats.tentFabric} position={[0, 1.54, -0.41]} rotation={[0.78, 0, 0]} castShadow receiveShadow>
                  <boxGeometry args={[1.65, 1.12, 0.04]} />
                </mesh>

                <mesh material={mats.tentFabric} position={[0, 1.54, 0.41]} rotation={[-0.78, 0, 0]} castShadow receiveShadow>
                  <boxGeometry args={[1.65, 1.12, 0.04]} />
                </mesh>

                {[-0.78, 0.78].map((gx) => (
                  <group key={`tent-gable-${gx}`}>
                    <mesh material={mats.tentFabric} position={[gx, 1.52, 0]} castShadow receiveShadow>
                      <boxGeometry args={[0.04, 0.75, 0.88]} />
                    </mesh>
                    <mesh material={mats.timberDark} position={[gx, 1.55, 0]} castShadow>
                      <cylinderGeometry args={[0.035, 0.04, 0.82, 6]} />
                    </mesh>
                    <mesh material={mats.goldTrim} position={[gx, 2.02, 0]}>
                      <sphereGeometry args={[0.05, 6, 6]} />
                    </mesh>
                  </group>
                ))}

                {[
                  [-0.85, -0.85, -1.05, -1.05],
                  [0.85, -0.85, 1.05, -1.05],
                  [-0.85, 0.85, -1.05, 1.05],
                  [0.85, 0.85, 1.05, 1.05],
                ].map(([rx1, rz1, px, pz], idx) => (
                  <group key={`tent-rope-${idx}`}>
                    <mesh material={mats.tentFabric} position={[(rx1 + px) / 2, 0.58, (rz1 + pz) / 2]} rotation={[0, 0, 0.35]}>
                      <cylinderGeometry args={[0.008, 0.008, 1.25, 3]} />
                    </mesh>
                    <mesh material={mats.timberDark} position={[px, 0.08, pz]} rotation={[0.2, 0, -0.2]} castShadow>
                      <cylinderGeometry args={[0.02, 0.01, 0.22, 4]} />
                    </mesh>
                  </group>
                ))}
              </group>
            </group>
          )}

          {type === 'lumberjack_hut' && (
            <group>
              <mesh material={mats.stoneDark} position={[-0.15, 0.08, -0.05]} castShadow receiveShadow>
                <boxGeometry args={[1.45, 0.16, 1.45]} />
              </mesh>

              <mesh material={mats.floorPlanks} position={[-0.15, 0.09, -0.05]} receiveShadow>
                <boxGeometry args={[1.3, 0.04, 1.3]} />
              </mesh>

              <mesh material={mats.timberDark} position={[-0.15, 0.58, -0.65]} castShadow receiveShadow>
                <boxGeometry args={[1.32, 0.86, 0.15]} />
              </mesh>
              <mesh material={mats.timberDark} position={[-0.75, 0.58, -0.05]} castShadow receiveShadow>
                <boxGeometry args={[0.15, 0.86, 1.32]} />
              </mesh>
              <mesh material={mats.timberDark} position={[0.45, 0.58, -0.05]} castShadow receiveShadow>
                <boxGeometry args={[0.15, 0.86, 1.32]} />
              </mesh>
              <mesh material={mats.timberDark} position={[-0.52, 0.58, 0.55]} castShadow receiveShadow>
                <boxGeometry args={[0.38, 0.86, 0.15]} />
              </mesh>
              <mesh material={mats.timberDark} position={[0.22, 0.58, 0.55]} castShadow receiveShadow>
                <boxGeometry args={[0.38, 0.86, 0.15]} />
              </mesh>
              <mesh material={mats.timberMed} position={[-0.15, 0.95, 0.55]} castShadow>
                <boxGeometry args={[0.72, 0.14, 0.18]} />
              </mesh>

              {[-0.8, 0.5].map((lx) =>
                [-0.7, 0.6].map((lz) => (
                  <mesh key={`lj-log-${lx}-${lz}`} material={mats.timberMed} position={[lx, 0.58, lz]} castShadow>
                    <boxGeometry args={[0.18, 0.88, 0.18]} />
                  </mesh>
                ))
              )}

              <mesh position={[-0.83, 0.58, -0.05]} material={isLightOn ? mats.windowLit : mats.windowUnlit}>
                <boxGeometry args={[0.04, 0.28, 0.28]} />
              </mesh>

              <group position={[-0.48, 0, -0.25]}>
                <mesh material={mats.timberDark} position={[0, 0.08, 0]} castShadow>
                  <boxGeometry args={[0.48, 0.12, 0.92]} />
                </mesh>
                <mesh material={mats.timberDark} position={[0, 0.26, -0.42]} castShadow>
                  <boxGeometry args={[0.50, 0.34, 0.06]} />
                </mesh>
                <mesh material={mats.timberDark} position={[0, 0.16, 0.42]} castShadow>
                  <boxGeometry args={[0.50, 0.18, 0.06]} />
                </mesh>
                <mesh material={mats.bedStraw} position={[0, 0.14, 0]} receiveShadow>
                  <boxGeometry args={[0.42, 0.08, 0.82]} />
                </mesh>
                <mesh material={mats.pillowWhite} position={[0, 0.19, -0.28]}>
                  <boxGeometry args={[0.36, 0.08, 0.20]} />
                </mesh>
                <mesh material={mats.bedLinenGreen} position={[0, 0.18, 0.08]} castShadow>
                  <boxGeometry args={[0.44, 0.09, 0.56]} />
                </mesh>
              </group>

              <group position={[0.22, 0, -0.25]}>
                <mesh material={mats.timberLight} position={[0, 0.2, 0]} castShadow receiveShadow>
                  <boxGeometry args={[0.36, 0.05, 0.38]} />
                </mesh>
                <mesh material={mats.timberDark} position={[-0.14, 0.1, -0.14]} castShadow>
                  <cylinderGeometry args={[0.02, 0.025, 0.2, 4]} />
                </mesh>
                <mesh material={mats.timberDark} position={[0.14, 0.1, -0.14]} castShadow>
                  <cylinderGeometry args={[0.02, 0.025, 0.2, 4]} />
                </mesh>
                <mesh material={mats.timberDark} position={[-0.14, 0.1, 0.14]} castShadow>
                  <cylinderGeometry args={[0.02, 0.025, 0.2, 4]} />
                </mesh>
                <mesh material={mats.timberDark} position={[0.14, 0.1, 0.14]} castShadow>
                  <cylinderGeometry args={[0.02, 0.025, 0.2, 4]} />
                </mesh>
                <mesh material={mats.plaster} position={[-0.04, 0.24, 0]} rotation={[0, 0.2, 0]}>
                  <boxGeometry args={[0.18, 0.02, 0.14]} />
                </mesh>
                <mesh material={isLightOn ? mats.candleGlow : mats.candleUnlit} position={[0.08, 0.25, 0.05]}>
                  <cylinderGeometry args={[0.016, 0.02, 0.06, 5]} />
                </mesh>
                {isLightOn && (
                  <pointLight color="#fde047" intensity={0.5} distance={1.8} position={[0.08, 0.32, 0.05]} />
                )}
              </group>

              <mesh material={mats.timberDark} position={[0.78, 0.38, -0.05]} castShadow>
                <boxGeometry args={[0.04, 0.72, 0.04]} />
              </mesh>
              <mesh material={mats.timberDark} position={[0.62, 0.48, -0.05]} rotation={[0, 0, -0.42]} castShadow>
                <boxGeometry args={[0.03, 0.54, 1.15]} />
              </mesh>
              <mesh material={mats.thatchRoof} position={[0.62, 0.50, -0.05]} rotation={[0, 0, -0.42]} castShadow receiveShadow>
                <boxGeometry args={[0.04, 0.55, 1.18]} />
              </mesh>

              <group position={[0.60, 0, -0.2]}>
                <mesh material={mats.timberLight} position={[0, 0.10, 0]} rotation={[Math.PI / 2, 0, 0]} castShadow>
                  <cylinderGeometry args={[0.06, 0.06, 0.45, 6]} />
                </mesh>
                <mesh material={mats.timberLight} position={[0, 0.10, 0.22]} rotation={[Math.PI / 2, 0, 0]} castShadow>
                  <cylinderGeometry args={[0.06, 0.06, 0.45, 6]} />
                </mesh>
                <mesh material={mats.timberLight} position={[0, 0.20, 0.11]} rotation={[Math.PI / 2, 0, 0]} castShadow>
                  <cylinderGeometry args={[0.06, 0.06, 0.45, 6]} />
                </mesh>
              </group>

              <group position={[-0.45, 0, 0.68]}>
                <mesh material={mats.timberDark} position={[0, 0.15, 0]} castShadow receiveShadow>
                  <cylinderGeometry args={[0.18, 0.22, 0.3, 6]} />
                </mesh>
                <mesh material={mats.timberLight} position={[0, 0.301, 0]}>
                  <cylinderGeometry args={[0.17, 0.17, 0.01, 6]} />
                </mesh>
                <mesh material={mats.timberLight} position={[0.04, 0.46, 0]} rotation={[0, 0, -0.45]} castShadow>
                  <cylinderGeometry args={[0.02, 0.025, 0.38, 4]} />
                </mesh>
                <mesh material={mats.axeBlade} position={[0, 0.33, 0]} rotation={[0, 0, -0.45]} castShadow>
                  <boxGeometry args={[0.09, 0.06, 0.025]} />
                </mesh>
              </group>

              <mesh material={mats.sawBlade} position={[0.2, 0.4, 0.62]} rotation={[0, 0, 0.25]} castShadow>
                <boxGeometry args={[0.08, 0.72, 0.015]} />
              </mesh>

              <mesh material={mats.woodShavings} position={[-0.3, 0.01, 0.52]} receiveShadow>
                <cylinderGeometry args={[0.35, 0.35, 0.01, 8]} />
              </mesh>

              <group ref={roofRef}>
                <mesh material={mats.thatchRoof} position={[-0.15, 1.45, 0.38]} rotation={[-0.85, 0, 0]} castShadow receiveShadow>
                  <boxGeometry args={[1.68, 1.15, 0.10]} />
                </mesh>
                <mesh material={mats.thatchRoof} position={[-0.15, 1.45, -0.48]} rotation={[0.85, 0, 0]} castShadow receiveShadow>
                  <boxGeometry args={[1.68, 1.15, 0.10]} />
                </mesh>
                <mesh material={mats.timberDark} position={[-0.15, 1.88, -0.05]} castShadow>
                  <boxGeometry args={[1.78, 0.12, 0.12]} />
                </mesh>

                {[-1.02, 0.72].map((gx) => (
                  <group key={`lj-finial-${gx}`} position={[gx, 1.92, -0.05]}>
                    <mesh material={mats.timberLight} rotation={[0.55, 0, 0]} castShadow>
                      <boxGeometry args={[0.07, 0.45, 0.05]} />
                    </mesh>
                    <mesh material={mats.timberLight} rotation={[-0.55, 0, 0]} castShadow>
                      <boxGeometry args={[0.07, 0.45, 0.05]} />
                    </mesh>
                  </group>
                ))}

                {[-0.88, 0.58].map((gx) => (
                  <group key={`lj-gable-${gx}`}>
                    <mesh material={mats.timberDark} position={[gx, 1.42, -0.05]} castShadow receiveShadow>
                      <boxGeometry args={[0.08, 0.72, 1.15]} />
                    </mesh>
                  </group>
                ))}

                <mesh material={mats.stoneDark} position={[-0.45, 1.65, -0.4]} castShadow receiveShadow>
                  <boxGeometry args={[0.26, 1.15, 0.26]} />
                </mesh>
                <mesh material={mats.stoneMed} position={[-0.45, 2.24, -0.4]} castShadow>
                  <boxGeometry args={[0.32, 0.06, 0.32]} />
                </mesh>
                <group ref={smokePuffsRef} position={[-0.45, 2.32, -0.4]}>
                  {[0, 1, 2].map((i) => (
                    <mesh key={`lj-s-${i}`} material={mats.smokeWhite}>
                      <dodecahedronGeometry args={[0.13, 0]} />
                    </mesh>
                  ))}
                </group>
              </group>
            </group>
          )}

          {type === 'campfire' && (
            <group>
              <mesh position={[0, 0.02, 0]} receiveShadow>
                <cylinderGeometry args={[0.48, 0.48, 0.02, 10]} />
                <meshStandardMaterial color="#221e1a" roughness={1.0} flatShading />
              </mesh>
              {[0, 1, 2, 3, 4, 5, 6, 7].map((i) => {
                const angle = (i / 8) * Math.PI * 2;
                return (
                  <mesh
                    key={`c-stone-${i}`}
                    material={mats.stoneMed}
                    position={[Math.cos(angle) * 0.32, 0.08, Math.sin(angle) * 0.32]}
                    rotation={[i * 0.4, i * 0.8, 0]}
                    scale={[0.15, 0.12, 0.15]}
                    castShadow
                    receiveShadow
                  >
                    <dodecahedronGeometry args={[1, 0]} />
                  </mesh>
                );
              })}
              <mesh material={mats.timberDark} position={[0, 0.08, 0]} rotation={[0.2, 0.4, 0.1]} castShadow>
                <cylinderGeometry args={[0.06, 0.08, 0.52, 5]} />
              </mesh>
              <mesh material={mats.timberDark} position={[0, 0.09, 0]} rotation={[-0.2, -0.7, 0.1]} castShadow>
                <cylinderGeometry args={[0.06, 0.08, 0.52, 5]} />
              </mesh>
              <mesh material={mats.timberDark} position={[-0.22, 0.28, -0.15]} rotation={[0.2, 0, -0.3]} castShadow>
                <cylinderGeometry args={[0.02, 0.025, 0.6, 4]} />
              </mesh>
              <mesh material={mats.timberDark} position={[0.22, 0.28, -0.15]} rotation={[0.2, 0, 0.3]} castShadow>
                <cylinderGeometry args={[0.02, 0.025, 0.6, 4]} />
              </mesh>
              <mesh material={mats.timberDark} position={[0, 0.28, 0.24]} rotation={[-0.3, 0, 0]} castShadow>
                <cylinderGeometry args={[0.02, 0.025, 0.6, 4]} />
              </mesh>
              <mesh material={mats.stoneDark} position={[0, 0.22, 0]} castShadow>
                <sphereGeometry args={[0.12, 8, 8]} />
              </mesh>

              <group position={[-0.44, 0.08, 0]}>
                <mesh material={mats.timberLight} castShadow receiveShadow>
                  <boxGeometry args={[0.14, 0.12, 0.48]} />
                </mesh>
              </group>
              <group position={[0.44, 0.08, 0]}>
                <mesh material={mats.timberLight} castShadow receiveShadow>
                  <boxGeometry args={[0.14, 0.12, 0.48]} />
                </mesh>
              </group>

              <mesh material={mats.timberLight} position={[-0.28, 0.05, -0.35]} rotation={[0, 0.4, Math.PI / 2]} castShadow>
                <cylinderGeometry args={[0.03, 0.03, 0.24, 5]} />
              </mesh>
              <mesh material={mats.timberDark} position={[0.32, 0.10, -0.32]} castShadow>
                <cylinderGeometry args={[0.08, 0.07, 0.18, 6]} />
              </mesh>

              <group ref={fireFlameRef} position={[0, 0.14, 0]}>
                <mesh material={mats.fireOrange}>
                  <dodecahedronGeometry args={[0.18, 0]} />
                </mesh>
                <mesh material={mats.fireYellow} position={[0, 0.14, 0]}>
                  <coneGeometry args={[0.12, 0.32, 4]} />
                </mesh>
              </group>
              <pointLight color="#f97316" intensity={2.2} distance={6} decay={2} position={[0, 0.45, 0]} />
            </group>
          )}

          {type === 'peasant_house' && (
            <group>
              <mesh material={mats.stoneDark} position={[0, 0.08, 0]} castShadow receiveShadow>
                <boxGeometry args={[2.96, 0.16, 1.96]} />
              </mesh>

              <mesh material={mats.stoneMed} position={[0, 0.06, 1.05]} castShadow receiveShadow>
                <boxGeometry args={[0.76, 0.1, 0.25]} />
              </mesh>

              <mesh material={mats.floorPlanks} position={[0, 0.09, 0]} receiveShadow>
                <boxGeometry args={[2.78, 0.04, 1.78]} />
              </mesh>

              <mesh material={mats.redBanner} position={[0, 0.1, -0.15]} receiveShadow>
                <boxGeometry args={[1.1, 0.01, 0.75]} />
              </mesh>

              <mesh material={mats.plaster} position={[0, 0.72, -0.88]} castShadow receiveShadow>
                <boxGeometry args={[2.78, 1.20, 0.12]} />
              </mesh>
              <mesh material={mats.plaster} position={[-1.38, 0.72, 0]} castShadow receiveShadow>
                <boxGeometry args={[0.12, 1.20, 1.78]} />
              </mesh>
              <mesh material={mats.plaster} position={[1.38, 0.72, 0]} castShadow receiveShadow>
                <boxGeometry args={[0.12, 1.20, 1.78]} />
              </mesh>
              <mesh material={mats.plaster} position={[-0.85, 0.72, 0.88]} castShadow receiveShadow>
                <boxGeometry args={[1.05, 1.20, 0.12]} />
              </mesh>
              <mesh material={mats.plaster} position={[0.85, 0.72, 0.88]} castShadow receiveShadow>
                <boxGeometry args={[1.05, 1.20, 0.12]} />
              </mesh>

              <mesh material={mats.timberDark} position={[0, 1.34, -0.88]} castShadow>
                <boxGeometry args={[2.86, 0.08, 0.14]} />
              </mesh>
              <mesh material={mats.timberDark} position={[-1.38, 1.34, 0]} castShadow>
                <boxGeometry args={[0.14, 0.08, 1.86]} />
              </mesh>
              <mesh material={mats.timberDark} position={[1.38, 1.34, 0]} castShadow>
                <boxGeometry args={[0.14, 0.08, 1.86]} />
              </mesh>
              <mesh material={mats.timberDark} position={[-0.85, 1.34, 0.88]} castShadow>
                <boxGeometry args={[1.15, 0.08, 0.14]} />
              </mesh>
              <mesh material={mats.timberDark} position={[0.85, 1.34, 0.88]} castShadow>
                <boxGeometry args={[1.15, 0.08, 0.14]} />
              </mesh>
              <mesh material={mats.timberDark} position={[0, 1.28, 0.88]} castShadow>
                <boxGeometry args={[0.65, 0.12, 0.16]} />
              </mesh>

              {[-1.42, 1.42].map((bx) =>
                [-0.92, 0.92].map((bz) => (
                  <mesh key={`ph-p-${bx}-${bz}`} material={mats.timberDark} position={[bx, 0.72, bz]} castShadow>
                    <boxGeometry args={[0.14, 1.25, 0.14]} />
                  </mesh>
                ))
              )}
              {[-0.32, 0.32].map((dx) => (
                <mesh key={`ph-df-${dx}`} material={mats.timberDark} position={[dx, 0.72, 0.88]} castShadow>
                  <boxGeometry args={[0.08, 1.20, 0.16]} />
                </mesh>
              ))}

              <mesh material={mats.timberDark} position={[-0.85, 0.72, 0.90]} rotation={[0, 0, 0.62]} castShadow>
                <boxGeometry args={[0.07, 1.25, 0.08]} />
              </mesh>
              <mesh material={mats.timberDark} position={[0.85, 0.72, 0.90]} rotation={[0, 0, -0.62]} castShadow>
                <boxGeometry args={[0.07, 1.25, 0.08]} />
              </mesh>
              <mesh material={mats.timberDark} position={[-0.75, 0.72, -0.90]} rotation={[0, 0, 0.58]} castShadow>
                <boxGeometry args={[0.07, 1.28, 0.08]} />
              </mesh>
              <mesh material={mats.timberDark} position={[0.75, 0.72, -0.90]} rotation={[0, 0, -0.58]} castShadow>
                <boxGeometry args={[0.07, 1.28, 0.08]} />
              </mesh>

              <group position={[0, 1.36, 0.98]}>
                <mesh material={mats.timberDark} position={[-0.32, -0.12, 0]} rotation={[0.45, 0, 0]} castShadow>
                  <boxGeometry args={[0.06, 0.32, 0.06]} />
                </mesh>
                <mesh material={mats.timberDark} position={[0.32, -0.12, 0]} rotation={[0.45, 0, 0]} castShadow>
                  <boxGeometry args={[0.06, 0.32, 0.06]} />
                </mesh>
                <mesh material={mats.thatchRoof} position={[0, 0.05, 0.12]} rotation={[0.35, 0, 0]} castShadow receiveShadow>
                  <boxGeometry args={[0.82, 0.05, 0.38]} />
                </mesh>
              </group>

              <group position={[1.42, 0.22, 0.88]}>
                <mesh material={mats.timberDark} castShadow receiveShadow>
                  <cylinderGeometry args={[0.18, 0.16, 0.44, 8]} />
                </mesh>
                <mesh material={mats.sawBlade} position={[0, 0.12, 0]}>
                  <cylinderGeometry args={[0.185, 0.185, 0.025, 8]} />
                </mesh>
                <mesh material={mats.sawBlade} position={[0, -0.12, 0]}>
                  <cylinderGeometry args={[0.175, 0.175, 0.025, 8]} />
                </mesh>
              </group>

              <group position={[-1.52, 0, 0]}>
                <mesh material={mats.timberDark} position={[-0.22, 0.48, 0.4]} castShadow>
                  <cylinderGeometry args={[0.03, 0.035, 0.96, 5]} />
                </mesh>
                <mesh material={mats.timberDark} position={[-0.22, 0.48, -0.4]} castShadow>
                  <cylinderGeometry args={[0.03, 0.035, 0.96, 5]} />
                </mesh>
                <mesh material={mats.thatchRoof} position={[-0.11, 0.82, 0]} rotation={[0, 0, 0.42]} castShadow receiveShadow>
                  <boxGeometry args={[0.38, 0.04, 1.15]} />
                </mesh>
                <mesh material={mats.timberLight} position={[-0.1, 0.08, -0.2]} rotation={[0, 0, Math.PI / 2]} castShadow>
                  <cylinderGeometry args={[0.05, 0.05, 0.35, 6]} />
                </mesh>
                <mesh material={mats.timberLight} position={[-0.1, 0.08, 0.15]} rotation={[0, 0, Math.PI / 2]} castShadow>
                  <cylinderGeometry args={[0.05, 0.05, 0.35, 6]} />
                </mesh>
                <mesh material={mats.timberLight} position={[-0.1, 0.16, -0.02]} rotation={[0, 0, Math.PI / 2]} castShadow>
                  <cylinderGeometry args={[0.045, 0.045, 0.32, 6]} />
                </mesh>
              </group>

              <mesh position={[-1.42, 0.75, 0]} material={isLightOn ? mats.windowLit : mats.windowUnlit}>
                <boxGeometry args={[0.04, 0.36, 0.38]} />
              </mesh>
              <mesh position={[1.42, 0.75, 0]} material={isLightOn ? mats.windowLit : mats.windowUnlit}>
                <boxGeometry args={[0.04, 0.36, 0.38]} />
              </mesh>
              <mesh position={[-0.85, 0.75, 0.92]} material={isLightOn ? mats.windowLit : mats.windowUnlit}>
                <boxGeometry args={[0.36, 0.36, 0.04]} />
              </mesh>
              <mesh position={[0.85, 0.75, 0.92]} material={isLightOn ? mats.windowLit : mats.windowUnlit}>
                <boxGeometry args={[0.36, 0.36, 0.04]} />
              </mesh>

              <group position={[-0.95, 0, -0.15]}>
                <mesh material={mats.timberDark} position={[0, 0.08, 0]} castShadow>
                  <boxGeometry args={[0.72, 0.14, 1.18]} />
                </mesh>
                <mesh material={mats.timberDark} position={[0, 0.36, -0.55]} castShadow>
                  <boxGeometry args={[0.74, 0.52, 0.08]} />
                </mesh>
                <mesh material={mats.timberDark} position={[0, 0.22, 0.55]} castShadow>
                  <boxGeometry args={[0.74, 0.26, 0.08]} />
                </mesh>
                <mesh material={mats.bedStraw} position={[0, 0.14, 0]} receiveShadow>
                  <boxGeometry args={[0.64, 0.10, 1.02]} />
                </mesh>
                <mesh material={mats.pillowWhite} position={[0, 0.20, -0.38]}>
                  <boxGeometry args={[0.52, 0.08, 0.26]} />
                </mesh>
                <mesh material={mats.bedLinenRed} position={[0, 0.18, 0.08]} castShadow>
                  <boxGeometry args={[0.66, 0.11, 0.72]} />
                </mesh>
                <mesh material={mats.pillowWhite} position={[0, 0.19, -0.24]}>
                  <boxGeometry args={[0.66, 0.02, 0.08]} />
                </mesh>
                <mesh material={mats.timberLight} position={[0.48, 0.16, -0.45]} castShadow receiveShadow>
                  <boxGeometry args={[0.26, 0.3, 0.26]} />
                </mesh>
                <mesh material={isLightOn ? mats.candleGlow : mats.candleUnlit} position={[0.48, 0.33, -0.45]}>
                  <cylinderGeometry args={[0.015, 0.02, 0.06, 5]} />
                </mesh>
                {isLightOn && (
                  <pointLight color="#fde047" intensity={0.6} distance={2.0} position={[0.48, 0.4, -0.45]} />
                )}
              </group>

              <group position={[0.95, 0, -0.15]}>
                <mesh material={mats.timberDark} position={[0, 0.08, 0]} castShadow>
                  <boxGeometry args={[0.72, 0.14, 1.18]} />
                </mesh>
                <mesh material={mats.timberDark} position={[0, 0.36, -0.55]} castShadow>
                  <boxGeometry args={[0.74, 0.52, 0.08]} />
                </mesh>
                <mesh material={mats.timberDark} position={[0, 0.22, 0.55]} castShadow>
                  <boxGeometry args={[0.74, 0.26, 0.08]} />
                </mesh>
                <mesh material={mats.bedStraw} position={[0, 0.14, 0]} receiveShadow>
                  <boxGeometry args={[0.64, 0.10, 1.02]} />
                </mesh>
                <mesh material={mats.pillowWhite} position={[0, 0.20, -0.38]}>
                  <boxGeometry args={[0.52, 0.08, 0.26]} />
                </mesh>
                <mesh material={mats.bedLinenGreen} position={[0, 0.18, 0.08]} castShadow>
                  <boxGeometry args={[0.66, 0.11, 0.72]} />
                </mesh>
                <mesh material={mats.pillowWhite} position={[0, 0.19, -0.24]}>
                  <boxGeometry args={[0.66, 0.02, 0.08]} />
                </mesh>
                <mesh material={mats.timberMed} position={[-0.48, 0.14, -0.45]} castShadow receiveShadow>
                  <boxGeometry args={[0.3, 0.24, 0.26]} />
                </mesh>
                <mesh material={mats.goldTrim} position={[-0.48, 0.16, -0.31]}>
                  <boxGeometry args={[0.04, 0.04, 0.02]} />
                </mesh>
              </group>

              <group position={[0, 0, -0.84]}>
                <mesh material={mats.stoneMed} position={[0, 0.45, 0]} castShadow receiveShadow>
                  <boxGeometry args={[0.85, 0.90, 0.32]} />
                </mesh>
                <mesh material={isLightOn ? mats.fireOrange : mats.fireplaceCold} position={[0, 0.18, 0.1]}>
                  <dodecahedronGeometry args={[0.12, 0]} />
                </mesh>
                {isLightOn && (
                  <pointLight color="#f97316" intensity={1.3} distance={3.5} position={[0, 0.28, 0.15]} />
                )}
                <mesh material={mats.stoneDark} position={[0, 0.92, 0.08]} castShadow>
                  <boxGeometry args={[0.92, 0.06, 0.18]} />
                </mesh>
              </group>

              <group position={[0, 0, 0.18]}>
                <mesh material={mats.timberLight} position={[0, 0.22, 0]} castShadow receiveShadow>
                  <boxGeometry args={[0.65, 0.04, 0.44]} />
                </mesh>
                <mesh material={mats.timberDark} position={[-0.26, 0.11, -0.16]} castShadow>
                  <cylinderGeometry args={[0.02, 0.025, 0.22, 4]} />
                </mesh>
                <mesh material={mats.timberDark} position={[0.26, 0.11, -0.16]} castShadow>
                  <cylinderGeometry args={[0.02, 0.025, 0.22, 4]} />
                </mesh>
                <mesh material={mats.timberDark} position={[-0.26, 0.11, 0.16]} castShadow>
                  <cylinderGeometry args={[0.02, 0.025, 0.22, 4]} />
                </mesh>
                <mesh material={mats.timberDark} position={[0.26, 0.11, 0.16]} castShadow>
                  <cylinderGeometry args={[0.02, 0.025, 0.22, 4]} />
                </mesh>
                <mesh material={mats.goldWheat} position={[-0.1, 0.26, 0]}>
                  <dodecahedronGeometry args={[0.05, 0]} />
                </mesh>
                <mesh material={isLightOn ? mats.candleGlow : mats.candleUnlit} position={[0.1, 0.27, 0]}>
                  <cylinderGeometry args={[0.015, 0.02, 0.07, 5]} />
                </mesh>
                {isLightOn && (
                  <pointLight color="#fde047" intensity={0.6} distance={2.2} position={[0.1, 0.34, 0]} />
                )}
                <mesh material={mats.timberDark} position={[-0.44, 0.12, 0]} castShadow>
                  <boxGeometry args={[0.16, 0.18, 0.4]} />
                </mesh>
                <mesh material={mats.timberDark} position={[0.44, 0.12, 0]} castShadow>
                  <boxGeometry args={[0.16, 0.18, 0.4]} />
                </mesh>
              </group>

              <group ref={roofRef}>
                <mesh material={mats.thatchRoof} position={[0, 1.95, 0.52]} rotation={[-0.91, 0, 0]} castShadow receiveShadow>
                  <boxGeometry args={[3.15, 1.38, 0.12]} />
                </mesh>
                <mesh material={mats.timberDark} position={[0, 1.48, 0.98]} rotation={[-0.91, 0, 0]} castShadow>
                  <boxGeometry args={[3.17, 0.08, 0.14]} />
                </mesh>

                <mesh material={mats.thatchRoof} position={[0, 1.95, -0.52]} rotation={[0.91, 0, 0]} castShadow receiveShadow>
                  <boxGeometry args={[3.15, 1.38, 0.12]} />
                </mesh>
                <mesh material={mats.timberDark} position={[0, 1.48, -0.98]} rotation={[0.91, 0, 0]} castShadow>
                  <boxGeometry args={[3.17, 0.08, 0.14]} />
                </mesh>

                <mesh material={mats.timberDark} position={[0, 2.44, 0]} castShadow>
                  <boxGeometry args={[3.25, 0.14, 0.14]} />
                </mesh>

                {[-1.56, 1.56].map((gx) => (
                  <group key={`ph-finial-${gx}`} position={[gx, 2.48, 0]}>
                    <mesh material={mats.timberLight} rotation={[0.55, 0, 0]} castShadow>
                      <boxGeometry args={[0.08, 0.52, 0.06]} />
                    </mesh>
                    <mesh material={mats.timberLight} rotation={[-0.55, 0, 0]} castShadow>
                      <boxGeometry args={[0.08, 0.52, 0.06]} />
                    </mesh>
                  </group>
                ))}

                {[-1.39, 1.39].map((gx) => (
                  <group key={`ph-gable-${gx}`}>
                    <mesh material={mats.plaster} position={[gx, 1.82, 0]} castShadow receiveShadow>
                      <boxGeometry args={[0.08, 0.88, 1.52]} />
                    </mesh>
                    <mesh material={mats.timberDark} position={[gx, 1.88, 0]} castShadow>
                      <boxGeometry args={[0.12, 1.05, 0.10]} />
                    </mesh>
                    <mesh material={mats.timberDark} position={[gx, 1.94, 0.48]} rotation={[-0.91, 0, 0]} castShadow>
                      <boxGeometry args={[0.12, 1.35, 0.08]} />
                    </mesh>
                    <mesh material={mats.timberDark} position={[gx, 1.94, -0.48]} rotation={[0.91, 0, 0]} castShadow>
                      <boxGeometry args={[0.12, 1.35, 0.08]} />
                    </mesh>
                  </group>
                ))}

                <mesh material={mats.stoneDark} position={[0, 2.22, -0.84]} castShadow receiveShadow>
                  <boxGeometry args={[0.38, 1.45, 0.38]} />
                </mesh>
                <mesh material={mats.stoneMed} position={[0, 2.96, -0.84]} castShadow>
                  <boxGeometry args={[0.46, 0.08, 0.46]} />
                </mesh>

                <group ref={smokePuffsRef} position={[0, 3.05, -0.84]}>
                  {[0, 1, 2].map((i) => (
                    <mesh key={`s-${i}`} material={mats.smokeWhite}>
                      <dodecahedronGeometry args={[0.18, 0]} />
                    </mesh>
                  ))}
                </group>
              </group>
            </group>
          )}

          {type === 'market' && (
            <group>
              <mesh material={mats.timberDark} position={[0, 0.08, 0]} receiveShadow>
                <boxGeometry args={[1.75, 0.16, 1.75]} />
              </mesh>
              {[
                [-0.75, -0.75],
                [0.75, -0.75],
                [-0.75, 0.75],
                [0.75, 0.75],
              ].map(([cx, cz], idx) => (
                <group key={`p-${idx}`} position={[cx, 0.75, cz]}>
                  <mesh material={mats.timberMed} castShadow>
                    <cylinderGeometry args={[0.05, 0.07, 1.35, 6]} />
                  </mesh>
                </group>
              ))}
              <mesh material={mats.timberLight} position={[-0.2, 0.42, 0.15]} castShadow receiveShadow>
                <boxGeometry args={[1.1, 0.52, 0.55]} />
              </mesh>
              <mesh material={mats.timberLight} position={[0.45, 0.42, -0.2]} castShadow receiveShadow>
                <boxGeometry args={[0.45, 0.52, 0.75]} />
              </mesh>
              <mesh material={mats.timberDark} position={[-0.5, 0.78, 0.15]} castShadow>
                <cylinderGeometry args={[0.14, 0.16, 0.28, 6]} />
              </mesh>
              <mesh material={mats.redBanner} position={[-0.15, 0.74, 0.2]} castShadow>
                <dodecahedronGeometry args={[0.1, 0]} />
              </mesh>
              <mesh material={mats.scaffolding} position={[-0.15, 0.69, 0.2]}>
                <cylinderGeometry args={[0.12, 0.1, 0.06, 6]} />
              </mesh>
              <mesh material={mats.goldTrim} position={[0.18, 0.72, 0.18]} castShadow>
                <cylinderGeometry args={[0.11, 0.11, 0.08, 6]} />
              </mesh>
              <mesh material={mats.timberMed} position={[0.45, 0.75, -0.2]} castShadow>
                <boxGeometry args={[0.32, 0.28, 0.32]} />
              </mesh>
              <mesh material={mats.timberDark} position={[0, 1.62, 0]} castShadow>
                <boxGeometry args={[1.86, 0.08, 0.08]} />
              </mesh>
              <mesh material={mats.awningGreen} position={[0, 1.42, 0.42]} rotation={[-0.55, 0, 0]} castShadow>
                <boxGeometry args={[1.82, 0.95, 0.04]} />
              </mesh>
              <mesh material={mats.awningGreen} position={[0, 1.42, -0.42]} rotation={[0.55, 0, 0]} castShadow>
                <boxGeometry args={[1.82, 0.95, 0.04]} />
              </mesh>
              <mesh material={mats.awningWhite} position={[0, 1.15, 0.78]}>
                <boxGeometry args={[1.84, 0.08, 0.04]} />
              </mesh>
              <mesh material={mats.awningWhite} position={[0, 1.15, -0.78]}>
                <boxGeometry args={[1.84, 0.08, 0.04]} />
              </mesh>
              <mesh material={mats.goldTrim} position={[0, 1.25, 0]} castShadow>
                <dodecahedronGeometry args={[0.08, 0]} />
              </mesh>
            </group>
          )}

          {type === 'manor' && (
            <group>
              <mesh material={mats.stoneDark} position={[0, 0.45, 0]} castShadow receiveShadow>
                <boxGeometry args={[2.6, 0.9, 2.6]} />
              </mesh>
              {[
                [-1.3, -1.3],
                [1.3, -1.3],
                [-1.3, 1.3],
                [1.3, 1.3],
              ].map(([qx, qz], idx) => (
                <mesh key={`mq-${idx}`} material={mats.stoneLight} position={[qx, 0.45, qz]} castShadow>
                  <boxGeometry args={[0.22, 0.92, 0.22]} />
                </mesh>
              ))}
              <mesh material={mats.stoneMed} position={[0, 0.5, 1.32]} castShadow>
                <boxGeometry args={[0.85, 0.88, 0.12]} />
              </mesh>
              <mesh material={mats.timberDark} position={[0, 0.44, 1.34]} castShadow>
                <boxGeometry args={[0.62, 0.76, 0.08]} />
              </mesh>
              <mesh material={mats.plaster} position={[0, 1.25, 0]} castShadow receiveShadow>
                <boxGeometry args={[2.55, 0.85, 2.55]} />
              </mesh>
              {[
                [-1.28, -1.28],
                [1.28, -1.28],
                [-1.28, 1.28],
                [1.28, 1.28],
              ].map(([bx, bz], idx) => (
                <mesh key={`mb-${idx}`} material={mats.timberDark} position={[bx, 1.25, bz]} castShadow>
                  <boxGeometry args={[0.14, 0.88, 0.14]} />
                </mesh>
              ))}
              <mesh position={[-0.6, 1.25, 1.29]} material={isLightOn ? mats.windowLit : mats.windowUnlit}>
                <boxGeometry args={[0.35, 0.42, 0.04]} />
              </mesh>
              <mesh position={[0.6, 1.25, 1.29]} material={isLightOn ? mats.windowLit : mats.windowUnlit}>
                <boxGeometry args={[0.35, 0.42, 0.04]} />
              </mesh>
              <group position={[1.12, 1.2, 1.12]}>
                <mesh material={mats.stoneMed} position={[0, 0.4, 0]} castShadow receiveShadow>
                  <cylinderGeometry args={[0.42, 0.48, 1.8, 8]} />
                </mesh>
                <mesh material={mats.royalBlueRoof} position={[0, 1.65, 0]} castShadow receiveShadow>
                  <coneGeometry args={[0.55, 0.9, 8]} />
                </mesh>
                <mesh material={mats.goldTrim} position={[0, 2.15, 0]}>
                  <sphereGeometry args={[0.06, 6, 6]} />
                </mesh>
                <mesh material={mats.redBanner} position={[0.2, 2.05, 0]} castShadow>
                  <boxGeometry args={[0.35, 0.22, 0.02]} />
                </mesh>
              </group>

              <mesh material={mats.royalBlueRoof} position={[0, 2.24, 0.62]} rotation={[-0.91, 0, 0]} castShadow receiveShadow>
                <boxGeometry args={[2.84, 1.58, 0.12]} />
              </mesh>
              <mesh material={mats.royalBlueRoof} position={[0, 2.24, -0.62]} rotation={[0.91, 0, 0]} castShadow receiveShadow>
                <boxGeometry args={[2.84, 1.58, 0.12]} />
              </mesh>
              <mesh material={mats.timberDark} position={[0, 2.82, 0]} castShadow>
                <boxGeometry args={[2.95, 0.14, 0.14]} />
              </mesh>

              {[-1.44, 1.44].map((gx) => (
                <group key={`m-finial-${gx}`} position={[gx, 2.86, 0]}>
                  <mesh material={mats.goldTrim} rotation={[0.55, 0, 0]} castShadow>
                    <boxGeometry args={[0.08, 0.55, 0.06]} />
                  </mesh>
                  <mesh material={mats.goldTrim} rotation={[-0.55, 0, 0]} castShadow>
                    <boxGeometry args={[0.08, 0.55, 0.06]} />
                  </mesh>
                </group>
              ))}

              {[-1.32, 1.32].map((gx) => (
                <mesh key={`m-gable-${gx}`} material={mats.plaster} position={[gx, 2.15, 0]} castShadow receiveShadow>
                  <boxGeometry args={[0.08, 0.95, 1.85]} />
                </mesh>
              ))}

              <group position={[0, 2.25, 0.75]}>
                <mesh material={mats.plaster} position={[0, 0, 0]} castShadow receiveShadow>
                  <boxGeometry args={[0.62, 0.52, 0.45]} />
                </mesh>
                <mesh position={[0, 0.04, 0.24]} material={isLightOn ? mats.windowLit : mats.windowUnlit}>
                  <boxGeometry args={[0.32, 0.32, 0.02]} />
                </mesh>
                <mesh material={mats.royalBlueRoof} position={[0, 0.32, 0]} rotation={[0.25, 0, 0]} castShadow>
                  <boxGeometry args={[0.72, 0.06, 0.55]} />
                </mesh>
              </group>

              <mesh material={mats.redBanner} position={[0, 1.02, 1.35]} castShadow>
                <boxGeometry args={[0.35, 0.42, 0.04]} />
              </mesh>
              <mesh material={mats.goldTrim} position={[0, 1.02, 1.38]}>
                <boxGeometry args={[0.15, 0.18, 0.02]} />
              </mesh>

              <mesh material={mats.stoneMed} position={[-0.85, 2.25, -0.6]} castShadow receiveShadow>
                <boxGeometry args={[0.38, 1.5, 0.38]} />
              </mesh>
              <mesh material={mats.stoneDark} position={[-0.85, 3.02, -0.6]} castShadow>
                <boxGeometry args={[0.46, 0.08, 0.46]} />
              </mesh>
              <group ref={smokePuffsRef} position={[-0.85, 3.12, -0.6]}>
                {[0, 1, 2].map((i) => (
                  <mesh key={`ms-${i}`} material={mats.smokeWhite}>
                    <dodecahedronGeometry args={[0.22, 0]} />
                  </mesh>
                ))}
              </group>
            </group>
          )}

          {type === 'stockpile' && (
            <group>
              <mesh material={mats.timberDark} position={[0, 0.06, 0]} receiveShadow>
                <boxGeometry args={[1.78, 0.12, 1.78]} />
              </mesh>
              <mesh material={mats.timberMed} position={[0, 0.14, 0.84]} castShadow>
                <boxGeometry args={[1.78, 0.08, 0.08]} />
              </mesh>
              <mesh material={mats.timberMed} position={[0, 0.14, -0.84]} castShadow>
                <boxGeometry args={[1.78, 0.08, 0.08]} />
              </mesh>
              <mesh material={mats.timberMed} position={[-0.84, 0.14, 0]} castShadow>
                <boxGeometry args={[0.08, 0.08, 1.78]} />
              </mesh>
              <group position={[-0.42, 0, -0.35]}>
                <mesh material={mats.timberLight} position={[0, 0.22, 0]} rotation={[0, 0, Math.PI / 2]} castShadow>
                  <cylinderGeometry args={[0.09, 0.09, 0.72, 6]} />
                </mesh>
                <mesh material={mats.timberLight} position={[0, 0.22, 0.18]} rotation={[0, 0, Math.PI / 2]} castShadow>
                  <cylinderGeometry args={[0.09, 0.09, 0.72, 6]} />
                </mesh>
                <mesh material={mats.timberLight} position={[0, 0.36, 0.09]} rotation={[0, 0, Math.PI / 2]} castShadow>
                  <cylinderGeometry args={[0.085, 0.085, 0.68, 6]} />
                </mesh>
              </group>
              <mesh material={mats.stoneLight} position={[0.45, 0.24, -0.4]} castShadow receiveShadow>
                <boxGeometry args={[0.42, 0.3, 0.36]} />
              </mesh>
              <mesh material={mats.stoneMed} position={[0.45, 0.46, -0.4]} castShadow receiveShadow>
                <boxGeometry args={[0.32, 0.22, 0.28]} />
              </mesh>
              <mesh material={mats.timberMed} position={[-0.38, 0.3, 0.4]} castShadow>
                <boxGeometry args={[0.48, 0.44, 0.48]} />
              </mesh>
              <mesh material={mats.timberDark} position={[0.42, 0.3, 0.35]} castShadow>
                <cylinderGeometry args={[0.18, 0.2, 0.48, 6]} />
              </mesh>
            </group>
          )}

          {type === 'wheat_farm' && (
            <group>
              <mesh material={mats.richSoil} position={[0, 0.04, 0]} receiveShadow>
                <boxGeometry args={[2.75, 0.08, 2.75]} />
              </mesh>
              {[-1.35, 1.35].map((fx) => (
                <mesh key={`wf-fx-${fx}`} material={mats.timberDark} position={[fx, 0.18, 0]} castShadow>
                  <boxGeometry args={[0.06, 0.22, 2.75]} />
                </mesh>
              ))}
              {[-1.35, 1.35].map((fz) => (
                <mesh key={`wf-fz-${fz}`} material={mats.timberDark} position={[0, 0.18, fz]} castShadow>
                  <boxGeometry args={[2.75, 0.22, 0.06]} />
                </mesh>
              ))}
              {[-1.0, -0.5, 0, 0.5, 1.0].map((wx) =>
                [-1.0, -0.5, 0, 0.5, 1.0].map((wz) => (
                  <group key={`wh-${wx}-${wz}`} position={[wx + (Math.sin(wx * 7 + wz) * 0.06), 0, wz + (Math.cos(wz * 7 + wx) * 0.06)]}>
                    <mesh material={mats.goldWheat} position={[0, 0.24, 0]} scale={[0.11, 0.38, 0.11]} castShadow>
                      <coneGeometry args={[1, 1.2, 4]} />
                    </mesh>
                  </group>
                ))
              )}
              <group position={[0, 0, 0]}>
                <mesh material={mats.timberDark} position={[0, 0.45, 0]} castShadow>
                  <cylinderGeometry args={[0.02, 0.025, 0.9, 4]} />
                </mesh>
                <mesh material={mats.timberDark} position={[0, 0.65, 0]} rotation={[0, 0, Math.PI / 2]} castShadow>
                  <cylinderGeometry args={[0.018, 0.018, 0.55, 4]} />
                </mesh>
                <mesh material={mats.goldWheat} position={[0, 0.8, 0]} castShadow>
                  <sphereGeometry args={[0.08, 6, 6]} />
                </mesh>
                <mesh material={mats.thatchRoof} position={[0, 0.88, 0]} castShadow>
                  <coneGeometry args={[0.18, 0.12, 6]} />
                </mesh>
                <mesh material={mats.redBanner} position={[0, 0.6, 0]} castShadow>
                  <boxGeometry args={[0.22, 0.25, 0.12]} />
                </mesh>
              </group>
            </group>
          )}

          {type === 'windmill' && (
            <group>
              <mesh material={mats.stoneDark} position={[0, 0.3, 0]} castShadow receiveShadow>
                <cylinderGeometry args={[0.82, 0.95, 0.6, 8]} />
              </mesh>
              <mesh material={mats.timberMed} position={[0, 1.2, 0]} castShadow receiveShadow>
                <cylinderGeometry args={[0.62, 0.82, 1.4, 8]} />
              </mesh>
              <mesh material={mats.timberDark} position={[0, 1.4, 0]} castShadow>
                <cylinderGeometry args={[0.78, 0.78, 0.08, 8]} />
              </mesh>
              <mesh material={mats.timberDark} position={[0, 0.85, 0]}>
                <cylinderGeometry args={[0.72, 0.72, 0.04, 8]} />
              </mesh>
              <mesh material={mats.timberDark} position={[0, 1.65, 0]}>
                <cylinderGeometry args={[0.58, 0.58, 0.04, 8]} />
              </mesh>

              <mesh material={mats.thatchRoof} position={[0, 2.25, 0]} castShadow receiveShadow>
                <coneGeometry args={[0.85, 0.8, 8]} />
              </mesh>

              <mesh material={mats.timberDark} position={[0, 1.35, -0.95]} rotation={[0.45, 0, 0]} castShadow>
                <cylinderGeometry args={[0.04, 0.05, 1.8, 5]} />
              </mesh>

              <mesh material={mats.timberDark} position={[0, 0.35, 0.82]} castShadow>
                <boxGeometry args={[0.34, 0.52, 0.06]} />
              </mesh>
              <mesh material={mats.timberLight} position={[0, 0.10, 0.95]} castShadow receiveShadow>
                <boxGeometry args={[0.44, 0.12, 0.22]} />
              </mesh>
              <mesh material={mats.timberLight} position={[0, 0.04, 1.08]} castShadow receiveShadow>
                <boxGeometry args={[0.48, 0.08, 0.20]} />
              </mesh>

              <mesh material={mats.plaster} position={[0.42, 0.15, 0.75]} castShadow>
                <dodecahedronGeometry args={[0.14, 0]} />
              </mesh>
              <mesh material={mats.plaster} position={[0.35, 0.12, 0.92]} castShadow>
                <dodecahedronGeometry args={[0.12, 0]} />
              </mesh>
              <group ref={windmillSailsRef} position={[0, 1.62, 0.75]}>
                <mesh material={mats.timberDark} rotation={[Math.PI / 2, 0, 0]}>
                  <cylinderGeometry args={[0.12, 0.12, 0.15, 6]} />
                </mesh>
                {[0, 1, 2, 3].map((bi) => (
                  <group key={`b-${bi}`} rotation={[0, 0, (bi * Math.PI) / 2]}>
                    <mesh material={mats.timberDark} position={[0, 0.7, 0]} castShadow>
                      <boxGeometry args={[0.06, 1.4, 0.04]} />
                    </mesh>
                    <mesh material={mats.awningWhite} position={[0.14, 0.7, 0.01]} castShadow>
                      <boxGeometry args={[0.24, 1.1, 0.01]} />
                    </mesh>
                  </group>
                ))}
              </group>
            </group>
          )}

          {type === 'bakery' && (
            <group>
              <mesh material={mats.stoneMed} position={[0, 0.48, 0]} castShadow receiveShadow>
                <boxGeometry args={[1.52, 0.95, 1.52]} />
              </mesh>
              <mesh material={mats.shingleRoof} position={[0, 1.38, 0.38]} rotation={[-0.85, 0, 0]} castShadow receiveShadow>
                <boxGeometry args={[1.68, 1.15, 0.10]} />
              </mesh>
              <mesh material={mats.shingleRoof} position={[0, 1.38, -0.38]} rotation={[0.85, 0, 0]} castShadow receiveShadow>
                <boxGeometry args={[1.68, 1.15, 0.10]} />
              </mesh>
              <mesh material={mats.timberDark} position={[0, 1.80, 0]} castShadow>
                <boxGeometry args={[1.78, 0.12, 0.12]} />
              </mesh>
              {[-0.88, 0.88].map((gx) => (
                <group key={`bk-finial-${gx}`} position={[gx, 1.84, 0]}>
                  <mesh material={mats.timberLight} rotation={[0.55, 0, 0]} castShadow>
                    <boxGeometry args={[0.07, 0.42, 0.05]} />
                  </mesh>
                  <mesh material={mats.timberLight} rotation={[-0.55, 0, 0]} castShadow>
                    <boxGeometry args={[0.07, 0.42, 0.05]} />
                  </mesh>
                </group>
              ))}
              {[-0.76, 0.76].map((gx) => (
                <mesh key={`bk-gable-${gx}`} material={mats.stoneMed} position={[gx, 1.35, 0]} castShadow receiveShadow>
                  <boxGeometry args={[0.08, 0.65, 1.05]} />
                </mesh>
              ))}
              <group position={[0.68, 0.35, 0.35]}>
                <mesh material={mats.stoneDark} castShadow receiveShadow>
                  <sphereGeometry args={[0.36, 8, 8]} />
                </mesh>
                <mesh material={mats.fireOrange} position={[0.18, -0.05, 0]}>
                  <boxGeometry args={[0.1, 0.22, 0.22]} />
                </mesh>
              </group>
              <mesh material={mats.plaster} position={[-0.45, 0.18, 0.78]} castShadow>
                <dodecahedronGeometry args={[0.16, 0]} />
              </mesh>
              <mesh material={mats.stoneDark} position={[-0.45, 1.45, -0.3]} castShadow>
                <boxGeometry args={[0.3, 1.1, 0.3]} />
              </mesh>
              <group ref={smokePuffsRef} position={[-0.45, 2.05, -0.3]}>
                {[0, 1, 2].map((i) => (
                  <mesh key={`bk-s-${i}`} material={mats.smokeWhite}>
                    <dodecahedronGeometry args={[0.18, 0]} />
                  </mesh>
                ))}
              </group>
            </group>
          )}

          {type === 'brewery' && (
            <group>
              <mesh material={mats.timberMed} position={[-0.22, 0.48, 0]} castShadow receiveShadow>
                <boxGeometry args={[1.25, 0.95, 1.52]} />
              </mesh>
              <mesh material={mats.thatchRoof} position={[-0.22, 1.38, 0.38]} rotation={[-0.85, 0, 0]} castShadow receiveShadow>
                <boxGeometry args={[1.45, 1.15, 0.10]} />
              </mesh>
              <mesh material={mats.thatchRoof} position={[-0.22, 1.38, -0.38]} rotation={[0.85, 0, 0]} castShadow receiveShadow>
                <boxGeometry args={[1.45, 1.15, 0.10]} />
              </mesh>
              <mesh material={mats.timberDark} position={[-0.22, 1.80, 0]} castShadow>
                <boxGeometry args={[1.55, 0.12, 0.12]} />
              </mesh>
              {[-0.92, 0.48].map((gx) => (
                <group key={`br-finial-${gx}`} position={[gx, 1.84, 0]}>
                  <mesh material={mats.timberLight} rotation={[0.55, 0, 0]} castShadow>
                    <boxGeometry args={[0.07, 0.42, 0.05]} />
                  </mesh>
                  <mesh material={mats.timberLight} rotation={[-0.55, 0, 0]} castShadow>
                    <boxGeometry args={[0.07, 0.42, 0.05]} />
                  </mesh>
                </group>
              ))}
              {[-0.84, 0.40].map((gx) => (
                <mesh key={`br-gable-${gx}`} material={mats.timberMed} position={[gx, 1.35, 0]} castShadow receiveShadow>
                  <boxGeometry args={[0.08, 0.65, 1.05]} />
                </mesh>
              ))}
              <group position={[0.58, 0.42, -0.2]}>
                <mesh material={mats.goldTrim} castShadow>
                  <cylinderGeometry args={[0.32, 0.35, 0.8, 8]} />
                </mesh>
                <mesh material={mats.goldTrim} position={[0, 0.45, 0]}>
                  <coneGeometry args={[0.32, 0.25, 8]} />
                </mesh>
              </group>
              <mesh material={mats.timberDark} position={[0.55, 0.24, 0.45]} castShadow>
                <cylinderGeometry args={[0.18, 0.2, 0.48, 6]} />
              </mesh>
            </group>
          )}

          {type === 'barracks' && (
            <group>
              <mesh material={mats.timberDark} position={[0, 0.15, 0]} castShadow receiveShadow>
                <boxGeometry args={[2.55, 0.3, 1.65]} />
              </mesh>
              <mesh material={mats.plaster} position={[0, 0.65, 0]} castShadow receiveShadow>
                <boxGeometry args={[2.45, 0.75, 1.55]} />
              </mesh>
              <mesh material={mats.shingleRoof} position={[0, 1.48, 0.42]} rotation={[-0.85, 0, 0]} castShadow receiveShadow>
                <boxGeometry args={[2.72, 1.18, 0.10]} />
              </mesh>
              <mesh material={mats.shingleRoof} position={[0, 1.48, -0.42]} rotation={[0.85, 0, 0]} castShadow receiveShadow>
                <boxGeometry args={[2.72, 1.18, 0.10]} />
              </mesh>
              <mesh material={mats.timberDark} position={[0, 1.90, 0]} castShadow>
                <boxGeometry args={[2.82, 0.14, 0.14]} />
              </mesh>
              {[-1.38, 1.38].map((gx) => (
                <group key={`bar-finial-${gx}`} position={[gx, 1.94, 0]}>
                  <mesh material={mats.timberLight} rotation={[0.55, 0, 0]} castShadow>
                    <boxGeometry args={[0.08, 0.48, 0.06]} />
                  </mesh>
                  <mesh material={mats.timberLight} rotation={[-0.55, 0, 0]} castShadow>
                    <boxGeometry args={[0.08, 0.48, 0.06]} />
                  </mesh>
                </group>
              ))}
              {[-1.24, 1.24].map((gx) => (
                <mesh key={`bar-gable-${gx}`} material={mats.timberDark} position={[gx, 1.40, 0]} castShadow receiveShadow>
                  <boxGeometry args={[0.08, 0.72, 1.25]} />
                </mesh>
              ))}
              <group position={[1.05, 0, 0.85]}>
                <mesh material={mats.timberDark} position={[0, 0.45, 0]} castShadow>
                  <cylinderGeometry args={[0.03, 0.03, 0.9, 4]} />
                </mesh>
                <mesh material={mats.timberDark} position={[0, 0.65, 0]} rotation={[0, 0, Math.PI / 2]} castShadow>
                  <cylinderGeometry args={[0.025, 0.025, 0.55, 4]} />
                </mesh>
                <mesh material={mats.goldWheat} position={[0, 0.8, 0]} castShadow>
                  <dodecahedronGeometry args={[0.14, 0]} />
                </mesh>
              </group>
              <mesh material={mats.redBanner} position={[-0.5, 0.65, 0.8]} castShadow>
                <boxGeometry args={[0.25, 0.35, 0.04]} />
              </mesh>
              <mesh material={mats.royalBlueRoof} position={[0.2, 0.65, 0.8]} castShadow>
                <boxGeometry args={[0.25, 0.35, 0.04]} />
              </mesh>
            </group>
          )}

          {type === 'wooden_wall' && (
            <group>
              {[-0.32, 0, 0.32].map((px, idx) => (
                <mesh key={`log-${idx}`} material={mats.timberDark} position={[px, 0.55, 0]} castShadow receiveShadow>
                  <cylinderGeometry args={[0.07, 0.11, 1.1, 5]} />
                </mesh>
              ))}
              <mesh material={mats.timberMed} position={[0, 0.45, 0]} rotation={[0, 0, Math.PI / 2]} castShadow>
                <cylinderGeometry args={[0.05, 0.05, 0.95, 4]} />
              </mesh>
            </group>
          )}

          {type === 'wooden_gate' && (
            <group>
              <mesh material={mats.timberDark} position={[-0.4, 0.65, 0]} castShadow receiveShadow>
                <cylinderGeometry args={[0.11, 0.13, 1.3, 6]} />
              </mesh>
              <mesh material={mats.timberDark} position={[0.4, 0.65, 0]} castShadow receiveShadow>
                <cylinderGeometry args={[0.11, 0.13, 1.3, 6]} />
              </mesh>
              <mesh material={mats.timberMed} position={[0, 1.25, 0]} rotation={[0, 0, Math.PI / 2]} castShadow>
                <cylinderGeometry args={[0.08, 0.08, 1.0, 4]} />
              </mesh>
              <mesh material={mats.timberLight} position={[0, 0.45, 0]} castShadow>
                <boxGeometry args={[0.68, 0.88, 0.06]} />
              </mesh>
            </group>
          )}

          {type === 'stone_wall' && (
            <group>
              <mesh material={mats.stoneMed} position={[0, 0.45, 0]} castShadow receiveShadow>
                <boxGeometry args={[0.96, 0.9, 0.45]} />
              </mesh>
              <mesh material={mats.stoneDark} position={[-0.32, 1.0, 0]} castShadow>
                <boxGeometry args={[0.26, 0.22, 0.45]} />
              </mesh>
              <mesh material={mats.stoneDark} position={[0.32, 1.0, 0]} castShadow>
                <boxGeometry args={[0.26, 0.22, 0.45]} />
              </mesh>
            </group>
          )}
        </group>
      ) : (
        <group>
          <mesh material={mats.richSoil} position={[0, 0.02, 0]} receiveShadow>
            <boxGeometry args={[width * 0.95, 0.04, height * 0.95]} />
          </mesh>

          <mesh material={mats.stoneDark} position={[0, 0.08, 0]} receiveShadow castShadow>
            <boxGeometry args={[width * 0.88, 0.08, height * 0.88]} />
          </mesh>

          {[
            [-width * 0.42, -height * 0.42],
            [width * 0.42, -height * 0.42],
            [-width * 0.42, height * 0.42],
            [width * 0.42, height * 0.42],
          ].map(([px, pz], idx) => (
            <group key={`scaff-post-${idx}`} position={[px, 0.6, pz]}>
              <mesh material={mats.timberDark} castShadow>
                <cylinderGeometry args={[0.04, 0.05, 1.2, 5]} />
              </mesh>
            </group>
          ))}

          <mesh material={mats.timberLight} position={[0, 1.1, -height * 0.42]} castShadow>
            <boxGeometry args={[width * 0.88, 0.05, 0.05]} />
          </mesh>
          <mesh material={mats.timberLight} position={[0, 1.1, height * 0.42]} castShadow>
            <boxGeometry args={[width * 0.88, 0.05, 0.05]} />
          </mesh>
          <mesh material={mats.timberLight} position={[-width * 0.42, 1.1, 0]} castShadow>
            <boxGeometry args={[0.05, 0.05, height * 0.88]} />
          </mesh>
          <mesh material={mats.timberLight} position={[width * 0.42, 1.1, 0]} castShadow>
            <boxGeometry args={[0.05, 0.05, height * 0.88]} />
          </mesh>

          <mesh material={mats.timberLight} position={[0, 0.55, -height * 0.42]} castShadow>
            <boxGeometry args={[width * 0.88, 0.04, 0.04]} />
          </mesh>
          <mesh material={mats.timberLight} position={[0, 0.55, height * 0.42]} castShadow>
            <boxGeometry args={[width * 0.88, 0.04, 0.04]} />
          </mesh>

          <mesh material={mats.timberMed} position={[0, 0.58, height * 0.35]} castShadow receiveShadow>
            <boxGeometry args={[width * 0.75, 0.03, 0.22]} />
          </mesh>

          <group position={[width * 0.44, 0.5, 0]} rotation={[0, 0, -0.25]}>
            <mesh material={mats.timberLight} position={[-0.08, 0, 0]} castShadow>
              <boxGeometry args={[0.03, 1.1, 0.03]} />
            </mesh>
            <mesh material={mats.timberLight} position={[0.08, 0, 0]} castShadow>
              <boxGeometry args={[0.03, 1.1, 0.03]} />
            </mesh>
            {[-0.35, -0.15, 0.05, 0.25, 0.45].map((ry, i) => (
              <mesh key={`rung-${i}`} material={mats.timberLight} position={[0, ry, 0]} castShadow>
                <boxGeometry args={[0.18, 0.02, 0.02]} />
              </mesh>
            ))}
          </group>

          {progress > 5 && (
            <mesh material={mats.timberDark} position={[0, 0.1 + (progress / 100) * 0.3, 0]} castShadow receiveShadow>
              <boxGeometry args={[width * 0.78, Math.max(0.1, (progress / 100) * 0.6), height * 0.78]} />
            </mesh>
          )}

          <group position={[-width * 0.35, 0, height * 0.35]}>
            <mesh material={mats.timberLight} position={[0, 0.06, 0]} rotation={[0, 0.15, 0]} castShadow>
              <boxGeometry args={[0.15, 0.08, 0.6]} />
            </mesh>
            <mesh material={mats.timberLight} position={[0.08, 0.12, 0]} rotation={[0, -0.1, 0]} castShadow>
              <boxGeometry args={[0.15, 0.06, 0.55]} />
            </mesh>
          </group>

          <mesh material={mats.timberMed} position={[width * 0.32, 0.1, -height * 0.32]} castShadow>
            <boxGeometry args={[0.2, 0.18, 0.2]} />
          </mesh>

          <mesh material={mats.blueprintGhost} position={[0, 0.5, 0]}>
            <boxGeometry args={[width * 0.8, 0.9, height * 0.8]} />
          </mesh>
          <mesh material={mats.blueprintGhost} position={[0, 1.15, height * 0.2]} rotation={[-0.85, 0, 0]}>
            <boxGeometry args={[width * 0.85, height * 0.55, 0.05]} />
          </mesh>
          <mesh material={mats.blueprintGhost} position={[0, 1.15, -height * 0.2]} rotation={[0.85, 0, 0]}>
            <boxGeometry args={[width * 0.85, height * 0.55, 0.05]} />
          </mesh>

          <Html position={[0, 1.45, 0]} center zIndexRange={[10, 0]} style={{ pointerEvents: 'none', userSelect: 'none' }}>
            <div className="bg-slate-950 text-amber-300 text-[11px] px-3 py-1.5 rounded-xl border border-amber-500/70 shadow-2xl font-mono flex items-center gap-2 whitespace-nowrap pointer-events-none">
              <span ref={progressTextRef} className="font-bold flex items-center gap-1 text-amber-400">
                🔨 {Math.round(progress)}%
              </span>
              <div className="w-16 h-2 bg-slate-800 rounded-full overflow-hidden border border-slate-700/60 p-0.5">
                <div
                  ref={progressBarRef}
                  className="h-full bg-gradient-to-r from-amber-500 to-yellow-400 rounded-full transition-all duration-200 shadow-sm"
                  style={{ width: `${Math.max(4, progress)}%` }}
                />
              </div>
            </div>
          </Html>
        </group>
      )}

      {isSelected && (
        <mesh position={[0, 0.008, 0]} rotation={[-Math.PI / 2, 0, 0]}>
          <ringGeometry args={[Math.min(width, height) * 0.52, Math.min(width, height) * 0.6, 32]} />
          <meshBasicMaterial color="#fbbf24" transparent opacity={0.8} side={THREE.DoubleSide} />
        </mesh>
      )}
    </group>
  );
}

const Building3DMemo = memo(Building3D, (prev, next) => {
  return (
    prev.building.id === next.building.id &&
    prev.isSelected === next.isSelected &&
    prev.building.buildingType === next.building.buildingType
  );
});
