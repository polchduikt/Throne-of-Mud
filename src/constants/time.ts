import type { SeasonType } from '../types/game';

export const TICKS_PER_MINUTE = 6;
export const MINUTES_PER_HOUR = 60;
export const HOURS_PER_DAY = 24;
export const MINUTES_PER_DAY = HOURS_PER_DAY * MINUTES_PER_HOUR;
export const DAY_START_HOUR = 7;
export const DAY_START_MINUTE_OFFSET = DAY_START_HOUR * MINUTES_PER_HOUR;
export const DAYS_PER_SEASON = 10;

export const SEASON_BASE_DAYS: Record<SeasonType, number> = {
  Spring: 1,
  Summer: 11,
  Autumn: 21,
  Winter: 31,
};

export function timeToTicks(day: number, hour: number, minute: number): number {
  const totalMinutes = (day - 1) * MINUTES_PER_DAY + (hour * MINUTES_PER_HOUR + minute) - DAY_START_MINUTE_OFFSET;
  return Math.max(0, totalMinutes * TICKS_PER_MINUTE);
}

export function ticksToTime(tick: number) {
  const totalMinutes = Math.floor(tick / TICKS_PER_MINUTE) + DAY_START_MINUTE_OFFSET;
  const day = Math.floor(totalMinutes / MINUTES_PER_DAY) + 1;
  const minuteOfDay = totalMinutes % MINUTES_PER_DAY;
  const hour = Math.floor(minuteOfDay / MINUTES_PER_HOUR);
  const minute = minuteOfDay % MINUTES_PER_HOUR;
  return { day, hour, minute };
}
