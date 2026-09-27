import type { GameEntity, Job } from '../../world';
import { buildingEntities, characterEntities } from '../../world';
import { GridMap } from '../../../grid/GridMap';
import { getBuildingDoorInfo, createPathSafely, createPathToAreaSafely } from '../../../buildings/buildingNavigation';
import { distance2D } from '../../../../utils/mathUtils';

export class ManualJobHandler {
  public static assignPendingJob(
    unit: GameEntity,
    pendingJobs: Job[],
    grid: GridMap,
    uBounds: { minX: number; maxX: number; minZ: number; maxZ: number } | undefined,
    currentTick: number
  ): boolean {
    if (!unit.gridPosition) return false;

    const candidateJobs = pendingJobs.filter((j) => {
      if (j.type === 'build_structure' || j.type === 'demolish_structure') {
        const activeBuilders = Array.from(characterEntities).filter(
          (c: GameEntity) =>
            c.id !== unit.id &&
            c.currentJob &&
            c.currentJob.targetBuildingId === j.targetBuildingId &&
            (c.currentJob.type === 'build_structure' || c.currentJob.type === 'demolish_structure')
        ).length;
        return activeBuilders < 4;
      }

      if (j.assignedUnitId && j.assignedUnitId !== unit.id) {
        return false;
      }

      const isTaken = Array.from(characterEntities).some(
        (c: GameEntity) =>
          c.id !== unit.id &&
          c.currentJob &&
          (c.currentJob.id === j.id ||
            (j.targetPosition &&
              c.currentJob.targetPosition &&
              c.currentJob.targetPosition[0] === j.targetPosition[0] &&
              c.currentJob.targetPosition[1] === j.targetPosition[1]))
      );
      return !isTaken;
    });

    if (candidateJobs.length === 0) return false;

    const unitGx = unit.gridPosition[0];
    const unitGz = unit.gridPosition[1];

    const sortedJobs = [...candidateJobs].sort((a, b) => {
      let ax = a.targetPosition ? a.targetPosition[0] : unitGx;
      let az = a.targetPosition ? a.targetPosition[1] : unitGz;
      if (a.targetBuildingId) {
        const bEnt = Array.from(buildingEntities).find((be: GameEntity) => be.id === a.targetBuildingId);
        if (bEnt && bEnt.gridPosition) {
          ax = bEnt.gridPosition[0] + (bEnt.buildingWidth || 2) / 2;
          az = bEnt.gridPosition[1] + (bEnt.buildingHeight || 2) / 2;
        }
      }

      let bx = b.targetPosition ? b.targetPosition[0] : unitGx;
      let bz = b.targetPosition ? b.targetPosition[1] : unitGz;
      if (b.targetBuildingId) {
        const bEnt = Array.from(buildingEntities).find((be: GameEntity) => be.id === b.targetBuildingId);
        if (bEnt && bEnt.gridPosition) {
          bx = bEnt.gridPosition[0] + (bEnt.buildingWidth || 2) / 2;
          bz = bEnt.gridPosition[1] + (bEnt.buildingHeight || 2) / 2;
        }
      }

      const distA = distance2D(unitGx, unitGz, ax, az);
      const distB = distance2D(unitGx, unitGz, bx, bz);
      return distA - distB;
    });

    for (const job of sortedJobs) {
      let path: [number, number][] | null = null;

      if (job.type === 'build_structure' || job.type === 'demolish_structure') {
        const b = Array.from(buildingEntities).find((ent: GameEntity) => ent.id === job.targetBuildingId);
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
    cz: number
  ): void {
    if (!unit.path || unit.path.length === 0) {
      if (Math.random() < 0.08 && unit.gridPosition) {
        const minX = uBounds ? uBounds.minX + 2 : 2;
        const maxX = uBounds ? uBounds.maxX - 2 : grid.width - 3;
        const minZ = uBounds ? uBounds.minZ + 2 : 2;
        const maxZ = uBounds ? uBounds.maxZ - 2 : grid.height - 3;

        const playerBuildings = Array.from(buildingEntities).filter(
          (b: GameEntity) =>
            (b.factionId === 'player' || b.factionId === undefined) &&
            b.isCompleted &&
            b.gridPosition
        );

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

        for (let attempt = 0; attempt < 8; attempt++) {
          const candX = Math.max(minX, Math.min(maxX, anchorX + Math.floor(Math.random() * (wanderRange * 2 + 1) - wanderRange)));
          const candZ = Math.max(minZ, Math.min(maxZ, anchorZ + Math.floor(Math.random() * (wanderRange * 2 + 1) - wanderRange)));
          const isOccupied = Array.from(characterEntities).some(
            (c: GameEntity) =>
              c.id !== unit.id &&
              c.gridPosition &&
              c.gridPosition[0] === candX &&
              c.gridPosition[1] === candZ
          );
          if (!isOccupied && grid.isWalkable(candX, candZ)) {
            rx = candX;
            rz = candZ;
            break;
          }
        }

        if (grid.isWalkable(rx, rz)) {
          const wanderPath = createPathSafely(
            grid,
            unit.position,
            unit.gridPosition,
            [rx, rz],
            buildingEntities,
            false,
            uBounds
          );
          if (wanderPath && wanderPath.length > 0) {
            unit.path = wanderPath;
            unit.currentJob = {
              id: `wander-${Date.now()}`,
              type: 'wander',
              progress: 0,
              totalWork: 12,
            };
          }
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

