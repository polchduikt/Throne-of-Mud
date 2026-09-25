import { characterEntities, buildingEntities } from '../world';
import type { GameEntity } from '../world';
import { GridMap } from '../../grid/GridMap';
import { findBuildingContainingPos, getBuildingFloorHeight } from '../../buildings/buildingNavigation';
import { useGameStore } from '../../../store/useGameStore';
import type { RegionData } from '../../../types/game';

const stuckTracker = new Map<string, { lastX: number; lastZ: number; count: number }>();

function tryNudgeEntity(
  ent: GameEntity,
  nudgeX: number,
  nudgeZ: number,
  grid: GridMap,
  regions?: RegionData[]
): void {
  if (!ent.position || (nudgeX === 0 && nudgeZ === 0)) return;
  const curX = ent.position[0];
  const curZ = ent.position[2];
  let targetX = curX + nudgeX;
  let targetZ = curZ + nudgeZ;

  if (ent.regionId !== undefined && regions) {
    const reg = regions.find((r) => r.id === ent.regionId);
    if (reg?.bounds) {
      targetX = Math.max(reg.bounds.minX + 0.3, Math.min(reg.bounds.maxX + 0.7, targetX));
      targetZ = Math.max(reg.bounds.minZ + 0.3, Math.min(reg.bounds.maxZ + 0.7, targetZ));
    }
  }

  const isPositionValid = (x: number, z: number): boolean => {
    const tile = grid.getTile(Math.floor(x), Math.floor(z));
    if (!tile || tile.terrain === 'water') return false;
    if (tile.isPassable) return true;
    return !!findBuildingContainingPos(x, z, buildingEntities);
  };

  if (isPositionValid(targetX, targetZ)) {
    ent.position[0] = targetX;
    ent.position[2] = targetZ;
    ent.gridPosition = [Math.floor(targetX), Math.floor(targetZ)];
  } else if (isPositionValid(targetX, curZ)) {
    ent.position[0] = targetX;
    ent.gridPosition = [Math.floor(targetX), Math.floor(curZ)];
  } else if (isPositionValid(curX, targetZ)) {
    ent.position[2] = targetZ;
    ent.gridPosition = [Math.floor(curX), Math.floor(targetZ)];
  }
}

export class MovementSystem {
  public static update(delta: number, grid: GridMap): void {
    const { regions } = useGameStore.getState();

    for (const entity of characterEntities) {
      if (!entity.position) {
        continue;
      }

      if (entity.path && entity.path.length > 0) {
        const nextWaypoint = entity.path[0];

        if (entity.regionId !== undefined && regions) {
          const reg = regions.find((r) => r.id === entity.regionId);
          if (reg?.bounds) {
            const b = reg.bounds;
            if (
              nextWaypoint[0] < b.minX ||
              nextWaypoint[0] > b.maxX ||
              nextWaypoint[1] < b.minZ ||
              nextWaypoint[1] > b.maxZ
            ) {
              entity.path = [];
              stuckTracker.delete(entity.id);
              continue;
            }
          }
        }

        const tracker = stuckTracker.get(entity.id);
        const curX = entity.position[0];
        const curZ = entity.position[2];
        if (tracker) {
          const moved = Math.hypot(curX - tracker.lastX, curZ - tracker.lastZ);
          if (moved < 0.005) {
            tracker.count++;
            if (tracker.count > 40) {
              entity.path = [];
              tracker.count = 0;
              stuckTracker.delete(entity.id);
              continue;
            }
          } else {
            tracker.lastX = curX;
            tracker.lastZ = curZ;
            tracker.count = 0;
          }
        } else {
          stuckTracker.set(entity.id, { lastX: curX, lastZ: curZ, count: 0 });
        }

        const currentTile = grid.getTile(Math.floor(entity.position[0]), Math.floor(entity.position[2]));
        let surfaceSpeedMultiplier = 1.0;
        if (currentTile) {
          if (currentTile.terrain === 'road') {
            surfaceSpeedMultiplier = 1.5;
          } else if (currentTile.terrain === 'mud') {
            surfaceSpeedMultiplier = 0.75;
          }
        }

        const speed = (entity.moveSpeed || 1.35) * surfaceSpeedMultiplier * delta;
        const targetX = nextWaypoint[0] + 0.5;
        const targetZ = nextWaypoint[1] + 0.5;

        const currentX = entity.position[0];
        const currentZ = entity.position[2];

        const dx = targetX - currentX;
        const dz = targetZ - currentZ;
        const distance = Math.hypot(dx, dz);

        const isLastWaypoint = entity.path.length === 1;
        const arrivalThreshold = isLastWaypoint ? speed : 0.42;

        let hasReached = distance <= arrivalThreshold;
        if (!hasReached && isLastWaypoint && distance <= 0.38) {
          const isTargetOccupied = Array.from(characterEntities).some(
            (other: GameEntity) =>
              other.id !== entity.id &&
              other.position &&
              Math.hypot(other.position[0] - targetX, other.position[2] - targetZ) < 0.45
          );
          if (isTargetOccupied) {
            hasReached = true;
          }
        }

        if (hasReached) {
          entity.position[0] = targetX;
          entity.position[2] = targetZ;
          entity.gridPosition = [nextWaypoint[0], nextWaypoint[1]];
          entity.path.shift();
          if (entity.path.length === 0) {
            stuckTracker.delete(entity.id);
          }
        } else {
          const vx = (dx / distance) * speed;
          const vz = (dz / distance) * speed;

          entity.position[0] += vx;
          entity.position[2] += vz;
        }

        if (entity.regionId !== undefined && regions) {
          const reg = regions.find((r) => r.id === entity.regionId);
          if (reg?.bounds) {
            const b = reg.bounds;
            const clampedX = Math.max(b.minX + 0.5, Math.min(b.maxX + 0.5, entity.position[0]));
            const clampedZ = Math.max(b.minZ + 0.5, Math.min(b.maxZ + 0.5, entity.position[2]));
            if (clampedX !== entity.position[0] || clampedZ !== entity.position[2]) {
              entity.position[0] = clampedX;
              entity.position[2] = clampedZ;
              entity.gridPosition = [Math.floor(clampedX), Math.floor(clampedZ)];
            }
          }
        }
      } else {
        stuckTracker.delete(entity.id);
      }
    }

    const entityList: GameEntity[] = [];
    const isFixedList: boolean[] = [];

    for (const entity of characterEntities) {
      if (!entity.position) continue;
      entityList.push(entity);
      const isStationarySleeping = Boolean((!entity.path || entity.path.length === 0) && entity.currentJob?.type === 'sleep');
      const isStationarySitting = Boolean((!entity.path || entity.path.length === 0) && entity.currentJob?.type === 'sit_by_fire');
      const isStationaryWorking = Boolean((!entity.path || entity.path.length === 0) && entity.currentJob && entity.currentJob.type !== 'idle' && entity.currentJob.type !== 'wander');
      isFixedList.push(isStationarySleeping || isStationarySitting || isStationaryWorking);
    }

    const MIN_DISTANCE = 0.46;
    const MIN_DISTANCE_SQ = MIN_DISTANCE * MIN_DISTANCE;

    for (let i = 0; i < entityList.length; i++) {
      const entA = entityList[i];
      const fixedA = isFixedList[i];
      const hasPathA = Boolean(entA.path && entA.path.length > 0);
      const posA = entA.position!;

      for (let j = i + 1; j < entityList.length; j++) {
        const entB = entityList[j];
        const fixedB = isFixedList[j];
        if (fixedA && fixedB) continue;

        const hasPathB = Boolean(entB.path && entB.path.length > 0);
        const posB = entB.position!;
        let dx = posA[0] - posB[0];
        let dz = posA[2] - posB[2];
        let distSq = dx * dx + dz * dz;

        if (distSq >= MIN_DISTANCE_SQ) continue;

        let dist = Math.sqrt(distSq);
        if (dist < 0.001) {
          const pseudoAngle = ((i * 17 + j * 31) % 360) * (Math.PI / 180);
          dx = Math.cos(pseudoAngle) * 0.02;
          dz = Math.sin(pseudoAngle) * 0.02;
          dist = 0.02;
        }

        const overlap = MIN_DISTANCE - dist;
        const nx = dx / dist;
        const nz = dz / dist;
        const pushAmount = Math.min(overlap * 0.5, delta * 1.6);

        const applyEntityNudge = (
          ent: GameEntity,
          isFixed: boolean,
          hasPath: boolean,
          dirNx: number,
          dirNz: number,
          amt: number
        ) => {
          if (isFixed || amt <= 0) return;
          if (!hasPath) {
            tryNudgeEntity(ent, dirNx * amt, dirNz * amt, grid, regions);
            return;
          }

          const wp = ent.path![0];
          const fwdX = wp[0] + 0.5 - ent.position![0];
          const fwdZ = wp[1] + 0.5 - ent.position![2];
          const fwdLen = Math.hypot(fwdX, fwdZ);
          if (fwdLen < 0.01) {
            tryNudgeEntity(ent, dirNx * amt, dirNz * amt, grid, regions);
            return;
          }

          const uFwdX = fwdX / fwdLen;
          const uFwdZ = fwdZ / fwdLen;
          const rightX = -uFwdZ;
          const rightZ = uFwdX;

          const dotRight = dirNx * rightX + dirNz * rightZ;
          const dodgeDir = dotRight >= 0 ? 1 : -1;
          const lateralAmt = Math.min(amt, 0.03);

          tryNudgeEntity(ent, rightX * dodgeDir * lateralAmt, rightZ * dodgeDir * lateralAmt, grid, regions);
        };

        if (!fixedA && !fixedB) {
          const halfPush = pushAmount * 0.5;
          applyEntityNudge(entA, fixedA, hasPathA, nx, nz, halfPush);
          applyEntityNudge(entB, fixedB, hasPathB, -nx, -nz, halfPush);
        } else if (!fixedA && fixedB) {
          applyEntityNudge(entA, fixedA, hasPathA, nx, nz, pushAmount);
        } else if (fixedA && !fixedB) {
          applyEntityNudge(entB, fixedB, hasPathB, -nx, -nz, pushAmount);
        }
      }
    }

    for (const entity of characterEntities) {
      if (!entity.position) continue;
      const isStationarySleeping = (!entity.path || entity.path.length === 0) && entity.currentJob?.type === 'sleep';
      const isStationarySitting = (!entity.path || entity.path.length === 0) && entity.currentJob?.type === 'sit_by_fire';

      if (!isStationarySleeping && !isStationarySitting) {
        const currentTile = grid.getTile(Math.floor(entity.position[0]), Math.floor(entity.position[2]));
        const terrainH = currentTile?.height || 0;
        let inside = findBuildingContainingPos(entity.position[0], entity.position[2], buildingEntities);
        if (!inside && entity.currentJob?.type === 'work_at_building' && entity.currentJob.targetBuildingId) {
          inside = Array.from(buildingEntities).find((b) => b.id === entity.currentJob!.targetBuildingId && b.isCompleted);
        }

        const buildingBaseY = inside ? (inside.position ? inside.position[1] : terrainH) : terrainH;
        const floorH = inside ? getBuildingFloorHeight(inside.buildingType) : 0;
        const targetY = buildingBaseY + floorH;
        const currentY = entity.position[1] ?? targetY;
        const diffY = targetY - currentY;
        if (Math.abs(diffY) < 0.005) {
          entity.position[1] = targetY;
        } else {
          entity.position[1] = currentY + diffY * Math.min(1.0, delta * 12.0);
        }
      }
    }
  }
}
