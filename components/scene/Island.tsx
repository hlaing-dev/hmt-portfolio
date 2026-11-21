"use client";

import { memo, useLayoutEffect, useMemo, useRef } from "react";
import { useFrame } from "@react-three/fiber";
import { Line } from "@react-three/drei";
import * as THREE from "three";
import { Bush, Cypress, Lamp, RoundTree } from "./Flora";
import {
  STEP_RADIUS,
  TOP_Y,
  angleTo,
  bridges,
  islands,
  mulberry32,
  palette,
  steps,
  type IslandId,
  type Vec3,
} from "./layout";
import { fallTexture, glowTexture } from "./textures";


/* ------------------------------------------------------------------ */
/* Cloud island: a grassy disc resting on a pile of soft cloud puffs. */
/* ------------------------------------------------------------------ */

type CloudIslandProps = {
  position: Vec3;
  radius: number;
  seed: number;
  flora: number;
  clear: number;
  paths?: number[];
  blossom?: string;
};

function usePuffs(radius: number, seed: number) {
  return useMemo(() => {
    const rand = mulberry32(seed);
    const k = Math.max(0.55, radius / 4);
    const out: { p: Vec3; s: number }[] = [];
    const rim = Math.round(radius * 3.4);
    for (let i = 0; i < rim; i++) {
      const a = (i / rim) * Math.PI * 2 + rand() * 0.3;
      const rr = radius * (0.95 + rand() * 0.08);
      out.push({ p: [Math.cos(a) * rr, -0.1 - rand() * 0.25, Math.sin(a) * rr], s: (0.5 + rand() * 0.35) * k });
    }
    const layers = [
      { y: -0.7, r: 0.78, n: 2.4, s: [1.0, 1.6] },
      { y: -1.8, r: 0.52, n: 1.6, s: [0.9, 1.4] },
      { y: -2.9, r: 0.26, n: 0.9, s: [0.7, 1.15] },
    ];
    for (const l of layers) {
      const n = Math.max(3, Math.round(radius * l.n));
      for (let i = 0; i < n; i++) {
        const a = rand() * Math.PI * 2;
        const rr = radius * l.r * Math.sqrt(rand());
        out.push({
          p: [Math.cos(a) * rr, l.y * k - rand() * 0.3, Math.sin(a) * rr],
          s: (l.s[0] + rand() * (l.s[1] - l.s[0])) * k,
        });
      }
    }
    return out;
  }, [radius, seed]);
}

function Puffs({ radius, seed }: { radius: number; seed: number }) {
  const ref = useRef<THREE.InstancedMesh>(null);
  const puffs = usePuffs(radius, seed);
  useLayoutEffect(() => {
    const mesh = ref.current;
    if (!mesh) return;
    const d = new THREE.Object3D();
    puffs.forEach((p, i) => {
      d.position.set(...p.p);
      d.scale.set(p.s, p.s * 0.82, p.s);
      d.updateMatrix();
      mesh.setMatrixAt(i, d.matrix);
    });
    mesh.instanceMatrix.needsUpdate = true;
  }, [puffs]);
  return (
    <instancedMesh ref={ref} args={[undefined, undefined, puffs.length]} receiveShadow>
      <icosahedronGeometry args={[1, 2]} />
      <meshStandardMaterial color={palette.cloud} emissive={palette.cloudShade} emissiveIntensity={0.35} roughness={1} />
    </instancedMesh>
  );
}

function Scatter({ radius, seed, flora, clear, paths = [], blossom }: Omit<CloudIslandProps, "position">) {
  const items = useMemo(() => {
    const rand = mulberry32(seed * 7 + 1);
    const out: { p: Vec3; kind: number; s: number; r: number }[] = [];
    let guard = 0;
    while (out.length < flora && guard++ < 800) {
      const a = rand() * Math.PI * 2;
      const rr = clear + rand() * (radius - clear - 0.55);
      if (rr < clear) continue;
      const nearPath = paths.some((pa) => {
        const d = Math.abs(Math.atan2(Math.sin(a - pa), Math.cos(a - pa)));
        return d * rr < 0.85;
      });
      if (nearPath) continue;
      const p: Vec3 = [Math.cos(a) * rr, TOP_Y, Math.sin(a) * rr];
      if (out.some((o) => Math.hypot(o.p[0] - p[0], o.p[2] - p[2]) < 0.75)) continue;
      out.push({ p, kind: rand(), s: 0.7 + rand() * 0.5, r: rand() * Math.PI * 2 });
    }
    return out;
  }, [radius, seed, flora, clear, paths]);

  return (
    <group>
      {items.map((it, i) => (
        <group key={i} position={it.p} rotation={[0, it.r, 0]}>
          {it.kind < 0.42 ? (
            <RoundTree scale={it.s} />
          ) : it.kind < 0.62 ? (
            <RoundTree scale={it.s * 0.9} color={blossom ?? palette.blossom} />
          ) : it.kind < 0.78 ? (
            <Cypress scale={it.s} />
          ) : (
            <Bush scale={it.s} color={it.kind > 0.9 ? palette.blossom : palette.leaf} />
          )}
        </group>
      ))}
    </group>
  );
}

function Paths({ radius, clear, paths }: { radius: number; clear: number; paths: number[] }) {
  const start = clear * 0.55;
  return (
    <group>
      {paths.map((a, i) => {
        const len = radius - start;
        const mid = start + len / 2;
        return (
          <group key={i}>
            <mesh position={[Math.cos(a) * mid, TOP_Y + 0.02, Math.sin(a) * mid]} rotation={[0, -a, 0]} receiveShadow>
              <boxGeometry args={[len, 0.04, 0.8]} />
              <meshStandardMaterial color={palette.marble} roughness={0.8} />
            </mesh>
            {[-1, 1].map((side) => {
              const lx = Math.cos(a) * (radius - 0.5) + Math.cos(a + Math.PI / 2) * 0.6 * side;
              const lz = Math.sin(a) * (radius - 0.5) + Math.sin(a + Math.PI / 2) * 0.6 * side;
              return (
                <group key={side} position={[lx, TOP_Y, lz]}>
                  <Lamp />
                </group>
              );
            })}
          </group>
        );
      })}
    </group>
  );
}

export function CloudIsland({ position, radius, seed, flora, clear, paths = [], blossom }: CloudIslandProps) {
  return (
    <group position={position}>
      <mesh position={[0, 0, 0]} receiveShadow castShadow>
        <cylinderGeometry args={[radius, radius * 0.96, 0.5, 32]} />
        <meshStandardMaterial color={palette.grass} roughness={1} />
      </mesh>
      <Puffs radius={radius} seed={seed} />
      <Paths radius={radius} clear={clear} paths={paths} />
      <Scatter radius={radius} seed={seed} flora={flora} clear={clear} paths={paths} blossom={blossom} />
    </group>
  );
}

/* ------------------------------------------------------------------ */
/* Rope bridges                                                        */
/* ------------------------------------------------------------------ */

function RopeBridge({ from, to, rFrom, rTo }: { from: Vec3; to: Vec3; rFrom: number; rTo: number }) {
  const data = useMemo(() => {
    const a = new THREE.Vector3(...from);
    const b = new THREE.Vector3(...to);
    const flat = new THREE.Vector3(b.x - a.x, 0, b.z - a.z).normalize();
    const start = a.clone().addScaledVector(flat, rFrom - 0.25).setY(a.y + TOP_Y);
    const end = b.clone().addScaledVector(flat, -(rTo - 0.25)).setY(b.y + TOP_Y);
    const dist = start.distanceTo(end);
    const sag = Math.min(1.4, dist * 0.08);
    const at = (t: number) => start.clone().lerp(end, t).setY(THREE.MathUtils.lerp(start.y, end.y, t) - Math.sin(Math.PI * t) * sag);
    const count = Math.ceil(dist / 0.34);
    const up = new THREE.Vector3(0, 1, 0);
    const side = new THREE.Vector3().crossVectors(up, flat).normalize();
    const o = new THREE.Object3D();
    const planks = Array.from({ length: count }, (_, i) => {
      const t = (i + 0.5) / count;
      const p = at(t);
      o.position.copy(p);
      o.lookAt(at(Math.min(1, t + 0.01)));
      return { p: p.toArray() as Vec3, q: o.quaternion.clone() };
    });
    const rail = (s: number) =>
      Array.from({ length: 24 }, (_, i) => {
        const t = i / 23;
        const p = at(t).addScaledVector(side, 0.46 * s);
        p.y += 0.55 + Math.sin(Math.PI * t) * sag * 0.35;
        return p;
      });
    const posts = [0, 0.25, 0.5, 0.75, 1].flatMap((t) =>
      [-1, 1].map((s) => at(t).addScaledVector(side, 0.46 * s).toArray() as Vec3)
    );
    return { planks, rails: [rail(-1), rail(1)], posts, sag };
  }, [from, to, rFrom, rTo]);

  return (
    <group>
      {data.planks.map((pl, i) => (
        <mesh key={i} position={pl.p} quaternion={pl.q} castShadow receiveShadow>
          <boxGeometry args={[0.92, 0.06, 0.26]} />
          <meshStandardMaterial color={i % 3 ? palette.plank : "#b88f68"} flatShading roughness={0.9} />
        </mesh>
      ))}
      {data.rails.map((pts, i) => (
        <Line key={i} points={pts} color={palette.rope} lineWidth={2.2} />
      ))}
      {data.posts.map((p, i) => (
        <mesh key={i} position={[p[0], p[1] + 0.3, p[2]]}>
          <cylinderGeometry args={[0.035, 0.035, 0.62, 5]} />
          <meshStandardMaterial color={palette.rope} />
        </mesh>
      ))}
    </group>
  );
}

export function Bridges() {
  return (
    <group>
      {bridges.map(([a, b]) => (
        <RopeBridge
          key={`${a}-${b}`}
          from={islands[a].position}
          to={islands[b].position}
          rFrom={islands[a].radius}
          rTo={islands[b].radius}
        />
      ))}
    </group>
  );
}

/* ------------------------------------------------------------------ */
/* Stairway of golden slabs leading up the career steps               */
/* ------------------------------------------------------------------ */

function Slabs({ from, to, rFrom, rTo, seed }: { from: Vec3; to: Vec3; rFrom: number; rTo: number; seed: number }) {
  const group = useRef<THREE.Group>(null);
  const slabs = useMemo(() => {
    const a = new THREE.Vector3(...from);
    const b = new THREE.Vector3(...to);
    const flat = new THREE.Vector3(b.x - a.x, 0, b.z - a.z);
    const heading = Math.atan2(flat.z, flat.x);
    flat.normalize();
    const start = a.clone().addScaledVector(flat, rFrom - 0.1).setY(a.y + TOP_Y);
    const end = b.clone().addScaledVector(flat, -(rTo - 0.1)).setY(b.y + TOP_Y);
    const n = Math.max(3, Math.ceil(start.distanceTo(end) / 0.62));
    return Array.from({ length: n }, (_, i) => {
      const t = (i + 0.5) / n;
      return { p: start.clone().lerp(end, t).toArray() as Vec3, heading, phase: seed + i * 0.7 };
    });
  }, [from, to, rFrom, rTo, seed]);

  useFrame(({ clock }) => {
    const g = group.current;
    if (!g) return;
    g.children.forEach((c, i) => {
      c.position.y = slabs[i].p[1] + Math.sin(clock.elapsedTime * 1.2 + slabs[i].phase) * 0.05;
    });
  });

  return (
    <group ref={group}>
      {slabs.map((s, i) => (
        <mesh key={i} position={s.p} rotation={[0, -s.heading, 0]} castShadow>
          <boxGeometry args={[0.46, 0.12, 1]} />
          <meshStandardMaterial color={palette.marble} emissive={palette.gold} emissiveIntensity={0.18} roughness={0.5} />
        </mesh>
      ))}
    </group>
  );
}

export function Stairway() {
  const hall = islands.hall;
  return (
    <group>
      <Slabs from={hall.position} to={steps[0]} rFrom={hall.radius} rTo={STEP_RADIUS} seed={1} />
      {steps.slice(1).map((s, i) => (
        <Slabs key={i} from={steps[i]} to={s} rFrom={STEP_RADIUS} rTo={STEP_RADIUS} seed={i + 2} />
      ))}
      {steps.map((s, i) => (
        <CloudIsland key={i} position={s} radius={STEP_RADIUS} seed={200 + i} flora={2} clear={1.15} />
      ))}
    </group>
  );
}

/* ------------------------------------------------------------------ */
/* A waterfall of light pouring off the hall island                   */
/* ------------------------------------------------------------------ */

export const FALL_ANGLE = 2.4;

export function LightFall() {
  const { position, radius } = islands.hall;
  const tex = useMemo(() => {
    const t = fallTexture().clone();
    t.needsUpdate = true;
    t.repeat.set(1.5, 3);
    return t;
  }, []);
  const glow = useMemo(() => glowTexture(), []);
  useFrame((_, dt) => {
    tex.offset.y += dt * 0.45;
  });
  const a = FALL_ANGLE;
  const edge = radius + 0.06;
  const ex = position[0] + Math.cos(a) * edge;
  const ez = position[2] + Math.sin(a) * edge;
  const rotY = Math.PI / 2 - a;
  const poolR = radius - 1.4;
  return (
    <group>
      {/* pool + stream on top */}
      <mesh position={[Math.cos(a) * poolR, TOP_Y + 0.03, Math.sin(a) * poolR]}>
        <cylinderGeometry args={[0.85, 0.85, 0.06, 20]} />
        <meshStandardMaterial color={palette.water} emissive="#9fdcff" emissiveIntensity={0.5} roughness={0.15} />
      </mesh>
      <mesh position={[Math.cos(a) * (radius - 0.55), TOP_Y + 0.03, Math.sin(a) * (radius - 0.55)]} rotation={[0, -a, 0]}>
        <boxGeometry args={[1.2, 0.05, 0.7]} />
        <meshStandardMaterial color={palette.water} emissive="#9fdcff" emissiveIntensity={0.5} roughness={0.15} />
      </mesh>
      <mesh position={[ex, TOP_Y - 7.6, ez]} rotation={[0, rotY, 0]}>
        <planeGeometry args={[0.75, 15.6]} />
        <meshBasicMaterial
          map={tex}
          color="#e6f6ff"
          transparent
          opacity={0.95}
          depthWrite={false}
          side={THREE.DoubleSide}
          blending={THREE.AdditiveBlending}
        />
      </mesh>
      <sprite position={[ex, TOP_Y - 0.1, ez]} scale={[2.4, 2.4, 1]}>
        <spriteMaterial map={glow} color="#e9f8ff" transparent depthWrite={false} blending={THREE.AdditiveBlending} opacity={0.8} />
      </sprite>
      <sprite position={[ex, TOP_Y - 15, ez]} scale={[6, 3, 1]}>
        <spriteMaterial map={glow} color="#ffffff" transparent depthWrite={false} opacity={0.9} />
      </sprite>
    </group>
  );
}

/* ------------------------------------------------------------------ */

function pathAnglesFor(id: IslandId) {
  const own = islands[id].position;
  const angles = bridges
    .filter(([a, b]) => a === id || b === id)
    .map(([a, b]) => angleTo(own, islands[a === id ? b : a].position));
  if (id === "hall") angles.push(angleTo(own, steps[0]), FALL_ANGLE);
  return angles;
}

export const Islands = memo(function Islands() {
  return (
    <group>
      {(Object.keys(islands) as IslandId[]).map((id) => {
        const isl = islands[id];
        return (
          <CloudIsland
            key={id}
            position={isl.position}
            radius={isl.radius}
            seed={isl.seed}
            flora={isl.flora}
            clear={isl.clear}
            paths={pathAnglesFor(id)}
            blossom={id === "origin" ? palette.padauk : undefined}
          />
        );
      })}
      <Bridges />
      <Stairway />
      <LightFall />
    </group>
  );
});
