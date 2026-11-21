"use client";

import { useRef } from "react";
import { useFrame } from "@react-three/fiber";
import * as THREE from "three";
import type { SectionId } from "@/content/profile";
import { along, views } from "./layout";

const puffs: [number, number, number, number][] = [
  [0, 0, 0, 0.42],
  [-0.34, -0.06, 0, 0.3],
  [0.34, -0.06, 0, 0.3],
  [-0.16, 0.22, -0.05, 0.28],
  [0.18, 0.24, -0.05, 0.26],
];

/** Nimbus: a little cloud guide that floats over to whichever place is open. */
export function Mascot({ focus }: { focus: SectionId | null }) {
  const ref = useRef<THREE.Group>(null);
  const eyes = useRef<THREE.Group>(null);
  const target = new THREE.Vector3();
  const look = new THREE.Vector3();

  useFrame(({ clock, camera }, dt) => {
    const g = ref.current;
    if (!g) return;
    const t = clock.elapsedTime;
    target.set(...(focus ? along(focus, views[focus].target, 3, -3.2, -0.4) : views.overview.mascot));
    target.y += Math.sin(t * 1.8) * 0.15;
    g.position.lerp(target, 1 - Math.exp(-dt * 1.6));
    look.set(camera.position.x, g.position.y, camera.position.z);
    g.lookAt(look);
    g.rotation.z = Math.sin(t * 1.2) * 0.08;
    // blink
    if (eyes.current) eyes.current.scale.y = (t % 4.2) < 0.12 ? 0.15 : 1;
  });

  return (
    <group ref={ref} position={views.overview.mascot} scale={1.1}>
      {puffs.map(([x, y, z, r], i) => (
        <mesh key={i} position={[x, y, z]} castShadow>
          <icosahedronGeometry args={[r, 2]} />
          <meshStandardMaterial color="#ffffff" emissive="#eef4ff" emissiveIntensity={0.4} roughness={0.9} />
        </mesh>
      ))}
      <group ref={eyes} position={[0, 0.02, 0.38]}>
        {[-0.13, 0.13].map((x) => (
          <mesh key={x} position={[x, 0, 0]}>
            <sphereGeometry args={[0.055, 10, 8]} />
            <meshBasicMaterial color="#26304a" />
          </mesh>
        ))}
      </group>
      {[-0.24, 0.24].map((x) => (
        <mesh key={x} position={[x, -0.1, 0.34]}>
          <sphereGeometry args={[0.06, 10, 8]} />
          <meshBasicMaterial color="#f7a8bd" transparent opacity={0.8} />
        </mesh>
      ))}
      {/* tiny halo */}
      <mesh position={[0, 0.62, 0]} rotation={[Math.PI / 2.3, 0, 0]}>
        <torusGeometry args={[0.2, 0.025, 6, 24]} />
        <meshStandardMaterial color="#ffe08a" emissive="#ffcf5a" emissiveIntensity={1.6} />
      </mesh>
    </group>
  );
}
