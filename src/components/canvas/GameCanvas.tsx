import { Canvas } from '@react-three/fiber';
import { useMemo } from 'react';
import * as THREE from 'three';
import { GridMap } from '../../engine/grid/GridMap';
import { TopDownCamera } from './TopDownCamera';
import { DayNightLighting } from './DayNightLighting';
import { TerrainRenderer } from './TerrainRenderer';
import { FoliageRenderer } from './FoliageRenderer';
import { BuildingsRenderer } from './BuildingsRenderer';
import { UnitsRenderer } from './UnitsRenderer';
import { WoodChipsRenderer } from './WoodChipsRenderer';
import { PlacementPreview } from './PlacementPreview';
import { ResourceDepositsRenderer } from './ResourceDepositsRenderer';
import { StrategicParchmentMapRenderer } from './StrategicParchmentMapRenderer';
import { MapEdgeFog } from './MapEdgeFog';
import { MenuAmbientWalkers } from './MenuAmbientWalkers';
import { WeatherRenderer } from './WeatherRenderer';
import { SpatialAudioListener } from './SpatialAudioListener';

import { useGameStore } from '../../store/useGameStore';
import {
  DEFAULT_CAMERA_ZOOM,
  CAMERA_HEIGHT,
  CAMERA_INITIAL_OFFSET,
} from '../../constants/camera';

interface Props {
  grid: GridMap;
}

export function GameCanvas({ grid }: Props) {
  const playerSpawnPoint = useGameStore((state) => state.playerSpawnPoint);
  const cameraFocusTarget = useGameStore((state) => state.cameraFocusTarget);
  const cameraZoomTarget = useGameStore((state) => state.cameraZoomTarget);
  const isStrategicView = useGameStore((state) => state.isStrategicView);
  const center = useMemo<[number, number]>(() => cameraFocusTarget || playerSpawnPoint || [grid.width / 2, grid.height / 2], [cameraFocusTarget, playerSpawnPoint, grid.width, grid.height]);

  return (
    <div className="w-full h-full relative z-0" style={{ isolation: 'isolate' }}>
      <Canvas
        shadows="soft"
        dpr={[1, 2]}
        orthographic
        camera={{
          position: [center[0] + CAMERA_INITIAL_OFFSET, CAMERA_HEIGHT, center[1] + CAMERA_INITIAL_OFFSET],
          zoom: cameraZoomTarget ?? DEFAULT_CAMERA_ZOOM,
          near: -500,
          far: 3000,
        }}
        gl={{
          antialias: true,
          alpha: false,
          toneMapping: THREE.ACESFilmicToneMapping,
          toneMappingExposure: 1.0,
          outputColorSpace: THREE.SRGBColorSpace,
        }}
        className="w-full h-full cursor-crosshair"
      >
        <color attach="background" args={[isStrategicView ? '#18120c' : '#090d16']} />

        <MapEdgeFog mapWidth={grid.width} mapHeight={grid.height} />

        <TopDownCamera
          initialCenter={center}
          mapWidth={grid.width}
          mapHeight={grid.height}
        />

        <DayNightLighting />

        <TerrainRenderer grid={grid} />
        <ResourceDepositsRenderer grid={grid} />
        <BuildingsRenderer />
        <FoliageRenderer grid={grid} />
        <UnitsRenderer grid={grid} />
        <WoodChipsRenderer />
        <PlacementPreview grid={grid} />
        <WeatherRenderer />
        <StrategicParchmentMapRenderer grid={grid} />
        <MenuAmbientWalkers grid={grid} />
        <SpatialAudioListener />
      </Canvas>
    </div>
  );
}
