import { characterEntities, buildingEntities } from '../world';
import { useGameStore } from '../../../store/useGameStore';
import type { ResourceInventory } from '../../../types/game';

export class EconomySystem {
  private static lastWageDayPaid = -1;

  public static update(currentTick: number): void {
    const { time, resources, consumeResource, addResource, addChronicleEvent } = useGameStore.getState();

    if (time.hour === 19 && this.lastWageDayPaid !== time.day) {
      this.lastWageDayPaid = time.day;
      this.payDailyWages(currentTick, resources, consumeResource, addChronicleEvent);
    }

    if (time.hour >= 19 && time.hour <= 23 && currentTick % 30 === 0) {
      this.processMarketShopping(currentTick, resources, consumeResource, addResource);
    }
  }

  private static payDailyWages(
    currentTick: number,
    resources: ResourceInventory,
    consumeResource: (type: any, amount: number) => boolean,
    addChronicleEvent: any
  ): void {
    const { playerRegionId } = useGameStore.getState();
    let totalWagesPaid = 0;
    let unpaidWorkersCount = 0;

    for (const building of buildingEntities) {
      if (!building.isCompleted || !building.assignedWorkers || building.assignedWorkers.length === 0) {
        continue;
      }
      if (building.factionId && building.factionId !== 'player') continue;
      if (building.regionId !== undefined && building.regionId !== playerRegionId) continue;

      const wage = building.wage !== undefined ? building.wage : 2;

      for (const workerId of building.assignedWorkers) {
        const worker = Array.from(characterEntities).find(c => c.id === workerId);
        if (!worker) continue;

        if (resources.gold >= wage && consumeResource('gold', wage)) {
          worker.gold = (worker.gold || 0) + wage;
          totalWagesPaid += wage;

          if (!worker.thoughts) worker.thoughts = [];
          worker.thoughts = worker.thoughts.filter(t => t.id !== 'paid' && t.id !== 'unpaid');
          worker.thoughts.push({
            id: 'paid',
            text: `Отримав зарплату (+${wage} золота)`,
            modifier: 12,
            durationTicks: 600,
          });

          worker.speechBubble = {
            text: `Отримав ${wage} золота!`,
            expiresAtTick: currentTick + 25,
            type: 'work',
          };
        } else {
          unpaidWorkersCount++;
          if (!worker.thoughts) worker.thoughts = [];
          worker.thoughts = worker.thoughts.filter(t => t.id !== 'paid' && t.id !== 'unpaid');
          worker.thoughts.push({
            id: 'unpaid',
            text: 'Затримка зарплати! (-25)',
            modifier: -25,
            durationTicks: 800,
          });

          if (worker.needs) {
            worker.needs.mood = Math.max(0, worker.needs.mood - 20);
          }

          worker.speechBubble = {
            text: 'Де моє зароблене золото?!',
            expiresAtTick: currentTick + 30,
            type: 'alert',
          };
        }
      }
    }

    if (totalWagesPaid > 0) {
      addChronicleEvent({
        title: 'Виплата зарплат',
        description: `Виплачено ${totalWagesPaid} золота робітникам за сьогоднішню зміну.`,
        type: 'info',
      });
    }

    if (unpaidWorkersCount > 0) {
      addChronicleEvent({
        title: 'Криза скарбниці!',
        description: `Бракує золота! ${unpaidWorkersCount} робітників не отримали платню та обурені.`,
        type: 'danger',
      });
    }
  }

  private static processMarketShopping(
    currentTick: number,
    resources: ResourceInventory,
    consumeResource: (type: any, amount: number) => boolean,
    addResource: (type: any, amount: number) => void
  ): void {
    const { playerRegionId } = useGameStore.getState();
    for (const worker of characterEntities) {
      if (worker.characterClass === 'king' || worker.characterClass === 'lady') {
        continue;
      }
      if (worker.factionId && worker.factionId !== 'player') continue;
      if (worker.regionId !== undefined && worker.regionId !== playerRegionId) continue;

      if (!worker.gold || worker.gold <= 0 || !worker.needs) continue;

      if (worker.needs.hunger < 75 && resources.bread > 0 && worker.gold >= 1) {
        if (consumeResource('bread', 1)) {
          worker.gold -= 1;
          addResource('gold', 1);
          worker.needs.hunger = Math.min(100, worker.needs.hunger + 45);

          if (!worker.thoughts) worker.thoughts = [];
          worker.thoughts = worker.thoughts.filter(t => t.id !== 'bought_bread');
          worker.thoughts.push({
            id: 'bought_bread',
            text: 'Купив смачний хліб на ринку (+15)',
            modifier: 15,
            durationTicks: 500,
          });

          worker.speechBubble = {
            text: 'Купив хліб на ринку (-1 золото)',
            expiresAtTick: currentTick + 25,
            type: 'mood',
          };
          continue;
        }
      }

      if (worker.needs.ale < 60 && resources.ale > 0 && worker.gold >= 1) {
        if (consumeResource('ale', 1)) {
          worker.gold -= 1;
          addResource('gold', 1);
          worker.needs.ale = Math.min(100, worker.needs.ale + 50);
          worker.needs.mood = Math.min(100, worker.needs.mood + 15);

          if (!worker.thoughts) worker.thoughts = [];
          worker.thoughts = worker.thoughts.filter(t => t.id !== 'bought_ale');
          worker.thoughts.push({
            id: 'bought_ale',
            text: 'Випив холодного елю на ринку (+15)',
            modifier: 15,
            durationTicks: 500,
          });

          worker.speechBubble = {
            text: 'Купив ель на ринку (-1 золото)',
            expiresAtTick: currentTick + 25,
            type: 'mood',
          };
        }
      }
    }
  }
}
