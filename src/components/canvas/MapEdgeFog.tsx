import { useMemo, useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';
import { useGameStore } from '../../store/useGameStore';

interface Props {
  mapWidth?: number;
  mapHeight?: number;
}

export function MapEdgeFog({ mapWidth = 256, mapHeight = 256 }: Props) {
  const isStrategicView = useGameStore((s) => s.isStrategicView);
  const seaTexRef = useRef<THREE.Texture | null>(null);

  const fogTexture = useMemo(() => {
    const SIZE = 2048;
    const canvas = document.createElement('canvas');
    canvas.width  = SIZE;
    canvas.height = SIZE;
    const ctx = canvas.getContext('2d')!;

    const PLANE_W = mapWidth  * 6;
    const PLANE_H = mapHeight * 6;

    const u0 = (PLANE_W / 2 - mapWidth  / 2) / PLANE_W;
    const u1 = (PLANE_W / 2 + mapWidth  / 2) / PLANE_W;
    const v0 = (PLANE_H / 2 - mapHeight / 2) / PLANE_H;
    const v1 = (PLANE_H / 2 + mapHeight / 2) / PLANE_H;

    const px0 = Math.round(u0 * SIZE);
    const px1 = Math.round(u1 * SIZE);
    const py0 = Math.round(v0 * SIZE);
    const py1 = Math.round(v1 * SIZE);
    const pw  = px1 - px0;
    const ph  = py1 - py0;

    const FADE_NORTH = 32;
    const FADE_OTHER = 24;

    const DARK  = 'rgba(5, 8, 15, 1)';
    const CLEAR = 'rgba(5, 8, 15, 0)';

    ctx.fillStyle = DARK;
    ctx.fillRect(0,    0,           px0,          SIZE);
    ctx.fillRect(px1,  0,           SIZE - px1,   SIZE);
    ctx.fillRect(px0,  0,           pw,           py0);
    ctx.fillRect(px0,  py1,         pw,           SIZE - py1);

    let g = ctx.createLinearGradient(px0, 0, px0 + FADE_OTHER, 0);
    g.addColorStop(0.0, DARK);
    g.addColorStop(1.0, CLEAR);
    ctx.fillStyle = g;
    ctx.fillRect(px0, py0, FADE_OTHER, ph);

    g = ctx.createLinearGradient(px1 - FADE_OTHER, 0, px1, 0);
    g.addColorStop(0.0, CLEAR);
    g.addColorStop(1.0, DARK);
    ctx.fillStyle = g;
    ctx.fillRect(px1 - FADE_OTHER, py0, FADE_OTHER, ph);

    const gNorth = ctx.createLinearGradient(0, py0, 0, py0 + FADE_NORTH);
    gNorth.addColorStop(0.0, DARK);
    gNorth.addColorStop(0.12, DARK);
    gNorth.addColorStop(1.0, CLEAR);
    ctx.fillStyle = gNorth;
    ctx.fillRect(px0, py0, pw, FADE_NORTH);

    g = ctx.createLinearGradient(0, py1 - FADE_OTHER, 0, py1);
    g.addColorStop(0.0, CLEAR);
    g.addColorStop(1.0, DARK);
    ctx.fillStyle = g;
    ctx.fillRect(px0, py1 - FADE_OTHER, pw, FADE_OTHER);

    const maxNW = Math.max(FADE_OTHER, FADE_NORTH);
    let rg = ctx.createRadialGradient(px0, py0, 0, px0, py0, maxNW);
    rg.addColorStop(0.0, DARK);
    rg.addColorStop(0.15, DARK);
    rg.addColorStop(1.0, CLEAR);
    ctx.fillStyle = rg;
    ctx.fillRect(px0, py0, FADE_OTHER, FADE_NORTH);

    const maxNE = Math.max(FADE_OTHER, FADE_NORTH);
    rg = ctx.createRadialGradient(px1, py0, 0, px1, py0, maxNE);
    rg.addColorStop(0.0, DARK);
    rg.addColorStop(0.15, DARK);
    rg.addColorStop(1.0, CLEAR);
    ctx.fillStyle = rg;
    ctx.fillRect(px1 - FADE_OTHER, py0, FADE_OTHER, FADE_NORTH);

    rg = ctx.createRadialGradient(px0, py1, 0, px0, py1, FADE_OTHER);
    rg.addColorStop(0.0, DARK);
    rg.addColorStop(0.15, DARK);
    rg.addColorStop(1.0, CLEAR);
    ctx.fillStyle = rg;
    ctx.fillRect(px0, py1 - FADE_OTHER, FADE_OTHER, FADE_OTHER);

    rg = ctx.createRadialGradient(px1, py1, 0, px1, py1, FADE_OTHER);
    rg.addColorStop(0.0, DARK);
    rg.addColorStop(0.15, DARK);
    rg.addColorStop(1.0, CLEAR);
    ctx.fillStyle = rg;
    ctx.fillRect(px1 - FADE_OTHER, py1 - FADE_OTHER, FADE_OTHER, FADE_OTHER);

    const tex = new THREE.CanvasTexture(canvas);
    tex.colorSpace = THREE.SRGBColorSpace;
    return tex;
  }, [mapWidth, mapHeight]);

  const seaTexture = useMemo(() => {
    const SIZE = 512;
    const canvas = document.createElement('canvas');
    canvas.width = SIZE; canvas.height = SIZE;
    const ctx = canvas.getContext('2d')!;

    ctx.fillStyle = '#030508';
    ctx.fillRect(0, 0, SIZE, SIZE);

    ctx.strokeStyle = 'rgba(16, 28, 50, 0.25)';
    ctx.lineWidth = 1;
    for (let i = 0; i < 55; i++) {
      ctx.beginPath();
      ctx.arc(Math.random() * SIZE, Math.random() * SIZE, 18 + Math.random() * 45, Math.PI * 0.5, Math.PI * 1.7);
      ctx.stroke();
    }
    ctx.fillStyle = 'rgba(25, 55, 110, 0.09)';
    for (let i = 0; i < 200; i++) {
      ctx.beginPath();
      ctx.arc(Math.random() * SIZE, Math.random() * SIZE, Math.random() * 1.3 + 0.3, 0, Math.PI * 2);
      ctx.fill();
    }

    const tex = new THREE.CanvasTexture(canvas);
    tex.wrapS = tex.wrapT = THREE.RepeatWrapping;
    tex.repeat.set(10, 10);
    tex.colorSpace = THREE.SRGBColorSpace;
    seaTexRef.current = tex;
    return tex;
  }, []);

  useFrame((_, delta) => {
    if (seaTexRef.current) {
      seaTexRef.current.offset.x += delta * 0.003;
      seaTexRef.current.offset.y += delta * 0.0015;
      seaTexRef.current.needsUpdate = true;
    }
  });

  const cx      = mapWidth  / 2;
  const cz      = mapHeight / 2;
  const PLANE_W = mapWidth  * 6;
  const PLANE_H = mapHeight * 6;

  if (isStrategicView) return null;

  return (
    <group>
      <mesh
        position={[cx, -0.5, cz]}
        rotation={[-Math.PI / 2, 0, 0]}
        renderOrder={-10}
      >
        <planeGeometry args={[PLANE_W, PLANE_H]} />
        <meshBasicMaterial map={seaTexture} color="#03050a" toneMapped={false} />
      </mesh>

      <mesh
        position={[cx, 0.45, cz]}
        rotation={[-Math.PI / 2, 0, 0]}
        renderOrder={11}
      >
        <planeGeometry args={[PLANE_W, PLANE_H]} />
        <meshBasicMaterial
          map={fogTexture}
          transparent
          depthWrite={false}
          toneMapped={false}
        />
      </mesh>

      <mesh
        position={[cx, 8.0, cz]}
        rotation={[-Math.PI / 2, 0, 0]}
        renderOrder={12}
      >
        <planeGeometry args={[PLANE_W, PLANE_H]} />
        <meshBasicMaterial
          map={fogTexture}
          transparent
          depthWrite={false}
          toneMapped={false}
        />
      </mesh>
    </group>
  );
}
