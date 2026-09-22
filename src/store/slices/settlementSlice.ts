import type { StateCreator } from 'zustand';
import type {
  ResourceInventory,
  ResourceType,
  ChronicleEvent,
  Job,
  RegionData,
  ResourceDeposit,
  WorldSetupConfig,
} from '../../types/game';
import { GridMap } from '../../engine/grid/GridMap';
import { world, characterEntities } from '../../engine/ecs/world';
import { BUILDING_BLUEPRINTS } from '../../engine/buildings/blueprints';
import {
  INITIAL_RESOURCES,
  STARTING_INFLUENCE,
  STARTING_ROYAL_FAVOR,
  MIN_BUILDING_WAGE,
  MAX_BUILDING_WAGE,
} from '../../constants/economy';
import { DEFAULT_REGIONS } from '../../constants/world';
import { INITIAL_RESOURCE_DEPOSITS } from '../../engine/resources/ResourceDeposits';
import {
  assignWorkerToBuilding as assignWorkerHelper,
  dismissWorkerFromBuilding as dismissWorkerHelper,
} from '../../engine/ecs/entityHelpers';
import { initializeWorldEntities } from '../../engine/world/worldInitializer';
import type { GameState } from '../useGameStore';

let pendingBuildingVersion = false;
let foliageDebounceTimer: ReturnType<typeof setTimeout> | null = null;

export interface SettlementSlice {
  resources: ResourceInventory;
  addResource: (type: ResourceType, amount: number) => void;
  consumeResource: (type: ResourceType, amount: number) => boolean;

  settlementName: string;
  setSettlementName: (name: string) => void;
  influence: number;
  royalFavor: number;

  activeCorrespondence: { id: string; sender: string; title: string; message: string; timeLeft: number } | null;
  dismissCorrespondence: () => void;

  pendingJobs: Job[];
  addPendingJob: (job: Job) => void;
  removePendingJob: (jobId: string) => void;

  activeTreeHits: Array<{ id: string; x: number; z: number; hitTime: number; intensity: number }>;
  registerTreeHit: (x: number, z: number, intensity?: number) => void;
  fallingTrees: Array<{ id: string; x: number; z: number; startTime: number; fallAngle: number; treeType: 'oak' | 'pine' | 'autumn' }>;
  registerTreeFall: (x: number, z: number, treeType?: 'oak' | 'pine' | 'autumn', fallAngle?: number) => void;

  assignWorkerToBuilding: (buildingId: string) => boolean;
  removeWorkerFromBuilding: (buildingId: string, workerId: string) => void;
  assignLordToBuilding: (buildingId: string, lordId: string | null) => void;
  setBuildingWage: (buildingId: string, wage: number) => void;
  callLevyMilitia: (lordId: string) => void;
  lordPreach: (lordId: string) => void;

  chronicle: ChronicleEvent[];
  addChronicleEvent: (event: Omit<ChronicleEvent, 'id' | 'timestamp' | 'gameDay' | 'gameHour'>) => void;

  buildingVersion: number;
  incrementBuildingVersion: () => void;
  foliageVersion: number;
  incrementFoliageVersion: () => void;

  regions: RegionData[];
  playerRegionId: number;
  playerSpawnPoint: [number, number];
  botCount: number;
  updateRegionStats: (regionId: number, partial: Partial<RegionData>) => void;

  immigrationProgress: number;
  setImmigrationProgress: (val: number) => void;

  resourceDeposits: ResourceDeposit[];
  updateResourceDeposit: (depositId: string, partial: Partial<ResourceDeposit>) => void;

  isInitialized: boolean;
  initWorld: (grid: GridMap, config?: WorldSetupConfig) => void;
  resetWorld: (grid: GridMap, config?: WorldSetupConfig) => void;
}

export const createSettlementSlice: StateCreator<GameState, [], [], SettlementSlice> = (set, get) => ({
  resources: { ...INITIAL_RESOURCES },

  addResource: (type, amount) => {
    set((state) => ({
      resources: {
        ...state.resources,
        [type]: Math.max(0, (state.resources[type] || 0) + amount),
      },
    }));
  },

  consumeResource: (type, amount) => {
    const current = get().resources[type] || 0;
    if (current >= amount) {
      set((state) => ({
        resources: {
          ...state.resources,
          [type]: current - amount,
        },
      }));

      if (type === 'wood') {
        let remainingToDeduct = amount;
        for (const b of world.entities) {
          if (b.isBuilding && b.localInventory && (b.localInventory.wood || 0) > 0) {
            const deduct = Math.min(remainingToDeduct, b.localInventory.wood || 0);
            b.localInventory.wood = (b.localInventory.wood || 0) - deduct;
            remainingToDeduct -= deduct;
            if (remainingToDeduct <= 0) break;
          }
        }
      }

      return true;
    }
    return false;
  },

  settlementName: 'GOLDHOF',
  setSettlementName: (name) => set({ settlementName: name }),
  influence: STARTING_INFLUENCE,
  royalFavor: STARTING_ROYAL_FAVOR,

  activeCorrespondence: null,
  dismissCorrespondence: () => set({ activeCorrespondence: null }),

  pendingJobs: [],
  addPendingJob: (job) => {
    set((state) => {
      const exists = state.pendingJobs.some(
        (j) =>
          j.type === job.type &&
          j.targetPosition?.[0] === job.targetPosition?.[0] &&
          j.targetPosition?.[1] === job.targetPosition?.[1]
      );
      if (exists) return state;
      return { pendingJobs: [...state.pendingJobs, job] };
    });
  },

  removePendingJob: (jobId) => {
    set((state) => ({
      pendingJobs: state.pendingJobs.filter((j) => j.id !== jobId),
    }));
  },

  activeTreeHits: [],
  registerTreeHit: (x: number, z: number, intensity = 1.0) => {
    const now = performance.now() / 1000;
    set((state) => {
      const freshHits = state.activeTreeHits.filter((h) => now - h.hitTime < 2.5);
      return {
        activeTreeHits: [
          ...freshHits,
          { id: `${x.toFixed(2)}_${z.toFixed(2)}_${now.toFixed(3)}`, x, z, hitTime: now, intensity },
        ].slice(-8),
      };
    });
  },

  fallingTrees: [],
  registerTreeFall: (x: number, z: number, treeType = 'oak', fallAngle = Math.random() * Math.PI * 2) => {
    const now = performance.now() / 1000;
    set((state) => {
      const freshFalling = state.fallingTrees.filter((f) => now - f.startTime < 3.0);
      return {
        fallingTrees: [
          ...freshFalling,
          { id: `fall_${x}_${z}_${now}`, x, z, startTime: now, fallAngle, treeType },
        ],
      };
    });
  },

  assignWorkerToBuilding: (buildingId: string) => {
    const building = world.entities.find((e) => e.id === buildingId);
    if (!building || !building.isBuilding || !building.buildingType) return false;

    const { playerRegionId } = get();
    if (building.factionId && building.factionId !== 'player') return false;
    if (building.regionId !== undefined && building.regionId !== playerRegionId) return false;

    const blueprint = BUILDING_BLUEPRINTS[building.buildingType];
    const maxSlots = building.workerSlots ?? blueprint?.workSlots ?? 1;
    const currentWorkers = building.assignedWorkers || [];

    if (currentWorkers.length >= maxSlots) {
      return false;
    }

    const availablePeasant = Array.from(characterEntities).find(
      (c) =>
        c.characterClass === 'peasant' &&
        !c.workBuildingId &&
        !c.isLevy &&
        (c.factionId === 'player' || c.factionId === undefined) &&
        (c.regionId === playerRegionId || c.regionId === undefined)
    );

    if (!availablePeasant) {
      return false;
    }

    if (building.wage === undefined) {
      building.wage = blueprint?.defaultWage ?? 2;
    }

    assignWorkerHelper(building, availablePeasant, get().time.tick || 0);

    get().addChronicleEvent({
      title: 'Нове призначення',
      description: `${availablePeasant.name} призначений робітником у ${building.name}.`,
      type: 'info',
    });

    set((state) => ({ ...state }));
    return true;
  },

  removeWorkerFromBuilding: (buildingId: string, workerId: string) => {
    const building = world.entities.find((e) => e.id === buildingId);
    const worker = world.entities.find((e) => e.id === workerId);
    if (building && worker) {
      dismissWorkerHelper(building, worker, get().time.tick || 0);
      get().addChronicleEvent({
        title: 'Звільнення з роботи',
        description: `${worker.name} більше не працює у ${building?.name || 'споруді'}.`,
        type: 'info',
      });
    }
    set((state) => ({ ...state }));
  },

  assignLordToBuilding: (buildingId: string, lordId: string | null) => {
    const building = world.entities.find((e) => e.id === buildingId);
    if (!building) return;

    const { playerRegionId } = get();
    if (building.factionId && building.factionId !== 'player') return;
    if (building.regionId !== undefined && building.regionId !== playerRegionId) return;

    if (building.assignedLordId && building.assignedLordId !== lordId) {
      const oldLord = world.entities.find((e) => e.id === building.assignedLordId);
      if (oldLord) {
        oldLord.currentJob = { id: `idle-${oldLord.id}`, type: 'idle', progress: 0, totalWork: 0 };
      }
    }

    building.assignedLordId = lordId || undefined;

    if (lordId) {
      const lord = world.entities.find((e) => e.id === lordId);
      if (lord) {
        if (building.gridPosition) {
          lord.currentJob = {
            id: `supervise-${lord.id}`,
            type: 'work_at_building',
            targetBuildingId: buildingId,
            targetPosition: building.gridPosition,
            progress: 0,
            totalWork: 100,
          };
        }
        lord.speechBubble = {
          text: `Наглядаю за виробництвом: ${building.name}`,
          expiresAtTick: (get().time.tick || 0) + 35,
          type: 'work',
        };

        get().addChronicleEvent({
          title: 'Шляхетний нагляд',
          description: `${lord.name} призначений наглядачем у ${building.name}. Продуктивність зросла!`,
          type: 'success',
        });
      }
    }

    set((state) => ({ ...state }));
  },

  setBuildingWage: (buildingId: string, wage: number) => {
    const building = world.entities.find((e) => e.id === buildingId);
    if (building) {
      building.wage = Math.max(MIN_BUILDING_WAGE, Math.min(MAX_BUILDING_WAGE, wage));
      set((state) => ({ ...state }));
    }
  },

  callLevyMilitia: (lordId: string) => {
    const lord = world.entities.find((e) => e.id === lordId);
    if (!lord) return;

    const existingMilitia = Array.from(characterEntities).filter(
      (c) => c.isLevy && c.commandingLordId === lordId
    );

    const tick = get().time.tick || 0;

    if (existingMilitia.length > 0) {
      for (const levy of existingMilitia) {
        levy.isLevy = false;
        levy.commandingLordId = undefined;
        levy.speechBubble = {
          text: 'Ополчення розпущено, повертаюсь до мирного життя',
          expiresAtTick: tick + 30,
          type: 'work',
        };
      }
      lord.speechBubble = {
        text: 'Ополчення розпущено.',
        expiresAtTick: tick + 25,
        type: 'alert',
      };
      get().addChronicleEvent({
        title: 'Ополчення розпущено',
        description: `${lord.name} розпустив селянське ополчення.`,
        type: 'info',
      });
    } else {
      const freePeasants = Array.from(characterEntities)
        .filter((c) => c.characterClass === 'peasant' && !c.isLevy)
        .slice(0, 3);

      if (freePeasants.length === 0) {
        lord.speechBubble = {
          text: 'Немає вільних селян для ополчення!',
          expiresAtTick: tick + 25,
          type: 'alert',
        };
        return;
      }

      for (const peasant of freePeasants) {
        peasant.isLevy = true;
        peasant.commandingLordId = lordId;
        peasant.speechBubble = {
          text: 'Стаю під стяги мого Лорда!',
          expiresAtTick: tick + 35,
          type: 'alert',
        };
        if (!peasant.thoughts) peasant.thoughts = [];
        peasant.thoughts = peasant.thoughts.filter((t) => t.id !== 'levy');
        peasant.thoughts.push({
          id: 'levy',
          text: 'Скликаний до ополчення (-5)',
          modifier: -5,
          durationTicks: 1500,
        });
      }

      lord.speechBubble = {
        text: 'До зброї, селяни! Захистимо наш трон!',
        expiresAtTick: tick + 40,
        type: 'alert',
      };

      get().addChronicleEvent({
        title: 'Скликано ополчення!',
        description: `${lord.name} зібрав загін із ${freePeasants.length} селян-ополченців.`,
        type: 'warning',
      });
    }

    set((state) => ({ ...state }));
  },

  lordPreach: (lordId: string) => {
    const lord = world.entities.find((e) => e.id === lordId);
    if (!lord) return;

    const tick = get().time.tick || 0;
    lord.speechBubble = {
      text: 'Покора Лорду — благословення Небес!',
      expiresAtTick: tick + 35,
      type: 'mood',
    };

    let blessedCount = 0;
    for (const peasant of characterEntities) {
      if (peasant.characterClass === 'peasant' && peasant.needs) {
        blessedCount++;
        peasant.needs.mood = Math.min(100, peasant.needs.mood + 15);
        if (!peasant.thoughts) peasant.thoughts = [];
        peasant.thoughts = peasant.thoughts.filter((t) => t.id !== 'preach');
        peasant.thoughts.push({
          id: 'preach',
          text: 'Натхненний проповіддю Лорда (+15)',
          modifier: 15,
          durationTicks: 1200,
        });
        peasant.speechBubble = {
          text: 'Слава Господу і нашому королю!',
          expiresAtTick: tick + 30,
          type: 'mood',
        };
      }
    }

    get().addChronicleEvent({
      title: 'Проповідь Лорда',
      description: `${lord.name} провів проповідь. Дух селян зміцнився!`,
      type: 'success',
    });

    set((state) => ({ ...state }));
  },

  chronicle: [
    {
      id: 'init-1',
      timestamp: new Date().toLocaleTimeString(),
      gameDay: 1,
      gameHour: 7,
      title: 'Заснування Трону з Грязі',
      description: 'Король Болеслав прибув на болотисті землі разом зі шляхтою та першими поселенцями.',
      type: 'info',
    },
  ],

  addChronicleEvent: (event) => {
    const { time } = get();
    const newEvent: ChronicleEvent = {
      ...event,
      id: `event-${Date.now()}-${Math.random().toString(36).substring(2, 5)}`,
      timestamp: new Date().toLocaleTimeString(),
      gameDay: time.day,
      gameHour: time.hour,
    };
    set((state) => ({
      chronicle: [newEvent, ...state.chronicle].slice(0, 50),
    }));
  },

  buildingVersion: 0,
  incrementBuildingVersion: () => {
    if (!pendingBuildingVersion) {
      pendingBuildingVersion = true;
      queueMicrotask(() => {
        pendingBuildingVersion = false;
        set((state) => ({ buildingVersion: state.buildingVersion + 1 }));
      });
    }
  },

  foliageVersion: 0,
  incrementFoliageVersion: () => {
    if (foliageDebounceTimer) {
      clearTimeout(foliageDebounceTimer);
    }
    foliageDebounceTimer = setTimeout(() => {
      foliageDebounceTimer = null;
      set((state) => ({ foliageVersion: state.foliageVersion + 1 }));
    }, 800);
  },

  regions: JSON.parse(JSON.stringify(DEFAULT_REGIONS)),
  playerRegionId: 0,
  playerSpawnPoint: [52, 52],
  botCount: 2,
  updateRegionStats: (regionId, partial) => {
    set((state) => ({
      regions: state.regions.map((r) => (r.id === regionId ? { ...r, ...partial } : r)),
    }));
  },

  immigrationProgress: 0,
  setImmigrationProgress: (val) => set({ immigrationProgress: Math.max(0, Math.min(100, val)) }),

  resourceDeposits: INITIAL_RESOURCE_DEPOSITS,
  updateResourceDeposit: (depositId, partial) => {
    set((state) => ({
      resourceDeposits: state.resourceDeposits.map((d) =>
        d.id === depositId ? { ...d, ...partial } : d
      ),
    }));
    const entity = world.entities.find((e) => e.id === depositId);
    if (entity) {
      if (partial.currentAmount !== undefined) entity.resourceAmount = partial.currentAmount;
      if (partial.maxAmount !== undefined) entity.maxResourceAmount = partial.maxAmount;
    }
  },

  isInitialized: false,
  initWorld: (grid: GridMap, config?: WorldSetupConfig) => {
    const result = initializeWorldEntities(grid, config, get().playerRegionId, get().botCount);

    set({
      isInitialized: true,
      selectedEntityId: null,
      playerRegionId: result.playerRegionId,
      playerSpawnPoint: result.playerSpawnPoint,
      botCount: result.botCount,
      regions: result.regions,
      settlementName: result.settlementName,
      cameraFocusTarget: result.cameraFocusTarget,
      isStrategicMapOpen: false,
      resourceDeposits: result.resourceDeposits,
    });
    get().incrementBuildingVersion();
  },

  resetWorld: (grid: GridMap, config?: WorldSetupConfig) => {
    grid.generate(Date.now() % 100000 + Math.random() * 500);

    set({
      resources: { ...INITIAL_RESOURCES },
      time: {
        tick: 0,
        day: 1,
        hour: 7,
        minute: 0,
        season: 'Spring',
        weather: 'clear',
        targetWeather: 'clear',
        nextWeather: 'clear',
        isWeatherLocked: false,
        rainIntensity: 0,
        stormIntensity: 0,
        snowIntensity: 0,
        snowAccumulation: 0,
        lightningFlash: 0,
        speedMultiplier: 1,
        isPaused: false,
      },
      influence: STARTING_INFLUENCE,
      royalFavor: STARTING_ROYAL_FAVOR,
      pendingJobs: [],
      activeTool: 'select',
      activeBuildType: null,
      activeMenuTab: null,
      activeCorrespondence: null,
      chronicle: [
        {
          id: 'init-1',
          timestamp: new Date().toLocaleTimeString(),
          gameDay: 1,
          gameHour: 7,
          title: 'Заснування Трону з Грязі',
          description: 'Король Болеслав прибув на болотисті землі разом зі шляхтою та першими поселенцями.',
          type: 'info',
        },
      ],
      immigrationProgress: 0,
      isLordsBarOpen: false,
      isInitialized: false,
      isStrategicMapOpen: false,
    });

    get().initWorld(grid, config);
  },
});
