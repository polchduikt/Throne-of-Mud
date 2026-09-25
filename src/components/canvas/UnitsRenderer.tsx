import { useRef, useState, memo, useMemo } from 'react';
import { useFrame } from '@react-three/fiber';
import { Html } from '@react-three/drei';
import * as THREE from 'three';
import { characterEntities } from '../../engine/ecs/world';
import type { GameEntity } from '../../engine/ecs/world';
import { useGameStore } from '../../store/useGameStore';
import { GridMap } from '../../engine/grid/GridMap';
import { audioManager } from '../../engine/audio/AudioManager';
import { getUnitAppearance } from './units/unitMaterials';

const SHARED_STATIC_MATS = {
  ironSteel: new THREE.MeshStandardMaterial({ color: '#94a3b8', roughness: 0.3, metalness: 0.6, flatShading: true }),
  woodHandle: new THREE.MeshStandardMaterial({ color: '#c48e58', roughness: 0.85, flatShading: true }),
  goldTrim: new THREE.MeshStandardMaterial({ color: '#fbbf24', roughness: 0.35, metalness: 0.4, flatShading: true }),
  crownGold: new THREE.MeshStandardMaterial({ color: '#fbbf24', roughness: 0.3, metalness: 0.5, flatShading: true }),
  rubyGem: new THREE.MeshBasicMaterial({ color: '#ef4444' }),
  knightHelm: new THREE.MeshStandardMaterial({ color: '#475569', roughness: 0.4, metalness: 0.5, flatShading: true }),
  beltBuckle: new THREE.MeshStandardMaterial({ color: '#f59e0b', roughness: 0.4, metalness: 0.4, flatShading: true }),
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
  const torsoRef = useRef<THREE.Group>(null);
  const leftLegRef = useRef<THREE.Group>(null);
  const rightLegRef = useRef<THREE.Group>(null);
  const rightArmRef = useRef<THREE.Group>(null);
  const leftArmRef = useRef<THREE.Group>(null);
  const twoHandedRigRef = useRef<THREE.Group>(null);
  const standardArmsRef = useRef<THREE.Group>(null);
  const hammerRef = useRef<THREE.Group>(null);
  const pickaxeRef = useRef<THREE.Group>(null);
  const swordRef = useRef<THREE.Group>(null);
  const scepterRef = useRef<THREE.Group>(null);
  const shadowDiscRef = useRef<THREE.Mesh>(null);

  const [speechText, setSpeechText] = useState<string | undefined>(unit.speechBubble?.text);

  const prevPos = useRef<[number, number]>([unit.position?.[0] || 0, unit.position?.[2] || 0]);
  const facingAngle = useRef<number>((unit.id.charCodeAt(unit.id.length - 1) * 1.2) % (Math.PI * 2));

  const characterClass = unit.characterClass || 'peasant';
  const isLord = characterClass === 'lord' || characterClass === 'king';
  const isLady = characterClass === 'lady';
  const isKnight = characterClass === 'warrior';
  const isPeasant = !isLord && !isLady && !isKnight;

  const app = useMemo(() => getUnitAppearance(unit.id, characterClass), [unit.id, characterClass]);
  const staticMats = SHARED_STATIC_MATS;
  const isGamePaused = useGameStore((state) => state.time.isPaused || state.time.speedMultiplier === 0);

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
    const isMovingNow = !isGamePaused && Boolean(curPath && curPath.length > 0);
    const curJob = unit.currentJob;
    const curJobType = curJob?.type;

    const isActivelyWorkingNow = !isGamePaused && !isMovingNow && Boolean(curJobType && curJobType !== 'idle' && curJobType !== 'wander');
    const isActivelyChoppingStandingNow = isActivelyWorkingNow && curJobType === 'chop_tree';
    const isActivelyChoppingFallenNow = isActivelyWorkingNow && curJobType === 'chop_fallen_log';
    const isPreviewChoppingNow = !isGamePaused && previewAnimation?.anim === 'chop' && (previewAnimation.expiresAt > Date.now());
    const isActivelyChoppingNow = isActivelyChoppingStandingNow || isActivelyChoppingFallenNow || isPreviewChoppingNow;
    const isActivelyBuildingNow = isActivelyWorkingNow && (curJobType === 'build_structure' || curJobType === 'demolish_structure');
    const isActivelyMiningNow = isActivelyWorkingNow && curJobType === 'mine_rock';
    const isActivelyFightingNow = !isGamePaused && !isMovingNow && curJobType === 'fight';
    const isSleepingNow = !isMovingNow && curJobType === 'sleep';
    const isSittingNow = !isMovingNow && curJobType === 'sit_by_fire';

    if (twoHandedRigRef.current) twoHandedRigRef.current.visible = isActivelyChoppingNow;
    if (standardArmsRef.current) standardArmsRef.current.visible = !isActivelyChoppingNow;
    if (hammerRef.current) hammerRef.current.visible = isActivelyBuildingNow;
    if (pickaxeRef.current) pickaxeRef.current.visible = isActivelyMiningNow;
    if (swordRef.current) swordRef.current.visible = isActivelyFightingNow;
    if (scepterRef.current) scepterRef.current.visible = isLord && !isMovingNow && !isSleepingNow && !isSittingNow;
    if (shadowDiscRef.current) shadowDiscRef.current.visible = !isSleepingNow;

    if (isGamePaused) {
      if (isSleepingNow) {
        const bedAngle = curJob?.targetAngle !== undefined ? curJob.targetAngle : 0;
        const headShift = 0.14;
        const offX = Math.sin(bedAngle) * headShift;
        const offZ = Math.cos(bedAngle) * headShift;
        if (characterBodyRef.current) {
          characterBodyRef.current.rotation.order = 'YXZ';
          characterBodyRef.current.rotation.set(-Math.PI / 2, bedAngle, 0);
          characterBodyRef.current.position.set(offX, 0.11, offZ);
        }
        if (torsoRef.current) {
          torsoRef.current.position.set(0, 0, 0);
          torsoRef.current.rotation.set(0, 0, 0);
          torsoRef.current.scale.set(1, 1, 1);
        }
        if (leftLegRef.current) leftLegRef.current.rotation.set(0, 0, 0);
        if (rightLegRef.current) rightLegRef.current.rotation.set(0, 0, 0);
        if (leftArmRef.current) leftArmRef.current.rotation.set(-0.15, 0, -0.15);
        if (rightArmRef.current) rightArmRef.current.rotation.set(-0.15, 0, 0.15);
      } else if (isSittingNow) {
        const sitAngle = curJob?.targetAngle !== undefined ? curJob.targetAngle : facingAngle.current;
        if (characterBodyRef.current) {
          characterBodyRef.current.rotation.order = 'XYZ';
          characterBodyRef.current.rotation.set(0, sitAngle, 0);
          characterBodyRef.current.position.set(0, -0.07, 0);
        }
        if (torsoRef.current) {
          torsoRef.current.position.set(0, 0, 0);
          torsoRef.current.rotation.set(0.12, 0, 0);
          torsoRef.current.scale.set(1, 1, 1);
        }
        if (leftLegRef.current) leftLegRef.current.rotation.set(-1.25, 0.12, 0);
        if (rightLegRef.current) rightLegRef.current.rotation.set(-1.25, -0.12, 0);
        if (leftArmRef.current) leftArmRef.current.rotation.set(-0.85, 0.25, -0.1);
        if (rightArmRef.current) rightArmRef.current.rotation.set(-0.85, -0.25, 0.1);
      } else {
        if (characterBodyRef.current) {
          characterBodyRef.current.position.y = 0;
          characterBodyRef.current.rotation.set(0, facingAngle.current, 0);
        }
        if (torsoRef.current) {
          torsoRef.current.position.set(0, 0, 0);
          torsoRef.current.rotation.set(0, 0, 0);
          torsoRef.current.scale.set(1, 1, 1);
        }
        if (leftLegRef.current) leftLegRef.current.rotation.set(0, 0, 0);
        if (rightLegRef.current) rightLegRef.current.rotation.set(0, 0, 0);
        if (leftArmRef.current) leftArmRef.current.rotation.set(0, 0, 0);
        if (rightArmRef.current) rightArmRef.current.rotation.set(0, 0, 0);
      }
      return;
    }

    let targetAngle = facingAngle.current;

    const isTileTargetedJob =
      curJobType === 'chop_tree' ||
      curJobType === 'chop_fallen_log' ||
      curJobType === 'mine_rock' ||
      curJobType === 'build_structure' ||
      curJobType === 'demolish_structure' ||
      curJobType === 'plant_crops' ||
      curJobType === 'harvest_wheat';

    if (isActivelyWorkingNow && isTileTargetedJob && curJob?.targetPosition) {
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
    } else if (curJob?.targetAngle !== undefined) {
      targetAngle = curJob.targetAngle;
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

    let action: 'idle' | 'walk' | 'attack' | 'chop_standing' | 'chop_fallen' | 'build' | 'sleep' | 'sit' = 'idle';

    if (previewAnimation && previewAnimation.expiresAt > Date.now()) {
      action = previewAnimation.anim === 'chop' ? 'chop_standing' : (previewAnimation.anim as any);
    } else if (isMovingNow) {
      action = 'walk';
    } else if (isSleepingNow) {
      action = 'sleep';
    } else if (isSittingNow) {
      action = 'sit';
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
      if (torsoRef.current) {
        torsoRef.current.position.set(0, 0, 0);
        torsoRef.current.rotation.set(0, 0, 0);
        torsoRef.current.scale.set(1, 1, 1);
      }
      if (characterBodyRef.current) {
        characterBodyRef.current.rotation.order = 'XYZ';
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

      if (torsoRef.current) {
        torsoRef.current.position.set(0, 0, 0);
        torsoRef.current.scale.set(1, 1, 1);
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

      if (torsoRef.current) {
        torsoRef.current.position.set(0, 0, 0);
        torsoRef.current.scale.set(1, 1, 1);
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
      if (torsoRef.current) {
        torsoRef.current.position.set(0, 0, 0);
        torsoRef.current.rotation.set(0, 0, 0);
        torsoRef.current.scale.set(1, 1, 1);
      }
      if (rightArmRef.current) rightArmRef.current.rotation.set(-0.4 + buildCycle * 0.7, 0, 0);
      if (leftArmRef.current) leftArmRef.current.rotation.set(0.2, 0, 0);
      if (leftLegRef.current) leftLegRef.current.rotation.set(0, 0, 0);
      if (rightLegRef.current) rightLegRef.current.rotation.set(0, 0, 0);
      if (characterBodyRef.current) {
        characterBodyRef.current.rotation.order = 'XYZ';
        characterBodyRef.current.rotation.set(0, facingAngle.current, 0);
        characterBodyRef.current.position.y = (buildCycle > 0 ? 0 : -0.02);
      }
    } else if (action === 'attack') {
      const attackCycle = Math.sin(t * 14);
      if (torsoRef.current) {
        torsoRef.current.position.set(0, 0, 0);
        torsoRef.current.rotation.set(0, 0, 0);
        torsoRef.current.scale.set(1, 1, 1);
      }
      if (rightArmRef.current) rightArmRef.current.rotation.set(-0.8 + attackCycle * 0.9, 0, 0);
      if (leftArmRef.current) leftArmRef.current.rotation.set(0.2, 0, 0);
      if (leftLegRef.current) leftLegRef.current.rotation.set(0, 0, 0);
      if (rightLegRef.current) rightLegRef.current.rotation.set(0, 0, 0);
      if (characterBodyRef.current) {
        characterBodyRef.current.rotation.order = 'XYZ';
        characterBodyRef.current.rotation.set(0, facingAngle.current, 0);
        characterBodyRef.current.position.y = 0;
      }
    } else if (action === 'sleep') {
      const bedAngle = curJob?.targetAngle !== undefined ? curJob.targetAngle : 0;
      facingAngle.current = bedAngle;

      const breathe = Math.sin(t * 2.2) * 0.005;
      const headShift = 0.14;
      const offX = Math.sin(bedAngle) * headShift;
      const offZ = Math.cos(bedAngle) * headShift;
      if (characterBodyRef.current) {
        characterBodyRef.current.rotation.order = 'YXZ';
        characterBodyRef.current.rotation.set(-Math.PI / 2, bedAngle, 0);
        characterBodyRef.current.position.set(offX, 0.11, offZ);
      }
      if (torsoRef.current) {
        torsoRef.current.position.set(0, 0, breathe);
        torsoRef.current.rotation.set(0, 0, 0);
        torsoRef.current.scale.set(1, 1, 1 + breathe * 0.8);
      }
      if (leftLegRef.current) leftLegRef.current.rotation.set(0, 0, 0);
      if (rightLegRef.current) rightLegRef.current.rotation.set(0, 0, 0);
      if (leftArmRef.current) leftArmRef.current.rotation.set(-0.15, 0, -0.15);
      if (rightArmRef.current) rightArmRef.current.rotation.set(-0.15, 0, 0.15);
    } else if (action === 'sit') {
      const sitAngle = curJob?.targetAngle !== undefined ? curJob.targetAngle : facingAngle.current;
      facingAngle.current = sitAngle;

      const warmOsc = Math.sin(t * 2.0) * 0.03;
      const breathe = Math.sin(t * 2.5) * 0.005;
      if (characterBodyRef.current) {
        characterBodyRef.current.rotation.order = 'XYZ';
        characterBodyRef.current.rotation.set(0, sitAngle, 0);
        characterBodyRef.current.position.set(0, -0.07, 0);
      }
      if (torsoRef.current) {
        torsoRef.current.position.set(0, breathe, 0);
        torsoRef.current.rotation.set(0.12, 0, 0);
        torsoRef.current.scale.set(1, 1, 1);
      }
      if (leftLegRef.current) leftLegRef.current.rotation.set(-1.25, 0.12, 0);
      if (rightLegRef.current) rightLegRef.current.rotation.set(-1.25, -0.12, 0);
      if (leftArmRef.current) leftArmRef.current.rotation.set(-0.85 + warmOsc, 0.25, -0.1);
      if (rightArmRef.current) rightArmRef.current.rotation.set(-0.85 + warmOsc, -0.25, 0.1);
    } else {
      const breathe = Math.sin(t * 2.8) * 0.006;
      if (characterBodyRef.current) {
        characterBodyRef.current.rotation.order = 'XYZ';
        characterBodyRef.current.rotation.set(0, facingAngle.current, 0);
        characterBodyRef.current.position.set(0, 0, 0);
      }
      if (torsoRef.current) {
        torsoRef.current.position.set(0, breathe, 0);
        torsoRef.current.rotation.set(0, 0, 0);
        torsoRef.current.scale.set(1 + breathe * 0.3, 1 + breathe * 0.5, 1 + breathe * 0.3);
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
      <mesh ref={shadowDiscRef} position={[0, 0.015, 0]} rotation={[-Math.PI / 2, 0, 0]}>
        <circleGeometry args={[0.26, 16]} />
        <meshBasicMaterial color="#0f172a" transparent opacity={0.35} />
      </mesh>

      <group ref={characterBodyRef} scale={[0.8, 0.8, 0.8]}>
        <group ref={leftLegRef} position={[-0.1, 0.16, 0]}>
          <mesh material={app.trousersMat} castShadow>
            <boxGeometry args={[0.11, 0.32, 0.12]} />
          </mesh>
          <mesh material={app.bootsMat} position={[0, -0.1, 0.02]} castShadow>
            <boxGeometry args={[0.12, 0.14, 0.15]} />
          </mesh>
        </group>

        <group ref={rightLegRef} position={[0.1, 0.16, 0]}>
          <mesh material={app.trousersMat} castShadow>
            <boxGeometry args={[0.11, 0.32, 0.12]} />
          </mesh>
          <mesh material={app.bootsMat} position={[0, -0.1, 0.02]} castShadow>
            <boxGeometry args={[0.12, 0.14, 0.15]} />
          </mesh>
        </group>

        <group ref={torsoRef}>
          <mesh material={app.tunicMat} position={[0, 0.44, 0]} castShadow receiveShadow>
            <boxGeometry args={[0.34, 0.35, 0.22]} />
          </mesh>

          {app.gender === 'female' && isPeasant && (
            <mesh material={app.tunicMat} position={[0, 0.24, 0]} castShadow receiveShadow>
              <boxGeometry args={[0.36, 0.24, 0.25]} />
            </mesh>
          )}

          <mesh material={app.bootsMat} position={[0, 0.28, 0]} castShadow>
            <boxGeometry args={[0.35, 0.04, 0.23]} />
          </mesh>
          <mesh material={staticMats.beltBuckle} position={[0, 0.28, 0.12]}>
            <boxGeometry args={[0.06, 0.05, 0.02]} />
          </mesh>

          {app.apronType === 'leather_apron' && app.apronMat && (
            <group position={[0, 0.42, 0.115]}>
              <mesh material={app.apronMat} castShadow>
                <boxGeometry args={[0.26, 0.32, 0.02]} />
              </mesh>
            </group>
          )}

          {app.apronType === 'linen_apron' && app.apronMat && (
            <group position={[0, 0.40, 0.115]}>
              <mesh material={app.apronMat} castShadow>
                <boxGeometry args={[0.28, 0.34, 0.02]} />
              </mesh>
            </group>
          )}

          {app.apronType === 'vest' && app.apronMat && (
            <mesh material={app.apronMat} position={[0, 0.44, 0]} castShadow>
              <boxGeometry args={[0.35, 0.32, 0.23]} />
            </mesh>
          )}

          <group position={[0, 0.72, 0]}>
            <mesh
              material={[
                app.skinMat,
                app.skinMat,
                app.skinMat,
                app.skinMat,
                app.faceMat,
                app.skinMat,
              ]}
              castShadow
              receiveShadow
            >
              <boxGeometry args={[0.22, 0.22, 0.22]} />
            </mesh>
          </group>

          {isLord && (
            <group position={[0, 0.72, 0]}>
              <mesh material={app.hairMat} position={[0, 0.115, -0.02]} castShadow>
                <boxGeometry args={[0.225, 0.04, 0.18]} />
              </mesh>
              <mesh material={app.hairMat} position={[0, 0.02, -0.10]} castShadow>
                <boxGeometry args={[0.225, 0.14, 0.035]} />
              </mesh>
              <mesh material={app.hairMat} position={[-0.105, 0.03, -0.01]} castShadow>
                <boxGeometry args={[0.025, 0.12, 0.16]} />
              </mesh>
              <mesh material={app.hairMat} position={[0.105, 0.03, -0.01]} castShadow>
                <boxGeometry args={[0.025, 0.12, 0.16]} />
              </mesh>
              <group position={[0, 0.14, 0]}>
                <mesh material={staticMats.crownGold} castShadow>
                  <cylinderGeometry args={[0.13, 0.13, 0.08, 6]} />
                </mesh>
                <mesh material={staticMats.rubyGem} position={[0, 0.05, 0.13]}>
                  <dodecahedronGeometry args={[0.03, 0]} />
                </mesh>
              </group>
            </group>
          )}

          {isLady && (
            <group position={[0, 0.72, 0]}>
              <mesh material={app.hairMat} position={[0, 0.115, -0.02]} castShadow>
                <boxGeometry args={[0.225, 0.04, 0.18]} />
              </mesh>
              <mesh material={app.hairMat} position={[0, 0.01, -0.105]} castShadow>
                <boxGeometry args={[0.225, 0.18, 0.035]} />
              </mesh>
              <mesh material={app.hairMat} position={[0, 0.02, -0.13]} castShadow>
                <sphereGeometry args={[0.065, 6, 6]} />
              </mesh>
              <mesh material={staticMats.goldTrim} position={[0, 0.04, -0.13]}>
                <cylinderGeometry args={[0.01, 0.01, 0.14, 4]} />
              </mesh>
            </group>
          )}

          {isKnight && (
            <group position={[0, 0.75, 0]}>
              <mesh material={staticMats.knightHelm} castShadow>
                <boxGeometry args={[0.26, 0.26, 0.26]} />
              </mesh>
              <mesh material={staticMats.ironSteel} position={[0, -0.02, 0.135]}>
                <boxGeometry args={[0.18, 0.06, 0.03]} />
              </mesh>
            </group>
          )}

          {isPeasant && app.headwearType === 'straw_hat' && app.hatMat && (
            <group position={[0, 0.72, 0]}>
              <mesh material={app.hairMat} position={[0, 0.02, -0.10]} castShadow>
                <boxGeometry args={[0.225, 0.12, 0.035]} />
              </mesh>
              <group position={[0, 0.12, 0]}>
                <mesh material={app.hatMat} castShadow>
                  <cylinderGeometry args={[0.25, 0.27, 0.03, 8]} />
                </mesh>
                <mesh material={app.hatMat} position={[0, 0.07, 0]} castShadow>
                  <coneGeometry args={[0.15, 0.13, 8]} />
                </mesh>
              </group>
            </group>
          )}

          {isPeasant && app.headwearType === 'hood' && app.hatMat && (
            <group position={[0, 0.77, -0.04]}>
              <mesh material={app.hatMat} castShadow>
                <boxGeometry args={[0.25, 0.22, 0.18]} />
              </mesh>
              <mesh material={app.hatMat} position={[0, -0.08, -0.08]}>
                <coneGeometry args={[0.15, 0.12, 6]} />
              </mesh>
            </group>
          )}

          {isPeasant && app.headwearType === 'cap' && app.hatMat && (
            <group position={[0, 0.72, 0]}>
              <mesh material={app.hairMat} position={[0, 0.02, -0.10]} castShadow>
                <boxGeometry args={[0.225, 0.12, 0.035]} />
              </mesh>
              <group position={[0, 0.12, 0]}>
                <mesh material={app.hatMat} castShadow>
                  <cylinderGeometry args={[0.16, 0.16, 0.06, 6]} />
                </mesh>
                <mesh material={app.hatMat} position={[0, -0.02, 0.12]}>
                  <boxGeometry args={[0.14, 0.02, 0.08]} />
                </mesh>
              </group>
            </group>
          )}

          {isPeasant && app.headwearType === 'headscarf' && app.hatMat && (
            <group position={[0, 0.80, -0.04]}>
              <mesh material={app.hatMat} castShadow>
                <boxGeometry args={[0.24, 0.13, 0.18]} />
              </mesh>
              <mesh material={app.hatMat} position={[0, -0.06, -0.10]}>
                <dodecahedronGeometry args={[0.04, 0]} />
              </mesh>
            </group>
          )}

          {isPeasant && app.headwearType === 'wimple' && app.hatMat && (
            <group position={[0, 0.76, -0.04]}>
              <mesh material={app.hatMat} castShadow>
                <boxGeometry args={[0.24, 0.18, 0.16]} />
              </mesh>
            </group>
          )}

          {isPeasant && app.headwearType === 'bun' && (
            <group position={[0, 0.72, 0]}>
              <mesh material={app.hairMat} position={[0, 0.115, -0.02]} castShadow>
                <boxGeometry args={[0.225, 0.04, 0.18]} />
              </mesh>
              <mesh material={app.hairMat} position={[0, 0.02, -0.105]} castShadow>
                <boxGeometry args={[0.225, 0.16, 0.035]} />
              </mesh>
              <mesh material={app.hairMat} position={[0, 0.04, -0.13]}>
                <sphereGeometry args={[0.065, 6, 6]} />
              </mesh>
            </group>
          )}

          {isPeasant && app.headwearType === 'braids' && (
            <group position={[0, 0.72, 0]}>
              <mesh material={app.hairMat} position={[0, 0.115, -0.02]} castShadow>
                <boxGeometry args={[0.225, 0.04, 0.18]} />
              </mesh>
              <mesh material={app.hairMat} position={[0, 0.02, -0.105]} castShadow>
                <boxGeometry args={[0.225, 0.16, 0.035]} />
              </mesh>
              <mesh material={app.hairMat} position={[-0.105, -0.08, 0.06]}>
                <cylinderGeometry args={[0.025, 0.02, 0.22, 5]} />
              </mesh>
              <mesh material={app.hairMat} position={[0.105, -0.08, 0.06]}>
                <cylinderGeometry args={[0.025, 0.02, 0.22, 5]} />
              </mesh>
            </group>
          )}

          {isPeasant && app.headwearType === 'none' && (
            <group position={[0, 0.72, 0]}>
              {app.hairStyle % 3 === 0 ? (
                <group>
                  <mesh material={app.hairMat} position={[0, 0.115, -0.02]} castShadow>
                    <boxGeometry args={[0.225, 0.04, 0.18]} />
                  </mesh>
                  <mesh material={app.hairMat} position={[0, 0.02, -0.10]} castShadow>
                    <boxGeometry args={[0.225, 0.14, 0.035]} />
                  </mesh>
                  <mesh material={app.hairMat} position={[-0.105, 0.03, -0.01]} castShadow>
                    <boxGeometry args={[0.025, 0.12, 0.16]} />
                  </mesh>
                  <mesh material={app.hairMat} position={[0.105, 0.03, -0.01]} castShadow>
                    <boxGeometry args={[0.025, 0.12, 0.16]} />
                  </mesh>
                </group>
              ) : app.hairStyle % 3 === 1 ? (
                <group>
                  <mesh material={app.hairMat} position={[0, 0.115, -0.02]} castShadow>
                    <boxGeometry args={[0.225, 0.04, 0.18]} />
                  </mesh>
                  <mesh material={app.hairMat} position={[0, -0.01, -0.10]} castShadow>
                    <boxGeometry args={[0.225, 0.19, 0.035]} />
                  </mesh>
                  <mesh material={app.hairMat} position={[-0.108, -0.01, 0]} castShadow>
                    <boxGeometry args={[0.025, 0.17, 0.16]} />
                  </mesh>
                  <mesh material={app.hairMat} position={[0.108, -0.01, 0]} castShadow>
                    <boxGeometry args={[0.025, 0.17, 0.16]} />
                  </mesh>
                </group>
              ) : (
                <group>
                  <mesh material={app.hairMat} position={[0, 0.02, -0.10]} castShadow>
                    <boxGeometry args={[0.225, 0.13, 0.035]} />
                  </mesh>
                  <mesh material={app.hairMat} position={[-0.105, 0.02, -0.02]} castShadow>
                    <boxGeometry args={[0.025, 0.11, 0.14]} />
                  </mesh>
                  <mesh material={app.hairMat} position={[0.105, 0.02, -0.02]} castShadow>
                    <boxGeometry args={[0.025, 0.11, 0.14]} />
                  </mesh>
                </group>
              )}
            </group>
          )}

          <group ref={twoHandedRigRef} position={[0, 0.46, 0]} visible={false}>
            <group position={[0.02, -0.04, 0.20]} rotation={[-0.28, 0, 0.12]}>
              <mesh material={staticMats.woodHandle} castShadow>
                <cylinderGeometry args={[0.018, 0.022, 0.58, 6]} />
              </mesh>
              <mesh material={app.bootsMat} position={[0, 0.06, 0]}>
                <cylinderGeometry args={[0.024, 0.024, 0.10, 6]} />
              </mesh>
              <mesh material={app.bootsMat} position={[0, -0.12, 0]}>
                <cylinderGeometry args={[0.024, 0.024, 0.10, 6]} />
              </mesh>
              <group position={[0, 0.24, 0.04]}>
                <mesh material={staticMats.ironSteel} castShadow>
                  <boxGeometry args={[0.036, 0.10, 0.11]} />
                </mesh>
                <mesh material={staticMats.ironSteel} position={[0, 0, 0.06]}>
                  <boxGeometry args={[0.012, 0.11, 0.02]} />
                </mesh>
              </group>
            </group>

            <group position={[0.17, 0.08, 0]} rotation={[-0.55, -0.22, 0.35]}>
              <mesh material={app.tunicMat} position={[0, -0.10, 0]} castShadow>
                <boxGeometry args={[0.085, 0.22, 0.085]} />
              </mesh>
              <mesh material={app.skinMat} position={[-0.01, -0.21, 0.02]}>
                <boxGeometry args={[0.08, 0.075, 0.08]} />
              </mesh>
            </group>

            <group position={[-0.17, 0.08, 0]} rotation={[-0.72, 0.38, -0.35]}>
              <mesh material={app.tunicMat} position={[0, -0.10, 0]} castShadow>
                <boxGeometry args={[0.085, 0.22, 0.085]} />
              </mesh>
              <mesh material={app.skinMat} position={[0.02, -0.21, 0.02]}>
                <boxGeometry args={[0.08, 0.075, 0.08]} />
              </mesh>
            </group>
          </group>

          <group ref={standardArmsRef}>
            <group ref={leftArmRef} position={[-0.22, 0.52, 0]}>
              <mesh material={app.tunicMat} position={[0, -0.06, 0]} castShadow>
                <boxGeometry args={[0.085, 0.14, 0.085]} />
              </mesh>
              <mesh material={app.skinMat} position={[0, -0.18, 0]} castShadow>
                <boxGeometry args={[0.08, 0.14, 0.08]} />
              </mesh>
              {isKnight && app.shieldMat && (
                <mesh material={app.shieldMat} position={[-0.08, -0.12, 0.08]} rotation={[0, 0.3, 0]} castShadow>
                  <boxGeometry args={[0.04, 0.38, 0.26]} />
                </mesh>
              )}
            </group>

            <group ref={rightArmRef} position={[0.22, 0.52, 0]}>
              <mesh material={app.tunicMat} position={[0, -0.06, 0]} castShadow>
                <boxGeometry args={[0.085, 0.14, 0.085]} />
              </mesh>
              <mesh material={app.skinMat} position={[0, -0.18, 0]} castShadow>
                <boxGeometry args={[0.08, 0.14, 0.08]} />
              </mesh>

              <group ref={hammerRef} position={[0, -0.2, 0.12]} rotation={[-Math.PI / 5, 0, 0]} visible={false}>
                <mesh material={staticMats.woodHandle} castShadow>
                  <cylinderGeometry args={[0.02, 0.025, 0.35, 4]} />
                </mesh>
                <mesh material={staticMats.ironSteel} position={[0, 0.14, 0]} castShadow>
                  <boxGeometry args={[0.1, 0.07, 0.06]} />
                </mesh>
              </group>

              <group ref={pickaxeRef} position={[0, -0.22, 0.12]} rotation={[-Math.PI / 5, 0, 0]} visible={false}>
                <mesh material={staticMats.woodHandle} castShadow>
                  <cylinderGeometry args={[0.02, 0.025, 0.42, 4]} />
                </mesh>
                <mesh material={staticMats.ironSteel} position={[0, 0.15, 0]} castShadow>
                  <boxGeometry args={[0.18, 0.04, 0.04]} />
                </mesh>
              </group>

              <group ref={swordRef} position={[0, -0.22, 0.15]} rotation={[-Math.PI / 4, 0, 0]} visible={false}>
                <mesh material={staticMats.ironSteel} castShadow>
                  <boxGeometry args={[0.04, 0.45, 0.02]} />
                </mesh>
                <mesh material={staticMats.goldTrim} position={[0, -0.18, 0]}>
                  <boxGeometry args={[0.12, 0.03, 0.04]} />
                </mesh>
              </group>

              {isLord && (
                <group ref={scepterRef} position={[0, -0.2, 0.1]} rotation={[-0.3, 0, 0]} visible={false}>
                  <mesh material={staticMats.goldTrim} castShadow>
                    <cylinderGeometry args={[0.02, 0.02, 0.35, 4]} />
                  </mesh>
                  <mesh material={staticMats.rubyGem} position={[0, 0.18, 0]}>
                    <dodecahedronGeometry args={[0.05, 0]} />
                  </mesh>
                </group>
              )}
            </group>
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
