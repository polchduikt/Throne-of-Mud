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

export const peasantHouseStoneGeometry = (() => {
  const geos: THREE.BufferGeometry[] = [];
  geos.push(toStandard(new THREE.BoxGeometry(3.96, 0.10, 1.96).translate(0, 0.05, 0)));
  geos.push(toStandard(new THREE.BoxGeometry(1.06, 0.08, 0.28).translate(0, 0.08, 0.96)));
  return mergeGeometries(geos) || geos[0];
})();

export const peasantHouseFloorGeometry = (() => {
  const geos: THREE.BufferGeometry[] = [];
  geos.push(toStandard(new THREE.BoxGeometry(3.80, 0.03, 1.80).translate(0, 0.11, 0)));
  geos.push(toStandard(new THREE.BoxGeometry(0.74, 1.05, 0.045).translate(0, 0.12 + 1.05 / 2, 0.92)));
  return mergeGeometries(geos) || geos[0];
})();

export const peasantHouseWallsGeometry = (() => {
  const geos: THREE.BufferGeometry[] = [];
  geos.push(toStandard(new THREE.BoxGeometry(3.78, 1.05, 0.12).translate(0, 0.65, -0.88)));
  geos.push(toStandard(new THREE.BoxGeometry(0.12, 1.05, 1.78).translate(-1.88, 0.65, 0)));
  geos.push(toStandard(new THREE.BoxGeometry(0.12, 1.05, 1.78).translate(1.88, 0.65, 0)));
  geos.push(toStandard(new THREE.BoxGeometry(1.51, 1.05, 0.12).translate(-1.125, 0.65, 0.88)));
  geos.push(toStandard(new THREE.BoxGeometry(1.51, 1.05, 0.12).translate(1.125, 0.65, 0.88)));
  return mergeGeometries(geos) || geos[0];
})();

export const peasantHouseBeamsGeometry = (() => {
  const geos: THREE.BufferGeometry[] = [];

  for (const bx of [-1.88, 1.88]) {
    for (const bz of [-0.88, 0.88]) {
      geos.push(toStandard(new THREE.BoxGeometry(0.14, 1.15, 0.14).translate(bx, 0.65, bz)));
    }
  }

  geos.push(toStandard(new THREE.BoxGeometry(3.92, 0.12, 0.14).translate(0, 1.18, -0.88)));
  geos.push(toStandard(new THREE.BoxGeometry(3.92, 0.12, 0.14).translate(0, 1.18, 0.88)));
  geos.push(toStandard(new THREE.BoxGeometry(0.14, 0.12, 1.90).translate(-1.88, 1.18, 0)));
  geos.push(toStandard(new THREE.BoxGeometry(0.14, 0.12, 1.90).translate(1.88, 1.18, 0)));

  geos.push(toStandard(new THREE.BoxGeometry(0.76, 0.12, 0.12).translate(0, 1.12, 0.88)));
  geos.push(toStandard(new THREE.BoxGeometry(0.10, 1.19, 0.14).translate(-0.37 - 0.05, 0.12 + 1.05 / 2, 0.92)));
  geos.push(toStandard(new THREE.BoxGeometry(0.10, 1.19, 0.14).translate(0.37 + 0.05, 0.12 + 1.05 / 2, 0.92)));

  const addWindowFrame = (x: number, y: number, z: number, rotY: number, w: number, h: number) => {
    const m = new THREE.Matrix4().makeRotationY(rotY).setPosition(x, y, z);
    const jL = new THREE.BoxGeometry(0.09, h + 0.16, 0.14).translate(-w / 2 - 0.045, 0, 0.07);
    const jR = new THREE.BoxGeometry(0.09, h + 0.16, 0.14).translate(w / 2 + 0.045, 0, 0.07);
    const head = new THREE.BoxGeometry(w + 0.24, 0.08, 0.14).translate(0, h / 2 + 0.04, 0.07);
    const sill = new THREE.BoxGeometry(w + 0.26, 0.08, 0.16).translate(0, -h / 2 - 0.04, 0.08);
    const f2 = new THREE.BoxGeometry(0.045, h, 0.035).translate(0, 0, 0.095);
    const f3 = new THREE.BoxGeometry(w, 0.045, 0.035).translate(0, 0, 0.095);
    const windowGeo = mergeGeometries([toStandard(jL), toStandard(jR), toStandard(head), toStandard(sill), toStandard(f2), toStandard(f3)]) || jL;
    geos.push(toStandard(windowGeo).applyMatrix4(m));
  };
  addWindowFrame(-1.125, 0.68, 0.89, 0, 0.52, 0.52);
  addWindowFrame(1.125, 0.68, 0.89, 0, 0.52, 0.52);
  addWindowFrame(-1.89, 0.68, 0, -Math.PI / 2, 0.48, 0.48);
  addWindowFrame(1.89, 0.68, 0, Math.PI / 2, 0.48, 0.48);

  geos.push(toStandard(new THREE.CylinderGeometry(0.205, 0.185, 0.04, 8).translate(1.60, 0.15, 1.15)));
  geos.push(toStandard(new THREE.CylinderGeometry(0.205, 0.185, 0.04, 8).translate(1.60, 0.38, 1.15)));
  const supL = new THREE.BoxGeometry(0.06, 0.35, 0.06).translate(-1.85, 0.22, 1.15);
  const supR = new THREE.BoxGeometry(0.06, 0.35, 0.06).translate(-1.35, 0.22, 1.15);
  geos.push(toStandard(supL), toStandard(supR));

  return mergeGeometries(geos) || geos[0];
})();

export const peasantHousePropsGeometry = (() => {
  const geos: THREE.BufferGeometry[] = [];

  const addShutters = (x: number, y: number, z: number, rotY: number, w: number, h: number) => {
    const m = new THREE.Matrix4().makeRotationY(rotY).setPosition(x, y, z);
    const sL = new THREE.BoxGeometry(w * 0.48, h * 0.96, 0.03);
    sL.applyMatrix4(new THREE.Matrix4().makeRotationY(-0.75).setPosition(-w / 2 - 0.12, 0, 0.1));
    const sR = new THREE.BoxGeometry(w * 0.48, h * 0.96, 0.03);
    sR.applyMatrix4(new THREE.Matrix4().makeRotationY(0.75).setPosition(w / 2 + 0.12, 0, 0.1));
    geos.push(toStandard(sL).applyMatrix4(m), toStandard(sR).applyMatrix4(m));
  };
  addShutters(-1.125, 0.68, 0.89, 0, 0.52, 0.52);
  addShutters(1.125, 0.68, 0.89, 0, 0.52, 0.52);
  addShutters(-1.89, 0.68, 0, -Math.PI / 2, 0.48, 0.48);
  addShutters(1.89, 0.68, 0, Math.PI / 2, 0.48, 0.48);

  geos.push(toStandard(new THREE.CylinderGeometry(0.2, 0.18, 0.48, 8).translate(1.60, 0.29, 1.15)));

  for (let row = 0; row < 3; row++) {
    for (let col = 0; col < 3 - row; col++) {
      const log = new THREE.CylinderGeometry(0.05, 0.05, 0.45, 6).rotateZ(Math.PI / 2);
      log.translate(-1.60 + (col - (2 - row) * 0.5) * 0.11, 0.10 + row * 0.09, 1.15);
      geos.push(toStandard(log));
    }
  }

  return mergeGeometries(geos) || geos[0];
})();

export const peasantHouseGlassGeometry = (() => {
  const geos: THREE.BufferGeometry[] = [];
  const addGlass = (x: number, y: number, z: number, rotY: number, w: number, h: number) => {
    const g = toStandard(new THREE.BoxGeometry(w, h, 0.04).translate(0, 0, 0.08));
    g.applyMatrix4(new THREE.Matrix4().makeRotationY(rotY).setPosition(x, y, z));
    geos.push(g);
  };
  addGlass(-1.125, 0.68, 0.89, 0, 0.52, 0.52);
  addGlass(1.125, 0.68, 0.89, 0, 0.52, 0.52);
  addGlass(-1.89, 0.68, 0, -Math.PI / 2, 0.48, 0.48);
  addGlass(1.89, 0.68, 0, Math.PI / 2, 0.48, 0.48);
  return mergeGeometries(geos) || geos[0];
})();

export const peasantHouseIronGeometry = (() => {
  const geos: THREE.BufferGeometry[] = [];
  const doorWidth = 0.74;
  const doorHeight = 1.05;
  const strap1 = new THREE.BoxGeometry(doorWidth * 0.65, 0.035, 0.015).translate(doorWidth * 0.35 - doorWidth / 2, doorHeight * 0.75, 0.945);
  const strap2 = new THREE.BoxGeometry(doorWidth * 0.65, 0.035, 0.015).translate(doorWidth * 0.35 - doorWidth / 2, doorHeight * 0.25, 0.945);
  geos.push(toStandard(strap1), toStandard(strap2));
  const ring = new THREE.TorusGeometry(0.04, 0.012, 6, 12).translate(doorWidth * 0.32, 0.12 + doorHeight * 0.5, 0.95);
  geos.push(toStandard(ring));
  return mergeGeometries(geos) || geos[0];
})();

export const peasantHouseRoofGeometry = (() => {
  const geos: THREE.BufferGeometry[] = [];

  const r1 = new THREE.BoxGeometry(3.96, 1.40, 0.14);
  r1.applyMatrix4(new THREE.Matrix4().makeRotationX(-0.818).setPosition(0, 1.65, 0.44));
  const r2 = new THREE.BoxGeometry(3.96, 1.40, 0.14);
  r2.applyMatrix4(new THREE.Matrix4().makeRotationX(0.818).setPosition(0, 1.65, -0.44));
  geos.push(toStandard(r1), toStandard(r2));

  const baseW = 1.76;
  const gHeight = 0.94;
  const half = baseW / 2;
  const s = new THREE.Shape();
  s.moveTo(-half, 0); s.lineTo(half, 0); s.lineTo(0, gHeight); s.closePath();

  const gLeft = new THREE.ExtrudeGeometry(s, { depth: 0.12, bevelEnabled: false });
  gLeft.applyMatrix4(new THREE.Matrix4().makeRotationY(-Math.PI / 2).setPosition(-1.88, 1.18, 0));
  geos.push(toStandard(gLeft));

  const gRight = new THREE.ExtrudeGeometry(s, { depth: 0.12, bevelEnabled: false });
  gRight.applyMatrix4(new THREE.Matrix4().makeRotationY(Math.PI / 2).setPosition(1.88, 1.18, 0));
  geos.push(toStandard(gRight));

  return mergeGeometries(geos) || geos[0];
})();

export const peasantHouseRoofTrimGeometry = (() => {
  const geos: THREE.BufferGeometry[] = [];

  geos.push(toStandard(new THREE.BoxGeometry(3.98, 0.14, 0.14).translate(0, 2.12, 0)));

  const t1 = new THREE.BoxGeometry(3.96, 0.12, 0.16);
  t1.applyMatrix4(new THREE.Matrix4().makeRotationX(-0.818).setPosition(0, 1.18, 0.88));
  const t2 = new THREE.BoxGeometry(3.96, 0.12, 0.16);
  t2.applyMatrix4(new THREE.Matrix4().makeRotationX(0.818).setPosition(0, 1.18, -0.88));
  geos.push(toStandard(t1), toStandard(t2));

  const baseW = 1.76;
  const gHeight = 0.94;
  const half = baseW / 2;
  const slopeAngle = Math.atan2(gHeight, half);
  const hypotenuse = Math.sqrt(half * half + gHeight * gHeight);

  const addGableFrame = (posX: number, rotY: number) => {
    const m = new THREE.Matrix4().makeRotationY(rotY).setPosition(posX, 1.18, 0);
    const post = new THREE.BoxGeometry(0.08, gHeight, 0.04).translate(0, gHeight / 2, 0.13);
    const leftRafter = new THREE.BoxGeometry(0.07, hypotenuse, 0.05);
    leftRafter.applyMatrix4(new THREE.Matrix4().makeRotationZ(slopeAngle - Math.PI / 2).setPosition(-half / 2, gHeight / 2, 0.13));
    const rightRafter = new THREE.BoxGeometry(0.07, hypotenuse, 0.05);
    rightRafter.applyMatrix4(new THREE.Matrix4().makeRotationZ(-(slopeAngle - Math.PI / 2)).setPosition(half / 2, gHeight / 2, 0.13));
    geos.push(toStandard(post).applyMatrix4(m), toStandard(leftRafter).applyMatrix4(m), toStandard(rightRafter).applyMatrix4(m));
  };
  addGableFrame(-1.88, -Math.PI / 2);
  addGableFrame(1.88, Math.PI / 2);

  for (const gx of [-1.98, 1.98]) {
    const f1 = new THREE.BoxGeometry(0.06, 0.44, 0.05);
    f1.applyMatrix4(new THREE.Matrix4().makeRotationX(0.55).setPosition(gx, 2.16, 0));
    const f2 = new THREE.BoxGeometry(0.06, 0.44, 0.05);
    f2.applyMatrix4(new THREE.Matrix4().makeRotationX(-0.55).setPosition(gx, 2.16, 0));
    geos.push(toStandard(f1), toStandard(f2));
  }

  return mergeGeometries(geos) || geos[0];
})();

export const peasantHouseChimneyGeometry = (() => {
  const geos: THREE.BufferGeometry[] = [];
  geos.push(toStandard(new THREE.BoxGeometry(0.42, 1.05, 0.42).translate(0, 1.95, -0.42)));
  geos.push(toStandard(new THREE.BoxGeometry(0.50, 0.06, 0.50).translate(0, 2.505, -0.42)));
  geos.push(toStandard(new THREE.BoxGeometry(0.56, 0.05, 0.56).translate(0, 2.555, -0.42)));
  geos.push(toStandard(new THREE.CylinderGeometry(0.11, 0.13, 0.28, 8).translate(0, 2.715, -0.42)));
  const rim = toStandard(new THREE.TorusGeometry(0.10, 0.03, 8, 16).rotateX(Math.PI / 2).translate(0, 2.845, -0.42));
  geos.push(rim);
  return mergeGeometries(geos) || geos[0];
})();

export const peasantHouseRoofVentsGeometry = (() => {
  const geos: THREE.BufferGeometry[] = [];
  geos.push(toStandard(new THREE.CircleGeometry(0.095, 12).rotateX(-Math.PI / 2).translate(0, 2.845, -0.42)));
  const ventL = new THREE.CylinderGeometry(0.12, 0.12, 0.04, 6).rotateZ(Math.PI / 2).translate(-2.02, 1.62, 0);
  const ventR = new THREE.CylinderGeometry(0.12, 0.12, 0.04, 6).rotateZ(Math.PI / 2).translate(2.02, 1.62, 0);
  geos.push(toStandard(ventL), toStandard(ventR));
  return mergeGeometries(geos) || geos[0];
})();

const interiorWoodGeometry = (() => {
  const geos: THREE.BufferGeometry[] = [];
  const addBedFrame = (bx: number, bz: number) => {
    for (const px of [-0.34, 0.34]) {
      for (const pz of [-0.6, 0.6]) {
        geos.push(toStandard(new THREE.BoxGeometry(0.07, 0.46, 0.07).translate(bx + px, 0.23, bz + pz)));
      }
    }
    geos.push(toStandard(new THREE.BoxGeometry(0.64, 0.03, 1.14).translate(bx, 0.14, bz)));
    geos.push(toStandard(new THREE.BoxGeometry(0.04, 0.10, 1.14).translate(bx - 0.34, 0.17, bz)));
    geos.push(toStandard(new THREE.BoxGeometry(0.04, 0.10, 1.14).translate(bx + 0.34, 0.17, bz)));
    geos.push(toStandard(new THREE.BoxGeometry(0.62, 0.26, 0.04).translate(bx, 0.31, bz - 0.6)));
    geos.push(toStandard(new THREE.BoxGeometry(0.62, 0.14, 0.04).translate(bx, 0.22, bz + 0.6)));
  };
  addBedFrame(-1.25, -0.15);
  addBedFrame(1.25, -0.15);

  geos.push(toStandard(new THREE.BoxGeometry(0.75, 0.04, 0.48).translate(0, 0.34, 0.18)));
  geos.push(toStandard(new THREE.BoxGeometry(0.18, 0.18, 0.44).translate(-0.5, 0.24, 0.18)));
  geos.push(toStandard(new THREE.BoxGeometry(0.18, 0.18, 0.44).translate(0.5, 0.24, 0.18)));

  geos.push(toStandard(new THREE.BoxGeometry(1.04, 0.08, 0.22).translate(0, 1.01, -0.62)));

  return mergeGeometries(geos) || geos[0];
})();

const interiorRugGeometry = toStandard(new THREE.BoxGeometry(1.4, 0.015, 0.9).translate(0, 0.13, -0.15));

const interiorBed1QuiltGeometry = (() => {
  const geos: THREE.BufferGeometry[] = [];
  const bx = -1.25; const bz = -0.15;
  geos.push(toStandard(new THREE.BoxGeometry(0.63, 0.02, 0.74).translate(bx, 0.255, bz + 0.2)));
  geos.push(toStandard(new THREE.BoxGeometry(0.02, 0.07, 0.72).translate(bx - 0.32, 0.22, bz + 0.2)));
  geos.push(toStandard(new THREE.BoxGeometry(0.02, 0.07, 0.72).translate(bx + 0.32, 0.22, bz + 0.2)));
  geos.push(toStandard(new THREE.BoxGeometry(0.62, 0.07, 0.02).translate(bx, 0.22, bz + 0.57)));
  return mergeGeometries(geos) || geos[0];
})();

const interiorBed2QuiltGeometry = (() => {
  const geos: THREE.BufferGeometry[] = [];
  const bx = 1.25; const bz = -0.15;
  geos.push(toStandard(new THREE.BoxGeometry(0.63, 0.02, 0.74).translate(bx, 0.255, bz + 0.2)));
  geos.push(toStandard(new THREE.BoxGeometry(0.02, 0.07, 0.72).translate(bx - 0.32, 0.22, bz + 0.2)));
  geos.push(toStandard(new THREE.BoxGeometry(0.02, 0.07, 0.72).translate(bx + 0.32, 0.22, bz + 0.2)));
  geos.push(toStandard(new THREE.BoxGeometry(0.62, 0.07, 0.02).translate(bx, 0.22, bz + 0.57)));
  return mergeGeometries(geos) || geos[0];
})();

const interiorPillowsGeometry = (() => {
  const geos: THREE.BufferGeometry[] = [];
  for (const bx of [-1.25, 1.25]) {
    geos.push(toStandard(new THREE.BoxGeometry(0.48, 0.07, 0.24).translate(bx, 0.27, -0.15 - 0.42)));
  }
  return mergeGeometries(geos) || geos[0];
})();

const interiorFireplaceStoneGeometry = (() => {
  const geos: THREE.BufferGeometry[] = [];
  geos.push(toStandard(new THREE.BoxGeometry(0.92, 0.94, 0.14).translate(0, 0.53, -0.74)));
  geos.push(toStandard(new THREE.BoxGeometry(0.12, 0.94, 0.14).translate(-0.42, 0.53, -0.64)));
  geos.push(toStandard(new THREE.BoxGeometry(0.12, 0.94, 0.14).translate(0.42, 0.53, -0.64)));
  geos.push(toStandard(new THREE.CylinderGeometry(0.05, 0.06, 0.12, 6).translate(0.2, 0.40, 0.18)));
  return mergeGeometries(geos) || geos[0];
})();

const interiorFireGeometry = toStandard(new THREE.DodecahedronGeometry(0.14, 0).translate(0, 0.25, -0.66));
const interiorBreadGeometry = toStandard(new THREE.BoxGeometry(0.15, 0.08, 0.12).translate(-0.2, 0.38, 0.18));
const interiorCandleGeometry = toStandard(new THREE.CylinderGeometry(0.016, 0.02, 0.08, 5).translate(0, 0.40, 0.18));

export function PeasantHouseModel({
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
      <mesh geometry={peasantHouseStoneGeometry} material={mats.stoneMed} receiveShadow />
      <mesh geometry={peasantHouseWallsGeometry} material={mats.timberPlanks} castShadow receiveShadow />
      <mesh geometry={peasantHouseBeamsGeometry} material={mats.timberDark} />
      <mesh geometry={peasantHouseFloorGeometry} material={mats.floorPlanks} receiveShadow />
      <mesh geometry={peasantHousePropsGeometry} material={mats.timberLight} />
      <mesh geometry={peasantHouseGlassGeometry} material={isLightOn ? mats.windowLit : mats.windowUnlit} />
      <mesh geometry={peasantHouseIronGeometry} material={mats.ironHardware} />

      <group ref={interiorRef} visible={false}>
        <mesh geometry={interiorWoodGeometry} material={mats.timberDark} />
        <mesh geometry={interiorRugGeometry} material={mats.rugPattern} receiveShadow />
        <mesh geometry={interiorBed1QuiltGeometry} material={mats.bedLinenRed} />
        <mesh geometry={interiorBed2QuiltGeometry} material={mats.bedLinenGreen} />
        <mesh geometry={interiorPillowsGeometry} material={mats.pillowWhite} />
        <mesh geometry={interiorFireplaceStoneGeometry} material={mats.stoneMed} receiveShadow />
        <mesh geometry={interiorFireGeometry} material={isLightOn ? mats.fireOrange : mats.fireplaceCold} />
        <mesh geometry={interiorBreadGeometry} material={mats.breadCrust} />
        <mesh geometry={interiorCandleGeometry} material={isLightOn ? mats.candleGlow : mats.candleUnlit} />
      </group>

      <group ref={roofRef}>
        <mesh geometry={peasantHouseRoofGeometry} material={mats.thatchRoof} castShadow receiveShadow />
        <mesh geometry={peasantHouseRoofTrimGeometry} material={mats.thatchDark} />
        <mesh geometry={peasantHouseChimneyGeometry} material={mats.stoneMed} receiveShadow />
        <mesh geometry={peasantHouseRoofVentsGeometry} material={mats.charcoalBlack} />
        <ChimneySmoke position={[0, 2.85, -0.42]} />
      </group>
    </group>
  );
}

export {
  peasantHouseRoofGeometry as peasantThatchRoofGeometry,
  peasantHouseRoofTrimGeometry as peasantThatchDarkGeometry,
};
