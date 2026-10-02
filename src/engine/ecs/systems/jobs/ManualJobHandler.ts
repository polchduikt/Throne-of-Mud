import type { GameEntity, Job } from '../../world';
import { buildingEntities, characterEntities } from '../../world';
import { GridMap } from '../../../grid/GridMap';
import { getBuildingDoorInfo, createPathSafely, createPathToAreaSafely } from '../../../buildings/buildingNavigation';
import { distance2D } from '../../../../utils/mathUtils';
import { isNoble } from '../../entityHelpers';
import { useGameStore } from '../../../../store/useGameStore';

export class ManualJobHandler {
  public static assignPendingJob(
    unit: GameEntity,
    pendingJobs: Job[],
    grid: GridMap,
    uBounds: { minX: number; maxX: number; minZ: number; maxZ: number } | undefined,
    currentTick: number
  ): boolean {
    if (!unit.gridPosition) return false;

    const activeBuildersCount = new Map<string, number>();
    const takenJobIds = new Set<string>();
    const takenPositions = new Set<number>();

    for (const c of characterEntities) {
      if (c.id === unit.id || !c.currentJob) continue;
      const job = c.currentJob;

      if ((job.type === 'build_structure' || job.type === 'demolish_structure') && job.targetBuildingId) {
        const count = activeBuildersCount.get(job.targetBuildingId) || 0;
        activeBuildersCount.set(job.targetBuildingId, count + 1);
      }

      takenJobIds.add(job.id);
      if (job.targetPosition) {
        takenPositions.add((Math.floor(job.targetPosition[1]) << 16) | Math.floor(job.targetPosition[0]));
      }
    }

    const candidateJobs = pendingJobs.filter((j) => {
      if (j.type === 'build_structure' || j.type === 'demolish_structure') {
        const count = j.targetBuildingId ? (activeBuildersCount.get(j.targetBuildingId) || 0) : 0;
        return count < 4;
      }

      if (j.assignedUnitId && j.assignedUnitId !== unit.id) {
        return false;
      }

      if (takenJobIds.has(j.id)) {
        return false;
      }

      if (j.targetPosition) {
        const posKey = (Math.floor(j.targetPosition[1]) << 16) | Math.floor(j.targetPosition[0]);
        if (takenPositions.has(posKey)) {
          return false;
        }
      }

      return true;
    });

    if (candidateJobs.length === 0) return false;

    const unitGx = unit.gridPosition[0];
    const unitGz = unit.gridPosition[1];

    const buildingMap = new Map<string, GameEntity>();
    for (const b of buildingEntities) {
      buildingMap.set(b.id, b);
    }

    const sortedJobs = [...candidateJobs].sort((a, b) => {
      let ax = a.targetPosition ? a.targetPosition[0] : unitGx;
      let az = a.targetPosition ? a.targetPosition[1] : unitGz;
      if (a.targetBuildingId) {
        const bEnt = buildingMap.get(a.targetBuildingId);
        if (bEnt && bEnt.gridPosition) {
          ax = bEnt.gridPosition[0] + (bEnt.buildingWidth || 2) / 2;
          az = bEnt.gridPosition[1] + (bEnt.buildingHeight || 2) / 2;
        }
      }

      let bx = b.targetPosition ? b.targetPosition[0] : unitGx;
      let bz = b.targetPosition ? b.targetPosition[1] : unitGz;
      if (b.targetBuildingId) {
        const bEnt = buildingMap.get(b.targetBuildingId);
        if (bEnt && bEnt.gridPosition) {
          bx = bEnt.gridPosition[0] + (bEnt.buildingWidth || 2) / 2;
          bz = bEnt.gridPosition[1] + (bEnt.buildingHeight || 2) / 2;
        }
      }

      const distA = distance2D(unitGx, unitGz, ax, az);
      const distB = distance2D(unitGx, unitGz, bx, bz);
      return distA - distB;
    });

    for (const job of sortedJobs.slice(0, 3)) {
      let path: [number, number][] | null = null;

      if (job.type === 'build_structure' || job.type === 'demolish_structure') {
        const b = job.targetBuildingId ? buildingMap.get(job.targetBuildingId) : undefined;
        if (b && b.gridPosition) {
          const bx = b.gridPosition[0];
          const bz = b.gridPosition[1];
          const bw = b.buildingWidth || 2;
          const bh = b.buildingHeight || 2;

          const isAdjacent =
            unitGx >= bx - 1 &&
            unitGx <= bx + bw &&
            unitGz >= bz - 1 &&
            unitGz <= bz + bh;

          if (isAdjacent) {
            path = [];
          } else {
            path = createPathToAreaSafely(grid, unit.position, unit.gridPosition, bx, bz, bw, bh, buildingEntities, uBounds);
            if (!path || path.length === 0) {
              const door = getBuildingDoorInfo(b);
              path = createPathSafely(grid, unit.position, unit.gridPosition, door.doorApproachPos, buildingEntities, true, uBounds);
            }
          }
        } else if (job.targetPosition) {
          const targetTile: [number, number] = [
            Math.floor(job.targetPosition[0]),
            Math.floor(job.targetPosition[1]),
          ];
          const dist = distance2D(unitGx, unitGz, targetTile[0], targetTile[1]);
          if (dist <= 1.5) {
            path = [];
          } else {
            path = createPathSafely(grid, unit.position, unit.gridPosition, targetTile, buildingEntities, true, uBounds);
          }
        }
      } else {
        const isAdjacentWork =
          job.type === 'chop_tree' ||
          job.type === 'mine_rock' ||
          job.type === 'chop_fallen_log' ||
          job.type === 'harvest_wheat';

        const targetTile: [number, number] = job.targetPosition
          ? [Math.floor(job.targetPosition[0]), Math.floor(job.targetPosition[1])]
          : [unitGx, unitGz];

        if (isAdjacentWork) {
          const dist = distance2D(unitGx, unitGz, targetTile[0], targetTile[1]);
          if (dist <= 1.5) {
            path = [];
          } else {
            path = createPathSafely(grid, unit.position, unit.gridPosition, targetTile, buildingEntities, true, uBounds);
          }
        } else {
          path = createPathSafely(grid, unit.position, unit.gridPosition, targetTile, buildingEntities, false, uBounds);
        }
      }

      if (path !== null) {
        if (!job.assignedUnitId) {
          job.assignedUnitId = unit.id;
        }
        unit.currentJob = { ...job, id: job.id };
        unit.path = path;
        unit.speechBubble = {
          text: this.getJobAnnouncement(job.type),
          expiresAtTick: currentTick + 20,
          type: 'work',
        };
        return true;
      }
    }

    return false;
  }

  public static handleIdleWander(
    unit: GameEntity,
    grid: GridMap,
    uBounds: { minX: number; maxX: number; minZ: number; maxZ: number } | undefined,
    cx: number,
    cz: number,
    currentTick?: number
  ): void {
    if (unit.path && unit.path.length > 0) return;
    if (!unit.gridPosition) return;

    const tick = currentTick ?? (useGameStore.getState().time.tick || 0);

    if (Math.random() > 0.08) return;

    const curX = unit.gridPosition[0];
    const curZ = unit.gridPosition[1];

    const minX = uBounds ? uBounds.minX + 2 : 2;
    const maxX = uBounds ? uBounds.maxX - 2 : grid.width - 3;
    const minZ = uBounds ? uBounds.minZ + 2 : 2;
    const maxZ = uBounds ? uBounds.maxZ - 2 : grid.height - 3;

    const candidateDestinations: [number, number][] = [];
    const isValidDestination = (x: number, z: number): boolean => {
      if (x < minX || x > maxX || z < minZ || z > maxZ) return false;
      if (Math.hypot(x - curX, z - curZ) < 3) return false;
      if (!grid.isWalkable(x, z)) return false;

      return !Array.from(characterEntities).some(
        (other) =>
          other.id !== unit.id &&
          other.gridPosition &&
          other.gridPosition[0] === x &&
          other.gridPosition[1] === z
      );
    };

    if (grid.roadCoords && grid.roadCoords.size > 0) {
      const gWidth = grid.width;
      let sampleCount = 0;
      for (const code of grid.roadCoords) {
        if (++sampleCount > 30) break;
        const rx = Math.floor(code / gWidth);
        const rz = code % gWidth;
        const dist = Math.hypot(rx - curX, rz - curZ);
        if (dist <= 16 && isValidDestination(rx, rz)) {
          candidateDestinations.push([rx, rz]);
          if (candidateDestinations.length >= 3) break;
        }
      }
    }

    const localBuildings: GameEntity[] = [];
    for (const b of buildingEntities) {
      if (!b.isCompleted || !b.gridPosition) continue;
      const isSameFaction = unit.factionId ? b.factionId === unit.factionId : (b.factionId === 'player' || b.factionId === undefined);
      const isSameRegion = unit.regionId !== undefined ? b.regionId === unit.regionId : true;
      if (isSameFaction || isSameRegion) {
        localBuildings.push(b);
      }
    }

    if (localBuildings.length > 0 && Math.random() < 0.6) {
      const b = localBuildings[Math.floor(Math.random() * localBuildings.length)];
      if (b.gridPosition) {
        const bx = b.gridPosition[0] + Math.floor((b.buildingWidth || 2) / 2);
        const bz = b.gridPosition[1] + Math.floor((b.buildingHeight || 2) / 2);
        for (const [ox, oz] of [[-2, 0], [2, 0], [0, -2], [0, 2], [-1, -1], [1, 1]]) {
          const tx = bx + ox;
          const tz = bz + oz;
          if (isValidDestination(tx, tz)) {
            candidateDestinations.push([tx, tz]);
          }
        }
      }
    }

    const anchorX = cx || curX;
    const anchorZ = cz || curZ;
    for (let attempt = 0; attempt < 8; attempt++) {
      const angle = Math.random() * Math.PI * 2;
      const dist = 4 + Math.random() * 8;
      const candX = Math.round(anchorX + Math.cos(angle) * dist);
      const candZ = Math.round(anchorZ + Math.sin(angle) * dist);
      if (isValidDestination(candX, candZ)) {
        candidateDestinations.push([candX, candZ]);
      }
    }

    if (candidateDestinations.length === 0) return;

    const chosen = candidateDestinations[Math.floor(Math.random() * candidateDestinations.length)];
    const wanderPath = createPathSafely(
      grid,
      unit.position,
      unit.gridPosition,
      chosen,
      buildingEntities,
      false,
      uBounds
    );

    const movementPath = wanderPath?.filter(([x, z]) => x !== curX || z !== curZ) ?? [];

    if (movementPath.length > 0) {
      unit.path = movementPath;
      unit.currentJob = {
        id: `wander-${Date.now()}`,
        type: 'wander',
        progress: 0,
        totalWork: 12,
      };

      if (Math.random() < 0.25) {
        const isLord = isNoble(unit);
        let text = '';
        if (isLord) {
          const lordPhrases = [
            'Оглядаю володіння',
            'Село зростає на очах',
            'Свіже повітря піде на користь',
            'Усе йде за планом',
            'Потрібно перевірити межі земель',
            'Вітаю, жителі моїх земель!',
          ];
          text = lordPhrases[Math.floor(Math.random() * lordPhrases.length)];
        } else {
          const peasantPhrases = [
            "Розім'яти б ноги",
            'Піду гляну, як там справи',
            'Гарна нині погода',
            'Час перепочити',
            'Піду погріюся біля вогню',
            'Наше поселення гарнішає',
          ];
          text = peasantPhrases[Math.floor(Math.random() * peasantPhrases.length)];
        }
        unit.speechBubble = {
          text,
          expiresAtTick: tick + 35,
          type: 'mood',
        };
      }
    }
  }

  public static getJobAnnouncement(type: string): string {
    switch (type) {
      case 'chop_tree':
      case 'chop_fallen_log':
        return 'Іду рубати ліс';
      case 'mine_rock':
        return 'Іду видобувати камінь';
      case 'build_structure':
        return 'Іду на будівництво';
      case 'demolish_structure':
        return 'Іду розбирати споруду';
      case 'harvest_wheat':
        return 'Час збирати врожай';
      case 'work_at_building':
        return 'Іду на робоче місце';
      case 'patrol':
        return 'Патрулюю володіння';
      case 'sleep':
        return 'Іду відпочивати';
      case 'sit_by_fire':
        return 'Іду грітися біля вогню';
      default:
        return 'Виконую наказ';
    }
  }
}
