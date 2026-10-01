import * as THREE from 'three';
import { mergeGeometries } from 'three/examples/jsm/utils/BufferGeometryUtils.js';
import { buildingEntities, type GameEntity } from '../../../../engine/ecs/world';
import { SHARED_BUILDING_MATS } from '../buildingMaterials';

function toStandard(geo: THREE.BufferGeometry): THREE.BufferGeometry {
  return geo.index ? geo.toNonIndexed() : geo;
}

export const wheatBaseSoilGeo = (() => {
  const g = new THREE.BoxGeometry(4.0, 0.08, 4.0);
  g.translate(0, 0.04, 0);
  return toStandard(g);
})();

export const wheatFurrowsGeo = (() => {
  const geos: THREE.BufferGeometry[] = [];
  for (const rz of [-1.5, -1.0, -0.5, 0, 0.5, 1.0, 1.5]) {
    const g = new THREE.BoxGeometry(3.96, 0.03, 0.22);
    g.translate(0, 0.085, rz);
    geos.push(toStandard(g));
  }
  return mergeGeometries(geos) || geos[0];
})();

export const wheatFieldGeo = (() => {
  const geos: THREE.BufferGeometry[] = [];
  const xs = [-1.4, -0.9, -0.4, 0.1, 0.6, 1.1, 1.5];
  const zs = [-1.4, -0.9, -0.4, 0.1, 0.6, 1.1, 1.5];
  for (const wx of xs) {
    for (const wz of zs) {
      const g = new THREE.ConeGeometry(0.11, 0.38, 4);
      g.translate(0, 0.19, 0);
      const posX = wx + Math.sin(wx * 7 + wz) * 0.06;
      const posZ = wz + Math.cos(wz * 7 + wx) * 0.06;
      g.translate(posX, 0.08, posZ);
      geos.push(toStandard(g));
    }
  }
  return mergeGeometries(geos) || geos[0];
})();

export const scarecrowWoodGeo = (() => {
  const geos: THREE.BufferGeometry[] = [];
  const pole = new THREE.CylinderGeometry(0.02, 0.025, 0.9, 4); pole.translate(0, 0.45, 0); geos.push(toStandard(pole));
  const cross = new THREE.CylinderGeometry(0.018, 0.018, 0.55, 4);
  cross.applyMatrix4(new THREE.Matrix4().makeRotationZ(Math.PI / 2).setPosition(0, 0.65, 0));
  geos.push(toStandard(cross));
  return mergeGeometries(geos) || geos[0];
})();

export const scarecrowDetailsGeo = (() => {
  const geos: THREE.BufferGeometry[] = [];
  const head = new THREE.SphereGeometry(0.08, 6, 6); head.translate(0, 0.8, 0); geos.push(toStandard(head));
  return mergeGeometries(geos) || geos[0];
})();

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
      <mesh geometry={wheatBaseSoilGeo} material={mats.richSoil} receiveShadow />
      <mesh geometry={wheatFurrowsGeo} material={mats.soilFurrow} receiveShadow />

      {!hasWest && (
        <mesh material={mats.timberDark} position={[-1.95, 0.18, 0]}>
          <boxGeometry args={[0.08, 0.22, 4.0]} />
        </mesh>
      )}
      {!hasEast && (
        <mesh material={mats.timberDark} position={[1.95, 0.18, 0]}>
          <boxGeometry args={[0.08, 0.22, 4.0]} />
        </mesh>
      )}
      {!hasNorth && (
        <mesh material={mats.timberDark} position={[0, 0.18, -1.95]}>
          <boxGeometry args={[4.0, 0.22, 0.08]} />
        </mesh>
      )}
      {!hasSouth && (
        <mesh material={mats.timberDark} position={[0, 0.18, 1.95]}>
          <boxGeometry args={[4.0, 0.22, 0.08]} />
        </mesh>
      )}

      {wheatProg >= 5 && (
        <mesh
          geometry={wheatFieldGeo}
          material={mats.goldWheat}
          scale={[1, wheatScale, 1]}
        />
      )}

      <mesh geometry={scarecrowWoodGeo} material={mats.timberDark} />
      <mesh geometry={scarecrowDetailsGeo} material={mats.goldWheat} />
      <mesh material={mats.thatchRoof} position={[0, 0.88, 0]}>
        <coneGeometry args={[0.18, 0.12, 6]} />
      </mesh>
      <mesh material={mats.redBanner} position={[0, 0.6, 0]}>
        <boxGeometry args={[0.22, 0.25, 0.12]} />
      </mesh>
    </group>
  );
}
