import type { RefObject } from 'react';
import * as THREE from 'three';
import { mergeGeometries } from 'three/examples/jsm/utils/BufferGeometryUtils.js';
import { SHARED_BUILDING_MATS } from '../buildingMaterials';
import { MedievalDoor, MedievalWindow } from '../common/BuildingPrimitives';

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

export const barracksStoneBaseGeo = (() => {
  const base = new THREE.BoxGeometry(4.96, 0.24, 2.96); base.translate(0, 0.12, 0);
  return toStandard(base);
})();

export const barracksFloorGeo = (() => {
  const f = new THREE.BoxGeometry(4.76, 0.04, 2.76).translate(0, 0.14, 0);
  return toStandard(f);
})();

export const barracksLogWallsGeo = (() => {
  const geos: THREE.BufferGeometry[] = [];
  const back = new THREE.BoxGeometry(4.84, 1.25, 0.14); back.translate(0, 0.8, -1.35); geos.push(toStandard(back));
  const left = new THREE.BoxGeometry(0.14, 1.25, 2.74); left.translate(-2.35, 0.8, 0); geos.push(toStandard(left));
  const right = new THREE.BoxGeometry(0.14, 1.25, 2.74); right.translate(2.35, 0.8, 0); geos.push(toStandard(right));
  const fLeft = new THREE.BoxGeometry(1.76, 1.25, 0.14); fLeft.translate(-1.48, 0.8, 1.35); geos.push(toStandard(fLeft));
  const fRight = new THREE.BoxGeometry(1.76, 1.25, 0.14); fRight.translate(1.48, 0.8, 1.35); geos.push(toStandard(fRight));
  return mergeGeometries(geos) || geos[0];
})();

export const barracksTimberDarkGeo = (() => {
  const geos: THREE.BufferGeometry[] = [];
  const lintel = new THREE.BoxGeometry(1.24, 0.22, 0.16); lintel.translate(0, 1.32, 1.35); geos.push(toStandard(lintel));

  for (const cx of [-2.38, 2.38]) {
    for (const cz of [-1.38, 1.38]) {
      const p = new THREE.BoxGeometry(0.18, 1.4, 0.18).translate(cx, 0.8, cz);
      geos.push(toStandard(p));
    }
  }

  for (const dx of [-0.62, 0.62]) {
    const p = new THREE.BoxGeometry(0.14, 1.35, 0.16).translate(dx, 0.8, 1.36);
    geos.push(toStandard(p));
  }

  return mergeGeometries(geos) || geos[0];
})();

export const barracksRoofGeometry = (() => {
  const geos: THREE.BufferGeometry[] = [];

  const sLeft = new THREE.BoxGeometry(5.02, 1.95, 0.16);
  sLeft.applyMatrix4(new THREE.Matrix4().makeRotationX(-0.73).setPosition(0, 2.05, 0.72));
  const sRight = new THREE.BoxGeometry(5.02, 1.95, 0.16);
  sRight.applyMatrix4(new THREE.Matrix4().makeRotationX(0.73).setPosition(0, 2.05, -0.72));
  geos.push(toStandard(sLeft), toStandard(sRight));

  const baseW = 2.74;
  const gHeight = 1.25;
  const half = baseW / 2;
  const s = new THREE.Shape();
  s.moveTo(-half, 0); s.lineTo(half, 0); s.lineTo(0, gHeight); s.closePath();

  const gL = new THREE.ExtrudeGeometry(s, { depth: 0.14, bevelEnabled: false });
  gL.applyMatrix4(new THREE.Matrix4().makeRotationY(-Math.PI / 2).setPosition(-2.35, 1.42, 0));
  const gR = new THREE.ExtrudeGeometry(s, { depth: 0.14, bevelEnabled: false });
  gR.applyMatrix4(new THREE.Matrix4().makeRotationY(Math.PI / 2).setPosition(2.35, 1.42, 0));
  geos.push(toStandard(gL), toStandard(gR));

  return mergeGeometries(geos) || geos[0];
})();

export const barracksRoofTrimGeometry = (() => {
  const geos: THREE.BufferGeometry[] = [];
  geos.push(toStandard(new THREE.BoxGeometry(5.06, 0.16, 0.16).translate(0, 2.72, 0)));
  const fLeft = new THREE.BoxGeometry(5.02, 0.12, 0.16);
  fLeft.applyMatrix4(new THREE.Matrix4().makeRotationX(-0.73).setPosition(0, 1.45, 1.38));
  const fRight = new THREE.BoxGeometry(5.02, 0.12, 0.16);
  fRight.applyMatrix4(new THREE.Matrix4().makeRotationX(0.73).setPosition(0, 1.45, -1.38));
  geos.push(toStandard(fLeft), toStandard(fRight));

  for (const gx of [-2.45, 2.45]) {
    const post = new THREE.BoxGeometry(0.08, 0.44, 0.08).translate(gx, 2.85, 0);
    geos.push(toStandard(post));
  }
  return mergeGeometries(geos) || geos[0];
})();

const barracksInteriorFurnitureGeo = (() => {
  const geos: THREE.BufferGeometry[] = [];

  const bedX = -1.65; const bedZ = -0.5;
  for (const px of [-0.42, 0.42]) {
    for (const pz of [-0.75, 0.75]) {
      geos.push(toStandard(new THREE.BoxGeometry(0.08, 1.35, 0.08).translate(bedX + px, 0.14 + 0.675, bedZ + pz)));
    }
  }
  geos.push(toStandard(new THREE.BoxGeometry(0.8, 0.06, 1.45).translate(bedX, 0.14 + 0.32, bedZ)));
  geos.push(toStandard(new THREE.BoxGeometry(0.8, 0.06, 1.45).translate(bedX, 0.14 + 0.95, bedZ)));

  geos.push(toStandard(new THREE.BoxGeometry(1.0, 0.05, 0.68).translate(0, 0.14 + 0.3, 0)));
  for (const tx of [-0.42, 0.42]) {
    for (const tz of [-0.26, 0.26]) {
      geos.push(toStandard(new THREE.CylinderGeometry(0.035, 0.035, 0.3, 4).translate(tx, 0.14 + 0.15, tz)));
    }
  }
  geos.push(toStandard(new THREE.BoxGeometry(0.88, 0.04, 0.2).translate(0, 0.14 + 0.18, -0.52)));
  geos.push(toStandard(new THREE.BoxGeometry(0.88, 0.04, 0.2).translate(0, 0.14 + 0.18, 0.52)));

  geos.push(toStandard(new THREE.BoxGeometry(0.1, 0.85, 1.1).translate(1.75, 0.14 + 0.45, -0.6)));

  return mergeGeometries(geos) || geos[0];
})();

export function BarracksModel({
  isLightOn = false,
  roofRef,
  interiorRef,
}: {
  isLightOn?: boolean;
  roofRef?: RefObject<THREE.Group | null>;
  interiorRef?: RefObject<THREE.Group | null>;
}) {
  const mats = SHARED_BUILDING_MATS;

  return (
    <group>
      <mesh geometry={barracksStoneBaseGeo} material={mats.stoneMed} receiveShadow />
      <mesh geometry={barracksFloorGeo} material={mats.floorPlanks} receiveShadow />
      <mesh geometry={barracksLogWallsGeo} material={mats.timberLogs} castShadow receiveShadow />
      <mesh geometry={barracksTimberDarkGeo} material={mats.timberDark} />
      <MedievalDoor position={[0, 0.16, 1.35]} width={1.10} height={1.22} isDouble={true} />
      <MedievalWindow position={[-1.48, 0.82, 1.36]} width={0.48} height={0.48} isLightOn={isLightOn} hasFlowerBox={false} />
      <MedievalWindow position={[1.48, 0.82, 1.36]} width={0.48} height={0.48} isLightOn={isLightOn} hasFlowerBox={false} />
      <MedievalWindow position={[-2.36, 0.82, -0.45]} rotation={[0, -Math.PI / 2, 0]} width={0.48} height={0.48} isLightOn={isLightOn} hasFlowerBox={false} />
      <MedievalWindow position={[-2.36, 0.82, 0.45]} rotation={[0, -Math.PI / 2, 0]} width={0.48} height={0.48} isLightOn={isLightOn} hasFlowerBox={false} />
      <MedievalWindow position={[2.36, 0.82, -0.45]} rotation={[0, Math.PI / 2, 0]} width={0.48} height={0.48} isLightOn={isLightOn} hasFlowerBox={false} />
      <MedievalWindow position={[2.36, 0.82, 0.45]} rotation={[0, Math.PI / 2, 0]} width={0.48} height={0.48} isLightOn={isLightOn} hasFlowerBox={false} />

      <group ref={roofRef}>
        <mesh geometry={barracksRoofGeometry} material={mats.thatchRoof} castShadow receiveShadow />
        <mesh geometry={barracksRoofTrimGeometry} material={mats.thatchDark} />
      </group>

      <group ref={interiorRef} visible={false}>
        <mesh geometry={barracksInteriorFurnitureGeo} material={mats.timberDark} receiveShadow />
      </group>
    </group>
  );
}
