import { world, characterEntities, buildingEntities } from '../world';
import { GridMap } from '../../grid/GridMap';
import { AStar } from '../../pathfinding/AStar';
import { useGameStore } from '../../../store/useGameStore';

const UKRAINIAN_NAMES_MALE = [
  'Тарас', 'Богдан', 'Остап', 'Яромир', 'Михайло', 
  'Любомир', 'Дмитро', 'Назар', 'Степан', 'Василь',
  'Олесь', 'Гриць', 'Юрко', 'Іван', 'Святослав'
];

const UKRAINIAN_NAMES_FEMALE = [
  'Одарка', 'Мирослава', 'Соломія', 'Ганна', 'Марічка', 
  'Катерина', 'Богдана', 'Ярослава', 'Оксана', 'Наталка'
];

const PEASANT_COLORS = [
  '#3b82f6', '#10b981', '#06b6d4', '#8b5cf6', 
  '#f97316', '#14b8a6', '#84cc16', '#0284c7'
];

export class ImmigrationSystem {
  public static update(grid: GridMap, currentTick: number): void {
    if (currentTick % 20 !== 0) return;

    const { 
      immigrationProgress, 
      setImmigrationProgress, 
      addChronicleEvent, 
      setSaveNotification, 
      settlementName,
      regions,
      playerRegionId,
      playerSpawnPoint,
    } = useGameStore.getState();

    const allCharacters = Array.from(characterEntities);
    const buildings = Array.from(buildingEntities).filter((b) => b.isCompleted);

    let totalBeds = 0;
    for (const b of buildings) {
      if (b.buildingType === 'peasant_house') totalBeds += 2;
      else if (b.buildingType === 'tent') totalBeds += 1;
      else if (b.buildingType === 'manor') totalBeds += 4;
    }

    const freeBeds = totalBeds - allCharacters.length;

    let approvalRating = 50;
    if (allCharacters.length > 0) {
      const totalMood = allCharacters.reduce((acc, c) => acc + (c.needs?.mood || 60), 0);
      approvalRating = Math.round(totalMood / allCharacters.length);
    }

    if (freeBeds <= 0 || approvalRating < 50) {
      if (immigrationProgress > 0) {
        setImmigrationProgress(Math.max(0, immigrationProgress - 0.5));
      }
      return;
    }

    let progressDelta = 1.2;
    if (approvalRating >= 70) {
      progressDelta += 1.2;
    }
    if (approvalRating >= 85) {
      progressDelta += 0.8;
    }

    const nextProgress = immigrationProgress + progressDelta;

    if (nextProgress < 100) {
      setImmigrationProgress(nextProgress);
      return;
    }

    setImmigrationProgress(0);

    const isFemale = Math.random() < 0.45;
    const namePool = isFemale ? UKRAINIAN_NAMES_FEMALE : UKRAINIAN_NAMES_MALE;
    const chosenName = namePool[Math.floor(Math.random() * namePool.length)];
    const avatarColor = PEASANT_COLORS[Math.floor(Math.random() * PEASANT_COLORS.length)];

    const pRegion = regions.find((r) => r.id === (playerRegionId ?? 0)) || regions[0];
    const bounds = pRegion?.bounds || { minX: 0, maxX: 127, minZ: 0, maxZ: 127 };
    const campPos = pRegion?.campPosition || playerSpawnPoint || [52, 52];
    const cx = campPos[0];
    const cz = campPos[1];

    let spawnX = bounds.minX + 2;
    let spawnZ = Math.floor((bounds.minZ + bounds.maxZ) / 2);

    let foundRoadEdge = false;
    for (let z = bounds.minZ + 2; z < bounds.maxZ - 2; z++) {
      const tile = grid.getTile(spawnX, z);
      if (tile && tile.terrain === 'road') {
        spawnZ = z;
        foundRoadEdge = true;
        break;
      }
    }

    if (!foundRoadEdge) {
      for (let z = bounds.minZ + 2; z < bounds.maxZ - 2; z++) {
        if (grid.isWalkable(spawnX, z)) {
          spawnZ = z;
          break;
        }
      }
    }

    const newUnitId = `unit-peasant-immigrant-${Date.now()}`;

    const entryPath = AStar.findPath(grid, [spawnX, spawnZ], [cx, cz], true, bounds) || [];

    world.add({
      id: newUnitId,
      name: chosenName,
      title: 'Новий поселенець',
      characterClass: 'peasant',
      avatarColor,
      isCharacter: true,
      factionId: 'player',
      regionId: pRegion.id,
      gridPosition: [spawnX, spawnZ],
      position: [spawnX + 0.5, 0.3, spawnZ + 0.5],
      path: entryPath,
      moveSpeed: 1.35,
      gold: Math.floor(Math.random() * 4) + 2,
      workBuildingId: undefined,
      thoughts: [
        {
          id: 'new_settler',
          text: 'Прибув у нове поселення (+15)',
          modifier: 15,
          durationTicks: 3000,
        },
      ],
      needs: {
        hunger: 75,
        energy: 85,
        mood: 75,
        ale: 50,
        hygiene: 75,
      },
      skills: {
        farming: Math.floor(Math.random() * 5) + 4,
        woodcutting: Math.floor(Math.random() * 5) + 4,
        mining: Math.floor(Math.random() * 4) + 3,
        building: Math.floor(Math.random() * 5) + 4,
        cooking: Math.floor(Math.random() * 4) + 2,
        brewing: Math.floor(Math.random() * 4) + 2,
        combat: Math.floor(Math.random() * 4) + 3,
        intellect: Math.floor(Math.random() * 5) + 3,
        charisma: Math.floor(Math.random() * 5) + 3,
      },
      currentJob: {
        id: `journey-${newUnitId}`,
        type: 'wander',
        progress: 0,
        totalWork: 10,
      },
      speechBubble: {
        text: 'Вітаю! Шукаю прихистку та роботи.',
        expiresAtTick: currentTick + 35,
        type: 'mood',
      },
    });

    addChronicleEvent({
      title: 'Нові поселенці прибули!',
      description: `До нашого поселення приєднався новий житель — ${chosenName}. Його привабило процвітання та високий рівень життя під владою Корони.`,
      type: 'success',
    });

    setSaveNotification(`👤 До ${settlementName} прибув новий житель: ${chosenName}!`);
  }
}
