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
import { glowTexture } from "./textures";


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
  /** Rim angles kept free of cloud puffs (e.g. where the waterfall spills over). */
  gaps?: number[];
};

function usePuffs(radius: number, seed: number, gaps: number[] = []) {
  return useMemo(() => {
    const rand = mulberry32(seed);
    const k = Math.max(0.55, radius / 4);
    const out: { p: Vec3; s: number }[] = [];
    const rim = Math.round(radius * 3.4);
    for (let i = 0; i < rim; i++) {
      const a = (i / rim) * Math.PI * 2 + rand() * 0.3;
      const rr = radius * (0.95 + rand() * 0.08);
      const y = -0.1 - rand() * 0.25;
      const s = (0.5 + rand() * 0.35) * k;
      const blocked = gaps.some((g) => Math.abs(Math.atan2(Math.sin(a - g), Math.cos(a - g))) * rr < 1.1 + s);
      if (blocked) continue;
      out.push({ p: [Math.cos(a) * rr, y, Math.sin(a) * rr], s });
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
  }, [radius, seed, gaps]);
}

function Puffs({ radius, seed, gaps }: { radius: number; seed: number; gaps?: number[] }) {
  const ref = useRef<THREE.InstancedMesh>(null);
  const puffs = usePuffs(radius, seed, gaps);
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

export function CloudIsland({ position, radius, seed, flora, clear, paths = [], blossom, gaps }: CloudIslandProps) {
  return (
    <group position={position}>
      <mesh position={[0, 0, 0]} receiveShadow castShadow>
        <cylinderGeometry args={[radius, radius * 0.96, 0.5, 32]} />
        <meshStandardMaterial color={palette.grass} roughness={1} />
      </mesh>
      <Puffs radius={radius} seed={seed} gaps={gaps} />
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
const HALL_GAPS = [FALL_ANGLE];

const FALL_DROP = 14;
const FALL_SAMPLES = 160;

/**
 * Profile of the falling water in the island's local "outward" plane:
 * x = distance from the island centre, y = height. It runs flat along the
 * channel, curls over the lip, then drops while drifting slightly outward.
 */
function useFallCurve(radius: number) {
  return useMemo(() => {
    const top = TOP_Y + 0.07;
    const pts: THREE.Vector3[] = [];
    for (let x = radius - 1.9; x < radius - 0.05; x += 0.35) pts.push(new THREE.Vector3(x, top, 0));
    const drops = [0, 0.06, 0.22, 0.5, 0.9, 1.5, 2.3, 3.4, 4.8, 6.5, 8.5, 11, FALL_DROP];
    for (const d of drops) pts.push(new THREE.Vector3(radius + 1.9 * (1 - Math.exp(-d / 1.1)) + 0.02 * d, top - d, 0));
    const curve = new THREE.CatmullRomCurve3(pts, false, "centripetal");
    const samples = curve.getSpacedPoints(FALL_SAMPLES - 1);
    const lipIndex = samples.findIndex((p) => p.x >= radius);
    return { samples, length: curve.getLength(), lipT: lipIndex / (FALL_SAMPLES - 1) };
  }, [radius]);
}

/** Ribbon along the profile with a slight convex bulge so it reads as a body of water. */
function buildRibbon(samples: THREE.Vector3[], length: number, width: (t: number) => number, bulge: number) {
  const cols = 7;
  const n = samples.length;
  const pos: number[] = [];
  const uv: number[] = [];
  const along: number[] = [];
  const idx: number[] = [];
  for (let i = 0; i < n; i++) {
    const t = i / (n - 1);
    const p = samples[i];
    const q = samples[Math.min(n - 1, i + 1)];
    const r = samples[Math.max(0, i - 1)];
    const tx = q.x - r.x;
    const ty = q.y - r.y;
    const tl = Math.hypot(tx, ty) || 1;
    const nx = -ty / tl;
    const ny = tx / tl;
    const w = width(t);
    for (let j = 0; j < cols; j++) {
      const u = j / (cols - 1);
      const c = 2 * u - 1;
      const b = bulge * w * (1 - c * c);
      pos.push(p.x + nx * b, p.y + ny * b, c * w * 0.5);
      uv.push(u, t * length);
      along.push(t);
    }
  }
  for (let i = 0; i < n - 1; i++) {
    for (let j = 0; j < cols - 1; j++) {
      const a = i * cols + j;
      const b = a + cols;
      idx.push(a, b, a + 1, b, b + 1, a + 1);
    }
  }
  const g = new THREE.BufferGeometry();
  g.setAttribute("position", new THREE.Float32BufferAttribute(pos, 3));
  g.setAttribute("uv", new THREE.Float32BufferAttribute(uv, 2));
  g.setAttribute("aAlong", new THREE.Float32BufferAttribute(along, 1));
  g.setIndex(idx);
  g.computeBoundingSphere();
  return g;
}

const fallVertex = /* glsl */ `
  attribute float aAlong;
  varying vec2 vUv;
  varying float vT;
  void main() {
    vUv = uv;
    vT = aAlong;
    gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
  }
`;

const fallFragment = /* glsl */ `
  uniform float uTime;
  uniform float uSpeed;
  uniform float uOpacity;
  uniform float uLip;
  uniform float uFoamBias;
  uniform vec3 uDeep;
  uniform vec3 uShallow;
  uniform vec3 uFoam;
  varying vec2 vUv;
  varying float vT;

  float hash(vec2 p) { return fract(sin(dot(p, vec2(127.1, 311.7))) * 43758.5453); }
  float noise(vec2 p) {
    vec2 i = floor(p);
    vec2 f = fract(p);
    vec2 s = f * f * (3.0 - 2.0 * f);
    return mix(mix(hash(i), hash(i + vec2(1.0, 0.0)), s.x),
               mix(hash(i + vec2(0.0, 1.0)), hash(i + vec2(1.0, 1.0)), s.x), s.y);
  }

  void main() {
    float u = vUv.x;
    // water accelerates once it leaves the lip
    float fall = max(vT - uLip, 0.0);
    float flow = vUv.y - uTime * uSpeed * (0.35 + 0.65 * smoothstep(0.0, 0.12, fall));

    float coarse = noise(vec2(u * 9.0, flow * 0.35));
    float fine = noise(vec2(u * 26.0 + 3.1, flow * 0.9));
    float streak = coarse * 0.6 + fine * 0.4;

    // foam: white churn on the lip, streaky sheets lower down
    float lipFoam = exp(-pow((vT - uLip) * 14.0, 2.0));
    float foam = clamp(smoothstep(0.5, 0.85, streak) + lipFoam * 0.9 + uFoamBias, 0.0, 1.0);

    // across the ribbon: deeper in the middle, lighter at the edges
    float c = abs(u * 2.0 - 1.0);
    vec3 water = mix(uDeep, uShallow, c * c);
    vec3 col = mix(water, uFoam, foam * 0.85);

    // soft, ragged sides
    float ragged = noise(vec2(flow * 0.8, u > 0.5 ? 7.0 : 1.0)) * 0.18;
    float side = smoothstep(0.0, 0.16 + ragged, u) * smoothstep(1.0, 0.84 - ragged, u);

    // fade in from the pool, break up into strands, dissolve into mist
    float fadeIn = smoothstep(0.0, 0.05, vT);
    float breakup = mix(1.0, smoothstep(0.25, 0.7, streak), smoothstep(0.35, 0.85, vT));
    float fadeOut = 1.0 - smoothstep(0.62, 1.0, vT);

    float alpha = uOpacity * side * fadeIn * breakup * fadeOut * (0.7 + 0.3 * streak);
    gl_FragColor = vec4(col, alpha);
    #include <colorspace_fragment>
  }
`;

function FallSheet({
  geometry,
  lipT,
  speed,
  opacity,
  foamBias,
  renderOrder,
}: {
  geometry: THREE.BufferGeometry;
  lipT: number;
  speed: number;
  opacity: number;
  foamBias: number;
  renderOrder: number;
}) {
  const material = useMemo(
    () =>
      new THREE.ShaderMaterial({
        vertexShader: fallVertex,
        fragmentShader: fallFragment,
        transparent: true,
        depthWrite: false,
        side: THREE.DoubleSide,
        uniforms: {
          uTime: { value: 0 },
          uSpeed: { value: speed },
          uOpacity: { value: opacity },
          uLip: { value: lipT },
          uFoamBias: { value: foamBias },
          uDeep: { value: new THREE.Color("#4fb3e8") },
          uShallow: { value: new THREE.Color("#a9e2ff") },
          uFoam: { value: new THREE.Color("#ffffff") },
        },
      }),
    [speed, opacity, lipT, foamBias],
  );
  useFrame((_, dt) => {
    material.uniforms.uTime.value += dt;
  });
  return <mesh geometry={geometry} material={material} renderOrder={renderOrder} />;
}

/** Droplets riding the fall and spraying off the lip. */
function Spray({ samples, widthAt }: { samples: THREE.Vector3[]; widthAt: (t: number) => number }) {
  const count = 90;
  const glow = useMemo(() => glowTexture(), []);
  const state = useMemo(() => {
    const rand = mulberry32(77);
    return Array.from({ length: count }, () => ({
      t: 0.12 + rand() * 0.88,
      side: rand() * 2 - 1,
      out: rand(),
      speed: 0.09 + rand() * 0.08,
    }));
  }, []);
  const geometry = useMemo(() => {
    const g = new THREE.BufferGeometry();
    g.setAttribute("position", new THREE.Float32BufferAttribute(new Float32Array(count * 3), 3));
    return g;
  }, []);
  useFrame((_, dt) => {
    const attr = geometry.getAttribute("position") as THREE.BufferAttribute;
    const n = samples.length - 1;
    for (let i = 0; i < count; i++) {
      const d = state[i];
      d.t += d.speed * dt;
      if (d.t > 1) d.t = 0.12 + Math.random() * 0.05;
      const p = samples[Math.min(n, Math.floor(d.t * n))];
      const spread = 0.25 + d.t * 0.9;
      attr.setXYZ(i, p.x + d.out * spread * 0.6, p.y, d.side * widthAt(d.t) * 0.5 * (0.6 + spread * 0.5));
    }
    attr.needsUpdate = true;
  });
  return (
    <points geometry={geometry} frustumCulled={false}>
      <pointsMaterial map={glow} color="#f2fbff" size={0.22} sizeAttenuation transparent opacity={0.85} depthWrite={false} />
    </points>
  );
}

/** Mist billows where the water dissolves, breathing slowly. */
function Mist({ x, y }: { x: number; y: number }) {
  const glow = useMemo(() => glowTexture(), []);
  const refs = useRef<(THREE.Sprite | null)[]>([]);
  const puffs = useMemo(
    () => [
      { p: [x, y, 0] as Vec3, s: 5.5, ph: 0 },
      { p: [x + 0.6, y - 1.6, 0.9] as Vec3, s: 4.2, ph: 1.7 },
      { p: [x - 0.3, y - 1.1, -1.1] as Vec3, s: 3.8, ph: 3.1 },
      { p: [x + 0.2, y + 2.2, 0] as Vec3, s: 2.6, ph: 4.4 },
    ],
    [x, y],
  );
  useFrame(({ clock }) => {
    const t = clock.elapsedTime;
    puffs.forEach((m, i) => {
      const sp = refs.current[i];
      if (!sp) return;
      const k = 1 + Math.sin(t * 0.6 + m.ph) * 0.08;
      sp.scale.set(m.s * k, m.s * 0.7 * k, 1);
    });
  });
  return (
    <group>
      {puffs.map((m, i) => (
        <sprite key={i} ref={(el) => void (refs.current[i] = el)} position={m.p}>
          <spriteMaterial map={glow} color="#ffffff" transparent depthWrite={false} opacity={0.75} />
        </sprite>
      ))}
    </group>
  );
}

export function LightFall() {
  const { radius } = islands.hall;
  const a = FALL_ANGLE;
  const { samples, length, lipT } = useFallCurve(radius);
  const widthAt = useMemo(() => (t: number) => (t < lipT ? 0.95 : 0.95 + Math.pow((t - lipT) / (1 - lipT), 0.7) * 1.1), [lipT]);
  const core = useMemo(() => buildRibbon(samples, length, widthAt, 0.22), [samples, length, widthAt]);
  const veil = useMemo(
    () => buildRibbon(samples, length, (t) => widthAt(t) * 1.35, 0.38),
    [samples, length, widthAt],
  );
  const glow = useMemo(() => glowTexture(), []);
  const poolR = radius - 2.3;
  const last = samples[samples.length - 1];
  return (
    <group rotation={[0, -a, 0]}>
      {/* source pool */}
      <mesh position={[poolR, TOP_Y + 0.035, 0]}>
        <cylinderGeometry args={[0.85, 0.85, 0.06, 24]} />
        <meshStandardMaterial color="#7ccbf2" emissive="#9fdcff" emissiveIntensity={0.35} roughness={0.1} />
      </mesh>
      <mesh position={[poolR, TOP_Y + 0.03, 0]}>
        <cylinderGeometry args={[0.98, 0.98, 0.05, 24]} />
        <meshStandardMaterial color={palette.marble} roughness={0.6} />
      </mesh>

      <FallSheet geometry={veil} lipT={lipT} speed={1.6} opacity={0.35} foamBias={0.25} renderOrder={1} />
      <FallSheet geometry={core} lipT={lipT} speed={2.4} opacity={0.95} foamBias={0} renderOrder={2} />
      <Spray samples={samples} widthAt={widthAt} />

      {/* soft sparkle where the water curls over the lip */}
      <sprite position={[radius + 0.15, TOP_Y - 0.05, 0]} scale={[1.8, 1.2, 1]}>
        <spriteMaterial map={glow} color="#e9f8ff" transparent depthWrite={false} opacity={0.7} />
      </sprite>
      <Mist x={last.x} y={last.y + 2.5} />
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
            gaps={id === "hall" ? HALL_GAPS : undefined}
          />
        );
      })}
      <Bridges />
      <Stairway />
      <LightFall />
    </group>
  );
});
