import type { GameEntity, Job } from '../../world';
import { buildingEntities } from '../../world';
import { GridMap } from '../../../grid/GridMap';
import { AStar } from '../../../pathfinding/AStar';
import { getTreeProceduralData } from '../../../world/foliageGeneration';
import { useGameStore } from '../../../../store/useGameStore';
import { distance2D } from '../../../../utils/mathUtils';
import {
  LUMBERJACK_HUT_MAX_STORAGE,
  WOODCUTTING_SEARCH_RADIUS,
  FALLEN_TREE_PRIORITY_BONUS,
  CHOP_TREE_TOTAL_WORK,
  WAIT_TREE_FALL_TOTAL_WORK,
  CHOP_FALLEN_LOG_TOTAL_WORK,
  CHOP_TREE_BASE_STRIKE,
  CHOP_LOG_STRIKE,
  CHOP_LOG_YIELD,
  WORK_SKILL_STEP_MULTIPLIER,
} from '../../../../constants/jobs';

export class WoodcuttingJobHandler {
  public static assignWoodcutterHutJob(
    unit: GameEntity,
    building: GameEntity,
    grid: GridMap,
    uBounds: { minX: number; maxX: number; minZ: number; maxZ: number } | undefined,
    currentTick: number,
    cx: number,
    cz: number
  ): boolean {
    const hutWood = building.localInventory?.wood || 0;
    const maxStorage = LUMBERJACK_HUT_MAX_STORAGE;

    if (hutWood >= maxStorage) {
      if (
        unit.currentJob?.type === 'chop_tree' ||
        unit.currentJob?.type === 'wait_tree_fall' ||
        unit.currentJob?.type === 'chop_fallen_log'
      ) {
        return false;
      }

      unit.currentJob = { id: `idle-full-${unit.id}`, type: 'idle', progress: 0, totalWork: 0 };

      if (building.gridPosition && unit.gridPosition) {
        const distToHut = distance2D(building.gridPosition[0], building.gridPosition[1], unit.gridPosition[0], unit.gridPosition[1]);
        if (distToHut > 2.2 && (!unit.path || unit.path.length === 0)) {
          const hutPath = AStar.findPath(grid, unit.gridPosition, building.gridPosition, true, uBounds);
          if (hutPath && hutPath.length > 0) {
            unit.path = hutPath;
          }
        }
      }

      if (currentTick % 30 === 0) {
        unit.speechBubble = {
          text: `Сховище хатини повне (${hutWood}/${maxStorage})! Відпочиваю`,
          expiresAtTick: currentTick + 25,
          type: 'work',
        };
      }
      return true;
    }

    if (
      unit.currentJob?.type === 'chop_tree' ||
      unit.currentJob?.type === 'wait_tree_fall' ||
      unit.currentJob?.type === 'chop_fallen_log'
    ) {
      return false;
    }

    let bestTarget: [number, number] | null = null;
    let bestPath: [number, number][] | null = null;
    let isFallenCandidate = false;

    if (unit.gridPosition) {
      const [ux, uz] = unit.gridPosition;
      const hutPos = building.gridPosition || [cx, cz];
      const candidateTrees: Array<{ pos: [number, number]; dist: number; isFallen: boolean }> = [];

      const minSearchX = uBounds ? Math.max(uBounds.minX, hutPos[0] - WOODCUTTING_SEARCH_RADIUS) : Math.max(0, hutPos[0] - WOODCUTTING_SEARCH_RADIUS);
      const maxSearchX = uBounds ? Math.min(uBounds.maxX, hutPos[0] + WOODCUTTING_SEARCH_RADIUS) : Math.min(grid.width - 1, hutPos[0] + WOODCUTTING_SEARCH_RADIUS);
      const minSearchZ = uBounds ? Math.max(uBounds.minZ, hutPos[1] - WOODCUTTING_SEARCH_RADIUS) : Math.max(0, hutPos[1] - WOODCUTTING_SEARCH_RADIUS);
      const maxSearchZ = uBounds ? Math.min(uBounds.maxZ, hutPos[1] + WOODCUTTING_SEARCH_RADIUS) : Math.min(grid.height - 1, hutPos[1] + WOODCUTTING_SEARCH_RADIUS);

      for (let x = minSearchX; x <= maxSearchX; x++) {
        for (let z = minSearchZ; z <= maxSearchZ; z++) {
          const tile = grid.tiles[x]?.[z];
          if (tile && !tile.buildingId && (tile.foliageType === 'fallen_tree' || tile.foliageType === 'tree')) {
            const distFromHut = distance2D(x, z, hutPos[0], hutPos[1]);
            const distFromUnit = distance2D(x, z, ux, uz);
            if (distFromHut <= WOODCUTTING_SEARCH_RADIUS) {
              const priorityBonus = tile.foliageType === 'fallen_tree' ? FALLEN_TREE_PRIORITY_BONUS : 0;
              candidateTrees.push({
                pos: [x, z],
                dist: distFromUnit + priorityBonus,
                isFallen: tile.foliageType === 'fallen_tree',
              });
            }
          }
        }
      }

      candidateTrees.sort((a, b) => a.dist - b.dist);

      for (const cand of candidateTrees.slice(0, 10)) {
        const path = AStar.findPath(grid, [ux, uz], cand.pos, true, uBounds);
        if (path && path.length > 0) {
          bestTarget = cand.pos;
          bestPath = path;
          isFallenCandidate = cand.isFallen;
          break;
        }
      }
    }

    if (bestTarget && bestPath) {
      if (isFallenCandidate) {
        unit.currentJob = {
          id: `chop-log-${unit.id}-${Date.now()}`,
          type: 'chop_fallen_log',
          targetPosition: bestTarget,
          progress: 0,
          totalWork: CHOP_FALLEN_LOG_TOTAL_WORK,
        };
        unit.speechBubble = {
          text: 'Іду розрубувати повалене дерево на колоди',
          expiresAtTick: currentTick + 25,
          type: 'work',
        };
      } else {
        unit.currentJob = {
          id: `job-${unit.id}-${Date.now()}`,
          type: 'chop_tree',
          targetPosition: bestTarget,
          progress: 0,
          totalWork: CHOP_TREE_TOTAL_WORK,
        };
        unit.speechBubble = {
          text: 'Іду рубати ліс для хатини лісоруба',
          expiresAtTick: currentTick + 20,
          type: 'work',
        };
      }
      unit.path = bestPath;
      return true;
    }

    return false;
  }

  public static handleChopTreeProgress(
    unit: GameEntity,
    job: Job,
    grid: GridMap,
    currentTick: number,
    woodSkill: number
  ): boolean {
    if (!job.targetPosition) return false;
    const [gx, gz] = job.targetPosition;
    const tile = grid.getTile(gx, gz);
    if (!tile || tile.foliageType !== 'tree') {
      unit.currentJob = { id: `idle-${Date.now()}`, type: 'idle', progress: 0, totalWork: 0 };
      return true;
    }
    const isStrikeTick = currentTick % 10 === 0 || job.progress === 0;
    if (isStrikeTick) {
      const strikePower = CHOP_TREE_BASE_STRIKE + Math.floor(woodSkill * WORK_SKILL_STEP_MULTIPLIER);
      job.progress += strikePower;

      const pct = Math.round((job.progress / job.totalWork) * 100);
      if (pct <= 40) {
        unit.speechBubble = {
          text: 'Підрубую стовбур...',
          expiresAtTick: currentTick + 15,
          type: 'work',
        };
      } else if (pct <= 75) {
        unit.speechBubble = {
          text: 'Стовбур тріщить!',
          expiresAtTick: currentTick + 15,
          type: 'work',
        };
      } else {
        unit.speechBubble = {
          text: 'Майже впало!',
          expiresAtTick: currentTick + 15,
          type: 'work',
        };
      }

      if (job.targetPosition) {
        useGameStore.getState().registerTreeHit(job.targetPosition[0], job.targetPosition[1], 1.0);
      }
    }

    if (job.progress >= job.totalWork && job.targetPosition) {
      const [gx, gz] = job.targetPosition;
      const { treeType } = getTreeProceduralData(gx, gz);

      const [ux, , uz] = unit.position || [gx + 0.5, 0, gz + 0.5];
      const fdx = gx + 0.5 - ux;
      const fdz = gz + 0.5 - uz;
      const fallAngle = Math.hypot(fdx, fdz) > 0.01 ? Math.atan2(fdx, fdz) : 0;

      grid.removeFoliage(gx, gz);

      useGameStore.getState().registerTreeFall(gx, gz, treeType, fallAngle);
      useGameStore.getState().incrementFoliageVersion();

      unit.currentJob = {
        id: `wait-fall-${unit.id}-${Date.now()}`,
        type: 'wait_tree_fall',
        targetPosition: [gx, gz],
        progress: 0,
        totalWork: WAIT_TREE_FALL_TOTAL_WORK,
      };
      unit.speechBubble = {
        text: 'Дерево падає! Чекаю приземлення...',
        expiresAtTick: currentTick + 20,
        type: 'work',
      };
      return true;
    }

    return false;
  }

  public static handleWaitTreeFallProgress(
    unit: GameEntity,
    job: Job,
    currentTick: number
  ): boolean {
    const fallStep = 2;
    job.progress += fallStep;

    if (job.progress >= job.totalWork && job.targetPosition) {
      const [gx, gz] = job.targetPosition;
      unit.currentJob = {
        id: `chop-log-${unit.id}-${Date.now()}`,
        type: 'chop_fallen_log',
        targetPosition: [gx, gz],
        progress: 0,
        totalWork: CHOP_FALLEN_LOG_TOTAL_WORK,
      };
      unit.speechBubble = {
        text: 'Дерево впало! Розрубую стовбур на колоди',
        expiresAtTick: currentTick + 25,
        type: 'work',
      };
      return true;
    }

    return false;
  }

  public static handleChopFallenLogProgress(
    unit: GameEntity,
    job: Job,
    grid: GridMap,
    currentTick: number,
    isPlayerUnit: boolean
  ): boolean {
    if (!job.targetPosition) return false;
    const [gx, gz] = job.targetPosition;
    const tile = grid.getTile(gx, gz);
    if (!tile || tile.foliageType !== 'fallen_tree') {
      unit.currentJob = { id: `idle-${Date.now()}`, type: 'idle', progress: 0, totalWork: 0 };
      return true;
    }

    const isLogStrikeTick = currentTick % 10 === 0 || job.progress === 0;
    if (isLogStrikeTick) {
      job.progress += CHOP_LOG_STRIKE;
      unit.speechBubble = {
        text: 'Обрубую гілки та розпилюю стовбур...',
        expiresAtTick: currentTick + 15,
        type: 'work',
      };
    }

    if (job.progress >= job.totalWork) {
      this.completeFallenLog(job, unit, grid, currentTick, isPlayerUnit);
      unit.currentJob = { id: `idle-${Date.now()}`, type: 'idle', progress: 0, totalWork: 0 };
      return true;
    }

    return false;
  }

  public static completeFallenLog(
    job: Job,
    unit: GameEntity,
    grid: GridMap,
    currentTick: number,
    isPlayerUnit: boolean
  ): void {
    const { addResource, incrementFoliageVersion } = useGameStore.getState();

    if (job.targetPosition) {
      grid.removeFoliage(job.targetPosition[0], job.targetPosition[1]);
      incrementFoliageVersion();

      let b: GameEntity | undefined;
      if (unit.workBuildingId) {
        b = Array.from(buildingEntities).find((be: GameEntity) => be.id === unit.workBuildingId);
      }

      if (b && b.buildingType === 'lumberjack_hut') {
        if (!b.localInventory) b.localInventory = { wood: 0 };
        const maxStorage = LUMBERJACK_HUT_MAX_STORAGE;
        const currentWood = b.localInventory.wood || 0;
        const addAmt = Math.min(CHOP_LOG_YIELD, Math.max(0, maxStorage - currentWood));
        b.localInventory.wood = currentWood + addAmt;
        if (isPlayerUnit) {
          addResource('wood', addAmt);
        }

        const isFull = b.localInventory.wood >= maxStorage;
        unit.speechBubble = {
          text: isFull
            ? `Деревину заготовлено! Сховище повне (${b.localInventory.wood}/${maxStorage})`
            : `Деревину заготовлено! (${b.localInventory.wood}/${maxStorage} у хатині)`,
          expiresAtTick: currentTick + 30,
          type: 'work',
        };
      } else {
        if (isPlayerUnit) {
          addResource('wood', CHOP_LOG_YIELD);
        }
        unit.speechBubble = {
          text: `Деревину заготовлено! (+${CHOP_LOG_YIELD} деревини)`,
          expiresAtTick: currentTick + 25,
          type: 'work',
        };
      }
    }
  }
}
