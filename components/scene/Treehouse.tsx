"use client";

import { useMemo, useRef } from "react";
import { useFrame } from "@react-three/fiber";
import * as THREE from "three";
import { Workstation, type WalkPoint } from "./Avatar";
import { Bush } from "./Flora";
import { palette } from "./layout";

/*
 * The home island's centrepiece: one big shade tree with a little treehouse
 * cabin in its branches. The developer codes on a round deck in the shade
 * underneath and now and then walks a lap round the trunk.
 * Local frame: +z points toward the About camera.
 */

const bark = "#8a6447";
const barkDark = "#6e4e37";
const timber = "#b98a62";
const timberDark = "#7d5a40";
const leafA = "#7dbb5a";
const leafB = "#6aad4c";
const leafC = "#8fca68";

const TRUNK: [number, number] = [-0.2, -0.6]; // x, z
const TRUNK_H = 4.9;
const DECK_R = 2.6;
const DECK_H = 0.16;
const PLATFORM_Y = 2.7;

const DESK: [number, number, number] = [0.85, DECK_H, 1.05];
const DESK_ROT = -1.25;

/** A lap round the trunk: out from the chair, all the way round, back in. */
function trunkLoop(): WalkPoint[] {
  const r = 1.08;
  const start = Math.atan2(1.85, 0.46); // roughly toward the chair
  const pts: WalkPoint[] = [];
  for (let i = 0; i <= 40; i++) {
    const a = start - (i / 40) * Math.PI * 2;
    pts.push([TRUNK[0] + Math.cos(a) * r, TRUNK[1] + Math.sin(a) * r]);
  }
  return pts;
}
const WALK = trunkLoop();

function Trunk() {
  const geo = useMemo(() => {
    const pts = [
      [0.95, 0],
      [0.72, 0.18],
      [0.58, 0.5],
      [0.5, 1.4],
      [0.46, 2.6],
      [0.4, 3.8],
      [0.34, TRUNK_H],
      [0, TRUNK_H + 0.05],
    ].map(([x, y]) => new THREE.Vector2(x, y));
    return new THREE.LatheGeometry(pts, 9);
  }, []);
  const branches: { y: number; a: number; tilt: number; len: number }[] = [
    { y: 3.5, a: 0.3, tilt: 0.9, len: 2.1 },
    { y: 3.9, a: 2.6, tilt: 0.85, len: 1.8 },
    { y: 4.3, a: -1.8, tilt: 0.8, len: 1.6 },
    { y: 4.1, a: 1.4, tilt: 0.75, len: 1.5 },
  ];
  return (
    <group position={[TRUNK[0], 0, TRUNK[1]]}>
      <mesh geometry={geo} castShadow receiveShadow>
        <meshStandardMaterial color={bark} roughness={0.95} flatShading />
      </mesh>
      {/* roots */}
      {[0.4, 1.9, 3.3, 4.6, 5.7].map((a) => (
        <mesh key={a} position={[Math.cos(a) * 0.75, 0.08, Math.sin(a) * 0.75]} rotation={[0, -a, 0.35]} castShadow>
          <boxGeometry args={[0.7, 0.16, 0.2]} />
          <meshStandardMaterial color={barkDark} roughness={0.95} flatShading />
        </mesh>
      ))}
      {branches.map((b, i) => (
        <group key={i} position={[0, b.y, 0]} rotation={[0, -b.a, 0]}>
          <mesh position={[(Math.sin(b.tilt) * b.len) / 2, (Math.cos(b.tilt) * b.len) / 2, 0]} rotation={[0, 0, -b.tilt]} castShadow>
            <cylinderGeometry args={[0.1, 0.18, b.len, 6]} />
            <meshStandardMaterial color={bark} roughness={0.95} flatShading />
          </mesh>
        </group>
      ))}
    </group>
  );
}

function Canopy() {
  const ref = useRef<THREE.Group>(null);
  const blobs = useMemo(
    () =>
      [
        [0, 6.0, 0, 1.9, leafA],
        [1.55, 5.5, 0.5, 1.35, leafB],
        [-1.5, 5.6, 0.35, 1.4, leafC],
        [0.45, 5.45, 1.55, 1.3, leafC],
        [-0.55, 5.4, -1.45, 1.35, leafB],
        [1.0, 6.65, -0.5, 1.2, leafC],
        [-0.8, 6.75, 0.55, 1.15, leafA],
        [1.7, 5.2, -1.05, 1.05, leafA],
        [-1.6, 5.2, -0.9, 1.0, leafA],
        [-0.9, 5.15, 1.45, 1.0, leafB],
      ] as [number, number, number, number, string][],
    [],
  );
  useFrame(({ clock }) => {
    if (ref.current) ref.current.rotation.z = Math.sin(clock.elapsedTime * 0.5) * 0.012;
  });
  return (
    <group ref={ref} position={[TRUNK[0], 0, TRUNK[1]]}>
      {blobs.map(([x, y, z, r, c], i) => (
        <mesh key={i} position={[x, y, z]} castShadow>
          <icosahedronGeometry args={[r, 1]} />
          <meshStandardMaterial color={c} roughness={0.9} flatShading />
        </mesh>
      ))}
      {/* a few blossoms in the leaves */}
      {[
        [1.2, 5.0, 1.4],
        [-1.4, 5.0, 1.1],
        [0.3, 4.75, 2.1],
        [2.2, 5.2, 0.2],
        [-2.1, 5.5, 0.1],
      ].map(([x, y, z], i) => (
        <mesh key={i} position={[x, y, z]}>
          <icosahedronGeometry args={[0.16, 0]} />
          <meshStandardMaterial color={i % 2 ? palette.blossom : "#f6c453"} flatShading />
        </mesh>
      ))}
    </group>
  );
}

/** A little cabin on a platform in the branches, with a ladder down the trunk. */
function Cabin({ active }: { active: boolean }) {
  const glow = active ? 1.7 : 1.1;
  return (
    <group position={[TRUNK[0], PLATFORM_Y, TRUNK[1]]}>
      {/* platform */}
      <mesh position={[0, -0.06, 0.2]} castShadow receiveShadow>
        <cylinderGeometry args={[1.45, 1.45, 0.12, 14]} />
        <meshStandardMaterial color={timber} roughness={0.85} flatShading />
      </mesh>
      {/* braces down to the trunk */}
      {[-0.7, 0.7].map((x) => (
        <mesh key={x} position={[x * 0.75, -0.45, 0.7]} rotation={[0.5, 0, x > 0 ? -0.5 : 0.5]}>
          <boxGeometry args={[0.07, 0.9, 0.07]} />
          <meshStandardMaterial color={timberDark} />
        </mesh>
      ))}
      {/* railing round the edge */}
      {Array.from({ length: 11 }, (_, i) => {
        const a = -Math.PI * 0.15 + (i / 10) * Math.PI * 1.3;
        return (
          <mesh key={i} position={[Math.cos(a) * 1.35, 0.22, 0.2 + Math.sin(a) * 1.35]}>
            <boxGeometry args={[0.05, 0.44, 0.05]} />
            <meshStandardMaterial color={timberDark} />
          </mesh>
        );
      })}
      <mesh position={[0, 0.42, 0.2]} rotation={[Math.PI / 2, 0, -Math.PI * 0.15]}>
        <torusGeometry args={[1.35, 0.025, 4, 24, Math.PI * 1.3]} />
        <meshStandardMaterial color={timberDark} />
      </mesh>
      {/* cabin */}
      <group position={[0.15, 0, 0.55]}>
        <mesh position={[0, 0.5, 0]} castShadow>
          <boxGeometry args={[1.25, 1.0, 0.95]} />
          <meshStandardMaterial color="#d9b48a" roughness={0.85} />
        </mesh>
        {/* plank lines */}
        {[0.2, 0.45, 0.7].map((y) => (
          <mesh key={y} position={[0, y, 0.48]}>
            <boxGeometry args={[1.25, 0.02, 0.01]} />
            <meshStandardMaterial color={timberDark} />
          </mesh>
        ))}
        {/* roof */}
        {[1, -1].map((s) => (
          <mesh key={s} position={[s * 0.36, 1.2, 0]} rotation={[0, 0, -s * 0.7]} castShadow>
            <boxGeometry args={[0.95, 0.08, 1.2]} />
            <meshStandardMaterial color={palette.roof} roughness={0.7} />
          </mesh>
        ))}
        {/* gable fill */}
        <mesh position={[0, 1.0, 0]} rotation={[0, Math.PI / 4, 0]} scale={[1, 1, 1]}>
          <coneGeometry args={[0.62, 0.45, 4, 1]} />
          <meshStandardMaterial color="#d9b48a" roughness={0.85} />
        </mesh>
        {/* round window + door */}
        <mesh position={[0.3, 0.55, 0.481]}>
          <circleGeometry args={[0.17, 16]} />
          <meshStandardMaterial color="#fff1c9" emissive={palette.window} emissiveIntensity={glow} />
        </mesh>
        <mesh position={[-0.3, 0.38, 0.481]}>
          <planeGeometry args={[0.34, 0.66]} />
          <meshStandardMaterial color={timberDark} />
        </mesh>
      </group>
      {/* ladder down the trunk */}
      <group position={[-0.62, -PLATFORM_Y / 2, 0.15]} rotation={[0, 0, -0.08]}>
        {[-0.17, 0.17].map((z) => (
          <mesh key={z} position={[0, 0, z]}>
            <boxGeometry args={[0.05, PLATFORM_Y, 0.05]} />
            <meshStandardMaterial color={timberDark} />
          </mesh>
        ))}
        {Array.from({ length: 8 }, (_, i) => (
          <mesh key={i} position={[0, -PLATFORM_Y / 2 + 0.3 + i * 0.32, 0]}>
            <boxGeometry args={[0.04, 0.04, 0.36]} />
            <meshStandardMaterial color={timber} />
          </mesh>
        ))}
      </group>
    </group>
  );
}

function Deck() {
  const planks = useMemo(() => {
    const w = 0.3;
    const out: { x: number; len: number }[] = [];
    for (let x = -DECK_R + w / 2; x < DECK_R; x += w + 0.02) {
      const len = 2 * Math.sqrt(Math.max(0, DECK_R * DECK_R - x * x));
      if (len > 0.3) out.push({ x, len });
    }
    return out;
  }, []);
  return (
    <group position={[TRUNK[0], 0, TRUNK[1]]}>
      <mesh position={[0, DECK_H / 2 - 0.03, 0]} receiveShadow>
        <cylinderGeometry args={[DECK_R - 0.05, DECK_R - 0.1, DECK_H - 0.04, 28]} />
        <meshStandardMaterial color={timberDark} roughness={0.9} />
      </mesh>
      {planks.map((p, i) => (
        <mesh key={i} position={[p.x, DECK_H - 0.03, 0]} receiveShadow>
          <boxGeometry args={[0.3, 0.06, p.len]} />
          <meshStandardMaterial color={i % 3 === 1 ? "#c49a72" : "#cfa57d"} roughness={0.85} />
        </mesh>
      ))}
    </group>
  );
}

/** Rope swing on the right-hand branch, swaying gently. */
function Swing() {
  const ref = useRef<THREE.Group>(null);
  useFrame(({ clock }) => {
    if (ref.current) ref.current.rotation.z = Math.sin(clock.elapsedTime * 1.1) * 0.08;
  });
  const top = 3.75;
  const seat = 0.7;
  return (
    <group ref={ref} position={[TRUNK[0] + 1.95, top, TRUNK[1] - 0.55]}>
      {[-0.22, 0.22].map((z) => (
        <mesh key={z} position={[0, -(top - seat) / 2, z]}>
          <cylinderGeometry args={[0.012, 0.012, top - seat, 4]} />
          <meshStandardMaterial color="#8d6e55" />
        </mesh>
      ))}
      <mesh position={[0, -(top - seat), 0]} castShadow>
        <boxGeometry args={[0.3, 0.05, 0.56]} />
        <meshStandardMaterial color={timber} />
      </mesh>
    </group>
  );
}

/** Lanterns hanging from the canopy edge on thin cords. */
function Lanterns() {
  const spots: [number, number, number][] = [
    [1.6, 3.9, 1.3],
    [-1.5, 4.0, 1.4],
    [2.1, 4.0, -0.3],
    [-2.0, 4.1, -0.4],
  ];
  return (
    <group position={[TRUNK[0], 0, TRUNK[1]]}>
      {spots.map(([x, y, z], i) => (
        <group key={i} position={[x, y, z]}>
          <mesh position={[0, 0.45, 0]}>
            <cylinderGeometry args={[0.008, 0.008, 0.9, 4]} />
            <meshStandardMaterial color="#8d6e55" />
          </mesh>
          <mesh>
            <sphereGeometry args={[0.12, 10, 8]} />
            <meshStandardMaterial color="#fff6dc" emissive={palette.window} emissiveIntensity={2} />
          </mesh>
        </group>
      ))}
    </group>
  );
}

/** Big shade tree, treehouse, deck and the developer at work underneath. */
export function TreehouseStudio({ active, rotation }: { active: boolean; rotation: number }) {
  return (
    <group rotation={[0, rotation, 0]}>
      <Deck />
      <Trunk />
      <Canopy />
      <Cabin active={active} />
      <Swing />
      <Lanterns />
      {[
        [-2.6, -2.3],
        [1.9, -2.6],
        [-2.8, 0.6],
      ].map(([x, z], i) => (
        <group key={i} position={[x, 0, z]}>
          <Bush scale={0.65} color={i % 2 ? palette.leaf : palette.blossom} />
        </group>
      ))}
      <pointLight position={[0.5, 2.2, 1.2]} color="#ffe3b0" intensity={active ? 3 : 2} distance={5} />
      <Workstation position={DESK} rotation={DESK_ROT} walk={WALK} />
    </group>
  );
}
