import { GridMap } from './GridMap';
import type { RegionBounds } from '../pathfinding/AStar';
import type { ResourceDeposit } from '../../types/game';
import { isRoadOverlappingDeposit } from '../buildings/buildingValidation';

export type RoadBoundsFilter = RegionBounds | ((x: number, z: number) => boolean);

export function isTileInRoadBounds(x: number, z: number, bounds?: RoadBoundsFilter): boolean {
  if (!bounds) return true;
  if (typeof bounds === 'function') {
    return bounds(x, z);
  }
  return x >= bounds.minX && x <= bounds.maxX && z >= bounds.minZ && z <= bounds.maxZ;
}

export function getContinuousRoadLine(
  x0: number,
  z0: number,
  x1: number,
  z1: number,
  bounds?: RoadBoundsFilter
): [number, number][] {
  const result: [number, number][] = [];
  const visited = new Set<string>();

  const pushTile = (tx: number, tz: number) => {
    if (bounds && !isTileInRoadBounds(tx, tz, bounds)) {
      return;
    }
    const key = `${tx},${tz}`;
    if (!visited.has(key)) {
      visited.add(key);
      result.push([tx, tz]);
    }
  };

  let x = Math.round(x0);
  let z = Math.round(z0);
  const targetX = Math.round(x1);
  const targetZ = Math.round(z1);

  const dx = Math.abs(targetX - x);
  const dz = Math.abs(targetZ - z);
  const sx = targetX >= x ? 1 : -1;
  const sz = targetZ >= z ? 1 : -1;
  let err = dx - dz;

  pushTile(x, z);

  while (x !== targetX || z !== targetZ) {
    const e2 = 2 * err;
    let movedX = false;
    let movedZ = false;

    if (e2 > -dz) {
      err -= dz;
      x += sx;
      movedX = true;
    }
    if (e2 < dx) {
      err += dx;
      z += sz;
      movedZ = true;
    }

    if (movedX && movedZ) {
      if (Math.abs(err + dz) < Math.abs(err - dx)) {
        pushTile(x - sx, z);
      } else {
        pushTile(x, z - sz);
      }
    }

    pushTile(x, z);
  }

  return result;
}

export function isRoadPathValid(
  grid: GridMap,
  path: [number, number][],
  resourceDeposits?: ResourceDeposit[]
): boolean {
  if (path.length === 0) return false;
  for (const [x, z] of path) {
    const tile = grid.getTile(x, z);
    if (!tile) return false;
    if (tile.terrain === 'water') return false;
    if (tile.buildingId) return false;
    if (resourceDeposits && resourceDeposits.length > 0) {
      if (isRoadOverlappingDeposit(x, z, resourceDeposits)) {
        return false;
      }
    }
  }
  return true;
}

interface PathNode {
  x: number;
  z: number;
  g: number;
  h: number;
  f: number;
  parent?: PathNode;
}

export function getSmartRoadPath(
  grid: GridMap,
  x0: number,
  z0: number,
  x1: number,
  z1: number,
  bounds?: RoadBoundsFilter,
  resourceDeposits?: ResourceDeposit[]
): [number, number][] {
  let sx = Math.round(x0);
  let sz = Math.round(z0);
  let tx = Math.round(x1);
  let tz = Math.round(z1);

  const isBlocked = (x: number, z: number) => {
    const t = grid.getTile(x, z);
    if (!t || t.terrain === 'water' || t.buildingId) return true;
    if (resourceDeposits && isRoadOverlappingDeposit(x, z, resourceDeposits)) return true;
    return false;
  };

  const findNearestClear = (cx: number, cz: number): [number, number] | null => {
    if (!isBlocked(cx, cz)) return [cx, cz];
    const offsets = [
      [0, 1], [0, -1], [1, 0], [-1, 0],
      [1, 1], [-1, 1], [1, -1], [-1, -1],
      [0, 2], [0, -2], [2, 0], [-2, 0],
    ];
    for (const [ox, oz] of offsets) {
      const nx = cx + ox;
      const nz = cz + oz;
      if (!isBlocked(nx, nz) && isTileInRoadBounds(nx, nz, bounds)) {
        return [nx, nz];
      }
    }
    return null;
  };

  const clearStart = findNearestClear(sx, sz);
  if (!clearStart) return [];
  sx = clearStart[0];
  sz = clearStart[1];

  const clearTarget = findNearestClear(tx, tz);
  if (!clearTarget) return [];
  tx = clearTarget[0];
  tz = clearTarget[1];

  if (sx === tx && sz === tz) {
    return [[sx, sz]];
  }

  const directLine = getContinuousRoadLine(sx, sz, tx, tz, bounds);
  let directBlocked = false;

  for (let i = 0; i < directLine.length; i++) {
    const [lx, lz] = directLine[i];
    if (isBlocked(lx, lz)) {
      directBlocked = true;
      break;
    }
  }

  if (!directBlocked) {
    return directLine;
  }

  const openSet: PathNode[] = [];
  const closedSet = new Set<string>();
  const nodeMap = new Map<string, PathNode>();

  const startNode: PathNode = {
    x: sx,
    z: sz,
    g: 0,
    h: Math.hypot(tx - sx, tz - sz),
    f: Math.hypot(tx - sx, tz - sz),
  };
  openSet.push(startNode);
  nodeMap.set(`${sx},${sz}`, startNode);

  const neighbors4 = [
    [0, 1], [0, -1], [1, 0], [-1, 0]
  ];

  let iterations = 0;
  const maxIterations = 1500;

  while (openSet.length > 0 && iterations++ < maxIterations) {
    let lowestIdx = 0;
    for (let i = 1; i < openSet.length; i++) {
      if (openSet[i].f < openSet[lowestIdx].f) {
        lowestIdx = i;
      }
    }
    const current = openSet.splice(lowestIdx, 1)[0];
    const curKey = `${current.x},${current.z}`;
    closedSet.add(curKey);

    if (current.x === tx && current.z === tz) {
      const path: [number, number][] = [];
      let curr: PathNode | undefined = current;
      while (curr) {
        path.push([curr.x, curr.z]);
        curr = curr.parent;
      }
      path.reverse();
      return path;
    }

    for (const [ox, oz] of neighbors4) {
      const nx = current.x + ox;
      const nz = current.z + oz;
      const nKey = `${nx},${nz}`;

      if (closedSet.has(nKey)) continue;

      if (bounds && !isTileInRoadBounds(nx, nz, bounds)) {
        continue;
      }

      if (isBlocked(nx, nz)) continue;

      const tile = grid.getTile(nx, nz);
      const moveCost = tile?.terrain === 'road' ? 0.65 : 1.0;
      const g = current.g + moveCost;
      const h = Math.hypot(tx - nx, tz - nz);
      const f = g + h;

      let existingNode = nodeMap.get(nKey);
      if (!existingNode) {
        const neighborNode: PathNode = {
          x: nx,
          z: nz,
          g,
          h,
          f,
          parent: current,
        };
        openSet.push(neighborNode);
        nodeMap.set(nKey, neighborNode);
      } else if (g < existingNode.g) {
        existingNode.g = g;
        existingNode.f = f;
        existingNode.parent = current;
      }
    }
  }

  return [];
}

