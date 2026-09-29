import { useRef, memo, useState, useMemo, useEffect } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';
import { buildingEntities, characterEntities } from '../../engine/ecs/world';
import type { GameEntity } from '../../engine/ecs/world';
import { BUILDING_BLUEPRINTS } from '../../engine/buildings/blueprints';
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
  FishermansHutModel,
  ForagersHutModel,
  HuntersHutModel,
  IronMineModel,
  StoneQuarryModel,
  ClayPitModel,
  SaltWorksModel,
  CharcoalKilnModel,
  IronSmelterModel,
  StonecutterModel,
  BrickworksModel,
  SawmillModel,
  WeaversWorkshopModel,
  ForestersHutModel,
  WoodenChurchModel,
  TavernModel,
} from './buildings/models';

const _occupiedBuildingIds = new Set<string>();
const _sleeperBuildingIds = new Set<string>();
let _lastOccupancyCheck = 0;

function updateOccupancyCache(t: number): void {
  if (t - _lastOccupancyCheck < 0.5) return;
  _lastOccupancyCheck = t;

  _occupiedBuildingIds.clear();
  _sleeperBuildingIds.clear();

  const hour = useGameStore.getState().time.hour ?? 12;
  const isNight = hour >= 20 || hour < 6;

  for (const u of characterEntities) {
    if (!u.position) continue;
    const job = u.currentJob;
    if (!job) continue;
    if (job.type === 'sleep' && job.targetBuildingId) {
      _occupiedBuildingIds.add(job.targetBuildingId);
      if (isNight) _sleeperBuildingIds.add(job.targetBuildingId);
    }
  }
}

interface BuildingFrameState {
  groupRef: React.RefObject<THREE.Group | null>;
  roofRef: React.RefObject<THREE.Group | null>;
  interiorRef: React.RefObject<THREE.Group | null>;
  centerX: number;
  centerZ: number;
  buildingId: string;
  lastRoofCheck: number;
  setIsLightOn: (v: boolean) => void;
  setIsNight: (v: boolean) => void;
}
const _buildingFrameStates = new Map<string, BuildingFrameState>();

export function BuildingsRenderer() {
  const selectedEntityId = useGameStore((state) => state.selectedEntityId);
  const setSelectedEntityId = useGameStore((state) => state.setSelectedEntityId);
  const buildingVersion = useGameStore((state) => state.buildingVersion);
  const isStrategicView = useGameStore((state) => state.isStrategicView);

  const buildings = useMemo(() => Array.from(buildingEntities), [buildingVersion]);
  const frameCounter = useRef(0);
  const lastHeavyCheck = useRef(0);
  const lastNight = useRef(false);

  useFrame(({ clock }) => {
    const t = clock.getElapsedTime();
    frameCounter.current++;
    const fc = frameCounter.current;

    if (t - lastHeavyCheck.current > 0.5) {
      lastHeavyCheck.current = t;
      updateOccupancyCache(t);

      const hour = useGameStore.getState().time.hour ?? 12;
      const night = hour >= 20 || hour < 6;

      if (night !== lastNight.current) {
        lastNight.current = night;
        for (const s of _buildingFrameStates.values()) {
          s.setIsNight(night);
          const shouldLight = night && _sleeperBuildingIds.has(s.buildingId);
          s.setIsLightOn(shouldLight);
        }
      } else {
        for (const s of _buildingFrameStates.values()) {
          const shouldLight = night && _sleeperBuildingIds.has(s.buildingId);
          s.setIsLightOn(shouldLight);
        }
      }
    }

    const camTarget = (window as any).__lastCameraTarget;
    const zoom = (window as any).__lastCameraZoom || 38;
    const maxDist = Math.min(42, Math.max(25, (33 / zoom) * 38));
    const maxDistSq = maxDist * maxDist;

    const states = Array.from(_buildingFrameStates.values());
    if (states.length === 0) return;

    const batchSize = Math.ceil(states.length / 3);
    const startIdx = (fc % 3) * batchSize;
    const endIdx = Math.min(startIdx + batchSize, states.length);

    for (let i = startIdx; i < endIdx; i++) {
      const s = states[i];
      if (!s?.groupRef.current) continue;

      if (camTarget) {
        const distSq = (s.centerX - camTarget[0]) ** 2 + (s.centerZ - camTarget[1]) ** 2;
        const isVisible = distSq < maxDistSq;
        if (s.groupRef.current.visible !== isVisible) {
          s.groupRef.current.visible = isVisible;
        }
        if (!isVisible) continue;
      }

      if (t - s.lastRoofCheck > 0.9 && s.roofRef.current) {
        s.lastRoofCheck = t;
        const isOccupied = _occupiedBuildingIds.has(s.buildingId);
        s.roofRef.current.visible = !isOccupied;
        if (s.interiorRef.current) s.interiorRef.current.visible = isOccupied;
      }
    }
  });

  return (
    <group visible={!isStrategicView}>
      {buildings.map((building) => (
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

  const groupRef = useRef<THREE.Group>(null);
  const roofRef = useRef<THREE.Group>(null);
  const interiorRef = useRef<THREE.Group>(null);
  const progressTextRef = useRef<HTMLSpanElement>(null);
  const progressBarRef = useRef<HTMLDivElement>(null);

  const [isLightOn, setIsLightOn] = useState(false);
  const [isNight, setIsNight] = useState(() => {
    const h = useGameStore.getState().time?.hour ?? 12;
    return h >= 20 || h < 6;
  });
  const isWorking = !isNight && completed;

  const [centerX, centerZ] = useMemo(() => {
    const bx = building.gridPosition ? building.gridPosition[0] : pos[0] - width / 2;
    const bz = building.gridPosition ? building.gridPosition[1] : pos[2] - height / 2;
    const bWidth = building.buildingWidth || width || 2;
    const bHeight = building.buildingHeight || height || 2;
    return [bx + bWidth / 2, bz + bHeight / 2];
  }, [building.gridPosition, pos, width, height, building.buildingWidth, building.buildingHeight]);

  const setIsLightOnRef = useRef(setIsLightOn);
  const setIsNightRef = useRef(setIsNight);
  setIsLightOnRef.current = setIsLightOn;
  setIsNightRef.current = setIsNight;

  const frameStateRef = useRef<BuildingFrameState | null>(null);
  if (!frameStateRef.current) {
    frameStateRef.current = {
      groupRef,
      roofRef,
      interiorRef,
      centerX,
      centerZ,
      buildingId: building.id,
      lastRoofCheck: 0,
      setIsLightOn: (v) => setIsLightOnRef.current(v),
      setIsNight: (v) => setIsNightRef.current(v),
    };
    _buildingFrameStates.set(building.id, frameStateRef.current);
  }
  frameStateRef.current.centerX = centerX;
  frameStateRef.current.centerZ = centerZ;
  frameStateRef.current.buildingId = building.id;

  useEffect(() => {
    _buildingFrameStates.set(building.id, frameStateRef.current!);
    return () => {
      _buildingFrameStates.delete(building.id);
    };
  }, [building.id]);

  useFrame(() => {
    if (!completed && (building.isCompleted || (building.constructionProgress || 0) >= 100)) {
      setCompleted(true);
      return;
    }

    if (building.isDemolishing && progressTextRef.current && progressBarRef.current) {
      const curProg = Math.round(building.demolitionProgress || 0);
      progressTextRef.current.innerText = `💣 ${curProg}%`;
      progressBarRef.current.style.width = `${Math.max(4, curProg)}%`;
    } else if (!completed && progressTextRef.current && progressBarRef.current) {
      const curProg = Math.round(building.constructionProgress || 0);
      progressTextRef.current.innerText = `🔨 ${curProg}%`;
      progressBarRef.current.style.width = `${Math.max(4, curProg)}%`;
    }

    if (isSelected && roofRef.current) {
      roofRef.current.visible = false;
      if (interiorRef.current) interiorRef.current.visible = true;
    }
  });

  const posY = pos[1] !== undefined ? pos[1] : 0.05;

  function renderBuildingModel() {
    switch (type) {
      case 'tent':
        return <TentModel />;
      case 'lumberjack_hut':
        return <LumberjackHutModel isLightOn={isLightOn} roofRef={roofRef} interiorRef={interiorRef} />;
      case 'campfire':
        return <CampfireModel />;
      case 'peasant_house':
        return <PeasantHouseModel isLightOn={isLightOn} roofRef={roofRef} interiorRef={interiorRef} />;
      case 'market':
        return <MarketModel roofRef={roofRef} />;
      case 'manor':
        return <ManorModel isLightOn={isLightOn} roofRef={roofRef} />;
      case 'stockpile':
        return <StockpileModel />;
      case 'wheat_farm':
        return <WheatFarmModel building={building} />;
      case 'windmill':
        return <WindmillModel isWorking={isWorking} />;
      case 'bakery':
        return <BakeryModel isLightOn={isLightOn} isWorking={isWorking} roofRef={roofRef} />;
      case 'brewery':
        return <BreweryModel isLightOn={isLightOn} isWorking={isWorking} roofRef={roofRef} />;
      case 'barracks':
        return <BarracksModel isLightOn={isLightOn} roofRef={roofRef} />;
      case 'wooden_wall':
        return <WoodenWallModel />;
      case 'wooden_gate':
        return <WoodenGateModel />;
      case 'stone_wall':
        return <StoneWallModel />;
      case 'fishermans_hut':
        return <FishermansHutModel isLightOn={isLightOn} roofRef={roofRef} />;
      case 'foragers_hut':
        return <ForagersHutModel isLightOn={isLightOn} roofRef={roofRef} />;
      case 'hunters_hut':
        return <HuntersHutModel isLightOn={isLightOn} roofRef={roofRef} />;
      case 'iron_mine':
        return <IronMineModel isLightOn={isLightOn} isWorking={isWorking} roofRef={roofRef} />;
      case 'stone_quarry':
        return <StoneQuarryModel isLightOn={isLightOn} roofRef={roofRef} />;
      case 'clay_pit':
        return <ClayPitModel isLightOn={isLightOn} roofRef={roofRef} />;
      case 'salt_works':
        return <SaltWorksModel isLightOn={isLightOn} isWorking={isWorking} roofRef={roofRef} />;
      case 'charcoal_kiln':
        return <CharcoalKilnModel isLightOn={isLightOn} isWorking={isWorking} roofRef={roofRef} />;
      case 'iron_smelter':
        return <IronSmelterModel isLightOn={isLightOn} isWorking={isWorking} roofRef={roofRef} />;
      case 'stonecutter':
        return <StonecutterModel isLightOn={isLightOn} roofRef={roofRef} />;
      case 'brickworks':
        return <BrickworksModel isLightOn={isLightOn} isWorking={isWorking} roofRef={roofRef} />;
      case 'sawmill':
        return <SawmillModel isLightOn={isLightOn} roofRef={roofRef} />;
      case 'weavers_workshop':
        return <WeaversWorkshopModel isLightOn={isLightOn} roofRef={roofRef} />;
      case 'foresters_hut':
        return <ForestersHutModel isLightOn={isLightOn} roofRef={roofRef} />;
      case 'wooden_church':
        return <WoodenChurchModel isLightOn={isLightOn} roofRef={roofRef} />;
      case 'tavern':
        return <TavernModel isLightOn={isLightOn} isWorking={isWorking} roofRef={roofRef} />;
      default:
        return <PeasantHouseModel isLightOn={isLightOn} roofRef={roofRef} />;
    }
  }

  const bp = type ? (BUILDING_BLUEPRINTS as any)[type] : null;
  const baseW = bp?.width || width;
  const baseH = bp?.height || height;
  const rotationAngle = building.rotationAngle || 0;

  return (
    <group
      ref={groupRef}
      position={[
        building.position ? building.position[0] : (building.gridPosition ? building.gridPosition[0] + width / 2 : pos[0]),
        posY,
        building.position ? building.position[2] : (building.gridPosition ? building.gridPosition[1] + height / 2 : pos[2]),
      ]}
      rotation={[0, rotationAngle, 0]}
    >
      <group raycast={() => null}>
        {completed ? (
          renderBuildingModel()
        ) : (
          <ConstructionScaffold
            type={type}
            width={baseW}
            height={baseH}
            progress={progress}
            progressTextRef={progressTextRef}
            progressBarRef={progressBarRef}
          />
        )}
      </group>

      <mesh
        position={[0, Math.max(1.0, baseH * 0.35), 0]}
        onClick={(e) => {
          e.stopPropagation();
          onSelect(building.id);
        }}
      >
        <boxGeometry args={[baseW * 0.98, Math.max(2.4, baseH * 0.8), baseH * 0.98]} />
        <meshBasicMaterial visible={false} />
      </mesh>

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
    prev.building.buildingType === next.building.buildingType &&
    prev.building.rotationAngle === next.building.rotationAngle &&
    prev.building.buildingWidth === next.building.buildingWidth &&
    prev.building.buildingHeight === next.building.buildingHeight &&
    prev.building.isCompleted === next.building.isCompleted &&
    prev.building.constructionProgress === next.building.constructionProgress &&
    prev.building.isDemolishing === next.building.isDemolishing
  );
});
