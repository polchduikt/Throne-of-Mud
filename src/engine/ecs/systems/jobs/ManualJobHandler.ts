import type { GameEntity, Job } from '../../world';
import { buildingEntities, characterEntities } from '../../world';
import { GridMap } from '../../../grid/GridMap';
import { AStar } from '../../../pathfinding/AStar';
import { createPathSafely } from '../../../buildings/buildingNavigation';
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

    const availableJob = pendingJobs.find((j) => !j.assignedUnitId || j.assignedUnitId === unit.id);
    if (!availableJob) return false;

    let targetTile: [number, number] | null = null;
    if (availableJob.targetPosition) {
      targetTile = [Math.floor(availableJob.targetPosition[0]), Math.floor(availableJob.targetPosition[1])];
    } else if (availableJob.targetBuildingId) {
      const b = Array.from(buildingEntities).find((ent: GameEntity) => ent.id === availableJob.targetBuildingId);
      if (b && b.gridPosition) {
        targetTile = b.gridPosition;
      }
    }

    if (!targetTile) return false;

    let path: [number, number][] | null = null;
    const isAdjacentWork =
      availableJob.type === 'chop_tree' ||
      availableJob.type === 'mine_rock' ||
      availableJob.type === 'build_structure' ||
      availableJob.type === 'demolish_structure';

    if (isAdjacentWork) {
      const dist = distance2D(unit.gridPosition[0], unit.gridPosition[1], targetTile[0], targetTile[1]);
      if (dist <= 1.5) {
        path = [];
      } else {
        path = AStar.findPath(grid, unit.gridPosition, targetTile, true, uBounds);
      }
    } else {
      path = AStar.findPath(grid, unit.gridPosition, targetTile, false, uBounds);
    }

    if (path) {
      if (!availableJob.assignedUnitId) {
        availableJob.assignedUnitId = unit.id;
      }
      unit.currentJob = { ...availableJob, id: `job-${unit.id}-${Date.now()}` };
      unit.path = path;
      unit.speechBubble = {
        text: this.getJobAnnouncement(availableJob.type),
        expiresAtTick: currentTick + 20,
        type: 'work',
      };
      return true;
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
        let rx = Math.max(minX, Math.min(maxX, cx + Math.floor(Math.random() * 7 - 3)));
        let rz = Math.max(minZ, Math.min(maxZ, cz + Math.floor(Math.random() * 7 - 3)));
        for (let attempt = 0; attempt < 5; attempt++) {
          const candX = Math.max(minX, Math.min(maxX, cx + Math.floor(Math.random() * 7 - 3)));
          const candZ = Math.max(minZ, Math.min(maxZ, cz + Math.floor(Math.random() * 7 - 3)));
          const isOccupied = Array.from(characterEntities).some(
            (c: GameEntity) => c.id !== unit.id && c.gridPosition && c.gridPosition[0] === candX && c.gridPosition[1] === candZ
          );
          if (!isOccupied && grid.isWalkable(candX, candZ)) {
            rx = candX;
            rz = candZ;
            break;
          }
        }
        if (grid.isWalkable(rx, rz)) {
          const wanderPath = createPathSafely(grid, unit.position, unit.gridPosition, [rx, rz], buildingEntities, false, uBounds);
          if (wanderPath && wanderPath.length > 0) {
            unit.path = wanderPath;
            unit.currentJob = {
              id: `wander-${Date.now()}`,
              type: 'wander',
              progress: 0,
              totalWork: 10,
            };
          }
        }
      }
    }
  }

  public static getJobAnnouncement(type: string): string {
    switch (type) {
      case 'chop_tree': return 'Іду рубати ліс';
      case 'mine_rock': return 'Іду видобувати камінь';
      case 'build_structure': return 'Іду на будівництво';
      case 'demolish_structure': return 'Іду розбирати споруду';
      case 'harvest_wheat': return 'Час збирати врожай';
      case 'work_at_building': return 'Іду на робоче місце';
      case 'patrol': return 'Патрулюю володіння';
      case 'sleep': return 'Іду відпочивати';
      case 'sit_by_fire': return 'Іду грітися біля вогню';
      default: return 'Виконую наказ';
    }
  }
}
