import { SHARED_BUILDING_MATS } from '../buildingMaterials';

export function WoodenWallModel() {
  const mats = SHARED_BUILDING_MATS;
  return (
    <group>
      {[-0.32, 0, 0.32].map((px, idx) => (
        <mesh key={`log-${idx}`} material={mats.timberLogs} position={[px, 0.55, 0]} castShadow receiveShadow>
          <cylinderGeometry args={[0.07, 0.11, 1.1, 5]} />
        </mesh>
      ))}
      <mesh material={mats.timberMed} position={[0, 0.45, 0]} rotation={[0, 0, Math.PI / 2]} castShadow>
        <cylinderGeometry args={[0.05, 0.05, 0.95, 4]} />
      </mesh>
    </group>
  );
}

export function WoodenGateModel() {
  const mats = SHARED_BUILDING_MATS;
  return (
    <group>
      <mesh material={mats.timberDark} position={[-0.4, 0.65, 0]} castShadow receiveShadow>
        <cylinderGeometry args={[0.11, 0.13, 1.3, 6]} />
      </mesh>
      <mesh material={mats.timberDark} position={[0.4, 0.65, 0]} castShadow receiveShadow>
        <cylinderGeometry args={[0.11, 0.13, 1.3, 6]} />
      </mesh>
      <mesh material={mats.timberMed} position={[0, 1.25, 0]} rotation={[0, 0, Math.PI / 2]} castShadow>
        <cylinderGeometry args={[0.08, 0.08, 1.0, 4]} />
      </mesh>
      <mesh material={mats.timberPlanks} position={[0, 0.45, 0]} castShadow>
        <boxGeometry args={[0.68, 0.88, 0.06]} />
      </mesh>
    </group>
  );
}

export function StoneWallModel() {
  const mats = SHARED_BUILDING_MATS;
  return (
    <group>
      <mesh material={mats.stoneMed} position={[0, 0.45, 0]} castShadow receiveShadow>
        <boxGeometry args={[0.96, 0.9, 0.45]} />
      </mesh>
      <mesh material={mats.stoneDark} position={[-0.32, 1.0, 0]} castShadow>
        <boxGeometry args={[0.26, 0.22, 0.45]} />
      </mesh>
      <mesh material={mats.stoneDark} position={[0.32, 1.0, 0]} castShadow>
        <boxGeometry args={[0.26, 0.22, 0.45]} />
      </mesh>
    </group>
  );
}
