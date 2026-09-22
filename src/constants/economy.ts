import type { ResourceInventory } from '../types/game';

export const INITIAL_RESOURCES: ResourceInventory = {
  gold: 50,
  wood: 15,
  stone: 0,
  wheat: 0,
  flour: 0,
  bread: 20,
  ale: 10,
  weapons: 0,
  fish: 0,
  berries: 0,
  iron: 0,
  clay: 0,
  salt: 0,
};

export const STARTING_INFLUENCE = 2600;
export const STARTING_ROYAL_FAVOR = 15;

export const MIN_BUILDING_WAGE = 0;
export const MAX_BUILDING_WAGE = 20;

export const DEFAULT_SPEECH_BUBBLE_TICKS = 35;
export const EMPLOYED_THOUGHT_TICKS = 3000;
export const DISMISSED_THOUGHT_TICKS = 1000;

export const BASE_STORAGE_CAPACITY = 100;

