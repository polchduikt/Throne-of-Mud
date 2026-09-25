import { useRef, memo, useState } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';
import { buildingEntities, characterEntities } from '../../engine/ecs/world';
import type { GameEntity } from '../../engine/ecs/world';
import { useGameStore } from '../../store/useGameStore';
import {
  TentModel,
  LumberjackHutModel,
  CampfireModel,
  PeasantHouseModel,
  MarketModel,
  ManorModel,
  StockpileModel,
  WheatFarmModel,
  WindmillModel,
  BakeryModel,
  BreweryModel,
  BarracksModel,
  WoodenWallModel,
  WoodenGateModel,
  StoneWallModel,
  ConstructionScaffold,
  DemolitionHUD,
} from './buildings/models';

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
  const progressTextRef = useRef<HTMLSpanElement>(null);
  const progressBarRef = useRef<HTMLDivElement>(null);
  const lastRoofCheck = useRef(0);
  const lastLightCheck = useRef(0);
  const [isLightOn, setIsLightOn] = useState(false);

  useFrame(({ clock }) => {
    if (!completed && (building.isCompleted || (building.constructionProgress || 0) >= 100)) {
      setCompleted(true);
      return;
    }

    const t = clock.getElapsedTime();

    if (building.isDemolishing && progressTextRef.current && progressBarRef.current) {
      const curProg = Math.round(building.demolitionProgress || 0);
      progressTextRef.current.innerText = `💣 ${curProg}%`;
      progressBarRef.current.style.width = `${Math.max(4, curProg)}%`;
    } else if (!completed && progressTextRef.current && progressBarRef.current) {
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
  });

  const posY = pos[1] !== undefined ? pos[1] : 0.05;

  function renderBuildingModel() {
    switch (type) {
      case 'tent':
        return <TentModel />;
      case 'lumberjack_hut':
        return <LumberjackHutModel isLightOn={isLightOn} roofRef={roofRef} />;
      case 'campfire':
        return <CampfireModel />;
      case 'peasant_house':
        return <PeasantHouseModel isLightOn={isLightOn} roofRef={roofRef} />;
      case 'market':
        return <MarketModel roofRef={roofRef} />;
      case 'manor':
        return <ManorModel isLightOn={isLightOn} roofRef={roofRef} />;
      case 'stockpile':
        return <StockpileModel />;
      case 'wheat_farm':
        return <WheatFarmModel building={building} />;
      case 'windmill':
        return <WindmillModel />;
      case 'bakery':
        return <BakeryModel isLightOn={isLightOn} roofRef={roofRef} />;
      case 'brewery':
        return <BreweryModel isLightOn={isLightOn} roofRef={roofRef} />;
      case 'barracks':
        return <BarracksModel isLightOn={isLightOn} roofRef={roofRef} />;
      case 'wooden_wall':
        return <WoodenWallModel />;
      case 'wooden_gate':
        return <WoodenGateModel />;
      case 'stone_wall':
        return <StoneWallModel />;
      default:
        return <PeasantHouseModel isLightOn={isLightOn} roofRef={roofRef} />;
    }
  }

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
      {completed ? (
        renderBuildingModel()
      ) : (
        <ConstructionScaffold
          type={type}
          width={width}
          height={height}
          progress={progress}
          progressTextRef={progressTextRef}
          progressBarRef={progressBarRef}
        />
      )}

      {completed && building.isDemolishing && (
        <DemolitionHUD
          demolitionProgress={building.demolitionProgress || 0}
          progressTextRef={progressTextRef}
          progressBarRef={progressBarRef}
        />
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
