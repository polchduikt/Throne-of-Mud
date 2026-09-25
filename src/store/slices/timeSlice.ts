import type { StateCreator } from 'zustand';
import type { SeasonType, WeatherType } from '../../types/game';
import { world } from '../../engine/ecs/world';
import {
  TICKS_PER_MINUTE,
  MINUTES_PER_HOUR,
  HOURS_PER_DAY,
  MINUTES_PER_DAY,
  DAY_START_HOUR,
  SEASON_BASE_DAYS,
  DAYS_PER_SEASON,
  timeToTicks,
} from '../../constants/time';
import type { GameState, TimeSlice } from '../types';

export type { TimeSlice };

export const createTimeSlice: StateCreator<GameState, [], [], TimeSlice> = (set) => ({
  time: {
    tick: 0,
    day: 1,
    hour: DAY_START_HOUR,
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

  isWeatherDebugOpen: false,
  setIsWeatherDebugOpen: (open) => set({ isWeatherDebugOpen: open }),

  setSpeedMultiplier: (speed) => {
    set((state) => ({
      time: {
        ...state.time,
        speedMultiplier: speed,
        isPaused: speed === 0,
      },
    }));
  },

  togglePause: () => {
    set((state) => ({
      time: {
        ...state.time,
        isPaused: !state.time.isPaused,
      },
    }));
  },

  setSeason: (newSeason: SeasonType) => {
    set((state) => {
      const baseDay = SEASON_BASE_DAYS[newSeason];
      const currentDayInSeason = ((state.time.day - 1) % DAYS_PER_SEASON);
      const newDay = baseDay + currentDayInSeason;
      const newTick = timeToTicks(newDay, state.time.hour, state.time.minute);

      let newTargetWeather = state.time.targetWeather || state.time.weather;
      if (newSeason === 'Winter' && (newTargetWeather === 'rain' || newTargetWeather === 'storm')) {
        newTargetWeather = 'snow';
      } else if (newSeason !== 'Winter' && newTargetWeather === 'snow') {
        newTargetWeather = 'clear';
      }

      let nextDeposits = state.resourceDeposits;
      if (newSeason === 'Spring' && nextDeposits) {
        nextDeposits = nextDeposits.map((dep) => {
          if (dep.seasonalRenewal) {
            const entity = world.entities.find((e) => e.id === dep.id);
            if (entity) entity.resourceAmount = dep.maxAmount;
            return { ...dep, currentAmount: dep.maxAmount };
          }
          return dep;
        });
      }

      return {
        time: {
          ...state.time,
          tick: newTick,
          day: newDay,
          season: newSeason,
          targetWeather: newTargetWeather,
        },
        resourceDeposits: nextDeposits,
        foliageVersion: state.foliageVersion + 1,
      };
    });
  },

  setWeather: (newWeather: WeatherType, locked: boolean = true) => {
    set((state) => ({
      time: {
        ...state.time,
        targetWeather: newWeather,
        isWeatherLocked: locked,
        lightningFlash: newWeather === 'storm' ? 1.0 : 0,
      },
    }));
  },

  setWeatherLocked: (locked: boolean) => {
    set((state) => ({
      time: {
        ...state.time,
        isWeatherLocked: locked,
      },
    }));
  },

  triggerLightning: () => {
    set((state) => ({
      time: {
        ...state.time,
        lightningFlash: 1.0,
      },
    }));
  },

  setSnowAccumulation: (val: number) => {
    const clamped = Math.max(0, Math.min(1, val));
    set((state) => ({
      time: {
        ...state.time,
        snowAccumulation: clamped,
      },
    }));
  },

  setTimeOfDay: (targetHour: number) => {
    set((state) => {
      const h = Math.max(0, Math.min(HOURS_PER_DAY - 1, targetHour));
      const newTick = timeToTicks(state.time.day, h, 0);
      return {
        time: {
          ...state.time,
          tick: newTick,
          hour: h,
          minute: 0,
        },
      };
    });
  },

  advanceTick: () => {
    set((state) => {
      const nextTick = state.time.tick + 1;
      const totalMinutes = Math.floor(nextTick / TICKS_PER_MINUTE);
      const hour = (DAY_START_HOUR + Math.floor(totalMinutes / MINUTES_PER_HOUR)) % HOURS_PER_DAY;
      const minute = totalMinutes % MINUTES_PER_HOUR;
      const day = 1 + Math.floor((DAY_START_HOUR * MINUTES_PER_HOUR + totalMinutes) / MINUTES_PER_DAY);

      const seasons: SeasonType[] = ['Spring', 'Summer', 'Autumn', 'Winter'];
      const season = seasons[Math.floor((day - 1) / DAYS_PER_SEASON) % seasons.length];

      let nextDeposits = state.resourceDeposits;
      if (season === 'Spring' && state.time.season !== 'Spring' && nextDeposits) {
        nextDeposits = nextDeposits.map((dep) => {
          if (dep.seasonalRenewal) {
            const entity = world.entities.find((e) => e.id === dep.id);
            if (entity) {
              entity.resourceAmount = dep.maxAmount;
            }
            return { ...dep, currentAmount: dep.maxAmount };
          }
          return dep;
        });
      }

      let targetWeather = state.time.targetWeather || state.time.weather || 'clear';
      let nextWeather = state.time.nextWeather || 'clear';

      if (!state.time.isWeatherLocked) {
        if (nextTick % 1080 === 0) {
          targetWeather = nextWeather;
          const rand = Math.random();
          if (season === 'Winter') {
            nextWeather = rand < 0.65 ? 'snow' : 'clear';
          } else if (season === 'Summer') {
            nextWeather = rand < 0.70 ? 'clear' : rand < 0.88 ? 'rain' : 'storm';
          } else if (season === 'Autumn') {
            nextWeather = rand < 0.40 ? 'clear' : rand < 0.82 ? 'rain' : 'storm';
          } else {
            nextWeather = rand < 0.60 ? 'clear' : rand < 0.88 ? 'rain' : 'storm';
          }
        }
      }

      const targetRain = (targetWeather === 'rain' ? 1.0 : targetWeather === 'storm' ? 0.85 : 0.0);
      const targetStorm = (targetWeather === 'storm' ? 1.0 : 0.0);
      const targetSnow = (targetWeather === 'snow' ? 1.0 : 0.0);

      let curRain = state.time.rainIntensity ?? (state.time.weather === 'rain' ? 1 : 0);
      let curStorm = state.time.stormIntensity ?? (state.time.weather === 'storm' ? 1 : 0);
      let curSnow = state.time.snowIntensity ?? (state.time.weather === 'snow' ? 1 : 0);

      if (curRain < targetRain) {
        curRain = Math.min(targetRain, curRain + 0.0035);
      } else if (curRain > targetRain) {
        curRain = Math.max(targetRain, curRain - 0.0025);
      }

      if (curStorm < targetStorm) {
        curStorm = Math.min(targetStorm, curStorm + 0.0030);
      } else if (curStorm > targetStorm) {
        curStorm = Math.max(targetStorm, curStorm - 0.0025);
      }

      if (curSnow < targetSnow) {
        curSnow = Math.min(targetSnow, curSnow + 0.0035);
      } else if (curSnow > targetSnow) {
        curSnow = Math.max(targetSnow, curSnow - 0.0025);
      }

      let currentWeather: WeatherType = 'clear';
      if (curRain > 0.08) {
        currentWeather = curStorm > 0.40 ? 'storm' : 'rain';
      } else if (curSnow > 0.08) {
        currentWeather = 'snow';
      } else {
        currentWeather = targetWeather === 'clear' ? 'clear' : state.time.weather;
      }

      let flash = state.time.lightningFlash || 0;
      if (curStorm > 0.45) {
        if (Math.random() < 0.008 * curStorm) {
          flash = 1.0;
        } else if (flash > 0) {
          flash = Math.max(0, flash - 0.08);
        }
      } else if (flash > 0) {
        flash = Math.max(0, flash - 0.08);
      }

      let curSnowAcc = state.time.snowAccumulation || 0;
      if (season === 'Winter') {
        const dayInWinter = ((day - 1) % DAYS_PER_SEASON);
        const targetWinterSnow = Math.min(1.0, (dayInWinter + 1) / (DAYS_PER_SEASON * 0.7));
        const snowRate = curSnow > 0.1 ? 0.0003 : 0.00008;
        curSnowAcc = Math.min(targetWinterSnow, curSnowAcc + snowRate);
      } else if (season === 'Spring') {
        const dayInSpring = ((day - 1) % DAYS_PER_SEASON);
        const targetSpringSnow = Math.max(0.0, 1.0 - (dayInSpring + 1) / (DAYS_PER_SEASON * 0.4));
        curSnowAcc = Math.max(targetSpringSnow, curSnowAcc - 0.0002);
      } else {
        curSnowAcc = Math.max(0.0, curSnowAcc - 0.0005);
      }

      return {
        time: {
          ...state.time,
          tick: nextTick,
          day,
          hour,
          minute,
          season,
          weather: currentWeather,
          targetWeather,
          nextWeather,
          rainIntensity: curRain,
          stormIntensity: curStorm,
          snowIntensity: curSnow,
          snowAccumulation: curSnowAcc,
          lightningFlash: flash,
        },
        resourceDeposits: nextDeposits,
      };
    });
  },
});
