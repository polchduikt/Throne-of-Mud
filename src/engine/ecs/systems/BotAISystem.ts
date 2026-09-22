import { GridMap } from '../../grid/GridMap';
import { world } from '../world';
import { useGameStore } from '../../../store/useGameStore';
import { AStar } from '../../pathfinding/AStar';
import type { BuildingType } from '../../../types/game';

interface BotRealmMemory {
  wood: number;
  stone: number;
  buildStage: number;
  lastActionTick: number;
}

export class BotAISystem {
  private static botMemories: Map<string, BotRealmMemory> = new Map();

  public static reset() {
    this.botMemories.clear();
  }

  public static update(grid: GridMap, currentTick: number): void {
    if (currentTick % 15 !== 0) return;

    const { regions, incrementBuildingVersion, addChronicleEvent } = useGameStore.getState();
    const botRegions = regions.filter((r) => r.owner === 'bot');

    for (const region of botRegions) {
      const botFactionId = `bot-${region.id}`;
      let memory = this.botMemories.get(botFactionId);
      if (!memory) {
        memory = {
          wood: 25,
          stone: 10,
          buildStage: 0,
          lastActionTick: currentTick - (100 - (region.id + 1) * 35),
        };
        this.botMemories.set(botFactionId, memory);
      }

      const botUnits = Array.from(world.entities).filter(
        (e) => e.isCharacter && (e.factionId === botFactionId || (e.regionId === region.id && e.factionId !== 'player'))
      );

      const incompleteBuildings = Array.from(world.entities).filter(
        (e) => e.isBuilding && e.regionId === region.id && !e.isCompleted
      );

      const peasants = botUnits.filter((u) => u.characterClass === 'peasant');
      for (const p of peasants) {
        if (p.needs && (p.needs.hunger < 40 || p.needs.energy < 40)) {
          p.needs.hunger = 95;
          p.needs.energy = 95;
          p.needs.mood = 80;
        }

        if (Math.random() < 0.6) {
          memory.wood += 2;
          memory.stone += 1;
        }

        const isIdleOrWandering = !p.currentJob || p.currentJob.type === 'idle' || p.currentJob.type === 'wander';

        if (isIdleOrWandering && incompleteBuildings.length > 0 && p.gridPosition) {
          const targetB = incompleteBuildings[0];
          const isSomeoneBuilding = peasants.some((other) => other.currentJob?.targetBuildingId === targetB.id);
          if (!isSomeoneBuilding && targetB.gridPosition) {
            const bW = targetB.buildingWidth || 2;
            const bH = targetB.buildingHeight || 2;
            const buildPath = AStar.findPathToArea(grid, p.gridPosition, targetB.gridPosition[0], targetB.gridPosition[1], bW, bH, region.bounds);
            p.currentJob = {
              id: `bot-resume-build-${targetB.id}-${Date.now()}`,
              type: 'build_structure',
              targetBuildingId: targetB.id,
              targetPosition: targetB.gridPosition,
              progress: Math.floor(((targetB.constructionProgress || 0) / 100) * 100),
              totalWork: 100,
            };
            if (buildPath && buildPath.length > 0) {
              p.path = buildPath;
            }
            p.speechBubble = {
              text: `Працюю на будівництві ${targetB.name || 'споруди'}!`,
              expiresAtTick: currentTick + 25,
              type: 'work',
            };
            continue;
          }
        }

        if (isIdleOrWandering && (!p.path || p.path.length === 0) && Math.random() < 0.35) {
          const camp = region.campPosition || region.center;
          const rx = Math.round(camp[0] + (Math.random() * 10 - 5));
          const rz = Math.round(camp[1] + (Math.random() * 10 - 5));
          const tile = grid.getTile(rx, rz);
          if (tile && tile.isPassable && !tile.buildingId && p.gridPosition) {
            const path = AStar.findPath(grid, p.gridPosition, [rx, rz], false, region.bounds);
            if (path && path.length > 0) {
              p.path = path;
            }
          }
        }
      }

      if (incompleteBuildings.length === 0 && currentTick - memory.lastActionTick >= 150) {
        memory.lastActionTick = currentTick;

        const buildPlan: { type: BuildingType; w: number; h: number; name: string; woodCost: number; stoneCost: number }[] = [
          { type: 'lumberjack_hut', w: 2, h: 2, name: 'Хатина лісоруба', woodCost: 15, stoneCost: 0 },
          { type: 'peasant_house', w: 3, h: 2, name: 'Садиба селян', woodCost: 20, stoneCost: 5 },
          { type: 'stockpile', w: 2, h: 2, name: 'Склад ресурсів', woodCost: 10, stoneCost: 10 },
          { type: 'wheat_farm', w: 3, h: 3, name: 'Пшенична нива', woodCost: 15, stoneCost: 0 },
          { type: 'peasant_house', w: 3, h: 2, name: 'Друга садиба селян', woodCost: 25, stoneCost: 5 },
        ];

        if (memory.buildStage < buildPlan.length) {
          const nextBuilding = buildPlan[memory.buildStage];

          if (memory.wood >= nextBuilding.woodCost && memory.stone >= nextBuilding.stoneCost) {
            const camp = region.campPosition || region.center;
            
            const candidateOffsets: [number, number][] = [
              [4, 0],
              [-5, 0],
              [0, 4],
              [0, -5],
              [5, 4],
              [-5, 4],
              [4, -5],
              [-5, -5],
            ];

            for (const [ox, oz] of candidateOffsets) {
              const bx = Math.round(camp[0] + ox);
              const bz = Math.round(camp[1] + oz);

              if (
                bx < region.bounds.minX + 2 ||
                bx + nextBuilding.w >= region.bounds.maxX - 2 ||
                bz < region.bounds.minZ + 2 ||
                bz + nextBuilding.h >= region.bounds.maxZ - 2
              ) {
                continue;
              }

              let canPlace = true;
              let minH = Infinity;
              let maxH = -Infinity;
              for (let tx = bx; tx < bx + nextBuilding.w; tx++) {
                for (let tz = bz; tz < bz + nextBuilding.h; tz++) {
                  const t = grid.getTile(tx, tz);
                  if (!t || t.terrain === 'water' || t.buildingId) {
                    canPlace = false;
                    break;
                  }
                  const th = t.height || 0.05;
                  if (th < minH) minH = th;
                  if (th > maxH) maxH = th;
                }
                if (!canPlace) break;
              }
              if (!canPlace || (maxH - minH > 0.18)) continue;

              const bId = `building-bot-${region.id}-${nextBuilding.type}-${memory.buildStage}`;
              const buildingH = grid.occupyForBuilding(bx, bz, nextBuilding.w, nextBuilding.h, bId);

              world.add({
                id: bId,
                name: `${nextBuilding.name} (${region.lordName})`,
                isBuilding: true,
                buildingType: nextBuilding.type,
                buildingHealth: 25,
                maxBuildingHealth: 150,
                buildingWidth: nextBuilding.w,
                buildingHeight: nextBuilding.h,
                isCompleted: false,
                constructionProgress: 0,
                gridPosition: [bx, bz],
                position: [bx + nextBuilding.w / 2, buildingH, bz + nextBuilding.h / 2],
                factionId: botFactionId,
                regionId: region.id,
              });

              memory.wood -= nextBuilding.woodCost;
              memory.stone -= nextBuilding.stoneCost;
              memory.buildStage++;

                const builderPeasant = peasants.find((p) => !p.currentJob || p.currentJob.type === 'idle' || p.currentJob.type === 'wander') || peasants[0];
                if (builderPeasant && builderPeasant.gridPosition) {
                  const buildPath = AStar.findPathToArea(grid, builderPeasant.gridPosition, bx, bz, nextBuilding.w, nextBuilding.h, region.bounds);
                  builderPeasant.currentJob = {
                    id: `bot-build-${bId}-${Date.now()}`,
                    type: 'build_structure',
                    targetBuildingId: bId,
                    targetPosition: [bx, bz],
                    progress: 0,
                    totalWork: 100,
                  };
                  if (buildPath && buildPath.length > 0) {
                    builderPeasant.path = buildPath;
                  }
                  builderPeasant.speechBubble = {
                    text: `Розпочинаю будівництво ${nextBuilding.name}!`,
                    expiresAtTick: currentTick + 30,
                    type: 'work',
                  };
                }

                addChronicleEvent({
                  title: `Будівництво у ${region.ukrName}`,
                  description: `${region.lordName} заклав фундамент для ${nextBuilding.name} у володінні ${region.ukrName}. Селяни беруться за молоти!`,
                  type: 'info',
                });

                incrementBuildingVersion();
                break;
            }
          }
        }
      }
    }
  }
}
