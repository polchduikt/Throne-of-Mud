import type { GameEntity } from '../../world';
import { buildingEntities, characterEntities } from '../../world';
import { GridMap } from '../../../grid/GridMap';
import { AStar } from '../../../pathfinding/AStar';
import { useGameStore } from '../../../../store/useGameStore';
import { distance2D } from '../../../../utils/mathUtils';
import type { ResourceType } from '../../../../types/game';
import { BUILDING_BLUEPRINTS } from '../../../buildings/blueprints';
import {
  getBuildingWorkstation,
  getBuildingFloorHeight,
  getBuildingDoorInfo,
  createPathToInterior,
} from '../../../buildings/buildingNavigation';

export class HaulingJobHandler {
  public static assignStockpileHaulingJob(
    unit: GameEntity,
    stockpile: GameEntity,
    grid: GridMap,
    uBounds: { minX: number; maxX: number; minZ: number; maxZ: number } | undefined,
    currentTick: number,
    cx: number,
    cz: number
  ): boolean {
    const assignedList = stockpile.assignedWorkers || [];
    const workerIndex = Math.max(0, assignedList.indexOf(unit.id));
    const station = getBuildingWorkstation(stockpile, workerIndex);

    const uX = unit.position ? unit.position[0] : (unit.gridPosition ? unit.gridPosition[0] + 0.5 : cx);
    const uZ = unit.position ? unit.position[2] : (unit.gridPosition ? unit.gridPosition[1] + 0.5 : cz);

    const maxStockpileCap = stockpile.maxStorage || (stockpile.buildingType ? BUILDING_BLUEPRINTS[stockpile.buildingType]?.maxStorage : 200) || 200;
    const currentStockpileStored = Object.values(stockpile.localInventory || {}).reduce((acc, val) => acc + (val || 0), 0);
    const isStockpileFull = currentStockpileStored >= maxStockpileCap;

    const inventoryEntries = Object.entries(unit.inventory || {}).filter(
      ([_, amt]) => (amt || 0) > 0
    ) as [ResourceType, number][];

    if (inventoryEntries.length > 0) {
      const [resType, carryAmount] = inventoryEntries[0];
      const distToStockpile = Math.hypot(uX - station.workWorldPos[0], uZ - station.workWorldPos[1]);

      if (distToStockpile < 1.0) {
        const remainingSpace = Math.max(0, maxStockpileCap - currentStockpileStored);
        const depositAmt = Math.min(carryAmount, remainingSpace > 0 ? remainingSpace : carryAmount);

        stockpile.localInventory = stockpile.localInventory || {};
        stockpile.localInventory[resType] = (stockpile.localInventory[resType] || 0) + depositAmt;

        if (unit.inventory) {
          const leftover = carryAmount - depositAmt;
          if (leftover > 0) {
            unit.inventory[resType] = leftover;
          } else {
            delete unit.inventory[resType];
          }
        }

        unit.speechBubble = {
          text: `Доставив ${depositAmt} од. на склад! (${currentStockpileStored + depositAmt}/${maxStockpileCap})`,
          expiresAtTick: currentTick + 25,
          type: 'work',
        };

        unit.currentJob = { id: `idle-${Date.now()}`, type: 'idle', progress: 0, totalWork: 0 };
        unit.path = [];
        return true;
      }

      if (unit.currentJob?.type === 'haul_resource' && unit.path && unit.path.length > 0) {
        return true;
      }

      const pathHome = createPathToInterior(
        grid,
        [Math.floor(uX), Math.floor(uZ)],
        station.doorApproachPos,
        station.doorWorldPos,
        station.workWorldPos,
        station.intermediatePos,
        uBounds,
        unit.position,
        stockpile
      );

      const baseH = grid.getTile(Math.floor(station.workWorldPos[0]), Math.floor(station.workWorldPos[1]))?.height || 0;
      const floorY = baseH + getBuildingFloorHeight(stockpile.buildingType) + 0.05;

      unit.currentJob = {
        id: `haul-deposit-${unit.id}`,
        type: 'haul_resource',
        targetBuildingId: stockpile.id,
        progress: 0,
        totalWork: 20,
      };

      if (pathHome && pathHome.length > 0) {
        unit.path = pathHome;
      } else {
        unit.position = [station.workWorldPos[0], floorY, station.workWorldPos[1]];
        unit.gridPosition = [Math.floor(station.workWorldPos[0]), Math.floor(station.workWorldPos[1])];
        unit.path = [];
      }
      return true;
    }

    if (isStockpileFull) {
      const distToStation = Math.hypot(uX - station.workWorldPos[0], uZ - station.workWorldPos[1]);
      const baseH = grid.getTile(Math.floor(station.workWorldPos[0]), Math.floor(station.workWorldPos[1]))?.height || 0;
      const floorY = baseH + getBuildingFloorHeight(stockpile.buildingType) + 0.05;

      const facingAngle = Math.atan2(
        station.facingTarget[0] - station.workWorldPos[0],
        station.facingTarget[1] - station.workWorldPos[1]
      );

      if (distToStation < 0.6 && (!unit.path || unit.path.length === 0)) {
        if (unit.currentJob?.type !== 'work_at_building') {
          unit.currentJob = {
            id: `stockpile-idle-${unit.id}`,
            type: 'work_at_building',
            targetBuildingId: stockpile.id,
            targetPosition: [station.workWorldPos[0], station.workWorldPos[1]],
            targetAngle: facingAngle,
            targetY: floorY,
            progress: 0,
            totalWork: 100,
          };
          unit.position = [station.workWorldPos[0], floorY, station.workWorldPos[1]];
          unit.gridPosition = [Math.floor(station.workWorldPos[0]), Math.floor(station.workWorldPos[1])];
          unit.path = [];
        } else {
          unit.currentJob.targetAngle = facingAngle;
        }

        if (currentTick % 120 === 0 && Math.random() < 0.3) {
          unit.speechBubble = {
            text: `Склад повний (${currentStockpileStored}/${maxStockpileCap})! Очікую вільне місце`,
            expiresAtTick: currentTick + 25,
            type: 'work',
          };
        }
        return true;
      }

      if (unit.currentJob?.type === 'work_at_building' && unit.path && unit.path.length > 0) {
        return true;
      }

      const pathHome = createPathToInterior(
        grid,
        [Math.floor(uX), Math.floor(uZ)],
        station.doorApproachPos,
        station.doorWorldPos,
        station.workWorldPos,
        station.intermediatePos,
        uBounds,
        unit.position,
        stockpile
      );

      unit.currentJob = {
        id: `stockpile-nav-${unit.id}`,
        type: 'work_at_building',
        targetBuildingId: stockpile.id,
        targetPosition: [station.workWorldPos[0], station.workWorldPos[1]],
        targetAngle: facingAngle,
        targetY: floorY,
        progress: 0,
        totalWork: 100,
      };

      if (pathHome && pathHome.length > 0) {
        unit.path = pathHome;
      } else {
        unit.position = [station.workWorldPos[0], floorY, station.workWorldPos[1]];
        unit.gridPosition = [Math.floor(station.workWorldPos[0]), Math.floor(station.workWorldPos[1])];
        unit.path = [];
      }
      return true;
    }

    if (unit.currentJob?.type === 'haul_resource' && unit.currentJob.targetBuildingId && unit.currentJob.targetBuildingId !== stockpile.id) {
      let targetBuilding: GameEntity | undefined;
      for (const b of buildingEntities) {
        if (b.id === unit.currentJob?.targetBuildingId) {
          targetBuilding = b;
          break;
        }
      }
      if (targetBuilding && targetBuilding.isCompleted) {
        const doorInfo = getBuildingDoorInfo(targetBuilding);
        const distToDoor = Math.hypot(uX - doorInfo.doorWorldPos[0], uZ - doorInfo.doorWorldPos[1]);

        if (distToDoor < 1.8) {
          const sourceEntries = Object.entries(targetBuilding.localInventory || {}).filter(
            ([_, amt]) => (amt || 0) > 0
          ) as [ResourceType, number][];

          if (sourceEntries.length > 0) {
            const [res, availableAmt] = sourceEntries[0];
            const takeAmt = Math.min(10, availableAmt);

            targetBuilding.localInventory = targetBuilding.localInventory || {};
            targetBuilding.localInventory[res] = Math.max(0, (targetBuilding.localInventory[res] || 0) - takeAmt);

            unit.inventory = unit.inventory || {};
            unit.inventory[res] = (unit.inventory[res] || 0) + takeAmt;

            unit.speechBubble = {
              text: `Забрав ${takeAmt} од. з ${targetBuilding.name || 'споруди'}! Несу на склад`,
              expiresAtTick: currentTick + 25,
              type: 'work',
            };

            const pathHome = createPathToInterior(
              grid,
              [Math.floor(uX), Math.floor(uZ)],
              station.doorApproachPos,
              station.doorWorldPos,
              station.workWorldPos,
              station.intermediatePos,
              uBounds,
              unit.position,
              stockpile
            );

            unit.currentJob = {
              id: `haul-deposit-${unit.id}`,
              type: 'haul_resource',
              targetBuildingId: stockpile.id,
              progress: 0,
              totalWork: 20,
            };

            if (pathHome && pathHome.length > 0) {
              unit.path = pathHome;
            }
            return true;
          }
        }

        if (unit.path && unit.path.length > 0) {
          return true;
        }
      }
    }

    const playerRegionId = useGameStore.getState().playerRegionId;
    const isPlayerStockpile =
      stockpile.factionId === 'player' ||
      (!stockpile.factionId && (stockpile.regionId === undefined || stockpile.regionId === playerRegionId));
    const targetRegionId =
      stockpile.regionId !== undefined ? stockpile.regionId : isPlayerStockpile ? playerRegionId : undefined;

    // Pre-calculate claimed resources per building in a single pass over units
    const claimedMap = new Map<string, number>();
    for (const other of characterEntities) {
      if (
        other.id !== unit.id &&
        other.currentJob?.type === 'haul_resource' &&
        other.currentJob.targetBuildingId
      ) {
        const cur = claimedMap.get(other.currentJob.targetBuildingId) || 0;
        claimedMap.set(other.currentJob.targetBuildingId, cur + 10);
      }
    }

    interface CandidateInfo {
      building: GameEntity;
      ratio: number;
      dist: number;
    }
    const candidates: CandidateInfo[] = [];

    for (const b of buildingEntities) {
      if (b.id === stockpile.id || !b.isCompleted) continue;
      if (b.buildingType === 'stockpile') continue;

      if (targetRegionId !== undefined && b.regionId !== undefined && b.regionId !== targetRegionId) {
        continue;
      }
      if (stockpile.factionId && b.factionId && b.factionId !== stockpile.factionId) {
        continue;
      }

      let totalStored = 0;
      if (b.localInventory) {
        for (const val of Object.values(b.localInventory)) {
          if (val) totalStored += val;
        }
      }
      const claimed = claimedMap.get(b.id) || 0;
      if (totalStored <= claimed) continue;

      const storedAvail = totalStored - claimed;
      const cap = b.maxStorage || (b.buildingType ? BUILDING_BLUEPRINTS[b.buildingType]?.maxStorage : 20) || 20;
      const ratio = storedAvail / cap;
      const bx = b.gridPosition ? b.gridPosition[0] : 0;
      const bz = b.gridPosition ? b.gridPosition[1] : 0;
      const dist = distance2D(uX, uZ, bx, bz);

      candidates.push({
        building: b,
        ratio,
        dist,
      });
    }

    if (candidates.length > 0) {
      candidates.sort((a, b) => {
        if (Math.abs(a.ratio - b.ratio) > 0.15) {
          return b.ratio - a.ratio;
        }
        return a.dist - b.dist;
      });

      const chosen = candidates[0].building;
      const doorInfo = getBuildingDoorInfo(chosen);
      const path = AStar.findPath(grid, [Math.floor(uX), Math.floor(uZ)], doorInfo.doorApproachPos, true, uBounds);

      if (path && path.length > 0) {
        unit.currentJob = {
          id: `haul-to-${chosen.id}-${Date.now()}`,
          type: 'haul_resource',
          targetBuildingId: chosen.id,
          progress: 0,
          totalWork: 20,
        };
        unit.path = path;

        unit.speechBubble = {
          text: `Прямую по ресурси: ${chosen.name || 'споруда'}...`,
          expiresAtTick: currentTick + 25,
          type: 'work',
        };
        return true;
      }
    }

    const distToStation = Math.hypot(uX - station.workWorldPos[0], uZ - station.workWorldPos[1]);
    const baseH = grid.getTile(Math.floor(station.workWorldPos[0]), Math.floor(station.workWorldPos[1]))?.height || 0;
    const floorY = baseH + getBuildingFloorHeight(stockpile.buildingType) + 0.05;

    const facingAngle = Math.atan2(
      station.facingTarget[0] - station.workWorldPos[0],
      station.facingTarget[1] - station.workWorldPos[1]
    );

    if (distToStation < 0.6 && (!unit.path || unit.path.length === 0)) {
      if (unit.currentJob?.type !== 'work_at_building') {
        unit.currentJob = {
          id: `stockpile-idle-${unit.id}`,
          type: 'work_at_building',
          targetBuildingId: stockpile.id,
          targetPosition: [station.workWorldPos[0], station.workWorldPos[1]],
          targetAngle: facingAngle,
          targetY: floorY,
          progress: 0,
          totalWork: 100,
        };
        unit.position = [station.workWorldPos[0], floorY, station.workWorldPos[1]];
        unit.gridPosition = [Math.floor(station.workWorldPos[0]), Math.floor(station.workWorldPos[1])];
        unit.path = [];
      } else {
        unit.currentJob.targetAngle = facingAngle;
      }

      if (currentTick % 80 === 0 && Math.random() < 0.3) {
        unit.speechBubble = {
          text: 'Склад під наглядом, очікую нових вантажів...',
          expiresAtTick: currentTick + 25,
          type: 'work',
        };
      }
      return true;
    }

    if (unit.currentJob?.type === 'work_at_building' && unit.path && unit.path.length > 0) {
      return true;
    }

    const pathHome = createPathToInterior(
      grid,
      [Math.floor(uX), Math.floor(uZ)],
      station.doorApproachPos,
      station.doorWorldPos,
      station.workWorldPos,
      station.intermediatePos,
      uBounds,
      unit.position,
      stockpile
    );

    unit.currentJob = {
      id: `stockpile-nav-${unit.id}`,
      type: 'work_at_building',
      targetBuildingId: stockpile.id,
      targetPosition: [station.workWorldPos[0], station.workWorldPos[1]],
      targetAngle: facingAngle,
      targetY: floorY,
      progress: 0,
      totalWork: 100,
    };

    if (pathHome && pathHome.length > 0) {
      unit.path = pathHome;
    } else {
      unit.position = [station.workWorldPos[0], floorY, station.workWorldPos[1]];
      unit.gridPosition = [Math.floor(station.workWorldPos[0]), Math.floor(station.workWorldPos[1])];
      unit.path = [];
    }

    return true;
  }
}

