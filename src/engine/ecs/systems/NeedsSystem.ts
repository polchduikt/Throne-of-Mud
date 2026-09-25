import { characterEntities } from '../world';
import { useGameStore } from '../../../store/useGameStore';
import {
  MIN_HUNGER,
  MAX_HUNGER,
  MIN_ENERGY,
  MAX_ENERGY,
  MIN_MOOD,
  MAX_MOOD,
} from '../../../constants/needs';
import { clamp, lerp } from '../../../utils/mathUtils';

export class NeedsSystem {
  public static update(currentTick: number): void {
    const { resources, consumeResource } = useGameStore.getState();

    for (const unit of characterEntities) {
      if (!unit.needs) continue;

      unit.needs.hunger = Math.max(MIN_HUNGER, unit.needs.hunger - 0.007);

      const isWorking = unit.currentJob && unit.currentJob.type !== 'idle' && unit.currentJob.type !== 'sleep';
      unit.needs.energy = Math.max(MIN_ENERGY, unit.needs.energy - (isWorking ? 0.010 : 0.003));

      unit.needs.ale = Math.max(0, unit.needs.ale - 0.004);

      if (unit.needs.hunger < 30 && resources.bread > 0) {
        if (consumeResource('bread', 1)) {
          unit.needs.hunger = Math.min(MAX_HUNGER, unit.needs.hunger + 45);
          unit.speechBubble = {
            text: 'Смачний хліб!',
            expiresAtTick: currentTick + 20,
            type: 'mood',
          };
        }
      }

      if (unit.needs.ale < 25 && resources.ale > 0 && Math.random() < 0.02) {
        if (consumeResource('ale', 1)) {
          unit.needs.ale = Math.min(100, unit.needs.ale + 50);
          unit.needs.mood = Math.min(100, unit.needs.mood + 15);
          unit.speechBubble = {
            text: 'Гарний ель гріє душу!',
            expiresAtTick: currentTick + 25,
            type: 'mood',
          };
        }
      }

      if (unit.currentJob?.type === 'sleep') {
        unit.needs.energy = Math.min(MAX_ENERGY, unit.needs.energy + 0.35);
      }

      if (unit.thoughts && unit.thoughts.length > 0) {
        for (const th of unit.thoughts) {
          th.durationTicks -= 1;
        }
        unit.thoughts = unit.thoughts.filter(th => th.durationTicks > 0);
      }

      let thoughtsModifier = 0;
      if (unit.thoughts) {
        for (const th of unit.thoughts) {
          thoughtsModifier += th.modifier;
        }
      }

      let targetMood = 55 + thoughtsModifier;
      if (unit.needs.hunger < 30) targetMood -= 30;
      if (unit.needs.energy < 25) targetMood -= 20;
      if (unit.needs.ale > 50) targetMood += 15;
      targetMood = clamp(targetMood, MIN_MOOD, MAX_MOOD);
      unit.needs.mood = lerp(unit.needs.mood, targetMood, 0.05);

      if (unit.needs.mood < 20 && Math.random() < 0.005) {
        unit.speechBubble = {
          text: 'Селяни обурені умовами життя!',
          expiresAtTick: currentTick + 30,
          type: 'alert',
        };
      }

      if (unit.speechBubble && currentTick >= unit.speechBubble.expiresAtTick) {
        unit.speechBubble = undefined;
      }
    }
  }
}
