import { buildingEntities, characterEntities } from '../world';
import { BUILDING_BLUEPRINTS } from '../../buildings/blueprints';
import { useGameStore } from '../../../store/useGameStore';

export class ProductionSystem {
  public static update(): void {
    const { resources, addResource, consumeResource, addPendingJob, pendingJobs, playerRegionId } = useGameStore.getState();

    for (const building of buildingEntities) {
      if (!building.isCompleted || !building.buildingType) continue;

      if (building.factionId && building.factionId !== 'player') continue;
      if (building.regionId !== undefined && building.regionId !== playerRegionId) continue;

      const blueprint = BUILDING_BLUEPRINTS[building.buildingType];
      if (!blueprint || !blueprint.produces) continue;

      const assignedWorkers = building.assignedWorkers || [];
      if (blueprint.workSlots > 0 && assignedWorkers.length === 0) {
        continue;
      }

      const activeWorkersCount = Math.max(1, assignedWorkers.length);

      let supervisorMultiplier = 1.0;
      if (building.assignedLordId) {
        const lord = Array.from(characterEntities).find(c => c.id === building.assignedLordId);
        if (lord && lord.skills) {
          const relevantSkill = Math.max(
            lord.skills.intellect,
            building.buildingType === 'wheat_farm' ? lord.skills.farming :
            building.buildingType === 'brewery' ? lord.skills.brewing :
            lord.skills.building
          );
          supervisorMultiplier += 0.1 * (relevantSkill || 5);
        }
      }

      const prodStep = activeWorkersCount * supervisorMultiplier;
      const prod = blueprint.produces;
      building.productionProgress = (building.productionProgress || 0) + prodStep;

      if (building.productionProgress >= prod.ticksRequired) {
        building.productionProgress = 0;

        if (building.buildingType === 'wheat_farm') {
          const farmJobId = `harvest-farm-${building.id}`;
          const existingJob = pendingJobs.find(j => j.id === farmJobId);
          if (!existingJob && building.gridPosition) {
            addPendingJob({
              id: farmJobId,
              type: 'harvest_wheat',
              targetPosition: [building.gridPosition[0], building.gridPosition[1]],
              targetBuildingId: building.id,
              progress: 0,
              totalWork: 25,
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
            consumeResource(res as any, amount || 0);
          }
          for (const [res, amount] of Object.entries(prod.outputs)) {
            addResource(res as any, amount || 0);
          }
        }
      }
    }
  }
}
