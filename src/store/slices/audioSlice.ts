import type { StateCreator } from 'zustand';
import { audioManager } from '../../engine/audio/AudioManager';
import type { SupportedLanguage } from '../../i18n/types';
import { getStoredLanguage, saveStoredLanguage } from '../../i18n';
import type { GameState } from '../useGameStore';

export interface AudioSlice {
  audioSettings: {
    masterVolume: number;
    musicVolume: number;
    ambientVolume: number;
    sfxVolume: number;
    uiVolume: number;
    isMuted: boolean;
  };
  setMasterVolume: (val: number) => void;
  setMusicVolume: (val: number) => void;
  setAmbientVolume: (val: number) => void;
  setSfxVolume: (val: number) => void;
  setUiVolume: (val: number) => void;
  toggleMute: () => void;
  setMuted: (isMuted: boolean) => void;

  language: SupportedLanguage;
  setLanguage: (lang: SupportedLanguage) => void;
}

export const createAudioSlice: StateCreator<GameState, [], [], AudioSlice> = (set) => ({
  audioSettings: audioManager.getSettings(),
  setMasterVolume: (val: number) => {
    audioManager.setMasterVolume(val);
    set((state) => ({ audioSettings: { ...state.audioSettings, masterVolume: val } }));
  },
  setMusicVolume: (val: number) => {
    audioManager.setMusicVolume(val);
    set((state) => ({ audioSettings: { ...state.audioSettings, musicVolume: val } }));
  },
  setAmbientVolume: (val: number) => {
    audioManager.setAmbientVolume(val);
    set((state) => ({ audioSettings: { ...state.audioSettings, ambientVolume: val } }));
  },
  setSfxVolume: (val: number) => {
    audioManager.setSfxVolume(val);
    set((state) => ({ audioSettings: { ...state.audioSettings, sfxVolume: val } }));
  },
  setUiVolume: (val: number) => {
    audioManager.setUiVolume(val);
    set((state) => ({ audioSettings: { ...state.audioSettings, uiVolume: val } }));
  },
  toggleMute: () => {
    const isMuted = audioManager.toggleMute();
    set((state) => ({ audioSettings: { ...state.audioSettings, isMuted } }));
  },
  setMuted: (isMuted: boolean) => {
    audioManager.setMuted(isMuted);
    set((state) => ({ audioSettings: { ...state.audioSettings, isMuted } }));
  },

  language: getStoredLanguage(),
  setLanguage: (lang: SupportedLanguage) => {
    saveStoredLanguage(lang);
    set({ language: lang });
  },
});
