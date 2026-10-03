import type { GameEntity, Job } from '../../world';
import { buildingEntities, characterEntities } from '../../world';
import { GridMap } from '../../../grid/GridMap';
import {
  createPathSafely,
  createPathToAreaSafely,
} from '../../../buildings/buildingNavigation';
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
    if (isNoble(unit)) return false;

    if (unit.path && unit.path.length > 0 && unit.currentJob && (
      unit.currentJob.type === 'build_structure' ||
      unit.currentJob.type === 'demolish_structure' ||
      unit.currentJob.type === 'chop_tree' ||
      unit.currentJob.type === 'chop_fallen_log' ||
      unit.currentJob.type === 'mine_rock' ||
      unit.currentJob.type === 'harvest_wheat'
    )) {
      return true;
    }

    const nextCheck = (unit as any).nextPendingJobCheckTick || 0;
    if (currentTick < nextCheck) return false;

    const activeBuildersCount = new Map<string, number>();
    const takenJobIds = new Set<string>();
    const takenPositions = new Set<number>();

    for (const c of characterEntities) {
      if (c.id === unit.id || !c.currentJob) continue;
      const job = c.currentJob;

      if ((job.type === 'build_structure' || job.type === 'demolish_structure') && job.targetBuildingId) {
        const count = activeBuildersCount.get(job.targetBuildingId) || 0;
        activeBuildersCount.set(job.targetBuildingId, count + 1);
      } else {
        takenJobIds.add(job.id);
        if (job.targetPosition) {
          takenPositions.add((Math.floor(job.targetPosition[1]) << 16) | Math.floor(job.targetPosition[0]));
        }
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

    if (candidateJobs.length === 0) {
      (unit as any).nextPendingJobCheckTick = currentTick + 4;
      return false;
    }

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

    for (const job of sortedJobs.slice(0, 4)) {
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
            path = createPathToAreaSafely(
              grid,
              unit.position,
              unit.gridPosition,
              bx,
              bz,
              bw,
              bh,
              buildingEntities,
              uBounds
            );
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
            path = createPathSafely(
              grid,
              unit.position,
              unit.gridPosition,
              targetTile,
              buildingEntities,
              true,
              uBounds
            );
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

        const dist = distance2D(unitGx, unitGz, targetTile[0], targetTile[1]);
        if (dist <= 1.5 && isAdjacentWork) {
          path = [];
        } else {
          path = createPathSafely(
            grid,
            unit.position,
            unit.gridPosition,
            targetTile,
            buildingEntities,
            isAdjacentWork,
            uBounds
          );
        }
      }

      if (path !== null) {
        if (!job.assignedUnitId && job.type !== 'build_structure' && job.type !== 'demolish_structure') {
          job.assignedUnitId = unit.id;
        }
        unit.currentJob = { ...job, id: job.id };
        if (path.length > 0 && path[0][0] === unitGx && path[0][1] === unitGz) {
          path.shift();
        }
        unit.path = path;
        unit.speechBubble = {
          text: this.getJobAnnouncement(job.type),
          expiresAtTick: currentTick + 25,
          type: 'work',
        };
        return true;
      }
    }

    (unit as any).nextPendingJobCheckTick = currentTick + 3;
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
    if (!unit.path || unit.path.length === 0) {
      const tick = currentTick ?? (useGameStore.getState().time.tick || 0);
      const idleCooldown = (unit as any).idleCooldownTicks ?? 0;
      if (tick >= idleCooldown && Math.random() < 0.08 && unit.gridPosition) {
        const minX = uBounds ? uBounds.minX + 2 : 2;
        const maxX = uBounds ? uBounds.maxX - 2 : grid.width - 3;
        const minZ = uBounds ? uBounds.minZ + 2 : 2;
        const maxZ = uBounds ? uBounds.maxZ - 2 : grid.height - 3;
        const [unitX, unitZ] = unit.gridPosition;
        const minimumWanderDistance = 3;

        const playerBuildings: GameEntity[] = [];
        for (const b of buildingEntities) {
          if (
            (b.factionId === 'player' || b.factionId === undefined) &&
            b.isCompleted &&
            b.gridPosition
          ) {
            playerBuildings.push(b);
          }
        }

        let anchorX = cx;
        let anchorZ = cz;
        let wanderRange = 12;

        if (playerBuildings.length > 0 && Math.random() < 0.65) {
          const randomB = playerBuildings[Math.floor(Math.random() * playerBuildings.length)];
          if (randomB.gridPosition) {
            anchorX = randomB.gridPosition[0] + Math.floor((randomB.buildingWidth || 2) / 2);
            anchorZ = randomB.gridPosition[1] + Math.floor((randomB.buildingHeight || 2) / 2);
            wanderRange = 5;
          }
        }

        let rx = Math.max(minX, Math.min(maxX, anchorX + Math.floor(Math.random() * (wanderRange * 2 + 1) - wanderRange)));
        let rz = Math.max(minZ, Math.min(maxZ, anchorZ + Math.floor(Math.random() * (wanderRange * 2 + 1) - wanderRange)));

        const occupiedCoords = new Set<number>();
        for (const c of characterEntities) {
          if (c.id !== unit.id && c.gridPosition) {
            occupiedCoords.add((c.gridPosition[1] << 16) | (c.gridPosition[0] & 0xffff));
          }
        }

        for (let attempt = 0; attempt < 8; attempt++) {
          const candX = Math.max(minX, Math.min(maxX, anchorX + Math.floor(Math.random() * (wanderRange * 2 + 1) - wanderRange)));
          const candZ = Math.max(minZ, Math.min(maxZ, anchorZ + Math.floor(Math.random() * (wanderRange * 2 + 1) - wanderRange)));
          const key = (candZ << 16) | (candX & 0xffff);

          if (
            !occupiedCoords.has(key) &&
            Math.hypot(candX - unitX, candZ - unitZ) >= minimumWanderDistance &&
            grid.isWalkable(candX, candZ)
          ) {
            rx = candX;
            rz = candZ;
            break;
          }
        }

        const isRealDestination =
          Math.hypot(rx - unitX, rz - unitZ) >= minimumWanderDistance &&
          grid.isWalkable(rx, rz);

        if (isRealDestination) {
          const wanderPath = createPathSafely(
            grid,
            unit.position,
            unit.gridPosition,
            [rx, rz],
            buildingEntities,
            false,
            uBounds
          );



          const movementPath = wanderPath?.filter(([x, z]) => x !== unitX || z !== unitZ) ?? [];
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
                expiresAtTick: (useGameStore.getState().time.tick || 0) + 35,
                type: 'mood',
              };
            }
          } else if (currentTick !== undefined) {
            (unit as any).idleCooldownTicks = currentTick + 20;
          }
        } else if (currentTick !== undefined) {
          (unit as any).idleCooldownTicks = currentTick + 20;
        }
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
