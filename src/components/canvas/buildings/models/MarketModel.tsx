import type { RefObject } from 'react';
import * as THREE from 'three';
import { mergeGeometries } from 'three/examples/jsm/utils/BufferGeometryUtils.js';
import { SHARED_BUILDING_MATS } from '../buildingMaterials';
import { TimberBarrel } from '../common/BuildingPrimitives';

function toStandard(geo: THREE.BufferGeometry): THREE.BufferGeometry {
  const g = geo.index ? geo.toNonIndexed() : geo;
  if (!g.attributes.normal) g.computeVertexNormals();
  if (!g.attributes.uv) {
    const count = g.attributes.position.count;
    g.setAttribute('uv', new THREE.Float32BufferAttribute(new Float32Array(count * 2), 2));
  }
  const cleaned = new THREE.BufferGeometry();
  cleaned.setAttribute('position', g.attributes.position);
  cleaned.setAttribute('normal', g.attributes.normal);
  cleaned.setAttribute('uv', g.attributes.uv);
  return cleaned;
}

export const marketBaseGeometry = (() => {
  return toStandard(new THREE.BoxGeometry(3.96, 0.1, 1.96).translate(0, 0.05, 0));
})();

export const marketStructureGeometry = (() => {
  const geos: THREE.BufferGeometry[] = [];

  geos.push(toStandard(new THREE.BoxGeometry(3.96, 0.08, 0.08).translate(0, 0.15, 0.94)));
  geos.push(toStandard(new THREE.BoxGeometry(3.96, 0.08, 0.08).translate(0, 0.15, -0.94)));
  geos.push(toStandard(new THREE.BoxGeometry(0.08, 0.08, 1.96).translate(-1.94, 0.15, 0)));
  geos.push(toStandard(new THREE.BoxGeometry(0.08, 0.08, 1.96).translate(1.94, 0.15, 0)));

  for (const cx of [-1.6, 0, 1.6]) {
    for (const cz of [-0.75, 0.75]) {
      const post = new THREE.CylinderGeometry(0.06, 0.08, 1.45, 6).translate(cx, 0.82, cz);
      const strut = new THREE.BoxGeometry(0.06, 0.35, 0.06);
      strut.applyMatrix4(new THREE.Matrix4().makeRotationX(0.4).setPosition(cx, 0.82 + 0.58, cz));
      geos.push(toStandard(post), toStandard(strut));
    }
  }

  for (const lx of [-0.52, 0.52]) {
    for (const lz of [-0.18, 0.18]) {
      const leg = new THREE.CylinderGeometry(0.03, 0.035, 0.28, 6).translate(-0.9 + lx, 0.16 + 0.14, lz);
      geos.push(toStandard(leg));
    }
  }

  for (const lx of [-0.52, 0.52]) {
    for (const lz of [-0.18, 0.18]) {
      const leg = new THREE.CylinderGeometry(0.03, 0.035, 0.28, 6).translate(0.9 + lx, 0.16 + 0.14, lz);
      geos.push(toStandard(leg));
    }
  }

  geos.push(toStandard(new THREE.BoxGeometry(3.95, 0.1, 0.1).translate(0, 1.62, 0)));

  return mergeGeometries(geos) || geos[0];
})();

export const marketPlanksGeometry = (() => {
  const geos: THREE.BufferGeometry[] = [];
  geos.push(toStandard(new THREE.BoxGeometry(3.92, 0.06, 1.92).translate(0, 0.13, 0)));

  geos.push(toStandard(new THREE.BoxGeometry(1.06, 0.02, 0.36).translate(-0.9, 0.16 + 0.06, 0)));
  geos.push(toStandard(new THREE.BoxGeometry(1.18, 0.04, 0.46).translate(-0.9, 0.16 + 0.28, 0)));

  geos.push(toStandard(new THREE.BoxGeometry(1.06, 0.02, 0.36).translate(0.9, 0.16 + 0.06, 0)));
  geos.push(toStandard(new THREE.BoxGeometry(1.18, 0.04, 0.46).translate(0.9, 0.16 + 0.28, 0)));

  return mergeGeometries(geos) || geos[0];
})();

export const marketRoofGeometry = (() => {
  const geos: THREE.BufferGeometry[] = [];
  const s1 = new THREE.BoxGeometry(3.96, 1.15, 0.1);
  s1.applyMatrix4(new THREE.Matrix4().makeRotationX(-0.55).setPosition(0, 1.45, 0.5));

  const s2 = new THREE.BoxGeometry(3.96, 1.15, 0.1);
  s2.applyMatrix4(new THREE.Matrix4().makeRotationX(0.55).setPosition(0, 1.45, -0.5));

  const ridge = new THREE.BoxGeometry(3.98, 0.12, 0.15).translate(0, 1.76, 0);

  geos.push(toStandard(s1), toStandard(s2), toStandard(ridge));
  return mergeGeometries(geos) || geos[0];
})();

export const marketAwningsGeometry = (() => {
  const geos: THREE.BufferGeometry[] = [];
  geos.push(toStandard(new THREE.BoxGeometry(0.56, 0.18, 0.02).translate(-0.9, 0.16 + 0.18, 0.23)));
  geos.push(toStandard(new THREE.BoxGeometry(0.56, 0.18, 0.02).translate(0.9, 0.16 + 0.18, 0.23)));

  return mergeGeometries(geos) || geos[0];
})();

export function MarketModel({
  roofRef,
}: {
  roofRef?: RefObject<THREE.Group | null>;
}) {
  const mats = SHARED_BUILDING_MATS;

  return (
    <group>
      <mesh geometry={marketBaseGeometry} material={mats.stoneDark} receiveShadow />
      <mesh geometry={marketStructureGeometry} material={mats.timberDark} />
      <mesh geometry={marketPlanksGeometry} material={mats.floorPlanks} receiveShadow />
      <mesh geometry={marketAwningsGeometry} material={mats.redBanner} />

      <TimberBarrel position={[1.45, 0.12, 0.05]} scale={0.55} />

      <group ref={roofRef}>
        <mesh geometry={marketRoofGeometry} material={mats.thatchRoof} castShadow />
      </group>
    </group>
  );
}
