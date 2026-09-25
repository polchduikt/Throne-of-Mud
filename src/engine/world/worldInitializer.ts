import type { RegionData, WorldSetupConfig, ResourceDeposit } from '../../types/game';
import { GridMap } from '../grid/GridMap';
import { world } from '../ecs/world';
import { DEFAULT_REGIONS, PRESET_BOT_LORDS } from '../../constants/world';
import { initResourceDeposits } from '../resources/ResourceDeposits';
import { getSmartRoadPath } from '../grid/roadGeneration';

export interface WorldInitResult {
  playerRegionId: number;
  playerSpawnPoint: [number, number];
  botCount: number;
  regions: RegionData[];
  settlementName: string;
  cameraFocusTarget: [number, number];
  resourceDeposits: ResourceDeposit[];
}

export function initializeWorldEntities(
  grid: GridMap,
  config?: WorldSetupConfig,
  currentRegionId: number = 0,
  currentBotCount: number = 2
): WorldInitResult {
  for (const entity of [...world.entities]) {
    world.remove(entity);
  }

  const playerRegionId = config?.playerRegionId ?? currentRegionId ?? 0;
  const botCount = config?.botCount !== undefined ? config.botCount : (currentBotCount ?? 2);

  const updatedRegions: RegionData[] = JSON.parse(JSON.stringify(DEFAULT_REGIONS));

  const pRegion = updatedRegions[playerRegionId];
  pRegion.owner = 'player';
  pRegion.lordName = 'Король Болеслав';
  pRegion.lordTitle = 'Правитель земель';
  pRegion.heraldryColor = '#f59e0b';
  pRegion.heraldryIcon = '👑';
  pRegion.population = 3;
  pRegion.approval = 80;
  pRegion.wealth = 50;
  pRegion.buildingsCount = 2;

  let cx = pRegion.center[0];
  let cz = pRegion.center[1];
  if (config?.selectedSpawnPointId && pRegion.spawnPoints) {
    const sp = pRegion.spawnPoints.find((s) => s.id === config.selectedSpawnPointId);
    if (sp) {
      cx = sp.position[0];
      cz = sp.position[1];
    }
  } else if (config?.playerSpawnPoint) {
    cx = Math.max(pRegion.bounds.minX + 4, Math.min(pRegion.bounds.maxX - 4, Math.round(config.playerSpawnPoint[0])));
    cz = Math.max(pRegion.bounds.minZ + 4, Math.min(pRegion.bounds.maxZ - 4, Math.round(config.playerSpawnPoint[1])));
  } else if (pRegion.spawnPoints && pRegion.spawnPoints.length > 0) {
    cx = pRegion.spawnPoints[0].position[0];
    cz = pRegion.spawnPoints[0].position[1];
  }
  pRegion.campPosition = [cx, cz];

  const clearCampArea = (spawnX: number, spawnZ: number) => {
    const centerTile = grid.getTile(spawnX, spawnZ);
    const campH = centerTile?.height || 0.05;
    for (let px = spawnX - 4; px <= spawnX + 4; px++) {
      for (let pz = spawnZ - 4; pz <= spawnZ + 4; pz++) {
        const tile = grid.getTile(px, pz);
        if (tile && tile.terrain !== 'water') {
          tile.height = campH;
          tile.foliageType = undefined;
          tile.foliageAngle = undefined;
          tile.foliageTreeType = undefined;
        }
      }
    }
    grid.removeFoliageFromCoords(spawnX - 4, spawnX + 4, spawnZ - 4, spawnZ + 4);
    return campH;
  };

  const pCampH = clearCampArea(cx, cz);

  const campfireId = 'building-campfire-player';
  grid.occupyForBuilding(cx, cz, 2, 2, campfireId);
  world.add({
    id: campfireId,
    name: 'Багаття поселення',
    isBuilding: true,
    buildingType: 'campfire',
    buildingHealth: 100,
    maxBuildingHealth: 100,
    buildingWidth: 2,
    buildingHeight: 2,
    isCompleted: true,
    constructionProgress: 100,
    gridPosition: [cx, cz],
    position: [cx + 1.0, pCampH, cz + 1.0],
    factionId: 'player',
    regionId: playerRegionId,
  });

  const tentId = 'building-tent-player';
  grid.occupyForBuilding(cx - 4, cz - 1, 3, 2, tentId);
  world.add({
    id: tentId,
    name: 'Палатка поселенців',
    isBuilding: true,
    buildingType: 'tent',
    buildingHealth: 150,
    maxBuildingHealth: 150,
    buildingWidth: 3,
    buildingHeight: 2,
    isCompleted: true,
    constructionProgress: 100,
    gridPosition: [cx - 4, cz - 1],
    position: [cx - 2.5, pCampH, cz],
    factionId: 'player',
    regionId: playerRegionId,
  });

  const initialUnits = [
    {
      id: 'unit-king',
      name: 'Король Болеслав',
      title: 'Правитель земель',
      characterClass: 'king' as const,
      avatarColor: '#f59e0b',
      gx: cx - 1,
      gz: cz + 1,
      gold: 35,
      skills: { farming: 3, woodcutting: 2, mining: 2, building: 4, cooking: 2, brewing: 6, combat: 8, intellect: 9, charisma: 9 },
    },
    {
      id: 'unit-peasant-1',
      name: 'Олесь Орач',
      title: 'Селянин',
      characterClass: 'peasant' as const,
      avatarColor: '#3b82f6',
      gx: cx + 1,
      gz: cz - 1,
      gold: 3,
      skills: { farming: 8, woodcutting: 7, mining: 4, building: 6, cooking: 4, brewing: 3, combat: 4, intellect: 5, charisma: 5 },
    },
    {
      id: 'unit-peasant-2',
      name: 'Гриць Будівничий',
      title: 'Селянин',
      characterClass: 'peasant' as const,
      avatarColor: '#10b981',
      gx: cx + 1,
      gz: cz + 1,
      gold: 3,
      skills: { farming: 4, woodcutting: 8, mining: 6, building: 8, cooking: 2, brewing: 2, combat: 4, intellect: 4, charisma: 4 },
    },
  ];

  for (const u of initialUnits) {
    world.add({
      id: u.id,
      name: u.name,
      title: u.title,
      characterClass: u.characterClass,
      avatarColor: u.avatarColor,
      isCharacter: true,
      factionId: 'player',
      regionId: playerRegionId,
      gridPosition: [u.gx, u.gz],
      position: [u.gx + 0.5, 0.3, u.gz + 0.5],
      moveSpeed: 1.35,
      gold: u.gold,
      workBuildingId: undefined,
      thoughts: [
        {
          id: 'settled',
          text: 'Заснування нового табору (+10)',
          modifier: 10,
          durationTicks: 2500,
        },
      ],
      needs: {
        hunger: 85,
        energy: 90,
        mood: 75,
        ale: 60,
        hygiene: 80,
      },
      skills: u.skills,
      currentJob: { id: `idle-${u.id}`, type: 'idle', progress: 0, totalWork: 0 },
    });
  }

  const otherRegionIds = [0, 1, 2, 3].filter((id) => id !== playerRegionId);
  let activeBotIndex = 0;

  for (let i = 0; i < otherRegionIds.length; i++) {
    const regId = otherRegionIds[i];
    const botReg = updatedRegions[regId];

    if (activeBotIndex < botCount && activeBotIndex < PRESET_BOT_LORDS.length) {
      const bot = PRESET_BOT_LORDS[activeBotIndex];
      botReg.owner = 'bot';
      botReg.lordName = bot.name;
      botReg.lordTitle = bot.title;
      botReg.heraldryColor = bot.color;
      botReg.heraldryIcon = bot.heraldryIcon;
      botReg.population = 3;
      botReg.approval = 75 + activeBotIndex * 3;
      botReg.wealth = 40 + activeBotIndex * 10;
      botReg.buildingsCount = 2;

      const bSpawn = (botReg.spawnPoints && botReg.spawnPoints[0]) ? botReg.spawnPoints[0].position : botReg.center;
      const bx = bSpawn[0];
      const bz = bSpawn[1];
      botReg.campPosition = [bx, bz];

      const bCampH = clearCampArea(bx, bz);

      const bCampfireId = `building-campfire-${bot.id}`;
      grid.occupyForBuilding(bx, bz, 2, 2, bCampfireId);
      world.add({
        id: bCampfireId,
        name: `Вогнище (${bot.name})`,
        isBuilding: true,
        buildingType: 'campfire',
        buildingHealth: 100,
        maxBuildingHealth: 100,
        buildingWidth: 2,
        buildingHeight: 2,
        isCompleted: true,
        constructionProgress: 100,
        gridPosition: [bx, bz],
        position: [bx + 1.0, bCampH, bz + 1.0],
        factionId: bot.id,
        regionId: regId,
      });

      const bTentId = `building-tent-${bot.id}`;
      grid.occupyForBuilding(bx - 4, bz - 1, 3, 2, bTentId);
      world.add({
        id: bTentId,
        name: `Табір (${bot.name})`,
        isBuilding: true,
        buildingType: 'tent',
        buildingHealth: 150,
        maxBuildingHealth: 150,
        buildingWidth: 3,
        buildingHeight: 2,
        isCompleted: true,
        constructionProgress: 100,
        gridPosition: [bx - 4, bz - 1],
        position: [bx - 2.5, bCampH, bz],
        factionId: bot.id,
        regionId: regId,
      });

      const hwX = GridMap.getHighwayX(bz);
      const hwZ = GridMap.getHighwayZ(bx);
      const distNS = Math.abs(bx - hwX);
      const distEW = Math.abs(bz - hwZ);
      const distPlaza = Math.hypot(bx - 127.5, bz - 127.5);

      let targetX = Math.round(hwX);
      let targetZ = bz;
      if (distEW < distNS && distEW < distPlaza) {
        targetX = bx;
        targetZ = Math.round(hwZ);
      } else if (distPlaza < distNS && distPlaza < distEW) {
        targetX = 128;
        targetZ = 128;
      }

      const botHighwayRoad = getSmartRoadPath(grid, targetX, targetZ, bx + 1, bz + 1);
      for (const [px, pz] of botHighwayRoad) {
        grid.paveRoad(px, pz);
      }

      const botCampInternalRoad = getSmartRoadPath(grid, bx, bz, bx - 2, bz);
      for (const [px, pz] of botCampInternalRoad) {
        grid.paveRoad(px, pz);
      }

      world.add({
        id: `unit-${bot.id}-lord`,
        name: bot.name,
        title: bot.title,
        characterClass: 'lord',
        avatarColor: bot.avatarColor,
        isCharacter: true,
        factionId: bot.id,
        regionId: regId,
        gridPosition: [bx - 1, bz + 1],
        position: [bx - 0.5, 0.3, bz + 1.5],
        moveSpeed: 1.35,
        gold: 50,
        needs: { hunger: 90, energy: 90, mood: 80, ale: 70, hygiene: 80 },
        skills: { farming: 2, woodcutting: 2, mining: 2, building: 4, cooking: 2, brewing: 4, combat: 8, intellect: 8, charisma: 8 },
        currentJob: { id: `idle-bot-${bot.id}-lord`, type: 'idle', progress: 0, totalWork: 0 },
      });

      for (let pIdx = 1; pIdx <= 2; pIdx++) {
        world.add({
          id: `unit-${bot.id}-peasant-${pIdx}`,
          name: `${pIdx === 1 ? 'Селянин' : 'Робітник'} (${bot.name})`,
          title: 'Селянин',
          characterClass: 'peasant',
          avatarColor: bot.peasantColor,
          isCharacter: true,
          factionId: bot.id,
          regionId: regId,
          gridPosition: [bx + 1, bz + (pIdx === 1 ? -1 : 1)],
          position: [bx + 1.5, 0.3, bz + (pIdx === 1 ? -0.5 : 1.5)],
          moveSpeed: 1.35,
          gold: 5,
          needs: { hunger: 85, energy: 90, mood: 75, ale: 60, hygiene: 80 },
          skills: { farming: 6, woodcutting: 6, mining: 5, building: 6, cooking: 3, brewing: 3, combat: 3, intellect: 4, charisma: 4 },
          currentJob: { id: `idle-${bot.id}-p${pIdx}`, type: 'idle', progress: 0, totalWork: 0 },
        });
      }

      activeBotIndex++;
    } else {
      botReg.owner = 'unclaimed';
      botReg.lordName = 'Вільні землі';
      botReg.lordTitle = 'Нейтральна територія';
      botReg.heraldryColor = '#64748b';
      botReg.heraldryIcon = '🌲';
      botReg.population = 0;
      botReg.approval = 0;
      botReg.wealth = 0;
      botReg.buildingsCount = 0;
      botReg.campPosition = [botReg.center[0], botReg.center[1]];
    }
  }

  const deposits = initResourceDeposits(grid);

  return {
    playerRegionId,
    playerSpawnPoint: [cx, cz],
    botCount,
    regions: updatedRegions,
    settlementName: pRegion.name.toUpperCase(),
    cameraFocusTarget: [cx, cz],
    resourceDeposits: deposits,
  };
}
