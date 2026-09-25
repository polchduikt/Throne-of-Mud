import { GridMap } from '../../grid/GridMap';
import { world } from '../world';
import { useGameStore } from '../../../store/useGameStore';
import { AStar } from '../../pathfinding/AStar';
import { getSmartRoadPath } from '../../grid/roadGeneration';
import type { BuildingType } from '../../../types/game';

interface BotRealmMemory {
  wood: number;
  stone: number;
  buildStage: number;
  lastActionTick: number;
  hasPavedHighwayRoad?: boolean;
}

export class BotAISystem {
  private static botMemories: Map<string, BotRealmMemory> = new Map();

  public static reset() {
    this.botMemories.clear();
  }

  public static update(grid: GridMap, currentTick: number): void {
    if (currentTick % 15 !== 0) return;

    const { regions, incrementBuildingVersion, incrementFoliageVersion, addChronicleEvent } = useGameStore.getState();
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

      if (!memory.hasPavedHighwayRoad) {
        memory.hasPavedHighwayRoad = true;
        const camp = region.campPosition || region.center;
        const hwX = GridMap.getHighwayX(camp[1]);
        const hwZ = GridMap.getHighwayZ(camp[0]);
        const distNS = Math.abs(camp[0] - hwX);
        const distEW = Math.abs(camp[1] - hwZ);
        const distPlaza = Math.hypot(camp[0] - 127.5, camp[1] - 127.5);

        let targetX = Math.round(hwX);
        let targetZ = camp[1];
        if (distEW < distNS && distEW < distPlaza) {
          targetX = camp[0];
          targetZ = Math.round(hwZ);
        } else if (distPlaza < distNS && distPlaza < distEW) {
          targetX = 128;
          targetZ = 128;
        }

        const hPath = getSmartRoadPath(grid, targetX, targetZ, camp[0] + 1, camp[1] + 1);
        let anyPaved = false;
        for (const [px, pz] of hPath) {
          if (grid.paveRoad(px, pz)) anyPaved = true;
        }

        const campInternal = getSmartRoadPath(grid, camp[0], camp[1], camp[0] - 2, camp[1]);
        for (const [px, pz] of campInternal) {
          if (grid.paveRoad(px, pz)) anyPaved = true;
        }

        if (anyPaved) {
          incrementBuildingVersion();
          incrementFoliageVersion(true);
        }
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

              const approachCandidates: [number, number][] = [
                [bx + Math.floor(nextBuilding.w / 2), bz + nextBuilding.h],
                [bx + Math.floor(nextBuilding.w / 2), bz - 1],
                [bx - 1, bz + Math.floor(nextBuilding.h / 2)],
                [bx + nextBuilding.w, bz + Math.floor(nextBuilding.h / 2)],
              ];
              let approachPos: [number, number] | null = null;
              for (const [ax, az] of approachCandidates) {
                const t = grid.getTile(ax, az);
                if (t && t.terrain !== 'water' && !t.buildingId) {
                  approachPos = [ax, az];
                  break;
                }
              }

              if (approachPos) {
                let nearestRoad: [number, number] | null = null;
                let minDist = Infinity;
                for (let rx = region.bounds.minX; rx <= region.bounds.maxX; rx++) {
                  for (let rz = region.bounds.minZ; rz <= region.bounds.maxZ; rz++) {
                    const t = grid.getTile(rx, rz);
                    if (t && t.terrain === 'road') {
                      const d = Math.hypot(rx - approachPos[0], rz - approachPos[1]);
                      if (d < minDist) {
                        minDist = d;
                        nearestRoad = [rx, rz];
                      }
                    }
                  }
                }

                if (nearestRoad) {
                  const bRoadPath = getSmartRoadPath(
                    grid,
                    approachPos[0],
                    approachPos[1],
                    nearestRoad[0],
                    nearestRoad[1],
                    region.bounds
                  );
                  for (const [px, pz] of bRoadPath) {
                    grid.paveRoad(px, pz);
                  }
                }
              }

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
                incrementFoliageVersion();
                break;
            }
          }
        }
      }
    }
  }
}
