import type { BuildingType, ResourceDeposit, ResourceDepositType } from '../../types/game';
import { GridMap } from '../grid/GridMap';

export interface PlacementValidationResult {
  allowed: boolean;
  reason?: string;
}

export function validateBuildingPlacement(
  buildingType: BuildingType,
  x: number,
  z: number,
  width: number,
  height: number,
  grid: GridMap,
  resourceDeposits: ResourceDeposit[]
): PlacementValidationResult {
  if (!grid.canPlaceBuilding(x, z, width, height)) {
    return {
      allowed: false,
      reason: 'Місце зайняте водою, іншою будівлею або перешкодами.',
    };
  }

  if (buildingType === 'fishermans_hut') {
    let touchesWater = false;
    for (let dx = -1; dx <= width; dx++) {
      for (let dz = -1; dz <= height; dz++) {
        if (dx >= 0 && dx < width && dz >= 0 && dz < height) continue;
        const tx = x + dx;
        const tz = z + dz;
        const tile = grid.getTile(tx, tz);
        if (tile && tile.terrain === 'water') {
          touchesWater = true;
          break;
        }
      }
      if (touchesWater) break;
    }
    if (!touchesWater) {
      return {
        allowed: false,
        reason: 'Хатину рибалки можна будувати лише на березі водойми (біля води)!',
      };
    }
  }

  const depositRules: Partial<Record<BuildingType, { depositType: ResourceDepositType; maxDistance: number; errorMsg: string }>> = {
    iron_mine: {
      depositType: 'iron',
      maxDistance: 6,
      errorMsg: 'Копальню заліза можна зводити лише поруч із покладами залізної руди!',
    },
    stone_quarry: {
      depositType: 'stone',
      maxDistance: 6,
      errorMsg: 'Каменоломню можна зводити лише поруч із покладами каменю!',
    },
    clay_pit: {
      depositType: 'clay',
      maxDistance: 6,
      errorMsg: 'Глиняний карʼєр можна зводити лише поруч із покладами глини!',
    },
    salt_works: {
      depositType: 'salt',
      maxDistance: 6,
      errorMsg: 'Солеварню можна зводити лише поруч із соляними джерелами або покладами солі!',
    },
  };

  const rule = depositRules[buildingType];
  if (rule) {
    const centerX = x + width / 2;
    const centerZ = z + height / 2;
    const nearDeposit = resourceDeposits.some((d) => {
      if (d.type !== rule.depositType) return false;
      const dist = Math.hypot(d.gridPosition[0] - centerX, d.gridPosition[1] - centerZ);
      return dist <= rule.maxDistance;
    });

    if (!nearDeposit) {
      return {
        allowed: false,
        reason: rule.errorMsg,
      };
    }
  }

  return { allowed: true };
}

