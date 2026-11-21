"use client";

import { memo, useLayoutEffect, useMemo, useRef } from "react";
import { useFrame } from "@react-three/fiber";
import { Sparkles } from "@react-three/drei";
import * as THREE from "three";
import { mulberry32, palette, type Vec3 } from "./layout";
import { cloudTexture, glowTexture } from "./textures";

const SUN: Vec3 = [-70, 46, -110];

function Sun() {
  const glow = useMemo(() => glowTexture(), []);
  return (
    <group position={SUN}>
      <sprite scale={[90, 90, 1]}>
        <spriteMaterial map={glow} color="#ffe2b8" transparent depthWrite={false} fog={false} opacity={0.9} />
      </sprite>
      <sprite scale={[26, 26, 1]}>
        <spriteMaterial map={glow} color="#fffaf0" transparent depthWrite={false} fog={false} />
      </sprite>
    </group>
  );
}

/** Billboard clouds: a far ring for the horizon and a floor far below. */
function CloudField() {
  const ref = useRef<THREE.Group>(null);
  const clouds = useMemo(() => {
    const rand = mulberry32(77);
    const out: { p: Vec3; s: number; v: number; o: number; tint: string }[] = [];
    for (let i = 0; i < 34; i++) {
      const a = rand() * Math.PI * 2;
      const r = 42 + rand() * 50;
      out.push({ p: [Math.cos(a) * r, -14 + rand() * 30, Math.sin(a) * r], s: 18 + rand() * 26, v: i % 4, o: 0.75 + rand() * 0.25, tint: rand() > 0.6 ? "#ffe6ee" : "#ffffff" });
    }
    for (let i = 0; i < 46; i++) {
      const a = rand() * Math.PI * 2;
      const r = rand() * 60;
      out.push({ p: [Math.cos(a) * r, -22 - rand() * 6, Math.sin(a) * r], s: 16 + rand() * 18, v: i % 4, o: 0.9, tint: "#ffffff" });
    }
    for (let i = 0; i < 10; i++) {
      const a = rand() * Math.PI * 2;
      const r = 20 + rand() * 18;
      out.push({ p: [Math.cos(a) * r, -6 + rand() * 18, Math.sin(a) * r], s: 6 + rand() * 6, v: i % 4, o: 0.6, tint: "#ffffff" });
    }
    return out;
  }, []);
  const textures = useMemo(() => [0, 1, 2, 3].map((v) => cloudTexture(v)), []);
  useFrame((_, dt) => {
    if (ref.current) ref.current.rotation.y += dt * 0.006;
  });
  return (
    <group ref={ref}>
      {clouds.map((c, i) => (
        <sprite key={i} position={c.p} scale={[c.s, c.s * 0.6, 1]}>
          <spriteMaterial map={textures[c.v]} color={c.tint} transparent opacity={c.o} depthWrite={false} />
        </sprite>
      ))}
    </group>
  );
}

/* ---------------- Doves ---------------- */

const wingGeo = (() => {
  const g = new THREE.BufferGeometry();
  g.setAttribute("position", new THREE.Float32BufferAttribute([-0.12, 0, 0, 0.16, 0, 0, -0.02, 0, 0.6], 3));
  g.computeVertexNormals();
  return g;
})();

function Bird({ offset, phase }: { offset: Vec3; phase: number }) {
  const l = useRef<THREE.Mesh>(null);
  const r = useRef<THREE.Mesh>(null);
  useFrame(({ clock }) => {
    const f = Math.sin(clock.elapsedTime * 7 + phase) * 0.75;
    if (l.current) l.current.rotation.x = -f;
    if (r.current) r.current.rotation.x = f;
  });
  return (
    <group position={offset}>
      <mesh scale={[0.32, 0.11, 0.11]}>
        <sphereGeometry args={[1, 8, 6]} />
        <meshStandardMaterial color="#ffffff" />
      </mesh>
      <mesh ref={l} geometry={wingGeo}>
        <meshStandardMaterial color="#ffffff" side={THREE.DoubleSide} />
      </mesh>
      <mesh ref={r} geometry={wingGeo} scale={[1, 1, -1]}>
        <meshStandardMaterial color="#ffffff" side={THREE.DoubleSide} />
      </mesh>
    </group>
  );
}

function Flock({ center, radius, speed, phase, size }: { center: Vec3; radius: number; speed: number; phase: number; size: number }) {
  const ref = useRef<THREE.Group>(null);
  const members = useMemo(() => {
    const out: Vec3[] = [[0, 0, 0]];
    for (let i = 1; i < size; i++) {
      const row = Math.ceil(i / 2);
      const side = i % 2 ? 1 : -1;
      out.push([-row * 0.7, Math.sin(i) * 0.15, side * row * 0.6]);
    }
    return out;
  }, [size]);
  useFrame(({ clock }) => {
    const g = ref.current;
    if (!g) return;
    const a = clock.elapsedTime * speed + phase;
    g.position.set(center[0] + Math.cos(a) * radius, center[1] + Math.sin(a * 1.7) * 1.2, center[2] + Math.sin(a) * radius);
    g.rotation.y = -(a + Math.PI / 2);
    g.rotation.z = 0.12;
  });
  return (
    <group ref={ref}>
      {members.map((m, i) => (
        <Bird key={i} offset={m} phase={phase * 3 + i * 0.8} />
      ))}
    </group>
  );
}

function Doves() {
  return (
    <group>
      <Flock center={[0, 11, 0]} radius={24} speed={0.09} phase={0} size={5} />
      <Flock center={[4, 6, 4]} radius={18} speed={0.12} phase={2.2} size={3} />
      <Flock center={[-6, 15, -8]} radius={30} speed={0.07} phase={4.1} size={4} />
    </group>
  );
}

/* ---------------- Floating lanterns ---------------- */

function Lanterns() {
  const ref = useRef<THREE.InstancedMesh>(null);
  const items = useMemo(() => {
    const rand = mulberry32(303);
    return Array.from({ length: 36 }, () => {
      const a = rand() * Math.PI * 2;
      const r = 9 + rand() * 30;
      return { x: Math.cos(a) * r, z: Math.sin(a) * r, y0: rand() * 44, v: 0.25 + rand() * 0.35, ph: rand() * 10 };
    });
  }, []);
  const d = useMemo(() => new THREE.Object3D(), []);
  const tick = (t: number) => {
    const mesh = ref.current;
    if (!mesh) return;
    items.forEach((it, i) => {
      const y = ((it.y0 + t * it.v) % 44) - 20;
      d.position.set(it.x + Math.sin(t * 0.4 + it.ph) * 0.6, y, it.z);
      d.rotation.y = t * 0.3 + it.ph;
      d.updateMatrix();
      mesh.setMatrixAt(i, d.matrix);
    });
    mesh.instanceMatrix.needsUpdate = true;
  };
  useLayoutEffect(() => tick(0));
  useFrame(({ clock }) => tick(clock.elapsedTime));
  return (
    <instancedMesh ref={ref} args={[undefined, undefined, items.length]}>
      <cylinderGeometry args={[0.16, 0.12, 0.34, 6]} />
      <meshStandardMaterial color="#ffb46b" emissive="#ff9a3c" emissiveIntensity={2.6} toneMapped={false} />
    </instancedMesh>
  );
}

export const Sky = memo(function Sky() {
  return (
    <group>
      <Sun />
      <CloudField />
      <Doves />
      <Lanterns />
      <Sparkles count={70} scale={[30, 10, 30]} position={[0, 4, 0]} size={3} speed={0.3} color={palette.gold} opacity={0.7} />
    </group>
  );
});
