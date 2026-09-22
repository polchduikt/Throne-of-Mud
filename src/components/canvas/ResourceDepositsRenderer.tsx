import { useRef, useState, memo } from 'react';
import { useFrame } from '@react-three/fiber';
import { Html } from '@react-three/drei';
import * as THREE from 'three';
import { useGameStore } from '../../store/useGameStore';
import type { ResourceDeposit } from '../../types/game';
import { GridMap } from '../../engine/grid/GridMap';

const DEPOSIT_MATS = {
  waterRipple: new THREE.MeshBasicMaterial({ color: '#38bdf8', transparent: true, opacity: 0.55 }),
  fishSilver: new THREE.MeshStandardMaterial({ color: '#e2e8f0', metalness: 0.85, roughness: 0.2, flatShading: true }),
  pierWood: new THREE.MeshStandardMaterial({ color: '#452a16', roughness: 0.9, flatShading: true }),
  pierPlank: new THREE.MeshStandardMaterial({ color: '#664323', roughness: 0.85, flatShading: true }),
  rope: new THREE.MeshStandardMaterial({ color: '#d97706', roughness: 0.9, flatShading: true }),
  fishNet: new THREE.MeshStandardMaterial({ color: '#92400e', roughness: 0.95, wireframe: true }),

  berryLeaves1: new THREE.MeshStandardMaterial({ color: '#166534', roughness: 0.85, flatShading: true }),
  berryLeaves2: new THREE.MeshStandardMaterial({ color: '#14532d', roughness: 0.9, flatShading: true }),
  berryLeaves3: new THREE.MeshStandardMaterial({ color: '#15803d', roughness: 0.8, flatShading: true }),
  berryStem: new THREE.MeshStandardMaterial({ color: '#3f2e18', roughness: 0.95, flatShading: true }),
  berryBlue: new THREE.MeshStandardMaterial({ color: '#1e3a8a', roughness: 0.25, metalness: 0.2, flatShading: true }),
  berryGlint: new THREE.MeshStandardMaterial({ color: '#2563eb', roughness: 0.2, metalness: 0.3, flatShading: true }),
  berryDark: new THREE.MeshStandardMaterial({ color: '#090914', roughness: 0.3, flatShading: true }),
  basketWicker: new THREE.MeshStandardMaterial({ color: '#b45309', roughness: 0.9, flatShading: true }),

  stoneLimestone: new THREE.MeshStandardMaterial({ color: '#e7e5e4', roughness: 0.85, flatShading: true }),
  stoneRockFace: new THREE.MeshStandardMaterial({ color: '#a8a29e', roughness: 0.9, flatShading: true }),
  stoneDark: new THREE.MeshStandardMaterial({ color: '#57534e', roughness: 0.95, flatShading: true }),
  craneWood: new THREE.MeshStandardMaterial({ color: '#452a16', roughness: 0.88, flatShading: true }),
  ironTool: new THREE.MeshStandardMaterial({ color: '#334155', metalness: 0.7, roughness: 0.35, flatShading: true }),

  aditBeam: new THREE.MeshStandardMaterial({ color: '#382211', roughness: 0.9, flatShading: true }),
  aditDarkness: new THREE.MeshBasicMaterial({ color: '#020617' }),
  minecartWood: new THREE.MeshStandardMaterial({ color: '#54361e', roughness: 0.85, flatShading: true }),
  minecartIron: new THREE.MeshStandardMaterial({ color: '#1e293b', metalness: 0.8, roughness: 0.3, flatShading: true }),
  ironOreDark: new THREE.MeshStandardMaterial({ color: '#1e232d', metalness: 0.6, roughness: 0.45, flatShading: true }),
  ironRust: new THREE.MeshStandardMaterial({ color: '#c2410c', roughness: 0.7, flatShading: true }),
  mineTrackWood: new THREE.MeshStandardMaterial({ color: '#27170a', roughness: 0.9, flatShading: true }),
  lanternGlow: new THREE.MeshBasicMaterial({ color: '#fbbf24' }),

  clayTerracotta: new THREE.MeshStandardMaterial({ color: '#9a3412', roughness: 0.92, flatShading: true }),
  clayWet: new THREE.MeshStandardMaterial({ color: '#6c2207', roughness: 0.4, flatShading: true }),
  clayMudWater: new THREE.MeshStandardMaterial({ color: '#451a03', roughness: 0.2, metalness: 0.1 }),
  clayBrickDrying: new THREE.MeshStandardMaterial({ color: '#c2410c', roughness: 0.95, flatShading: true }),
  scaffoldWood: new THREE.MeshStandardMaterial({ color: '#54361e', roughness: 0.85, flatShading: true }),

  saltWhite: new THREE.MeshStandardMaterial({ color: '#f8fafc', roughness: 0.35, flatShading: true }),
  saltCrystal: new THREE.MeshStandardMaterial({ color: '#f1f5f9', roughness: 0.2, metalness: 0.25, flatShading: true }),
  brineWater: new THREE.MeshBasicMaterial({ color: '#06b6d4', transparent: true, opacity: 0.65 }),
  boardwalkWood: new THREE.MeshStandardMaterial({ color: '#713f12', roughness: 0.85, flatShading: true }),
  barrelWood: new THREE.MeshStandardMaterial({ color: '#5c3a1d', roughness: 0.9, flatShading: true }),
  sackCloth: new THREE.MeshStandardMaterial({ color: '#d6c7a1', roughness: 0.95, flatShading: true }),

  stagFur: new THREE.MeshStandardMaterial({ color: '#78350f', roughness: 0.85, flatShading: true }),
  doeFur: new THREE.MeshStandardMaterial({ color: '#92400e', roughness: 0.85, flatShading: true }),
  fawnFur: new THREE.MeshStandardMaterial({ color: '#b45309', roughness: 0.8, flatShading: true }),
  deerAntler: new THREE.MeshStandardMaterial({ color: '#f5efe6', roughness: 0.65, flatShading: true }),
  mossyLog: new THREE.MeshStandardMaterial({ color: '#3f2e18', roughness: 0.9, flatShading: true }),
  mossGreen: new THREE.MeshStandardMaterial({ color: '#365314', roughness: 0.95, flatShading: true }),
};

const BERRY_BUSH_CONFIGS = [
  { px: 0.0, pz: 0.0, s: 1.15, mat: DEPOSIT_MATS.berryLeaves1 },
  { px: -1.2, pz: 0.7, s: 1.05, mat: DEPOSIT_MATS.berryLeaves2 },
  { px: 1.1, pz: -0.85, s: 1.08, mat: DEPOSIT_MATS.berryLeaves3 },
  { px: -0.95, pz: -0.95, s: 0.95, mat: DEPOSIT_MATS.berryLeaves1 },
  { px: 1.3, pz: 0.65, s: 1.0, mat: DEPOSIT_MATS.berryLeaves2 },
  { px: 0.2, pz: 1.25, s: 0.95, mat: DEPOSIT_MATS.berryLeaves3 },
];

export function ResourceDepositsRenderer({ grid }: { grid?: GridMap }) {
  const resourceDeposits = useGameStore((state) => state.resourceDeposits);
  const selectedEntityId = useGameStore((state) => state.selectedEntityId);
  const setSelectedEntityId = useGameStore((state) => state.setSelectedEntityId);
  const isStrategicView = useGameStore((state) => state.isStrategicView);

  if (isStrategicView) return null;
  if (!resourceDeposits || resourceDeposits.length === 0) return null;

  return (
    <group dispose={null}>
      {resourceDeposits.map((dep) => (
        <DepositNodeMemo
          key={dep.id}
          deposit={dep}
          grid={grid}
          isSelected={selectedEntityId === dep.id}
          onSelect={() => setSelectedEntityId(dep.id)}
        />
      ))}
    </group>
  );
}

const DepositNodeMemo = memo(DepositNode);

const _camDir = new THREE.Vector3();

function DepositNode({
  deposit,
  grid,
  isSelected,
  onSelect,
}: {
  deposit: ResourceDeposit;
  grid?: GridMap;
  isSelected: boolean;
  onSelect: () => void;
}) {
  const nodeRef = useRef<THREE.Group>(null);
  const fishRef = useRef<THREE.Group>(null);
  const stagHeadRef = useRef<THREE.Group>(null);
  const doe1HeadRef = useRef<THREE.Group>(null);
  const doe2HeadRef = useRef<THREE.Group>(null);

  const [inView, setInView] = useState(true);
  const frameCount = useRef(0);

  const [x, , z] = deposit.position;
  const gx = Math.floor(x);
  const gz = Math.floor(z);
  const groundH = grid?.getTile(gx, gz)?.height ?? 0.05;
  const y = deposit.type === 'fish' ? 0.05 : Math.max(deposit.position[1] ?? 0.1, groundH + 0.02);

  useFrame(({ camera, clock }) => {
    frameCount.current++;

    if (frameCount.current % 10 === 0) {
      const orthoCam = camera as THREE.OrthographicCamera;
      const zoom = orthoCam.zoom || 38;

      _camDir.set(0, 0, -1).applyQuaternion(camera.quaternion);
      let targetX = camera.position.x;
      let targetZ = camera.position.z;
      if (Math.abs(_camDir.y) > 0.0001) {
        const t = -camera.position.y / _camDir.y;
        targetX = camera.position.x + _camDir.x * t;
        targetZ = camera.position.z + _camDir.z * t;
      }

      const distSq = (x - targetX) * (x - targetX) + (z - targetZ) * (z - targetZ);

      const shouldBeInView = zoom >= 16 && distSq < 70 * 70;
      if (shouldBeInView !== inView) {
        setInView(shouldBeInView);
      }
    }

    const t = clock.getElapsedTime();

    if (fishRef.current && deposit.type === 'fish') {
      const fishCycle = (t * 2.2 + deposit.position[0]) % (Math.PI * 2);
      if (fishCycle < Math.PI) {
        fishRef.current.position.y = Math.sin(fishCycle) * 0.55;
        fishRef.current.position.x = Math.cos(fishCycle) * 0.5;
        fishRef.current.rotation.z = -Math.cos(fishCycle) * 0.8;
        fishRef.current.visible = true;
      } else {
        fishRef.current.position.y = -0.2;
        fishRef.current.visible = false;
      }
    }

    if (deposit.type === 'wild_game') {
      if (stagHeadRef.current) {
        stagHeadRef.current.rotation.y = Math.sin(t * 0.6) * 0.35;
      }
      if (doe1HeadRef.current) {
        doe1HeadRef.current.rotation.x = -0.6 + Math.sin(t * 1.8) * 0.2;
      }
      if (doe2HeadRef.current) {
        doe2HeadRef.current.rotation.y = Math.cos(t * 0.8 + 1.2) * 0.4;
      }
    }
  });

  const fillPercent = Math.max(0, Math.min(100, Math.round((deposit.currentAmount / deposit.maxAmount) * 100)));

  let badgeY = 1.6;
  if (deposit.type === 'stone') badgeY = 2.4;
  else if (deposit.type === 'iron') badgeY = 2.3;
  else if (deposit.type === 'wild_game') badgeY = 1.8;
  else if (deposit.type === 'berries') badgeY = 1.7;

  return (
    <group
      ref={nodeRef}
      position={[x, y, z]}
      dispose={null}
      onClick={(e) => {
        e.stopPropagation();
        onSelect();
      }}
    >

      {deposit.type === 'fish' && (
        <group>
          <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0.02, 0]} material={DEPOSIT_MATS.waterRipple}>
            <ringGeometry args={[0.9, 1.4, 24]} />
          </mesh>
          <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0.6, 0.02, -0.5]} material={DEPOSIT_MATS.waterRipple}>
            <ringGeometry args={[0.45, 0.75, 18]} />
          </mesh>

          <group position={[-0.85, 0.15, 0.1]}>
            {[-0.35, 0.35].map((px, i) =>
              [-0.65, 0.65].map((pz, j) => (
                <mesh key={`${i}-${j}`} position={[px, 0.05, pz]} material={DEPOSIT_MATS.pierWood}>
                  <cylinderGeometry args={[0.05, 0.05, 0.55, 6]} />
                </mesh>
              ))
            )}
            <mesh position={[0, 0.28, 0]} material={DEPOSIT_MATS.pierPlank} castShadow>
              <boxGeometry args={[0.95, 0.08, 1.7]} />
            </mesh>
            <mesh position={[0.38, 0.42, 0.75]} material={DEPOSIT_MATS.pierWood}>
              <cylinderGeometry args={[0.045, 0.05, 0.28, 6]} />
            </mesh>
            <mesh position={[-0.38, 0.42, 0.75]} material={DEPOSIT_MATS.pierWood}>
              <cylinderGeometry args={[0.045, 0.05, 0.28, 6]} />
            </mesh>
            <mesh position={[0, 0.33, -0.4]} rotation={[-Math.PI / 2, 0, 0]} material={DEPOSIT_MATS.fishNet}>
              <planeGeometry args={[0.7, 0.35]} />
            </mesh>
          </group>

          <group position={[-0.1, 0.08, 1.0]} rotation={[0, 0.25, 0]}>
            <mesh material={DEPOSIT_MATS.pierWood}>
              <boxGeometry args={[0.6, 0.22, 1.3]} />
            </mesh>
            <mesh position={[0, 0.07, 0]} material={DEPOSIT_MATS.pierPlank}>
              <boxGeometry args={[0.48, 0.16, 1.15]} />
            </mesh>
            <mesh position={[0, 0.12, 0.1]} material={DEPOSIT_MATS.pierWood}>
              <boxGeometry args={[0.48, 0.06, 0.2]} />
            </mesh>
          </group>

          <group ref={fishRef} position={[0.35, 0, -0.2]}>
            <mesh material={DEPOSIT_MATS.fishSilver}>
              <boxGeometry args={[0.34, 0.12, 0.08]} />
            </mesh>
            <mesh position={[-0.2, 0.03, 0]} rotation={[0, 0, 0.3]} material={DEPOSIT_MATS.fishSilver}>
              <boxGeometry args={[0.14, 0.18, 0.03]} />
            </mesh>
          </group>
        </group>
      )}

      {deposit.type === 'berries' && (
        <group>
          {BERRY_BUSH_CONFIGS.map((b, i) => (
            <group key={i} position={[b.px, 0, b.pz]} scale={[b.s, b.s, b.s]}>
              <mesh position={[0, 0.15, 0]} material={DEPOSIT_MATS.berryStem}>
                <cylinderGeometry args={[0.05, 0.08, 0.35, 5]} />
              </mesh>

              <mesh position={[0, 0.45, 0]} material={b.mat}>
                <dodecahedronGeometry args={[0.65, 1]} />
              </mesh>
              <mesh position={[0.2, 0.35, 0.15]} material={b.mat}>
                <dodecahedronGeometry args={[0.48, 1]} />
              </mesh>
              <mesh position={[-0.2, 0.32, -0.12]} material={b.mat}>
                <dodecahedronGeometry args={[0.42, 1]} />
              </mesh>

              <mesh position={[0.36, 0.52, 0.25]} material={DEPOSIT_MATS.berryGlint}>
                <sphereGeometry args={[0.13, 6, 5]} />
              </mesh>
              <mesh position={[-0.34, 0.44, 0.3]} material={DEPOSIT_MATS.berryBlue}>
                <sphereGeometry args={[0.14, 6, 5]} />
              </mesh>
              <mesh position={[0.12, 0.76, -0.15]} material={DEPOSIT_MATS.berryGlint}>
                <sphereGeometry args={[0.13, 6, 5]} />
              </mesh>
              <mesh position={[-0.3, 0.58, -0.28]} material={DEPOSIT_MATS.berryDark}>
                <sphereGeometry args={[0.12, 6, 5]} />
              </mesh>
              <mesh position={[0.4, 0.38, -0.2]} material={DEPOSIT_MATS.berryBlue}>
                <sphereGeometry args={[0.13, 6, 5]} />
              </mesh>
            </group>
          ))}

          <group position={[-0.25, 0, -0.7]}>
            <mesh position={[0, 0.18, 0]} material={DEPOSIT_MATS.berryStem}>
              <cylinderGeometry args={[0.26, 0.3, 0.36, 6]} />
            </mesh>
            <mesh position={[0, 0.37, 0]} material={DEPOSIT_MATS.mossGreen}>
              <circleGeometry args={[0.24, 6]} />
            </mesh>
          </group>

          <group position={[0.75, 0, 0.2]} rotation={[0, -0.4, 0.1]}>
            <mesh position={[0, 0.15, 0]} material={DEPOSIT_MATS.basketWicker}>
              <cylinderGeometry args={[0.24, 0.18, 0.3, 8]} />
            </mesh>
            <mesh position={[0, 0.26, 0]} material={DEPOSIT_MATS.berryGlint}>
              <sphereGeometry args={[0.2, 7, 5]} />
            </mesh>
          </group>
        </group>
      )}

      {deposit.type === 'stone' && (
        <group>
          <mesh position={[-0.5, 0.75, -0.55]} rotation={[0.05, 0.2, -0.05]} material={DEPOSIT_MATS.stoneRockFace} castShadow>
            <boxGeometry args={[2.8, 1.5, 1.5]} />
          </mesh>
          <mesh position={[0.7, 0.42, -0.35]} rotation={[-0.05, -0.15, 0.05]} material={DEPOSIT_MATS.stoneLimestone}>
            <boxGeometry args={[1.8, 0.85, 1.2]} />
          </mesh>
          <mesh position={[-0.85, 0.25, 0.55]} rotation={[0.1, -0.4, 0.1]} material={DEPOSIT_MATS.stoneDark}>
            <boxGeometry args={[1.2, 0.5, 1.0]} />
          </mesh>

          <group position={[0.55, 0, 0.55]} rotation={[0, -0.35, 0]}>
            <mesh position={[0, 1.2, 0]} material={DEPOSIT_MATS.craneWood}>
              <cylinderGeometry args={[0.08, 0.11, 2.4, 6]} />
            </mesh>
            <mesh position={[-0.55, 1.8, -0.25]} rotation={[0, 0.4, 0.7]} material={DEPOSIT_MATS.craneWood}>
              <boxGeometry args={[0.08, 1.6, 0.08]} />
            </mesh>
            <mesh position={[-1.0, 1.2, -0.45]} material={DEPOSIT_MATS.rope}>
              <cylinderGeometry args={[0.02, 0.02, 0.9, 4]} />
            </mesh>
            <mesh position={[-1.0, 0.65, -0.45]} material={DEPOSIT_MATS.stoneLimestone}>
              <boxGeometry args={[0.55, 0.35, 0.4]} />
            </mesh>
          </group>

          <mesh position={[-0.25, 0.14, 0.85]} material={DEPOSIT_MATS.stoneLimestone}>
            <boxGeometry args={[0.65, 0.28, 0.45]} />
          </mesh>
          <mesh position={[-0.32, 0.38, 0.8]} material={DEPOSIT_MATS.stoneLimestone}>
            <boxGeometry args={[0.52, 0.22, 0.38]} />
          </mesh>
          <mesh position={[1.1, 0.12, 0.2]} material={DEPOSIT_MATS.stoneLimestone}>
            <dodecahedronGeometry args={[0.24, 0]} />
          </mesh>
          <mesh position={[0.85, 0.1, 0.85]} material={DEPOSIT_MATS.stoneRockFace}>
            <dodecahedronGeometry args={[0.2, 0]} />
          </mesh>
        </group>
      )}

      {deposit.type === 'iron' && (
        <group>
          <mesh position={[0, 0.95, -0.95]} rotation={[-0.1, 0, 0]} material={DEPOSIT_MATS.ironOreDark} castShadow>
            <boxGeometry args={[3.2, 1.9, 1.6]} />
          </mesh>
          <mesh position={[-1.1, 0.7, -0.4]} rotation={[0.2, 0.4, -0.1]} material={DEPOSIT_MATS.ironRust}>
            <boxGeometry args={[1.0, 1.1, 0.7]} />
          </mesh>
          <mesh position={[1.15, 0.6, -0.35]} rotation={[-0.1, -0.3, 0.2]} material={DEPOSIT_MATS.ironOreDark}>
            <boxGeometry args={[0.9, 0.9, 0.6]} />
          </mesh>

          <group position={[0, 0, -0.2]}>
            <mesh position={[0, 0.85, -0.22]} material={DEPOSIT_MATS.aditDarkness}>
              <boxGeometry args={[1.35, 1.7, 0.25]} />
            </mesh>
            <mesh position={[-0.7, 0.9, 0]} material={DEPOSIT_MATS.aditBeam}>
              <boxGeometry args={[0.2, 1.8, 0.2]} />
            </mesh>
            <mesh position={[0.7, 0.9, 0]} material={DEPOSIT_MATS.aditBeam}>
              <boxGeometry args={[0.2, 1.8, 0.2]} />
            </mesh>
            <mesh position={[0, 1.8, 0]} material={DEPOSIT_MATS.aditBeam}>
              <boxGeometry args={[1.8, 0.24, 0.26]} />
            </mesh>
            <mesh position={[0, 1.45, 0.15]} material={DEPOSIT_MATS.lanternGlow}>
              <boxGeometry args={[0.18, 0.24, 0.18]} />
            </mesh>
          </group>

          <group position={[0, 0.02, 0.75]}>
            <mesh position={[-0.4, 0.02, 0]} material={DEPOSIT_MATS.mineTrackWood}>
              <boxGeometry args={[0.08, 0.05, 2.2]} />
            </mesh>
            <mesh position={[0.4, 0.02, 0]} material={DEPOSIT_MATS.mineTrackWood}>
              <boxGeometry args={[0.08, 0.05, 2.2]} />
            </mesh>
            {[-0.7, -0.2, 0.3, 0.8].map((tz, i) => (
              <mesh key={i} position={[0, 0.01, tz]} material={DEPOSIT_MATS.mineTrackWood}>
                <boxGeometry args={[1.05, 0.04, 0.12]} />
              </mesh>
            ))}
          </group>

          <group position={[0, 0.16, 0.7]}>
            {[-0.38, 0.38].map((wx, i) =>
              [-0.28, 0.28].map((wz, j) => (
                <mesh key={`${i}-${j}`} position={[wx, 0.04, wz]} rotation={[0, 0, Math.PI / 2]} material={DEPOSIT_MATS.minecartIron}>
                  <cylinderGeometry args={[0.1, 0.1, 0.05, 8]} />
                </mesh>
              ))
            )}
            <mesh position={[0, 0.24, 0]} material={DEPOSIT_MATS.minecartWood}>
              <boxGeometry args={[0.72, 0.42, 0.88]} />
            </mesh>
            <mesh position={[0, 0.44, 0]} material={DEPOSIT_MATS.ironOreDark}>
              <dodecahedronGeometry args={[0.26, 0]} />
            </mesh>
            <mesh position={[0.08, 0.48, 0.14]} material={DEPOSIT_MATS.ironRust} scale={[0.8, 0.8, 0.8]}>
              <dodecahedronGeometry args={[0.24, 0]} />
            </mesh>
          </group>

          <mesh position={[0.95, 0.14, 0.5]} material={DEPOSIT_MATS.ironRust}>
            <dodecahedronGeometry args={[0.3, 0]} />
          </mesh>
        </group>
      )}

      {deposit.type === 'clay' && (
        <group>
          <mesh position={[0, 0.14, 0]} material={DEPOSIT_MATS.clayTerracotta} castShadow>
            <cylinderGeometry args={[2.2, 2.6, 0.28, 9]} />
          </mesh>
          <mesh position={[0.12, 0.24, -0.12]} material={DEPOSIT_MATS.clayWet}>
            <cylinderGeometry args={[1.3, 1.6, 0.22, 8]} />
          </mesh>
          <mesh position={[0.12, 0.36, -0.12]} rotation={[-Math.PI / 2, 0, 0]} material={DEPOSIT_MATS.clayMudWater}>
            <circleGeometry args={[0.75, 12]} />
          </mesh>

          <group position={[-1.0, 0.2, 0.65]} rotation={[0, 0.35, 0]}>
            {[-0.45, 0.45].map((rx, i) => (
              <mesh key={i} position={[rx, 0.26, 0]} material={DEPOSIT_MATS.scaffoldWood}>
                <cylinderGeometry args={[0.04, 0.04, 0.58, 5]} />
              </mesh>
            ))}
            <mesh position={[0, 0.46, 0]} material={DEPOSIT_MATS.scaffoldWood}>
              <boxGeometry args={[1.05, 0.04, 0.32]} />
            </mesh>
            {[-0.32, 0, 0.32].map((bx, j) => (
              <mesh key={j} position={[bx, 0.54, 0]} material={DEPOSIT_MATS.clayBrickDrying}>
                <boxGeometry args={[0.22, 0.12, 0.18]} />
              </mesh>
            ))}
          </group>
        </group>
      )}

      {deposit.type === 'salt' && (
        <group>
          <mesh position={[0, 0.1, 0]} material={DEPOSIT_MATS.saltWhite} castShadow>
            <cylinderGeometry args={[1.8, 2.2, 0.2, 9]} />
          </mesh>
          <mesh position={[0, 0.21, 0]} rotation={[-Math.PI / 2, 0, 0]} material={DEPOSIT_MATS.brineWater}>
            <circleGeometry args={[1.0, 14]} />
          </mesh>
          <mesh position={[-0.6, 0.32, 0.45]} rotation={[0.2, 0.3, 0.1]} material={DEPOSIT_MATS.saltCrystal}>
            <boxGeometry args={[0.48, 0.4, 0.42]} />
          </mesh>
          <mesh position={[0.65, 0.28, -0.4]} rotation={[-0.1, 0.5, -0.2]} material={DEPOSIT_MATS.saltWhite}>
            <boxGeometry args={[0.38, 0.32, 0.34]} />
          </mesh>

          <mesh position={[0.25, 0.24, 1.05]} material={DEPOSIT_MATS.boardwalkWood}>
            <boxGeometry args={[1.9, 0.07, 0.48]} />
          </mesh>
          <group position={[-1.05, 0.18, 0.4]}>
            <mesh position={[0, 0.22, 0]} material={DEPOSIT_MATS.barrelWood}>
              <cylinderGeometry args={[0.24, 0.24, 0.44, 8]} />
            </mesh>
            <mesh position={[0, 0.44, 0]} material={DEPOSIT_MATS.saltWhite}>
              <sphereGeometry args={[0.2, 7, 5]} />
            </mesh>
          </group>
        </group>
      )}

      {deposit.type === 'wild_game' && (
        <group>
          <group position={[0.1, 0.14, -0.5]} rotation={[0, 0.35, 0]}>
            <mesh rotation={[0, 0, Math.PI / 2]} material={DEPOSIT_MATS.mossyLog}>
              <cylinderGeometry args={[0.18, 0.22, 2.4, 6]} />
            </mesh>
          </group>

          <group position={[0.8, 0, 0.4]} rotation={[0, -0.8, 0]}>
            <mesh position={[0, 0.48, 0]} material={DEPOSIT_MATS.stagFur} castShadow>
              <boxGeometry args={[0.44, 0.36, 0.78]} />
            </mesh>
            {[-0.16, 0.16].map((lx, i) =>
              [-0.28, 0.28].map((lz, j) => (
                <mesh key={`${i}-${j}`} position={[lx, 0.2, lz]} material={DEPOSIT_MATS.stagFur}>
                  <cylinderGeometry args={[0.03, 0.024, 0.46, 5]} />
                </mesh>
              ))
            )}
            <group ref={stagHeadRef} position={[0, 0.65, 0.32]}>
              <mesh position={[0, 0.2, 0.08]} rotation={[-0.45, 0, 0]} material={DEPOSIT_MATS.stagFur}>
                <boxGeometry args={[0.2, 0.44, 0.22]} />
              </mesh>
              <mesh position={[0, 0.4, 0.2]} material={DEPOSIT_MATS.stagFur}>
                <boxGeometry args={[0.18, 0.18, 0.26]} />
              </mesh>
              {[-1, 1].map((side, k) => (
                <group key={k} position={[side * 0.09, 0.52, 0.18]}>
                  <mesh rotation={[0.2, side * 0.2, side * 0.3]} material={DEPOSIT_MATS.deerAntler}>
                    <cylinderGeometry args={[0.02, 0.026, 0.44, 4]} />
                  </mesh>
                  <mesh position={[0, 0.14, 0.08]} rotation={[0.7, 0, 0]} material={DEPOSIT_MATS.deerAntler}>
                    <cylinderGeometry args={[0.012, 0.018, 0.22, 4]} />
                  </mesh>
                </group>
              ))}
            </group>
          </group>

          <group position={[-0.95, 0, 0.35]} rotation={[0, 0.6, 0]}>
            <mesh position={[0, 0.42, 0]} material={DEPOSIT_MATS.doeFur}>
              <boxGeometry args={[0.38, 0.3, 0.66]} />
            </mesh>
            {[-0.14, 0.14].map((lx, i) =>
              [-0.24, 0.24].map((lz, j) => (
                <mesh key={`${i}-${j}`} position={[lx, 0.18, lz]} material={DEPOSIT_MATS.doeFur}>
                  <cylinderGeometry args={[0.026, 0.022, 0.4, 5]} />
                </mesh>
              ))
            )}
            <group ref={doe1HeadRef} position={[0, 0.46, 0.3]}>
              <mesh position={[0, -0.12, 0.18]} rotation={[-0.8, 0, 0]} material={DEPOSIT_MATS.doeFur}>
                <boxGeometry args={[0.16, 0.32, 0.18]} />
              </mesh>
              <mesh position={[0, -0.28, 0.3]} material={DEPOSIT_MATS.doeFur}>
                <boxGeometry args={[0.14, 0.14, 0.2]} />
              </mesh>
            </group>
          </group>

          <group position={[-0.55, 0, -1.05]} rotation={[0, 2.2, 0]}>
            <mesh position={[0, 0.42, 0]} material={DEPOSIT_MATS.doeFur}>
              <boxGeometry args={[0.38, 0.3, 0.66]} />
            </mesh>
            {[-0.14, 0.14].map((lx, i) =>
              [-0.24, 0.24].map((lz, j) => (
                <mesh key={`${i}-${j}`} position={[lx, 0.18, lz]} material={DEPOSIT_MATS.doeFur}>
                  <cylinderGeometry args={[0.026, 0.022, 0.4, 5]} />
                </mesh>
              ))
            )}
            <group ref={doe2HeadRef} position={[0, 0.54, 0.28]}>
              <mesh position={[0, 0.15, 0.05]} rotation={[-0.25, 0, 0]} material={DEPOSIT_MATS.doeFur}>
                <boxGeometry args={[0.16, 0.34, 0.18]} />
              </mesh>
              <mesh position={[0, 0.3, 0.15]} material={DEPOSIT_MATS.doeFur}>
                <boxGeometry args={[0.14, 0.14, 0.2]} />
              </mesh>
            </group>
          </group>

          <group position={[0.25, 0, -1.0]} rotation={[0, -0.4, 0]}>
            <mesh position={[0, 0.26, 0]} material={DEPOSIT_MATS.fawnFur}>
              <boxGeometry args={[0.25, 0.2, 0.42]} />
            </mesh>
            {[-0.09, 0.09].map((lx, i) =>
              [-0.15, 0.15].map((lz, j) => (
                <mesh key={`${i}-${j}`} position={[lx, 0.11, lz]} material={DEPOSIT_MATS.fawnFur}>
                  <cylinderGeometry args={[0.018, 0.015, 0.24, 4]} />
                </mesh>
              ))
            )}
            <mesh position={[0, 0.36, 0.16]} rotation={[-0.3, 0, 0]} material={DEPOSIT_MATS.fawnFur}>
              <boxGeometry args={[0.11, 0.22, 0.14]} />
            </mesh>
          </group>
        </group>
      )}

      {isSelected && (
        <mesh position={[0, 0.05, 0]} rotation={[-Math.PI / 2, 0, 0]}>
          <ringGeometry args={[1.6, 1.9, 32]} />
          <meshBasicMaterial color="#f59e0b" side={THREE.DoubleSide} />
        </mesh>
      )}

      {inView && (
        <Html
          position={[0, badgeY, 0]}
          center
          zIndexRange={[10, 0]}
          style={{
            pointerEvents: 'none',
            userSelect: 'none',
          }}
        >
          <div
            onClick={(e) => {
              e.stopPropagation();
              onSelect();
            }}
            className={`group flex flex-col items-center select-none transition-all duration-200 transform hover:scale-110 active:scale-95 pointer-events-auto cursor-pointer ${
              isSelected ? 'scale-110 -translate-y-1' : 'opacity-95'
            }`}
          >
            <div
              className={`flex items-center gap-1.5 px-2.5 py-1 rounded-full shadow-2xl backdrop-blur-md transition-all ${
                deposit.isRich
                  ? 'bg-gradient-to-r from-amber-950/95 via-stone-950/95 to-amber-950/95 border-2 border-amber-400 shadow-[0_0_15px_rgba(245,158,11,0.45)]'
                  : 'bg-stone-950/90 border border-amber-600/60 shadow-[0_4px_12px_rgba(0,0,0,0.8)]'
              }`}
            >
              {deposit.isRich && (
                <span className="text-amber-400 text-xs font-bold -ml-0.5 animate-pulse" title="Багате родовище">
                  👑
                </span>
              )}

              <span className="text-sm leading-none drop-shadow">{deposit.icon}</span>

              <div className="flex items-baseline gap-0.5 text-xs font-bold tracking-tight">
                <span className={deposit.currentAmount > 0 ? (deposit.isRich ? 'text-amber-300' : 'text-stone-100') : 'text-red-400'}>
                  {deposit.currentAmount}
                </span>
                <span className="text-[10px] text-stone-400 font-normal">/</span>
                <span className="text-[10px] text-stone-400 font-normal">{deposit.maxAmount}</span>
              </div>
            </div>

            <div className="w-10 h-1 bg-stone-900/90 rounded-full mt-0.5 overflow-hidden border border-stone-800/80">
              <div
                className={`h-full transition-all duration-300 ${
                  deposit.isRich ? 'bg-gradient-to-r from-amber-500 to-yellow-300' : 'bg-amber-500'
                }`}
                style={{ width: `${fillPercent}%` }}
              />
            </div>

            {isSelected && (
              <div className="mt-1 px-2 py-0.5 bg-stone-950/95 border border-amber-500/70 rounded text-[10px] font-medium text-amber-200 shadow-xl whitespace-nowrap animate-fadeIn">
                {deposit.name}
              </div>
            )}
          </div>
        </Html>
      )}
    </group>
  );
}
