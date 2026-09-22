import { useCallback } from 'react';
import { audioManager } from '../engine/audio/AudioManager';

export function useUIAudio() {
  const playClick = useCallback(() => {
    audioManager.playUIClick();
  }, []);

  const playHover = useCallback(() => {
    audioManager.playUIHover();
  }, []);

  const playError = useCallback(() => {
    audioManager.playUIError();
  }, []);

  const playPanelOpen = useCallback(() => {
    audioManager.playUIPanelOpen();
  }, []);

  const playPanelClose = useCallback(() => {
    audioManager.playUIPanelClose();
  }, []);

  const playSuccess = useCallback(() => {
    audioManager.playUISuccess();
  }, []);

  const playBuildingThud = useCallback(() => {
    audioManager.playBuildingThud2D();
  }, []);

  return {
    playClick,
    playHover,
    playError,
    playPanelOpen,
    playPanelClose,
    playSuccess,
    playBuildingThud,
  };
}
