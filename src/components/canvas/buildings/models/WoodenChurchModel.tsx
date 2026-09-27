import { useMemo, type RefObject } from 'react';
import * as THREE from 'three';
import { SHARED_BUILDING_MATS } from '../buildingMaterials';
import {
  MedievalDoor,
  GothicLancetWindow,
  GothicButtress,
} from '../common/BuildingPrimitives';

function StoneGableWall({
  position,
  rotation,
  baseWidth = 4.72,
  height = 1.6,
  thickness = 0.14,
}: {
  position: [number, number, number];
  rotation?: [number, number, number];
  baseWidth?: number;
  height?: number;
  thickness?: number;
}) {
  const mats = SHARED_BUILDING_MATS;
  const half = baseWidth / 2;

  const geo = useMemo(() => {
    const geom = new THREE.BufferGeometry();
    const halfT = thickness / 2;
    const uScale = 2.0 / 4.72;
    const vScale = 2.0 / 1.6;

    const positions = [
      -half, 0, halfT,
      half, 0, halfT,
      0, height, halfT,

      half, 0, -halfT,
      -half, 0, -halfT,
      0, height, -halfT,

      -half, 0, -halfT,
      half, 0, -halfT,
      half, 0, halfT,

      -half, 0, -halfT,
      half, 0, halfT,
      -half, 0, halfT,

      -half, 0, halfT,
      0, height, halfT,
      0, height, -halfT,

      -half, 0, halfT,
      0, height, -halfT,
      -half, 0, -halfT,

      half, 0, -halfT,
      0, height, -halfT,
      0, height, halfT,

      half, 0, -halfT,
      0, height, halfT,
      half, 0, halfT,
    ];

    const uvs = [
      0, 1.96 * vScale,
      baseWidth * uScale, 1.96 * vScale,
      half * uScale, (1.96 + height) * vScale,

      baseWidth * uScale, 1.96 * vScale,
      0, 1.96 * vScale,
      half * uScale, (1.96 + height) * vScale,

      0, 0,
      1, 0,
      1, 1,
      0, 0,
      1, 1,
      0, 1,

      0, 0,
      1, 0,
      1, 1,
      0, 0,
      1, 1,
      0, 1,

      0, 0,
      1, 0,
      1, 1,
      0, 0,
      1, 1,
      0, 1,
    ];

    geom.setAttribute('position', new THREE.Float32BufferAttribute(positions, 3));
    geom.setAttribute('uv', new THREE.Float32BufferAttribute(uvs, 2));
    geom.computeVertexNormals();
    return geom;
  }, [baseWidth, height, thickness, half]);

  const slopeAngle = Math.atan2(height, half);
  const hypotenuse = Math.sqrt(half * half + height * height);

  return (
    <group position={position} rotation={rotation}>
      <mesh geometry={geo} material={mats.stoneLight} castShadow receiveShadow />
      <mesh
        material={mats.gothicTrim}
        position={[-half / 2, height / 2, 0]}
        rotation={[0, 0, slopeAngle]}
        castShadow
      >
        <boxGeometry args={[hypotenuse + 0.1, 0.10, thickness + 0.05]} />
      </mesh>
      <mesh
        material={mats.gothicTrim}
        position={[half / 2, height / 2, 0]}
        rotation={[0, 0, -slopeAngle]}
        castShadow
      >
        <boxGeometry args={[hypotenuse + 0.1, 0.10, thickness + 0.05]} />
      </mesh>
    </group>
  );
}

export function WoodenChurchModel({
  isLightOn = false,
  roofRef,
}: {
  isLightOn?: boolean;
  roofRef?: RefObject<THREE.Group | null>;
}) {
  const mats = SHARED_BUILDING_MATS;

  return (
    <group>

      <mesh material={mats.stoneDark} position={[0, 0.06, 0]} castShadow receiveShadow>
        <boxGeometry args={[4.88, 0.12, 2.88]} />
      </mesh>
      <mesh material={mats.floorPlanks} position={[0, 0.13, 0]} receiveShadow>
        <boxGeometry args={[4.72, 0.04, 2.72]} />
      </mesh>

      <mesh material={mats.velvetRed} position={[0, 0.155, 0.15]} receiveShadow>
        <boxGeometry args={[0.85, 0.005, 2.35]} />
      </mesh>

      <mesh material={mats.stoneLight} position={[0, 1.04, -1.36]} castShadow receiveShadow>
        <boxGeometry args={[4.72, 1.8, 0.14]} />
      </mesh>

      <mesh material={mats.stoneLight} position={[-2.36, 1.04, 0]} castShadow receiveShadow>
        <boxGeometry args={[0.14, 1.8, 2.72]} />
      </mesh>

      <mesh material={mats.stoneLight} position={[2.36, 1.04, 0]} castShadow receiveShadow>
        <boxGeometry args={[0.14, 1.8, 2.72]} />
      </mesh>

      <mesh material={mats.stoneLight} position={[-1.43, 1.04, 1.36]} castShadow receiveShadow>
        <boxGeometry args={[1.86, 1.8, 0.14]} />
      </mesh>
      <mesh material={mats.stoneLight} position={[1.43, 1.04, 1.36]} castShadow receiveShadow>
        <boxGeometry args={[1.86, 1.8, 0.14]} />
      </mesh>
      <mesh material={mats.stoneLight} position={[0, 1.62, 1.36]} castShadow receiveShadow>
        <boxGeometry args={[1.00, 0.64, 0.14]} />
      </mesh>

      <mesh material={mats.gothicTrim} position={[0, 1.96, -1.36]} castShadow>
        <boxGeometry args={[4.88, 0.08, 0.20]} />
      </mesh>
      <mesh material={mats.gothicTrim} position={[-2.36, 1.96, 0]} castShadow>
        <boxGeometry args={[0.20, 0.08, 2.88]} />
      </mesh>
      <mesh material={mats.gothicTrim} position={[2.36, 1.96, 0]} castShadow>
        <boxGeometry args={[0.20, 0.08, 2.88]} />
      </mesh>
      <mesh material={mats.gothicTrim} position={[0, 1.96, 1.36]} castShadow>
        <boxGeometry args={[4.88, 0.08, 0.20]} />
      </mesh>

      {[-0.75, 0.75].map((pz, idx) => (
        <GothicButtress
          key={`buttress-l-${idx}`}
          position={[-2.44, 0.12, pz]}
          rotation={[0, -Math.PI / 2, 0]}
          height={1.8}
        />
      ))}

      {[-0.75, 0.75].map((pz, idx) => (
        <GothicButtress
          key={`buttress-r-${idx}`}
          position={[2.44, 0.12, pz]}
          rotation={[0, Math.PI / 2, 0]}
          height={1.8}
        />
      ))}

      <GothicButtress position={[-2.36, 0.12, 1.44]} rotation={[0, 0, 0]} height={1.8} />
      <GothicButtress position={[2.36, 0.12, 1.44]} rotation={[0, 0, 0]} height={1.8} />
      <GothicButtress position={[-2.36, 0.12, -1.44]} rotation={[0, Math.PI, 0]} height={1.8} />
      <GothicButtress position={[2.36, 0.12, -1.44]} rotation={[0, Math.PI, 0]} height={1.8} />

      <MedievalDoor position={[0, 0.14, 1.36]} isDouble={true} width={1.00} height={1.35} />

      <group position={[0, 1.66, 1.43]}>
        <mesh material={mats.gothicTrim} castShadow>
          <torusGeometry args={[0.22, 0.035, 8, 16]} />
        </mesh>
        <mesh material={isLightOn ? mats.windowLit : mats.windowUnlit} position={[0, 0, -0.02]}>
          <cylinderGeometry args={[0.20, 0.20, 0.03, 12]} />
        </mesh>
        <mesh material={mats.goldTrim} position={[0, 0, 0.01]}>
          <torusGeometry args={[0.10, 0.015, 6, 12]} />
        </mesh>
      </group>

      {[-0.7, 0.7].map((pz, idx) => (
        <GothicLancetWindow
          key={`win-l-${idx}`}
          position={[-2.42, 1.15, pz]}
          rotation={[0, -Math.PI / 2, 0]}
          width={0.48}
          height={0.95}
          isLightOn={isLightOn}
        />
      ))}

      {[-0.7, 0.7].map((pz, idx) => (
        <GothicLancetWindow
          key={`win-r-${idx}`}
          position={[2.42, 1.15, pz]}
          rotation={[0, Math.PI / 2, 0]}
          width={0.48}
          height={0.95}
          isLightOn={isLightOn}
        />
      ))}

      <GothicLancetWindow
        position={[0, 1.25, -1.42]}
        rotation={[0, Math.PI, 0]}
        width={0.60}
        height={1.1}
        isLightOn={isLightOn}
      />

      <group position={[0, 0.14, -0.85]}>

        <mesh material={mats.stoneLight} position={[0, 0.06, 0]} castShadow receiveShadow>
          <boxGeometry args={[2.2, 0.12, 0.85]} />
        </mesh>
        <mesh material={mats.stoneLight} position={[0, 0.16, -0.06]} castShadow receiveShadow>
          <boxGeometry args={[1.7, 0.10, 0.65]} />
        </mesh>

        <mesh material={mats.stoneLight} position={[0, 0.40, -0.08]} castShadow receiveShadow>
          <boxGeometry args={[1.35, 0.38, 0.50]} />
        </mesh>

        <mesh material={mats.clothWhite} position={[0, 0.60, -0.08]} castShadow>
          <boxGeometry args={[1.42, 0.025, 0.55]} />
        </mesh>

        <mesh material={mats.velvetRed} position={[0, 0.615, -0.08]}>
          <boxGeometry args={[0.55, 0.01, 0.57]} />
        </mesh>

        <group position={[0, 0.92, -0.10]}>
          <mesh material={mats.goldTrim} position={[0, 0, 0]} castShadow>
            <boxGeometry args={[0.045, 0.55, 0.045]} />
          </mesh>
          <mesh material={mats.goldTrim} position={[0, 0.10, 0]} castShadow>
            <boxGeometry args={[0.30, 0.045, 0.045]} />
          </mesh>
          <mesh material={mats.goldTrim} position={[0, -0.25, 0]} castShadow>
            <cylinderGeometry args={[0.07, 0.10, 0.05, 8]} />
          </mesh>
        </group>

        <group position={[-0.55, 0.64, -0.08]}>
          <mesh material={mats.goldTrim} position={[0, 0.06, 0]} castShadow>
            <cylinderGeometry args={[0.025, 0.05, 0.12, 8]} />
          </mesh>
          <mesh material={mats.candleGlow} position={[0, 0.15, 0]}>
            <cylinderGeometry args={[0.015, 0.015, 0.09, 6]} />
          </mesh>
          <pointLight color="#fde047" intensity={0.7} distance={2.5} position={[0, 0.22, 0]} />
        </group>
        <group position={[0.55, 0.64, -0.08]}>
          <mesh material={mats.goldTrim} position={[0, 0.06, 0]} castShadow>
            <cylinderGeometry args={[0.025, 0.05, 0.12, 8]} />
          </mesh>
          <mesh material={mats.candleGlow} position={[0, 0.15, 0]}>
            <cylinderGeometry args={[0.015, 0.015, 0.09, 6]} />
          </mesh>
          <pointLight color="#fde047" intensity={0.7} distance={2.5} position={[0, 0.22, 0]} />
        </group>

        <group position={[-1.55, 0.35, -0.35]}>
          <mesh material={mats.timberDark} position={[0, 0.28, 0]} castShadow>
            <boxGeometry args={[0.45, 0.56, 0.45]} />
          </mesh>
          <mesh material={mats.timberLight} position={[0, 0.58, 0]} rotation={[0.2, 0, 0]} castShadow>
            <boxGeometry args={[0.42, 0.04, 0.32]} />
          </mesh>
        </group>
      </group>

      {[-0.05, 0.55].map((z, idx) => (
        <group key={`pew-left-${idx}`} position={[-1.25, 0.14, z]}>
          <mesh material={mats.timberDark} position={[0, 0.22, 0]} castShadow receiveShadow>
            <boxGeometry args={[1.25, 0.04, 0.26]} />
          </mesh>
          <mesh material={mats.timberDark} position={[0, 0.40, 0.11]} rotation={[0.1, 0, 0]} castShadow>
            <boxGeometry args={[1.25, 0.34, 0.03]} />
          </mesh>
          <mesh material={mats.timberDark} position={[0, 0.38, -0.13]} castShadow>
            <boxGeometry args={[1.18, 0.03, 0.06]} />
          </mesh>
          <mesh material={mats.timberDark} position={[-0.60, 0.30, 0]} castShadow>
            <boxGeometry args={[0.05, 0.56, 0.30]} />
          </mesh>
          <mesh material={mats.timberDark} position={[0.60, 0.30, 0]} castShadow>
            <boxGeometry args={[0.05, 0.56, 0.30]} />
          </mesh>
        </group>
      ))}

      {[-0.05, 0.55].map((z, idx) => (
        <group key={`pew-right-${idx}`} position={[1.25, 0.14, z]}>
          <mesh material={mats.timberDark} position={[0, 0.22, 0]} castShadow receiveShadow>
            <boxGeometry args={[1.25, 0.04, 0.26]} />
          </mesh>
          <mesh material={mats.timberDark} position={[0, 0.40, 0.11]} rotation={[0.1, 0, 0]} castShadow>
            <boxGeometry args={[1.25, 0.34, 0.03]} />
          </mesh>
          <mesh material={mats.timberDark} position={[0, 0.38, -0.13]} castShadow>
            <boxGeometry args={[1.18, 0.03, 0.06]} />
          </mesh>
          <mesh material={mats.timberDark} position={[-0.60, 0.30, 0]} castShadow>
            <boxGeometry args={[0.05, 0.56, 0.30]} />
          </mesh>
          <mesh material={mats.timberDark} position={[0.60, 0.30, 0]} castShadow>
            <boxGeometry args={[0.05, 0.56, 0.30]} />
          </mesh>
        </group>
      ))}

      <group ref={roofRef}>
        <StoneGableWall position={[0, 1.96, -1.36]} rotation={[0, Math.PI, 0]} />
        <StoneGableWall position={[0, 1.96, 1.36]} rotation={[0, 0, 0]} />

        <mesh
          material={mats.timberPlanks}
          position={[-1.18, 2.80, 0]}
          rotation={[0, 0, 0.595]}
          castShadow
          receiveShadow
        >
          <boxGeometry args={[2.92, 0.10, 3.02]} />
        </mesh>
        <mesh
          material={mats.timberDark}
          position={[-2.40, 1.97, 0]}
          rotation={[0, 0, 0.595]}
          castShadow
        >
          <boxGeometry args={[0.14, 0.12, 3.06]} />
        </mesh>

        <mesh
          material={mats.timberPlanks}
          position={[1.18, 2.80, 0]}
          rotation={[0, 0, -0.595]}
          castShadow
          receiveShadow
        >
          <boxGeometry args={[2.92, 0.10, 3.02]} />
        </mesh>
        <mesh
          material={mats.timberDark}
          position={[2.40, 1.97, 0]}
          rotation={[0, 0, -0.595]}
          castShadow
        >
          <boxGeometry args={[0.14, 0.12, 3.06]} />
        </mesh>

        <mesh material={mats.timberDark} position={[0, 3.60, 0]} castShadow>
          <boxGeometry args={[0.16, 0.16, 3.08]} />
        </mesh>

        {[-1.36, 1.36].map((gz) => (
          <group key={`ch-finial-${gz}`} position={[0, 3.66, gz]}>
            <mesh material={mats.timberDark} castShadow>
              <boxGeometry args={[0.07, 0.38, 0.07]} />
            </mesh>
            <mesh material={mats.timberDark} position={[0, 0.09, 0]} castShadow>
              <boxGeometry args={[0.22, 0.05, 0.05]} />
            </mesh>
          </group>
        ))}

        <group position={[0, 1.96, 0.6]}>

          <mesh material={mats.stoneLight} position={[0, 0.8, 0]} castShadow receiveShadow>
            <boxGeometry args={[1.35, 1.6, 1.35]} />
          </mesh>
          <mesh material={mats.gothicTrim} position={[0, 1.63, 0]} castShadow>
            <boxGeometry args={[1.46, 0.06, 1.46]} />
          </mesh>

          <group position={[0, 2.05, 0]}>
            <mesh material={mats.timberDark} position={[-0.55, 0, -0.55]} castShadow>
              <boxGeometry args={[0.10, 0.75, 0.10]} />
            </mesh>
            <mesh material={mats.timberDark} position={[0.55, 0, -0.55]} castShadow>
              <boxGeometry args={[0.10, 0.75, 0.10]} />
            </mesh>
            <mesh material={mats.timberDark} position={[-0.55, 0, 0.55]} castShadow>
              <boxGeometry args={[0.10, 0.75, 0.10]} />
            </mesh>
            <mesh material={mats.timberDark} position={[0.55, 0, 0.55]} castShadow>
              <boxGeometry args={[0.10, 0.75, 0.10]} />
            </mesh>
            <mesh material={mats.timberDark} position={[0, 0.38, 0]} castShadow>
              <boxGeometry args={[1.25, 0.06, 1.25]} />
            </mesh>

            <mesh material={mats.goldTrim} position={[0, 0.04, 0]} castShadow>
              <cylinderGeometry args={[0.15, 0.24, 0.30, 10]} />
            </mesh>
            <mesh material={mats.ironHardware} position={[0, 0.22, 0]}>
              <cylinderGeometry args={[0.025, 0.025, 0.09, 6]} />
            </mesh>
          </group>

          <mesh material={mats.timberDark} position={[0, 3.25, 0]} castShadow receiveShadow>
            <coneGeometry args={[1.0, 1.8, 8]} />
          </mesh>

          <group position={[0, 4.35, 0]}>
            <mesh material={mats.ironSteel} position={[0, 0, 0]} castShadow>
              <boxGeometry args={[0.05, 0.65, 0.05]} />
            </mesh>
            <mesh material={mats.ironSteel} position={[0, 0.14, 0]} castShadow>
              <boxGeometry args={[0.38, 0.05, 0.05]} />
            </mesh>
            <mesh material={mats.goldTrim} position={[0, 0.14, 0]}>
              <sphereGeometry args={[0.05, 8, 8]} />
            </mesh>
          </group>
        </group>
      </group>
    </group>
  );
}

