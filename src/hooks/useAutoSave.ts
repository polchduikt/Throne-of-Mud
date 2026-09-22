import { useEffect } from 'react';
import { GridMap } from '../engine/grid/GridMap';
import { useGameStore } from '../store/useGameStore';
import { saveGameToIndexedDB } from '../services/storage/saveManager';

const AUTO_SAVE_INTERVAL_MS = 120000;

export function useAutoSave(grid: GridMap) {
  const gameMode = useGameStore((s) => s.gameMode);

  useEffect(() => {
    const handleSaveOnExit = () => {
      if (useGameStore.getState().gameMode === 'playing') {
        saveGameToIndexedDB(grid);
      }
    };

    const handleVisibilityChange = () => {
      if (document.visibilityState === 'hidden' && useGameStore.getState().gameMode === 'playing') {
        saveGameToIndexedDB(grid);
      }
    };

    window.addEventListener('beforeunload', handleSaveOnExit);
    window.addEventListener('pagehide', handleSaveOnExit);
    document.addEventListener('visibilitychange', handleVisibilityChange);

    return () => {
      window.removeEventListener('beforeunload', handleSaveOnExit);
      window.removeEventListener('pagehide', handleSaveOnExit);
      document.removeEventListener('visibilitychange', handleVisibilityChange);
    };
  }, [grid]);

  useEffect(() => {
    if (gameMode !== 'playing') return;

    const interval = setInterval(() => {
      if (!useGameStore.getState().time.isPaused) {
        saveGameToIndexedDB(grid);
      }
    }, AUTO_SAVE_INTERVAL_MS);

    return () => clearInterval(interval);
  }, [grid, gameMode]);
}
