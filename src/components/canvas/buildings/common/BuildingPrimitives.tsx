import { useRef, useMemo } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';
import { characterEntities } from '../../../../engine/ecs/world';
import { SHARED_BUILDING_MATS } from '../buildingMaterials';

export function TriangularGable({
  baseWidth,
  height,
  thickness = 0.12,
  position = [0, 0, 0],
  rotation = [0, 0, 0],
  material = SHARED_BUILDING_MATS.wattleDaub,
}: {
  baseWidth: number;
  height: number;
  thickness?: number;
  position?: [number, number, number];
  rotation?: [number, number, number];
  material?: THREE.Material;
}) {
  const mats = SHARED_BUILDING_MATS;
  const half = baseWidth / 2;
  const shape = useMemo(() => {
    const s = new THREE.Shape();
    s.moveTo(-half, 0);
    s.lineTo(half, 0);
    s.lineTo(0, height);
    s.closePath();
    return s;
  }, [half, height]);

  const slopeAngle = Math.atan2(height, half);
  const hypotenuse = Math.sqrt(half * half + height * height);

  return (
    <group position={position} rotation={rotation}>
      <mesh material={material} castShadow receiveShadow>
        <extrudeGeometry args={[shape, { depth: thickness, bevelEnabled: false }]} />
      </mesh>
      <mesh material={mats.timberDark} position={[0, height / 2, thickness + 0.01]} castShadow>
        <boxGeometry args={[0.08, height, 0.04]} />
      </mesh>
      <group position={[-half / 2, height / 2, thickness + 0.01]} rotation={[0, 0, slopeAngle - Math.PI / 2]}>
        <mesh material={mats.timberDark} castShadow>
          <boxGeometry args={[0.07, hypotenuse, 0.05]} />
        </mesh>
      </group>
      <group position={[half / 2, height / 2, thickness + 0.01]} rotation={[0, 0, -(slopeAngle - Math.PI / 2)]}>
        <mesh material={mats.timberDark} castShadow>
          <boxGeometry args={[0.07, hypotenuse, 0.05]} />
        </mesh>
      </group>
      <mesh material={mats.windowUnlit} position={[0, height * 0.45, thickness + 0.02]} castShadow>
        <cylinderGeometry args={[0.12, 0.12, 0.04, 6]} />
      </mesh>
    </group>
  );
}

export function MedievalDoor({
  position = [0, 0, 0],
  rotation = [0, 0, 0],
  width = 0.72,
  height = 1.05,
  isDouble = false,
  hasCanopy = false,
}: {
  position?: [number, number, number];
  rotation?: [number, number, number];
  width?: number;
  height?: number;
  isDouble?: boolean;
  hasCanopy?: boolean;
}) {
  const mats = SHARED_BUILDING_MATS;
  const jambWidth = 0.10;
  const rootRef = useRef<THREE.Group>(null);
  const leftHingeRef = useRef<THREE.Group>(null);
  const rightHingeRef = useRef<THREE.Group>(null);
  const worldPos = useMemo(() => new THREE.Vector3(), []);

  useFrame((_, delta) => {
    if (!rootRef.current || !leftHingeRef.current) return;
    rootRef.current.getWorldPosition(worldPos);
    const dx = worldPos.x;
    const dz = worldPos.z;

    let isNear = false;
    for (const char of characterEntities) {
      if (!char.position || !char.path || char.path.length === 0) continue;
      const dist = Math.hypot(char.position[0] - dx, char.position[2] - dz);
      if (dist > 1.35) continue;

      let pathPassesDoor = false;
      const checkSteps = Math.min(3, char.path.length);
      for (let i = 0; i < checkSteps; i++) {
        const wp = char.path[i];
        if (Math.hypot(wp[0] + 0.5 - dx, wp[1] + 0.5 - dz) < 0.95) {
          pathPassesDoor = true;
          break;
        }
      }

      if (pathPassesDoor || dist < 0.45) {
        isNear = true;
        break;
      }
    }

    const openAngle = isNear ? -1.45 : 0;
    leftHingeRef.current.rotation.y = THREE.MathUtils.lerp(
      leftHingeRef.current.rotation.y,
      openAngle,
      Math.min(1.0, (delta || 0.016) * 7.0)
    );

    if (rightHingeRef.current) {
      rightHingeRef.current.rotation.y = THREE.MathUtils.lerp(
        rightHingeRef.current.rotation.y,
        isNear ? 1.45 : 0,
        Math.min(1.0, (delta || 0.016) * 7.0)
      );
    }
  });

  return (
    <group ref={rootRef} position={position} rotation={rotation}>
      <mesh material={mats.stoneDark} position={[0, -0.04, 0.08]} receiveShadow>
        <boxGeometry args={[width + 0.32, 0.08, 0.28]} />
      </mesh>
      <mesh material={mats.timberDark} position={[-width / 2 - jambWidth / 2, height / 2, 0.04]} castShadow>
        <boxGeometry args={[jambWidth, height + 0.14, 0.14]} />
      </mesh>
      <mesh material={mats.timberDark} position={[width / 2 + jambWidth / 2, height / 2, 0.04]} castShadow>
        <boxGeometry args={[jambWidth, height + 0.14, 0.14]} />
      </mesh>
      <mesh material={mats.timberDark} position={[0, height + 0.05, 0.04]} castShadow>
        <boxGeometry args={[width + jambWidth * 2 + 0.08, 0.12, 0.16]} />
      </mesh>

      {isDouble ? (
        <group>
          <group ref={leftHingeRef} position={[-width / 2, 0, 0.04]}>
            <mesh material={mats.floorPlanks} position={[width / 4, height / 2, 0]} castShadow receiveShadow>
              <boxGeometry args={[width / 2, height, 0.04]} />
            </mesh>
            <mesh material={mats.ironHardware} position={[width / 4, height * 0.75, 0.025]}>
              <boxGeometry args={[width * 0.42, 0.035, 0.015]} />
            </mesh>
            <mesh material={mats.ironHardware} position={[width / 4, height * 0.25, 0.025]}>
              <boxGeometry args={[width * 0.42, 0.035, 0.015]} />
            </mesh>
            <mesh material={mats.ironHardware} position={[width / 2 - 0.06, height * 0.5, 0.03]}>
              <torusGeometry args={[0.03, 0.008, 6, 12]} />
            </mesh>
          </group>
          <group ref={rightHingeRef} position={[width / 2, 0, 0.04]}>
            <mesh material={mats.floorPlanks} position={[-width / 4, height / 2, 0]} castShadow receiveShadow>
              <boxGeometry args={[width / 2, height, 0.04]} />
            </mesh>
            <mesh material={mats.ironHardware} position={[-width / 4, height * 0.75, 0.025]}>
              <boxGeometry args={[width * 0.42, 0.035, 0.015]} />
            </mesh>
            <mesh material={mats.ironHardware} position={[-width / 4, height * 0.25, 0.025]}>
              <boxGeometry args={[width * 0.42, 0.035, 0.015]} />
            </mesh>
            <mesh material={mats.ironHardware} position={[-width / 2 + 0.06, height * 0.5, 0.03]}>
              <torusGeometry args={[0.03, 0.008, 6, 12]} />
            </mesh>
          </group>
        </group>
      ) : (
        <group ref={leftHingeRef} position={[-width / 2, 0, 0.04]}>
          <mesh material={mats.floorPlanks} position={[width / 2, height / 2, 0]} castShadow receiveShadow>
            <boxGeometry args={[width, height, 0.045]} />
          </mesh>
          <mesh material={mats.ironHardware} position={[width * 0.35, height * 0.75, 0.028]}>
            <boxGeometry args={[width * 0.65, 0.035, 0.015]} />
          </mesh>
          <mesh material={mats.ironHardware} position={[width * 0.35, height * 0.25, 0.028]}>
            <boxGeometry args={[width * 0.65, 0.035, 0.015]} />
          </mesh>
          <mesh material={mats.ironHardware} position={[width - 0.09, height * 0.5, 0.035]}>
            <torusGeometry args={[0.035, 0.008, 6, 12]} />
          </mesh>
        </group>
      )}

      {hasCanopy && (
        <group position={[0, height + 0.14, 0.14]}>
          <mesh material={mats.timberDark} position={[-width * 0.5 - 0.02, -0.1, 0]} rotation={[0.4, 0, 0]} castShadow>
            <boxGeometry args={[0.06, 0.28, 0.06]} />
          </mesh>
          <mesh material={mats.timberDark} position={[width * 0.5 + 0.02, -0.1, 0]} rotation={[0.4, 0, 0]} castShadow>
            <boxGeometry args={[0.06, 0.28, 0.06]} />
          </mesh>
          <mesh material={mats.thatchRoof} position={[0, 0.04, 0.1]} rotation={[0.4, 0, 0]} castShadow>
            <boxGeometry args={[width + 0.38, 0.08, 0.42]} />
          </mesh>
        </group>
      )}
    </group>
  );
}

export function MedievalWindow({
  position = [0, 0, 0],
  rotation = [0, 0, 0],
  width = 0.52,
  height = 0.52,
  isLightOn = false,
  hasFlowerBox = true,
}: {
  position?: [number, number, number];
  rotation?: [number, number, number];
  width?: number;
  height?: number;
  isLightOn?: boolean;
  hasFlowerBox?: boolean;
}) {
  const mats = SHARED_BUILDING_MATS;
  return (
    <group position={position} rotation={rotation}>
      <mesh material={mats.timberDark} position={[0, 0, 0.02]} castShadow>
        <boxGeometry args={[width + 0.18, height + 0.18, 0.14]} />
      </mesh>
      <mesh material={isLightOn ? mats.windowLit : mats.windowUnlit} position={[0, 0, 0.08]}>
        <boxGeometry args={[width, height, 0.04]} />
      </mesh>
      <mesh material={mats.timberDark} position={[0, 0, 0.105]}>
        <boxGeometry args={[0.04, height, 0.02]} />
      </mesh>
      <mesh material={mats.timberDark} position={[0, 0, 0.105]}>
        <boxGeometry args={[width, 0.04, 0.02]} />
      </mesh>
      <mesh material={mats.timberDark} position={[0, -height / 2 - 0.05, 0.1]}>
        <boxGeometry args={[width + 0.26, 0.07, 0.16]} />
      </mesh>
      <mesh material={mats.timberDark} position={[0, height / 2 + 0.05, 0.08]}>
        <boxGeometry args={[width + 0.24, 0.06, 0.14]} />
      </mesh>
      <group position={[-width / 2 - 0.12, 0, 0.1]} rotation={[0, -0.75, 0]}>
        <mesh material={mats.timberPlanks} castShadow>
          <boxGeometry args={[width * 0.48, height * 0.96, 0.03]} />
        </mesh>
        <mesh material={mats.ironHardware} position={[0, height * 0.3, 0.02]}>
          <boxGeometry args={[width * 0.4, 0.02, 0.01]} />
        </mesh>
        <mesh material={mats.ironHardware} position={[0, -height * 0.3, 0.02]}>
          <boxGeometry args={[width * 0.4, 0.02, 0.01]} />
        </mesh>
      </group>
      <group position={[width / 2 + 0.12, 0, 0.1]} rotation={[0, 0.75, 0]}>
        <mesh material={mats.timberPlanks} castShadow>
          <boxGeometry args={[width * 0.48, height * 0.96, 0.03]} />
        </mesh>
        <mesh material={mats.ironHardware} position={[0, height * 0.3, 0.02]}>
          <boxGeometry args={[width * 0.4, 0.02, 0.01]} />
        </mesh>
        <mesh material={mats.ironHardware} position={[0, -height * 0.3, 0.02]}>
          <boxGeometry args={[width * 0.4, 0.02, 0.01]} />
        </mesh>
      </group>
      {hasFlowerBox && (
        <group position={[0, -height / 2 - 0.12, 0.18]}>
          <mesh material={mats.timberPlanks} castShadow>
            <boxGeometry args={[width * 0.95, 0.12, 0.14]} />
          </mesh>
          <mesh material={mats.leafGreen} position={[0, 0.06, 0]}>
            <boxGeometry args={[width * 0.9, 0.06, 0.12]} />
          </mesh>
          <mesh material={mats.flowerRed} position={[-width * 0.25, 0.11, 0]}>
            <dodecahedronGeometry args={[0.04, 0]} />
          </mesh>
          <mesh material={mats.flowerYellow} position={[0, 0.12, 0]}>
            <dodecahedronGeometry args={[0.04, 0]} />
          </mesh>
          <mesh material={mats.flowerRed} position={[width * 0.25, 0.11, 0]}>
            <dodecahedronGeometry args={[0.04, 0]} />
          </mesh>
        </group>
      )}
    </group>
  );
}

export function FirewoodStack({
  position = [0, 0, 0],
  rotation = [0, 0, 0],
}: {
  position?: [number, number, number];
  rotation?: [number, number, number];
}) {
  const mats = SHARED_BUILDING_MATS;
  return (
    <group position={position} rotation={rotation}>
      <mesh material={mats.timberDark} position={[-0.32, 0.18, 0]} castShadow>
        <boxGeometry args={[0.04, 0.36, 0.4]} />
      </mesh>
      <mesh material={mats.timberDark} position={[0.32, 0.18, 0]} castShadow>
        <boxGeometry args={[0.04, 0.36, 0.4]} />
      </mesh>
      {[-0.2, -0.07, 0.07, 0.2].map((x, i) => (
        <mesh key={`log-b-${i}`} material={mats.timberLight} position={[x, 0.07, 0]} rotation={[0, 0, Math.PI / 2]} castShadow>
          <cylinderGeometry args={[0.065, 0.065, 0.36, 6]} />
        </mesh>
      ))}
      {[-0.14, 0, 0.14].map((x, i) => (
        <mesh key={`log-m-${i}`} material={mats.timberLight} position={[x, 0.19, 0]} rotation={[0, 0, Math.PI / 2]} castShadow>
          <cylinderGeometry args={[0.06, 0.06, 0.36, 6]} />
        </mesh>
      ))}
      {[-0.07, 0.07].map((x, i) => (
        <mesh key={`log-t-${i}`} material={mats.timberLight} position={[x, 0.3, 0]} rotation={[0, 0, Math.PI / 2]} castShadow>
          <cylinderGeometry args={[0.055, 0.055, 0.36, 6]} />
        </mesh>
      ))}
    </group>
  );
}

export function TimberBarrel({
  position = [0, 0, 0],
  scale = 1,
}: {
  position?: [number, number, number];
  scale?: number;
}) {
  const mats = SHARED_BUILDING_MATS;
  return (
    <group position={position} scale={[scale, scale, scale]}>
      <mesh material={mats.barrelWood} position={[0, 0.24, 0]} castShadow receiveShadow>
        <cylinderGeometry args={[0.2, 0.18, 0.48, 8]} />
      </mesh>
      <mesh material={mats.ironHardware} position={[0, 0.36, 0]}>
        <cylinderGeometry args={[0.205, 0.205, 0.03, 8]} />
      </mesh>
      <mesh material={mats.ironHardware} position={[0, 0.12, 0]}>
        <cylinderGeometry args={[0.195, 0.195, 0.03, 8]} />
      </mesh>
    </group>
  );
}

const smokeClumpGeometry = (() => {
  const g1 = new THREE.IcosahedronGeometry(0.24, 1);
  const g2 = new THREE.IcosahedronGeometry(0.18, 1);
  g2.translate(-0.11, 0.04, 0.07);
  const g3 = new THREE.IcosahedronGeometry(0.19, 1);
  g3.translate(0.12, -0.03, -0.05);
  const g4 = new THREE.IcosahedronGeometry(0.16, 1);
  g4.translate(0.02, 0.12, 0.08);

  const geos = [g1, g2, g3, g4];
  let totalPos = 0;
  for (const g of geos) {
    totalPos += g.attributes.position.count * 3;
  }
  const positions = new Float32Array(totalPos);
  let posOff = 0;
  for (const g of geos) {
    positions.set(g.attributes.position.array, posOff);
    posOff += g.attributes.position.count * 3;
  }
  const merged = new THREE.BufferGeometry();
  merged.setAttribute('position', new THREE.BufferAttribute(positions, 3));
  merged.computeVertexNormals();
  return merged;
})();

export function ChimneySmoke({
  position = [0, 0, 0],
}: {
  position?: [number, number, number];
}) {
  const mats = SHARED_BUILDING_MATS;
  const groupRef = useRef<THREE.Group>(null);
  const materials = useMemo(() => {
    return Array.from({ length: 22 }, () => mats.smokeWhite.clone());
  }, [mats.smokeWhite]);

  useFrame(({ clock }) => {
    if (!groupRef.current) return;
    const t = clock.getElapsedTime();
    const children = groupRef.current.children;
    const count = children.length;
    for (let i = 0; i < count; i++) {
      const puff = children[i] as THREE.Mesh;
      const prog = (t * 0.20 + i / count) % 1.0;
      const y = 0.02 + Math.pow(prog, 0.85) * 2.85;

      const angle = i * 2.399963;
      const dispersion = Math.pow(prog, 1.25) * 0.55;
      const driftTurbulenceX = Math.sin(t * 0.8 + i * 1.7) * Math.pow(prog, 1.1) * 0.18;
      const driftTurbulenceZ = Math.cos(t * 0.7 + i * 2.1) * Math.pow(prog, 1.1) * 0.18;
      const windX = Math.pow(prog, 1.35) * 0.72;
      const windZ = Math.pow(prog, 1.35) * 0.32;

      puff.position.set(
        windX + Math.cos(angle) * dispersion + driftTurbulenceX,
        y,
        windZ + Math.sin(angle) * dispersion + driftTurbulenceZ
      );

      const s = 0.22 + Math.pow(prog, 0.7) * 0.92;
      puff.scale.set(s, s * 1.06, s);
      puff.rotation.set(t * 0.25 + i * 1.1, t * 0.2 + i * 0.9, t * 0.18 + i * 1.4);

      let opacity = 0.42;
      if (prog < 0.1) {
        opacity = (prog / 0.1) * 0.42;
      } else if (prog > 0.28) {
        opacity = 0.42 * Math.pow((1.0 - prog) / 0.72, 1.4);
      }
      if (puff.material && !Array.isArray(puff.material)) {
        (puff.material as THREE.MeshStandardMaterial).opacity = Math.max(0, opacity);
      }
    }
  });

  return (
    <group ref={groupRef} position={position}>
      {materials.map((mat, i) => (
        <mesh key={`cs-${i}`} geometry={smokeClumpGeometry} material={mat} />
      ))}
    </group>
  );
}

export function DetailedChimney({
  position = [0, 0, 0],
  width = 0.44,
  depth = 0.44,
  height = 1.25,
  potCount = 1,
  hasSmoke = true,
}: {
  position?: [number, number, number];
  width?: number;
  depth?: number;
  height?: number;
  potCount?: 1 | 2;
  hasSmoke?: boolean;
}) {
  const mats = SHARED_BUILDING_MATS;
  const capY = height / 2 + 0.03;
  const crownY = capY + 0.05;
  const potY = crownY + 0.16;

  return (
    <group position={position}>
      <mesh material={mats.stoneMed} position={[0, 0, 0]} castShadow receiveShadow>
        <boxGeometry args={[width, height, depth]} />
      </mesh>
      <mesh material={mats.stoneLight} position={[0, capY, 0]} castShadow>
        <boxGeometry args={[width + 0.08, 0.06, depth + 0.08]} />
      </mesh>
      <mesh material={mats.stoneLight} position={[0, crownY, 0]} castShadow>
        <boxGeometry args={[width + 0.14, 0.05, depth + 0.14]} />
      </mesh>
      {potCount === 2 ? (
        <group>
          <mesh material={mats.stoneMed} position={[-width * 0.22, potY, 0]} castShadow>
            <cylinderGeometry args={[0.09, 0.11, 0.28, 8]} />
          </mesh>
          <mesh material={mats.fireplaceCold} position={[-width * 0.22, potY + 0.14, 0]}>
            <cylinderGeometry args={[0.07, 0.07, 0.02, 8]} />
          </mesh>
          <mesh material={mats.stoneMed} position={[width * 0.22, potY, 0]} castShadow>
            <cylinderGeometry args={[0.09, 0.11, 0.28, 8]} />
          </mesh>
          <mesh material={mats.fireplaceCold} position={[width * 0.22, potY + 0.14, 0]}>
            <cylinderGeometry args={[0.07, 0.07, 0.02, 8]} />
          </mesh>
          {hasSmoke && <ChimneySmoke position={[-width * 0.22, potY + 0.14, 0]} />}
          {hasSmoke && <ChimneySmoke position={[width * 0.22, potY + 0.14, 0]} />}
        </group>
      ) : (
        <group>
          <mesh material={mats.stoneMed} position={[0, potY, 0]} castShadow>
            <cylinderGeometry args={[0.11, 0.13, 0.28, 8]} />
          </mesh>
          <mesh material={mats.stoneLight} position={[0, potY + 0.13, 0]} castShadow>
            <cylinderGeometry args={[0.125, 0.125, 0.03, 8]} />
          </mesh>
          <mesh material={mats.fireplaceCold} position={[0, potY + 0.145, 0]}>
            <cylinderGeometry args={[0.09, 0.09, 0.02, 8]} />
          </mesh>
          {hasSmoke && <ChimneySmoke position={[0, potY + 0.14, 0]} />}
        </group>
      )}
    </group>
  );
}

export function GothicLancetWindow({
  position = [0, 0, 0],
  rotation = [0, 0, 0],
  width = 0.52,
  height = 0.82,
  isLightOn = false,
}: {
  position?: [number, number, number];
  rotation?: [number, number, number];
  width?: number;
  height?: number;
  isLightOn?: boolean;
}) {
  const mats = SHARED_BUILDING_MATS;
  return (
    <group position={position} rotation={rotation}>
      <mesh material={mats.stoneLight} position={[0, -height / 2 - 0.04, 0.08]} castShadow>
        <boxGeometry args={[width + 0.22, 0.08, 0.16]} />
      </mesh>
      <mesh material={mats.stoneLight} position={[-width / 2 - 0.05, 0, 0.04]} castShadow>
        <boxGeometry args={[0.10, height, 0.12]} />
      </mesh>
      <mesh material={mats.stoneLight} position={[width / 2 + 0.05, 0, 0.04]} castShadow>
        <boxGeometry args={[0.10, height, 0.12]} />
      </mesh>
      <group position={[-width * 0.25, height / 2 + 0.08, 0.04]} rotation={[0, 0, -0.6]}>
        <mesh material={mats.stoneLight} castShadow>
          <boxGeometry args={[0.10, width * 0.72, 0.12]} />
        </mesh>
      </group>
      <group position={[width * 0.25, height / 2 + 0.08, 0.04]} rotation={[0, 0, 0.6]}>
        <mesh material={mats.stoneLight} castShadow>
          <boxGeometry args={[0.10, width * 0.72, 0.12]} />
        </mesh>
      </group>
      <mesh material={isLightOn ? mats.windowLit : mats.windowUnlit} position={[0, 0, 0.02]}>
        <boxGeometry args={[width, height, 0.04]} />
      </mesh>
      <mesh material={isLightOn ? mats.windowLit : mats.windowUnlit} position={[0, height / 2 + 0.06, 0.02]} rotation={[0, 0, Math.PI / 4]}>
        <boxGeometry args={[width * 0.62, width * 0.62, 0.04]} />
      </mesh>
      <mesh material={mats.stoneDark} position={[0, 0, 0.05]}>
        <boxGeometry args={[0.035, height, 0.02]} />
      </mesh>
      <mesh material={mats.stoneDark} position={[0, height * 0.15, 0.05]}>
        <boxGeometry args={[width, 0.035, 0.02]} />
      </mesh>
      <mesh material={mats.goldTrim} position={[0, height / 2 + 0.05, 0.05]}>
        <torusGeometry args={[0.07, 0.015, 6, 12]} />
      </mesh>
    </group>
  );
}

export function GothicButtress({
  position = [0, 0, 0],
  rotation = [0, 0, 0],
  height = 1.8,
}: {
  position?: [number, number, number];
  rotation?: [number, number, number];
  height?: number;
}) {
  const mats = SHARED_BUILDING_MATS;
  return (
    <group position={position} rotation={rotation}>
      <mesh material={mats.stoneDark} position={[0, height * 0.25, 0]} castShadow receiveShadow>
        <boxGeometry args={[0.26, height * 0.5, 0.36]} />
      </mesh>
      <mesh material={mats.stoneLight} position={[0, height * 0.5 + 0.04, -0.02]} rotation={[0.45, 0, 0]} castShadow>
        <boxGeometry args={[0.27, 0.12, 0.28]} />
      </mesh>
      <mesh material={mats.stoneMed} position={[0, height * 0.72, -0.04]} castShadow receiveShadow>
        <boxGeometry args={[0.22, height * 0.44, 0.26]} />
      </mesh>
      <mesh material={mats.stoneLight} position={[0, height * 0.94 + 0.04, -0.05]} rotation={[0.45, 0, 0]} castShadow>
        <boxGeometry args={[0.23, 0.1, 0.2]} />
      </mesh>
      <mesh material={mats.stoneLight} position={[0, height + 0.12, -0.06]} castShadow>
        <coneGeometry args={[0.12, 0.28, 4]} />
      </mesh>
    </group>
  );
}

export function GothicPortal({
  position = [0, 0, 0],
  rotation = [0, 0, 0],
  width = 1.3,
  height = 1.45,
}: {
  position?: [number, number, number];
  rotation?: [number, number, number];
  width?: number;
  height?: number;
}) {
  const mats = SHARED_BUILDING_MATS;
  const rootRef = useRef<THREE.Group>(null);
  const leftHingeRef = useRef<THREE.Group>(null);
  const rightHingeRef = useRef<THREE.Group>(null);
  const worldPos = useMemo(() => new THREE.Vector3(), []);

  useFrame((_, delta) => {
    if (!rootRef.current || !leftHingeRef.current || !rightHingeRef.current) return;
    rootRef.current.getWorldPosition(worldPos);
    const dx = worldPos.x;
    const dz = worldPos.z;

    let isNear = false;
    for (const char of characterEntities) {
      if (!char.position || !char.path || char.path.length === 0) continue;
      const dist = Math.hypot(char.position[0] - dx, char.position[2] - dz);
      if (dist > 1.6) continue;

      let pathPassesDoor = false;
      const checkSteps = Math.min(3, char.path.length);
      for (let i = 0; i < checkSteps; i++) {
        const wp = char.path[i];
        if (Math.hypot(wp[0] + 0.5 - dx, wp[1] + 0.5 - dz) < 1.1) {
          pathPassesDoor = true;
          break;
        }
      }

      if (pathPassesDoor || dist < 0.55) {
        isNear = true;
        break;
      }
    }

    leftHingeRef.current.rotation.y = THREE.MathUtils.lerp(
      leftHingeRef.current.rotation.y,
      isNear ? -1.45 : 0,
      Math.min(1.0, (delta || 0.016) * 6.0)
    );
    rightHingeRef.current.rotation.y = THREE.MathUtils.lerp(
      rightHingeRef.current.rotation.y,
      isNear ? 1.45 : 0,
      Math.min(1.0, (delta || 0.016) * 6.0)
    );
  });

  return (
    <group ref={rootRef} position={position} rotation={rotation}>
      <mesh material={mats.stoneDark} position={[0, -0.06, 0.1]} receiveShadow>
        <boxGeometry args={[width + 0.5, 0.12, 0.35]} />
      </mesh>
      <mesh material={mats.stoneLight} position={[-width / 2 - 0.1, height * 0.45, 0.06]} castShadow>
        <cylinderGeometry args={[0.07, 0.08, height * 0.9, 8]} />
      </mesh>
      <mesh material={mats.stoneLight} position={[width / 2 + 0.1, height * 0.45, 0.06]} castShadow>
        <cylinderGeometry args={[0.07, 0.08, height * 0.9, 8]} />
      </mesh>
      <mesh material={mats.stoneLight} position={[-width / 2 - 0.1, height * 0.9 + 0.04, 0.06]} castShadow>
        <boxGeometry args={[0.18, 0.1, 0.18]} />
      </mesh>
      <mesh material={mats.stoneLight} position={[width / 2 + 0.1, height * 0.9 + 0.04, 0.06]} castShadow>
        <boxGeometry args={[0.18, 0.1, 0.18]} />
      </mesh>
      <group position={[-width * 0.28, height + 0.12, 0.06]} rotation={[0, 0, -0.58]}>
        <mesh material={mats.stoneLight} castShadow>
          <boxGeometry args={[0.14, width * 0.82, 0.16]} />
        </mesh>
      </group>
      <group position={[width * 0.28, height + 0.12, 0.06]} rotation={[0, 0, 0.58]}>
        <mesh material={mats.stoneLight} castShadow>
          <boxGeometry args={[0.14, width * 0.82, 0.16]} />
        </mesh>
      </group>
      <mesh material={mats.stoneMed} position={[0, height * 0.88, 0.02]} castShadow>
        <boxGeometry args={[width * 0.88, 0.38, 0.08]} />
      </mesh>
      <mesh material={mats.goldTrim} position={[0, height * 0.92, 0.07]} castShadow>
        <boxGeometry args={[0.28, 0.24, 0.04]} />
      </mesh>
      <group ref={leftHingeRef} position={[-width / 2, 0, 0.02]}>
        <mesh material={mats.timberDark} position={[width / 4, height * 0.42, 0]} castShadow receiveShadow>
          <boxGeometry args={[width / 2, height * 0.84, 0.06]} />
        </mesh>
        <mesh material={mats.ironHardware} position={[width / 4, height * 0.65, 0.035]}>
          <boxGeometry args={[width * 0.42, 0.04, 0.015]} />
        </mesh>
        <mesh material={mats.ironHardware} position={[width / 4, height * 0.2, 0.035]}>
          <boxGeometry args={[width * 0.42, 0.04, 0.015]} />
        </mesh>
        <mesh material={mats.ironHardware} position={[width / 2 - 0.08, height * 0.42, 0.045]}>
          <torusGeometry args={[0.04, 0.01, 6, 12]} />
        </mesh>
      </group>
      <group ref={rightHingeRef} position={[width / 2, 0, 0.02]}>
        <mesh material={mats.timberDark} position={[-width / 4, height * 0.42, 0]} castShadow receiveShadow>
          <boxGeometry args={[width / 2, height * 0.84, 0.06]} />
        </mesh>
        <mesh material={mats.ironHardware} position={[-width / 4, height * 0.65, 0.035]}>
          <boxGeometry args={[width * 0.42, 0.04, 0.015]} />
        </mesh>
        <mesh material={mats.ironHardware} position={[-width / 4, height * 0.2, 0.035]}>
          <boxGeometry args={[width * 0.42, 0.04, 0.015]} />
        </mesh>
        <mesh material={mats.ironHardware} position={[-width / 2 + 0.08, height * 0.42, 0.045]}>
          <torusGeometry args={[0.04, 0.01, 6, 12]} />
        </mesh>
      </group>
    </group>
  );
}

export function WallBeams4x2() {
  const mats = SHARED_BUILDING_MATS;
  return (
    <group>
      <mesh material={mats.timberDark} position={[0, 0.15, 0.89]} castShadow>
        <boxGeometry args={[3.84, 0.08, 0.08]} />
      </mesh>
      <mesh material={mats.timberDark} position={[0, 1.15, 0.89]} castShadow>
        <boxGeometry args={[3.84, 0.08, 0.08]} />
      </mesh>
      <mesh material={mats.timberDark} position={[0, 0.15, -0.89]} castShadow>
        <boxGeometry args={[3.84, 0.08, 0.08]} />
      </mesh>
      <mesh material={mats.timberDark} position={[0, 1.15, -0.89]} castShadow>
        <boxGeometry args={[3.84, 0.08, 0.08]} />
      </mesh>
      <mesh material={mats.timberDark} position={[-1.89, 0.15, 0]} castShadow>
        <boxGeometry args={[0.08, 0.08, 1.84]} />
      </mesh>
      <mesh material={mats.timberDark} position={[-1.89, 1.15, 0]} castShadow>
        <boxGeometry args={[0.08, 0.08, 1.84]} />
      </mesh>
      <mesh material={mats.timberDark} position={[1.89, 0.15, 0]} castShadow>
        <boxGeometry args={[0.08, 0.08, 1.84]} />
      </mesh>
      <mesh material={mats.timberDark} position={[1.89, 1.15, 0]} castShadow>
        <boxGeometry args={[0.08, 0.08, 1.84]} />
      </mesh>
      {[-1.9, -0.65, 0.65, 1.9].map((bx) =>
        [-0.9, 0.9].map((bz) => (
          <mesh key={`p-wb-${bx}-${bz}`} material={mats.timberDark} position={[bx, 0.65, bz]} castShadow>
            <boxGeometry args={[0.12, 1.05, 0.12]} />
          </mesh>
        ))
      )}
      <mesh material={mats.timberDark} position={[-1.25, 0.65, 0.89]} rotation={[0, 0, 0.55]} castShadow>
        <boxGeometry args={[0.06, 1.15, 0.06]} />
      </mesh>
      <mesh material={mats.timberDark} position={[1.25, 0.65, 0.89]} rotation={[0, 0, -0.55]} castShadow>
        <boxGeometry args={[0.06, 1.15, 0.06]} />
      </mesh>
      <mesh material={mats.timberDark} position={[-1.25, 0.65, -0.89]} rotation={[0, 0, -0.55]} castShadow>
        <boxGeometry args={[0.06, 1.15, 0.06]} />
      </mesh>
      <mesh material={mats.timberDark} position={[1.25, 0.65, -0.89]} rotation={[0, 0, 0.55]} castShadow>
        <boxGeometry args={[0.06, 1.15, 0.06]} />
      </mesh>
      <mesh material={mats.timberDark} position={[-1.89, 0.65, 0]} rotation={[0.55, 0, 0]} castShadow>
        <boxGeometry args={[0.06, 1.15, 0.06]} />
      </mesh>
      <mesh material={mats.timberDark} position={[1.89, 0.65, 0]} rotation={[-0.55, 0, 0]} castShadow>
        <boxGeometry args={[0.06, 1.15, 0.06]} />
      </mesh>
    </group>
  );
}

export function MedievalBed({
  position = [0, 0, 0],
  rotation = [0, 0, 0],
  quiltMaterial = SHARED_BUILDING_MATS.bedLinenRed,
}: {
  position?: [number, number, number];
  rotation?: [number, number, number];
  quiltMaterial?: THREE.Material;
}) {
  const mats = SHARED_BUILDING_MATS;
  return (
    <group position={position} rotation={rotation}>
      <mesh material={mats.timberDark} position={[-0.34, 0.24, -0.6]} castShadow>
        <boxGeometry args={[0.07, 0.48, 0.07]} />
      </mesh>
      <mesh material={mats.timberLight} position={[-0.34, 0.5, -0.6]} castShadow>
        <sphereGeometry args={[0.045, 6, 6]} />
      </mesh>

      <mesh material={mats.timberDark} position={[0.34, 0.24, -0.6]} castShadow>
        <boxGeometry args={[0.07, 0.48, 0.07]} />
      </mesh>
      <mesh material={mats.timberLight} position={[0.34, 0.5, -0.6]} castShadow>
        <sphereGeometry args={[0.045, 6, 6]} />
      </mesh>

      <mesh material={mats.timberDark} position={[-0.34, 0.17, 0.6]} castShadow>
        <boxGeometry args={[0.07, 0.34, 0.07]} />
      </mesh>
      <mesh material={mats.timberLight} position={[-0.34, 0.36, 0.6]} castShadow>
        <sphereGeometry args={[0.04, 6, 6]} />
      </mesh>

      <mesh material={mats.timberDark} position={[0.34, 0.17, 0.6]} castShadow>
        <boxGeometry args={[0.07, 0.34, 0.07]} />
      </mesh>
      <mesh material={mats.timberLight} position={[0.34, 0.36, 0.6]} castShadow>
        <sphereGeometry args={[0.04, 6, 6]} />
      </mesh>

      <mesh material={mats.timberPlanks} position={[-0.34, 0.17, 0]} castShadow>
        <boxGeometry args={[0.04, 0.1, 1.14]} />
      </mesh>
      <mesh material={mats.timberPlanks} position={[0.34, 0.17, 0]} castShadow>
        <boxGeometry args={[0.04, 0.1, 1.14]} />
      </mesh>

      <mesh material={mats.timberDark} position={[0, 0.14, 0]} castShadow receiveShadow>
        <boxGeometry args={[0.64, 0.03, 1.14]} />
      </mesh>

      <mesh material={mats.timberPlanks} position={[0, 0.31, -0.6]} castShadow>
        <boxGeometry args={[0.62, 0.26, 0.04]} />
      </mesh>
      <mesh material={mats.timberDark} position={[0, 0.45, -0.6]} castShadow>
        <boxGeometry args={[0.42, 0.05, 0.05]} />
      </mesh>

      <mesh material={mats.timberPlanks} position={[0, 0.22, 0.6]} castShadow>
        <boxGeometry args={[0.62, 0.14, 0.04]} />
      </mesh>

      <mesh material={mats.bedStraw} position={[0, 0.2, 0]} receiveShadow>
        <boxGeometry args={[0.62, 0.1, 1.12]} />
      </mesh>

      <mesh material={mats.pillowWhite} position={[0, 0.252, -0.22]}>
        <boxGeometry args={[0.62, 0.015, 0.16]} />
      </mesh>

      <mesh material={mats.pillowWhite} position={[0, 0.27, -0.42]} castShadow>
        <boxGeometry args={[0.48, 0.07, 0.24]} />
      </mesh>

      <mesh material={quiltMaterial} position={[0, 0.255, 0.2]} castShadow>
        <boxGeometry args={[0.63, 0.02, 0.74]} />
      </mesh>
      <mesh material={quiltMaterial} position={[-0.32, 0.22, 0.2]} castShadow>
        <boxGeometry args={[0.02, 0.07, 0.72]} />
      </mesh>
      <mesh material={quiltMaterial} position={[0.32, 0.22, 0.2]} castShadow>
        <boxGeometry args={[0.02, 0.07, 0.72]} />
      </mesh>
      <mesh material={quiltMaterial} position={[0, 0.22, 0.57]} castShadow>
        <boxGeometry args={[0.62, 0.07, 0.02]} />
      </mesh>
    </group>
  );
}

export function BarracksBunkBed({
  position = [0, 0, 0],
}: {
  position?: [number, number, number];
}) {
  const mats = SHARED_BUILDING_MATS;
  return (
    <group position={position}>
      {[-0.56, 0.56].map((px) =>
        [-0.36, 0.36].map((pz) => (
          <group key={`bunk-post-${px}-${pz}`} position={[px, 0.52, pz]}>
            <mesh material={mats.timberDark} castShadow>
              <boxGeometry args={[0.07, 1.04, 0.07]} />
            </mesh>
            <mesh material={mats.timberLight} position={[0, 0.53, 0]} castShadow>
              <coneGeometry args={[0.045, 0.06, 4]} />
            </mesh>
          </group>
        ))
      )}

      <mesh material={mats.timberPlanks} position={[-0.56, 0.22, 0]} castShadow>
        <boxGeometry args={[0.04, 0.1, 0.68]} />
      </mesh>
      <mesh material={mats.timberPlanks} position={[0.56, 0.22, 0]} castShadow>
        <boxGeometry args={[0.04, 0.1, 0.68]} />
      </mesh>
      <mesh material={mats.timberPlanks} position={[0, 0.22, -0.36]} castShadow>
        <boxGeometry args={[1.08, 0.1, 0.04]} />
      </mesh>
      <mesh material={mats.timberPlanks} position={[0, 0.22, 0.36]} castShadow>
        <boxGeometry args={[1.08, 0.1, 0.04]} />
      </mesh>
      <mesh material={mats.timberDark} position={[0, 0.18, 0]} castShadow receiveShadow>
        <boxGeometry args={[1.06, 0.03, 0.68]} />
      </mesh>
      <mesh material={mats.bedStraw} position={[0, 0.24, 0]} receiveShadow>
        <boxGeometry args={[1.05, 0.1, 0.66]} />
      </mesh>
      <mesh material={mats.bedLinenRed} position={[0.16, 0.285, 0]} castShadow>
        <boxGeometry args={[0.7, 0.03, 0.65]} />
      </mesh>
      <mesh material={mats.pillowWhite} position={[-0.2, 0.285, 0]}>
        <boxGeometry args={[0.12, 0.015, 0.64]} />
      </mesh>
      <mesh material={mats.pillowWhite} position={[-0.38, 0.3, 0]} castShadow>
        <boxGeometry args={[0.26, 0.07, 0.44]} />
      </mesh>

      <mesh material={mats.timberPlanks} position={[-0.56, 0.6, 0]} castShadow>
        <boxGeometry args={[0.04, 0.1, 0.68]} />
      </mesh>
      <mesh material={mats.timberPlanks} position={[0.56, 0.6, 0]} castShadow>
        <boxGeometry args={[0.04, 0.1, 0.68]} />
      </mesh>
      <mesh material={mats.timberPlanks} position={[0, 0.6, -0.36]} castShadow>
        <boxGeometry args={[1.08, 0.1, 0.04]} />
      </mesh>
      <mesh material={mats.timberPlanks} position={[0, 0.6, 0.36]} castShadow>
        <boxGeometry args={[1.08, 0.1, 0.04]} />
      </mesh>
      <mesh material={mats.timberDark} position={[-0.14, 0.72, 0.36]} castShadow>
        <boxGeometry args={[0.76, 0.04, 0.03]} />
      </mesh>
      <mesh material={mats.timberDark} position={[0, 0.72, -0.36]} castShadow>
        <boxGeometry args={[1.08, 0.04, 0.03]} />
      </mesh>
      <mesh material={mats.timberDark} position={[0, 0.56, 0]} castShadow receiveShadow>
        <boxGeometry args={[1.06, 0.03, 0.68]} />
      </mesh>
      <mesh material={mats.bedStraw} position={[0, 0.62, 0]} receiveShadow>
        <boxGeometry args={[1.05, 0.1, 0.66]} />
      </mesh>
      <mesh material={mats.bedLinenBlue} position={[0.16, 0.665, 0]} castShadow>
        <boxGeometry args={[0.7, 0.03, 0.65]} />
      </mesh>
      <mesh material={mats.pillowWhite} position={[-0.2, 0.665, 0]}>
        <boxGeometry args={[0.12, 0.015, 0.64]} />
      </mesh>
      <mesh material={mats.pillowWhite} position={[-0.38, 0.68, 0]} castShadow>
        <boxGeometry args={[0.26, 0.07, 0.44]} />
      </mesh>

      <group position={[0.38, 0, 0.38]}>
        <mesh material={mats.timberDark} position={[-0.1, 0.48, 0]} castShadow>
          <boxGeometry args={[0.03, 0.96, 0.03]} />
        </mesh>
        <mesh material={mats.timberDark} position={[0.1, 0.48, 0]} castShadow>
          <boxGeometry args={[0.03, 0.96, 0.03]} />
        </mesh>
        {[0.18, 0.38, 0.58, 0.78].map((ry, ri) => (
          <mesh key={`rung-${ri}`} material={mats.timberLight} position={[0, ry, 0]} castShadow>
            <cylinderGeometry args={[0.015, 0.015, 0.19, 4]} />
          </mesh>
        ))}
      </group>
    </group>
  );
}

export function LordManorBed({
  position = [0, 0, 0],
  rotation = [0, 0, 0],
}: {
  position?: [number, number, number];
  rotation?: [number, number, number];
}) {
  const mats = SHARED_BUILDING_MATS;
  return (
    <group position={position} rotation={rotation}>
      {[-0.45, 0.45].map((px) =>
        [-0.65, 0.65].map((pz) => (
          <group key={`mb-post-${px}-${pz}`} position={[px, 0.65, pz]}>
            <mesh material={mats.timberDark} castShadow>
              <boxGeometry args={[0.08, 1.3, 0.08]} />
            </mesh>
            <mesh material={mats.goldTrim} position={[0, 0.68, 0]} castShadow>
              <sphereGeometry args={[0.045, 6, 6]} />
            </mesh>
            <mesh material={mats.goldTrim} position={[0, 0.74, 0]} castShadow>
              <coneGeometry args={[0.03, 0.08, 5]} />
            </mesh>
          </group>
        ))
      )}

      <mesh material={mats.timberDark} position={[0, 1.3, -0.65]} castShadow>
        <boxGeometry args={[0.96, 0.04, 0.08]} />
      </mesh>
      <mesh material={mats.timberDark} position={[0, 1.3, 0.65]} castShadow>
        <boxGeometry args={[0.96, 0.04, 0.08]} />
      </mesh>
      <mesh material={mats.timberDark} position={[-0.45, 1.3, 0]} castShadow>
        <boxGeometry args={[0.08, 0.04, 1.36]} />
      </mesh>
      <mesh material={mats.timberDark} position={[0.45, 1.3, 0]} castShadow>
        <boxGeometry args={[0.08, 0.04, 1.36]} />
      </mesh>
      <mesh material={mats.velvetRed} position={[0, 1.22, -0.65]} castShadow>
        <boxGeometry args={[0.94, 0.14, 0.02]} />
      </mesh>
      <mesh material={mats.goldTrim} position={[0, 1.15, -0.65]}>
        <boxGeometry args={[0.96, 0.015, 0.025]} />
      </mesh>
      <mesh material={mats.velvetRed} position={[0, 1.22, 0.65]} castShadow>
        <boxGeometry args={[0.94, 0.14, 0.02]} />
      </mesh>
      <mesh material={mats.goldTrim} position={[0, 1.15, 0.65]}>
        <boxGeometry args={[0.96, 0.015, 0.025]} />
      </mesh>
      <mesh material={mats.velvetRed} position={[-0.45, 1.22, 0]} castShadow>
        <boxGeometry args={[0.02, 0.14, 1.32]} />
      </mesh>
      <mesh material={mats.goldTrim} position={[-0.45, 1.15, 0]}>
        <boxGeometry args={[0.025, 0.015, 1.34]} />
      </mesh>
      <mesh material={mats.velvetRed} position={[0.45, 1.22, 0]} castShadow>
        <boxGeometry args={[0.02, 0.14, 1.32]} />
      </mesh>
      <mesh material={mats.goldTrim} position={[0.45, 1.15, 0]}>
        <boxGeometry args={[0.025, 0.015, 1.34]} />
      </mesh>

      {[-0.43, 0.43].map((dx) => (
        <group key={`drape-back-${dx}`} position={[dx, 0.72, -0.62]}>
          <mesh material={mats.velvetRed} castShadow>
            <boxGeometry args={[0.12, 0.88, 0.08]} />
          </mesh>
          <mesh material={mats.goldTrim} position={[0, -0.1, 0]}>
            <boxGeometry args={[0.13, 0.04, 0.09]} />
          </mesh>
        </group>
      ))}

      <mesh material={mats.timberDark} position={[0, 0.18, 0]} castShadow receiveShadow>
        <boxGeometry args={[0.88, 0.12, 1.28]} />
      </mesh>
      <mesh material={mats.timberLight} position={[0, 0.23, 0]} receiveShadow>
        <boxGeometry args={[0.84, 0.04, 1.24]} />
      </mesh>

      <mesh material={mats.timberDark} position={[0, 0.48, -0.63]} castShadow>
        <boxGeometry args={[0.82, 0.52, 0.05]} />
      </mesh>
      <mesh material={mats.velvetRed} position={[0, 0.48, -0.6]}>
        <boxGeometry args={[0.68, 0.4, 0.02]} />
      </mesh>
      <mesh material={mats.goldTrim} position={[0, 0.68, -0.6]} castShadow>
        <dodecahedronGeometry args={[0.06, 0]} />
      </mesh>

      <mesh material={mats.timberDark} position={[0, 0.32, 0.63]} castShadow>
        <boxGeometry args={[0.82, 0.22, 0.05]} />
      </mesh>

      <mesh material={mats.bedStraw} position={[0, 0.28, 0]} receiveShadow>
        <boxGeometry args={[0.8, 0.12, 1.2]} />
      </mesh>

      <mesh material={mats.pillowWhite} position={[0, 0.345, -0.22]}>
        <boxGeometry args={[0.8, 0.015, 0.22]} />
      </mesh>

      {[-0.22, 0.22].map((px) => (
        <group key={`r-pillow-${px}`} position={[px, 0.36, -0.42]}>
          <mesh material={mats.pillowWhite} castShadow>
            <boxGeometry args={[0.34, 0.09, 0.24]} />
          </mesh>
          <mesh material={mats.goldTrim} position={[0, 0.046, 0]}>
            <boxGeometry args={[0.35, 0.008, 0.03]} />
          </mesh>
        </group>
      ))}

      <mesh material={mats.velvetRed} position={[0, 0.345, 0.16]} castShadow>
        <boxGeometry args={[0.81, 0.02, 0.84]} />
      </mesh>
      <mesh material={mats.velvetRed} position={[-0.41, 0.3, 0.16]} castShadow>
        <boxGeometry args={[0.02, 0.09, 0.82]} />
      </mesh>
      <mesh material={mats.velvetRed} position={[0.41, 0.3, 0.16]} castShadow>
        <boxGeometry args={[0.02, 0.09, 0.82]} />
      </mesh>
      <mesh material={mats.goldTrim} position={[0, 0.35, 0.16]}>
        <boxGeometry args={[0.76, 0.005, 0.8]} />
      </mesh>

      <group position={[0.58, 0, 0.45]}>
        <mesh material={mats.timberDark} position={[0, 0.16, 0]} castShadow receiveShadow>
          <boxGeometry args={[0.26, 0.32, 0.28]} />
        </mesh>
        <mesh material={mats.goldTrim} position={[0, 0.16, 0.145]}>
          <boxGeometry args={[0.04, 0.04, 0.015]} />
        </mesh>
        <mesh material={mats.goldTrim} position={[0, 0.34, 0]} castShadow>
          <cylinderGeometry args={[0.025, 0.035, 0.04, 6]} />
        </mesh>
        <mesh material={mats.candleGlow} position={[0, 0.38, 0]}>
          <cylinderGeometry args={[0.01, 0.012, 0.06, 5]} />
        </mesh>
      </group>
    </group>
  );
}

export function GothicManorFireplace({
  position = [0, 0, 0],
  rotation = [0, 0, 0],
  isLightOn = false,
}: {
  position?: [number, number, number];
  rotation?: [number, number, number];
  isLightOn?: boolean;
}) {
  const mats = SHARED_BUILDING_MATS;
  return (
    <group position={position} rotation={rotation}>
      <mesh material={mats.stoneDark} position={[0, 0.03, 0.12]} receiveShadow>
        <boxGeometry args={[1.36, 0.06, 0.82]} />
      </mesh>
      <mesh material={mats.stoneLight} position={[0, 0.065, 0.52]} castShadow receiveShadow>
        <boxGeometry args={[1.4, 0.03, 0.08]} />
      </mesh>
      <mesh material={mats.stoneLight} position={[-0.66, 0.065, 0.12]} castShadow receiveShadow>
        <boxGeometry args={[0.08, 0.03, 0.74]} />
      </mesh>
      <mesh material={mats.stoneLight} position={[0.66, 0.065, 0.12]} castShadow receiveShadow>
        <boxGeometry args={[0.08, 0.03, 0.74]} />
      </mesh>

      <mesh material={mats.charredWood} position={[0, 0.48, -0.22]} castShadow receiveShadow>
        <boxGeometry args={[0.96, 0.88, 0.14]} />
      </mesh>
      <mesh material={mats.charredWood} position={[-0.45, 0.48, -0.05]} castShadow receiveShadow>
        <boxGeometry args={[0.08, 0.88, 0.26]} />
      </mesh>
      <mesh material={mats.charredWood} position={[0.45, 0.48, -0.05]} castShadow receiveShadow>
        <boxGeometry args={[0.08, 0.88, 0.26]} />
      </mesh>

      <mesh material={mats.stoneMed} position={[-0.56, 0.48, 0.04]} castShadow receiveShadow>
        <boxGeometry args={[0.2, 0.88, 0.38]} />
      </mesh>
      <mesh material={mats.stoneMed} position={[0.56, 0.48, 0.04]} castShadow receiveShadow>
        <boxGeometry args={[0.2, 0.88, 0.38]} />
      </mesh>

      <mesh material={mats.stoneLight} position={[-0.6, 0.48, 0.22]} castShadow>
        <cylinderGeometry args={[0.04, 0.045, 0.86, 8]} />
      </mesh>
      <mesh material={mats.stoneLight} position={[-0.6, 0.08, 0.22]} castShadow>
        <boxGeometry args={[0.11, 0.08, 0.11]} />
      </mesh>
      <mesh material={mats.stoneLight} position={[-0.6, 0.88, 0.22]} castShadow>
        <boxGeometry args={[0.11, 0.08, 0.11]} />
      </mesh>

      <mesh material={mats.stoneLight} position={[0.6, 0.48, 0.22]} castShadow>
        <cylinderGeometry args={[0.04, 0.045, 0.86, 8]} />
      </mesh>
      <mesh material={mats.stoneLight} position={[0.6, 0.08, 0.22]} castShadow>
        <boxGeometry args={[0.11, 0.08, 0.11]} />
      </mesh>
      <mesh material={mats.stoneLight} position={[0.6, 0.88, 0.22]} castShadow>
        <boxGeometry args={[0.11, 0.08, 0.11]} />
      </mesh>

      <mesh material={mats.stoneLight} position={[0, 0.98, 0.06]} castShadow receiveShadow>
        <boxGeometry args={[1.38, 0.16, 0.46]} />
      </mesh>

      <mesh material={mats.goldTrim} position={[0, 1.15, 0.18]} castShadow>
        <dodecahedronGeometry args={[0.07, 0]} />
      </mesh>

      <mesh material={mats.timberDark} position={[0, 1.08, 0.08]} castShadow receiveShadow>
        <boxGeometry args={[1.44, 0.06, 0.52]} />
      </mesh>

      <mesh material={mats.stoneMed} position={[0, 1.38, -0.06]} castShadow receiveShadow>
        <boxGeometry args={[1.22, 0.54, 0.38]} />
      </mesh>
      <mesh material={mats.stoneDark} position={[0, 1.84, -0.1]} castShadow receiveShadow>
        <boxGeometry args={[1.04, 0.4, 0.3]} />
      </mesh>

      <mesh material={mats.ashBed} position={[0, 0.07, -0.06]} receiveShadow>
        <boxGeometry args={[0.76, 0.03, 0.34]} />
      </mesh>

      {[-0.24, 0.24].map((ax) => (
        <group key={`andiron-${ax}`} position={[ax, 0.07, -0.04]}>
          <mesh material={mats.ironHardware} position={[0, 0.04, 0]} castShadow>
            <boxGeometry args={[0.03, 0.04, 0.28]} />
          </mesh>
          <mesh material={mats.ironHardware} position={[0, 0.12, 0.13]} castShadow>
            <boxGeometry args={[0.035, 0.18, 0.035]} />
          </mesh>
          <mesh material={mats.ironHardware} position={[0, 0.22, 0.13]} castShadow>
            <sphereGeometry args={[0.03, 6, 6]} />
          </mesh>
        </group>
      ))}

      <mesh material={mats.timberLogs} position={[0, 0.16, -0.06]} rotation={[0, 0, Math.PI / 2]} castShadow>
        <cylinderGeometry args={[0.048, 0.052, 0.56, 6]} />
      </mesh>
      <mesh material={mats.timberLogs} position={[-0.05, 0.22, -0.02]} rotation={[0.2, 0.1, Math.PI / 2 + 0.15]} castShadow>
        <cylinderGeometry args={[0.042, 0.045, 0.52, 6]} />
      </mesh>
      <mesh material={mats.timberLogs} position={[0.04, 0.22, -0.1]} rotation={[-0.2, -0.1, Math.PI / 2 - 0.15]} castShadow>
        <cylinderGeometry args={[0.04, 0.042, 0.5, 6]} />
      </mesh>

      {isLightOn ? (
        <group position={[0, 0.16, -0.04]}>
          <mesh material={mats.emberGlow} position={[0, 0, 0]}>
            <boxGeometry args={[0.45, 0.06, 0.2]} />
          </mesh>
          <mesh material={mats.fireOrange} position={[0, 0.12, 0]}>
            <dodecahedronGeometry args={[0.16, 0]} />
          </mesh>
          <mesh material={mats.fireYellow} position={[0, 0.2, 0]}>
            <coneGeometry args={[0.09, 0.22, 5]} />
          </mesh>
          <mesh material={mats.fireOrange} position={[-0.1, 0.1, 0.02]}>
            <coneGeometry args={[0.07, 0.18, 5]} />
          </mesh>
          <mesh material={mats.fireOrange} position={[0.1, 0.1, -0.02]}>
            <coneGeometry args={[0.07, 0.18, 5]} />
          </mesh>
          <pointLight color="#f97316" intensity={2.0} distance={5.0} position={[0, 0.22, 0.18]} />
        </group>
      ) : (
        <mesh material={mats.charredWood} position={[0, 0.1, -0.05]}>
          <boxGeometry args={[0.4, 0.05, 0.18]} />
        </mesh>
      )}

      <group position={[-0.5, 1.11, 0.08]}>
        <mesh material={mats.goldTrim} position={[0, 0.04, 0]} castShadow>
          <cylinderGeometry args={[0.025, 0.035, 0.08, 6]} />
        </mesh>
        <mesh material={isLightOn ? mats.candleGlow : mats.candleUnlit} position={[0, 0.11, 0]}>
          <cylinderGeometry args={[0.012, 0.014, 0.08, 5]} />
        </mesh>
        {isLightOn && <pointLight color="#fde047" intensity={0.4} distance={1.8} position={[0, 0.17, 0]} />}
      </group>

      <group position={[0.5, 1.11, 0.08]}>
        <mesh material={mats.goldTrim} position={[0, 0.04, 0]} castShadow>
          <cylinderGeometry args={[0.025, 0.035, 0.08, 6]} />
        </mesh>
        <mesh material={isLightOn ? mats.candleGlow : mats.candleUnlit} position={[0, 0.11, 0]}>
          <cylinderGeometry args={[0.012, 0.014, 0.08, 5]} />
        </mesh>
        {isLightOn && <pointLight color="#fde047" intensity={0.4} distance={1.8} position={[0, 0.17, 0]} />}
      </group>

      <mesh material={mats.goldTrim} position={[0.18, 1.16, 0.08]} castShadow>
        <cylinderGeometry args={[0.028, 0.015, 0.09, 8]} />
      </mesh>

      <group position={[0.7, 0.32, 0.18]} rotation={[0.15, 0, 0.18]}>
        <mesh material={mats.ironHardware} castShadow>
          <cylinderGeometry args={[0.01, 0.01, 0.64, 5]} />
        </mesh>
        <mesh material={mats.goldTrim} position={[0, 0.32, 0]} castShadow>
          <sphereGeometry args={[0.022, 6, 6]} />
        </mesh>
      </group>

      <group position={[-0.64, 0.12, 0.28]}>
        <mesh material={mats.timberDark} position={[0, 0.04, 0]} castShadow>
          <boxGeometry args={[0.22, 0.1, 0.26]} />
        </mesh>
        <mesh material={mats.timberLogs} position={[-0.04, 0.11, 0]} rotation={[Math.PI / 2, 0, 0.2]} castShadow>
          <cylinderGeometry args={[0.035, 0.035, 0.22, 6]} />
        </mesh>
        <mesh material={mats.timberLogs} position={[0.04, 0.11, 0]} rotation={[Math.PI / 2, 0, -0.2]} castShadow>
          <cylinderGeometry args={[0.035, 0.035, 0.22, 6]} />
        </mesh>
      </group>
    </group>
  );
}
