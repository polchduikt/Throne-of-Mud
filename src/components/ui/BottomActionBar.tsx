import React, { useCallback } from 'react';
import { useGameStore } from '../../store/useGameStore';
import { GridMap } from '../../engine/grid/GridMap';
import { BuildingsMenuModal } from './bottom-bar/BuildingsMenuModal';
import { TimeControlsWidget } from './bottom-bar/TimeControlsWidget';
import { ActionButtonsBar } from './bottom-bar/ActionButtonsBar';
import { SettingsModal } from './settings/SettingsModal';
import { WeatherDebugModal } from './WeatherDebugModal';
import { audioManager } from '../../engine/audio/AudioManager';

interface BottomActionBarProps {
  grid: GridMap;
}

export const BottomActionBar: React.FC<BottomActionBarProps> = React.memo(({ grid }) => {
  const activeTool = useGameStore((s) => s.activeTool);
  const setActiveTool = useGameStore((s) => s.setActiveTool);
  const activeMenuTab = useGameStore((s) => s.activeMenuTab);
  const setActiveMenuTab = useGameStore((s) => s.setActiveMenuTab);

  const handleToggleTab = useCallback(
    (tabName: 'buildings' | 'military' | 'trade' | 'codex' | 'settings' | 'roads') => {
      if (tabName === 'roads') {
        setActiveTool(activeTool === 'road' ? 'select' : 'road');
        setActiveMenuTab(null);
        return;
      }

      if (activeMenuTab === tabName) {
        audioManager.playUIPanelClose();
        setActiveMenuTab(null);
      } else {
        audioManager.playUIPanelOpen();
        setActiveMenuTab(tabName);
      }
    },
    [activeTool, activeMenuTab, setActiveTool, setActiveMenuTab]
  );

  const handleCloseBuildingsMenu = useCallback(() => {
    audioManager.playUIPanelClose();
    setActiveMenuTab(null);
  }, [setActiveMenuTab]);

  const handleCloseSettings = useCallback(() => {
    audioManager.playUIPanelClose();
    setActiveMenuTab(null);
  }, [setActiveMenuTab]);

  return (
    <>
      {activeMenuTab === 'buildings' && (
        <BuildingsMenuModal onClose={handleCloseBuildingsMenu} />
      )}

      {activeMenuTab === 'settings' && (
        <SettingsModal grid={grid} onClose={handleCloseSettings} />
      )}

      <ActionButtonsBar onToggleTab={handleToggleTab} />
      <TimeControlsWidget />
      <WeatherDebugModal />
    </>
  );
});

BottomActionBar.displayName = 'BottomActionBar';
