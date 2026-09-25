import { type GameEntity, buildingEntities } from '../ecs/world';
import { GridMap } from '../grid/GridMap';
import { AStar, type RegionBounds } from '../pathfinding/AStar';

export interface WorkstationInfo {
  doorApproachPos: [number, number];
  doorWorldPos: [number, number];
  workWorldPos: [number, number];
  facingTarget: [number, number];
  intermediatePos?: [number, number];
}

export interface SleepSpotInfo {
  doorApproachPos: [number, number];
  doorWorldPos: [number, number];
  bedWorldPos: [number, number];
  bedY: number;
  facingAngle: number;
  intermediatePos?: [number, number];
}

export interface CampfireSitSpotInfo {
  position: [number, number];
  approachTile: [number, number];
  spotY: number;
  facingAngle: number;
  isBench: boolean;
}

export function getBuildingDimensions(bType?: string): [number, number] {
  switch (bType) {
    case 'manor':
      return [5, 4];
    case 'barracks':
      return [5, 3];
    case 'wheat_farm':
      return [4, 4];
    case 'windmill':
      return [3, 3];
    case 'tent':
      return [3, 2];
    case 'campfire':
      return [2, 2];
    default:
      return [4, 2];
  }
}

export function getBuildingFloorHeight(bType?: string): number {
  switch (bType) {
    case 'manor':
      return 0.22;
    case 'market':
      return 0.16;
    case 'barracks':
      return 0.16;
    case 'bakery':
    case 'brewery':
    case 'peasant_house':
    case 'lumberjack_hut':
      return 0.125;
    case 'stockpile':
      return 0.16;
    case 'windmill':
      return 0.08;
    case 'tent':
      return 0.02;
    default:
      return 0;
  }
}

export function getBuildingDoorInfo(building: GameEntity): {
  doorApproachPos: [number, number];
  doorWorldPos: [number, number];
  intermediatePos?: [number, number];
} {
  const [bx, bz] = building.gridPosition || [0, 0];
  const bType = building.buildingType || 'peasant_house';
  const [defW, defH] = getBuildingDimensions(bType);
  const w = building.buildingWidth || defW;
  const h = building.buildingHeight || defH;
  const centerX = bx + w / 2;
  const centerZ = bz + h / 2;

  switch (bType) {
    case 'market': {
      return {
        doorApproachPos: [bx + 2, bz + 2],
        doorWorldPos: [centerX, centerZ + 0.75],
        intermediatePos: [centerX, centerZ - 0.55],
      };
    }
    case 'bakery': {
      return {
        doorApproachPos: [bx + 3, bz + 2],
        doorWorldPos: [centerX + 1.05, centerZ + 0.88],
        intermediatePos: [centerX, centerZ + 0.08],
      };
    }
    case 'brewery': {
      return {
        doorApproachPos: [bx + 2, bz + 2],
        doorWorldPos: [centerX + 0.15, centerZ + 0.88],
      };
    }
    case 'lumberjack_hut': {
      return {
        doorApproachPos: [bx + 2, bz + 2],
        doorWorldPos: [centerX + 0.15, centerZ + 0.88],
      };
    }
    case 'barracks': {
      return {
        doorApproachPos: [bx + 2, bz + 3],
        doorWorldPos: [centerX, centerZ + 1.35],
      };
    }
    case 'windmill': {
      return {
        doorApproachPos: [bx + 1, bz + 3],
        doorWorldPos: [centerX, centerZ + 1.25],
      };
    }
    case 'tent': {
      return {
        doorApproachPos: [bx + 1, bz + 2],
        doorWorldPos: [centerX - 0.45, centerZ + 0.85],
      };
    }
    case 'manor': {
      return {
        doorApproachPos: [bx + 2, bz + 4],
        doorWorldPos: [centerX, centerZ + 1.88],
      };
    }
    case 'peasant_house':
    default: {
      return {
        doorApproachPos: [bx + 2, bz + 2],
        doorWorldPos: [centerX, centerZ + 0.88],
      };
    }
  }
}

export function getBuildingWorkstation(
  building: GameEntity,
  workerIndex: number = 0
): WorkstationInfo {
  const [bx, bz] = building.gridPosition || [0, 0];
  const bType = building.buildingType || 'peasant_house';
  const [defW, defH] = getBuildingDimensions(bType);
  const w = building.buildingWidth || defW;
  const h = building.buildingHeight || defH;
  const centerX = bx + w / 2;
  const centerZ = bz + h / 2;
  const door = getBuildingDoorInfo(building);

  switch (bType) {
    case 'market': {
      const isRightStall = workerIndex === 1;
      const xOff = isRightStall ? 0.9 : -0.9;
      return {
        doorApproachPos: door.doorApproachPos,
        doorWorldPos: door.doorWorldPos,
        intermediatePos: door.intermediatePos,
        workWorldPos: [centerX + xOff, centerZ - 0.55],
        facingTarget: [centerX + xOff, centerZ + 1.2],
      };
    }
    case 'bakery': {
      if (workerIndex === 1) {
        return {
          doorApproachPos: door.doorApproachPos,
          doorWorldPos: door.doorWorldPos,
          workWorldPos: [centerX + 1.15, centerZ + 0.30],
          facingTarget: [centerX + 1.15, centerZ - 0.35],
        };
      }
      return {
        doorApproachPos: door.doorApproachPos,
        doorWorldPos: door.doorWorldPos,
        intermediatePos: door.intermediatePos,
        workWorldPos: [centerX - 0.95, centerZ + 0.45],
        facingTarget: [centerX - 0.95, centerZ + 1.6],
      };
    }
    case 'brewery': {
      if (workerIndex === 1) {
        return {
          doorApproachPos: door.doorApproachPos,
          doorWorldPos: door.doorWorldPos,
          workWorldPos: [centerX + 0.85, centerZ - 0.28],
          facingTarget: [centerX + 1.38, centerZ - 0.28],
        };
      }
      return {
        doorApproachPos: door.doorApproachPos,
        doorWorldPos: door.doorWorldPos,
        workWorldPos: [centerX - 0.25, centerZ - 0.2],
        facingTarget: [centerX - 0.75, centerZ - 0.2],
      };
    }
    case 'lumberjack_hut': {
      return {
        doorApproachPos: door.doorApproachPos,
        doorWorldPos: door.doorWorldPos,
        workWorldPos: [centerX + 1.38, centerZ],
        facingTarget: [centerX + 1.38, centerZ - 0.5],
      };
    }
    case 'barracks': {
      const workX = workerIndex === 1 ? centerX + 1.2 : centerX - 1.2;
      return {
        doorApproachPos: door.doorApproachPos,
        doorWorldPos: door.doorWorldPos,
        workWorldPos: [workX, centerZ],
        facingTarget: [workX, centerZ - 1.0],
      };
    }
    case 'windmill': {
      return {
        doorApproachPos: door.doorApproachPos,
        doorWorldPos: door.doorWorldPos,
        workWorldPos: [centerX, centerZ],
        facingTarget: [centerX - 0.5, centerZ],
      };
    }
    case 'manor': {
      return {
        doorApproachPos: door.doorApproachPos,
        doorWorldPos: door.doorWorldPos,
        workWorldPos: [centerX, centerZ - 0.8],
        facingTarget: [centerX, centerZ + 1.0],
      };
    }
    default: {
      return {
        doorApproachPos: door.doorApproachPos,
        doorWorldPos: door.doorWorldPos,
        workWorldPos: [centerX, centerZ],
        facingTarget: [centerX, centerZ + 1.0],
      };
    }
  }
}

export function getBuildingSleepSpot(
  building: GameEntity,
  bedIndex: number = 0
): SleepSpotInfo {
  const [bx, bz] = building.gridPosition || [0, 0];
  const bType = building.buildingType || 'peasant_house';
  const [defW, defH] = getBuildingDimensions(bType);
  const w = building.buildingWidth || defW;
  const h = building.buildingHeight || defH;
  const centerX = bx + w / 2;
  const centerZ = bz + h / 2;
  const door = getBuildingDoorInfo(building);
  const buildingBaseY = building.position ? building.position[1] : 0.05;

  switch (bType) {
    case 'tent': {
      return {
        doorApproachPos: door.doorApproachPos,
        doorWorldPos: door.doorWorldPos,
        bedWorldPos: [centerX + 0.55, centerZ],
        bedY: buildingBaseY + 0.055,
        facingAngle: 0,
      };
    }
    case 'manor': {
      const manorOffsets: [number, number][] = [
        [-1.55, -0.2],
        [-1.55, -0.9],
        [1.55, -0.9],
        [1.55, 0.4],
      ];
      const off = manorOffsets[bedIndex % manorOffsets.length];
      return {
        doorApproachPos: door.doorApproachPos,
        doorWorldPos: door.doorWorldPos,
        bedWorldPos: [centerX + off[0], centerZ + off[1]],
        bedY: buildingBaseY + 0.48,
        facingAngle: 0,
        intermediatePos: [centerX - 1.25, centerZ + 1.1],
      };
    }
    case 'lumberjack_hut': {
      return {
        doorApproachPos: door.doorApproachPos,
        doorWorldPos: door.doorWorldPos,
        bedWorldPos: [centerX - 1.25, centerZ - 0.2],
        bedY: buildingBaseY + 0.37,
        facingAngle: 0,
        intermediatePos: [centerX, centerZ + 0.3],
      };
    }
    case 'barracks': {
      return {
        doorApproachPos: door.doorApproachPos,
        doorWorldPos: door.doorWorldPos,
        bedWorldPos: [centerX - 1.65, centerZ - 0.5],
        bedY: bedIndex === 1 ? buildingBaseY + 0.81 : buildingBaseY + 0.45,
        facingAngle: -Math.PI / 2,
        intermediatePos: [centerX, centerZ + 0.4],
      };
    }
    case 'peasant_house':
    default: {
      return {
        doorApproachPos: door.doorApproachPos,
        doorWorldPos: door.doorWorldPos,
        bedWorldPos: [centerX + (bedIndex === 1 ? 1.25 : -1.25), centerZ - 0.15],
        bedY: buildingBaseY + 0.37,
        facingAngle: 0,
        intermediatePos: [centerX, centerZ + 0.3],
      };
    }
  }
}

export function getCampfireSitSpot(campfire: GameEntity, seatIndex: number): CampfireSitSpotInfo {
  const [bx, bz] = campfire.gridPosition || [52, 52];
  const cx = bx + 1.0;
  const cz = bz + 1.0;
  const campH = campfire.position ? campfire.position[1] : 0.05;

  const benchSeats: { offset: [number, number]; approachOffset: [number, number]; angle: number }[] = [
    { offset: [-0.75, -0.2], approachOffset: [-1, 0], angle: Math.PI / 2 },
    { offset: [-0.75, 0.2], approachOffset: [-1, 1], angle: Math.PI / 2 },
    { offset: [0.75, -0.2], approachOffset: [2, 0], angle: -Math.PI / 2 },
    { offset: [0.75, 0.2], approachOffset: [2, 1], angle: -Math.PI / 2 },
    { offset: [-0.2, -0.75], approachOffset: [0, -1], angle: 0 },
    { offset: [0.2, -0.75], approachOffset: [1, -1], angle: 0 },
    { offset: [-0.2, 0.75], approachOffset: [0, 2], angle: Math.PI },
    { offset: [0.2, 0.75], approachOffset: [1, 2], angle: Math.PI },
  ];

  if (seatIndex < benchSeats.length) {
    const seat = benchSeats[seatIndex];
    return {
      position: [cx + seat.offset[0], cz + seat.offset[1]],
      approachTile: [bx + seat.approachOffset[0], bz + seat.approachOffset[1]],
      spotY: campH + 0.22,
      facingAngle: seat.angle,
      isBench: true,
    };
  }

  const extraIndex = seatIndex - benchSeats.length;
  const rad = 1.45;
  const angle = (extraIndex * (Math.PI / 4) + Math.PI / 8) % (Math.PI * 2);
  const px = cx + Math.cos(angle) * rad;
  const pz = cz + Math.sin(angle) * rad;
  const facing = Math.atan2(cx - px, cz - pz);

  return {
    position: [px, pz],
    approachTile: [Math.floor(px), Math.floor(pz)],
    spotY: campH + 0.07,
    facingAngle: facing,
    isBench: false,
  };
}

export function getCampfireSleepSpot(campfire: GameEntity, sleeperIndex: number): {
  bedWorldPos: [number, number];
  bedY: number;
  facingAngle: number;
} {
  const [bx, bz] = campfire.gridPosition || [52, 52];
  const cx = bx + 1.0;
  const cz = bz + 1.0;
  const campH = campfire.position ? campfire.position[1] : 0.05;

  const corners: [number, number][] = [
    [-1.25, -1.25],
    [1.25, 1.25],
    [1.25, -1.25],
    [-1.25, 1.25],
  ];

  const c = corners[sleeperIndex % corners.length];
  const px = cx + c[0];
  const pz = cz + c[1];
  const facing = Math.atan2(-c[0], -c[1]);

  return {
    bedWorldPos: [px, pz],
    bedY: campH + 0.03,
    facingAngle: facing,
  };
}

export function findBuildingContainingPos(
  worldX: number,
  worldZ: number,
  buildings: Iterable<GameEntity>
): GameEntity | undefined {
  for (const b of buildings) {
    if (!b.gridPosition || !b.isCompleted) continue;
    const [defW, defH] = getBuildingDimensions(b.buildingType);
    const w = b.buildingWidth || defW;
    const h = b.buildingHeight || defH;
    if (
      worldX >= b.gridPosition[0] - 0.20 &&
      worldX <= b.gridPosition[0] + w + 0.20 &&
      worldZ >= b.gridPosition[1] - 0.20 &&
      worldZ <= b.gridPosition[1] + h + 0.20
    ) {
      return b;
    }
  }
  return undefined;
}

export function createPathToInterior(
  grid: GridMap,
  startGrid: [number, number],
  doorApproachPos: [number, number],
  doorWorldPos: [number, number],
  destWorldPos: [number, number],
  intermediatePos?: [number, number],
  bounds?: RegionBounds,
  startPos?: [number, number, number],
  targetBuilding?: GameEntity
): [number, number][] | null {
  if (startPos && targetBuilding && targetBuilding.gridPosition) {
    const [bx, bz] = targetBuilding.gridPosition;
    const [w, h] = getBuildingDimensions(targetBuilding.buildingType);
    if (
      startPos[0] >= bx - 0.25 &&
      startPos[0] <= bx + w + 0.25 &&
      startPos[2] >= bz - 0.25 &&
      startPos[2] <= bz + h + 0.25
    ) {
      const distToDest = Math.hypot(startPos[0] - destWorldPos[0], startPos[2] - destWorldPos[1]);
      if (distToDest < 0.6) {
        return [];
      }
      const internalPath: [number, number][] = [];
      const distToInter = intermediatePos
        ? Math.hypot(startPos[0] - intermediatePos[0], startPos[2] - intermediatePos[1])
        : 999;
      if (intermediatePos && distToInter > 0.4 && distToDest > distToInter) {
        internalPath.push([intermediatePos[0] - 0.5, intermediatePos[1] - 0.5]);
      }
      internalPath.push([destWorldPos[0] - 0.5, destWorldPos[1] - 0.5]);
      return internalPath;
    }
  }

  const exitWps: [number, number][] = [];
  let navStartGrid: [number, number] = [startGrid[0], startGrid[1]];

  if (startPos && targetBuilding) {
    const insideOther = findBuildingContainingPos(startPos[0], startPos[2], buildingEntities);
    if (insideOther && insideOther.id !== targetBuilding.id) {
      const otherDoor = getBuildingDoorInfo(insideOther);
      if (otherDoor.intermediatePos) {
        exitWps.push([otherDoor.intermediatePos[0] - 0.5, otherDoor.intermediatePos[1] - 0.5]);
      }
      exitWps.push([otherDoor.doorWorldPos[0] - 0.5, otherDoor.doorWorldPos[1] - 0.5]);
      exitWps.push(otherDoor.doorApproachPos);
      navStartGrid = [Math.floor(otherDoor.doorApproachPos[0]), Math.floor(otherDoor.doorApproachPos[1])];
    }
  }

  const isAlreadyAtApproach =
    Math.abs(navStartGrid[0] - doorApproachPos[0]) <= 1 &&
    Math.abs(navStartGrid[1] - doorApproachPos[1]) <= 1;

  let approachPath: [number, number][] | null = null;
  if (!isAlreadyAtApproach) {
    approachPath = AStar.findPath(grid, navStartGrid, doorApproachPos, true, bounds);
    if (!approachPath || approachPath.length === 0) {
      const candidates: [number, number][] = [
        [doorApproachPos[0], doorApproachPos[1] + 1],
        [doorApproachPos[0] + 1, doorApproachPos[1]],
        [doorApproachPos[0] - 1, doorApproachPos[1]],
        [doorApproachPos[0], doorApproachPos[1] - 1],
        [doorApproachPos[0] + 1, doorApproachPos[1] + 1],
        [doorApproachPos[0] - 1, doorApproachPos[1] + 1],
      ];
      for (const [cx, cz] of candidates) {
        if (grid.isWalkable(cx, cz)) {
          const testPath = AStar.findPath(grid, navStartGrid, [cx, cz], true, bounds);
          if (testPath && testPath.length > 0) {
            approachPath = testPath;
            break;
          }
        }
      }
    }

    if (!approachPath || approachPath.length === 0) {
      return null;
    }
  }

  const path: [number, number][] = [...exitWps];
  if (approachPath && approachPath.length > 0) {
    path.push(...approachPath);
  }

  const doorWp: [number, number] = [doorWorldPos[0] - 0.5, doorWorldPos[1] - 0.5];
  path.push(doorWp);

  if (intermediatePos) {
    path.push([intermediatePos[0] - 0.5, intermediatePos[1] - 0.5]);
  }

  const destWp: [number, number] = [destWorldPos[0] - 0.5, destWorldPos[1] - 0.5];
  path.push(destWp);

  return path;
}

export function createPathFromInterior(
  grid: GridMap,
  doorWorldPos: [number, number],
  doorApproachPos: [number, number],
  targetGrid: [number, number],
  intermediatePos?: [number, number],
  bounds?: RegionBounds
): [number, number][] {
  const path: [number, number][] = [];

  if (intermediatePos) {
    path.push([intermediatePos[0] - 0.5, intermediatePos[1] - 0.5]);
  }

  const doorWp: [number, number] = [doorWorldPos[0] - 0.5, doorWorldPos[1] - 0.5];
  path.push(doorWp);
  path.push(doorApproachPos);

  const outsidePath = AStar.findPath(grid, doorApproachPos, targetGrid, true, bounds);
  if (outsidePath && outsidePath.length > 0) {
    for (const wp of outsidePath) {
      if (wp[0] !== doorApproachPos[0] || wp[1] !== doorApproachPos[1]) {
        path.push(wp);
      }
    }
  }

  return path;
}

export function createPathSafely(
  grid: GridMap,
  unitPos: [number, number, number] | undefined,
  unitGrid: [number, number] | undefined,
  targetGrid: [number, number],
  buildings: Iterable<GameEntity>,
  allowAdjacent = true,
  bounds?: RegionBounds
): [number, number][] | null {
  const currentPos = unitPos;
  if (currentPos) {
    const insideBuilding = findBuildingContainingPos(currentPos[0], currentPos[2], buildings);
    if (insideBuilding) {
      const door = getBuildingDoorInfo(insideBuilding);
      const distToDoor = Math.hypot(currentPos[0] - door.doorWorldPos[0], currentPos[2] - door.doorWorldPos[1]);
      const distToApproach = Math.hypot(currentPos[0] - door.doorApproachPos[0], currentPos[2] - door.doorApproachPos[1]);
      if (distToApproach > 0.8 && distToDoor > 0.3) {
        return createPathFromInterior(
          grid,
          door.doorWorldPos,
          door.doorApproachPos,
          targetGrid,
          door.intermediatePos,
          bounds
        );
      }
    }
  }

  const startGrid = unitGrid || (currentPos ? [Math.floor(currentPos[0]), Math.floor(currentPos[2])] : targetGrid);
  return AStar.findPath(grid, startGrid, targetGrid, allowAdjacent, bounds);
}

export function createPathToAreaSafely(
  grid: GridMap,
  unitPos: [number, number, number] | undefined,
  unitGrid: [number, number] | undefined,
  areaX: number,
  areaZ: number,
  width: number,
  height: number,
  buildings: Iterable<GameEntity>,
  bounds?: RegionBounds
): [number, number][] | null {
  const currentPos = unitPos;
  if (currentPos) {
    const insideBuilding = findBuildingContainingPos(currentPos[0], currentPos[2], buildings);
    if (insideBuilding) {
      const door = getBuildingDoorInfo(insideBuilding);
      const distToDoor = Math.hypot(currentPos[0] - door.doorWorldPos[0], currentPos[2] - door.doorWorldPos[1]);
      const distToApproach = Math.hypot(currentPos[0] - door.doorApproachPos[0], currentPos[2] - door.doorApproachPos[1]);
      if (distToApproach > 0.8 && distToDoor > 0.3) {
        const path: [number, number][] = [];
        if (door.intermediatePos) {
          path.push([door.intermediatePos[0] - 0.5, door.intermediatePos[1] - 0.5]);
        }
        path.push([door.doorWorldPos[0] - 0.5, door.doorWorldPos[1] - 0.5]);
        path.push(door.doorApproachPos);
        const outsidePath = AStar.findPathToArea(grid, door.doorApproachPos, areaX, areaZ, width, height, bounds);
        if (outsidePath && outsidePath.length > 0) {
          for (const wp of outsidePath) {
            if (wp[0] !== door.doorApproachPos[0] || wp[1] !== door.doorApproachPos[1]) {
              path.push(wp);
            }
          }
        }
        return path;
      }
    }
  }

  const startGrid = unitGrid || (currentPos ? [Math.floor(currentPos[0]), Math.floor(currentPos[2])] : [areaX, areaZ]);
  return AStar.findPathToArea(grid, startGrid, areaX, areaZ, width, height, bounds);
}
