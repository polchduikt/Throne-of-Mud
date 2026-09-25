import { characterEntities, buildingEntities, type GameEntity, type Job } from '../world';
import { GridMap } from '../../grid/GridMap';
import { useGameStore } from '../../../store/useGameStore';
import { isNoble as isNobleEntity } from '../entityHelpers';
import {
  NIGHT_START_HOUR,
  NIGHT_END_HOUR,
  CRITICAL_EXHAUSTION_ENERGY,
  RESTED_ENERGY_THRESHOLD,
} from '../../../constants/needs';
import { RestJobHandler, getEntityRegionId } from './jobs/RestJobHandler';
import { WoodcuttingJobHandler } from './jobs/WoodcuttingJobHandler';
import { ConstructionJobHandler } from './jobs/ConstructionJobHandler';
import { WorkstationJobHandler } from './jobs/WorkstationJobHandler';
import { ManualJobHandler } from './jobs/ManualJobHandler';
import type { RegionData } from '../../../types/game';

export { getEntityRegionId };

export class JobSystem {
  public static update(grid: GridMap, currentTick: number): void {
    const {
      pendingJobs,
      removePendingJob,
      time,
      regions,
      playerRegionId,
      playerSpawnPoint,
    } = useGameStore.getState();

    for (const unit of characterEntities) {
      const isPlayerUnit = unit.factionId === 'player' || unit.factionId === undefined;
      const isNoble = isNobleEntity(unit);

      const uRegionId = getEntityRegionId(unit, regions, playerRegionId ?? 0);
      const uRegion = regions.find((r: RegionData) => r.id === uRegionId) || regions[0];
      const uBounds = uRegion?.bounds;
      const campPos =
        uRegion?.campPosition ||
        (uRegionId === (playerRegionId ?? 0) ? playerSpawnPoint : undefined) ||
        uRegion?.center ||
        [52, 52];
      const cx = campPos[0];
      const cz = campPos[1];

      const isNightTime = time.hour >= NIGHT_START_HOUR || time.hour < NIGHT_END_HOUR;
      const isCriticallyExhausted = Boolean(unit.needs && unit.needs.energy <= CRITICAL_EXHAUSTION_ENERGY);
      const isAlreadySleeping = unit.currentJob?.type === 'sleep';
      const isAlreadySitting = unit.currentJob?.type === 'sit_by_fire';
      const isMidManualJob =
        unit.currentJob?.type === 'fight' ||
        unit.currentJob?.type === 'chop_tree' ||
        unit.currentJob?.type === 'wait_tree_fall' ||
        unit.currentJob?.type === 'chop_fallen_log' ||
        unit.currentJob?.type === 'mine_rock' ||
        unit.currentJob?.type === 'build_structure' ||
        unit.currentJob?.type === 'demolish_structure';

      if (!isNightTime && (isAlreadySleeping || isAlreadySitting)) {
        const isRested = !unit.needs || unit.needs.energy >= RESTED_ENERGY_THRESHOLD || time.hour === NIGHT_END_HOUR;
        if (isRested) {
          RestJobHandler.handleMorningWakeUp(
            unit,
            isAlreadySleeping,
            isAlreadySitting,
            isNoble,
            currentTick,
            grid,
            uBounds
          );
          continue;
        }
      }

      if ((isNightTime || isCriticallyExhausted) && !isMidManualJob) {
        const handledRest = RestJobHandler.handleNightAndExhaustion(
          unit,
          isPlayerUnit,
          isNoble,
          grid,
          currentTick,
          regions,
          uRegionId,
          uBounds,
          cx,
          cz,
          playerRegionId
        );
        if (handledRest) {
          continue;
        }
      }

      if (!isNoble && unit.workBuildingId) {
        if (time.hour >= 7 && time.hour <= 18) {
          const building = Array.from(buildingEntities).find((b: GameEntity) => b.id === unit.workBuildingId);
          if (building && building.isCompleted) {
            if (building.buildingType === 'lumberjack_hut') {
              WoodcuttingJobHandler.assignWoodcutterHutJob(unit, building, grid, uBounds, currentTick, cx, cz);
            } else {
              WorkstationJobHandler.assignWorkstationJob(unit, building, grid, uBounds, currentTick);
            }
          }
        } else {
          WorkstationJobHandler.handleOffWorkHours(unit, grid, uBounds, cx, cz);
        }
      }

      if (
        isPlayerUnit &&
        !unit.workBuildingId &&
        (!unit.currentJob || unit.currentJob.type === 'idle' || unit.currentJob.type === 'wander')
      ) {
        const assigned = ManualJobHandler.assignPendingJob(unit, pendingJobs, grid, uBounds, currentTick);
        if (!assigned) {
          ManualJobHandler.handleIdleWander(unit, grid, uBounds, cx, cz);
        }
      }

      if (unit.currentJob && unit.currentJob.type !== 'idle' && unit.currentJob.type !== 'wander') {
        const job = unit.currentJob;

        if (unit.path && unit.path.length > 0) {
          continue;
        }

        const buildSkill = unit.skills?.building || 5;
        const woodSkill = unit.skills?.woodcutting || 5;

        if (job.type === 'chop_tree') {
          const finishedTree = WoodcuttingJobHandler.handleChopTreeProgress(unit, job, grid, currentTick, woodSkill);
          if (finishedTree) continue;
        } else if (job.type === 'wait_tree_fall') {
          const fell = WoodcuttingJobHandler.handleWaitTreeFallProgress(unit, job, currentTick);
          if (fell) continue;
        } else if (job.type === 'chop_fallen_log') {
          const finishedLog = WoodcuttingJobHandler.handleChopFallenLogProgress(unit, job, grid, currentTick, isPlayerUnit);
          if (finishedLog) {
            removePendingJob(job.id);
            continue;
          }
        } else if (job.type === 'build_structure' || job.type === 'demolish_structure') {
          const finishedStructure = ConstructionJobHandler.handleConstructionProgress(unit, job, currentTick, buildSkill);
          if (finishedStructure) {
            if (job.type === 'build_structure') {
              ConstructionJobHandler.completeBuilding(
                job,
                unit,
                currentTick,
                isPlayerUnit,
                regions,
                useGameStore.getState().updateRegionStats
              );
            } else {
              ConstructionJobHandler.completeDemolition(job, unit, grid, currentTick, isPlayerUnit);
            }

            if (job.targetBuildingId) {
              const currentPending = useGameStore.getState().pendingJobs;
              for (const pj of currentPending) {
                if (pj.targetBuildingId === job.targetBuildingId || pj.id === job.id) {
                  removePendingJob(pj.id);
                }
              }
            } else {
              removePendingJob(job.id);
            }
            unit.currentJob = { id: `idle-${Date.now()}`, type: 'idle', progress: 0, totalWork: 0 };
            continue;
          }
        } else if (job.type === 'work_at_building') {
          continue;
        } else {
          const workStep = 2 + Math.floor(buildSkill * 0.4);
          job.progress += workStep;

          if (job.progress >= job.totalWork) {
            this.completeGenericJob(job, unit, grid, currentTick, isPlayerUnit);
            removePendingJob(job.id);
            unit.currentJob = { id: `idle-${Date.now()}`, type: 'idle', progress: 0, totalWork: 0 };
          }
        }
      }
    }
  }

  private static completeGenericJob(
    job: Job,
    unit: GameEntity,
    grid: GridMap,
    currentTick: number,
    isPlayerUnit: boolean
  ): void {
    const { addResource, incrementFoliageVersion } = useGameStore.getState();

    switch (job.type) {
      case 'mine_rock':
        if (job.targetPosition) {
          grid.removeFoliage(job.targetPosition[0], job.targetPosition[1]);
          incrementFoliageVersion();
          if (isPlayerUnit) {
            addResource('stone', 8);
          }
          unit.speechBubble = {
            text: 'Камінь видобуто! (+8 каменю)',
            expiresAtTick: currentTick + 25,
            type: 'work',
          };
        }
        break;

      case 'harvest_wheat':
        if (isPlayerUnit) {
          addResource('wheat', 10);
        }
        unit.speechBubble = {
          text: 'Врожай зібрано! (+10 пшениці)',
          expiresAtTick: currentTick + 25,
          type: 'work',
        };
        break;

      case 'work_at_building':
        if (Math.random() < 0.2) {
          unit.speechBubble = {
            text: 'Зміна триває...',
            expiresAtTick: currentTick + 20,
            type: 'work',
          };
        }
        break;

      default:
        break;
    }
  }
}
