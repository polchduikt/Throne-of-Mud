import { useEffect, useMemo, useRef, useState } from 'react';
import { useFrame } from '@react-three/fiber';
import type { ThreeEvent } from '@react-three/fiber';
import { Html } from '@react-three/drei';
import * as THREE from 'three';
import { GridMap } from '../../engine/grid/GridMap';
import { useGameStore } from '../../store/useGameStore';
import { BUILDING_BLUEPRINTS } from '../../engine/buildings/blueprints';
import { world, buildingEntities } from '../../engine/ecs/world';
import { AssetLoader } from '../../engine/assets/AssetLoader';
import { AStar } from '../../engine/pathfinding/AStar';
import { audioManager } from '../../engine/audio/AudioManager';
import { RoadIcon } from '../ui/MedievalIcons';

interface Props {
  grid: GridMap;
}

export interface BuildingSnapNode {
  id: string;
  x: number;
  z: number;
  buildingId: string;
  buildingName: string;
}

export function TerrainRenderer({ grid }: Props) {
  const activeTool = useGameStore((s) => s.activeTool);
  const activeBuildType = useGameStore((s) => s.activeBuildType);
  const buildingVersion = useGameStore((s) => s.buildingVersion);
  const hoveredTile = useGameStore((s) => s.hoveredTile);
  const isStrategicView = useGameStore((s) => s.isStrategicView);

  const season = useGameStore((s) => s.time.season);

  const roadEraseMode = useGameStore((s) => s.roadEraseMode);
  const setRoadEraseMode = useGameStore((s) => s.setRoadEraseMode);

  const [roadStartPoint, setRoadStartPoint] = useState<[number, number] | null>(null);
  const [roadPreviewPath, setRoadPreviewPath] = useState<[number, number][]>([]);
  const lastErasedTileRef = useRef<string | null>(null);

  const gridTexture = useMemo(() => {
    const w = grid.width;
    const h = grid.height;
    const data = new Uint8Array(w * h * 4);

    for (let z = 0; z < h; z++) {
      for (let x = 0; x < w; x++) {
        const tile = grid.tiles[x][z];
        const t = tile?.terrain || 'grass';
        const isSoil = (t === 'fertile_soil' || t === 'mud') ? 255 : 0;
        const isWater = (t === 'water') ? 255 : 0;
        const isStone = (t === 'stone') ? 255 : 0;
        const isRoad = (t === 'road') ? 255 : 0;

        const idx = (z * w + x) * 4;
        data[idx] = isSoil;
        data[idx + 1] = isWater;
        data[idx + 2] = isStone;
        data[idx + 3] = isRoad;
      }
    }

    const tex = new THREE.DataTexture(data, w, h, THREE.RGBAFormat);
    tex.magFilter = THREE.LinearFilter;
    tex.minFilter = THREE.LinearFilter;
    tex.needsUpdate = true;
    return tex;
  }, [grid]);

  const grassTexture = useMemo(() => {
    const tex = AssetLoader.getInstance().load('/assets/terrain/grass.png');
    tex.wrapS = THREE.RepeatWrapping;
    tex.wrapT = THREE.RepeatWrapping;
    tex.repeat.set(16, 16);
    tex.minFilter = THREE.LinearMipmapLinearFilter;
    tex.magFilter = THREE.LinearFilter;
    return tex;
  }, []);

  const mudTexture = useMemo(() => {
    const tex = AssetLoader.getInstance().load('/assets/terrain/mud.png');
    tex.wrapS = THREE.RepeatWrapping;
    tex.wrapT = THREE.RepeatWrapping;
    tex.repeat.set(16, 16);
    tex.minFilter = THREE.LinearMipmapLinearFilter;
    tex.magFilter = THREE.LinearFilter;
    return tex;
  }, []);

  const stoneTexture = useMemo(() => {
    const tex = AssetLoader.getInstance().load('/assets/terrain/stone.png');
    tex.wrapS = THREE.RepeatWrapping;
    tex.wrapT = THREE.RepeatWrapping;
    tex.repeat.set(20, 20);
    tex.minFilter = THREE.LinearMipmapLinearFilter;
    tex.magFilter = THREE.LinearFilter;
    return tex;
  }, []);

  const waterTexture = useMemo(() => {
    const tex = AssetLoader.getInstance().load('/assets/terrain/water.png');
    tex.wrapS = THREE.RepeatWrapping;
    tex.wrapT = THREE.RepeatWrapping;
    tex.repeat.set(12, 12);
    tex.minFilter = THREE.LinearMipmapLinearFilter;
    tex.magFilter = THREE.LinearFilter;
    return tex;
  }, []);

  const customShaderRef = useRef<{ uniforms: Record<string, THREE.IUniform> } | null>(null);

  useFrame((state) => {
    if (customShaderRef.current) {
      customShaderRef.current.uniforms.uTime.value = state.clock.elapsedTime;
      const { rainIntensity = 0, stormIntensity = 0, snowAccumulation = 0 } = useGameStore.getState().time;

      const targetWetness = Math.min(1.0, rainIntensity * 0.85 + stormIntensity * 0.15);
      const curWetness = (customShaderRef.current.uniforms.uWetness?.value as number) || 0;
      const wetnessRate = targetWetness > curWetness ? 0.04 : 0.012;
      customShaderRef.current.uniforms.uWetness.value = THREE.MathUtils.lerp(curWetness, targetWetness, wetnessRate);

      const targetAutumn = season === 'Autumn' ? 1.0 : 0.0;
      const curAutumn = (customShaderRef.current.uniforms.uAutumnAmount?.value as number) || 0;
      customShaderRef.current.uniforms.uAutumnAmount.value = THREE.MathUtils.lerp(curAutumn, targetAutumn, 0.04);

      const targetSnow = snowAccumulation;
      const curSnow = (customShaderRef.current.uniforms.uSnowAmount?.value as number) || 0;
      customShaderRef.current.uniforms.uSnowAmount.value = THREE.MathUtils.lerp(curSnow, targetSnow, 0.05);
    }
  });

  useEffect(() => {
    if (customShaderRef.current) {
      customShaderRef.current.uniforms.uGridTex.value = gridTexture;
      customShaderRef.current.uniforms.uMudTex.value = mudTexture;
      customShaderRef.current.uniforms.uStoneTex.value = stoneTexture;
      customShaderRef.current.uniforms.uWaterTex.value = waterTexture;
    }
  }, [gridTexture, mudTexture, stoneTexture, waterTexture]);

  const terrainMaterial = useMemo(() => {
    const mat = new THREE.MeshStandardMaterial({
      map: grassTexture,
      roughness: 0.82,
      metalness: 0.04,
      flatShading: false,
    });

    mat.onBeforeCompile = (shader) => {
      customShaderRef.current = shader;
      shader.uniforms.uGridTex = { value: gridTexture };
      shader.uniforms.uMudTex = { value: mudTexture };
      shader.uniforms.uStoneTex = { value: stoneTexture };
      shader.uniforms.uWaterTex = { value: waterTexture };
      shader.uniforms.uGridWidth = { value: grid.width };
      shader.uniforms.uGridHeight = { value: grid.height };
      shader.uniforms.uTime = { value: 0 };
      shader.uniforms.uSnowAmount = { value: 0 };
      shader.uniforms.uAutumnAmount = { value: 0 };
      shader.uniforms.uWetness = { value: 0 };

      shader.vertexShader = `
        varying vec2 vWorldUv;
        ${shader.vertexShader}
      `.replace(
        '#include <uv_vertex>',
        `
        #include <uv_vertex>
        vWorldUv = uv;
        `
      );

      shader.fragmentShader = `
        uniform sampler2D uGridTex;
        uniform sampler2D uMudTex;
        uniform sampler2D uStoneTex;
        uniform sampler2D uWaterTex;
        uniform float uGridWidth;
        uniform float uGridHeight;
        uniform float uTime;
        uniform float uSnowAmount;
        uniform float uAutumnAmount;
        uniform float uWetness;
        varying vec2 vWorldUv;
        ${shader.fragmentShader}
      `.replace(
        '#include <map_fragment>',
        `
        #include <map_fragment>
        vec2 gridUv = vec2(vWorldUv.x, 1.0 - vWorldUv.y);
        vec2 worldUV = gridUv * vec2(uGridWidth, uGridHeight);
        vec2 mudUv = worldUV * 0.35;
        vec2 stoneUv = worldUV * 0.70;

        vec4 mudCol = texture2D(uMudTex, mudUv);
        vec4 stoneCol = texture2D(uStoneTex, stoneUv);
        vec4 splat = texture2D(uGridTex, gridUv);

        float soilWeight = splat.r;
        float isWater = splat.g;
        float stoneWeight = splat.b;
        float roadWeight = splat.a;

        
        diffuseColor.rgb = mix(diffuseColor.rgb, mudCol.rgb, smoothstep(0.12, 0.65, soilWeight));
        diffuseColor.rgb = mix(diffuseColor.rgb, stoneCol.rgb, smoothstep(0.25, 0.75, stoneWeight));

        
        if (roadWeight > 0.02) {
          vec3 dirtRoad = mix(vec3(0.32, 0.20, 0.11), mudCol.rgb * 0.78, 0.60);
          diffuseColor.rgb = mix(diffuseColor.rgb, dirtRoad, smoothstep(0.18, 0.60, roadWeight));
        }

        
        if (uAutumnAmount > 0.01) {
          vec3 autumnGrass = diffuseColor.rgb * vec3(1.18, 0.94, 0.58);
          diffuseColor.rgb = mix(diffuseColor.rgb, autumnGrass, uAutumnAmount * 0.75 * (1.0 - isWater));
        }

        
        if (uWetness > 0.01) {
          diffuseColor.rgb = mix(diffuseColor.rgb, diffuseColor.rgb * 0.80, uWetness * 0.35 * (1.0 - isWater));
        }

        
        if (uWetness > 0.05) {
          
          vec2 splashGrid = worldUV * 1.0;
          vec2 cellId = floor(splashGrid);
          vec2 cellFract = fract(splashGrid);

          
          vec2 randHash = fract(sin(vec2(
            dot(cellId, vec2(127.1, 311.7)),
            dot(cellId, vec2(269.5, 183.3))
          )) * 43758.5453);

          
          float cyclePeriod = 0.7 + randHash.x * 0.8;
          float localTime = mod(uTime * 1.4 + randHash.y * 13.7, cyclePeriod);
          float splashDuration = 0.20; 

          if (localTime < splashDuration) {
            float progress = localTime / splashDuration; 

            
            vec2 dropCenter = vec2(0.22, 0.22) + randHash * 0.56;
            vec2 delta = cellFract - dropCenter;
            float dist = length(delta);

            
            float ringRadius = progress * 0.09;
            float ringWidth = 0.016 * (1.0 - progress * 0.4);
            float ring = smoothstep(ringWidth, 0.0, abs(dist - ringRadius));

            
            float angle = atan(delta.y, delta.x) + randHash.x * 6.28;
            float fleckRay = pow(max(0.0, cos(angle * 4.0)), 6.0);
            float fleckDist = progress * 0.07;
            float flecks = smoothstep(0.02, 0.0, abs(dist - fleckDist)) * fleckRay * (1.0 - progress);

            
            float centerBead = smoothstep(0.025 * (1.0 - progress), 0.0, dist) * smoothstep(0.35, 0.0, progress);

            
            float splash = (ring * 0.80 + flecks * 0.90 + centerBead * 1.1) * (1.0 - progress);

            
            vec3 waterGlisten = vec3(0.85, 0.93, 1.0);
            diffuseColor.rgb = mix(diffuseColor.rgb, waterGlisten, clamp(splash * uWetness * 0.85, 0.0, 0.80));
          }
        }

        
        if (uSnowAmount > 0.01) {
          vec3 snowColor = vec3(0.92, 0.95, 0.99);
          float snowMask = 1.0 - isWater;
          float roadSlush = roadWeight > 0.02 ? 0.45 : 1.0;
          diffuseColor.rgb = mix(diffuseColor.rgb, snowColor, uSnowAmount * 0.90 * snowMask * roadSlush);
          if (isWater > 0.02 && uSnowAmount > 0.3) {
            diffuseColor.rgb = mix(diffuseColor.rgb, vec3(0.82, 0.90, 0.98), (uSnowAmount - 0.3) * 0.65);
          }
        }

        
        if (isWater > 0.02) {
          
          vec2 waterUv1 = worldUV * 0.36 + vec2(uTime * 0.045, uTime * 0.025);
          vec2 waterUv2 = worldUV * 0.40 + vec2(
            -uTime * 0.035 + sin(uTime * 0.7 + worldUV.y * 1.5) * 0.025,
            uTime * 0.040 + cos(uTime * 0.6 + worldUV.x * 1.5) * 0.025
          );

          vec4 waterCol1 = texture2D(uWaterTex, waterUv1);
          vec4 waterCol2 = texture2D(uWaterTex, waterUv2);

          
          vec3 livingWater = mix(waterCol1.rgb, waterCol2.rgb, 0.45);

          
          float crest = (waterCol1.r + waterCol2.g) * 0.5;
          livingWater = mix(livingWater, vec3(0.92, 0.98, 1.0), smoothstep(0.70, 0.95, crest) * 0.35);

          
          diffuseColor.rgb = mix(diffuseColor.rgb, livingWater, smoothstep(0.10, 0.55, isWater));
        }
        `
      );
    };

    return mat;
  }, [grassTexture, mudTexture, stoneTexture, waterTexture, gridTexture, grid.width, grid.height]);

  const terrainGeometry = useMemo(() => {
    const w = grid.width;
    const h = grid.height;
    const segsX = 128;
    const segsZ = 128;
    const geo = new THREE.PlaneGeometry(w, h, segsX, segsZ);

    const lake1X = 72;
    const lake1Z = 70;
    const lake1Radius = 3.8;

    const lake2X = 60;
    const lake2Z = 195;
    const lake2Radius = 4.2;

    const pos = geo.attributes.position;

    for (let i = 0; i < pos.count; i++) {
      const lx = pos.getX(i);
      const ly = pos.getY(i);
      const wx = lx + w / 2;
      const wz = h / 2 - ly;

      const dx1 = (wx - lake1X) * 0.90 + (wz - lake1Z) * 0.35;
      const dz1 = -(wx - lake1X) * 0.35 + (wz - lake1Z) * 0.90;
      const distLake1 = Math.hypot(dx1, dz1);

      const dx2 = wx - lake2X;
      const dz2 = (wz - lake2Z) - Math.sin((wx - lake2X) * 0.40) * 1.1;
      const distLake2 = Math.hypot(dx2, dz2);

      const roadX = GridMap.getHighwayX(wz);
      const distRoadX = Math.abs(wx - roadX);
      const roadZ = GridMap.getHighwayZ(wx);
      const distRoadZ = Math.abs(wz - roadZ);
      const distPlaza = Math.hypot(wx - 127.5, wz - 127.5);
      const isHighway = distRoadX <= 0.85 || distRoadZ <= 0.85 || distPlaza <= 2.4;

      let elevation = 0.05;

      if (distLake1 < lake1Radius) {
        const t = distLake1 / lake1Radius;
        elevation = -0.10 + t * t * 0.04;
      } else if (distLake1 < lake1Radius + 1.6) {
        const t = (distLake1 - lake1Radius) / 1.6;
        const smoothT = t * t * (3.0 - 2.0 * t);
        elevation = -0.06 + smoothT * 0.11;
      } else if (distLake2 < lake2Radius) {
        const t = distLake2 / lake2Radius;
        elevation = -0.10 + t * t * 0.04;
      } else if (distLake2 < lake2Radius + 1.8) {
        const t = (distLake2 - lake2Radius) / 1.8;
        const smoothT = t * t * (3.0 - 2.0 * t);
        elevation = -0.06 + smoothT * 0.11;
      } else if (isHighway) {
        elevation = 0.05;
      } else {
        const baseHill = Math.sin(wx * 0.12) * Math.cos(wz * 0.12) * 0.12 + Math.sin(wx * 0.28 + wz * 0.2) * 0.06;
        let regionalBonus = 0;
        if (wx < 128 && wz < 128) {
          regionalBonus = baseHill * 0.35;
        } else if (wx >= 128 && wz < 128) {
          regionalBonus = Math.max(0.0, baseHill * 0.75);
        } else if (wx < 128 && wz >= 128) {
          regionalBonus = Math.max(0.0, baseHill * 0.60);
        } else {
          const mountainCrag = Math.sin(wx * 0.14) * 0.22 + Math.cos(wz * 0.14) * 0.18 + 0.15;
          regionalBonus = Math.max(0.0, baseHill + mountainCrag);
        }
        elevation = 0.05 + regionalBonus;
      }

      pos.setZ(i, elevation);
    }

    geo.computeVertexNormals();
    return geo;
  }, [grid.width, grid.height]);

  const dioramaBaseGeometry = useMemo(() => {
    return new THREE.BoxGeometry(grid.width, 1.4, grid.height);
  }, [grid.width, grid.height]);

  const dioramaBaseMaterial = useMemo(() => {
    return new THREE.MeshStandardMaterial({
      color: '#1c1917',
      roughness: 0.95,
      metalness: 0.05,
      flatShading: true,
    });
  }, []);

  useEffect(() => {
    return () => {
      gridTexture.dispose();
      terrainMaterial.dispose();
      terrainGeometry.dispose();
      dioramaBaseGeometry.dispose();
      dioramaBaseMaterial.dispose();
    };
  }, [gridTexture, terrainMaterial, terrainGeometry, dioramaBaseGeometry, dioramaBaseMaterial]);

  const buildGridLines = useMemo(() => {
    const points: THREE.Vector3[] = [];
    const w = grid.width;
    const h = grid.height;

    for (let x = 0; x <= w; x++) {
      points.push(new THREE.Vector3(x, 0.005, 0));
      points.push(new THREE.Vector3(x, 0.005, h));
    }
    for (let z = 0; z <= h; z++) {
      points.push(new THREE.Vector3(0, 0.005, z));
      points.push(new THREE.Vector3(w, 0.005, z));
    }

    const geom = new THREE.BufferGeometry().setFromPoints(points);
    return geom;
  }, [grid.width, grid.height]);

  const isPointerDownRef = useRef(false);
  const pointerButtonRef = useRef(0);

  const updateTileInTexture = (x: number, z: number) => {
    const tile = grid.getTile(x, z);
    if (!tile) return;
    const w = grid.width;
    const idx = (z * w + x) * 4;
    const data = gridTexture.image?.data;
    if (!data) return;
    const t = tile.terrain;
    data[idx] = (t === 'fertile_soil' || t === 'mud') ? 255 : 0;
    data[idx + 1] = (t === 'water') ? 255 : 0;
    data[idx + 2] = (t === 'stone') ? 255 : 0;
    data[idx + 3] = (t === 'road') ? 255 : 0;
    gridTexture.needsUpdate = true;
  };

  const allSnapNodes = useMemo(() => {
    if (activeTool !== 'road') return [];
    const nodes: BuildingSnapNode[] = [];
    const seen = new Set<string>();

    for (const b of buildingEntities) {
      if (!b.gridPosition) continue;
      const [gx, gz] = b.gridPosition;
      const w = b.buildingWidth || 1;
      const h = b.buildingHeight || 1;
      const type = b.buildingType;

      const candidates: [number, number][] = [];

      if (type === 'campfire') {
        candidates.push([gx, gz - 1], [gx, gz + 1], [gx - 1, gz], [gx + 1, gz]);
      } else {
        const midX = gx + Math.floor(w / 2);
        candidates.push([midX, gz + h]);
        if (w >= 3 || h >= 3) {
          candidates.push([midX, gz - 1]);
        }
      }

      for (const [cx, cz] of candidates) {
        if (cx >= 0 && cx < grid.width && cz >= 0 && cz < grid.height) {
          const key = `${cx},${cz}`;
          if (!seen.has(key) && (grid.isWalkable(cx, cz) || grid.getTile(cx, cz)?.terrain === 'road')) {
            seen.add(key);
            nodes.push({
              id: `snap-${b.id}-${cx}-${cz}`,
              x: cx,
              z: cz,
              buildingId: b.id,
              buildingName: b.name || 'Будівля',
            });
          }
        }
      }
    }
    return nodes;
  }, [activeTool, buildingEntities, buildingVersion, grid]);

  const SNAP_VIS_RADIUS = 7;
  const snapNodes = useMemo(() => {
    if (!hoveredTile) return allSnapNodes.slice(0, 0);
    const [hx, hz] = hoveredTile;
    return allSnapNodes.filter(
      (n) => Math.abs(n.x - hx) <= SNAP_VIS_RADIUS && Math.abs(n.z - hz) <= SNAP_VIS_RADIUS
    );
  }, [allSnapNodes, hoveredTile]);

  useEffect(() => {
    if (activeTool !== 'road') {
      setRoadStartPoint(null);
      setRoadPreviewPath([]);
    }
  }, [activeTool]);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && activeTool === 'road') {
        setRoadStartPoint(null);
        setRoadPreviewPath([]);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [activeTool]);

  const getEffectiveTile = (rawX: number, rawZ: number): [number, number] => {
    if (activeTool !== 'road') return [rawX, rawZ];
    for (const node of snapNodes) {
      const dist = Math.hypot(node.x - rawX, node.z - rawZ);
      if (dist <= 1.2) {
        return [node.x, node.z];
      }
    }
    return [rawX, rawZ];
  };

  useEffect(() => {
    const handleGlobalPointerUp = () => {
      isPointerDownRef.current = false;
      lastErasedTileRef.current = null;
    };
    window.addEventListener('pointerup', handleGlobalPointerUp);
    return () => window.removeEventListener('pointerup', handleGlobalPointerUp);
  }, []);

  const handlePointerMove = (e: ThreeEvent<PointerEvent>) => {
    e.stopPropagation();
    if (!e.point) return;
    const rawX = Math.floor(e.point.x);
    const rawZ = Math.floor(e.point.z);

    if (rawX >= 0 && rawX < grid.width && rawZ >= 0 && rawZ < grid.height) {
      const [gx, gz] = getEffectiveTile(rawX, rawZ);
      const curHover = useGameStore.getState().hoveredTile;
      if (!curHover || curHover[0] !== gx || curHover[1] !== gz) {
        useGameStore.getState().setHoveredTile([gx, gz]);
      }

      if (
        activeTool === 'road' &&
        roadEraseMode &&
        isPointerDownRef.current &&
        pointerButtonRef.current === 0
      ) {
        const tileKey = `${gx},${gz}`;
        if (lastErasedTileRef.current !== tileKey) {
          lastErasedTileRef.current = tileKey;
          if (grid.removeRoad(gx, gz)) {
            audioManager.playRoadErase();
            updateTileInTexture(gx, gz);
            useGameStore.getState().incrementBuildingVersion();
            useGameStore.getState().incrementFoliageVersion();
          }
        }
      }

      if (activeTool === 'road' && !roadEraseMode && roadStartPoint) {
        if (gx === roadStartPoint[0] && gz === roadStartPoint[1]) {
          setRoadPreviewPath([[gx, gz]]);
        } else {
          const { playerRegionId, regions } = useGameStore.getState();
          const pRegion = regions.find((r) => r.id === (playerRegionId ?? 0));
          const path = AStar.findPath(grid, roadStartPoint, [gx, gz], false, pRegion?.bounds);
          if (path && path.length > 0) {
            setRoadPreviewPath(path);
          } else {
            setRoadPreviewPath([]);
          }
        }
      }
    } else {
      if (useGameStore.getState().hoveredTile !== null) {
        useGameStore.getState().setHoveredTile(null);
      }
      if (activeTool === 'road' && roadStartPoint) {
        setRoadPreviewPath([]);
      }
    }
  };

  const handlePointerDown = (e: ThreeEvent<PointerEvent>) => {
    e.stopPropagation();
    if (!e.point) return;

    isPointerDownRef.current = true;
    pointerButtonRef.current = e.button;

    const [gx, gz] = getEffectiveTile(Math.floor(e.point.x), Math.floor(e.point.z));
    const tile = grid.getTile(gx, gz);
    if (!tile) return;

    const { addChronicleEvent, consumeResource, addPendingJob, resources } = useGameStore.getState();

    if (activeTool === 'road' || activeTool === 'build' || activeTool === 'chop') {
      const { playerRegionId, regions } = useGameStore.getState();
      const pRegion = regions.find((r) => r.id === (playerRegionId ?? 0));
      if (pRegion?.bounds) {
        const b = pRegion.bounds;
        if (gx < b.minX || gx > b.maxX || gz < b.minZ || gz > b.maxZ) {
          addChronicleEvent({
            title: 'Чужі володіння!',
            description: 'Ви не маєте права будувати, прокладати дороги чи рубати ліс на чужій території без дозволу сусіднього лорда.',
            type: 'warning',
          });
          return;
        }
      }
    }

    if (activeTool === 'road') {

      if (roadEraseMode) {
        if (e.button === 0) {
          const tileKey = `${gx},${gz}`;
          lastErasedTileRef.current = tileKey;
          if (grid.removeRoad(gx, gz)) {
            audioManager.playRoadErase();
            updateTileInTexture(gx, gz);
            useGameStore.getState().incrementBuildingVersion();
            useGameStore.getState().incrementFoliageVersion();
          }
        } else if (e.button === 2) {
          audioManager.playUIClick();
          setRoadEraseMode(false);
        }
        return;
      }

      if (e.button === 2 || (e.button === 0 && e.shiftKey)) {
        if (roadStartPoint !== null) {
          audioManager.playUIClick();
          setRoadStartPoint(null);
          setRoadPreviewPath([]);
          addChronicleEvent({
            title: 'Прокладання скасовано',
            description: 'Поточну лінію дороги скасовано.',
            type: 'info',
          });
        } else {
          if (grid.removeRoad(gx, gz)) {
            audioManager.playRoadErase();
            updateTileInTexture(gx, gz);
            useGameStore.getState().incrementBuildingVersion();
            useGameStore.getState().incrementFoliageVersion();
          }
        }
        return;
      }

      if (e.button === 0) {
        if (roadStartPoint === null) {
          if (grid.isWalkable(gx, gz) || grid.getTile(gx, gz)?.terrain === 'road') {
            audioManager.playRoadDraw();
            setRoadStartPoint([gx, gz]);
            setRoadPreviewPath([[gx, gz]]);
            addChronicleEvent({
              title: 'Початок дороги обрано',
              description: 'Клацніть на кінцеву точку, щоб прокласти шлях. ПКМ або E — стирати.',
              type: 'info',
            });
          }
        } else {
          if (roadPreviewPath.length > 0) {
            let pavedCount = 0;
            for (const [px, pz] of roadPreviewPath) {
              if (grid.paveRoad(px, pz)) {
                updateTileInTexture(px, pz);
                pavedCount++;
              }
            }

            if (pavedCount > 0) {
              audioManager.playRoadDraw();
              useGameStore.getState().incrementBuildingVersion();
              useGameStore.getState().incrementFoliageVersion();
              addChronicleEvent({
                title: 'Прокладено дорогу',
                description: `Збудовано ґрунтовий шлях (${roadPreviewPath.length} пл.). Селяни отримали бонус +50% до швидкості руху!`,
                type: 'info',
              });
            }

            setRoadStartPoint([gx, gz]);
            setRoadPreviewPath([[gx, gz]]);
          }
        }
        return;
      }
      return;
    }

    if (e.button !== 0) return;

    if (activeTool === 'build' && activeBuildType) {
      const blueprint = BUILDING_BLUEPRINTS[activeBuildType];
      if (!blueprint) return;

      if (!grid.canBuildAt(gx, gz, blueprint.width, blueprint.height)) {
        audioManager.playUIError();
        addChronicleEvent({
          title: 'Неможливо збудувати!',
          description: 'Місце зайняте водою, іншою будівлею або перешкодами.',
          type: 'warning',
        });
        return;
      }

      let canAfford = true;
      for (const [res, cost] of Object.entries(blueprint.cost)) {
        if ((resources[res as keyof typeof resources] || 0) < (cost || 0)) {
          canAfford = false;
          break;
        }
      }

      if (!canAfford) {
        audioManager.playUIError();
        addChronicleEvent({
          title: 'Бракує ресурсів!',
          description: `Недостатньо матеріалів для зведення ${blueprint.name}.`,
          type: 'danger',
        });
        return;
      }

      for (const [res, cost] of Object.entries(blueprint.cost)) {
        consumeResource(res as any, cost || 0);
      }

      audioManager.playBuildingPlace(gx, gz);

      const buildingId = `building-${activeBuildType}-${Date.now()}`;
      const buildingH = grid.occupyForBuilding(gx, gz, blueprint.width, blueprint.height, buildingId);

      world.add({
        id: buildingId,
        name: blueprint.name,
        isBuilding: true,
        buildingType: activeBuildType,
        buildingHealth: blueprint.health,
        maxBuildingHealth: blueprint.health,
        buildingWidth: blueprint.width,
        buildingHeight: blueprint.height,
        isCompleted: false,
        constructionProgress: 0,
        gridPosition: [gx, gz],
        position: [gx + blueprint.width / 2, buildingH, gz + blueprint.height / 2],
        localInventory: { wood: 0 },
      });

      useGameStore.getState().incrementBuildingVersion();
      useGameStore.getState().incrementFoliageVersion();

      addPendingJob({
        id: `job-build-${buildingId}`,
        type: 'build_structure',
        targetPosition: [gx, gz],
        targetBuildingId: buildingId,
        progress: 0,
        totalWork: 30 + blueprint.width * blueprint.height * 10,
      });

      addChronicleEvent({
        title: 'Закладено фундамент',
        description: `Розпочато будівництво: ${blueprint.name}. Робітники вирушають на майданчик.`,
        type: 'info',
      });
      return;
    }

    if (activeTool === 'chop' && (tile.foliageType === 'tree' || tile.foliageType === 'fallen_tree')) {
      audioManager.playUIClick();
      const isFallen = tile.foliageType === 'fallen_tree';
      addPendingJob({
        id: `job-chop-${gx}-${gz}`,
        type: isFallen ? 'chop_fallen_log' : 'chop_tree',
        targetPosition: [gx, gz],
        progress: 0,
        totalWork: isFallen ? 45 : 55,
      });
      addChronicleEvent({
        title: isFallen ? 'Наказ: Розпил поваленого дерева' : 'Наказ: Лісоповал',
        description: isFallen
          ? `Призначено розпил поваленого стовбура на (${gx}, ${gz}).`
          : `Призначено вирубку дерева на координатах (${gx}, ${gz}).`,
        type: 'info',
      });
      return;
    }

    if (activeTool === 'mine' && tile.foliageType === 'rock') {
      audioManager.playUIClick();
      addPendingJob({
        id: `job-mine-${gx}-${gz}`,
        type: 'mine_rock',
        targetPosition: [gx, gz],
        progress: 0,
        totalWork: 35,
      });
      addChronicleEvent({
        title: 'Наказ: Видобуток каменю',
        description: `Призначено розкопку валуна на координатах (${gx}, ${gz}).`,
        type: 'info',
      });
      return;
    }

    if (tile.buildingId) {
      audioManager.playUIPanelOpen();
      useGameStore.getState().setSelectedEntityId(tile.buildingId);
    } else {
      if (useGameStore.getState().selectedEntityId) {
        audioManager.playUIPanelClose();
      }
      useGameStore.getState().setSelectedEntityId(null);
    }
  };

  return (
    <group 
      visible={!isStrategicView}
      onPointerMove={handlePointerMove} 
      onPointerDown={handlePointerDown}
      onContextMenu={(e) => {
        if (activeTool === 'road') {
          e.nativeEvent?.preventDefault?.();
        }
      }}
    >
      <mesh
        geometry={dioramaBaseGeometry}
        material={dioramaBaseMaterial}
        position={[grid.width / 2, -0.95, grid.height / 2]}
        receiveShadow
      />

      <mesh
        geometry={terrainGeometry}
        material={terrainMaterial}
        position={[grid.width / 2, 0, grid.height / 2]}
        rotation={[-Math.PI / 2, 0, 0]}
        receiveShadow
      />

      {(activeTool === 'build' || activeTool === 'road') && (
        <lineSegments geometry={buildGridLines}>
          <lineBasicMaterial
            color={activeTool === 'road' ? (roadEraseMode ? '#ef4444' : '#fbbf24') : '#ffffff'}
            transparent
            opacity={activeTool === 'road' ? 0.20 : 0.16}
          />
        </lineSegments>
      )}

      {hoveredTile && (
        <mesh
          position={[hoveredTile[0] + 0.5, 0.008, hoveredTile[1] + 0.5]}
          rotation={[-Math.PI / 2, 0, 0]}
        >
          <planeGeometry args={[0.96, 0.96]} />
          <meshBasicMaterial
            color={
              activeTool === 'road' && roadEraseMode
                ? '#ef4444'
                : activeTool === 'road'
                ? '#f59e0b'
                : '#fbbf24'
            }
            transparent
            opacity={activeTool === 'build' ? 0.35 : activeTool === 'road' ? 0.45 : 0.18}
            side={THREE.DoubleSide}
          />
        </mesh>
      )}

      {activeTool === 'road' && !roadEraseMode && snapNodes.map((node) => {
        const isStart = roadStartPoint && roadStartPoint[0] === node.x && roadStartPoint[1] === node.z;
        const isHovered = hoveredTile && hoveredTile[0] === node.x && hoveredTile[1] === node.z;
        const color = isStart ? '#22c55e' : isHovered ? '#fef08a' : '#f59e0b';
        const scale = isStart ? 1.25 : isHovered ? 1.15 : 1.0;

        return (
          <group key={node.id} position={[node.x + 0.5, 0.04, node.z + 0.5]} scale={[scale, scale, scale]}>
            <mesh rotation={[-Math.PI / 2, 0, 0]}>
              <ringGeometry args={[0.32, 0.44, 24]} />
              <meshBasicMaterial color={color} transparent opacity={isStart ? 0.95 : 0.8} side={THREE.DoubleSide} />
            </mesh>
            <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0.005, 0]}>
              <circleGeometry args={[0.22, 20]} />
              <meshBasicMaterial color={color} transparent opacity={isStart ? 0.7 : 0.45} side={THREE.DoubleSide} />
            </mesh>
            <mesh position={[0, 0.12, 0]} castShadow>
              <cylinderGeometry args={[0.06, 0.08, 0.24, 6]} />
              <meshStandardMaterial color={isStart ? '#15803d' : '#78350f'} roughness={0.8} />
            </mesh>
            <mesh position={[0, 0.24, 0]}>
              <sphereGeometry args={[0.07, 8, 8]} />
              <meshBasicMaterial color={color} />
            </mesh>
            {isHovered && (
              <Html position={[0, 0.48, 0]} center zIndexRange={[10, 0]} style={{ pointerEvents: 'none', userSelect: 'none' }}>
                <div className="bg-slate-950/90 text-amber-300 text-[10px] px-2 py-0.5 rounded border border-amber-500/60 whitespace-nowrap shadow-md backdrop-blur-sm">
                  {node.buildingName} (Вхід)
                </div>
              </Html>
            )}
          </group>
        );
      })}

      {activeTool === 'road' && roadStartPoint && (
        <group position={[roadStartPoint[0] + 0.5, 0.05, roadStartPoint[1] + 0.5]}>
          <mesh rotation={[-Math.PI / 2, 0, 0]}>
            <ringGeometry args={[0.38, 0.48, 24]} />
            <meshBasicMaterial color="#22c55e" transparent opacity={0.9} side={THREE.DoubleSide} />
          </mesh>
        </group>
      )}

      {activeTool === 'road' && roadPreviewPath.length > 0 && (
        <group>
          {roadPreviewPath.map(([px, pz], idx) => (
            <group key={`road-prev-${px}-${pz}-${idx}`} position={[px + 0.5, 0.03, pz + 0.5]}>
              <mesh rotation={[-Math.PI / 2, 0, 0]}>
                <planeGeometry args={[0.92, 0.92]} />
                <meshBasicMaterial color="#f59e0b" transparent opacity={0.55} side={THREE.DoubleSide} />
              </mesh>
              <mesh position={[0, 0.02, 0]}>
                <boxGeometry args={[0.2, 0.02, 0.2]} />
                <meshBasicMaterial color="#fbbf24" transparent opacity={0.8} />
              </mesh>
            </group>
          ))}
          {roadPreviewPath.length > 1 && (
            <Html
              position={[
                roadPreviewPath[roadPreviewPath.length - 1][0] + 0.5,
                0.6,
                roadPreviewPath[roadPreviewPath.length - 1][1] + 0.5,
              ]}
              center
              zIndexRange={[10, 0]}
              style={{ pointerEvents: 'none', userSelect: 'none' }}
            >
              <div className="bg-amber-950/95 text-amber-200 text-[11px] font-bold px-2.5 py-1 rounded-lg border border-amber-500/80 shadow-xl flex items-center gap-1.5 whitespace-nowrap backdrop-blur-md">
                <RoadIcon size={13} className="text-amber-300" />
                <span>Дорога: {roadPreviewPath.length} пл.</span>
                <span className="text-[9px] text-amber-400/80 font-normal">(Клік - збудувати)</span>
              </div>
            </Html>
          )}
        </group>
      )}
    </group>
  );
}
