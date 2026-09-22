import { characterEntities } from '../world';
import { GridMap } from '../../grid/GridMap';

export class MovementSystem {
  public static update(delta: number, grid: GridMap): void {
    for (const entity of characterEntities) {
      if (!entity.path || entity.path.length === 0 || !entity.position) {
        continue;
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
      const nextWaypoint = entity.path[0];
      const targetX = nextWaypoint[0] + 0.5;
      const targetZ = nextWaypoint[1] + 0.5;

      const currentX = entity.position[0];
      const currentZ = entity.position[2];

      const dx = targetX - currentX;
      const dz = targetZ - currentZ;
      const distance = Math.hypot(dx, dz);

      if (distance <= speed) {
        entity.position[0] = targetX;
        entity.position[2] = targetZ;
        entity.gridPosition = [nextWaypoint[0], nextWaypoint[1]];
        
        const tile = grid.getTile(nextWaypoint[0], nextWaypoint[1]);
        if (tile) {
          entity.position[1] = Math.max(0.1, tile.height + 0.2);
        }

        entity.path.shift();
      } else {
        const vx = (dx / distance) * speed;
        const vz = (dz / distance) * speed;

        entity.position[0] += vx;
        entity.position[2] += vz;

        const currentTile = grid.getTile(Math.floor(entity.position[0]), Math.floor(entity.position[2]));
        if (currentTile) {
          entity.position[1] = Math.max(0.1, currentTile.height + 0.2);
        }
      }
    }
  }
}
