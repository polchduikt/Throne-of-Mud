import { useRef, useState, memo } from 'react';
import { useFrame } from '@react-three/fiber';
import { Html } from '@react-three/drei';
import * as THREE from 'three';
import { characterEntities } from '../../engine/ecs/world';
import type { GameEntity } from '../../engine/ecs/world';
import { useGameStore } from '../../store/useGameStore';

import { GridMap } from '../../engine/grid/GridMap';
import { audioManager } from '../../engine/audio/AudioManager';

const SHARED_UNIT_MATS = {
  skin: new THREE.MeshStandardMaterial({ color: '#fbcfe8', roughness: 0.8, flatShading: true }),
  peasantTunic: new THREE.MeshStandardMaterial({ color: '#854d0e', roughness: 0.85, flatShading: true }),
  peasantTunicAlt: new THREE.MeshStandardMaterial({ color: '#15803d', roughness: 0.85, flatShading: true }),
  lordTunic: new THREE.MeshStandardMaterial({ color: '#b91c1c', roughness: 0.8, flatShading: true }),
  ladyDress: new THREE.MeshStandardMaterial({ color: '#047857', roughness: 0.8, flatShading: true }),
  knightArmor: new THREE.MeshStandardMaterial({ color: '#64748b', roughness: 0.5, metalness: 0.4, flatShading: true }),
  knightHelm: new THREE.MeshStandardMaterial({ color: '#475569', roughness: 0.4, metalness: 0.5, flatShading: true }),
  crownGold: new THREE.MeshStandardMaterial({ color: '#fbbf24', roughness: 0.3, metalness: 0.5, flatShading: true }),
  rubyGem: new THREE.MeshBasicMaterial({ color: '#ef4444' }),
  hairDark: new THREE.MeshStandardMaterial({ color: '#292524', roughness: 0.9, flatShading: true }),
  hairBlonde: new THREE.MeshStandardMaterial({ color: '#eab308', roughness: 0.9, flatShading: true }),
  ironSteel: new THREE.MeshStandardMaterial({ color: '#94a3b8', roughness: 0.3, metalness: 0.6, flatShading: true }),
  woodHandle: new THREE.MeshStandardMaterial({ color: '#54361e', roughness: 0.9, flatShading: true }),
  goldTrim: new THREE.MeshStandardMaterial({ color: '#fbbf24', roughness: 0.4, metalness: 0.4, flatShading: true }),
  shieldBlue: new THREE.MeshStandardMaterial({ color: '#1d4ed8', roughness: 0.7, flatShading: true }),
  trousersDark: new THREE.MeshStandardMaterial({ color: '#3f3f46', roughness: 0.9, flatShading: true }),
  bootsLeather: new THREE.MeshStandardMaterial({ color: '#271b12', roughness: 0.9, flatShading: true }),
};

export function UnitsRenderer({ grid }: { grid?: GridMap }) {
  const selectedEntityId = useGameStore((state) => state.selectedEntityId);
  const setSelectedEntityId = useGameStore((state) => state.setSelectedEntityId);
  const previewAnimation = useGameStore((state) => state.previewAnimation);

  const isStrategicView = useGameStore((state) => state.isStrategicView);
  const [unitCount, setUnitCount] = useState(() => characterEntities.size);

  useFrame(() => {
    if (characterEntities.size !== unitCount) {
      setUnitCount(characterEntities.size);
    }
  });

  if (isStrategicView) return null;

  return (
    <group>
      {Array.from(characterEntities).map((unit) => (
        <Unit3DMemo
          key={unit.id}
          unit={unit}
          grid={grid}
          isSelected={selectedEntityId === unit.id}
          previewAnimation={previewAnimation?.entityId === unit.id ? previewAnimation : null}
          onSelect={() => setSelectedEntityId(unit.id)}
        />
      ))}
    </group>
  );
}

function Unit3D({
  unit,
  grid,
  isSelected,
  previewAnimation,
  onSelect,
}: {
  unit: GameEntity;
  grid?: GridMap;
  unitClass?: string;
  isSelected: boolean;
  previewAnimation: { anim: 'idle' | 'walk' | 'attack' | 'chop'; expiresAt: number } | null;
  onSelect: () => void;
}) {
  const groupRef = useRef<THREE.Group>(null);
  const characterBodyRef = useRef<THREE.Group>(null);
  const leftLegRef = useRef<THREE.Mesh>(null);
  const rightLegRef = useRef<THREE.Mesh>(null);
  const rightArmRef = useRef<THREE.Group>(null);
  const leftArmRef = useRef<THREE.Group>(null);
  const twoHandedRigRef = useRef<THREE.Group>(null);
  const standardArmsRef = useRef<THREE.Group>(null);
  const hammerRef = useRef<THREE.Group>(null);
  const pickaxeRef = useRef<THREE.Group>(null);
  const swordRef = useRef<THREE.Group>(null);
  const scepterRef = useRef<THREE.Group>(null);

  const [speechText, setSpeechText] = useState<string | undefined>(unit.speechBubble?.text);

  const prevPos = useRef<[number, number]>([unit.position?.[0] || 0, unit.position?.[2] || 0]);
  const facingAngle = useRef<number>((unit.id.charCodeAt(unit.id.length - 1) * 1.2) % (Math.PI * 2));

  const characterClass = unit.characterClass || 'peasant';
  const mats = SHARED_UNIT_MATS;

  const isLord = characterClass === 'lord' || characterClass === 'king';
  const isLady = characterClass === 'lady';
  const isKnight = characterClass === 'warrior';
  const isPeasant = !isLord && !isLady && !isKnight;

  const prevPhaseRef = useRef<number>(0);
  const prevFootstepRef = useRef<number>(0);

  useFrame(({ clock }, delta) => {
    if (!groupRef.current || !unit.position) return;

    const [ux, uy, uz] = unit.position;
    groupRef.current.position.set(ux, uy || 0, uz);

    if (unit.speechBubble?.text !== speechText) {
      setSpeechText(unit.speechBubble?.text);
      if (unit.speechBubble?.text) {
        audioManager.playPeasantVocal(ux, uz, (unit.speechBubble.type as any) || 'greet');
      }
    }

    const curPath = unit.path;
    const isMovingNow = Boolean(curPath && curPath.length > 0);
    const curJob = unit.currentJob;
    const curJobType = curJob?.type;

    const isActivelyWorkingNow = !isMovingNow && Boolean(curJobType && curJobType !== 'idle' && curJobType !== 'wander');
    const isActivelyChoppingStandingNow = isActivelyWorkingNow && curJobType === 'chop_tree';
    const isActivelyChoppingFallenNow = isActivelyWorkingNow && curJobType === 'chop_fallen_log';
    const isPreviewChoppingNow = previewAnimation?.anim === 'chop' && (previewAnimation.expiresAt > Date.now());
    const isActivelyChoppingNow = isActivelyChoppingStandingNow || isActivelyChoppingFallenNow || isPreviewChoppingNow;
    const isActivelyBuildingNow = isActivelyWorkingNow && curJobType === 'build_structure';
    const isActivelyMiningNow = isActivelyWorkingNow && curJobType === 'mine_rock';
    const isActivelyFightingNow = !isMovingNow && curJobType === 'fight';
    const isSleepingNow = !isMovingNow && curJobType === 'sleep';

    if (twoHandedRigRef.current) twoHandedRigRef.current.visible = isActivelyChoppingNow;
    if (standardArmsRef.current) standardArmsRef.current.visible = !isActivelyChoppingNow;
    if (hammerRef.current) hammerRef.current.visible = isActivelyBuildingNow;
    if (pickaxeRef.current) pickaxeRef.current.visible = isActivelyMiningNow;
    if (swordRef.current) swordRef.current.visible = isActivelyFightingNow;
    if (scepterRef.current) scepterRef.current.visible = isLord && !isMovingNow && !isSleepingNow;

    let targetAngle = facingAngle.current;

    if (isActivelyWorkingNow && curJob?.targetPosition) {
      const [tx, tz] = curJob.targetPosition;
      let targetX = tx + 0.5;
      let targetZ = tz + 0.5;

      if (curJobType === 'chop_fallen_log' && grid) {
        const tile = grid.getTile(tx, tz);
        if (tile?.foliageAngle !== undefined) {
          targetX = tx + 0.5 + Math.sin(tile.foliageAngle) * 0.6;
          targetZ = tz + 0.5 + Math.cos(tile.foliageAngle) * 0.6;
        }
      }

      const tdx = targetX - ux;
      const tdz = targetZ - uz;
      if (Math.hypot(tdx, tdz) > 0.05) {
        targetAngle = Math.atan2(tdx, tdz);
      }
    } else if (isMovingNow && curPath && curPath.length > 0) {
      const nextWp = curPath[0];
      const wdx = nextWp[0] + 0.5 - ux;
      const wdz = nextWp[1] + 0.5 - uz;
      if (Math.hypot(wdx, wdz) > 0.05) {
        targetAngle = Math.atan2(wdx, wdz);
      }
    } else {
      const dx = ux - prevPos.current[0];
      const dz = uz - prevPos.current[1];
      if (Math.hypot(dx, dz) > 0.002) {
        targetAngle = Math.atan2(dx, dz);
      }
    }

    let diff = targetAngle - facingAngle.current;
    while (diff < -Math.PI) diff += Math.PI * 2;
    while (diff > Math.PI) diff -= Math.PI * 2;
    const turnRate = isMovingNow ? 6.5 : 9.0;
    facingAngle.current += diff * Math.min(1.0, turnRate * (delta || 0.016));

    if (characterBodyRef.current && !isSleepingNow) {
      characterBodyRef.current.rotation.y = facingAngle.current;
    }
    prevPos.current = [ux, uz];

    let action: 'idle' | 'walk' | 'attack' | 'chop_standing' | 'chop_fallen' | 'build' | 'sleep' = 'idle';

    if (previewAnimation && previewAnimation.expiresAt > Date.now()) {
      action = previewAnimation.anim === 'chop' ? 'chop_standing' : (previewAnimation.anim as any);
    } else if (isMovingNow) {
      action = 'walk';
    } else if (isSleepingNow) {
      action = 'sleep';
    } else if (isActivelyFightingNow) {
      action = 'attack';
    } else if (isActivelyChoppingStandingNow) {
      action = 'chop_standing';
    } else if (isActivelyChoppingFallenNow) {
      action = 'chop_fallen';
    } else if (isActivelyBuildingNow || isActivelyMiningNow || curJobType === 'plant_crops' || curJobType === 'harvest_wheat') {
      action = 'build';
    } else {
      action = 'idle';
    }

    const t = clock.getElapsedTime();
    const phase = (t * 4.8) % (Math.PI * 2);

    if (action === 'chop_standing' || action === 'chop_fallen') {
      const strikeImpactPhase = 4.4;
      if (prevPhaseRef.current < strikeImpactPhase && phase >= strikeImpactPhase) {
        if (curJob?.targetPosition) {
          const [tx, tz] = curJob.targetPosition;
          useGameStore.getState().registerTreeHit(tx + 0.5, tz + 0.5, action === 'chop_standing' ? 1.0 : 1.3);
        }
      }
    }
    prevPhaseRef.current = phase;

    if (action === 'walk') {
      const walkCycle = Math.sin(t * 8);

      if (prevFootstepRef.current < 0 && walkCycle >= 0) {
        audioManager.playPeasantFootstep(ux, uz);
      } else if (prevFootstepRef.current > 0 && walkCycle <= 0) {
        audioManager.playPeasantFootstep(ux, uz);
      }
      prevFootstepRef.current = walkCycle;

      if (leftLegRef.current) leftLegRef.current.rotation.set(walkCycle * 0.45, 0, 0);
      if (rightLegRef.current) rightLegRef.current.rotation.set(-walkCycle * 0.45, 0, 0);
      if (leftArmRef.current) leftArmRef.current.rotation.set(-walkCycle * 0.4, 0, 0);
      if (rightArmRef.current) rightArmRef.current.rotation.set(walkCycle * 0.4, 0, 0);
      if (characterBodyRef.current) {
        characterBodyRef.current.rotation.set(0, facingAngle.current, -diff * 0.12);
        characterBodyRef.current.position.y = Math.abs(Math.sin(t * 8)) * 0.03;
      }
    } else if (action === 'chop_standing') {
      let rigRotX = 0;
      let rigRotY = 0;
      let rigRotZ = 0;

      let bRotX = 0;
      let bRotY = 0;
      let bRotZ = 0;
      let bPosY = 0;

      if (phase < 3.2) {
        const p = phase / 3.2;
        const ease = Math.sin(p * Math.PI * 0.5);

        bRotY = 0.45 * ease;
        bRotX = -0.10 * ease;
        bRotZ = -0.08 * ease;
        bPosY = 0.02 * ease;

        rigRotX = -0.65 * ease;
        rigRotY = -0.35 * ease;
        rigRotZ = 0.35 * ease;
      } else if (phase < 4.4) {
        const p = (phase - 3.2) / 1.2;
        const ease = Math.pow(p, 2.2);

        bRotY = 0.45 - 0.90 * ease;
        bRotX = -0.10 + 0.35 * ease;
        bRotZ = -0.08 + 0.30 * ease;
        bPosY = 0.02 - 0.06 * ease;

        rigRotX = -0.65 + 1.25 * ease;
        rigRotY = -0.35 + 0.70 * ease;
        rigRotZ = 0.35 - 0.60 * ease;
      } else {
        const p = (phase - 4.4) / (Math.PI * 2 - 4.4);

        bRotY = -0.45 + 0.45 * p;
        bRotX = 0.25 - 0.25 * p;
        bRotZ = 0.22 - 0.22 * p;
        bPosY = -0.04 + 0.04 * p;

        rigRotX = 0.60 - 0.60 * p;
        rigRotY = 0.35 - 0.35 * p;
        rigRotZ = -0.25 + 0.25 * p;
      }

      if (twoHandedRigRef.current) twoHandedRigRef.current.rotation.set(rigRotX, rigRotY, rigRotZ);
      if (leftLegRef.current) leftLegRef.current.rotation.set(-0.12, 0.15, 0);
      if (rightLegRef.current) rightLegRef.current.rotation.set(0.10, -0.1, 0);
      if (characterBodyRef.current) {
        characterBodyRef.current.rotation.set(bRotX, facingAngle.current + bRotY, bRotZ);
        characterBodyRef.current.position.y = bPosY;
      }
    } else if (action === 'chop_fallen') {
      let rigRotX = 0;
      let bRotX = 0.15;
      let bPosY = -0.02;

      if (phase < 3.2) {
        const p = phase / 3.2;
        const ease = Math.sin(p * Math.PI * 0.5);
        rigRotX = -0.65 * ease;
        bRotX = 0.15 - 0.10 * ease;
        bPosY = -0.02 + 0.02 * ease;
      } else if (phase < 4.4) {
        const p = (phase - 3.2) / 1.2;
        const ease = Math.pow(p, 2.2);
        rigRotX = -0.65 + 1.45 * ease;
        bRotX = 0.05 + 0.38 * ease;
        bPosY = 0.00 - 0.05 * ease;
      } else {
        const p = (phase - 4.4) / (Math.PI * 2 - 4.4);
        rigRotX = 0.80 - 0.80 * p;
        bRotX = 0.43 - 0.28 * p;
        bPosY = -0.05 + 0.03 * p;
      }

      if (twoHandedRigRef.current) twoHandedRigRef.current.rotation.set(rigRotX, 0, 0);
      if (leftLegRef.current) leftLegRef.current.rotation.set(0.12, 0.1, 0);
      if (rightLegRef.current) rightLegRef.current.rotation.set(-0.12, -0.1, 0);
      if (characterBodyRef.current) {
        characterBodyRef.current.rotation.set(bRotX, facingAngle.current, 0);
        characterBodyRef.current.position.y = bPosY;
      }
    } else if (action === 'build') {
      const buildCycle = Math.sin(t * 10);
      if (rightArmRef.current) rightArmRef.current.rotation.set(-0.4 + buildCycle * 0.7, 0, 0);
      if (leftArmRef.current) leftArmRef.current.rotation.set(0.2, 0, 0);
      if (leftLegRef.current) leftLegRef.current.rotation.set(0, 0, 0);
      if (rightLegRef.current) rightLegRef.current.rotation.set(0, 0, 0);
      if (characterBodyRef.current) {
        characterBodyRef.current.rotation.set(0, facingAngle.current, 0);
        characterBodyRef.current.position.y = (buildCycle > 0 ? 0 : -0.02);
      }
    } else if (action === 'attack') {
      const attackCycle = Math.sin(t * 14);
      if (rightArmRef.current) rightArmRef.current.rotation.set(-0.8 + attackCycle * 0.9, 0, 0);
      if (leftArmRef.current) leftArmRef.current.rotation.set(0.2, 0, 0);
      if (leftLegRef.current) leftLegRef.current.rotation.set(0, 0, 0);
      if (rightLegRef.current) rightLegRef.current.rotation.set(0, 0, 0);
      if (characterBodyRef.current) {
        characterBodyRef.current.rotation.set(0, facingAngle.current, 0);
        characterBodyRef.current.position.y = 0;
      }
    } else if (action === 'sleep') {
      const bedAngle = curJob?.targetAngle !== undefined ? curJob.targetAngle : 0;
      facingAngle.current = bedAngle;

      const breathe = Math.sin(t * 2.5) * 0.008;
      if (characterBodyRef.current) {
        characterBodyRef.current.rotation.set(-Math.PI / 2, bedAngle, 0);
        characterBodyRef.current.position.set(0, 0.18 + breathe, 0);
      }
      if (leftLegRef.current) leftLegRef.current.rotation.set(0, 0, 0);
      if (rightLegRef.current) rightLegRef.current.rotation.set(0, 0, 0);
      if (leftArmRef.current) leftArmRef.current.rotation.set(-0.15, 0, -0.15);
      if (rightArmRef.current) rightArmRef.current.rotation.set(-0.15, 0, 0.15);
    } else {
      const breathe = Math.sin(t * 3) * 0.015;
      if (characterBodyRef.current) {
        characterBodyRef.current.rotation.set(0, facingAngle.current, 0);
        characterBodyRef.current.position.y = breathe;
      }
      if (leftLegRef.current) leftLegRef.current.rotation.set(0, 0, 0);
      if (rightLegRef.current) rightLegRef.current.rotation.set(0, 0, 0);
      if (leftArmRef.current) leftArmRef.current.rotation.set(0, 0, 0);
      if (rightArmRef.current) rightArmRef.current.rotation.set(0, 0, 0);
    }
  });

  return (
    <group
      ref={groupRef}
      onClick={(e) => {
        e.stopPropagation();
        onSelect();
      }}
    >
      <mesh position={[0, 0.015, 0]} rotation={[-Math.PI / 2, 0, 0]}>
        <circleGeometry args={[0.26, 16]} />
        <meshBasicMaterial color="#0f172a" transparent opacity={0.35} />
      </mesh>

      <group ref={characterBodyRef} scale={[0.8, 0.8, 0.8]}>
        <mesh ref={leftLegRef} material={mats.trousersDark} position={[-0.1, 0.16, 0]} castShadow>
          <boxGeometry args={[0.11, 0.32, 0.12]} />
        </mesh>
        <mesh ref={rightLegRef} material={mats.trousersDark} position={[0.1, 0.16, 0]} castShadow>
          <boxGeometry args={[0.11, 0.32, 0.12]} />
        </mesh>

        <mesh
          material={
            isLord
              ? mats.lordTunic
              : isLady
              ? mats.ladyDress
              : isKnight
              ? mats.knightArmor
              : mats.peasantTunic
          }
          position={[0, 0.44, 0]}
          castShadow
          receiveShadow
        >
          <boxGeometry args={[0.34, 0.35, 0.22]} />
        </mesh>

        <mesh material={mats.skin} position={[0, 0.72, 0]} castShadow receiveShadow>
          <boxGeometry args={[0.22, 0.22, 0.22]} />
        </mesh>
        <mesh material={mats.hairDark} position={[-0.055, 0.73, 0.115]}>
          <boxGeometry args={[0.035, 0.035, 0.01]} />
        </mesh>
        <mesh material={mats.hairDark} position={[0.055, 0.73, 0.115]}>
          <boxGeometry args={[0.035, 0.035, 0.01]} />
        </mesh>

        {isLord && (
          <group position={[0, 0.86, 0]}>
            <mesh material={mats.crownGold} castShadow>
              <cylinderGeometry args={[0.13, 0.13, 0.08, 6]} />
            </mesh>
            <mesh material={mats.rubyGem} position={[0, 0.05, 0.13]}>
              <dodecahedronGeometry args={[0.03, 0]} />
            </mesh>
          </group>
        )}

        {isLady && (
          <mesh material={mats.ladyDress} position={[0, 0.84, -0.05]} castShadow>
            <boxGeometry args={[0.24, 0.14, 0.2]} />
          </mesh>
        )}

        {isKnight && (
          <group position={[0, 0.75, 0]}>
            <mesh material={mats.knightHelm} castShadow>
              <boxGeometry args={[0.26, 0.26, 0.26]} />
            </mesh>
            <mesh material={mats.ironSteel} position={[0, -0.02, 0.135]}>
              <boxGeometry args={[0.18, 0.06, 0.03]} />
            </mesh>
          </group>
        )}

        {isPeasant && (
          <mesh material={mats.hairDark} position={[0, 0.82, -0.02]} castShadow>
            <boxGeometry args={[0.24, 0.1, 0.24]} />
          </mesh>
        )}

        <group ref={twoHandedRigRef} position={[0, 0.46, 0]} visible={false}>
          <group position={[0.02, -0.04, 0.20]} rotation={[-0.28, 0, 0.12]}>
            <mesh material={mats.woodHandle} castShadow>
              <cylinderGeometry args={[0.018, 0.022, 0.58, 6]} />
            </mesh>
            <mesh material={mats.bootsLeather} position={[0, 0.06, 0]}>
              <cylinderGeometry args={[0.024, 0.024, 0.10, 6]} />
            </mesh>
            <mesh material={mats.bootsLeather} position={[0, -0.12, 0]}>
              <cylinderGeometry args={[0.024, 0.024, 0.10, 6]} />
            </mesh>
            <group position={[0, 0.24, 0.04]}>
              <mesh material={mats.ironSteel} castShadow>
                <boxGeometry args={[0.036, 0.10, 0.11]} />
              </mesh>
              <mesh material={mats.ironSteel} position={[0, 0, 0.06]}>
                <boxGeometry args={[0.012, 0.11, 0.02]} />
              </mesh>
            </group>
          </group>

          <group position={[0.17, 0.08, 0]} rotation={[-0.55, -0.22, 0.35]}>
            <mesh
              material={isKnight ? mats.knightArmor : isLord ? mats.lordTunic : mats.peasantTunic}
              position={[0, -0.10, 0]}
              castShadow
            >
              <boxGeometry args={[0.085, 0.22, 0.085]} />
            </mesh>
            <mesh material={mats.skin} position={[-0.01, -0.21, 0.02]}>
              <boxGeometry args={[0.08, 0.075, 0.08]} />
            </mesh>
          </group>

          <group position={[-0.17, 0.08, 0]} rotation={[-0.72, 0.38, -0.35]}>
            <mesh
              material={isKnight ? mats.knightArmor : isLord ? mats.lordTunic : mats.peasantTunic}
              position={[0, -0.10, 0]}
              castShadow
            >
              <boxGeometry args={[0.085, 0.22, 0.085]} />
            </mesh>
            <mesh material={mats.skin} position={[0.02, -0.21, 0.02]}>
              <boxGeometry args={[0.08, 0.075, 0.08]} />
            </mesh>
          </group>
        </group>

        <group ref={standardArmsRef}>
          <group ref={leftArmRef} position={[-0.22, 0.52, 0]}>
            <mesh
              material={isKnight ? mats.knightArmor : mats.skin}
              position={[0, -0.14, 0]}
              castShadow
            >
              <boxGeometry args={[0.09, 0.28, 0.09]} />
            </mesh>
            {isKnight && (
              <mesh material={mats.shieldBlue} position={[-0.08, -0.12, 0.08]} rotation={[0, 0.3, 0]} castShadow>
                <boxGeometry args={[0.04, 0.38, 0.26]} />
              </mesh>
            )}
          </group>

          <group ref={rightArmRef} position={[0.22, 0.52, 0]}>
            <mesh
              material={isKnight ? mats.knightArmor : mats.skin}
              position={[0, -0.14, 0]}
              castShadow
            >
              <boxGeometry args={[0.09, 0.28, 0.09]} />
            </mesh>

            <group ref={hammerRef} position={[0, -0.2, 0.12]} rotation={[-Math.PI / 5, 0, 0]} visible={false}>
              <mesh material={mats.woodHandle} castShadow>
                <cylinderGeometry args={[0.02, 0.025, 0.35, 4]} />
              </mesh>
              <mesh material={mats.ironSteel} position={[0, 0.14, 0]} castShadow>
                <boxGeometry args={[0.1, 0.07, 0.06]} />
              </mesh>
            </group>

            <group ref={pickaxeRef} position={[0, -0.22, 0.12]} rotation={[-Math.PI / 5, 0, 0]} visible={false}>
              <mesh material={mats.woodHandle} castShadow>
                <cylinderGeometry args={[0.02, 0.025, 0.42, 4]} />
              </mesh>
              <mesh material={mats.ironSteel} position={[0, 0.15, 0]} castShadow>
                <boxGeometry args={[0.18, 0.04, 0.04]} />
              </mesh>
            </group>

            <group ref={swordRef} position={[0, -0.22, 0.15]} rotation={[-Math.PI / 4, 0, 0]} visible={false}>
              <mesh material={mats.ironSteel} castShadow>
                <boxGeometry args={[0.04, 0.45, 0.02]} />
              </mesh>
              <mesh material={mats.goldTrim} position={[0, -0.18, 0]}>
                <boxGeometry args={[0.12, 0.03, 0.04]} />
              </mesh>
            </group>

            {isLord && (
              <group ref={scepterRef} position={[0, -0.2, 0.1]} rotation={[-0.3, 0, 0]} visible={false}>
                <mesh material={mats.goldTrim} castShadow>
                  <cylinderGeometry args={[0.02, 0.02, 0.35, 4]} />
                </mesh>
                <mesh material={mats.rubyGem} position={[0, 0.18, 0]}>
                  <dodecahedronGeometry args={[0.05, 0]} />
                </mesh>
              </group>
            )}
          </group>
        </group>
      </group>

      {isSelected && (
        <mesh position={[0, 0.008, 0]} rotation={[-Math.PI / 2, 0, 0]}>
          <ringGeometry args={[0.42, 0.5, 24]} />
          <meshBasicMaterial color="#38bdf8" side={THREE.DoubleSide} />
        </mesh>
      )}

      {speechText && (
        <Html position={[0, 1.2, 0]} center zIndexRange={[10, 0]} style={{ pointerEvents: 'none', userSelect: 'none' }}>
          <div className="bg-slate-950/95 text-slate-100 text-[11px] px-2.5 py-1 rounded-full border border-amber-500/80 shadow-2xl font-medium flex items-center gap-1 whitespace-nowrap animate-bounce pointer-events-none">
            <span>{speechText}</span>
          </div>
        </Html>
      )}
    </group>
  );
}

const Unit3DMemo = memo(Unit3D);

