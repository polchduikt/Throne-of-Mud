import * as THREE from 'three';
import {
  createTunicCanvas,
  createTrousersCanvas,
  createFaceCanvas,
  createLeatherCanvas,
  createShieldCanvas,
  makeTextureFromCanvas,
} from './unitTextures';

export interface UnitAppearance {
  gender: 'male' | 'female';
  skinMat: THREE.MeshStandardMaterial;
  faceMat: THREE.MeshStandardMaterial;
  tunicMat: THREE.MeshStandardMaterial;
  trousersMat: THREE.MeshStandardMaterial;
  bootsMat: THREE.MeshStandardMaterial;
  hairMat: THREE.MeshStandardMaterial;
  hairColor: string;
  hairStyle: number;
  headwearType: 'none' | 'straw_hat' | 'hood' | 'cap' | 'headscarf' | 'wimple' | 'bun' | 'braids';
  hatMat?: THREE.MeshStandardMaterial;
  apronType: 'none' | 'leather_apron' | 'linen_apron' | 'vest';
  apronMat?: THREE.MeshStandardMaterial;
  shieldMat?: THREE.MeshStandardMaterial;
}

const unitAppearanceCache = new Map<string, UnitAppearance>();

const MALE_TUNIC_PALETTES = [
  { base: '#b87c47', pattern: 'weave' as const },
  { base: '#52825e', pattern: 'plain' as const },
  { base: '#4d6f96', pattern: 'weave' as const },
  { base: '#be5c4a', pattern: 'stripes' as const },
  { base: '#dba94f', pattern: 'weave' as const },
  { base: '#7c705e', pattern: 'check' as const },
  { base: '#936c53', pattern: 'plain' as const },
  { base: '#5f7c7d', pattern: 'weave' as const },
  { base: '#c98b58', pattern: 'weave' as const },
  { base: '#687d5e', pattern: 'plain' as const },
];

const FEMALE_TUNIC_PALETTES = [
  { base: '#c85a5a', pattern: 'weave' as const },
  { base: '#458567', pattern: 'plain' as const },
  { base: '#5c7fa8', pattern: 'weave' as const },
  { base: '#e5ad3b', pattern: 'stripes' as const },
  { base: '#9e5a39', pattern: 'plain' as const },
  { base: '#647c8d', pattern: 'weave' as const },
  { base: '#bd728e', pattern: 'weave' as const },
  { base: '#876e55', pattern: 'check' as const },
];

const TROUSERS_PALETTES = ['#4b5766', '#594a3e', '#3f4952', '#635345', '#3b4754', '#595752'];

const HAIR_PALETTES = [
  '#241b16',
  '#4a2810',
  '#783c16',
  '#b85b14',
  '#d68f29',
  '#e2b34a',
  '#403b36',
  '#7a7772',
  '#171412',
];

const SKIN_PALETTES = [
  { tone: '#ffd9be', eyes: '#4b382a' },
  { tone: '#f7cdad', eyes: '#2c4356' },
  { tone: '#ebb48a', eyes: '#3d5236' },
  { tone: '#fedbc4', eyes: '#5c3a21' },
  { tone: '#f4c49f', eyes: '#2d3748' },
  { tone: '#e5ad82', eyes: '#4a3b32' },
];

function hashString(str: string): number {
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    hash = (hash << 5) - hash + str.charCodeAt(i);
    hash |= 0;
  }
  return Math.abs(hash);
}

export function getUnitAppearance(unitId: string, characterClass = 'peasant'): UnitAppearance {
  const cacheKey = `${unitId}_${characterClass}`;
  const existing = unitAppearanceCache.get(cacheKey);
  if (existing) return existing;

  const seed = hashString(unitId);
  const isLord = characterClass === 'lord' || characterClass === 'king';
  const isLady = characterClass === 'lady';
  const isKnight = characterClass === 'warrior';

  let gender: 'male' | 'female' = seed % 2 === 0 ? 'male' : 'female';
  if (isLady) gender = 'female';
  if (isLord || isKnight) gender = 'male';

  const skinEntry = SKIN_PALETTES[(seed + 1) % SKIN_PALETTES.length];
  const hairColor = HAIR_PALETTES[(seed + 3) % HAIR_PALETTES.length];

  let beardType: 'none' | 'stubble' | 'mustache' | 'full_beard' | 'braid_beard' = 'none';
  if (gender === 'male' && !isLord) {
    const bChoices: ('none' | 'stubble' | 'mustache' | 'full_beard' | 'braid_beard')[] = [
      'none',
      'stubble',
      'mustache',
      'full_beard',
      'braid_beard',
      'stubble',
      'none',
    ];
    beardType = bChoices[(seed >> 2) % bChoices.length];
  } else if (isLord) {
    beardType = 'mustache';
  }

  const faceCanvas = createFaceCanvas(
    skinEntry.tone,
    skinEntry.eyes,
    hairColor,
    beardType,
    isLord ? 'determined' : seed % 3 === 0 ? 'smile' : 'calm'
  );
  const faceTex = makeTextureFromCanvas(faceCanvas, 1, 1);
  const faceMat = new THREE.MeshStandardMaterial({
    map: faceTex,
    roughness: 0.82,
    transparent: false,
  });

  const skinMat = new THREE.MeshStandardMaterial({
    color: skinEntry.tone,
    roughness: 0.85,
  });

  let tunicColor = '#b87c47';
  let tunicPattern: 'plain' | 'weave' | 'stripes' | 'check' | 'embroidery' = 'weave';

  if (isLord) {
    tunicColor = '#b91c1c';
    tunicPattern = 'embroidery';
  } else if (isLady) {
    tunicColor = '#047857';
    tunicPattern = 'embroidery';
  } else if (isKnight) {
    tunicColor = '#475569';
    tunicPattern = 'plain';
  } else if (gender === 'female') {
    const entry = FEMALE_TUNIC_PALETTES[(seed >> 1) % FEMALE_TUNIC_PALETTES.length];
    tunicColor = entry.base;
    tunicPattern = entry.pattern;
  } else {
    const entry = MALE_TUNIC_PALETTES[(seed >> 1) % MALE_TUNIC_PALETTES.length];
    tunicColor = entry.base;
    tunicPattern = entry.pattern;
  }

  const tunicCanvas = createTunicCanvas(tunicColor, tunicPattern, '#fbbf24');
  const tunicTex = makeTextureFromCanvas(tunicCanvas, 2, 2);
  const tunicMat = new THREE.MeshStandardMaterial({
    map: tunicTex,
    color: tunicColor,
    roughness: 0.8,
  });

  const trousersColor = TROUSERS_PALETTES[(seed + 4) % TROUSERS_PALETTES.length];
  const trousersCanvas = createTrousersCanvas(trousersColor);
  const trousersTex = makeTextureFromCanvas(trousersCanvas, 1, 2);
  const trousersMat = new THREE.MeshStandardMaterial({
    map: trousersTex,
    color: trousersColor,
    roughness: 0.85,
  });

  const leatherCanvas = createLeatherCanvas('#442916');
  const leatherTex = makeTextureFromCanvas(leatherCanvas, 1, 1);
  const bootsMat = new THREE.MeshStandardMaterial({
    map: leatherTex,
    color: '#3d2514',
    roughness: 0.82,
  });

  const hairMat = new THREE.MeshStandardMaterial({
    color: hairColor,
    roughness: 0.88,
  });

  let hairStyle = (seed >> 3) % 6;
  let headwearType: 'none' | 'straw_hat' | 'hood' | 'cap' | 'headscarf' | 'wimple' | 'bun' | 'braids' = 'none';
  let hatMat: THREE.MeshStandardMaterial | undefined = undefined;

  if (gender === 'male' && !isLord && !isKnight) {
    const hwRoll = (seed >> 2) % 6;
    if (hwRoll === 0) {
      headwearType = 'straw_hat';
      hatMat = new THREE.MeshStandardMaterial({ color: '#fed46a', roughness: 0.85 });
    } else if (hwRoll === 1) {
      headwearType = 'hood';
      hatMat = new THREE.MeshStandardMaterial({ color: tunicColor, roughness: 0.8 });
    } else if (hwRoll === 2) {
      headwearType = 'cap';
      hatMat = new THREE.MeshStandardMaterial({ color: '#634b3d', roughness: 0.8 });
    }
  } else if (gender === 'female' && !isLady) {
    const hwRoll = (seed >> 2) % 4;
    if (hwRoll === 0) {
      headwearType = 'headscarf';
      hatMat = new THREE.MeshStandardMaterial({ color: '#fef3c7', roughness: 0.8 });
    } else if (hwRoll === 1) {
      headwearType = 'wimple';
      hatMat = new THREE.MeshStandardMaterial({ color: '#fafaf9', roughness: 0.8 });
    } else if (hwRoll === 2) {
      headwearType = 'bun';
    } else {
      headwearType = 'braids';
    }
  }

  let apronType: 'none' | 'leather_apron' | 'linen_apron' | 'vest' = 'none';
  let apronMat: THREE.MeshStandardMaterial | undefined = undefined;

  if (!isLord && !isLady && !isKnight) {
    const apRoll = (seed >> 4) % 5;
    if (apRoll === 0) {
      apronType = 'leather_apron';
      apronMat = new THREE.MeshStandardMaterial({ color: '#664227', roughness: 0.85 });
    } else if (apRoll === 1) {
      apronType = 'linen_apron';
      apronMat = new THREE.MeshStandardMaterial({ color: '#faf5ea', roughness: 0.85 });
    } else if (apRoll === 2) {
      apronType = 'vest';
      apronMat = new THREE.MeshStandardMaterial({ color: '#4f321e', roughness: 0.85 });
    }
  }

  let shieldMat: THREE.MeshStandardMaterial | undefined = undefined;
  if (isKnight) {
    const emblems: ('cross' | 'lion' | 'chevron' | 'tree')[] = ['cross', 'lion', 'chevron', 'tree'];
    const shieldCanvas = createShieldCanvas('#1e40af', emblems[seed % emblems.length]);
    const shieldTex = makeTextureFromCanvas(shieldCanvas, 1, 1);
    shieldMat = new THREE.MeshStandardMaterial({
      map: shieldTex,
      roughness: 0.65,
    });
  }

  const app: UnitAppearance = {
    gender,
    skinMat,
    faceMat,
    tunicMat,
    trousersMat,
    bootsMat,
    hairMat,
    hairColor,
    hairStyle,
    headwearType,
    hatMat,
    apronType,
    apronMat,
    shieldMat,
  };

  unitAppearanceCache.set(cacheKey, app);
  return app;
}
