import type { RefObject } from 'react';
import * as THREE from 'three';
import { mergeGeometries } from 'three/examples/jsm/utils/BufferGeometryUtils.js';
import { SHARED_BUILDING_MATS } from '../buildingMaterials';

function toStandard(geo: THREE.BufferGeometry): THREE.BufferGeometry {
  return geo.index ? geo.toNonIndexed() : geo;
}

export const clayPitSoilGeo = (() => {
  const g = new THREE.BoxGeometry(3.92, 0.08, 2.92); g.translate(0, 0.04, 0);
  return toStandard(g);
})();

export const clayPitClayGeo = (() => {
  const geos: THREE.BufferGeometry[] = [];
  const t1 = new THREE.BoxGeometry(2.40, 0.24, 1.80); t1.translate(-0.55, 0.08 + 0.16, -0.40); geos.push(toStandard(t1));
  const t2 = new THREE.BoxGeometry(1.70, 0.22, 1.20); t2.translate(-0.55 - 0.25, 0.08 + 0.32, -0.40 - 0.20); geos.push(toStandard(t2));

  const cCart = new THREE.BoxGeometry(0.85, 0.08, 0.45); cCart.translate(1.05, 0.08 + 0.24, 0.65); geos.push(toStandard(cCart));

  const m1 = new THREE.SphereGeometry(0.28, 8, 8); m1.translate(-1.10, 0.08 + 0.14, 0.70); geos.push(toStandard(m1));
  const m2 = new THREE.SphereGeometry(0.20, 8, 8); m2.translate(-1.10 + 0.26, 0.08 + 0.09, 0.70 + 0.12); geos.push(toStandard(m2));
  const m3 = new THREE.SphereGeometry(0.18, 8, 8); m3.translate(-1.10 - 0.22, 0.08 + 0.10, 0.70 - 0.10); geos.push(toStandard(m3));

  return mergeGeometries(geos) || geos[0];
})();

export const clayPitTimberLogsGeo = (() => {
  const geos: THREE.BufferGeometry[] = [];
  const pitM = new THREE.Matrix4().setPosition(-0.55, 0.08, -0.40);

  const sh1 = new THREE.BoxGeometry(0.12, 0.45, 1.76);
  sh1.applyMatrix4(new THREE.Matrix4().makeRotationZ(0.08).setPosition(1.18, 0.22, 0).premultiply(pitM));
  geos.push(toStandard(sh1));

  const sh2 = new THREE.BoxGeometry(2.36, 0.45, 0.12);
  sh2.applyMatrix4(new THREE.Matrix4().makeRotationX(0.08).setPosition(-0.05, 0.22, 0.88).premultiply(pitM));
  geos.push(toStandard(sh2));

  return mergeGeometries(geos) || geos[0];
})();

export const clayPitTimberDarkGeo = (() => {
  const geos: THREE.BufferGeometry[] = [];
  for (const x of [-1.15, 0.10, 1.15]) {
    const post = new THREE.BoxGeometry(0.12, 0.60, 0.12);
    post.translate(-0.55 + x, 0.08 + 0.28, -0.40 + 0.88);
    geos.push(toStandard(post));
  }

  const barrow = new THREE.BoxGeometry(0.95, 0.28, 0.55);
  barrow.translate(1.05, 0.08 + 0.14, 0.65);
  geos.push(toStandard(barrow));

  const shedM = new THREE.Matrix4().setPosition(1.05, 0.08, -0.65);
  for (const px of [-0.45, 0.45]) {
    const pBack = new THREE.BoxGeometry(0.08, 1.20, 0.08);
    pBack.applyMatrix4(new THREE.Matrix4().setPosition(px, 0.60, -0.35).premultiply(shedM));
    geos.push(toStandard(pBack));

    const pFront = new THREE.BoxGeometry(0.08, 0.90, 0.08);
    pFront.applyMatrix4(new THREE.Matrix4().setPosition(px, 0.45, 0.35).premultiply(shedM));
    geos.push(toStandard(pFront));
  }

  return mergeGeometries(geos) || geos[0];
})();

export const clayPitBarrelsGeo = (() => {
  const geos: THREE.BufferGeometry[] = [];
  const b1 = new THREE.CylinderGeometry(0.10, 0.08, 0.22, 8); b1.translate(1.05 - 0.38, 0.08 + 0.12, 0.65 + 0.38); geos.push(toStandard(b1));
  const b2 = new THREE.CylinderGeometry(0.20, 0.17, 0.42, 8); b2.translate(1.05 + 0.15, 0.08 + 0.22, -0.65); geos.push(toStandard(b2));
  return mergeGeometries(geos) || geos[0];
})();

export const clayPitRoofGeo = (() => {
  const roof = new THREE.BoxGeometry(1.25, 0.08, 0.95);
  roof.applyMatrix4(new THREE.Matrix4().makeRotationX(0.28).setPosition(1.05, 0.08 + 1.15, -0.65));
  return toStandard(roof);
})();

export function ClayPitModel({
  isLightOn = false,
  roofRef,
}: {
  isLightOn?: boolean;
  roofRef?: RefObject<THREE.Group | null>;
}) {
  const mats = SHARED_BUILDING_MATS;
  void isLightOn;

  return (
    <group>
      <mesh geometry={clayPitSoilGeo} material={mats.richSoil} receiveShadow />
      <mesh geometry={clayPitClayGeo} material={mats.clayOrange} receiveShadow />
      <mesh geometry={clayPitTimberLogsGeo} material={mats.timberLogs} />
      <mesh geometry={clayPitTimberDarkGeo} material={mats.timberDark} receiveShadow />
      <mesh geometry={clayPitBarrelsGeo} material={mats.barrelWood} />

      <group position={[1.05 + 0.35, 0.08 + 0.25, 0.65 - 0.05]} rotation={[0.25, 0.20, -0.25]}>
        <mesh material={mats.timberDark} position={[0, 0.25, 0]}>
          <cylinderGeometry args={[0.015, 0.015, 0.65, 5]} />
        </mesh>
        <mesh material={mats.ironSteel} position={[0, -0.08, 0]}>
          <boxGeometry args={[0.12, 0.18, 0.02]} />
        </mesh>
      </group>

      <group ref={roofRef}>
        <mesh geometry={clayPitRoofGeo} material={mats.thatchRoof} castShadow receiveShadow />
      </group>
    </group>
  );
}
