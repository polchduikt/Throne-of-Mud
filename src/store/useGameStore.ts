import { create } from 'zustand';
import { type TimeSlice, createTimeSlice } from './slices/timeSlice';
import { type AudioSlice, createAudioSlice } from './slices/audioSlice';
import { type UISlice, createUISlice } from './slices/uiSlice';
import { type SettlementSlice, createSettlementSlice } from './slices/settlementSlice';

export type GameState = TimeSlice & AudioSlice & UISlice & SettlementSlice;

export { DEFAULT_REGIONS, PRESET_BOT_LORDS } from '../constants/world';

export const useGameStore = create<GameState>((...args) => ({
  ...createTimeSlice(...args),
  ...createAudioSlice(...args),
  ...createUISlice(...args),
  ...createSettlementSlice(...args),
}));
