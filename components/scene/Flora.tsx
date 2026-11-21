"use client";

import { palette } from "./layout";

export function RoundTree({ scale = 1, color = palette.leaf }: { scale?: number; color?: string }) {
  return (
    <group scale={scale}>
      <mesh position={[0, 0.45, 0]} castShadow>
        <cylinderGeometry args={[0.09, 0.14, 0.9, 6]} />
        <meshStandardMaterial color={palette.trunk} flatShading />
      </mesh>
      <mesh position={[0, 1.25, 0]} castShadow>
        <icosahedronGeometry args={[0.62, 0]} />
        <meshStandardMaterial color={color} flatShading roughness={0.9} />
      </mesh>
      <mesh position={[0.32, 1.05, 0.15]} castShadow>
        <icosahedronGeometry args={[0.4, 0]} />
        <meshStandardMaterial color={color} flatShading roughness={0.9} />
      </mesh>
      <mesh position={[-0.28, 1.0, -0.18]} castShadow>
        <icosahedronGeometry args={[0.36, 0]} />
        <meshStandardMaterial color={color} flatShading roughness={0.9} />
      </mesh>
    </group>
  );
}

export function Cypress({ scale = 1 }: { scale?: number }) {
  return (
    <group scale={scale}>
      <mesh position={[0, 0.2, 0]}>
        <cylinderGeometry args={[0.06, 0.08, 0.4, 5]} />
        <meshStandardMaterial color={palette.trunk} flatShading />
      </mesh>
      <mesh position={[0, 1.05, 0]} castShadow scale={[1, 2.6, 1]}>
        <icosahedronGeometry args={[0.36, 0]} />
        <meshStandardMaterial color={palette.leafDeep} flatShading />
      </mesh>
    </group>
  );
}

export function Bush({ scale = 1, color = palette.leaf }: { scale?: number; color?: string }) {
  return (
    <group scale={scale}>
      <mesh position={[0, 0.22, 0]} castShadow>
        <icosahedronGeometry args={[0.32, 0]} />
        <meshStandardMaterial color={color} flatShading />
      </mesh>
      <mesh position={[0.26, 0.16, 0.08]}>
        <icosahedronGeometry args={[0.22, 0]} />
        <meshStandardMaterial color={color} flatShading />
      </mesh>
    </group>
  );
}

export function Lamp() {
  return (
    <group>
      <mesh position={[0, 0.45, 0]}>
        <cylinderGeometry args={[0.035, 0.05, 0.9, 6]} />
        <meshStandardMaterial color={palette.goldDeep} metalness={0.5} roughness={0.4} />
      </mesh>
      <mesh position={[0, 0.98, 0]}>
        <sphereGeometry args={[0.11, 10, 8]} />
        <meshStandardMaterial color="#fff6dc" emissive={palette.window} emissiveIntensity={2.2} />
      </mesh>
    </group>
  );
}
