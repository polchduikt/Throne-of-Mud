import { useRef, useMemo } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';
import { useGameStore } from '../../store/useGameStore';

interface LightingKey {
  hour: number;
  sunColor: THREE.Color;
  sunIntensity: number;
  ambientColor: THREE.Color;
  ambientIntensity: number;
  hemiSkyColor: THREE.Color;
  hemiGroundColor: THREE.Color;
}

export function DayNightLighting() {
  const sunLightRef = useRef<THREE.DirectionalLight>(null);
  const ambientLightRef = useRef<THREE.AmbientLight>(null);
  const hemiLightRef = useRef<THREE.HemisphereLight>(null);

  const lightTarget = useMemo(() => {
    const obj = new THREE.Object3D();
    obj.position.set(24, 0, 24);
    return obj;
  }, []);

  const timeline = useMemo<LightingKey[]>(() => [
    {
      hour: 0,
      sunColor: new THREE.Color('#93c5fd'),
      sunIntensity: 0.50,
      ambientColor: new THREE.Color('#475569'),
      ambientIntensity: 0.45,
      hemiSkyColor: new THREE.Color('#64748b'),
      hemiGroundColor: new THREE.Color('#334155'),
    },
    {
      hour: 5.0,
      sunColor: new THREE.Color('#f97316'),
      sunIntensity: 0.65,
      ambientColor: new THREE.Color('#334155'),
      ambientIntensity: 0.38,
      hemiSkyColor: new THREE.Color('#475569'),
      hemiGroundColor: new THREE.Color('#1e293b'),
    },
    {
      hour: 6.5,
      sunColor: new THREE.Color('#f59e0b'),
      sunIntensity: 1.15,
      ambientColor: new THREE.Color('#64748b'),
      ambientIntensity: 0.42,
      hemiSkyColor: new THREE.Color('#fef08a'),
      hemiGroundColor: new THREE.Color('#334155'),
    },
    {
      hour: 8.5,
      sunColor: new THREE.Color('#fef08a'),
      sunIntensity: 1.30,
      ambientColor: new THREE.Color('#cbd5e1'),
      ambientIntensity: 0.46,
      hemiSkyColor: new THREE.Color('#fef9c3'),
      hemiGroundColor: new THREE.Color('#334155'),
    },
    {
      hour: 12.0,
      sunColor: new THREE.Color('#fff3cd'),
      sunIntensity: 1.35,
      ambientColor: new THREE.Color('#e2e8f0'),
      ambientIntensity: 0.48,
      hemiSkyColor: new THREE.Color('#fef9c3'),
      hemiGroundColor: new THREE.Color('#334155'),
    },
    {
      hour: 16.5,
      sunColor: new THREE.Color('#fed7aa'),
      sunIntensity: 1.30,
      ambientColor: new THREE.Color('#cbd5e1'),
      ambientIntensity: 0.46,
      hemiSkyColor: new THREE.Color('#fed7aa'),
      hemiGroundColor: new THREE.Color('#334155'),
    },
    {
      hour: 18.5,
      sunColor: new THREE.Color('#f97316'),
      sunIntensity: 1.15,
      ambientColor: new THREE.Color('#64748b'),
      ambientIntensity: 0.42,
      hemiSkyColor: new THREE.Color('#fca5a5'),
      hemiGroundColor: new THREE.Color('#334155'),
    },
    {
      hour: 20.5,
      sunColor: new THREE.Color('#818cf8'),
      sunIntensity: 0.55,
      ambientColor: new THREE.Color('#334155'),
      ambientIntensity: 0.38,
      hemiSkyColor: new THREE.Color('#475569'),
      hemiGroundColor: new THREE.Color('#1e293b'),
    },
    {
      hour: 24.0,
      sunColor: new THREE.Color('#93c5fd'),
      sunIntensity: 0.50,
      ambientColor: new THREE.Color('#475569'),
      ambientIntensity: 0.45,
      hemiSkyColor: new THREE.Color('#64748b'),
      hemiGroundColor: new THREE.Color('#334155'),
    },
  ], []);

  useFrame(() => {
    const { time } = useGameStore.getState();
    const currentHour = (time.hour + time.minute / 60) % 24;

    let k0 = timeline[0];
    let k1 = timeline[timeline.length - 1];

    for (let i = 0; i < timeline.length - 1; i++) {
      if (currentHour >= timeline[i].hour && currentHour <= timeline[i + 1].hour) {
        k0 = timeline[i];
        k1 = timeline[i + 1];
        break;
      }
    }

    const span = k1.hour - k0.hour;
    const progress = span > 0 ? (currentHour - k0.hour) / span : 0;
    const smoothT = progress * progress * (3 - 2 * progress);

    const sunCol = k0.sunColor.clone().lerp(k1.sunColor, smoothT);
    let sunInt = THREE.MathUtils.lerp(k0.sunIntensity, k1.sunIntensity, smoothT);

    const ambCol = k0.ambientColor.clone().lerp(k1.ambientColor, smoothT);
    let ambInt = THREE.MathUtils.lerp(k0.ambientIntensity, k1.ambientIntensity, smoothT);

    const hemiSky = k0.hemiSkyColor.clone().lerp(k1.hemiSkyColor, smoothT);
    const hemiGnd = k0.hemiGroundColor.clone().lerp(k1.hemiGroundColor, smoothT);

    const season = time.season;
    if (season === 'Winter') {
      sunCol.lerp(new THREE.Color('#dbeafe'), 0.18);
      ambCol.lerp(new THREE.Color('#93c5fd'), 0.20);
      hemiGnd.lerp(new THREE.Color('#bfdbfe'), 0.35);
      sunInt *= 0.92;
      ambInt *= 1.12;
    } else if (season === 'Autumn') {
      sunCol.lerp(new THREE.Color('#f59e0b'), 0.15);
      ambCol.lerp(new THREE.Color('#78350f'), 0.12);
    } else if (season === 'Spring') {
      sunCol.lerp(new THREE.Color('#fef08a'), 0.08);
    }

    const { rainIntensity = 0, stormIntensity = 0, snowIntensity = 0, lightningFlash = 0 } = time;

    if (rainIntensity > 0.005) {
      const rainWeight = rainIntensity * 0.40;
      sunCol.lerp(new THREE.Color('#94a3b8'), rainWeight);
      ambCol.lerp(new THREE.Color('#475569'), rainWeight * 0.85);
      sunInt *= THREE.MathUtils.lerp(1.0, 0.65, rainIntensity);
      ambInt *= THREE.MathUtils.lerp(1.0, 0.90, rainIntensity);
    }

    if (stormIntensity > 0.005) {
      const stormWeight = stormIntensity * 0.50;
      sunCol.lerp(new THREE.Color('#505c6e'), stormWeight);
      ambCol.lerp(new THREE.Color('#252e3d'), stormWeight * 0.85);
      sunInt *= THREE.MathUtils.lerp(1.0, 0.45, stormIntensity);
      ambInt *= THREE.MathUtils.lerp(1.0, 0.80, stormIntensity);

      if (lightningFlash > 0.01) {
        sunCol.lerp(new THREE.Color('#ffffff'), lightningFlash);
        ambCol.lerp(new THREE.Color('#e0f2fe'), lightningFlash);
        sunInt += lightningFlash * 4.2;
        ambInt += lightningFlash * 2.2;
      }
    }

    if (snowIntensity > 0.005) {
      const snowWeight = snowIntensity * 0.35;
      sunCol.lerp(new THREE.Color('#cbd5e1'), snowWeight);
      ambCol.lerp(new THREE.Color('#64748b'), snowWeight * 0.70);
      hemiGnd.lerp(new THREE.Color('#e2e8f0'), snowWeight * 0.80);
      sunInt *= THREE.MathUtils.lerp(1.0, 0.75, snowIntensity);
      ambInt *= THREE.MathUtils.lerp(1.0, 1.10, snowIntensity);
    }

    ambInt = Math.max(0.42, ambInt);
    sunInt = Math.max(0.25, sunInt);

    if (sunLightRef.current) {
      sunLightRef.current.color.copy(sunCol);
      sunLightRef.current.intensity = sunInt;
    }

    if (ambientLightRef.current) {
      ambientLightRef.current.color.copy(ambCol);
      ambientLightRef.current.intensity = ambInt;
    }

    if (hemiLightRef.current) {
      hemiLightRef.current.color.copy(hemiSky);
      hemiLightRef.current.groundColor.copy(hemiGnd);
    }
  });

  return (
    <>
      <ambientLight ref={ambientLightRef} intensity={0.48} />
      <hemisphereLight
        ref={hemiLightRef}
        args={['#fef9c3', '#334155', 0.22]}
      />
      <primitive object={lightTarget} />
      <directionalLight
        ref={sunLightRef}
        target={lightTarget}
        position={[24 + 18, 36, 24 + 20]}
        intensity={1.35}
        castShadow
        shadow-mapSize-width={2048}
        shadow-mapSize-height={2048}
        shadow-camera-near={0.5}
        shadow-camera-far={130}
        shadow-camera-left={-34}
        shadow-camera-right={34}
        shadow-camera-top={34}
        shadow-camera-bottom={-34}
        shadow-bias={-0.0004}
        shadow-normalBias={0.02}
      />
    </>
  );
}
