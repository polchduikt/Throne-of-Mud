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

  const blueprint = activeBuildType ? BUILDING_BLUEPRINTS[activeBuildType] : null;

  const geometries = useMemo(() => {
    if (!blueprint) return null;
    const plane = new THREE.PlaneGeometry(blueprint.width * 0.98, blueprint.height * 0.98);
    const box = new THREE.BoxGeometry(blueprint.width * 0.9, 1.0, blueprint.height * 0.9);
    const cone = new THREE.ConeGeometry(Math.max(blueprint.width, blueprint.height) * 0.65, 0.6, 4);
    return { plane, box, cone };
  }, [blueprint]);

  const materials = useMemo(() => ({
    validPlane: new THREE.MeshBasicMaterial({ color: '#22c55e', transparent: true, opacity: 0.35, side: THREE.DoubleSide }),
    invalidPlane: new THREE.MeshBasicMaterial({ color: '#ef4444', transparent: true, opacity: 0.35, side: THREE.DoubleSide }),
    validBox: new THREE.MeshStandardMaterial({ color: '#22c55e', transparent: true, opacity: 0.3, roughness: 0.4 }),
    invalidBox: new THREE.MeshStandardMaterial({ color: '#ef4444', transparent: true, opacity: 0.3, roughness: 0.4 }),
    validCone: new THREE.MeshStandardMaterial({ color: '#22c55e', transparent: true, opacity: 0.35, roughness: 0.4 }),
    invalidCone: new THREE.MeshStandardMaterial({ color: '#ef4444', transparent: true, opacity: 0.35, roughness: 0.4 }),
  }), []);

  if (activeTool !== 'build' || !activeBuildType || !hoveredTile || !blueprint || !geometries) {
    return null;
  }

  const posX = hoveredTile[0] + blueprint.width / 2;
  const posZ = hoveredTile[1] + blueprint.height / 2;

  const planeMat = isValid ? materials.validPlane : materials.invalidPlane;
  const boxMat = isValid ? materials.validBox : materials.invalidBox;
  const coneMat = isValid ? materials.validCone : materials.invalidCone;

  return (
    <group position={[posX, 0, posZ]}>
      <mesh
        geometry={geometries.plane}
        material={planeMat}
        position={[0, 0.01, 0]}
        rotation={[-Math.PI / 2, 0, 0]}
      />

      <mesh
        geometry={geometries.box}
        material={boxMat}
        position={[0, 0.5, 0]}
      />

      <mesh
        geometry={geometries.cone}
        material={coneMat}
        position={[0, 1.3, 0]}
        rotation={[0, Math.PI / 4, 0]}
      />
    </group>
  );
}

