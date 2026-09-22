import { useMemo } from 'react';
import * as THREE from 'three';
import { GridMap } from '../../engine/grid/GridMap';
import { useGameStore } from '../../store/useGameStore';
import { BUILDING_BLUEPRINTS } from '../../engine/buildings/blueprints';

interface Props {
  grid: GridMap;
}

export function PlacementPreview({ grid }: Props) {
  const activeTool = useGameStore((s) => s.activeTool);
  const activeBuildType = useGameStore((s) => s.activeBuildType);
  const hoveredTile = useGameStore((s) => s.hoveredTile);

  const isValid = useMemo(() => {
    if (!hoveredTile || activeTool !== 'build' || !activeBuildType) return false;
    const blueprint = BUILDING_BLUEPRINTS[activeBuildType];
    if (!blueprint) return false;
    return grid.canBuildAt(hoveredTile[0], hoveredTile[1], blueprint.width, blueprint.height);
  }, [hoveredTile, activeTool, activeBuildType, grid]);

  if (activeTool !== 'build' || !activeBuildType || !hoveredTile) {
    return null;
  }

  const blueprint = BUILDING_BLUEPRINTS[activeBuildType];
  if (!blueprint) return null;

  const posX = hoveredTile[0] + blueprint.width / 2;
  const posZ = hoveredTile[1] + blueprint.height / 2;
  const color = isValid ? '#22c55e' : '#ef4444';

  return (
    <group position={[posX, 0, posZ]}>
      <mesh position={[0, 0.01, 0]} rotation={[-Math.PI / 2, 0, 0]}>
        <planeGeometry args={[blueprint.width * 0.98, blueprint.height * 0.98]} />
        <meshBasicMaterial
          color={color}
          transparent
          opacity={0.35}
          side={THREE.DoubleSide}
        />
      </mesh>

      <mesh position={[0, 0.5, 0]}>
        <boxGeometry args={[blueprint.width * 0.9, 1.0, blueprint.height * 0.9]} />
        <meshStandardMaterial
          color={color}
          transparent
          opacity={0.3}
          roughness={0.4}
        />
      </mesh>

      <mesh position={[0, 1.3, 0]} rotation={[0, Math.PI / 4, 0]}>
        <coneGeometry args={[Math.max(blueprint.width, blueprint.height) * 0.65, 0.6, 4]} />
        <meshStandardMaterial
          color={color}
          transparent
          opacity={0.35}
          roughness={0.4}
        />
      </mesh>
    </group>
  );
}

