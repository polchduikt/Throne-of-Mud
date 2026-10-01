import type { RefObject } from 'react';
import * as THREE from 'three';
import { mergeGeometries } from 'three/examples/jsm/utils/BufferGeometryUtils.js';
import { SHARED_BUILDING_MATS } from '../buildingMaterials';
import { ChimneySmoke } from '../common/BuildingPrimitives';

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

export const kilnMoundGeometry = (() => {
  const geos: THREE.BufferGeometry[] = [];
  geos.push(toStandard(new THREE.BoxGeometry(4.85, 0.06, 2.85).translate(0, 0.03, 0)));
  geos.push(toStandard(new THREE.CylinderGeometry(0.55, 1.25, 0.92, 16).translate(-1.15, 0.08 + 0.52, 0)));
  const dome = new THREE.SphereGeometry(0.58, 14, 10, 0, Math.PI * 2, 0, Math.PI / 2);
  dome.applyMatrix4(new THREE.Matrix4().setPosition(-1.15, 0.08 + 0.98, 0));
  geos.push(toStandard(dome));

  return mergeGeometries(geos) || geos[0];
})();

export const kilnStoneGeometry = (() => {
  const geos: THREE.BufferGeometry[] = [];
  const ring = new THREE.TorusGeometry(1.22, 0.11, 8, 20);
  ring.applyMatrix4(new THREE.Matrix4().makeRotationX(Math.PI / 2).setPosition(-1.15, 0.08 + 0.1, 0));
  geos.push(toStandard(ring));

  geos.push(toStandard(new THREE.CylinderGeometry(1.32, 1.35, 0.1, 16).translate(-1.15, 0.08 + 0.06, 0)));

  for (let i = 0; i < 6; i++) {
    const angle = (i * Math.PI) / 3;
    const vx = -1.15 + Math.cos(angle) * 1.12;
    const vz = Math.sin(angle) * 1.12;
    const vent = new THREE.BoxGeometry(0.22, 0.14, 0.12);
    vent.applyMatrix4(new THREE.Matrix4().makeRotationY(-angle).setPosition(vx, 0.08 + 0.12, vz));
    geos.push(toStandard(vent));
  }

  geos.push(toStandard(new THREE.CylinderGeometry(0.22, 0.22, 0.04, 10).translate(-1.15, 0.08 + 1.38, 0)));

  return mergeGeometries(geos) || geos[0];
})();

export const kilnFirewoodGeometry = (() => {
  const geos: THREE.BufferGeometry[] = [];

  geos.push(toStandard(new THREE.CylinderGeometry(0.25, 0.28, 0.36, 8).translate(0.35, 0.08 + 0.18, 0.25)));

  const px = 0.35; const pz = -0.75; const py = 0.08;
  const tiers = [
    { xs: [-0.38, -0.19, 0.0, 0.19, 0.38], y: 0.14, r: 0.075 },
    { xs: [-0.28, -0.09, 0.09, 0.28], y: 0.28, r: 0.07 },
    { xs: [-0.19, 0.0, 0.19], y: 0.41, r: 0.065 },
    { xs: [-0.09, 0.09], y: 0.53, r: 0.06 },
  ];

  for (const t of tiers) {
    for (const x of t.xs) {
      const log = new THREE.CylinderGeometry(t.r, t.r, 0.68, 6);
      log.applyMatrix4(new THREE.Matrix4().makeRotationZ(Math.PI / 2).setPosition(px + x, py + t.y, pz));
      geos.push(toStandard(log));
    }
  }

  return mergeGeometries(geos) || geos[0];
})();

export const kilnShedGeometry = (() => {
  const geos: THREE.BufferGeometry[] = [];
  const sx = 1.65; const sz = -0.45; const sy = 0.08;

  geos.push(toStandard(new THREE.BoxGeometry(0.09, 1.40, 0.09).translate(sx - 0.65, sy + 0.70, sz - 0.65)));
  geos.push(toStandard(new THREE.BoxGeometry(0.09, 1.40, 0.09).translate(sx + 0.65, sy + 0.70, sz - 0.65)));
  geos.push(toStandard(new THREE.BoxGeometry(0.09, 1.10, 0.09).translate(sx - 0.65, sy + 0.55, sz + 0.65)));
  geos.push(toStandard(new THREE.BoxGeometry(0.09, 1.10, 0.09).translate(sx + 0.65, sy + 0.55, sz + 0.65)));

  geos.push(toStandard(new THREE.BoxGeometry(0.08, 0.70, 0.75).translate(0.35 - 0.55, 0.08 + 0.35, -0.75)));
  geos.push(toStandard(new THREE.BoxGeometry(0.08, 0.70, 0.75).translate(0.35 + 0.55, 0.08 + 0.35, -0.75)));

  return mergeGeometries(geos) || geos[0];
})();

export const kilnRoofGeometry = (() => {
  const r = new THREE.BoxGeometry(1.65, 0.09, 1.65);
  r.applyMatrix4(new THREE.Matrix4().makeRotationX(0.18).setPosition(1.65, 0.08 + 1.25, -0.45));
  return toStandard(r);
})();

export const kilnCharcoalGeometry = (() => {
  const geos: THREE.BufferGeometry[] = [];
  geos.push(toStandard(new THREE.CylinderGeometry(0.14, 0.14, 0.02, 12).translate(-1.15, 0.08 + 1.39, 0)));

  geos.push(toStandard(new THREE.DodecahedronGeometry(0.16, 0).translate(-0.75 - 0.20, 0.08 + 0.28, 0.95)));
  geos.push(toStandard(new THREE.DodecahedronGeometry(0.14, 0).translate(-0.75 + 0.16, 0.08 + 0.07, 0.95)));
  geos.push(toStandard(new THREE.DodecahedronGeometry(0.10, 0).translate(-0.75 + 0.32, 0.08 + 0.06, 0.95 + 0.12)));

  return mergeGeometries(geos) || geos[0];
})();

export function CharcoalKilnModel({
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
      <mesh geometry={kilnMoundGeometry} material={mats.richSoil} receiveShadow />
      <mesh geometry={kilnStoneGeometry} material={mats.stoneMed} receiveShadow />
      <mesh geometry={kilnFirewoodGeometry} material={mats.timberLogs} receiveShadow />
      <mesh geometry={kilnShedGeometry} material={mats.timberDark} />
      <mesh geometry={kilnCharcoalGeometry} material={mats.charcoalBlack} />

      {isWorking && <ChimneySmoke position={[-1.15, 0.08 + 1.45, 0]} />}

      <group ref={roofRef}>
        <mesh geometry={kilnRoofGeometry} material={mats.thatchRoof} castShadow />
      </group>
    </group>
  );
}
