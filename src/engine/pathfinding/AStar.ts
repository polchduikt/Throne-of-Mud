import { GridMap } from '../grid/GridMap';

interface Node {
  x: number;
  z: number;
  g: number;
  h: number;
  f: number;
  parent?: Node;
}

export interface RegionBounds {
  minX: number;
  maxX: number;
  minZ: number;
  maxZ: number;
}

export class AStar {
  public static findPathToArea(
    grid: GridMap,
    start: [number, number],
    areaX: number,
    areaZ: number,
    width: number,
    height: number,
    regionBounds?: RegionBounds
  ): [number, number][] | null {
    const [sx, sz] = [Math.floor(start[0]), Math.floor(start[1])];

    const perimeter: Array<{ x: number; z: number; dist: number }> = [];

    for (let dx = -1; dx <= width; dx++) {
      for (let dz = -1; dz <= height; dz++) {
        if (dx === -1 || dx === width || dz === -1 || dz === height) {
          const px = areaX + dx;
          const pz = areaZ + dz;

          if (regionBounds) {
            if (px < regionBounds.minX || px > regionBounds.maxX || pz < regionBounds.minZ || pz > regionBounds.maxZ) {
              continue;
            }
          }

          if (grid.isWalkable(px, pz)) {
            if (sx === px && sz === pz) {
              return [[sx, sz]];
            }
            perimeter.push({
              x: px,
              z: pz,
              dist: Math.hypot(px - sx, pz - sz),
            });
          }
        }
      }
    }

    if (perimeter.length === 0) {
      return null;
    }

    perimeter.sort((a, b) => a.dist - b.dist);

    for (const p of perimeter.slice(0, 8)) {
      const path = AStar.findPath(grid, [sx, sz], [p.x, p.z], false, regionBounds);
      if (path && path.length > 0) {
        return path;
      }
    }

    return null;
  }

  public static findPath(
    grid: GridMap,
    start: [number, number],
    target: [number, number],
    allowAdjacentTarget = false,
    regionBounds?: RegionBounds
  ): [number, number][] | null {
    const [sx, sz] = [Math.floor(start[0]), Math.floor(start[1])];
    let [tx, tz] = [Math.floor(target[0]), Math.floor(target[1])];

    if (regionBounds) {
      if (tx < regionBounds.minX || tx > regionBounds.maxX || tz < regionBounds.minZ || tz > regionBounds.maxZ) {
        return null;
      }
    }

    if (!grid.isWalkable(tx, tz)) {
      if (!allowAdjacentTarget) {
        return null;
      }
      const neighbors = grid.getNeighbors(tx, tz).filter(n => grid.isWalkable(n.x, n.z));
      if (neighbors.length === 0) return null;

      neighbors.sort((a, b) => {
        const distA = Math.hypot(a.x - sx, a.z - sz);
        const distB = Math.hypot(b.x - sx, b.z - sz);
        return distA - distB;
      });
      tx = neighbors[0].x;
      tz = neighbors[0].z;
    }

    if (sx === tx && sz === tz) {
      return [[sx, sz]];
    }

    const openSet: Node[] = [];
    const closedSet = new Set<string>();
    const nodeMap = new Map<string, Node>();

    const startNode: Node = {
      x: sx,
      z: sz,
      g: 0,
      h: AStar.heuristic(sx, sz, tx, tz),
      f: AStar.heuristic(sx, sz, tx, tz),
    };

    openSet.push(startNode);
    nodeMap.set(`${sx},${sz}`, startNode);

    const maxIterations = 1200;
    let iterations = 0;

    while (openSet.length > 0 && iterations++ < maxIterations) {
      let lowestIndex = 0;
      for (let i = 1; i < openSet.length; i++) {
        if (openSet[i].f < openSet[lowestIndex].f) {
          lowestIndex = i;
        }
      }

      const current = openSet.splice(lowestIndex, 1)[0];
      const currentKey = `${current.x},${current.z}`;

      if (current.x === tx && current.z === tz) {
        return AStar.reconstructPath(current);
      }

      closedSet.add(currentKey);

      const directions = [
        { dx: 1, dz: 0, cost: 1.0 },
        { dx: -1, dz: 0, cost: 1.0 },
        { dx: 0, dz: 1, cost: 1.0 },
        { dx: 0, dz: -1, cost: 1.0 },
        { dx: 1, dz: 1, cost: 1.414 },
        { dx: -1, dz: 1, cost: 1.414 },
        { dx: 1, dz: -1, cost: 1.414 },
        { dx: -1, dz: -1, cost: 1.414 },
      ];

      for (const dir of directions) {
        const nx = current.x + dir.dx;
        const nz = current.z + dir.dz;

        if (regionBounds) {
          if (nx < regionBounds.minX || nx > regionBounds.maxX || nz < regionBounds.minZ || nz > regionBounds.maxZ) {
            continue;
          }
        }

        const neighborKey = `${nx},${nz}`;

        if (closedSet.has(neighborKey)) continue;

        const tile = grid.getTile(nx, nz);
        if (!tile || !grid.isWalkable(nx, nz)) continue;

        if (dir.dx !== 0 && dir.dz !== 0) {
          if (!grid.isWalkable(current.x + dir.dx, current.z) || !grid.isWalkable(current.x, current.z + dir.dz)) {
            continue;
          }
        }

        const moveCost = (tile.movementCost || 1.0) * dir.cost;
        const tentativeG = current.g + moveCost;

        let neighbor = nodeMap.get(neighborKey);

        if (!neighbor) {
          neighbor = {
            x: nx,
            z: nz,
            g: tentativeG,
            h: AStar.heuristic(nx, nz, tx, tz),
            f: tentativeG + AStar.heuristic(nx, nz, tx, tz),
            parent: current,
          };
          nodeMap.set(neighborKey, neighbor);
          openSet.push(neighbor);
        } else if (tentativeG < neighbor.g) {
          neighbor.g = tentativeG;
          neighbor.f = tentativeG + neighbor.h;
          neighbor.parent = current;
        }
      }
    }

    return null;
  }

  private static heuristic(x1: number, z1: number, x2: number, z2: number): number {
    const dx = Math.abs(x1 - x2);
    const dz = Math.abs(z1 - z2);
    return (dx + dz) + (Math.SQRT2 - 2) * Math.min(dx, dz);
  }

  private static reconstructPath(endNode: Node): [number, number][] {
    const path: [number, number][] = [];
    let curr: Node | undefined = endNode;
    while (curr) {
      path.unshift([curr.x, curr.z]);
      curr = curr.parent;
    }
    return path;
  }
}
