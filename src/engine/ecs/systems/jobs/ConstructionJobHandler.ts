import type { GameEntity, Job } from '../../world';
import { buildingEntities, characterEntities, world } from '../../world';
import { GridMap } from '../../../grid/GridMap';
import { BUILDING_BLUEPRINTS } from '../../../buildings/blueprints';
import { useGameStore } from '../../../../store/useGameStore';
import type { RegionData } from '../../../../types/game';

export class ConstructionJobHandler {
  public static handleConstructionProgress(
    unit: GameEntity,
    job: Job,
    currentTick: number,
    buildSkill: number
  ): boolean {
    const workStep = 2 + Math.floor(buildSkill * 0.4);
    job.progress += workStep;

    if (job.type === 'build_structure' && currentTick % 12 === 0) {
      unit.speechBubble = {
        text: 'Зводжу споруду...',
        expiresAtTick: currentTick + 15,
        type: 'work',
      };
    } else if (job.type === 'demolish_structure' && currentTick % 12 === 0) {
      unit.speechBubble = {
        text: 'Розбираю споруду...',
        expiresAtTick: currentTick + 15,
        type: 'work',
      };
    }

    if (job.type === 'build_structure' && job.targetBuildingId) {
      for (const b of buildingEntities) {
        const bEnt = b as GameEntity;
        if (bEnt.id === job.targetBuildingId) {
          const newProg = Math.min(99, Math.round((job.progress / job.totalWork) * 100));
          bEnt.constructionProgress = newProg;
          break;
        }
      }
    } else if (job.type === 'demolish_structure' && job.targetBuildingId) {
      for (const b of buildingEntities) {
        const bEnt = b as GameEntity;
        if (bEnt.id === job.targetBuildingId) {
          const newProg = Math.min(99, Math.round((job.progress / job.totalWork) * 100));
          bEnt.isDemolishing = true;
          bEnt.demolitionProgress = newProg;
          break;
        }
      }
    }

    return job.progress >= job.totalWork;
  }

  public static completeBuilding(
    job: Job,
    unit: GameEntity,
    currentTick: number,
    isPlayerUnit: boolean,
    regions: RegionData[],
    updateRegionStats: (regionId: number, partial: Partial<RegionData>) => void
  ): void {
    const { addChronicleEvent, incrementBuildingVersion } = useGameStore.getState();

    if (!job.targetBuildingId) return;

    for (const b of buildingEntities) {
      const bEnt = b as GameEntity;
      if (bEnt.id === job.targetBuildingId) {
        bEnt.constructionProgress = 100;
        bEnt.isCompleted = true;
        bEnt.buildingHealth = bEnt.maxBuildingHealth || 150;
        incrementBuildingVersion();

        if (isPlayerUnit) {
          addChronicleEvent({
            title: 'Будівництво завершено!',
            description: `Зведено нову споруду: ${bEnt.name || 'Будівля'}.`,
            type: 'success',
          });
        } else if (bEnt.factionId && bEnt.factionId.startsWith('bot-')) {
          const reg = regions.find((r: RegionData) => r.id === bEnt.regionId);
          if (reg) {
            if (bEnt.buildingType === 'peasant_house') {
              const newPId = `unit-${bEnt.factionId}-immigrant-${Date.now() % 1000}`;
              world.add({
                id: newPId,
                name: `Селянин (${reg.lordName})`,
                title: 'Поселенець',
                characterClass: 'peasant',
                avatarColor: reg.heraldryColor,
                isCharacter: true,
                factionId: bEnt.factionId,
                regionId: reg.id,
                gridPosition: [bEnt.gridPosition ? bEnt.gridPosition[0] + 1 : 0, bEnt.gridPosition ? bEnt.gridPosition[1] + 1 : 0],
                position: [bEnt.gridPosition ? bEnt.gridPosition[0] + 1.5 : 0, 0.3, bEnt.gridPosition ? bEnt.gridPosition[1] + 1.5 : 0],
                moveSpeed: 1.35,
                gold: 4,
                needs: { hunger: 90, energy: 90, mood: 80, ale: 60, hygiene: 80 },
                skills: { farming: 5, woodcutting: 6, mining: 5, building: 6, cooking: 4, brewing: 3, combat: 3, intellect: 4, charisma: 4 },
                currentJob: { id: `idle-${newPId}`, type: 'idle', progress: 0, totalWork: 0 },
              });
            }
            const curBotUnits = Array.from(characterEntities).filter(
              (e: GameEntity) => e.isCharacter && e.regionId === reg.id
            );
            updateRegionStats(reg.id, {
              buildingsCount: reg.buildingsCount + 1,
              population: curBotUnits.length,
              wealth: reg.wealth + 15,
            });
            addChronicleEvent({
              title: `Розвиток ${reg.ukrName}`,
              description: `${reg.lordName} завершив будівництво ${bEnt.name || 'споруди'} у володінні ${reg.ukrName}. Поселення росте!`,
              type: 'info',
            });
          }
        }

        unit.speechBubble = {
          text: 'Будівлю зведено!',
          expiresAtTick: currentTick + 25,
          type: 'work',
        };
        break;
      }
    }
  }

  public static completeDemolition(
    job: Job,
    unit: GameEntity,
    grid: GridMap,
    currentTick: number,
    isPlayerUnit: boolean
  ): void {
    const { addResource, addChronicleEvent, incrementBuildingVersion, incrementFoliageVersion } = useGameStore.getState();

    if (!job.targetBuildingId) return;

    const b = Array.from(buildingEntities).find((be: GameEntity) => be.id === job.targetBuildingId);
    if (!b) return;

    const blueprint = b.buildingType ? BUILDING_BLUEPRINTS[b.buildingType] : null;
    const refundWood = blueprint?.cost?.wood || 0;
    const refundStone = blueprint?.cost?.stone || 0;
    const refundGold = blueprint?.cost?.gold || 0;
    const storedWood = b.localInventory?.wood || 0;

    if (isPlayerUnit) {
      if (refundWood + storedWood > 0) addResource('wood', refundWood + storedWood);
      if (refundStone > 0) addResource('stone', refundStone);
      if (refundGold > 0) addResource('gold', refundGold);
    }

    if (b.assignedWorkers && b.assignedWorkers.length > 0) {
      for (const wid of b.assignedWorkers) {
        const w = Array.from(characterEntities).find((c: GameEntity) => c.id === wid);
        if (w) {
          w.workBuildingId = undefined;
          w.currentJob = { id: `idle-${w.id}`, type: 'idle', progress: 0, totalWork: 0 };
        }
      }
    }

    for (const other of characterEntities) {
      const otherEnt = other as GameEntity;
      if (otherEnt.currentJob?.targetBuildingId === b.id && otherEnt.id !== unit.id) {
        otherEnt.currentJob = { id: `idle-${otherEnt.id}`, type: 'idle', progress: 0, totalWork: 0 };
      }
    }

    if (b.gridPosition) {
      grid.clearBuilding(
        b.gridPosition[0],
        b.gridPosition[1],
        b.buildingWidth || 1,
        b.buildingHeight || 1
      );
    }

    world.remove(b);
    incrementBuildingVersion();
    incrementFoliageVersion();

    if (useGameStore.getState().selectedEntityId === b.id) {
      useGameStore.getState().setSelectedEntityId(null);
    }

    if (isPlayerUnit) {
      const refundsText = [
        refundWood + storedWood > 0 ? `+${refundWood + storedWood} деревини` : '',
        refundStone > 0 ? `+${refundStone} каменю` : '',
        refundGold > 0 ? `+${refundGold} золота` : '',
      ].filter(Boolean).join(', ');

      addChronicleEvent({
        title: 'Споруду розібрано!',
        description: `${b.name || 'Будівлю'} демонтовано. Повернуто: ${refundsText || 'ресурси'}.`,
        type: 'info',
      });
    }

    unit.speechBubble = {
      text: 'Споруду розібрано! Ресурси повернуто.',
      expiresAtTick: currentTick + 25,
      type: 'work',
    };
  }
}
