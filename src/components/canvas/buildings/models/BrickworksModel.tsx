import type { RefObject } from 'react';
import * as THREE from 'three';
import { mergeGeometries } from 'three/examples/jsm/utils/BufferGeometryUtils.js';
import { SHARED_BUILDING_MATS } from '../buildingMaterials';
import { ChimneySmoke } from '../common/BuildingPrimitives';

function toStandard(geo: THREE.BufferGeometry): THREE.BufferGeometry {
  return geo.index ? geo.toNonIndexed() : geo;
}

export const brickworksStoneDarkGeo = (() => {
  const geos: THREE.BufferGeometry[] = [];
  const base = new THREE.BoxGeometry(4.92, 0.10, 2.92); base.translate(0, 0.05, 0); geos.push(toStandard(base));
  const kBase = new THREE.BoxGeometry(1.68, 0.40, 2.10); kBase.translate(-1.45, 0.31, -0.10); geos.push(toStandard(kBase));
  const kCollar = new THREE.CylinderGeometry(0.55, 0.74, 0.15, 12); kCollar.translate(-1.45, 1.56, -0.10); geos.push(toStandard(kCollar));
  return mergeGeometries(geos) || geos[0];
})();

export const brickworksStoneLightGeo = (() => {
  const geos: THREE.BufferGeometry[] = [];
  const arch = new THREE.BoxGeometry(0.72, 0.58, 0.14); arch.translate(-1.45, 0.56, 0.92); geos.push(toStandard(arch));
  const cornice = new THREE.BoxGeometry(0.60, 0.08, 0.60); cornice.translate(-1.45, 2.51, -0.55); geos.push(toStandard(cornice));
  const rim = new THREE.TorusGeometry(0.15, 0.035, 8, 16);
  rim.applyMatrix4(new THREE.Matrix4().makeRotationX(Math.PI / 2).setPosition(-1.45, 2.74, -0.55));
  geos.push(toStandard(rim));
  return mergeGeometries(geos) || geos[0];
})();

export const brickworksSoilGeo = (() => {
  const geos: THREE.BufferGeometry[] = [];
  const gSoil = new THREE.BoxGeometry(4.76, 0.03, 2.76); gSoil.translate(0, 0.105, 0); geos.push(toStandard(gSoil));
  const tSoil = new THREE.BoxGeometry(0.72, 0.10, 0.92); tSoil.translate(0, 0.46, -0.75); geos.push(toStandard(tSoil));
  return mergeGeometries(geos) || geos[0];
})();

export const brickworksBrickRedGeo = (() => {
  const geos: THREE.BufferGeometry[] = [];
  const body = new THREE.BoxGeometry(1.56, 0.75, 2.0); body.translate(-1.45, 0.86, -0.10); geos.push(toStandard(body));
  const dome = new THREE.CylinderGeometry(0.74, 0.78, 0.35, 12); dome.translate(-1.45, 1.36, -0.10); geos.push(toStandard(dome));
  const stack = new THREE.BoxGeometry(0.52, 0.95, 0.52); stack.translate(-1.45, 2.01, -0.55); geos.push(toStandard(stack));
  const pot = new THREE.CylinderGeometry(0.16, 0.19, 0.20, 8); pot.translate(-1.45, 2.63, -0.55); geos.push(toStandard(pot));

  for (let bIdx = 0; bIdx < 5; bIdx++) {
    const bx = [-0.45, -0.22, 0.0, 0.22, 0.45][bIdx];
    const bz = bIdx % 2 === 0 ? 0.18 : -0.18;
    const b = new THREE.BoxGeometry(0.18, 0.07, 0.13);
    b.translate(1.45 + bx, 0.11 + 0.32 + 0.06, -0.30 + bz);
    geos.push(toStandard(b));
  }

  const p1 = new THREE.BoxGeometry(0.36, 0.09, 0.56); p1.translate(1.45 - 0.24, 0.21, 0.75); geos.push(toStandard(p1));
  const p2 = new THREE.BoxGeometry(0.36, 0.09, 0.56); p2.translate(1.45 + 0.24, 0.21, 0.75); geos.push(toStandard(p2));
  const p3 = new THREE.BoxGeometry(0.78, 0.09, 0.52); p3.translate(1.45, 0.30, 0.75); geos.push(toStandard(p3));
  const p4 = new THREE.BoxGeometry(0.56, 0.08, 0.40); p4.translate(1.45, 0.39, 0.75); geos.push(toStandard(p4));

  const ridge = new THREE.BoxGeometry(2.96, 0.10, 0.16); ridge.translate(0.90, 2.46, -0.03); geos.push(toStandard(ridge));

  return mergeGeometries(geos) || geos[0];
})();

export const brickworksClayOrangeGeo = (() => {
  const geos: THREE.BufferGeometry[] = [];
  const lump = new THREE.DodecahedronGeometry(0.16, 0); lump.translate(0.10, 0.53, -0.63); geos.push(toStandard(lump));

  const b1 = new THREE.BoxGeometry(0.30, 0.06, 0.18); b1.translate(-0.24, 0.50, 0.65); geos.push(toStandard(b1));
  const b2 = new THREE.BoxGeometry(0.24, 0.07, 0.14); b2.translate(0.26, 0.49, 0.65); geos.push(toStandard(b2));

  for (let idx = 1; idx <= 2; idx++) {
    const y = idx === 1 ? 0.70 : 1.08;
    for (let bIdx = 0; bIdx < 5; bIdx++) {
      const bx = [-0.45, -0.22, 0.0, 0.22, 0.45][bIdx];
      const bz = bIdx % 2 === 0 ? 0.18 : -0.18;
      const b = new THREE.BoxGeometry(0.18, 0.07, 0.13);
      b.translate(1.45 + bx, 0.11 + y + 0.06, -0.30 + bz);
      geos.push(toStandard(b));
    }
  }

  return mergeGeometries(geos) || geos[0];
})();

export const brickworksTimberGeo = (() => {
  const geos: THREE.BufferGeometry[] = [];

  const fLogM = new THREE.Matrix4().makeRotationY(Math.PI / 2).setPosition(-1.45 - 0.75, 0.11, -0.10 + 0.45);
  for (const z of [-0.15, 0.15]) {
    const log = new THREE.CylinderGeometry(0.07, 0.07, 0.75, 6);
    log.applyMatrix4(new THREE.Matrix4().makeRotationZ(Math.PI / 2).setPosition(0, 0.08, z).premultiply(fLogM));
    geos.push(toStandard(log));
  }
  const topLog = new THREE.CylinderGeometry(0.065, 0.065, 0.72, 6);
  topLog.applyMatrix4(new THREE.Matrix4().makeRotationZ(Math.PI / 2).setPosition(0, 0.20, 0).premultiply(fLogM));
  geos.push(toStandard(topLog));

  const trough = new THREE.BoxGeometry(0.85, 0.40, 1.05); trough.translate(0, 0.31, -0.75); geos.push(toStandard(trough));

  for (const lx of [-0.50, 0.50]) {
    for (const lz of [-0.26, 0.26]) {
      const leg = new THREE.BoxGeometry(0.06, 0.30, 0.06);
      leg.translate(lx, 0.26, 0.65 + lz);
      geos.push(toStandard(leg));
    }
  }
  const mouldFrame = new THREE.BoxGeometry(0.36, 0.07, 0.24); mouldFrame.translate(-0.24, 0.49, 0.65); geos.push(toStandard(mouldFrame));

  const barrel = new THREE.CylinderGeometry(0.14, 0.11, 0.28, 8); barrel.translate(0.46, 0.27, 0.65 + 0.42); geos.push(toStandard(barrel));

  for (const rx of [-0.60, 0.60]) {
    for (const rz of [-0.45, 0.45]) {
      const up = new THREE.BoxGeometry(0.08, 1.40, 0.08);
      up.translate(1.45 + rx, 0.81, -0.30 + rz);
      geos.push(toStandard(up));
    }
  }

  const posts: [number, number][] = [
    [-0.45, 1.25], [2.25, 1.25], [-0.45, -1.30], [2.25, -1.30]
  ];
  for (const [px, pz] of posts) {
    const post = new THREE.BoxGeometry(0.12, 1.70, 0.12);
    post.translate(px, 0.95, pz);
    geos.push(toStandard(post));
  }

  const b1 = new THREE.BoxGeometry(2.80, 0.10, 0.12); b1.translate(0.90, 1.80, 1.25); geos.push(toStandard(b1));
  const b2 = new THREE.BoxGeometry(2.80, 0.10, 0.12); b2.translate(0.90, 1.80, -1.30); geos.push(toStandard(b2));
  const b3 = new THREE.BoxGeometry(0.12, 0.10, 2.55); b3.translate(-0.45, 1.80, -0.025); geos.push(toStandard(b3));
  const b4 = new THREE.BoxGeometry(0.12, 0.10, 2.55); b4.translate(2.25, 1.80, -0.025); geos.push(toStandard(b4));

  return mergeGeometries(geos) || geos[0];
})();

export const brickworksTimberPlanksGeo = (() => {
  const geos: THREE.BufferGeometry[] = [];
  const tableTop = new THREE.BoxGeometry(1.15, 0.05, 0.68); tableTop.translate(0, 0.43, 0.65); geos.push(toStandard(tableTop));

  for (const y of [0.32, 0.70, 1.08]) {
    const shelf = new THREE.BoxGeometry(1.32, 0.035, 0.95);
    shelf.translate(1.45, 0.11 + y, -0.30);
    geos.push(toStandard(shelf));
  }

  const pallet = new THREE.BoxGeometry(0.95, 0.04, 0.70); pallet.translate(1.45, 0.14, 0.75); geos.push(toStandard(pallet));

  return mergeGeometries(geos) || geos[0];
})();

export const brickworksFireGeo = (() => {
  const geos: THREE.BufferGeometry[] = [];
  const f1 = new THREE.BoxGeometry(0.42, 0.36, 0.04); f1.translate(-1.45, 0.45, 0.98); geos.push(toStandard(f1));
  const f2 = new THREE.BoxGeometry(0.28, 0.24, 0.04); f2.translate(-1.45, 0.37, 0.99); geos.push(toStandard(f2));
  return mergeGeometries(geos) || geos[0];
})();

export const brickworksCharredGeo = (() => {
  const geos: THREE.BufferGeometry[] = [];
  const back = new THREE.BoxGeometry(0.52, 0.46, 0.06); back.translate(-1.45, 0.49, 0.97); geos.push(toStandard(back));
  const soot = new THREE.CircleGeometry(0.145, 12);
  soot.applyMatrix4(new THREE.Matrix4().makeRotationX(-Math.PI / 2).setPosition(-1.45, 2.74, -0.55));
  geos.push(toStandard(soot));
  return mergeGeometries(geos) || geos[0];
})();

export const brickworksRoofGeo = (() => {
  const geos: THREE.BufferGeometry[] = [];
  const s1 = new THREE.BoxGeometry(2.92, 0.09, 1.65);
  s1.applyMatrix4(new THREE.Matrix4().makeRotationX(-0.45).setPosition(0.90, 2.12, -0.68));
  geos.push(toStandard(s1));

  const s2 = new THREE.BoxGeometry(2.92, 0.09, 1.65);
  s2.applyMatrix4(new THREE.Matrix4().makeRotationX(0.45).setPosition(0.90, 2.12, 0.62));
  geos.push(toStandard(s2));

  return mergeGeometries(geos) || geos[0];
})();

export function BrickworksModel({
  isLightOn = false,
  isWorking = true,
  roofRef,
}: {
  isLightOn?: boolean;
  isWorking?: boolean;
  roofRef?: RefObject<THREE.Group | null>;
}) {
  const mats = SHARED_BUILDING_MATS;
  void isLightOn;

  return (
    <group>
      <mesh geometry={brickworksStoneDarkGeo} material={mats.stoneDark} receiveShadow />
      <mesh geometry={brickworksStoneLightGeo} material={mats.stoneLight} />
      <mesh geometry={brickworksSoilGeo} material={mats.richSoil} receiveShadow />
      <mesh geometry={brickworksBrickRedGeo} material={mats.brickRed} castShadow receiveShadow />
      <mesh geometry={brickworksClayOrangeGeo} material={mats.clayOrange} />
      <mesh geometry={brickworksTimberGeo} material={mats.timberDark} castShadow receiveShadow />
      <mesh geometry={brickworksTimberPlanksGeo} material={mats.timberPlanks} receiveShadow />
      <mesh geometry={brickworksFireGeo} material={mats.fireOrange} />
      <mesh geometry={brickworksCharredGeo} material={mats.charcoalBlack} />

      {isWorking && <ChimneySmoke position={[-1.45, 2.79, -0.55]} />}

      <group ref={roofRef}>
        <mesh geometry={brickworksRoofGeo} material={mats.shingleRoof} castShadow receiveShadow />
      </group>
    </group>
  );
}
