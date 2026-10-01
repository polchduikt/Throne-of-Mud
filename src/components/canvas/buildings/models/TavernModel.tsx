import type { RefObject } from 'react';
import * as THREE from 'three';
import { mergeGeometries } from 'three/examples/jsm/utils/BufferGeometryUtils.js';
import { SHARED_BUILDING_MATS } from '../buildingMaterials';
import { ChimneySmoke, MedievalDoor, MedievalWindow } from '../common/BuildingPrimitives';

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

export const tavernBaseGeometry = (() => {
  return toStandard(new THREE.BoxGeometry(3.92, 0.10, 2.92).translate(0, 0.05, 0));
})();

export const tavernFloorGeometry = (() => {
  const f = new THREE.BoxGeometry(3.76, 0.04, 2.76).translate(0, 0.11, 0);
  return toStandard(f);
})();

export const tavernWallsGeometry = (() => {
  const geos: THREE.BufferGeometry[] = [];
  geos.push(toStandard(new THREE.BoxGeometry(3.76, 1.35, 0.12).translate(0, 0.785, -1.36)));
  geos.push(toStandard(new THREE.BoxGeometry(0.12, 1.35, 2.76).translate(-1.86, 0.785, 0)));
  geos.push(toStandard(new THREE.BoxGeometry(0.12, 1.35, 2.76).translate(1.86, 0.785, 0)));
  geos.push(toStandard(new THREE.BoxGeometry(1.44, 1.35, 0.12).translate(-1.14, 0.785, 1.36)));
  geos.push(toStandard(new THREE.BoxGeometry(1.44, 1.35, 0.12).translate(1.14, 0.785, 1.36)));
  geos.push(toStandard(new THREE.BoxGeometry(0.84, 0.23, 0.12).translate(0, 1.345, 1.36)));
  return mergeGeometries(geos) || geos[0];
})();

export const tavernBeamsGeometry = (() => {
  const geos: THREE.BufferGeometry[] = [];

  for (const px of [-1.86, 1.86]) {
    for (const pz of [-1.36, 1.36]) {
      geos.push(toStandard(new THREE.BoxGeometry(0.15, 1.38, 0.15).translate(px, 0.785, pz)));
    }
  }

  geos.push(
    toStandard(new THREE.BoxGeometry(3.80, 0.08, 0.14).translate(0, 1.44, -1.36)),
    toStandard(new THREE.BoxGeometry(0.14, 0.08, 2.80).translate(-1.86, 1.44, 0)),
    toStandard(new THREE.BoxGeometry(0.14, 0.08, 2.80).translate(1.86, 1.44, 0)),
    toStandard(new THREE.BoxGeometry(3.80, 0.08, 0.14).translate(0, 1.44, 1.36))
  );

  geos.push(toStandard(new THREE.BoxGeometry(0.26, 0.03, 0.03).translate(0.55 - 0.12, 1.25, 1.44)));
  geos.push(toStandard(new THREE.BoxGeometry(0.24, 0.20, 0.025).translate(0.55, 1.25 - 0.15, 1.44)));

  return mergeGeometries(geos) || geos[0];
})();

export const tavernRoofGeometry = (() => {
  const geos: THREE.BufferGeometry[] = [];

  const r1 = new THREE.BoxGeometry(3.96, 0.10, 1.85);
  r1.applyMatrix4(new THREE.Matrix4().makeRotationX(-0.67).setPosition(0, 2.05, -0.69));
  const r2 = new THREE.BoxGeometry(3.96, 0.10, 1.85);
  r2.applyMatrix4(new THREE.Matrix4().makeRotationX(0.67).setPosition(0, 2.05, 0.69));
  geos.push(toStandard(r1), toStandard(r2));

  const s = new THREE.Shape();
  const halfD = 2.76 / 2;
  s.moveTo(-halfD, 0);
  s.lineTo(halfD, 0);
  s.lineTo(0, 1.30);
  s.closePath();

  const gL = new THREE.ExtrudeGeometry(s, { depth: 0.12, bevelEnabled: false });
  gL.applyMatrix4(new THREE.Matrix4().makeRotationY(-Math.PI / 2).setPosition(-1.86, 1.44, 0));

  const gR = new THREE.ExtrudeGeometry(s, { depth: 0.12, bevelEnabled: false });
  gR.applyMatrix4(new THREE.Matrix4().makeRotationY(Math.PI / 2).setPosition(1.86, 1.44, 0));

  geos.push(toStandard(gL), toStandard(gR));

  return mergeGeometries(geos) || geos[0];
})();

export const tavernRoofTrimGeometry = (() => {
  const geos: THREE.BufferGeometry[] = [];
  const e1 = new THREE.BoxGeometry(3.98, 0.10, 0.12);
  e1.applyMatrix4(new THREE.Matrix4().makeRotationX(-0.67).setPosition(0, 1.46, -1.40));
  const e2 = new THREE.BoxGeometry(3.98, 0.10, 0.12);
  e2.applyMatrix4(new THREE.Matrix4().makeRotationX(0.67).setPosition(0, 1.46, 1.40));
  geos.push(toStandard(e1), toStandard(e2));

  geos.push(toStandard(new THREE.BoxGeometry(4.0, 0.10, 0.14).translate(0, 2.72, 0)));

  return mergeGeometries(geos) || geos[0];
})();

export const tavernChimneyGeometry = (() => {
  const geos: THREE.BufferGeometry[] = [];
  const m1 = new THREE.BoxGeometry(0.38, 2.45, 0.44).translate(1.50, 2.16, -0.45);
  const m2 = new THREE.CylinderGeometry(0.15, 0.18, 0.20, 10).translate(1.50, 2.16 + 1.37, -0.45);
  const m3 = new THREE.TorusGeometry(0.15, 0.02, 6, 10);
  m3.applyMatrix4(new THREE.Matrix4().setPosition(1.50, 2.16 + 1.47, -0.45));
  const c = new THREE.BoxGeometry(0.46, 0.07, 0.52).translate(1.50, 2.16 + 1.23, -0.45);
  geos.push(toStandard(m1), toStandard(m2), toStandard(m3), toStandard(c));
  return mergeGeometries(geos) || geos[0];
})();

const tavernInteriorHearthGeo = (() => {
  const geos: THREE.BufferGeometry[] = [];
  const bx = 1.45; const bz = -0.45;
  geos.push(toStandard(new THREE.BoxGeometry(0.55, 0.08, 0.95).translate(bx, 0.11 + 0.04, bz)));
  geos.push(toStandard(new THREE.BoxGeometry(0.10, 0.72, 0.88).translate(bx + 0.14, 0.11 + 0.40, bz)));
  geos.push(toStandard(new THREE.BoxGeometry(0.32, 0.72, 0.20).translate(bx - 0.03, 0.11 + 0.40, bz - 0.36)));
  geos.push(toStandard(new THREE.BoxGeometry(0.32, 0.72, 0.20).translate(bx - 0.03, 0.11 + 0.40, bz + 0.36)));
  geos.push(toStandard(new THREE.BoxGeometry(0.34, 0.15, 0.88).translate(bx - 0.03, 0.11 + 0.74, bz)));
  geos.push(toStandard(new THREE.BoxGeometry(0.40, 0.05, 0.98).translate(bx - 0.08, 0.11 + 0.83, bz)));
  return mergeGeometries(geos) || geos[0];
})();

const tavernInteriorFireGeo = toStandard(new THREE.DodecahedronGeometry(0.13, 0).translate(1.45 - 0.02, 0.11 + 0.19, -0.45));

const tavernInteriorFurnitureGeo = (() => {
  const geos: THREE.BufferGeometry[] = [];

  const barX = -0.95; const barZ = -0.55;
  geos.push(toStandard(new THREE.BoxGeometry(1.35, 0.46, 0.26).translate(barX + 0.25, 0.11 + 0.23, barZ + 0.12)));
  geos.push(toStandard(new THREE.BoxGeometry(1.42, 0.035, 0.32).translate(barX + 0.25, 0.11 + 0.47, barZ + 0.12)));
  geos.push(toStandard(new THREE.BoxGeometry(0.26, 0.46, 0.34).translate(barX - 0.38, 0.11 + 0.23, barZ + 0.34)));
  geos.push(toStandard(new THREE.BoxGeometry(0.32, 0.035, 0.38).translate(barX - 0.38, 0.11 + 0.47, barZ + 0.34)));
  geos.push(toStandard(new THREE.BoxGeometry(1.6, 0.95, 0.05).translate(barX + 0.15, 0.11 + 0.55, barZ - 0.72)));
  geos.push(toStandard(new THREE.BoxGeometry(1.55, 0.035, 0.26).translate(barX + 0.15, 0.11 + 0.28, barZ - 0.58)));

  for (const bx of [-0.40, 0.15, 0.65]) {
    const b = new THREE.CylinderGeometry(0.12, 0.10, 0.28, 8).translate(barX + bx, 0.11 + 0.44, barZ - 0.58);
    geos.push(toStandard(b));
  }

  const t1X = 0.65; const t1Z = 0.55;
  geos.push(toStandard(new THREE.BoxGeometry(1.05, 0.04, 0.52).translate(t1X, 0.11 + 0.34, t1Z)));
  geos.push(toStandard(new THREE.BoxGeometry(1.0, 0.035, 0.18).translate(t1X, 0.11 + 0.18, t1Z - 0.38)));
  geos.push(toStandard(new THREE.BoxGeometry(1.0, 0.035, 0.18).translate(t1X, 0.11 + 0.18, t1Z + 0.38)));

  const t2X = -0.95; const t2Z = 0.60;
  geos.push(toStandard(new THREE.BoxGeometry(0.65, 0.04, 0.65).translate(t2X, 0.11 + 0.34, t2Z)));
  for (const sx of [-0.38, 0.38]) {
    for (const sz of [-0.38, 0.38]) {
      const stool = new THREE.CylinderGeometry(0.09, 0.10, 0.16, 6).translate(t2X + sx, 0.11 + 0.16, t2Z + sz);
      geos.push(toStandard(stool));
    }
  }

  return mergeGeometries(geos) || geos[0];
})();

export function TavernModel({
  isLightOn = false,
  isWorking = true,
  roofRef,
  interiorRef,
}: {
  isLightOn?: boolean;
  isWorking?: boolean;
  roofRef?: RefObject<THREE.Group | null>;
  interiorRef?: RefObject<THREE.Group | null>;
}) {
  const mats = SHARED_BUILDING_MATS;

  return (
    <group>
      <mesh geometry={tavernBaseGeometry} material={mats.stoneDark} receiveShadow />
      <mesh geometry={tavernFloorGeometry} material={mats.floorPlanks} receiveShadow />
      <mesh geometry={tavernWallsGeometry} material={mats.timberPlanks} castShadow receiveShadow />
      <mesh geometry={tavernBeamsGeometry} material={mats.timberDark} />
      <MedievalDoor position={[0, 0.12, 1.36]} width={0.84} height={1.12} />
      <MedievalWindow position={[-1.15, 0.75, 1.38]} width={0.52} height={0.52} isLightOn={isLightOn} hasFlowerBox={true} />
      <MedievalWindow position={[1.15, 0.75, 1.38]} width={0.52} height={0.52} isLightOn={isLightOn} hasFlowerBox={true} />
      <MedievalWindow position={[-1.87, 0.75, 0]} rotation={[0, -Math.PI / 2, 0]} width={0.52} height={0.52} isLightOn={isLightOn} hasFlowerBox={false} />
      <MedievalWindow position={[1.87, 0.75, 0.5]} rotation={[0, Math.PI / 2, 0]} width={0.52} height={0.52} isLightOn={isLightOn} hasFlowerBox={false} />
      <MedievalWindow position={[-0.85, 0.75, -1.38]} rotation={[0, Math.PI, 0]} width={0.52} height={0.52} isLightOn={isLightOn} hasFlowerBox={false} />
      <MedievalWindow position={[0.85, 0.75, -1.38]} rotation={[0, Math.PI, 0]} width={0.52} height={0.52} isLightOn={isLightOn} hasFlowerBox={false} />

      <mesh material={mats.goldTrim} position={[0.55, 1.25 - 0.15, 1.44 + 0.018]}>
        <cylinderGeometry args={[0.035, 0.04, 0.08, 8]} />
      </mesh>

      <group ref={interiorRef} visible={false}>
        <mesh geometry={tavernInteriorHearthGeo} material={mats.stoneMed} receiveShadow />
        <mesh geometry={tavernInteriorFireGeo} material={isWorking ? mats.fireOrange : mats.fireplaceCold} />
        <mesh geometry={tavernInteriorFurnitureGeo} material={mats.timberDark} receiveShadow />
      </group>

      <group ref={roofRef}>
        <mesh geometry={tavernRoofGeometry} material={mats.shingleRoof} castShadow receiveShadow />
        <mesh geometry={tavernRoofTrimGeometry} material={mats.timberDark} />
        <mesh geometry={tavernChimneyGeometry} material={mats.stoneMed} receiveShadow />
        {isWorking && <ChimneySmoke position={[1.50, 2.16 + 1.55, -0.45]} />}
      </group>
    </group>
  );
}
