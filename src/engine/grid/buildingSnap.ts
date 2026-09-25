import { GridMap } from './GridMap';
import { buildingEntities } from '../ecs/world';
import type { BuildingType } from '../../types/game';
import { distance2D } from '../../utils/mathUtils';

export const DEFAULT_BUILDING_SNAP_THRESHOLD = 2.4;

export function getSnappedPlacementCoords(
  rawX: number,
  rawZ: number,
  width: number,
  height: number,
  buildingType: BuildingType,
  grid: GridMap
): [number, number] {
  void buildingType;
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
