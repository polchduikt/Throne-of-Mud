import { characterEntities, buildingEntities, type GameEntity } from '../../world';
import { GridMap } from '../../../grid/GridMap';
import { AStar } from '../../../pathfinding/AStar';
import type { RegionData } from '../../../../types/game';
import {
  getBuildingSleepSpot,
  getCampfireSitSpot,
  createPathToInterior,
  createPathFromInterior,
  createPathSafely,
} from '../../../buildings/buildingNavigation';
import { setEntitySpeech } from '../../entityHelpers';
import {
  BED_SLEEP_RESTORE_ENERGY,
  CAMPFIRE_REST_RESTORE_ENERGY,
  BED_SLEEP_MOOD_BOOST,
  CAMPFIRE_REST_MOOD_PENALTY,
  MAX_MOOD,
  DEFAULT_MOOD,
  DEFAULT_SPEECH_DURATION_TICKS,
} from '../../../../constants/needs';
import { distance2D } from '../../../../utils/mathUtils';

export function getEntityRegionId(entity: GameEntity, regions: RegionData[], defaultRegionId: number = 0): number {
  if (entity.regionId !== undefined) return entity.regionId;
  const pos = entity.gridPosition || (entity.position ? [Math.floor(entity.position[0]), Math.floor(entity.position[2])] : null);
  if (pos && regions) {
    const found = regions.find(
      (r) => pos[0] >= r.bounds.minX && pos[0] <= r.bounds.maxX && pos[1] >= r.bounds.minZ && pos[1] <= r.bounds.maxZ
    );
    if (found) {
      entity.regionId = found.id;
      return found.id;
    }
  }
  entity.regionId = defaultRegionId;
  return defaultRegionId;
}

export class RestJobHandler {
  public static handleMorningWakeUp(
    unit: GameEntity,
    isAlreadySleeping: boolean,
    _isAlreadySitting: boolean,
    isNoble: boolean,
    currentTick: number,
    grid: GridMap,
    uBounds?: { minX: number; maxX: number; minZ: number; maxZ: number }
  ): boolean {
    const prevSleepingBuildingId = unit.currentJob?.targetBuildingId;
    const wasSleeping = isAlreadySleeping;

    unit.currentJob = {
      id: `idle-${Date.now()}`,
      type: 'idle',
      progress: 0,
      totalWork: 0,
    };

    if (unit.needs) {
      if (wasSleeping) {
        unit.needs.energy = Math.max(BED_SLEEP_RESTORE_ENERGY, unit.needs.energy);
        unit.needs.mood = Math.min(MAX_MOOD, (unit.needs.mood || DEFAULT_MOOD) + BED_SLEEP_MOOD_BOOST);
      } else {
        unit.needs.energy = Math.max(CAMPFIRE_REST_RESTORE_ENERGY, unit.needs.energy);
        unit.needs.mood = Math.max(20, (unit.needs.mood || DEFAULT_MOOD) - CAMPFIRE_REST_MOOD_PENALTY);
      }
    }

    setEntitySpeech(
      unit,
      isNoble
        ? 'Новий день у королівстві!'
        : wasSleeping
        ? 'Доброго ранку! До праці!'
        : 'Нарешті ранок... Всю ніч мерз біля вогню.',
      'mood',
      currentTick,
      DEFAULT_SPEECH_DURATION_TICKS
    );

    if (prevSleepingBuildingId) {
      const b = Array.from(buildingEntities).find((e: GameEntity) => e.id === prevSleepingBuildingId);
      if (b) {
        const sleepSpot = getBuildingSleepSpot(b);
        const exitPath = createPathFromInterior(
          grid,
          sleepSpot.doorWorldPos,
          sleepSpot.doorApproachPos,
          sleepSpot.doorApproachPos,
          sleepSpot.intermediatePos,
          uBounds
        );
        if (exitPath && exitPath.length > 0) {
          unit.path = exitPath;
        }
      }
    } else if (unit.gridPosition) {
      const [ux, uz] = unit.gridPosition;
      const exitCandidates: [number, number][] = [
        [ux, uz + 1],
        [ux, uz + 2],
        [ux + 1, uz + 1],
        [ux - 1, uz + 1],
        [ux, uz - 1],
      ];
      for (const [ex, ez] of exitCandidates) {
        if (grid.isWalkable(ex, ez)) {
          const exitPath = AStar.findPath(grid, [ux, uz], [ex, ez], false, uBounds);
          if (exitPath && exitPath.length > 0) {
            unit.path = exitPath;
            break;
          }
        }
      }
    }

    return true;
  }

  public static handleNightAndExhaustion(
    unit: GameEntity,
    isPlayerUnit: boolean,
    isNoble: boolean,
    grid: GridMap,
    currentTick: number,
    regions: RegionData[],
    uRegionId: number,
    uBounds: { minX: number; maxX: number; minZ: number; maxZ: number } | undefined,
    _cx: number,
    _cz: number,
    playerRegionId?: number
  ): boolean {
    const isAlreadySleeping = unit.currentJob?.type === 'sleep';
    const isAlreadySitting = unit.currentJob?.type === 'sit_by_fire';

    if (isAlreadySleeping && unit.currentJob) {
      const sleepJob = unit.currentJob;
      const targetPos = sleepJob.targetPosition;
      if (targetPos) {
        const [bedX, bedZ] = targetPos;
        let targetY = sleepJob.targetY;
        if (sleepJob.targetBuildingId && (targetY === undefined || targetY < 0.16)) {
          const b = Array.from(buildingEntities).find((ent: GameEntity) => ent.id === sleepJob.targetBuildingId);
          if (b) {
            const spot = getBuildingSleepSpot(b, sleepJob.bedIndex ?? 0);
            targetY = spot.bedY;
            sleepJob.targetY = spot.bedY;
          }
        }
        if (targetY === undefined) {
          targetY = (grid.getTile(Math.floor(bedX), Math.floor(bedZ))?.height || 0) + 0.03;
        }

        const currentUPos = unit.position || [bedX, targetY, bedZ];
        const distToBed = distance2D(currentUPos[0], currentUPos[2], bedX, bedZ);

        if (!unit.path || unit.path.length === 0) {
          if (distToBed <= 0.45) {
            unit.position = [bedX, targetY, bedZ];
            unit.gridPosition = [Math.floor(bedX), Math.floor(bedZ)];
            if (unit.needs) {
              unit.needs.energy = Math.min(100, unit.needs.energy + 0.35);
            }
          } else {
            if (sleepJob.targetBuildingId) {
              const b = Array.from(buildingEntities).find((ent: GameEntity) => ent.id === sleepJob.targetBuildingId);
              if (b) {
                const spot = getBuildingSleepSpot(b, sleepJob.bedIndex ?? 0);
                const sleepPath = createPathToInterior(
                  grid,
                  unit.gridPosition || [Math.floor(currentUPos[0]), Math.floor(currentUPos[2])],
                  spot.doorApproachPos,
                  spot.doorWorldPos,
                  spot.bedWorldPos,
                  spot.intermediatePos,
                  uBounds,
                  unit.position,
                  b
                );
                if (sleepPath && sleepPath.length > 0) {
                  unit.path = sleepPath;
                } else {
                  unit.currentJob = { id: `idle-${unit.id}`, type: 'idle', progress: 0, totalWork: 0 };
                }
              }
            } else {
              const sleepPath = createPathSafely(
                grid,
                unit.position,
                unit.gridPosition,
                [Math.floor(bedX), Math.floor(bedZ)],
                buildingEntities,
                false,
                uBounds
              );
              if (sleepPath && sleepPath.length > 0) {
                unit.path = sleepPath;
              } else {
                unit.currentJob = { id: `idle-${unit.id}`, type: 'idle', progress: 0, totalWork: 0 };
              }
            }
          }
        }
      }
      return true;
    }

    if (isAlreadySitting && unit.currentJob) {
      const sitJob = unit.currentJob;
      const targetPos = sitJob.targetPosition;
      if (targetPos) {
        const [sitX, sitZ] = targetPos;
        const targetY = sitJob.targetY ?? 0.15;
        const currentUPos = unit.position || [sitX, targetY, sitZ];
        const distToSit = distance2D(currentUPos[0], currentUPos[2], sitX, sitZ);

        if (!unit.path || unit.path.length === 0) {
          if (distToSit <= 0.6) {
            unit.position = [sitX, targetY, sitZ];
            unit.gridPosition = [Math.floor(sitX), Math.floor(sitZ)];
            if (sitJob.targetAngle === undefined && sitJob.targetBuildingId) {
              const camp = Array.from(buildingEntities).find((b: GameEntity) => b.id === sitJob.targetBuildingId);
              if (camp?.gridPosition) {
                const cx = camp.gridPosition[0] + 1.0;
                const cz = camp.gridPosition[1] + 1.0;
                sitJob.targetAngle = Math.atan2(cx - sitX, cz - sitZ);
              }
            }
            if (unit.needs) {
              unit.needs.energy = Math.min(45, unit.needs.energy + 0.05);
            }
          } else {
            const campfires = Array.from(buildingEntities).filter(
              (b: GameEntity) => b.isCompleted && b.buildingType === 'campfire' && getEntityRegionId(b, regions, playerRegionId ?? 0) === uRegionId
            );
            const campfire = campfires.find((c: GameEntity) => c.id === sitJob.targetBuildingId) || (campfires.length > 0 ? campfires[0] : null);
            const sitSpot = campfire ? getCampfireSitSpot(campfire, sitJob.seatIndex ?? 0) : null;
            const approachTile = sitSpot?.approachTile || [Math.floor(sitX), Math.floor(sitZ)];

            const sitPath = createPathSafely(
              grid,
              unit.position,
              unit.gridPosition,
              approachTile,
              buildingEntities,
              true,
              uBounds
            );
            if (sitPath && sitPath.length > 0) {
              sitPath.push([sitX - 0.5, sitZ - 0.5]);
              unit.path = sitPath;
            } else if (distToSit <= 1.8) {
              unit.position = [sitX, targetY, sitZ];
              unit.gridPosition = [Math.floor(sitX), Math.floor(sitZ)];
            }
          }
        }
      }
      return true;
    }

    const completedBuildings = Array.from(buildingEntities).filter((b: GameEntity) => {
      if (!b.isCompleted) return false;
      const bRegId = getEntityRegionId(b, regions, playerRegionId ?? 0);
      if (bRegId !== uRegionId) return false;
      if (isPlayerUnit && b.factionId && b.factionId !== 'player') return false;
      if (!isPlayerUnit && b.factionId === 'player') return false;
      return true;
    });

    const buildingOccupiedBeds = new Map<string, Set<number>>();
    const campfireOccupiedSeats = new Map<string, Set<number>>();

    for (const other of characterEntities) {
      const otherEnt = other as GameEntity;
      if (otherEnt.id === unit.id || !otherEnt.currentJob) continue;
      const bId = otherEnt.currentJob.targetBuildingId;
      if (!bId) continue;
      if (otherEnt.currentJob.type === 'sleep') {
        let set = buildingOccupiedBeds.get(bId);
        if (!set) {
          set = new Set<number>();
          buildingOccupiedBeds.set(bId, set);
        }
        set.add(otherEnt.currentJob.bedIndex ?? 0);
      } else if (otherEnt.currentJob.type === 'sit_by_fire') {
        let set = campfireOccupiedSeats.get(bId);
        if (!set) {
          set = new Set<number>();
          campfireOccupiedSeats.set(bId, set);
        }
        set.add(otherEnt.currentJob.seatIndex ?? 0);
      }
    }

    let chosenBuilding: GameEntity | null = null;
    let chosenBedIndex = 0;

    if (isNoble) {
      const manors = completedBuildings.filter((b: GameEntity) => b.buildingType === 'manor');
      for (const manor of manors) {
        const occupied = buildingOccupiedBeds.get(manor.id) || new Set<number>();
        for (let i = 0; i < 4; i++) {
          if (!occupied.has(i)) {
            chosenBuilding = manor;
            chosenBedIndex = i;
            break;
          }
        }
        if (chosenBuilding) break;
      }
    }

    if (!chosenBuilding && unit.characterClass === 'warrior') {
      const barracks = completedBuildings.filter((b: GameEntity) => b.buildingType === 'barracks');
      for (const b of barracks) {
        const occupied = buildingOccupiedBeds.get(b.id) || new Set<number>();
        for (let i = 0; i < 2; i++) {
          if (!occupied.has(i)) {
            chosenBuilding = b;
            chosenBedIndex = i;
            break;
          }
        }
        if (chosenBuilding) break;
      }
    }

    if (!chosenBuilding && !isNoble) {
      const houses = completedBuildings.filter((b: GameEntity) => b.buildingType === 'peasant_house');
      for (const h of houses) {
        const occupied = buildingOccupiedBeds.get(h.id) || new Set<number>();
        for (let i = 0; i < 2; i++) {
          if (!occupied.has(i)) {
            chosenBuilding = h;
            chosenBedIndex = i;
            break;
          }
        }
        if (chosenBuilding) break;
      }

      if (!chosenBuilding) {
        const tents = completedBuildings.filter((b: GameEntity) => b.buildingType === 'tent');
        for (const t of tents) {
          const occupied = buildingOccupiedBeds.get(t.id) || new Set<number>();
          if (!occupied.has(0)) {
            chosenBuilding = t;
            chosenBedIndex = 0;
            break;
          }
        }
      }
    }

    if (chosenBuilding) {
      const spot = getBuildingSleepSpot(chosenBuilding, chosenBedIndex);
      const sleepPath = createPathToInterior(
        grid,
        unit.gridPosition || [Math.floor(unit.position?.[0] || 0), Math.floor(unit.position?.[2] || 0)],
        spot.doorApproachPos,
        spot.doorWorldPos,
        spot.bedWorldPos,
        spot.intermediatePos,
        uBounds,
        unit.position,
        chosenBuilding
      );

      unit.currentJob = {
        id: `sleep-${unit.id}-${Date.now()}`,
        type: 'sleep',
        targetBuildingId: chosenBuilding.id,
        targetPosition: [spot.bedWorldPos[0], spot.bedWorldPos[1]],
        targetY: spot.bedY,
        bedIndex: chosenBedIndex,
        progress: 0,
        totalWork: 100,
      };

      if (sleepPath && sleepPath.length > 0) {
        unit.path = sleepPath;
      }

      setEntitySpeech(
        unit,
        isNoble ? 'Час відпочити у палатах...' : 'Йду спати у теплий дім...',
        'mood',
        currentTick,
        DEFAULT_SPEECH_DURATION_TICKS
      );
      return true;
    }

    const campfires = completedBuildings.filter((b: GameEntity) => b.buildingType === 'campfire');
    if (campfires.length > 0) {
      let chosenCampfire = campfires[0];
      let chosenSeatIndex = 0;
      let foundSeat = false;

      for (const campfire of campfires) {
        const occupied = campfireOccupiedSeats.get(campfire.id) || new Set<number>();
        for (let seat = 0; seat < 16; seat++) {
          if (!occupied.has(seat)) {
            chosenCampfire = campfire;
            chosenSeatIndex = seat;
            foundSeat = true;
            break;
          }
        }
        if (foundSeat) break;
      }

      if (!foundSeat) {
        const occupied = campfireOccupiedSeats.get(chosenCampfire.id) || new Set<number>();
        chosenSeatIndex = occupied.size % 16;
      }

      const sitSpot = getCampfireSitSpot(chosenCampfire, chosenSeatIndex);

      const sitPath = createPathSafely(
        grid,
        unit.position,
        unit.gridPosition,
        sitSpot.approachTile,
        buildingEntities,
        true,
        uBounds
      );

      unit.currentJob = {
        id: `sit-fire-${unit.id}-${Date.now()}`,
        type: 'sit_by_fire',
        targetBuildingId: chosenCampfire.id,
        targetPosition: [sitSpot.position[0], sitSpot.position[1]],
        targetAngle: sitSpot.facingAngle,
        targetY: sitSpot.spotY,
        seatIndex: chosenSeatIndex,
        bedIndex: chosenSeatIndex,
        progress: 0,
        totalWork: 100,
      };

      if (sitPath && sitPath.length > 0) {
        sitPath.push([sitSpot.position[0] - 0.5, sitSpot.position[1] - 0.5]);
        unit.path = sitPath;
      }

      setEntitySpeech(
        unit,
        isNoble
          ? 'Ніч біля вогнища... Королівству потрібні хороми.'
          : 'Немає ліжка, грітимуся біля вогнища...',
        'alert',
        currentTick,
        DEFAULT_SPEECH_DURATION_TICKS
      );
      return true;
    }

    return false;
  }
}
