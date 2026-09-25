import { useMemo, useEffect, useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';
import { GridMap } from '../../engine/grid/GridMap';
import { useGameStore } from '../../store/useGameStore';
import { buildingEntities } from '../../engine/ecs/world';
import { getTreeProceduralData } from '../../engine/world/foliageGeneration';
import { pseudoRandom, getTileIndex, distanceSq2D } from '../../utils/mathUtils';

interface Props {
  grid: GridMap;
}

function createGrassTuftGeometry(bladeCount: number, height: number, spread: number): THREE.BufferGeometry {
  const positions: number[] = [];
  const normals: number[] = [];
  const indices: number[] = [];

  for (let i = 0; i < bladeCount; i++) {
    const angle = (i / bladeCount) * Math.PI * 2 + (i % 2 === 0 ? 0.35 : -0.25);
    const bladeW = 0.065 * (0.85 + Math.sin(i * 3.5) * 0.25);
    const bladeH = height * (0.85 + Math.cos(i * 4.2) * 0.25);
    const lean = spread * (0.22 + (i % 3) * 0.12);

    const cosA = Math.cos(angle);
    const sinA = Math.sin(angle);
    const perpX = -sinA * bladeW;
    const perpZ = cosA * bladeW;

    const baseIdx = positions.length / 3;

    positions.push(-perpX, 0, -perpZ);
    normals.push(sinA, 0.2, -cosA);

    positions.push(perpX, 0, perpZ);
    normals.push(sinA, 0.2, -cosA);

    positions.push(cosA * lean, bladeH, sinA * lean);
    normals.push(cosA * 0.5, 0.8, sinA * 0.5);

    indices.push(baseIdx, baseIdx + 1, baseIdx + 2);
    indices.push(baseIdx, baseIdx + 2, baseIdx + 1);
  }

  const geo = new THREE.BufferGeometry();
  geo.setAttribute('position', new THREE.Float32BufferAttribute(positions, 3));
  geo.setAttribute('normal', new THREE.Float32BufferAttribute(normals, 3));
  geo.setIndex(indices);
  geo.computeVertexNormals();
  return geo;
}

function mergeBufferGeometries(geos: THREE.BufferGeometry[]): THREE.BufferGeometry {
  const merged = new THREE.BufferGeometry();
  let totalPos = 0;
  let totalIdx = 0;
  for (const g of geos) {
    totalPos += g.attributes.position.count * 3;
    totalIdx += g.index ? g.index.count : g.attributes.position.count;
  }
  const positions = new Float32Array(totalPos);
  const normals = new Float32Array(totalPos);
  const indices = new Uint32Array(totalIdx);

  let posOffset = 0;
  let idxOffset = 0;
  let vertOffset = 0;

  for (const g of geos) {
    const p = g.attributes.position.array;
    const n = g.attributes.normal?.array;
    positions.set(p, posOffset);
    if (n) normals.set(n, posOffset);

    if (g.index) {
      const idx = g.index.array;
      for (let i = 0; i < idx.length; i++) {
        indices[idxOffset + i] = idx[i] + vertOffset;
      }
      idxOffset += idx.length;
    } else {
      for (let i = 0; i < g.attributes.position.count; i++) {
        indices[idxOffset + i] = i + vertOffset;
      }
      idxOffset += g.attributes.position.count;
    }

    vertOffset += g.attributes.position.count;
    posOffset += g.attributes.position.count * 3;
  }

  merged.setAttribute('position', new THREE.BufferAttribute(positions, 3));
  merged.setAttribute('normal', new THREE.BufferAttribute(normals, 3));
  merged.setIndex(new THREE.BufferAttribute(indices, 1));
  merged.computeVertexNormals();
  return merged;
}

function createBranch(
  start: [number, number, number],
  end: [number, number, number],
  rStart: number,
  rEnd: number,
  radialSegs: number = 5
): THREE.BufferGeometry {
  const p1 = new THREE.Vector3(...start);
  const p2 = new THREE.Vector3(...end);
  const dir = new THREE.Vector3().subVectors(p2, p1);
  const len = dir.length();

  const geo = new THREE.CylinderGeometry(rEnd, rStart, len, radialSegs);
  geo.translate(0, len / 2, 0);

  const up = new THREE.Vector3(0, 1, 0);
  const quat = new THREE.Quaternion().setFromUnitVectors(up, dir.clone().normalize());
  geo.applyQuaternion(quat);

  geo.translate(p1.x, p1.y, p1.z);
  return geo;
}

function createBareWinterTreeGeometry(): THREE.BufferGeometry {
  const parts: THREE.BufferGeometry[] = [];

  parts.push(createBranch([0, 0, 0], [0.02, 0.55, 0], 0.20, 0.15, 6));
  parts.push(createBranch([-0.04, 0.16, 0.02], [-0.22, 0.0, 0.12], 0.09, 0.04, 4));
  parts.push(createBranch([0.04, 0.16, -0.02], [0.22, 0.0, -0.12], 0.09, 0.04, 4));
  parts.push(createBranch([-0.01, 0.16, -0.04], [-0.08, 0.0, -0.24], 0.09, 0.04, 4));

  parts.push(createBranch([0.02, 0.55, 0], [-0.02, 0.95, 0.02], 0.15, 0.11, 6));

  parts.push(createBranch([-0.02, 0.95, 0.02], [0.02, 1.45, -0.02], 0.11, 0.075, 5));
  parts.push(createBranch([0.02, 1.45, -0.02], [-0.03, 1.90, 0.02], 0.075, 0.045, 4));
  parts.push(createBranch([-0.03, 1.90, 0.02], [0.01, 2.22, -0.01], 0.045, 0.02, 4));

  parts.push(createBranch([-0.02, 0.90, 0.02], [0.34, 1.35, 0.18], 0.085, 0.055, 5));
  parts.push(createBranch([0.34, 1.35, 0.18], [0.58, 1.68, 0.30], 0.05, 0.03, 4));
  parts.push(createBranch([0.58, 1.68, 0.30], [0.72, 1.92, 0.36], 0.028, 0.014, 4));
  parts.push(createBranch([0.34, 1.35, 0.18], [0.26, 1.78, 0.10], 0.045, 0.025, 4));

  parts.push(createBranch([-0.02, 0.98, 0.01], [-0.38, 1.42, -0.12], 0.08, 0.05, 5));
  parts.push(createBranch([-0.38, 1.42, -0.12], [-0.62, 1.72, -0.22], 0.048, 0.028, 4));
  parts.push(createBranch([-0.62, 1.72, -0.22], [-0.75, 1.95, -0.28], 0.026, 0.013, 4));
  parts.push(createBranch([-0.38, 1.42, -0.12], [-0.28, 1.85, -0.02], 0.045, 0.024, 4));

  parts.push(createBranch([0.01, 1.22, -0.02], [0.30, 1.58, -0.32], 0.065, 0.042, 4));
  parts.push(createBranch([0.30, 1.58, -0.32], [0.48, 1.88, -0.42], 0.038, 0.02, 4));
  parts.push(createBranch([0.30, 1.58, -0.32], [0.18, 1.98, -0.26], 0.036, 0.018, 4));

  parts.push(createBranch([0.0, 1.32, 0.01], [-0.30, 1.65, 0.25], 0.06, 0.038, 4));
  parts.push(createBranch([-0.30, 1.65, 0.25], [-0.45, 1.96, 0.35], 0.035, 0.018, 4));

  parts.push(createBranch([-0.02, 1.70, 0.01], [0.12, 2.05, 0.18], 0.04, 0.018, 4));

  return mergeBufferGeometries(parts);
}

function createBareBushGeometry(): THREE.BufferGeometry {
  const parts: THREE.BufferGeometry[] = [];
  parts.push(createBranch([0, 0, 0], [-0.18, 0.26, 0.08], 0.032, 0.012, 4));
  parts.push(createBranch([-0.18, 0.26, 0.08], [-0.28, 0.42, 0.14], 0.012, 0.006, 3));
  parts.push(createBranch([0, 0, 0], [0.20, 0.28, -0.06], 0.032, 0.012, 4));
  parts.push(createBranch([0.20, 0.28, -0.06], [0.30, 0.44, -0.10], 0.012, 0.006, 3));
  parts.push(createBranch([0, 0, 0], [0.04, 0.32, 0.18], 0.028, 0.011, 4));
  parts.push(createBranch([0, 0, 0], [-0.06, 0.30, -0.18], 0.028, 0.011, 4));
  parts.push(createBranch([0, 0, 0], [0.01, 0.38, 0.02], 0.035, 0.014, 4));
  parts.push(createBranch([0.01, 0.38, 0.02], [-0.04, 0.52, 0.05], 0.014, 0.007, 3));
  return mergeBufferGeometries(parts);
}

const defaultBareWinterTreeGeo = createBareWinterTreeGeometry();
const defaultBareBushGeo = createBareBushGeometry();



function FallingTreeItem({
  tree,
  grid,
}: {
  tree: { id: string; x: number; z: number; startTime: number; fallAngle: number; treeType: string };
  grid: GridMap;
}) {
  const groupRef = useRef<THREE.Group>(null);
  const landedRef = useRef(false);
  const gx = Math.floor(tree.x);
  const gz = Math.floor(tree.z);
  const tileH = (grid.getTile(gx, gz)?.height || 1) * 0.4;
  const season = useGameStore((state) => state.time?.season || 'Spring');
  const isWinter = season === 'Winter';

  const { treeType, sc, rotY, jitterX, jitterZ } = useMemo(() => {
    return getTreeProceduralData(gx, gz);
  }, [gx, gz]);

  const posX = gx + 0.5 + jitterX;
  const posZ = gz + 0.5 + jitterZ;

  useFrame(() => {
    if (!groupRef.current) return;
    const now = performance.now() / 1000;
    const elapsed = now - tree.startTime;
    const fallDuration = 1.35;
    const norm = Math.min(1.0, elapsed / fallDuration);
    const fallTilt = norm * norm * norm * (Math.PI / 2);

    let impactBounce = 0;
    if (elapsed >= fallDuration && elapsed < fallDuration + 0.6) {
      const bNorm = (elapsed - fallDuration) / 0.6;
      impactBounce = Math.sin(bNorm * Math.PI * 4) * 0.05 * (1 - bNorm);

      if (!landedRef.current) {
        landedRef.current = true;
        grid.setFoliage(gx, gz, 'fallen_tree', tree.fallAngle, treeType);
        useGameStore.getState().registerTreeHit(posX, posZ, 1.8);
        useGameStore.getState().incrementFoliageVersion();
      }
    }

    groupRef.current.position.set(posX, tileH, posZ);
    groupRef.current.rotation.set(0, tree.fallAngle, 0);
    if (groupRef.current.children[0]) {
      groupRef.current.children[0].visible = elapsed < fallDuration;
      groupRef.current.children[0].rotation.set(fallTilt + impactBounce, 0, 0);
    }
  });

  return (
    <group ref={groupRef}>
      <group position={[0, 0, 0]} scale={[sc, sc, sc]}>
        {treeType === 'pine' ? (
          <>
            <mesh position={[0, 0.32, 0]} castShadow receiveShadow>
              <cylinderGeometry args={[0.09, 0.15, 0.65, 6]} />
              <meshStandardMaterial color="#422817" roughness={0.9} flatShading />
            </mesh>
            <mesh position={[0, 0.65, 0]} castShadow receiveShadow>
              <coneGeometry args={[0.68, 0.65, 6]} />
              <meshStandardMaterial color="#13351b" roughness={0.85} flatShading />
            </mesh>
            <mesh position={[0, 1.05, 0]} castShadow receiveShadow>
              <coneGeometry args={[0.54, 0.6, 6]} />
              <meshStandardMaterial color="#184223" roughness={0.85} flatShading />
            </mesh>
            <mesh position={[0, 1.45, 0]} castShadow receiveShadow>
              <coneGeometry args={[0.4, 0.5, 6]} />
              <meshStandardMaterial color="#1f4f2c" roughness={0.85} flatShading />
            </mesh>
            <mesh position={[0, 1.8, 0]} castShadow receiveShadow>
              <coneGeometry args={[0.25, 0.4, 6]} />
              <meshStandardMaterial color="#286237" roughness={0.85} flatShading />
            </mesh>
          </>
        ) : isWinter ? (
          <mesh position={[0, 0, 0]} rotation={[0, rotY, 0]} geometry={defaultBareWinterTreeGeo} castShadow receiveShadow>
            <meshStandardMaterial color="#422817" roughness={0.9} flatShading />
          </mesh>
        ) : (
          <>
            <mesh position={[0, 0.42, 0]} rotation={[0, rotY, 0]} castShadow receiveShadow>
              <cylinderGeometry args={[0.12, 0.22, 0.85, 6]} />
              <meshStandardMaterial color="#422817" roughness={0.9} flatShading />
            </mesh>
            <mesh position={[0, 1.25, 0]} scale={[1.1, 1.1, 1.1]} castShadow receiveShadow>
              <dodecahedronGeometry args={[0.72, 1]} />
              <meshStandardMaterial
                color={treeType === 'autumn' ? '#c2410c' : '#2b6524'}
                roughness={0.8}
                flatShading
              />
            </mesh>
          </>
        )}
      </group>
    </group>
  );
}

export function FoliageRenderer({ grid }: Props) {
  const foliageVersion = useGameStore((state) => state.foliageVersion);
  const buildingVersion = useGameStore((state) => state.buildingVersion);
  const fallingTrees = useGameStore((state) => state.fallingTrees);
  const isStrategicView = useGameStore((state) => state.isStrategicView);
  const resourceDeposits = useGameStore((state) => state.resourceDeposits);
  const season = useGameStore((state) => state.time?.season || 'Spring');
  const isWinter = season === 'Winter';

  const staticFloraData = useMemo(() => {
    type FloraType =
      | 'tallGrass'
      | 'medGrass'
      | 'shortGrass'
      | 'reeds'
      | 'lilies'
      | 'redFlowers'
      | 'yellowFlowers'
      | 'blueFlowers'
      | 'whiteFlowers'
      | 'pebbles'
      | 'mushrooms';

    const byType: Record<FloraType, THREE.Matrix4[]> = {
      tallGrass: [],
      medGrass: [],
      shortGrass: [],
      reeds: [],
      lilies: [],
      redFlowers: [],
      yellowFlowers: [],
      blueFlowers: [],
      whiteFlowers: [],
      pebbles: [],
      mushrooms: [],
    };

    const tileFlora = new Map<number, Array<{ type: FloraType; index: number; origMatrix: THREE.Matrix4 }>>();

    const addFlora = (x: number, z: number, type: FloraType, matrix: THREE.Matrix4) => {
      const list = byType[type];
      const index = list.length;
      list.push(matrix);
      const key = getTileIndex(x, z, grid.width);
      let tileList = tileFlora.get(key);
      if (!tileList) {
        tileList = [];
        tileFlora.set(key, tileList);
      }
      tileList.push({ type, index, origMatrix: matrix });
    };

    const dummy = new THREE.Object3D();

    const depositClearings: Array<{ gx: number; gz: number; rSq: number }> = [];
    if (resourceDeposits) {
      for (const dep of resourceDeposits) {
        const r = dep.type === 'berries' ? 1.4 : 2.7;
        depositClearings.push({ gx: dep.gridPosition[0], gz: dep.gridPosition[1], rSq: r * r });
      }
    }

    for (let x = 0; x < grid.width; x++) {
      for (let z = 0; z < grid.height; z++) {
        const tile = grid.tiles[x][z];
        if (!tile || tile.terrain === 'road' || tile.buildingId) continue;

        let inDeposit = false;
        for (let i = 0; i < depositClearings.length; i++) {
          const d = depositClearings[i];
          if (distanceSq2D(x, z, d.gx, d.gz) <= d.rSq) {
            inDeposit = true;
            break;
          }
        }
        if (inDeposit) continue;

        let inBuilding = false;
        for (const b of buildingEntities) {
          if (!b.gridPosition) continue;
          const [gx, gz] = b.gridPosition;
          const bw = b.buildingWidth || 1;
          const bh = b.buildingHeight || 1;
          if (x >= gx - 0.25 && x < gx + bw + 0.25 && z >= gz - 0.25 && z <= gz + bh + 0.25) {
            inBuilding = true;
            break;
          }
        }
        if (inBuilding) continue;

        const tileH = tile.height || 0.05;
        const jitterX = (pseudoRandom(x, z) - 0.5) * 0.35;
        const jitterZ = (pseudoRandom(z, x + 37) - 0.5) * 0.35;
        const posX = x + 0.5 + jitterX;
        const posZ = z + 0.5 + jitterZ;
        const rotY = pseudoRandom(x + 17, z + 53) * Math.PI * 2;

        if (tile.terrain === 'water') {
          if (pseudoRandom(x + 43, z + 17) > 0.90) {
            const sc = 0.65 + pseudoRandom(x, z) * 0.25;
            dummy.position.set(posX, -0.06, posZ);
            dummy.rotation.set(0, rotY, 0);
            dummy.scale.set(sc, sc, sc);
            dummy.updateMatrix();
            addFlora(x, z, 'lilies', dummy.matrix.clone());
          }
        } else if (tile.terrain === 'fertile_soil' || tile.terrain === 'mud') {
          if (pseudoRandom(x + 11, z + 89) > 0.55) {
            const sc = 0.75 + pseudoRandom(x, z) * 0.35;
            dummy.position.set(posX, tileH, posZ);
            dummy.rotation.set(0, rotY, 0);
            dummy.scale.set(sc, sc, sc);
            dummy.updateMatrix();
            addFlora(x, z, 'reeds', dummy.matrix.clone());
          }
          if (pseudoRandom(x * 37, z * 29) > 0.40) {
            const sc = 0.65 + pseudoRandom(x, z) * 0.35;
            dummy.position.set(posX + 0.15, tileH + 0.02 * sc, posZ + 0.15);
            dummy.rotation.set(0.1, rotY, 0.05);
            dummy.scale.set(sc * 1.3, sc * 0.5, sc * 1.1);
            dummy.updateMatrix();
            addFlora(x, z, 'pebbles', dummy.matrix.clone());
          }
        } else if (tile.terrain === 'grass') {
          const patchNoise = Math.sin(x * 0.24 + z * 0.16) * 0.55 + Math.cos(x * 0.12 - z * 0.26) * 0.45;

          if (patchNoise > 0.15) {
            const tuftCount = 5 + Math.floor(pseudoRandom(x * 3, z * 7) * 3.5);
            for (let k = 0; k < tuftCount; k++) {
              const subJitterX = (pseudoRandom(x * 13 + k * 17, z * 19 + k) - 0.5) * 0.94;
              const subJitterZ = (pseudoRandom(z * 23 + k * 31, x * 7 + k) - 0.5) * 0.94;
              const subRotY = pseudoRandom(x + k * 37, z + k * 53) * Math.PI * 2;
              const subScale = 0.95 + pseudoRandom(x * 5 + k, z * 11) * 0.40;

              dummy.position.set(x + 0.5 + subJitterX, tileH, z + 0.5 + subJitterZ);
              dummy.rotation.set(0, subRotY, 0);
              dummy.scale.set(subScale, subScale, subScale);
              dummy.updateMatrix();

              const type = k < 3 ? 'tallGrass' : k < 5 ? 'medGrass' : 'shortGrass';
              addFlora(x, z, type, dummy.matrix.clone());
            }

            const randFlower = pseudoRandom(x * 19 + 5, z * 23 + 17);
            if (randFlower > 0.35) {
              const fType = pseudoRandom(x + 31, z + 73);
              const sc = 0.85 + pseudoRandom(x, z) * 0.35;
              const fJitterX = (pseudoRandom(x * 41, z * 29) - 0.5) * 0.75;
              const fJitterZ = (pseudoRandom(z * 17, x * 53) - 0.5) * 0.75;

              dummy.position.set(x + 0.5 + fJitterX, tileH + 0.05 * sc, z + 0.5 + fJitterZ);
              dummy.rotation.set(0, rotY, 0);
              dummy.scale.set(sc, sc, sc);
              dummy.updateMatrix();

              const fName =
                fType < 0.28
                  ? 'redFlowers'
                  : fType < 0.56
                  ? 'yellowFlowers'
                  : fType < 0.82
                  ? 'blueFlowers'
                  : 'whiteFlowers';
              addFlora(x, z, fName, dummy.matrix.clone());
            }

            if (pseudoRandom(x * 47, z * 31) > 0.65) {
              const scM = 0.7 + pseudoRandom(x, z) * 0.3;
              dummy.position.set(posX + 0.28, tileH + 0.05 * scM, posZ + 0.22);
              dummy.rotation.set(0, rotY, 0);
              dummy.scale.set(scM, scM, scM);
              dummy.updateMatrix();
              addFlora(x, z, 'mushrooms', dummy.matrix.clone());
            }
          } else if (patchNoise > -0.20) {
            const tuftCount = 3 + Math.floor(pseudoRandom(x * 5, z * 11) * 2.5);
            for (let k = 0; k < tuftCount; k++) {
              const subJitterX = (pseudoRandom(x * 11 + k * 13, z * 17 + k) - 0.5) * 0.92;
              const subJitterZ = (pseudoRandom(z * 19 + k * 23, x * 5 + k) - 0.5) * 0.92;
              const subRotY = pseudoRandom(x + k * 19, z + k * 29) * Math.PI * 2;
              const subScale = 0.85 + pseudoRandom(x * 3 + k, z * 7) * 0.35;

              dummy.position.set(x + 0.5 + subJitterX, tileH, z + 0.5 + subJitterZ);
              dummy.rotation.set(0, subRotY, 0);
              dummy.scale.set(subScale, subScale, subScale);
              dummy.updateMatrix();

              const type = k < 2 ? 'medGrass' : 'shortGrass';
              addFlora(x, z, type, dummy.matrix.clone());
            }
          } else {
            const tuftCount = 2 + Math.floor(pseudoRandom(x * 7 + 13, z * 11 + 29) * 1.8);
            for (let k = 0; k < tuftCount; k++) {
              const subJitterX = (pseudoRandom(x * 17 + k * 7, z * 13 + k) - 0.5) * 0.90;
              const subJitterZ = (pseudoRandom(z * 29 + k * 11, x * 19 + k) - 0.5) * 0.90;
              const subRotY = pseudoRandom(x + k * 11, z + k * 17) * Math.PI * 2;
              const subScale = 0.80 + pseudoRandom(x + k, z + k) * 0.30;

              dummy.position.set(x + 0.5 + subJitterX, tileH, z + 0.5 + subJitterZ);
              dummy.rotation.set(0, subRotY, 0);
              dummy.scale.set(subScale, subScale, subScale);
              dummy.updateMatrix();

              addFlora(x, z, 'shortGrass', dummy.matrix.clone());
            }
          }
        }
      }
    }

    const counts = {
      tallGrass: Math.max(1, byType.tallGrass.length),
      medGrass: Math.max(1, byType.medGrass.length),
      shortGrass: Math.max(1, byType.shortGrass.length),
      reeds: Math.max(1, byType.reeds.length),
      lilies: Math.max(1, byType.lilies.length),
      redFlowers: Math.max(1, byType.redFlowers.length),
      yellowFlowers: Math.max(1, byType.yellowFlowers.length),
      blueFlowers: Math.max(1, byType.blueFlowers.length),
      whiteFlowers: Math.max(1, byType.whiteFlowers.length),
      pebbles: Math.max(1, byType.pebbles.length),
      mushrooms: Math.max(1, byType.mushrooms.length),
    };

    return { byType, tileFlora, counts };
  }, [grid, resourceDeposits]);

  const treesAndFloraData = useMemo(() => {
    void foliageVersion;
    void buildingVersion;
    const oakTrunks: THREE.Matrix4[] = [];
    const oakCanopies: THREE.Matrix4[] = [];
    const bareOakTrees: THREE.Matrix4[] = [];
    const autumnTrunks: THREE.Matrix4[] = [];
    const autumnCanopies: THREE.Matrix4[] = [];
    const bareAutumnTrees: THREE.Matrix4[] = [];
    const pineTrunks: THREE.Matrix4[] = [];
    const pineTiers: Array<{ t1: THREE.Matrix4; t2: THREE.Matrix4; t3: THREE.Matrix4; t4: THREE.Matrix4 }> = [];
    const rocks: THREE.Matrix4[] = [];
    const bushes: THREE.Matrix4[] = [];
    const bareBushes: THREE.Matrix4[] = [];
    const stumps: THREE.Matrix4[] = [];
    const fallenLogs: THREE.Matrix4[] = [];
    const fallenOakCanopies: THREE.Matrix4[] = [];
    const fallenAutumnCanopies: THREE.Matrix4[] = [];
    const fallenPineTiers: Array<{ t1: THREE.Matrix4; t2: THREE.Matrix4; t3: THREE.Matrix4; t4: THREE.Matrix4 }> = [];

    const dummy = new THREE.Object3D();

    const depositClearings: Array<{ gx: number; gz: number; rSq: number }> = [];
    if (resourceDeposits) {
      for (const dep of resourceDeposits) {
        const r = dep.type === 'berries' ? 1.5 : 2.8;
        depositClearings.push({ gx: dep.gridPosition[0], gz: dep.gridPosition[1], rSq: r * r });
      }
    }

    const processTile = (x: number, z: number) => {
      const tile = grid.tiles[x]?.[z];
      if (!tile || !tile.foliageType || tile.buildingId) return;

      for (let i = 0; i < depositClearings.length; i++) {
        const d = depositClearings[i];
        if (distanceSq2D(x, z, d.gx, d.gz) <= d.rSq) return;
      }

      for (const b of buildingEntities) {
        if (!b.gridPosition) continue;
        const [gx, gz] = b.gridPosition;
        const bw = b.buildingWidth || 1;
        const bh = b.buildingHeight || 1;
        if (x >= gx - 1 && x <= gx + bw && z >= gz - 1 && z <= gz + bh) return;
      }

      const tileH = tile.height || 0.05;
      const jitterX = (pseudoRandom(x, z) - 0.5) * 0.35;
      const jitterZ = (pseudoRandom(z, x + 37) - 0.5) * 0.35;
      const posX = x + 0.5 + jitterX;
      const posZ = z + 0.5 + jitterZ;
      const rotY = pseudoRandom(x + 17, z + 53) * Math.PI * 2;

        if (tile.foliageType === 'tree') {
          const { treeType, sc } = getTreeProceduralData(x, z);
          if (treeType === 'pine') {
            dummy.position.set(posX, tileH + 0.32 * sc, posZ);
            dummy.rotation.set(0, rotY, 0);
            dummy.scale.set(sc, sc, sc);
            dummy.updateMatrix();
            pineTrunks.push(dummy.matrix.clone());

            dummy.position.set(posX, tileH + 0.65 * sc, posZ);
            dummy.updateMatrix();
            const t1 = dummy.matrix.clone();

            dummy.position.set(posX, tileH + 1.05 * sc, posZ);
            dummy.updateMatrix();
            const t2 = dummy.matrix.clone();

            dummy.position.set(posX, tileH + 1.45 * sc, posZ);
            dummy.updateMatrix();
            const t3 = dummy.matrix.clone();

            dummy.position.set(posX, tileH + 1.8 * sc, posZ);
            dummy.updateMatrix();
            const t4 = dummy.matrix.clone();

            pineTiers.push({ t1, t2, t3, t4 });
          } else if (treeType === 'oak') {
            dummy.position.set(posX, tileH + 0.42 * sc, posZ);
            dummy.rotation.set(0, rotY, 0);
            dummy.scale.set(sc, sc, sc);
            dummy.updateMatrix();
            oakTrunks.push(dummy.matrix.clone());

            dummy.position.set(posX, tileH + 1.25 * sc, posZ);
            dummy.scale.set(sc * 1.1, sc * 1.1, sc * 1.1);
            dummy.updateMatrix();
            oakCanopies.push(dummy.matrix.clone());

            dummy.position.set(posX, tileH, posZ);
            dummy.rotation.set(0, rotY, 0);
            dummy.scale.set(sc, sc, sc);
            dummy.updateMatrix();
            bareOakTrees.push(dummy.matrix.clone());
          } else {
            dummy.position.set(posX, tileH + 0.42 * sc, posZ);
            dummy.rotation.set(0, rotY, 0);
            dummy.scale.set(sc, sc, sc);
            dummy.updateMatrix();
            autumnTrunks.push(dummy.matrix.clone());

            dummy.position.set(posX, tileH + 1.25 * sc, posZ);
            dummy.scale.set(sc * 1.1, sc * 1.1, sc * 1.1);
            dummy.updateMatrix();
            autumnCanopies.push(dummy.matrix.clone());

            dummy.position.set(posX, tileH, posZ);
            dummy.rotation.set(0, rotY, 0);
            dummy.scale.set(sc, sc, sc);
            dummy.updateMatrix();
            bareAutumnTrees.push(dummy.matrix.clone());
          }
        } else if (tile.foliageType === 'fallen_tree') {
          const proc = getTreeProceduralData(x, z);
          const treeType = tile.foliageTreeType || proc.treeType;
          const sc = proc.sc;
          const logAngle = tile.foliageAngle !== undefined ? tile.foliageAngle : rotY;
          const sinA = Math.sin(logAngle);
          const cosA = Math.cos(logAngle);

          dummy.position.set(posX, tileH + 0.08 * sc, posZ);
          dummy.rotation.set(0, logAngle, 0);
          dummy.scale.set(sc, sc, sc);
          dummy.updateMatrix();
          stumps.push(dummy.matrix.clone());

          dummy.position.set(posX + sinA * 0.42 * sc, tileH + 0.09 * sc, posZ + cosA * 0.42 * sc);
          dummy.rotation.set(0, logAngle, 0);
          dummy.rotateX(Math.PI / 2);
          dummy.scale.set(sc, sc, sc);
          dummy.updateMatrix();
          fallenLogs.push(dummy.matrix.clone());

          if (treeType === 'pine') {
            dummy.position.set(posX + sinA * 0.65 * sc, tileH + 0.18 * sc, posZ + cosA * 0.65 * sc);
            dummy.rotation.set(0, logAngle, 0);
            dummy.rotateX(Math.PI / 2);
            dummy.scale.set(sc, sc, sc);
            dummy.updateMatrix();
            const t1 = dummy.matrix.clone();

            dummy.position.set(posX + sinA * 1.05 * sc, tileH + 0.16 * sc, posZ + cosA * 1.05 * sc);
            dummy.rotation.set(0, logAngle, 0);
            dummy.rotateX(Math.PI / 2);
            dummy.scale.set(sc, sc, sc);
            dummy.updateMatrix();
            const t2 = dummy.matrix.clone();

            dummy.position.set(posX + sinA * 1.45 * sc, tileH + 0.14 * sc, posZ + cosA * 1.45 * sc);
            dummy.rotation.set(0, logAngle, 0);
            dummy.rotateX(Math.PI / 2);
            dummy.scale.set(sc, sc, sc);
            dummy.updateMatrix();
            const t3 = dummy.matrix.clone();

            dummy.position.set(posX + sinA * 1.80 * sc, tileH + 0.12 * sc, posZ + cosA * 1.80 * sc);
            dummy.rotation.set(0, logAngle, 0);
            dummy.rotateX(Math.PI / 2);
            dummy.scale.set(sc, sc, sc);
            dummy.updateMatrix();
            const t4 = dummy.matrix.clone();

            fallenPineTiers.push({ t1, t2, t3, t4 });
          } else if (treeType === 'oak') {
            dummy.position.set(posX + sinA * 1.25 * sc, tileH + 0.32 * sc, posZ + cosA * 1.25 * sc);
            dummy.rotation.set(0, logAngle, 0);
            dummy.rotateX(Math.PI / 2);
            dummy.scale.set(sc * 1.1, sc * 1.1, sc * 1.1);
            dummy.updateMatrix();
            fallenOakCanopies.push(dummy.matrix.clone());
          } else {
            dummy.position.set(posX + sinA * 1.25 * sc, tileH + 0.32 * sc, posZ + cosA * 1.25 * sc);
            dummy.rotation.set(0, logAngle, 0);
            dummy.rotateX(Math.PI / 2);
            dummy.scale.set(sc * 1.1, sc * 1.1, sc * 1.1);
            dummy.updateMatrix();
            fallenAutumnCanopies.push(dummy.matrix.clone());
          }
        } else if (tile.foliageType === 'rock') {
          const sc = 0.95 + (pseudoRandom(x + 13, z + 7) - 0.5) * 0.25;
          dummy.position.set(posX, tileH + 0.18 * sc, posZ);
          dummy.rotation.set(0.1, rotY, 0.05);
          dummy.scale.set(sc * 1.2, sc * 0.8, sc * 1.05);
          dummy.updateMatrix();
          rocks.push(dummy.matrix.clone());
        } else if (tile.foliageType === 'bush') {
          const sc = 0.85 + (pseudoRandom(x * 7, z * 13) - 0.5) * 0.35;
          dummy.position.set(posX, tileH + 0.15 * sc, posZ);
          dummy.rotation.set(0, rotY, 0);
          dummy.scale.set(sc, sc, sc);
          dummy.updateMatrix();
          bushes.push(dummy.matrix.clone());

          dummy.position.set(posX, tileH, posZ);
          dummy.rotation.set(0, rotY, 0);
          dummy.scale.set(sc, sc, sc);
          dummy.updateMatrix();
          bareBushes.push(dummy.matrix.clone());
        }
    };

    if (grid.foliageCoords && grid.foliageCoords.length > 0) {
      const coords = grid.foliageCoords;
      for (let i = 0; i < coords.length; i += 2) {
        processTile(coords[i], coords[i + 1]);
      }
    } else {
      for (let x = 0; x < grid.width; x++) {
        for (let z = 0; z < grid.height; z++) {
          processTile(x, z);
        }
      }
    }

    return {
      oakTrunks,
      oakCanopies,
      bareOakTrees,
      autumnTrunks,
      autumnCanopies,
      bareAutumnTrees,
      pineTrunks,
      pineTiers,
      rocks,
      bushes,
      bareBushes,
      stumps,
      fallenLogs,
      fallenOakCanopies,
      fallenAutumnCanopies,
      fallenPineTiers,
    };
  }, [grid, foliageVersion, buildingVersion, resourceDeposits]);

  const geos = useMemo(() => ({
    trunkGeo: new THREE.CylinderGeometry(0.12, 0.22, 0.85, 6),
    bareWinterTreeGeo: defaultBareWinterTreeGeo,
    oakCanopyGeo: new THREE.DodecahedronGeometry(0.72, 1),
    pineTrunkGeo: new THREE.CylinderGeometry(0.09, 0.15, 0.65, 6),
    pineT1Geo: new THREE.ConeGeometry(0.68, 0.65, 6),
    pineT2Geo: new THREE.ConeGeometry(0.54, 0.6, 6),
    pineT3Geo: new THREE.ConeGeometry(0.4, 0.5, 6),
    pineT4Geo: new THREE.ConeGeometry(0.25, 0.4, 6),
    rockGeo: new THREE.DodecahedronGeometry(0.42, 0),
    bushGeo: new THREE.DodecahedronGeometry(0.32, 1),
    bareBushGeo: defaultBareBushGeo,
    
    stumpGeo: new THREE.CylinderGeometry(0.15, 0.22, 0.22, 6),
    fallenLogGeo: new THREE.CylinderGeometry(0.13, 0.16, 1.35, 6),
    fallenBranchGeo: new THREE.DodecahedronGeometry(0.42, 1),

    tallGrassGeo: createGrassTuftGeometry(8, 0.52, 0.38),
    medGrassGeo: createGrassTuftGeometry(6, 0.38, 0.28),
    shortGrassGeo: createGrassTuftGeometry(5, 0.26, 0.22),

    reedGeo: new THREE.CylinderGeometry(0.02, 0.03, 0.65, 4),
    lilyGeo: new THREE.CylinderGeometry(0.20, 0.20, 0.02, 6),
    flowerGeo: new THREE.DodecahedronGeometry(0.09, 0),
    pebbleGeo: new THREE.DodecahedronGeometry(0.11, 0),
    shroomGeo: new THREE.ConeGeometry(0.11, 0.12, 5),
  }), []);

  const windShadersRef = useRef<Array<{ shader: { uniforms: Record<string, THREE.IUniform> }; isFlower: boolean }>>([]);
  const treeShadersRef = useRef<Array<{ shader: { uniforms: Record<string, THREE.IUniform> }; isCanopy: boolean }>>([]);
  const canopyScaleRef = useRef(1.0);
  const flowerScaleRef = useRef(1.0);

  const createWindMaterial = useMemo(() => {
    return (colorHex: string, swayIntensity: number = 1.0, isFlower: boolean = false) => {
      const mat = new THREE.MeshStandardMaterial({
        color: colorHex,
        roughness: 0.82,
        flatShading: true,
        side: THREE.DoubleSide,
      });

      mat.onBeforeCompile = (shader) => {
        windShadersRef.current.push({ shader, isFlower });
        shader.uniforms.uTime = { value: 0 };
        shader.uniforms.uFlowerScale = { value: 1.0 };

        shader.vertexShader = `
          uniform float uTime;
          uniform float uFlowerScale;
          ${shader.vertexShader}
        `.replace(
          '#include <begin_vertex>',
          `
          #include <begin_vertex>
          ${isFlower ? 'transformed *= uFlowerScale;' : ''}
          
          vec4 instPos = instanceMatrix * vec4(0.0, 0.0, 0.0, 1.0);
          float windPhase = instPos.x * 0.38 + instPos.z * 0.26 + uTime * 2.5;
          float gust = sin(windPhase) * 0.70 + sin(windPhase * 0.5 + uTime * 1.2) * 0.30;
          
          
          float heightFactor = max(0.0, position.y);
          float sway = heightFactor * heightFactor * ${swayIntensity.toFixed(2)};

          
          transformed.x += gust * sway * 0.22;
          transformed.z += gust * sway * 0.16;
          transformed.y -= abs(gust) * sway * 0.04;
          `
        );
      };

      return mat;
    };
  }, []);

  const createTreeMaterial = useMemo(() => {
    return (colorHex: string, roughness: number = 0.82, isCanopy: boolean = false) => {
      const mat = new THREE.MeshStandardMaterial({
        color: colorHex,
        roughness,
        flatShading: true,
      });

      mat.onBeforeCompile = (shader) => {
        treeShadersRef.current.push({ shader, isCanopy });
        shader.uniforms.uTime = { value: 0 };
        shader.uniforms.uCanopyScale = { value: 1.0 };
        shader.uniforms.uTreeHits = {
          value: [
            new THREE.Vector4(0, 0, 0, 0),
            new THREE.Vector4(0, 0, 0, 0),
            new THREE.Vector4(0, 0, 0, 0),
            new THREE.Vector4(0, 0, 0, 0),
            new THREE.Vector4(0, 0, 0, 0),
            new THREE.Vector4(0, 0, 0, 0),
            new THREE.Vector4(0, 0, 0, 0),
            new THREE.Vector4(0, 0, 0, 0),
          ],
        };

        shader.vertexShader = `
          uniform float uTime;
          uniform float uCanopyScale;
          uniform vec4 uTreeHits[8];
          ${shader.vertexShader}
        `.replace(
          '#include <begin_vertex>',
          `
          #include <begin_vertex>
          ${isCanopy ? 'transformed *= uCanopyScale;' : ''}
          vec4 instPos = instanceMatrix * vec4(0.0, 0.0, 0.0, 1.0);

          
          float windPhase = instPos.x * 0.28 + instPos.z * 0.22 + uTime * 2.0;
          float gust = sin(windPhase) * 0.65 + sin(windPhase * 0.4 + uTime * 1.1) * 0.35;
          float heightFactor = max(0.0, position.y);
          transformed.x += gust * heightFactor * 0.035;
          transformed.z += gust * heightFactor * 0.025;

          
          for (int i = 0; i < 8; i++) {
            vec4 hit = uTreeHits[i];
            if (hit.w > 0.01) {
              float d = distance(instPos.xz, hit.xy);
              
              if (d < 0.38) {
                float dt = uTime - hit.z;
                if (dt >= 0.0 && dt < 0.9) {
                  
                  float decay = exp(-dt * 7.5);
                  float wobble = sin(dt * 45.0) * decay * 0.30 * hit.w;
                  
                  
                  float swayArm = max(0.2, position.y + (instPos.y > 0.2 ? 0.7 : 0.0));
                  transformed.x += wobble * swayArm;
                  transformed.z += wobble * 0.35 * swayArm;
                  transformed.y -= abs(sin(dt * 45.0)) * decay * 0.03;
                }
              }
            }
          }
          `
        );
      };

      return mat;
    };
  }, []);

  const mats = useMemo(() => ({
    wood: createTreeMaterial('#422817', 0.9, false),
    oak: createTreeMaterial('#22c55e', 0.8, true),
    autumn: createTreeMaterial('#ea580c', 0.8, true),
    pine1: createTreeMaterial('#13351b', 0.85, false),
    pine2: createTreeMaterial('#184223', 0.85, false),
    pine3: createTreeMaterial('#1f4f2c', 0.85, false),
    pine4: createTreeMaterial('#286237', 0.85, false),
    rock: new THREE.MeshStandardMaterial({ color: '#4b5563', roughness: 0.88, flatShading: true }),
    bush: createTreeMaterial('#22c55e', 0.85, true),
    
    tallGrassMat: createWindMaterial('#3f782c', 1.35, false),
    medGrassMat: createWindMaterial('#4a8c32', 1.15, false),
    shortGrassMat: createWindMaterial('#5ea338', 0.95, false),

    reed: createWindMaterial('#4d7c0f', 1.20, false),
    lily: new THREE.MeshStandardMaterial({ color: '#166534', roughness: 0.6, flatShading: true }),
    flowerRed: createWindMaterial('#ef4444', 0.80, true),
    flowerYellow: createWindMaterial('#facc15', 0.80, true),
    flowerBlue: createWindMaterial('#38bdf8', 0.80, true),
    flowerWhite: createWindMaterial('#f8fafc', 0.80, true),
    pebble: new THREE.MeshStandardMaterial({ color: '#64748b', roughness: 0.9, flatShading: true }),
    mushroom: new THREE.MeshStandardMaterial({ color: '#dc2626', roughness: 0.6, flatShading: true }),
  }), [createWindMaterial, createTreeMaterial]);

  const targetPalette = useMemo(() => ({
    Spring: {
      oak: new THREE.Color('#22c55e'),
      autumn: new THREE.Color('#4ade80'),
      pine1: new THREE.Color('#13351b'),
      pine2: new THREE.Color('#184223'),
      pine3: new THREE.Color('#1f4f2c'),
      pine4: new THREE.Color('#286237'),
      bush: new THREE.Color('#22c55e'),
      tallGrass: new THREE.Color('#38a169'),
      medGrass: new THREE.Color('#48bb78'),
      shortGrass: new THREE.Color('#68d391'),
    },
    Summer: {
      oak: new THREE.Color('#1e5e1a'),
      autumn: new THREE.Color('#287024'),
      pine1: new THREE.Color('#113219'),
      pine2: new THREE.Color('#163c20'),
      pine3: new THREE.Color('#1c4a28'),
      pine4: new THREE.Color('#255f34'),
      bush: new THREE.Color('#226118'),
      tallGrass: new THREE.Color('#33691e'),
      medGrass: new THREE.Color('#3f782c'),
      shortGrass: new THREE.Color('#558b2f'),
    },
    Autumn: {
      oak: new THREE.Color('#d97706'),
      autumn: new THREE.Color('#ea580c'),
      pine1: new THREE.Color('#13351b'),
      pine2: new THREE.Color('#184223'),
      pine3: new THREE.Color('#1f4f2c'),
      pine4: new THREE.Color('#286237'),
      bush: new THREE.Color('#c2410c'),
      tallGrass: new THREE.Color('#a16207'),
      medGrass: new THREE.Color('#b45309'),
      shortGrass: new THREE.Color('#ca8a04'),
    },
    Winter: {
      oak: new THREE.Color('#422817'),
      autumn: new THREE.Color('#422817'),
      pine1: new THREE.Color('#183a22'),
      pine2: new THREE.Color('#20462c'),
      pine3: new THREE.Color('#30593e'),
      pine4: new THREE.Color('#cbd5e1'),
      bush: new THREE.Color('#422817'),
      tallGrass: new THREE.Color('#94a3b8'),
      medGrass: new THREE.Color('#cbd5e1'),
      shortGrass: new THREE.Color('#e2e8f0'),
    },
  }), []);

  useFrame(() => {
    const t = performance.now() / 1000;
    const { activeTreeHits, time } = useGameStore.getState();

    const season = time?.season || 'Spring';
    const palette = targetPalette[season];
    if (palette) {
      const factor = 0.08;
      mats.oak.color.lerp(palette.oak, factor);
      mats.autumn.color.lerp(palette.autumn, factor);
      mats.pine1.color.lerp(palette.pine1, factor);
      mats.pine2.color.lerp(palette.pine2, factor);
      mats.pine3.color.lerp(palette.pine3, factor);
      mats.pine4.color.lerp(palette.pine4, factor);
      mats.bush.color.lerp(palette.bush, factor);
      mats.tallGrassMat.color.lerp(palette.tallGrass, factor);
      mats.medGrassMat.color.lerp(palette.medGrass, factor);
      mats.shortGrassMat.color.lerp(palette.shortGrass, factor);
    }

    const targetCanopyScale = season === 'Winter' ? 0.0 : 1.0;
    const targetFlowerScale = season === 'Winter' ? 0.0 : season === 'Autumn' ? 0.35 : 1.0;

    canopyScaleRef.current = THREE.MathUtils.lerp(canopyScaleRef.current, targetCanopyScale, 0.08);
    flowerScaleRef.current = THREE.MathUtils.lerp(flowerScaleRef.current, targetFlowerScale, 0.08);

    for (let i = 0; i < windShadersRef.current.length; i++) {
      const item = windShadersRef.current[i];
      if (!item) continue;
      if (item.shader?.uniforms?.uTime) {
        item.shader.uniforms.uTime.value = t;
      }
      if (item.isFlower && item.shader?.uniforms?.uFlowerScale) {
        item.shader.uniforms.uFlowerScale.value = flowerScaleRef.current;
      }
    }

    for (let i = 0; i < treeShadersRef.current.length; i++) {
      const item = treeShadersRef.current[i];
      if (!item) continue;
      const shader = item.shader;
      if (shader.uniforms?.uTime) {
        shader.uniforms.uTime.value = t;
      }
      if (item.isCanopy && shader.uniforms?.uCanopyScale) {
        shader.uniforms.uCanopyScale.value = canopyScaleRef.current;
      }
      if (shader.uniforms?.uTreeHits) {
        const uniformHits: THREE.Vector4[] = shader.uniforms.uTreeHits.value;
        for (let j = 0; j < 8; j++) {
          const hit = activeTreeHits[j];
          if (hit) {
            uniformHits[j].set(hit.x, hit.z, hit.hitTime, hit.intensity);
          } else {
            uniformHits[j].set(0, 0, 0, 0);
          }
        }
      }
    }
  });

  const oakTrunkRef = useRef<THREE.InstancedMesh>(null);
  const oakCanopyRef = useRef<THREE.InstancedMesh>(null);
  const bareOakRef = useRef<THREE.InstancedMesh>(null);
  const autumnTrunkRef = useRef<THREE.InstancedMesh>(null);
  const autumnCanopyRef = useRef<THREE.InstancedMesh>(null);
  const bareAutumnRef = useRef<THREE.InstancedMesh>(null);
  const pineTrunkRef = useRef<THREE.InstancedMesh>(null);
  const pineT1Ref = useRef<THREE.InstancedMesh>(null);
  const pineT2Ref = useRef<THREE.InstancedMesh>(null);
  const pineT3Ref = useRef<THREE.InstancedMesh>(null);
  const pineT4Ref = useRef<THREE.InstancedMesh>(null);
  const rockRef = useRef<THREE.InstancedMesh>(null);
  const bushRef = useRef<THREE.InstancedMesh>(null);
  const bareBushRef = useRef<THREE.InstancedMesh>(null);

  const stumpRef = useRef<THREE.InstancedMesh>(null);
  const fallenLogRef = useRef<THREE.InstancedMesh>(null);
  const fallenOakCanopyRef = useRef<THREE.InstancedMesh>(null);
  const fallenAutumnCanopyRef = useRef<THREE.InstancedMesh>(null);
  const fallenPineT1Ref = useRef<THREE.InstancedMesh>(null);
  const fallenPineT2Ref = useRef<THREE.InstancedMesh>(null);
  const fallenPineT3Ref = useRef<THREE.InstancedMesh>(null);
  const fallenPineT4Ref = useRef<THREE.InstancedMesh>(null);

  const tallGrassRef = useRef<THREE.InstancedMesh>(null);
  const medGrassRef = useRef<THREE.InstancedMesh>(null);
  const shortGrassRef = useRef<THREE.InstancedMesh>(null);

  const reedRef = useRef<THREE.InstancedMesh>(null);
  const lilyRef = useRef<THREE.InstancedMesh>(null);
  const redFlowerRef = useRef<THREE.InstancedMesh>(null);
  const yellowFlowerRef = useRef<THREE.InstancedMesh>(null);
  const blueFlowerRef = useRef<THREE.InstancedMesh>(null);
  const whiteFlowerRef = useRef<THREE.InstancedMesh>(null);
  const pebbleRef = useRef<THREE.InstancedMesh>(null);
  const mushroomRef = useRef<THREE.InstancedMesh>(null);

  const TREE_CAPACITIES = useMemo(() => ({
    oakTrunk: 3500,
    oakCanopy: 3500,
    bareOak: 3500,
    autumnTrunk: 3500,
    autumnCanopy: 3500,
    bareAutumn: 3500,
    pineTrunk: 5000,
    pineT1: 5000,
    pineT2: 5000,
    pineT3: 5000,
    pineT4: 5000,
    stump: 2500,
    fallenLog: 2500,
    fallenOakCanopy: 2500,
    fallenAutumnCanopy: 2500,
    fallenPineT1: 2500,
    fallenPineT2: 2500,
    fallenPineT3: 2500,
    fallenPineT4: 2500,
    rock: 2000,
    bush: 4000,
    bareBushes: 4000,
  }), []);

  const setMats = (ref: React.RefObject<THREE.InstancedMesh | null>, matrices: THREE.Matrix4[]) => {
    if (!ref.current) return;
    const capacity = ref.current.instanceMatrix.count;
    const len = Math.min(matrices.length, capacity);
    for (let i = 0; i < len; i++) {
      ref.current.setMatrixAt(i, matrices[i]);
    }
    ref.current.count = len;
    ref.current.instanceMatrix.needsUpdate = true;
    ref.current.frustumCulled = false;
  };

  useEffect(() => {
    const refs: Record<string, React.RefObject<THREE.InstancedMesh | null>> = {
      tallGrass: tallGrassRef,
      medGrass: medGrassRef,
      shortGrass: shortGrassRef,
      reeds: reedRef,
      lilies: lilyRef,
      redFlowers: redFlowerRef,
      yellowFlowers: yellowFlowerRef,
      blueFlowers: blueFlowerRef,
      whiteFlowers: whiteFlowerRef,
      pebbles: pebbleRef,
      mushrooms: mushroomRef,
    };

    for (const [type, ref] of Object.entries(refs)) {
      if (!ref.current) continue;
      const matrices = staticFloraData.byType[type as keyof typeof staticFloraData.byType];
      for (let i = 0; i < matrices.length; i++) {
        ref.current.setMatrixAt(i, matrices[i]);
      }
      ref.current.count = matrices.length;
      ref.current.instanceMatrix.needsUpdate = true;
      ref.current.frustumCulled = false;
    }
  }, [staticFloraData]);

  const hiddenTilesRef = useRef<Set<number>>(new Set());
  const zeroMatrix = useMemo(() => new THREE.Matrix4().makeScale(0, 0, 0), []);

  useEffect(() => {
    const refs: Record<string, React.RefObject<THREE.InstancedMesh | null>> = {
      tallGrass: tallGrassRef,
      medGrass: medGrassRef,
      shortGrass: shortGrassRef,
      reeds: reedRef,
      lilies: lilyRef,
      redFlowers: redFlowerRef,
      yellowFlowers: yellowFlowerRef,
      blueFlowers: blueFlowerRef,
      whiteFlowers: whiteFlowerRef,
      pebbles: pebbleRef,
      mushrooms: mushroomRef,
    };

    const nextExcluded = new Set<number>();
    for (const b of buildingEntities) {
      if (!b.gridPosition) continue;
      const [gx, gz] = b.gridPosition;
      const bw = b.buildingWidth || 1;
      const bh = b.buildingHeight || 1;
      for (let tx = Math.floor(gx - 1); tx <= Math.ceil(gx + bw); tx++) {
        for (let tz = Math.floor(gz - 1); tz <= Math.ceil(gz + bh); tz++) {
          if (tx >= 0 && tx < grid.width && tz >= 0 && tz < grid.height) {
            nextExcluded.add(getTileIndex(tx, tz, grid.width));
          }
        }
      }
    }

    if (resourceDeposits) {
      for (const dep of resourceDeposits) {
        const [gx, gz] = dep.gridPosition;
        const r = dep.type === 'berries' ? 1 : 3;
        for (let tx = gx - r; tx <= gx + r; tx++) {
          for (let tz = gz - r; tz <= gz + r; tz++) {
            if (tx >= 0 && tx < grid.width && tz >= 0 && tz < grid.height) {
              if (distanceSq2D(tx, tz, gx, gz) <= (r + 0.5) * (r + 0.5)) {
                nextExcluded.add(getTileIndex(tx, tz, grid.width));
              }
            }
          }
        }
      }
    }

    for (let x = 0; x < grid.width; x++) {
      for (let z = 0; z < grid.height; z++) {
        const tile = grid.tiles[x]?.[z];
        if (tile && tile.terrain === 'road') {
          nextExcluded.add(getTileIndex(x, z, grid.width));
        }
      }
    }

    const prevExcluded = hiddenTilesRef.current;
    const dirtyMeshes = new Set<THREE.InstancedMesh>();

    for (const tileKey of nextExcluded) {
      if (!prevExcluded.has(tileKey)) {
        const floraOnTile = staticFloraData.tileFlora.get(tileKey);
        if (floraOnTile) {
          for (let i = 0; i < floraOnTile.length; i++) {
            const item = floraOnTile[i];
            const r = refs[item.type];
            if (r?.current) {
              r.current.setMatrixAt(item.index, zeroMatrix);
              dirtyMeshes.add(r.current);
            }
          }
        }
      }
    }

    for (const tileKey of prevExcluded) {
      if (!nextExcluded.has(tileKey)) {
        const floraOnTile = staticFloraData.tileFlora.get(tileKey);
        if (floraOnTile) {
          for (let i = 0; i < floraOnTile.length; i++) {
            const item = floraOnTile[i];
            const r = refs[item.type];
            if (r?.current) {
              r.current.setMatrixAt(item.index, item.origMatrix);
              dirtyMeshes.add(r.current);
            }
          }
        }
      }
    }

    for (const mesh of dirtyMeshes) {
      mesh.instanceMatrix.needsUpdate = true;
    }

    hiddenTilesRef.current = nextExcluded;
  }, [buildingVersion, foliageVersion, resourceDeposits, staticFloraData, grid.width, grid.height, zeroMatrix]);

  useEffect(() => {
    setMats(oakTrunkRef, treesAndFloraData.oakTrunks);
    setMats(oakCanopyRef, treesAndFloraData.oakCanopies);
    setMats(bareOakRef, treesAndFloraData.bareOakTrees);
    setMats(autumnTrunkRef, treesAndFloraData.autumnTrunks);
    setMats(autumnCanopyRef, treesAndFloraData.autumnCanopies);
    setMats(bareAutumnRef, treesAndFloraData.bareAutumnTrees);
    setMats(pineTrunkRef, treesAndFloraData.pineTrunks);
    setMats(pineT1Ref, treesAndFloraData.pineTiers.map((p) => p.t1));
    setMats(pineT2Ref, treesAndFloraData.pineTiers.map((p) => p.t2));
    setMats(pineT3Ref, treesAndFloraData.pineTiers.map((p) => p.t3));
    setMats(pineT4Ref, treesAndFloraData.pineTiers.map((p) => p.t4));
    setMats(rockRef, treesAndFloraData.rocks);
    setMats(bushRef, treesAndFloraData.bushes);
    setMats(bareBushRef, treesAndFloraData.bareBushes);

    setMats(stumpRef, treesAndFloraData.stumps);
    setMats(fallenLogRef, treesAndFloraData.fallenLogs);
    setMats(fallenOakCanopyRef, treesAndFloraData.fallenOakCanopies);
    setMats(fallenAutumnCanopyRef, treesAndFloraData.fallenAutumnCanopies);
    setMats(fallenPineT1Ref, treesAndFloraData.fallenPineTiers.map((p) => p.t1));
    setMats(fallenPineT2Ref, treesAndFloraData.fallenPineTiers.map((p) => p.t2));
    setMats(fallenPineT3Ref, treesAndFloraData.fallenPineTiers.map((p) => p.t3));
    setMats(fallenPineT4Ref, treesAndFloraData.fallenPineTiers.map((p) => p.t4));
  }, [treesAndFloraData]);

  return (
    <group visible={!isStrategicView}>
      <instancedMesh
        ref={bareOakRef}
        args={[geos.bareWinterTreeGeo, mats.wood, TREE_CAPACITIES.bareOak]}
        frustumCulled={false}
        visible={isWinter}
        castShadow
        receiveShadow
      />
      <instancedMesh
        ref={oakTrunkRef}
        args={[geos.trunkGeo, mats.wood, TREE_CAPACITIES.oakTrunk]}
        frustumCulled={false}
        visible={!isWinter}
        castShadow
        receiveShadow
      />
      <instancedMesh
        ref={oakCanopyRef}
        args={[geos.oakCanopyGeo, mats.oak, TREE_CAPACITIES.oakCanopy]}
        frustumCulled={false}
        visible={!isWinter}
        castShadow
        receiveShadow
      />

      <instancedMesh
        ref={bareAutumnRef}
        args={[geos.bareWinterTreeGeo, mats.wood, TREE_CAPACITIES.bareAutumn]}
        frustumCulled={false}
        visible={isWinter}
        castShadow
        receiveShadow
      />
      <instancedMesh
        ref={autumnTrunkRef}
        args={[geos.trunkGeo, mats.wood, TREE_CAPACITIES.autumnTrunk]}
        frustumCulled={false}
        visible={!isWinter}
        castShadow
        receiveShadow
      />
      <instancedMesh
        ref={autumnCanopyRef}
        args={[geos.oakCanopyGeo, mats.autumn, TREE_CAPACITIES.autumnCanopy]}
        frustumCulled={false}
        visible={!isWinter}
        castShadow
        receiveShadow
      />

      <instancedMesh
        ref={pineTrunkRef}
        args={[geos.pineTrunkGeo, mats.wood, TREE_CAPACITIES.pineTrunk]}
        frustumCulled={false}
        castShadow
        receiveShadow
      />
      <instancedMesh
        ref={pineT1Ref}
        args={[geos.pineT1Geo, mats.pine1, TREE_CAPACITIES.pineT1]}
        frustumCulled={false}
        castShadow
        receiveShadow
      />
      <instancedMesh
        ref={pineT2Ref}
        args={[geos.pineT2Geo, mats.pine2, TREE_CAPACITIES.pineT2]}
        frustumCulled={false}
        castShadow
        receiveShadow
      />
      <instancedMesh
        ref={pineT3Ref}
        args={[geos.pineT3Geo, mats.pine3, TREE_CAPACITIES.pineT3]}
        frustumCulled={false}
        castShadow
        receiveShadow
      />
      <instancedMesh
        ref={pineT4Ref}
        args={[geos.pineT4Geo, mats.pine4, TREE_CAPACITIES.pineT4]}
        frustumCulled={false}
        castShadow
        receiveShadow
      />

      <instancedMesh
        ref={stumpRef}
        args={[geos.stumpGeo, mats.wood, TREE_CAPACITIES.stump]}
        frustumCulled={false}
        castShadow
        receiveShadow
      />

      <instancedMesh
        ref={fallenLogRef}
        args={[geos.fallenLogGeo, mats.wood, TREE_CAPACITIES.fallenLog]}
        frustumCulled={false}
        castShadow
        receiveShadow
      />

      <instancedMesh
        ref={fallenOakCanopyRef}
        args={[geos.oakCanopyGeo, mats.oak, TREE_CAPACITIES.fallenOakCanopy]}
        frustumCulled={false}
        visible={!isWinter}
        castShadow
        receiveShadow
      />
      <instancedMesh
        ref={fallenAutumnCanopyRef}
        args={[geos.oakCanopyGeo, mats.autumn, TREE_CAPACITIES.fallenAutumnCanopy]}
        frustumCulled={false}
        visible={!isWinter}
        castShadow
        receiveShadow
      />
      <instancedMesh
        ref={fallenPineT1Ref}
        args={[geos.pineT1Geo, mats.pine1, TREE_CAPACITIES.fallenPineT1]}
        frustumCulled={false}
        castShadow
        receiveShadow
      />
      <instancedMesh
        ref={fallenPineT2Ref}
        args={[geos.pineT2Geo, mats.pine2, TREE_CAPACITIES.fallenPineT2]}
        frustumCulled={false}
        castShadow
        receiveShadow
      />
      <instancedMesh
        ref={fallenPineT3Ref}
        args={[geos.pineT3Geo, mats.pine3, TREE_CAPACITIES.fallenPineT3]}
        frustumCulled={false}
        castShadow
        receiveShadow
      />
      <instancedMesh
        ref={fallenPineT4Ref}
        args={[geos.pineT4Geo, mats.pine4, TREE_CAPACITIES.fallenPineT4]}
        frustumCulled={false}
        castShadow
        receiveShadow
      />

      {fallingTrees.map((tree) => (
        <FallingTreeItem key={tree.id} tree={tree} grid={grid} />
      ))}

      <instancedMesh
        ref={rockRef}
        args={[geos.rockGeo, mats.rock, TREE_CAPACITIES.rock]}
        frustumCulled={false}
        castShadow
        receiveShadow
      />

      <instancedMesh
        ref={bareBushRef}
        args={[geos.bareBushGeo, mats.wood, TREE_CAPACITIES.bareBushes]}
        frustumCulled={false}
        visible={isWinter}
        castShadow
        receiveShadow
      />
      <instancedMesh
        ref={bushRef}
        args={[geos.bushGeo, mats.bush, TREE_CAPACITIES.bush]}
        frustumCulled={false}
        visible={!isWinter}
        castShadow
        receiveShadow
      />

      <instancedMesh
        ref={tallGrassRef}
        args={[geos.tallGrassGeo, mats.tallGrassMat, staticFloraData.counts.tallGrass]}
        frustumCulled={false}
        visible={!isWinter}
        castShadow
        receiveShadow
      />
      <instancedMesh
        ref={medGrassRef}
        args={[geos.medGrassGeo, mats.medGrassMat, staticFloraData.counts.medGrass]}
        frustumCulled={false}
        visible={!isWinter}
        castShadow
        receiveShadow
      />
      <instancedMesh
        ref={shortGrassRef}
        args={[geos.shortGrassGeo, mats.shortGrassMat, staticFloraData.counts.shortGrass]}
        frustumCulled={false}
        visible={true}
        castShadow
        receiveShadow
      />

      <instancedMesh
        ref={reedRef}
        args={[geos.reedGeo, mats.reed, staticFloraData.counts.reeds]}
        frustumCulled={false}
        visible={!isWinter}
        castShadow
        receiveShadow
      />

      <instancedMesh
        ref={lilyRef}
        args={[geos.lilyGeo, mats.lily, staticFloraData.counts.lilies]}
        frustumCulled={false}
        visible={!isWinter}
        receiveShadow
      />

      <instancedMesh
        ref={redFlowerRef}
        args={[geos.flowerGeo, mats.flowerRed, staticFloraData.counts.redFlowers]}
        frustumCulled={false}
        visible={!isWinter}
        castShadow
      />
      <instancedMesh
        ref={yellowFlowerRef}
        args={[geos.flowerGeo, mats.flowerYellow, staticFloraData.counts.yellowFlowers]}
        frustumCulled={false}
        visible={!isWinter}
        castShadow
      />
      <instancedMesh
        ref={blueFlowerRef}
        args={[geos.flowerGeo, mats.flowerBlue, staticFloraData.counts.blueFlowers]}
        frustumCulled={false}
        visible={!isWinter}
        castShadow
      />
      <instancedMesh
        ref={whiteFlowerRef}
        args={[geos.flowerGeo, mats.flowerWhite, staticFloraData.counts.whiteFlowers]}
        frustumCulled={false}
        visible={!isWinter}
        castShadow
      />

      <instancedMesh
        ref={pebbleRef}
        args={[geos.pebbleGeo, mats.pebble, staticFloraData.counts.pebbles]}
        frustumCulled={false}
        visible={true}
        castShadow
        receiveShadow
      />

      <instancedMesh
        ref={mushroomRef}
        args={[geos.shroomGeo, mats.mushroom, staticFloraData.counts.mushrooms]}
        frustumCulled={false}
        visible={!isWinter}
        castShadow
      />
    </group>
  );
}
