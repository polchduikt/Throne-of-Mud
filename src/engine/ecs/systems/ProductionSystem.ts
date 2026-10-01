import { buildingEntities, characterEntities, type GameEntity } from '../world';
import { BUILDING_BLUEPRINTS } from '../../buildings/blueprints';
import { useGameStore } from '../../../store/useGameStore';
import type { ResourceType } from '../../../types/game';
import {
  HARVEST_WHEAT_TOTAL_WORK,
  DEFAULT_WORK_SKILL,
  SUPERVISOR_SKILL_MULTIPLIER,
  RESOURCE_DEPOSIT_DRAIN_RADIUS,
} from '../../../constants/jobs';

const _lordMap = new Map<string, GameEntity>();

export class ProductionSystem {
  public static update(): void {
    const { resources, addResource, consumeResource, addPendingJob, pendingJobs, playerRegionId, time } = useGameStore.getState();
    const isNight = time ? (time.hour >= 20 || time.hour < 6) : false;
    if (isNight) return;

    _lordMap.clear();
    for (const c of characterEntities) {
      _lordMap.set(c.id, c);
    }

    for (const building of buildingEntities) {
      if (!building.isCompleted || !building.buildingType) continue;

      if (building.factionId && building.factionId !== 'player') continue;
      if (building.regionId !== undefined && building.regionId !== playerRegionId) continue;

      const blueprint = BUILDING_BLUEPRINTS[building.buildingType];
      if (!blueprint || !blueprint.produces) continue;

      const maxStorage = blueprint.maxStorage || 30;
      building.localInventory = building.localInventory || {};
      const currentStored = Object.values(building.localInventory).reduce((acc, val) => acc + (val || 0), 0);

      if (currentStored >= maxStorage) {
        continue;
      }

      const assignedWorkers = building.assignedWorkers || [];
      if (blueprint.workSlots > 0 && assignedWorkers.length === 0) {
        continue;
      }

      const activeWorkersCount = Math.max(1, assignedWorkers.length);

      let supervisorMultiplier = 1.0;
      if (building.assignedLordId) {
        const lord = _lordMap.get(building.assignedLordId);
        if (lord && lord.skills) {
          const relevantSkill = Math.max(
            lord.skills.intellect,
            building.buildingType === 'wheat_farm' ? lord.skills.farming :
            building.buildingType === 'brewery' ? lord.skills.brewing :
            lord.skills.building
          );
          supervisorMultiplier += SUPERVISOR_SKILL_MULTIPLIER * (relevantSkill || DEFAULT_WORK_SKILL);
        }
      }

      const prodStep = activeWorkersCount * supervisorMultiplier;
      const prod = blueprint.produces;
      building.productionProgress = (building.productionProgress || 0) + prodStep;

      if (building.productionProgress >= prod.ticksRequired) {
        building.productionProgress = 0;

        if (building.buildingType === 'wheat_farm') {
          const farmJobId = `harvest-farm-${building.id}`;
          const existingJob = pendingJobs.find((j) => j.id === farmJobId);
          if (!existingJob && building.gridPosition) {
            addPendingJob({
              id: farmJobId,
              type: 'harvest_wheat',
              targetPosition: [building.gridPosition[0], building.gridPosition[1]],
              targetBuildingId: building.id,
              progress: 0,
              totalWork: HARVEST_WHEAT_TOTAL_WORK,
            });
          }
          continue;
        }

        let canProduce = true;
        for (const [res, amount] of Object.entries(prod.inputs)) {
          if ((resources[res as keyof typeof resources] || 0) < (amount || 0)) {
            canProduce = false;
            break;
          }
        }

        if (canProduce) {
          for (const [res, amount] of Object.entries(prod.inputs)) {
            consumeResource(res as ResourceType, amount || 0);
          }
          for (const [res, amount] of Object.entries(prod.outputs)) {
            const rType = res as ResourceType;
            building.localInventory[rType] = (building.localInventory[rType] || 0) + (amount || 0);
            addResource(rType, amount || 0);
          }

          if (
            building.buildingType === 'iron_mine' ||
            building.buildingType === 'stone_quarry' ||
            building.buildingType === 'clay_pit' ||
            building.buildingType === 'salt_works'
          ) {
            const bPos = building.gridPosition;
            if (bPos) {
              const deposits = useGameStore.getState().resourceDeposits || [];
              const dep = deposits.find(
                (d) =>
                  Math.hypot(d.gridPosition[0] - bPos[0], d.gridPosition[1] - bPos[1]) <= RESOURCE_DEPOSIT_DRAIN_RADIUS
              );
              if (dep && dep.currentAmount !== undefined && dep.currentAmount > 0) {
                dep.currentAmount = Math.max(0, dep.currentAmount - 1);
              }
            }
          }
        }
      }
    }
  }
}
