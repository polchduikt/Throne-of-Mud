import { GridMap } from '../../grid/GridMap';
import { world } from '../world';
import { useGameStore } from '../../../store/useGameStore';
import { AStar } from '../../pathfinding/AStar';
import { getSmartRoadPath } from '../../grid/roadGeneration';
import { BUILDING_BLUEPRINTS } from '../../buildings/blueprints';
import { getSnappedPlacementCoords } from '../../grid/buildingSnap';
import type { BuildingType, ResourceDeposit } from '../../../types/game';
import {
  BOT_AI_TICK_INTERVAL,
  BOT_AI_WORKER_ASSIGN_INTERVAL,
  BOT_AI_IMMIGRATION_INTERVAL,
  BOT_AI_BUILD_DECISION_INTERVAL,
  BOT_AI_MAX_PEASANTS,
  BOT_AI_STARTING_WOOD,
  BOT_AI_STARTING_STONE,
  BOT_AI_STARTING_GOLD,
  BOT_AI_STARTING_FOOD,
  BOT_AI_STARTING_IRON,
  BOT_AI_PEASANT_MOVE_SPEED,
  BOT_AI_RESOURCE_GEN_CHANCE,
  BOT_AI_GATHER_CHANCE,
  BOT_AI_TERRAIN_MAX_HEIGHT_DIFF,
} from '../../../constants/ai';
import { DEFAULT_WAGE, DEFAULT_SPEECH_BUBBLE_TICKS } from '../../../constants/economy';

interface BotRealmMemory {
  wood: number;
  stone: number;
  gold: number;
  food: number;
  iron: number;
  buildStage: number;
  lastActionTick: number;
  lastWorkerAssignTick: number;
  lastImmigrationTick: number;
  hasPavedHighwayRoad?: boolean;
}

const UKRAINIAN_NAMES_MALE = [
  'Тарас', 'Богдан', 'Остап', 'Яромир', 'Михайло',
  'Любомир', 'Дмитро', 'Назар', 'Степан', 'Василь',
  'Олесь', 'Гриць', 'Юрко', 'Іван', 'Святослав', 'Данило', 'Матвій',
];

const UKRAINIAN_NAMES_FEMALE = [
  'Одарка', 'Мирослава', 'Соломія', 'Ганна', 'Марічка',
  'Катерина', 'Богдана', 'Ярослава', 'Оксана', 'Наталка', 'Роксолана',
];

const PEASANT_COLORS = [
  '#3b82f6', '#10b981', '#06b6d4', '#8b5cf6',
  '#f97316', '#14b8a6', '#84cc16', '#0284c7', '#ec4899', '#f43f5e',
];

const PROFESSION_TITLES: Partial<Record<BuildingType, string>> = {
  lumberjack_hut: 'Лісоруб',
  wheat_farm: 'Хлібороб',
  windmill: 'Мірошник',
  bakery: 'Пекар',
  brewery: 'Пивовар',
  fishermans_hut: 'Рибалка',
  foragers_hut: 'Збирач ягід',
  hunters_hut: 'Мисливець',
  iron_mine: 'Гірник',
  stone_quarry: 'Каменяр',
  clay_pit: 'Гончар',
  salt_works: 'Солевар',
  charcoal_kiln: 'Вугляр',
  iron_smelter: 'Плавильник',
  stonecutter: 'Тесляр каменю',
  brickworks: 'Цегляр',
  sawmill: 'Тесляр',
  weavers_workshop: 'Ткач',
  foresters_hut: 'Лісник',
  wooden_church: 'Священник',
  tavern: 'Шинкар',
  barracks: 'Вартовий',
  market: 'Крамар',
  stockpile: 'Носій',
};

export class BotAISystem {
  private static botMemories: Map<string, BotRealmMemory> = new Map();

  public static reset() {
    this.botMemories.clear();
  }

  public static update(grid: GridMap, currentTick: number): void {
    if (currentTick % BOT_AI_TICK_INTERVAL !== 0) return;

    const {
      regions,
      resourceDeposits = [],
      incrementBuildingVersion,
      incrementFoliageVersion,
      addChronicleEvent,
      updateRegionStats,
    } = useGameStore.getState();

    const botRegions = regions.filter((r) => r.owner === 'bot');

    for (const region of botRegions) {
      const botFactionId = `bot-${region.id}`;
      let memory = this.botMemories.get(botFactionId);
      if (!memory) {
        memory = {
          wood: BOT_AI_STARTING_WOOD,
          stone: BOT_AI_STARTING_STONE,
          gold: BOT_AI_STARTING_GOLD,
          food: BOT_AI_STARTING_FOOD,
          iron: BOT_AI_STARTING_IRON,
          buildStage: 0,
          lastActionTick: currentTick - (80 - (region.id + 1) * 20),
          lastWorkerAssignTick: currentTick,
          lastImmigrationTick: currentTick,
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

      const botBuildings = Array.from(world.entities).filter(
        (e) => e.isBuilding && (e.regionId === region.id || e.factionId === botFactionId)
      );

      const completedBuildings = botBuildings.filter((b) => b.isCompleted);
      const incompleteBuildings = botBuildings.filter((b) => !b.isCompleted);
      const peasants = botUnits.filter((u) => u.characterClass === 'peasant');

      for (const p of peasants) {
        if (p.needs) {
          if (p.needs.hunger < 45) p.needs.hunger = 95;
          if (p.needs.energy < 45) p.needs.energy = 95;
          if (p.needs.mood < 50) p.needs.mood = 80;
        }

        if (p.workBuildingId) {
          const b = completedBuildings.find((cb) => cb.id === p.workBuildingId);
          if (b && Math.random() < BOT_AI_RESOURCE_GEN_CHANCE) {
            if (b.buildingType === 'lumberjack_hut') memory.wood += 2;
            else if (b.buildingType === 'stone_quarry' || b.buildingType === 'stonecutter') memory.stone += 2;
            else if (b.buildingType === 'wheat_farm' || b.buildingType === 'bakery' || b.buildingType === 'fishermans_hut' || b.buildingType === 'foragers_hut' || b.buildingType === 'hunters_hut') memory.food += 2;
            else if (b.buildingType === 'iron_mine' || b.buildingType === 'iron_smelter') memory.iron += 1;
            else if (b.buildingType === 'market' || b.buildingType === 'tavern') memory.gold += 1;
          }
        } else {
          if (Math.random() < BOT_AI_GATHER_CHANCE) {
            memory.wood += 1;
            memory.stone += 1;
          }
        }
      }

      if (currentTick - memory.lastWorkerAssignTick >= BOT_AI_WORKER_ASSIGN_INTERVAL) {
        memory.lastWorkerAssignTick = currentTick;

        for (const b of completedBuildings) {
          if (!b.buildingType) continue;
          const def = BUILDING_BLUEPRINTS[b.buildingType];
          if (!def || def.workSlots <= 0) continue;

          b.assignedWorkers = b.assignedWorkers || [];
          b.assignedWorkers = b.assignedWorkers.filter((wId) =>
            peasants.some((p) => p.id === wId && p.workBuildingId === b.id)
          );

          while (b.assignedWorkers.length < def.workSlots) {
            const availablePeasant = peasants.find((p) => {
              if (p.workBuildingId) return false;
              if (p.currentJob?.type === 'build_structure' && incompleteBuildings.length > 0) return false;
              return true;
            });

            if (!availablePeasant) break;

            availablePeasant.workBuildingId = b.id;
            b.assignedWorkers.push(availablePeasant.id);
            const prof = PROFESSION_TITLES[b.buildingType] || 'Робітник';
            availablePeasant.title = prof;
            availablePeasant.speechBubble = {
              text: `Працюю у ${b.name || def.name}! (${prof})`,
              expiresAtTick: currentTick + DEFAULT_SPEECH_BUBBLE_TICKS,
              type: 'work',
            };
          }
        }
      }

      for (const p of peasants) {
        const isIdleOrWandering = !p.currentJob || p.currentJob.type === 'idle' || p.currentJob.type === 'wander';

        if (isIdleOrWandering && incompleteBuildings.length > 0 && p.gridPosition) {
          const targetB = incompleteBuildings[0];
          const isSomeoneBuilding = peasants.some((other) => other.currentJob?.targetBuildingId === targetB.id);
          if (!isSomeoneBuilding && targetB.gridPosition) {
            const bW = targetB.buildingWidth || 2;
            const bH = targetB.buildingHeight || 2;
            const buildPath = AStar.findPathToArea(grid, p.gridPosition, targetB.gridPosition[0], targetB.gridPosition[1], bW, bH, region.bounds);
            p.currentJob = {
              id: `bot-build-${targetB.id}-${Date.now()}`,
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
              text: `Зводжу ${targetB.name || 'споруду'}!`,
              expiresAtTick: currentTick + 30,
              type: 'work',
            };
          }
        }

        if (isIdleOrWandering && (!p.path || p.path.length === 0) && Math.random() < 0.25) {
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

      let totalBeds = 0;
      for (const b of completedBuildings) {
        if (b.buildingType === 'peasant_house') totalBeds += 2;
        else if (b.buildingType === 'tent') totalBeds += 1;
        else if (b.buildingType === 'manor') totalBeds += 4;
      }

      if (currentTick - memory.lastImmigrationTick >= BOT_AI_IMMIGRATION_INTERVAL) {
        memory.lastImmigrationTick = currentTick;

        if (peasants.length < totalBeds && peasants.length < BOT_AI_MAX_PEASANTS) {
          const isFemale = Math.random() < 0.45;
          const namePool = isFemale ? UKRAINIAN_NAMES_FEMALE : UKRAINIAN_NAMES_MALE;
          const chosenName = namePool[Math.floor(Math.random() * namePool.length)];
          const avatarColor = PEASANT_COLORS[Math.floor(Math.random() * PEASANT_COLORS.length)];

          const camp = region.campPosition || region.center;
          const spawnX = Math.max(region.bounds.minX + 2, Math.min(region.bounds.maxX - 2, camp[0] + Math.round(Math.random() * 6 - 3)));
          const spawnZ = Math.max(region.bounds.minZ + 2, Math.min(region.bounds.maxZ - 2, camp[1] + Math.round(Math.random() * 6 - 3)));

          const newUnitId = `unit-bot-${region.id}-peasant-${Date.now()}-${Math.floor(Math.random() * 1000)}`;

          world.add({
            id: newUnitId,
            name: `${chosenName} з ${region.ukrName}`,
            title: 'Селянин',
            characterClass: 'peasant',
            avatarColor,
            isCharacter: true,
            factionId: botFactionId,
            regionId: region.id,
            gridPosition: [spawnX, spawnZ],
            position: [spawnX + 0.5, 0.3, spawnZ + 0.5],
            moveSpeed: BOT_AI_PEASANT_MOVE_SPEED,
            gold: 5,
            workBuildingId: undefined,
            thoughts: [
              {
                id: 'settled',
                text: `Прибув до володінь ${region.lordName} (+10)`,
                modifier: 10,
                durationTicks: 2500,
              },
            ],
            needs: {
              hunger: 90,
              energy: 95,
              mood: 80,
              ale: 60,
              hygiene: 80,
            },
            skills: {
              farming: 4 + Math.floor(Math.random() * 5),
              woodcutting: 4 + Math.floor(Math.random() * 5),
              mining: 3 + Math.floor(Math.random() * 5),
              building: 5 + Math.floor(Math.random() * 4),
              cooking: 3 + Math.floor(Math.random() * 4),
              brewing: 3 + Math.floor(Math.random() * 4),
              combat: 4 + Math.floor(Math.random() * 4),
              intellect: 5,
              charisma: 5,
            },
            speechBubble: {
              text: `Прибув до ${region.ukrName}! Шукаю роботу та дім.`,
              expiresAtTick: currentTick + DEFAULT_SPEECH_BUBBLE_TICKS,
              type: 'mood',
            },
            currentJob: { id: `idle-${newUnitId}`, type: 'idle', progress: 0, totalWork: 0 },
          });

          addChronicleEvent({
            title: `Новий поселенець у ${region.ukrName}`,
            description: `${chosenName} прибув(ла) до володінь ${region.lordName} та оселився(лася) у новому будинку!`,
            type: 'social',
          });
        }
      }

      if (incompleteBuildings.length === 0 && currentTick - memory.lastActionTick >= BOT_AI_BUILD_DECISION_INTERVAL) {
        memory.lastActionTick = currentTick;

        const bCounts: Partial<Record<BuildingType, number>> = {};
        for (const b of botBuildings) {
          if (b.buildingType) {
            bCounts[b.buildingType] = (bCounts[b.buildingType] || 0) + 1;
          }
        }

        const count = (t: BuildingType) => bCounts[t] || 0;

        const regionalDeposits = resourceDeposits.filter((d) => {
          const [dx, , dz] = d.position || [d.gridPosition[0] + 0.5, 0, d.gridPosition[1] + 0.5];
          return (
            dx >= region.bounds.minX &&
            dx <= region.bounds.maxX &&
            dz >= region.bounds.minZ &&
            dz <= region.bounds.maxZ
          );
        });

        const hasStoneDeposit = regionalDeposits.some((d) => d.type === 'stone');
        const hasIronDeposit = regionalDeposits.some((d) => d.type === 'iron');
        const hasClayDeposit = regionalDeposits.some((d) => d.type === 'clay');
        const hasSaltDeposit = regionalDeposits.some((d) => d.type === 'salt');
        const hasBerryDeposit = regionalDeposits.some((d) => d.type === 'berries');
        const hasGameDeposit = regionalDeposits.some((d) => d.type === 'wild_game');
        const hasFishDeposit = regionalDeposits.some((d) => d.type === 'fish');

        let candidateGoal: { type: BuildingType; targetDeposit?: ResourceDeposit } | null = null;

        if (count('lumberjack_hut') === 0) {
          candidateGoal = { type: 'lumberjack_hut' };
        } else if (count('peasant_house') === 0) {
          candidateGoal = { type: 'peasant_house' };
        } else if (count('stockpile') === 0) {
          candidateGoal = { type: 'stockpile' };
        } else if (hasBerryDeposit && count('foragers_hut') === 0) {
          candidateGoal = { type: 'foragers_hut', targetDeposit: regionalDeposits.find((d) => d.type === 'berries') };
        } else if (hasFishDeposit && count('fishermans_hut') === 0) {
          candidateGoal = { type: 'fishermans_hut', targetDeposit: regionalDeposits.find((d) => d.type === 'fish') };
        } else if (hasGameDeposit && count('hunters_hut') === 0) {
          candidateGoal = { type: 'hunters_hut', targetDeposit: regionalDeposits.find((d) => d.type === 'wild_game') };
        } else if (count('wheat_farm') === 0) {
          candidateGoal = { type: 'wheat_farm' };
        } else if (count('peasant_house') < 2) {
          candidateGoal = { type: 'peasant_house' };
        } else if (hasStoneDeposit && count('stone_quarry') === 0) {
          candidateGoal = { type: 'stone_quarry', targetDeposit: regionalDeposits.find((d) => d.type === 'stone') };
        } else if (hasIronDeposit && count('iron_mine') === 0) {
          candidateGoal = { type: 'iron_mine', targetDeposit: regionalDeposits.find((d) => d.type === 'iron') };
        } else if (hasClayDeposit && count('clay_pit') === 0) {
          candidateGoal = { type: 'clay_pit', targetDeposit: regionalDeposits.find((d) => d.type === 'clay') };
        } else if (hasSaltDeposit && count('salt_works') === 0) {
          candidateGoal = { type: 'salt_works', targetDeposit: regionalDeposits.find((d) => d.type === 'salt') };
        } else if (count('wheat_farm') >= 1 && count('windmill') === 0) {
          candidateGoal = { type: 'windmill' };
        } else if (count('windmill') >= 1 && count('bakery') === 0) {
          candidateGoal = { type: 'bakery' };
        } else if (count('stone_quarry') >= 1 && count('stonecutter') === 0) {
          candidateGoal = { type: 'stonecutter' };
        } else if (count('sawmill') === 0) {
          candidateGoal = { type: 'sawmill' };
        } else if (count('peasant_house') < 3) {
          candidateGoal = { type: 'peasant_house' };
        } else if (count('wheat_farm') >= 1 && count('brewery') === 0) {
          candidateGoal = { type: 'brewery' };
        } else if (count('brewery') >= 1 && count('tavern') === 0) {
          candidateGoal = { type: 'tavern' };
        } else if (count('wooden_church') === 0) {
          candidateGoal = { type: 'wooden_church' };
        } else if (count('iron_mine') >= 1 && count('charcoal_kiln') === 0) {
          candidateGoal = { type: 'charcoal_kiln' };
        } else if (count('charcoal_kiln') >= 1 && count('iron_smelter') === 0) {
          candidateGoal = { type: 'iron_smelter' };
        } else if (count('market') === 0) {
          candidateGoal = { type: 'market' };
        } else if (count('barracks') === 0) {
          candidateGoal = { type: 'barracks' };
        } else if (count('manor') === 0 && peasants.length >= 6) {
          candidateGoal = { type: 'manor' };
        } else if (count('peasant_house') < 6) {
          candidateGoal = { type: 'peasant_house' };
        } else if (count('lumberjack_hut') < 2) {
          candidateGoal = { type: 'lumberjack_hut' };
        } else if (count('wheat_farm') < 2) {
          candidateGoal = { type: 'wheat_farm' };
        }

        if (candidateGoal) {
          const bType = candidateGoal.type;
          const bBlueprint = BUILDING_BLUEPRINTS[bType];
          if (bBlueprint) {
            const bWidth = bBlueprint.width || 3;
            const bHeight = bBlueprint.height || 2;
            const woodCost = bBlueprint.cost?.wood || 15;
            const stoneCost = bBlueprint.cost?.stone || 0;

            if (memory.wood < woodCost) memory.wood += woodCost;
            if (memory.stone < stoneCost) memory.stone += stoneCost;

            let placedCoords: [number, number] | null = null;

            if (candidateGoal.targetDeposit) {
              const d = candidateGoal.targetDeposit;
              const [dx, , dz] = d.position || [d.gridPosition[0] + 0.5, 0, d.gridPosition[1] + 0.5];
              const snapped = getSnappedPlacementCoords(
                dx - bWidth / 2,
                dz - bHeight / 2,
                bWidth,
                bHeight,
                bType,
                grid,
                resourceDeposits
              );

              let canPlaceDep = true;
              for (let tx = snapped[0]; tx < snapped[0] + bWidth; tx++) {
                for (let tz = snapped[1]; tz < snapped[1] + bHeight; tz++) {
                  const t = grid.getTile(tx, tz);
                  if (!t || (t.terrain === 'water' && bType !== 'fishermans_hut') || (t.buildingId && !t.buildingId.includes('deposit'))) {
                    canPlaceDep = false;
                    break;
                  }
                }
                if (!canPlaceDep) break;
              }

              if (canPlaceDep) {
                placedCoords = snapped;
              }
            }

            if (!placedCoords) {
              const camp = region.campPosition || region.center;
              const ringOffsets: [number, number][] = [
                [5, 0], [-6, 0], [0, 5], [0, -6],
                [6, 5], [-6, 5], [6, -6], [-6, -6],
                [11, 0], [-11, 0], [0, 11], [0, -11],
                [11, 6], [-11, 6], [11, -6], [-11, -6],
                [6, 11], [-6, 11], [6, -11], [-6, -11],
                [12, 12], [-12, 12], [12, -12], [-12, -12],
              ];

              for (const [ox, oz] of ringOffsets) {
                const bx = Math.round(camp[0] + ox);
                const bz = Math.round(camp[1] + oz);

                if (
                  bx < region.bounds.minX + 3 ||
                  bx + bWidth >= region.bounds.maxX - 3 ||
                  bz < region.bounds.minZ + 3 ||
                  bz + bHeight >= region.bounds.maxZ - 3
                ) {
                  continue;
                }

                let canPlace = true;
                let minH = Infinity;
                let maxH = -Infinity;

                for (let tx = bx; tx < bx + bWidth; tx++) {
                  for (let tz = bz; tz < bz + bHeight; tz++) {
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

                if (canPlace && maxH - minH <= BOT_AI_TERRAIN_MAX_HEIGHT_DIFF) {
                  placedCoords = [bx, bz];
                  break;
                }
              }
            }

            if (placedCoords) {
              const [bx, bz] = placedCoords;
              const bId = `building-bot-${region.id}-${bType}-${memory.buildStage}-${Date.now()}`;
              const buildingH = grid.occupyForBuilding(bx, bz, bWidth, bHeight, bId);

              world.add({
                id: bId,
                name: `${bBlueprint.name} (${region.lordName})`,
                isBuilding: true,
                buildingType: bType,
                buildingHealth: 30,
                maxBuildingHealth: bBlueprint.health || 200,
                buildingWidth: bWidth,
                buildingHeight: bHeight,
                isCompleted: false,
                constructionProgress: 0,
                gridPosition: [bx, bz],
                position: [bx + bWidth / 2, buildingH, bz + bHeight / 2],
                factionId: botFactionId,
                regionId: region.id,
                wage: bBlueprint.defaultWage || DEFAULT_WAGE,
                assignedWorkers: [],
              });

              memory.wood = Math.max(0, memory.wood - woodCost);
              memory.stone = Math.max(0, memory.stone - stoneCost);
              memory.buildStage++;

              const approachCandidates: [number, number][] = [
                [bx + Math.floor(bWidth / 2), bz + bHeight],
                [bx + Math.floor(bWidth / 2), bz - 1],
                [bx - 1, bz + Math.floor(bHeight / 2)],
                [bx + bWidth, bz + Math.floor(bHeight / 2)],
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

              const builderPeasant =
                peasants.find((p) => !p.currentJob || p.currentJob.type === 'idle' || p.currentJob.type === 'wander') ||
                peasants[0];

              if (builderPeasant && builderPeasant.gridPosition) {
                const buildPath = AStar.findPathToArea(grid, builderPeasant.gridPosition, bx, bz, bWidth, bHeight, region.bounds);
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
                  text: `Розпочинаю будівництво ${bBlueprint.name}!`,
                  expiresAtTick: currentTick + 30,
                  type: 'work',
                };
              }

              addChronicleEvent({
                title: `Будівництво у ${region.ukrName}`,
                description: `${region.lordName} заклав фундамент для ${bBlueprint.name} у володінні ${region.ukrName}. Селяни беруться за молоти!`,
                type: 'info',
              });

              incrementBuildingVersion();
              incrementFoliageVersion();
            }
          }
        }
      }

      if (updateRegionStats) {
        const activePop = peasants.length + 1;
        const activeBuildings = completedBuildings.length;
        const estWealth = Math.min(600, Math.round(memory.gold + memory.wood * 0.4 + memory.stone * 0.7 + memory.iron * 1.5));
        const estApproval = Math.min(96, Math.max(60, 75 + (completedBuildings.length >= 4 ? 10 : 0)));

        updateRegionStats(region.id, {
          population: activePop,
          buildingsCount: activeBuildings,
          wealth: estWealth,
          approval: estApproval,
        });
      }
    }
  }
}
