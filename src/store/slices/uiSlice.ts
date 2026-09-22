import type { StateCreator } from 'zustand';
import type { BuildingType, ToolType } from '../../types/game';
import type { GameState } from '../useGameStore';

export interface UISlice {
  selectedEntityId: string | null;
  setSelectedEntityId: (id: string | null) => void;
  activeBuildType: BuildingType | null;
  setActiveBuildType: (type: BuildingType | null) => void;
  activeTool: ToolType;
  setActiveTool: (tool: ToolType) => void;
  roadEraseMode: boolean;
  setRoadEraseMode: (v: boolean) => void;
  hoveredTile: [number, number] | null;
  setHoveredTile: (tile: [number, number] | null) => void;

  previewAnimation: { entityId: string; anim: 'idle' | 'walk' | 'attack' | 'chop'; expiresAt: number } | null;
  triggerAnimation: (entityId: string, anim: 'idle' | 'walk' | 'attack' | 'chop', durationMs?: number) => void;

  cameraFocusTarget: [number, number] | null;
  setCameraFocusTarget: (pos: [number, number] | null) => void;
  cameraZoomTarget: number | null;
  setCameraZoomTarget: (zoom: number | null) => void;
  cameraAngleTarget: number | null;
  setCameraAngleTarget: (angle: number | null) => void;
  isStrategicView: boolean;
  setIsStrategicView: (val: boolean) => void;

  activeMenuTab: 'buildings' | 'military' | 'trade' | 'codex' | 'settings' | null;
  setActiveMenuTab: (tab: 'buildings' | 'military' | 'trade' | 'codex' | 'settings' | null) => void;

  isStrategicMapOpen: boolean;
  setIsStrategicMapOpen: (open: boolean) => void;
  focusOnRegion: (regionId: number) => void;

  isLordsBarOpen: boolean;
  toggleLordsBar: () => void;

  gameMode: 'menu' | 'playing';
  setGameMode: (mode: 'menu' | 'playing') => void;
  saveNotification: string | null;
  setSaveNotification: (msg: string | null) => void;
}

export const createUISlice: StateCreator<GameState, [], [], UISlice> = (set, get) => ({
  selectedEntityId: null,
  setSelectedEntityId: (id) => set({ selectedEntityId: id }),

  activeBuildType: null,
  setActiveBuildType: (type) => set({ activeBuildType: type, activeTool: type ? 'build' : 'select' }),

  activeTool: 'select',
  setActiveTool: (tool) => {
    const update: Record<string, unknown> = {
      activeTool: tool,
      activeBuildType: tool === 'build' ? get().activeBuildType : null,
    };
    if (tool !== 'road') update.roadEraseMode = false;
    set(update as any);
  },

  roadEraseMode: false,
  setRoadEraseMode: (v) => set({ roadEraseMode: v }),

  hoveredTile: null,
  setHoveredTile: (tile) => {
    const prev = get().hoveredTile;
    if (!tile && !prev) return;
    if (tile && prev && tile[0] === prev[0] && tile[1] === prev[1]) return;
    set({ hoveredTile: tile });
  },

  previewAnimation: null,
  triggerAnimation: (entityId, anim, durationMs = 3500) => {
    set({
      previewAnimation: {
        entityId,
        anim,
        expiresAt: Date.now() + durationMs,
      },
    });
  },

  cameraFocusTarget: null,
  setCameraFocusTarget: (pos) => set({ cameraFocusTarget: pos }),
  cameraZoomTarget: null,
  setCameraZoomTarget: (zoom) => set({ cameraZoomTarget: zoom }),
  cameraAngleTarget: null,
  setCameraAngleTarget: (angle) => set({ cameraAngleTarget: angle }),
  isStrategicView: false,
  setIsStrategicView: (val) => set({ isStrategicView: val }),

  activeMenuTab: null,
  setActiveMenuTab: (tab) => {
    set({ activeMenuTab: tab });
    if (tab === 'buildings') {
      get().setActiveTool('build');
      if (!get().activeBuildType) {
        get().setActiveBuildType('peasant_house');
      }
    } else if (tab === null) {
      if (get().activeTool === 'build') {
        get().setActiveTool('select');
      }
    }
  },

  isStrategicMapOpen: false,
  setIsStrategicMapOpen: (open) => set({ isStrategicMapOpen: open }),
  focusOnRegion: (regionId) => {
    const region = get().regions.find((r) => r.id === regionId);
    if (region) {
      const target = region.campPosition || region.center;
      set({
        cameraFocusTarget: [target[0], target[1]],
        isStrategicMapOpen: false,
      });
    }
  },

  isLordsBarOpen: false,
  toggleLordsBar: () => set((state) => ({ isLordsBarOpen: !state.isLordsBarOpen })),

  gameMode: 'menu',
  setGameMode: (mode) => set({ gameMode: mode }),
  saveNotification: null,
  setSaveNotification: (msg) => {
    set({ saveNotification: msg });
    if (msg) {
      setTimeout(() => {
        if (get().saveNotification === msg) {
          set({ saveNotification: null });
        }
      }, 3500);
    }
  },
});
