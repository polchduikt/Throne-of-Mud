import { useRef } from 'react';
import type { RefObject } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';
import { SHARED_BUILDING_MATS } from '../buildingMaterials';

export function IronMineModel({
  isLightOn = false,
  isWorking = true,
  roofRef,
}: {
  isLightOn?: boolean;
  isWorking?: boolean;
  roofRef?: RefObject<THREE.Group | null>;
}) {
  const mats = SHARED_BUILDING_MATS;

  const bucketRef = useRef<THREE.Group>(null);
  const ropeRef = useRef<THREE.Mesh>(null);
  const sheaveRef = useRef<THREE.Group>(null);
  const windlassRef = useRef<THREE.Group>(null);
  const oreInBucketRef = useRef<THREE.Group>(null);

  useFrame(({ clock }) => {
    if (!bucketRef.current || !bucketRef.current.parent?.visible || !isWorking) return;
    const t = clock.getElapsedTime();
    const period = 7.5;
    const progress = (t % period) / period;

    const topY = 1.55;
    const bottomY = 0.22;
    const headframeSheaveY = 3.65;

    let currentBucketY = topY;
    let wheelSpeed = 0;
    let oreScale = 1.0;

    if (progress < 0.35) {

      const p = progress / 0.35;
      const ease = p * p * (3 - 2 * p);
      currentBucketY = topY - ease * (topY - bottomY);
      wheelSpeed = 5.2;
      oreScale = Math.max(0, 1.0 - p * 3.5);
    } else if (progress < 0.50) {

      const p = (progress - 0.35) / 0.15;
      currentBucketY = bottomY + Math.sin(t * 24) * 0.012;
      wheelSpeed = 0.1;
      oreScale = Math.min(1.0, p * 2.2);
    } else if (progress < 0.85) {

      const p = (progress - 0.50) / 0.35;
      const ease = p * p * (3 - 2 * p);
      currentBucketY = bottomY + ease * (topY - bottomY);
      wheelSpeed = -5.2;
      oreScale = 1.0;
    } else {

      currentBucketY = topY;
      wheelSpeed = 0;
      oreScale = 1.0;
    }

    if (bucketRef.current) {
      bucketRef.current.position.y = currentBucketY;
    }

    if (oreInBucketRef.current) {
      oreInBucketRef.current.scale.set(oreScale, oreScale, oreScale);
    }

    if (ropeRef.current) {
      const ropeLength = Math.max(0.1, headframeSheaveY - (currentBucketY + 0.36));
      ropeRef.current.position.y = headframeSheaveY - ropeLength / 2;
      ropeRef.current.scale.y = ropeLength;
    }

    if (sheaveRef.current) {
      sheaveRef.current.rotation.x += wheelSpeed * 0.025;
    }

    if (windlassRef.current) {
      windlassRef.current.rotation.x += wheelSpeed * 0.025;
    }
  });

  return (
    <group>

      {[-1.85, 1.85].map((px) =>
        [-1.35, 1.35].map((pz) => (
          <mesh key={`pier-${px}-${pz}`} material={mats.stoneDark} position={[px, 0.24, pz]} receiveShadow castShadow>
            <boxGeometry args={[0.55, 0.48, 0.55]} />
          </mesh>
        ))
      )}

      <mesh material={mats.timberLogs} position={[-1.85, 0.48, 0]} castShadow>
        <boxGeometry args={[0.24, 0.24, 2.9]} />
      </mesh>
      <mesh material={mats.timberLogs} position={[1.85, 0.48, 0]} castShadow>
        <boxGeometry args={[0.24, 0.24, 2.9]} />
      </mesh>
      <mesh material={mats.timberLogs} position={[0, 0.48, -1.35]} castShadow>
        <boxGeometry args={[3.8, 0.24, 0.24]} />
      </mesh>
      <mesh material={mats.timberLogs} position={[0, 0.48, 1.35]} castShadow>
        <boxGeometry args={[3.8, 0.24, 0.24]} />
      </mesh>

      <group position={[0, 0, 0]}>

        <mesh material={mats.timberLogs} position={[-1.0, 2.05, -0.6]} rotation={[0.12, 0, -0.12]} castShadow>
          <boxGeometry args={[0.22, 3.4, 0.22]} />
        </mesh>
        <mesh material={mats.timberLogs} position={[1.0, 2.05, -0.6]} rotation={[0.12, 0, 0.12]} castShadow>
          <boxGeometry args={[0.22, 3.4, 0.22]} />
        </mesh>
        <mesh material={mats.timberLogs} position={[-1.0, 2.05, 0.6]} rotation={[-0.12, 0, -0.12]} castShadow>
          <boxGeometry args={[0.22, 3.4, 0.22]} />
        </mesh>
        <mesh material={mats.timberLogs} position={[1.0, 2.05, 0.6]} rotation={[-0.12, 0, 0.12]} castShadow>
          <boxGeometry args={[0.22, 3.4, 0.22]} />
        </mesh>

        <mesh material={mats.timberDark} position={[0, 3.65, 0]} castShadow>
          <boxGeometry args={[2.1, 0.26, 0.26]} />
        </mesh>
        <mesh material={mats.ironHardware} position={[-0.85, 3.65, 0]}>
          <boxGeometry args={[0.30, 0.30, 0.30]} />
        </mesh>
        <mesh material={mats.ironHardware} position={[0.85, 3.65, 0]}>
          <boxGeometry args={[0.30, 0.30, 0.30]} />
        </mesh>

        <mesh material={mats.timberDark} position={[0, 2.35, -0.52]} castShadow>
          <boxGeometry args={[1.9, 0.16, 0.16]} />
        </mesh>
        <mesh material={mats.timberDark} position={[0, 2.35, 0.52]} castShadow>
          <boxGeometry args={[1.9, 0.16, 0.16]} />
        </mesh>
        <mesh material={mats.timberDark} position={[-0.85, 2.35, 0]} castShadow>
          <boxGeometry args={[0.16, 0.16, 1.25]} />
        </mesh>
        <mesh material={mats.timberDark} position={[0.85, 2.35, 0]} castShadow>
          <boxGeometry args={[0.16, 0.16, 1.25]} />
        </mesh>

        <mesh material={mats.timberDark} position={[0, 2.35, -0.52]} rotation={[0, 0, 0.52]} castShadow>
          <boxGeometry args={[2.2, 0.10, 0.10]} />
        </mesh>
        <mesh material={mats.timberDark} position={[0, 2.35, -0.52]} rotation={[0, 0, -0.52]} castShadow>
          <boxGeometry args={[2.2, 0.10, 0.10]} />
        </mesh>

        <group ref={sheaveRef} position={[0, 3.65, 0]}>

          <mesh material={mats.ironSteel} rotation={[0, 0, Math.PI / 2]}>
            <cylinderGeometry args={[0.045, 0.045, 0.60, 8]} />
          </mesh>

          <mesh material={mats.ironHardware} rotation={[0, 0, Math.PI / 2]} castShadow>
            <cylinderGeometry args={[0.42, 0.42, 0.07, 14]} />
          </mesh>
          <mesh material={mats.charredWood} rotation={[0, 0, Math.PI / 2]}>
            <cylinderGeometry args={[0.36, 0.36, 0.08, 14]} />
          </mesh>

          {[0, Math.PI / 4, Math.PI / 2, (3 * Math.PI) / 4].map((ang, i) => (
            <mesh key={`spoke-${i}`} material={mats.timberDark} rotation={[ang, 0, 0]} castShadow>
              <boxGeometry args={[0.04, 0.78, 0.03]} />
            </mesh>
          ))}
        </group>

        <group ref={windlassRef} position={[0, 1.85, 0.52]}>
          <mesh material={mats.timberLogs} rotation={[0, 0, Math.PI / 2]} castShadow>
            <cylinderGeometry args={[0.11, 0.11, 1.7, 8]} />
          </mesh>
          <mesh material={mats.richSoil} rotation={[0, 0, Math.PI / 2]} castShadow>
            <cylinderGeometry args={[0.13, 0.13, 0.75, 8]} />
          </mesh>

          <mesh material={mats.ironSteel} position={[0.92, 0, 0]} rotation={[0, 0, Math.PI / 2]} castShadow>
            <cylinderGeometry args={[0.025, 0.025, 0.20, 6]} />
          </mesh>
          <mesh material={mats.ironSteel} position={[1.02, -0.18, 0]} castShadow>
            <boxGeometry args={[0.038, 0.38, 0.038]} />
          </mesh>
          <mesh material={mats.timberLight} position={[1.02, -0.36, 0.12]} rotation={[Math.PI / 2, 0, 0]} castShadow>
            <cylinderGeometry args={[0.026, 0.026, 0.22, 6]} />
          </mesh>
        </group>

        <mesh ref={ropeRef} material={mats.richSoil} position={[0, 2.6, 0]} castShadow>
          <cylinderGeometry args={[0.02, 0.02, 1, 5]} />
        </mesh>

        <group ref={bucketRef} position={[0, 1.55, 0]}>

          <mesh material={mats.ironSteel} position={[0, 0.38, 0]} castShadow>
            <torusGeometry args={[0.09, 0.02, 6, 12]} />
          </mesh>
          <mesh material={mats.ironSteel} position={[-0.28, 0.22, 0]} rotation={[0, 0, -0.22]} castShadow>
            <cylinderGeometry args={[0.02, 0.02, 0.40, 5]} />
          </mesh>
          <mesh material={mats.ironSteel} position={[0.28, 0.22, 0]} rotation={[0, 0, 0.22]} castShadow>
            <cylinderGeometry args={[0.02, 0.02, 0.40, 5]} />
          </mesh>

          <mesh material={mats.timberDark} castShadow receiveShadow>
            <cylinderGeometry args={[0.30, 0.24, 0.50, 8]} />
          </mesh>
          <mesh material={mats.ironHardware} position={[0, 0.16, 0]}>
            <cylinderGeometry args={[0.305, 0.305, 0.05, 8]} />
          </mesh>
          <mesh material={mats.ironHardware} position={[0, -0.13, 0]}>
            <cylinderGeometry args={[0.255, 0.255, 0.05, 8]} />
          </mesh>

          <group ref={oreInBucketRef} position={[0, 0.22, 0]}>
            <mesh material={mats.ironOre} position={[0, 0.06, 0]} castShadow>
              <dodecahedronGeometry args={[0.20, 0]} />
            </mesh>
            <mesh material={mats.ironSteel} position={[0.11, 0.08, 0.09]} castShadow>
              <dodecahedronGeometry args={[0.14, 0]} />
            </mesh>
            <mesh material={mats.charredWood} position={[-0.10, 0.07, -0.08]} castShadow>
              <dodecahedronGeometry args={[0.13, 0]} />
            </mesh>
          </group>
        </group>
      </group>

      <group position={[1.35, 0.48, 0.15]}>

        <mesh material={mats.timberPlanks} position={[-0.50, 0.70, 0]} rotation={[0, 0, 0.45]} castShadow receiveShadow>
          <boxGeometry args={[1.25, 0.05, 0.90]} />
        </mesh>
        <mesh material={mats.timberDark} position={[-0.50, 0.78, -0.43]} rotation={[0, 0, 0.45]} castShadow>
          <boxGeometry args={[1.25, 0.20, 0.04]} />
        </mesh>
        <mesh material={mats.timberDark} position={[-0.50, 0.78, 0.43]} rotation={[0, 0, 0.45]} castShadow>
          <boxGeometry args={[1.25, 0.20, 0.04]} />
        </mesh>

        <mesh material={mats.timberLogs} position={[-0.15, 0.35, -0.40]} castShadow>
          <cylinderGeometry args={[0.06, 0.06, 0.85, 5]} />
        </mesh>
        <mesh material={mats.timberLogs} position={[-0.15, 0.35, 0.40]} castShadow>
          <cylinderGeometry args={[0.06, 0.06, 0.85, 5]} />
        </mesh>

        <mesh material={mats.ironOre} position={[0.30, 0.24, -0.40]} castShadow>
          <dodecahedronGeometry args={[0.42, 0]} />
        </mesh>
        <mesh material={mats.ironSteel} position={[0.58, 0.15, -0.15]} castShadow>
          <dodecahedronGeometry args={[0.28, 0]} />
        </mesh>
        <mesh material={mats.charredWood} position={[0.20, 0.15, 0.30]} castShadow>
          <dodecahedronGeometry args={[0.26, 0]} />
        </mesh>

        <group position={[0.30, 0.02, 0.65]} rotation={[0, -0.4, 0]}>
          <mesh material={mats.timberPlanks} position={[0, 0.18, 0]} castShadow>
            <boxGeometry args={[0.48, 0.24, 0.75]} />
          </mesh>
          <mesh material={mats.timberDark} position={[0, 0.12, 0.48]} rotation={[0, 0, Math.PI / 2]} castShadow>
            <cylinderGeometry args={[0.14, 0.14, 0.04, 8]} />
          </mesh>
          <mesh material={mats.timberDark} position={[-0.20, 0.22, -0.48]} rotation={[-0.2, 0, 0]} castShadow>
            <cylinderGeometry args={[0.018, 0.018, 0.65, 5]} />
          </mesh>
          <mesh material={mats.timberDark} position={[0.20, 0.22, -0.48]} rotation={[-0.2, 0, 0]} castShadow>
            <cylinderGeometry args={[0.018, 0.018, 0.65, 5]} />
          </mesh>
          <mesh material={mats.ironOre} position={[0, 0.30, 0]} castShadow>
            <dodecahedronGeometry args={[0.20, 0]} />
          </mesh>
        </group>
      </group>

      <group position={[-1.35, 0, 0]}>

        <mesh material={mats.timberPlanks} position={[0, 1.25, 0]} receiveShadow castShadow>
          <boxGeometry args={[1.35, 0.08, 2.5]} />
        </mesh>

        <mesh material={mats.stoneDark} position={[-0.45, 0.60, -1.0]} receiveShadow castShadow>
          <boxGeometry args={[0.35, 1.20, 0.35]} />
        </mesh>
        <mesh material={mats.stoneDark} position={[-0.45, 0.60, 1.0]} receiveShadow castShadow>
          <boxGeometry args={[0.35, 1.20, 0.35]} />
        </mesh>

        <group position={[0.45, 0.62, 0.85]} rotation={[0, 0, -0.35]}>
          <mesh position={[-0.14, 0, 0]} material={mats.timberLogs}>
            <boxGeometry args={[0.04, 1.45, 0.04]} />
          </mesh>
          <mesh position={[0.14, 0, 0]} material={mats.timberLogs}>
            <boxGeometry args={[0.04, 1.45, 0.04]} />
          </mesh>
          {[-0.5, -0.25, 0, 0.25, 0.5].map((ry, idx) => (
            <mesh key={`deck-ladder-${idx}`} position={[0, ry, 0]} rotation={[0, 0, Math.PI / 2]} material={mats.timberPlanks}>
              <cylinderGeometry args={[0.018, 0.018, 0.28, 4]} />
            </mesh>
          ))}
        </group>

        <mesh material={mats.timberDark} position={[0, 1.62, -0.40]} castShadow receiveShadow>
          <boxGeometry args={[0.60, 0.52, 1.05]} />
        </mesh>

        <mesh material={mats.ironHardware} position={[0, 1.94, -0.50]} castShadow>
          <boxGeometry args={[0.24, 0.16, 0.38]} />
        </mesh>

        <group position={[0.05, 1.92, -0.08]} rotation={[0, 0.3, 0]}>
          <mesh material={mats.timberLight} position={[0, 0.02, 0]} rotation={[0, 0, Math.PI / 2]} castShadow>
            <cylinderGeometry args={[0.018, 0.018, 0.52, 5]} />
          </mesh>
          <mesh material={mats.ironHardware} position={[0.22, 0.02, 0]} castShadow>
            <boxGeometry args={[0.11, 0.10, 0.10]} />
          </mesh>
        </group>

        <group position={[0.25, 2.55, 0.55]}>
          <mesh material={mats.ironHardware} castShadow>
            <cylinderGeometry args={[0.04, 0.06, 0.14, 6]} />
          </mesh>
          <mesh material={isLightOn ? mats.windowLit : mats.candleGlow} position={[0, -0.02, 0]}>
            <sphereGeometry args={[0.04, 8, 8]} />
          </mesh>
        </group>
      </group>

      <group ref={roofRef}>

        <mesh material={mats.timberLogs} position={[-1.85, 2.15, -1.15]} castShadow>
          <boxGeometry args={[0.16, 1.85, 0.16]} />
        </mesh>
        <mesh material={mats.timberLogs} position={[-1.85, 2.15, 1.15]} castShadow>
          <boxGeometry args={[0.16, 1.85, 0.16]} />
        </mesh>
        <mesh material={mats.timberLogs} position={[-0.85, 2.25, 1.15]} castShadow>
          <boxGeometry args={[0.16, 2.05, 0.16]} />
        </mesh>

        <mesh
          material={mats.timberPlanks}
          position={[-1.40, 3.10, 0]}
          rotation={[0.12, 0, -0.15]}
          castShadow
          receiveShadow
        >
          <boxGeometry args={[1.65, 0.09, 2.65]} />
        </mesh>
      </group>
    </group>
  );
}

