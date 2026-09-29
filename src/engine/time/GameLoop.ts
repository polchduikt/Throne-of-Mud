import { GridMap } from '../grid/GridMap';
import { useGameStore } from '../../store/useGameStore';
import { MovementSystem } from '../ecs/systems/MovementSystem';
import { NeedsSystem } from '../ecs/systems/NeedsSystem';
import { JobSystem } from '../ecs/systems/JobSystem';
import { ProductionSystem } from '../ecs/systems/ProductionSystem';
import { EconomySystem } from '../ecs/systems/EconomySystem';
import { ImmigrationSystem } from '../ecs/systems/ImmigrationSystem';
import { BotAISystem } from '../ecs/systems/BotAISystem';

export class GameLoop {
  private grid: GridMap;
  private isRunning = false;
  private lastTime = 0;
  private accumulator = 0;
  private readonly TICK_RATE = 10;
  private readonly TICK_TIME = 1.0 / this.TICK_RATE;
  private animFrameId: number | null = null;

  constructor(grid: GridMap) {
    this.grid = grid;
  }

  public start(): void {
    if (this.isRunning) return;
    this.isRunning = true;
    this.lastTime = performance.now();
    this.loop(this.lastTime);
  }

  public stop(): void {
    this.isRunning = false;
    if (this.animFrameId !== null) {
      cancelAnimationFrame(this.animFrameId);
      this.animFrameId = null;
    }
  }

  public step(frameDeltaSeconds: number): void {
    const { time, advanceTick, gameMode } = useGameStore.getState();
    if (gameMode !== 'playing' || time.isPaused || time.speedMultiplier <= 0) return;

    const clampedDelta = Math.min(frameDeltaSeconds, 0.1);
    this.accumulator += clampedDelta * time.speedMultiplier;

    // Limit max ticks executed in a single animation frame to avoid "spiral of death"
    const maxTicksPerFrame = Math.max(1, Math.min(2, Math.round(time.speedMultiplier)));
    let ticksRan = 0;

    while (this.accumulator >= this.TICK_TIME && ticksRan < maxTicksPerFrame) {
      ticksRan++;
      advanceTick();
      const currentTick = useGameStore.getState().time.tick;

      NeedsSystem.update(currentTick);
      JobSystem.update(this.grid, currentTick);
      ProductionSystem.update();
      EconomySystem.update(currentTick);
      ImmigrationSystem.update(this.grid, currentTick);
      BotAISystem.update(this.grid, currentTick);

      this.accumulator -= this.TICK_TIME;
    }

    // If accumulator still exceeds tick time, discard the excess
    if (this.accumulator >= this.TICK_TIME) {
      this.accumulator = 0;
    }

    MovementSystem.update(clampedDelta * time.speedMultiplier, this.grid);
  }

  private loop = (currentTime: number): void => {
    if (!this.isRunning) return;

    const frameDeltaSeconds = Math.min((currentTime - this.lastTime) / 1000, 0.1);
    this.lastTime = currentTime;

    this.step(frameDeltaSeconds);

    this.animFrameId = requestAnimationFrame(this.loop);
  };
}

