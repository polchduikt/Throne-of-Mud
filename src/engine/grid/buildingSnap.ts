import { GridMap } from './GridMap';
import { buildingEntities } from '../ecs/world';
import type { BuildingType, ResourceDeposit } from '../../types/game';
import { distance2D } from '../../utils/mathUtils';

export const DEFAULT_BUILDING_SNAP_THRESHOLD = 2.4;
export const DEPOSIT_BUILDING_SNAP_THRESHOLD = 5.2;

const DEPOSIT_TARGET_MAP: Partial<Record<BuildingType, string>> = {
  iron_mine: 'iron',
  stone_quarry: 'stone',
  clay_pit: 'clay',
  salt_works: 'salt',
};

export function getSnappedPlacementCoords(
  rawX: number,
  rawZ: number,
  width: number,
  height: number,
  buildingType: BuildingType,
  grid: GridMap,
  resourceDeposits?: ResourceDeposit[]
): [number, number] {

  const targetDepositType = DEPOSIT_TARGET_MAP[buildingType];
  if (targetDepositType && resourceDeposits && resourceDeposits.length > 0) {
    let closestDepDist = DEPOSIT_BUILDING_SNAP_THRESHOLD;
    let bestDepositSnap: [number, number] | null = null;

    for (const d of resourceDeposits) {
      if (d.type !== targetDepositType) continue;
      const dx = d.position ? d.position[0] : (d.gridPosition ? d.gridPosition[0] + 0.5 : 0);
      const dz = d.position ? d.position[2] : (d.gridPosition ? d.gridPosition[1] + 0.5 : 0);

      const cursorCenterX = rawX + width / 2;
      const cursorCenterZ = rawZ + height / 2;
      const dist = distance2D(cursorCenterX, cursorCenterZ, dx, dz);

      if (dist < closestDepDist) {
        const snapX = Math.floor(dx - width / 2 + 0.5);
        const snapZ = Math.floor(dz - height / 2 + 0.5);
        if (snapX >= 0 && snapZ >= 0 && snapX + width <= grid.width && snapZ + height <= grid.height) {
          closestDepDist = dist;
          bestDepositSnap = [snapX, snapZ];
        }
      }
    }

    if (bestDepositSnap) {
      return bestDepositSnap;
    }
  }

  const roundX = Math.round(rawX);
  const roundZ = Math.round(rawZ);
  let closestDist = DEFAULT_BUILDING_SNAP_THRESHOLD;
  let bestSnap: [number, number] | null = null;

  for (const b of buildingEntities) {
    if (!b.isBuilding || !b.gridPosition) continue;

    const [bx, bz] = b.gridPosition;
    const bw = b.buildingWidth || width;
    const bh = b.buildingHeight || height;

    const candidates: [number, number][] = [
      [bx + bw, bz],
      [bx - width, bz],
      [bx, bz + bh],
      [bx, bz - height],
    ];

    for (const [cx, cz] of candidates) {
      if (cx < 0 || cz < 0 || cx + width > grid.width || cz + height > grid.height) continue;
      const dist = distance2D(rawX, rawZ, cx, cz);
      if (dist < closestDist) {
        if (grid.canBuildAt(cx, cz, width, height)) {
          closestDist = dist;
          bestSnap = [cx, cz];
        }
      }
    }
  }

  if (bestSnap) {
    return [Math.round(bestSnap[0]), Math.round(bestSnap[1])];
  }

  return [roundX, roundZ];
}

