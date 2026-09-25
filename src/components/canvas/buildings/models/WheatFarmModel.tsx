import { buildingEntities, type GameEntity } from '../../../../engine/ecs/world';
import { SHARED_BUILDING_MATS } from '../buildingMaterials';

export function WheatFarmModel({
  building,
}: {
  building: GameEntity;
}) {
  const mats = SHARED_BUILDING_MATS;
  const pos = building.position || [0, 0, 0];
  const width = building.buildingWidth || 4;
  const height = building.buildingHeight || 4;

  const bx = building.gridPosition ? building.gridPosition[0] : pos[0] - width / 2;
  const bz = building.gridPosition ? building.gridPosition[1] : pos[2] - height / 2;
  const allBuildings = Array.from(buildingEntities);
  const hasNorth = allBuildings.some(b => b.buildingType === 'wheat_farm' && b.id !== building.id && Math.abs((b.gridPosition?.[0] ?? (b.position?.[0] ?? 0) - (b.buildingWidth || 4)/2) - bx) < 0.5 && Math.abs((b.gridPosition?.[1] ?? (b.position?.[2] ?? 0) - (b.buildingHeight || 4)/2) - (bz - (b.buildingHeight || 4))) < 0.5);
  const hasSouth = allBuildings.some(b => b.buildingType === 'wheat_farm' && b.id !== building.id && Math.abs((b.gridPosition?.[0] ?? (b.position?.[0] ?? 0) - (b.buildingWidth || 4)/2) - bx) < 0.5 && Math.abs((b.gridPosition?.[1] ?? (b.position?.[2] ?? 0) - (b.buildingHeight || 4)/2) - (bz + height)) < 0.5);
  const hasWest = allBuildings.some(b => b.buildingType === 'wheat_farm' && b.id !== building.id && Math.abs((b.gridPosition?.[0] ?? (b.position?.[0] ?? 0) - (b.buildingWidth || 4)/2) - (bx - (b.buildingWidth || 4))) < 0.5 && Math.abs((b.gridPosition?.[1] ?? (b.position?.[2] ?? 0) - (b.buildingHeight || 4)/2) - bz) < 0.5);
  const hasEast = allBuildings.some(b => b.buildingType === 'wheat_farm' && b.id !== building.id && Math.abs((b.gridPosition?.[0] ?? (b.position?.[0] ?? 0) - (b.buildingWidth || 4)/2) - (bx + width)) < 0.5 && Math.abs((b.gridPosition?.[1] ?? (b.position?.[2] ?? 0) - (b.buildingHeight || 4)/2) - bz) < 0.5);

  const wheatProg = building.productionProgress || 0;
  const wheatScale = Math.min(1.0, Math.max(0.2, wheatProg / 100));

  return (
    <group>
      <mesh material={mats.richSoil} position={[0, 0.04, 0]} receiveShadow>
        <boxGeometry args={[4.0, 0.08, 4.0]} />
      </mesh>

      {[-1.5, -1.0, -0.5, 0, 0.5, 1.0, 1.5].map((rz) => (
        <mesh key={`soil-furrow-${rz}`} material={mats.soilFurrow} position={[0, 0.085, rz]} receiveShadow>
          <boxGeometry args={[3.96, 0.03, 0.22]} />
        </mesh>
      ))}

      {!hasWest && (
        <mesh material={mats.timberDark} position={[-1.95, 0.18, 0]} castShadow>
          <boxGeometry args={[0.08, 0.22, 4.0]} />
        </mesh>
      )}
      {!hasEast && (
        <mesh material={mats.timberDark} position={[1.95, 0.18, 0]} castShadow>
          <boxGeometry args={[0.08, 0.22, 4.0]} />
        </mesh>
      )}
      {!hasNorth && (
        <mesh material={mats.timberDark} position={[0, 0.18, -1.95]} castShadow>
          <boxGeometry args={[4.0, 0.22, 0.08]} />
        </mesh>
      )}
      {!hasSouth && (
        <mesh material={mats.timberDark} position={[0, 0.18, 1.95]} castShadow>
          <boxGeometry args={[4.0, 0.22, 0.08]} />
        </mesh>
      )}

      {wheatProg >= 5 && (
        [-1.4, -0.9, -0.4, 0.1, 0.6, 1.1, 1.5].map((wx) =>
          [-1.4, -0.9, -0.4, 0.1, 0.6, 1.1, 1.5].map((wz) => (
            <group
              key={`wh-${wx}-${wz}`}
              position={[
                wx + Math.sin(wx * 7 + wz) * 0.06,
                0,
                wz + Math.cos(wz * 7 + wx) * 0.06,
              ]}
            >
              <mesh
                material={mats.goldWheat}
                position={[0, 0.08 + wheatScale * 0.18, 0]}
                scale={[0.11 * wheatScale, 0.38 * wheatScale, 0.11 * wheatScale]}
                castShadow
              >
                <coneGeometry args={[1, 1.2, 4]} />
              </mesh>
            </group>
          ))
        )
      )}

      <group position={[0, 0, 0]}>
        <mesh material={mats.timberDark} position={[0, 0.45, 0]} castShadow>
          <cylinderGeometry args={[0.02, 0.025, 0.9, 4]} />
        </mesh>
        <mesh material={mats.timberDark} position={[0, 0.65, 0]} rotation={[0, 0, Math.PI / 2]} castShadow>
          <cylinderGeometry args={[0.018, 0.018, 0.55, 4]} />
        </mesh>
        <mesh material={mats.goldWheat} position={[0, 0.8, 0]} castShadow>
          <sphereGeometry args={[0.08, 6, 6]} />
        </mesh>
        <mesh material={mats.thatchRoof} position={[0, 0.88, 0]} castShadow>
          <coneGeometry args={[0.18, 0.12, 6]} />
        </mesh>
        <mesh material={mats.redBanner} position={[0, 0.6, 0]} castShadow>
          <boxGeometry args={[0.22, 0.25, 0.12]} />
        </mesh>
      </group>
    </group>
  );
}
