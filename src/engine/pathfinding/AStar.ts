import { GridMap } from '../grid/GridMap';

interface Node {
  x: number;
  z: number;
  g: number;
  h: number;
  f: number;
  parent?: Node;
  heapIndex?: number;
}

export interface RegionBounds {
  minX: number;
  maxX: number;
  minZ: number;
  maxZ: number;
}

class MinHeap {
  private heap: Node[] = [];

  public get size(): number {
    return this.heap.length;
  }

  public push(node: Node): void {
    node.heapIndex = this.heap.length;
    this.heap.push(node);
    this.bubbleUp(node.heapIndex);
  }

  public pop(): Node | undefined {
    if (this.heap.length === 0) return undefined;
    const top = this.heap[0];
    const bottom = this.heap.pop()!;
    if (this.heap.length > 0) {
      this.heap[0] = bottom;
      bottom.heapIndex = 0;
      this.sinkDown(0);
    }
    top.heapIndex = -1;
    return top;
  }

  public update(node: Node): void {
    if (node.heapIndex !== undefined && node.heapIndex >= 0) {
      this.bubbleUp(node.heapIndex);
    }
  }

  private bubbleUp(idx: number): void {
    const node = this.heap[idx];
    while (idx > 0) {
      const parentIdx = (idx - 1) >> 1;
      const parent = this.heap[parentIdx];
      if (node.f >= parent.f) break;
      this.heap[idx] = parent;
      parent.heapIndex = idx;
      idx = parentIdx;
    }
    this.heap[idx] = node;
    node.heapIndex = idx;
  }

  private sinkDown(idx: number): void {
    const length = this.heap.length;
    const node = this.heap[idx];
    while (true) {
      const leftIdx = (idx << 1) + 1;
      const rightIdx = leftIdx + 1;
      let swapIdx = -1;
      let minF = node.f;

      if (leftIdx < length && this.heap[leftIdx].f < minF) {
        swapIdx = leftIdx;
        minF = this.heap[leftIdx].f;
      }
      if (rightIdx < length && this.heap[rightIdx].f < minF) {
        swapIdx = rightIdx;
      }
      if (swapIdx === -1) break;

      this.heap[idx] = this.heap[swapIdx];
      this.heap[idx].heapIndex = idx;
      idx = swapIdx;
    }
    this.heap[idx] = node;
    node.heapIndex = idx;
  }
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

    const candidates = perimeter.slice(0, 3);
    for (const p of candidates) {
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

    const openHeap = new MinHeap();
    const closedSet = new Set<number>();
    const nodeMap = new Map<number, Node>();

    const startKey = (sz << 16) | sx;
    const startNode: Node = {
      x: sx,
      z: sz,
      g: 0,
      h: AStar.heuristic(sx, sz, tx, tz),
      f: AStar.heuristic(sx, sz, tx, tz),
    };

    openHeap.push(startNode);
    nodeMap.set(startKey, startNode);

    const maxIterations = 1200;
    let iterations = 0;

    while (openHeap.size > 0 && iterations++ < maxIterations) {
      const current = openHeap.pop();
      if (!current) break;

      if (current.x === tx && current.z === tz) {
        return AStar.reconstructPath(current);
      }

      const currentKey = (current.z << 16) | current.x;
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

        const neighborKey = (nz << 16) | nx;

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
          openHeap.push(neighbor);
        } else if (tentativeG < neighbor.g) {
          neighbor.g = tentativeG;
          neighbor.f = tentativeG + neighbor.h;
          neighbor.parent = current;
          openHeap.update(neighbor);
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
