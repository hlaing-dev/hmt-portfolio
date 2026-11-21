"use client";

import { useMemo, useRef } from "react";
import { useFrame } from "@react-three/fiber";
import * as THREE from "three";
import { Lamp } from "./Flora";
import { palette } from "./layout";

/*
 * Origin island: a little red-brick campus schoolhouse with a clock tower,
 * for the Computer University of Mandalay. An old CRT on the window sill
 * shows the first "hello, world". Local frame: +z faces the Origin camera.
 */

const brick = "#c9775f";
const brickDark = "#a95f4a";
const trim = "#f7f2e8";
const slate = "#6b7a99";
const slateDark = "#56647f";
const wood = "#7d5a40";

const W = 2.5; // along x
const D = 1.5; // along z
const H = 1.45;
const RIDGE = 0.6;
const FRONT = D / 2;

function crtTexture() {
  const c = document.createElement("canvas");
  c.width = 128;
  c.height = 96;
  const ctx = c.getContext("2d")!;
  ctx.fillStyle = "#0d2014";
  ctx.fillRect(0, 0, 128, 96);
  ctx.fillStyle = "#7dff9a";
  ctx.font = "bold 13px monospace";
  ctx.fillText("> hello,", 8, 30);
  ctx.fillText("  world", 8, 50);
  ctx.fillText("> _", 8, 72);
  const t = new THREE.CanvasTexture(c);
  t.colorSpace = THREE.SRGBColorSpace;
  return t;
}

function Window({ x, glow }: { x: number; glow: number }) {
  return (
    <group position={[x, 0.85, FRONT + 0.01]}>
      <mesh>
        <boxGeometry args={[0.42, 0.62, 0.04]} />
        <meshStandardMaterial color={trim} roughness={0.7} />
      </mesh>
      <mesh position={[0, 0.03, 0.022]}>
        <planeGeometry args={[0.32, 0.46]} />
        <meshStandardMaterial color="#fff1c9" emissive={palette.window} emissiveIntensity={glow} />
      </mesh>
      {/* arched top */}
      <mesh position={[0, 0.31, 0.0]} rotation={[Math.PI / 2, 0, 0]}>
        <cylinderGeometry args={[0.21, 0.21, 0.04, 14, 1, false, -Math.PI / 2, Math.PI]} />
        <meshStandardMaterial color={trim} roughness={0.7} />
      </mesh>
      <mesh position={[0, 0.03, 0.03]}>
        <boxGeometry args={[0.025, 0.46, 0.01]} />
        <meshStandardMaterial color={trim} />
      </mesh>
      <mesh position={[0, -0.33, 0.04]}>
        <boxGeometry args={[0.5, 0.05, 0.1]} />
        <meshStandardMaterial color={trim} />
      </mesh>
    </group>
  );
}

/** Beige CRT sitting on a sill, blinking cursor. */
function Crt({ position }: { position: [number, number, number] }) {
  const tex = useMemo(() => crtTexture(), []);
  const cursor = useRef<THREE.Mesh>(null);
  useFrame(({ clock }) => {
    if (cursor.current) cursor.current.visible = Math.floor(clock.elapsedTime * 2) % 2 === 0;
  });
  return (
    <group position={position}>
      <mesh position={[0, 0.16, -0.06]} castShadow>
        <boxGeometry args={[0.36, 0.32, 0.34]} />
        <meshStandardMaterial color="#e6dcc4" roughness={0.6} />
      </mesh>
      <mesh position={[0, 0.17, 0.112]}>
        <planeGeometry args={[0.28, 0.21]} />
        <meshBasicMaterial map={tex} toneMapped={false} />
      </mesh>
      <mesh ref={cursor} position={[-0.06, 0.106, 0.114]}>
        <planeGeometry args={[0.03, 0.012]} />
        <meshBasicMaterial color="#7dff9a" toneMapped={false} />
      </mesh>
      {/* keyboard */}
      <mesh position={[0, 0.015, 0.2]} castShadow>
        <boxGeometry args={[0.34, 0.03, 0.12]} />
        <meshStandardMaterial color="#e6dcc4" roughness={0.6} />
      </mesh>
      <pointLight position={[0, 0.2, 0.3]} color="#7dff9a" intensity={0.4} distance={1} />
    </group>
  );
}

function ClockTower({ glow }: { glow: number }) {
  const hour = useRef<THREE.Group>(null);
  const minute = useRef<THREE.Group>(null);
  useFrame(() => {
    const now = new Date();
    const m = now.getMinutes() + now.getSeconds() / 60;
    const h = (now.getHours() % 12) + m / 60;
    if (minute.current) minute.current.rotation.z = -(m / 60) * Math.PI * 2;
    if (hour.current) hour.current.rotation.z = -(h / 12) * Math.PI * 2;
  });
  const base = H + 0.2;
  return (
    <group position={[0, 0, FRONT - 0.32]}>
      <mesh position={[0, base + 0.45, 0]} castShadow>
        <boxGeometry args={[0.62, 1.3, 0.62]} />
        <meshStandardMaterial color={brick} roughness={0.85} />
      </mesh>
      <mesh position={[0, base + 1.12, 0]}>
        <boxGeometry args={[0.72, 0.08, 0.72]} />
        <meshStandardMaterial color={trim} roughness={0.7} />
      </mesh>
      {/* clock face */}
      <group position={[0, base + 0.68, 0.315]}>
        <mesh>
          <circleGeometry args={[0.24, 24]} />
          <meshStandardMaterial color={trim} roughness={0.5} />
        </mesh>
        <mesh position={[0, 0, 0.005]}>
          <circleGeometry args={[0.2, 24]} />
          <meshStandardMaterial color="#fffaf0" emissive="#fff4d6" emissiveIntensity={0.4 * glow} />
        </mesh>
        {Array.from({ length: 12 }, (_, i) => {
          const a = (i / 12) * Math.PI * 2;
          return (
            <mesh key={i} position={[Math.sin(a) * 0.165, Math.cos(a) * 0.165, 0.01]}>
              <circleGeometry args={[i % 3 === 0 ? 0.018 : 0.01, 6]} />
              <meshBasicMaterial color={palette.ink} />
            </mesh>
          );
        })}
        <group ref={hour} position={[0, 0, 0.014]}>
          <mesh position={[0, 0.06, 0]}>
            <planeGeometry args={[0.028, 0.12]} />
            <meshBasicMaterial color={palette.ink} />
          </mesh>
        </group>
        <group ref={minute} position={[0, 0, 0.018]}>
          <mesh position={[0, 0.08, 0]}>
            <planeGeometry args={[0.018, 0.16]} />
            <meshBasicMaterial color={palette.ink} />
          </mesh>
        </group>
      </group>
      {/* belfry openings */}
      <mesh position={[0, base + 1.38, 0]}>
        <boxGeometry args={[0.5, 0.45, 0.5]} />
        <meshStandardMaterial color={trim} roughness={0.7} />
      </mesh>
      <mesh position={[0, base + 1.38, 0.255]}>
        <planeGeometry args={[0.24, 0.3]} />
        <meshStandardMaterial color="#3b3f4f" />
      </mesh>
      <mesh position={[0, base + 1.85, 0]} rotation={[0, Math.PI / 4, 0]} castShadow>
        <coneGeometry args={[0.48, 0.55, 4]} />
        <meshStandardMaterial color={slate} roughness={0.7} flatShading />
      </mesh>
      <mesh position={[0, base + 2.2, 0]}>
        <sphereGeometry args={[0.05, 8, 6]} />
        <meshStandardMaterial color={palette.gold} metalness={0.4} />
      </mesh>
    </group>
  );
}

function Roof() {
  const half = D / 2;
  const pitch = Math.atan2(RIDGE, half);
  const slope = Math.hypot(half, RIDGE) + 0.22;
  const geo = useMemo(() => {
    const shape = new THREE.Shape();
    shape.moveTo(-half, 0);
    shape.lineTo(half, 0);
    shape.lineTo(0, RIDGE);
    shape.closePath();
    const g = new THREE.ExtrudeGeometry(shape, { depth: W, bevelEnabled: false });
    g.translate(0, 0, -W / 2);
    g.rotateY(Math.PI / 2);
    return g;
  }, [half]);
  return (
    <group position={[0, H, 0]}>
      <mesh geometry={geo}>
        <meshStandardMaterial color={brick} roughness={0.85} />
      </mesh>
      {[1, -1].map((s) => (
        <mesh key={s} position={[0, RIDGE / 2 + 0.03, (s * half) / 2 + s * 0.08]} rotation={[s * pitch, 0, 0]} castShadow>
          <boxGeometry args={[W + 0.3, 0.08, slope]} />
          <meshStandardMaterial color={slate} roughness={0.7} />
        </mesh>
      ))}
      <mesh position={[0, RIDGE + 0.06, 0]} rotation={[0, 0, Math.PI / 2]}>
        <cylinderGeometry args={[0.05, 0.05, W + 0.3, 6]} />
        <meshStandardMaterial color={slateDark} />
      </mesh>
    </group>
  );
}

function Bench({ position, rotY }: { position: [number, number, number]; rotY: number }) {
  return (
    <group position={position} rotation={[0, rotY, 0]}>
      <mesh position={[0, 0.24, 0]} castShadow>
        <boxGeometry args={[0.8, 0.05, 0.26]} />
        <meshStandardMaterial color="#b98a62" roughness={0.8} />
      </mesh>
      <mesh position={[0, 0.42, -0.12]} castShadow>
        <boxGeometry args={[0.8, 0.22, 0.04]} />
        <meshStandardMaterial color="#b98a62" roughness={0.8} />
      </mesh>
      {[-0.34, 0.34].map((x) => (
        <mesh key={x} position={[x, 0.12, 0]}>
          <boxGeometry args={[0.05, 0.24, 0.24]} />
          <meshStandardMaterial color="#59627a" />
        </mesh>
      ))}
      {/* stack of books */}
      {["#7fc8f8", "#f49cbb", "#f6c453"].map((c, i) => (
        <mesh key={c} position={[0.2, 0.29 + i * 0.045, 0.02]} rotation={[0, i * 0.25, 0]}>
          <boxGeometry args={[0.22, 0.04, 0.16]} />
          <meshStandardMaterial color={c} roughness={0.7} />
        </mesh>
      ))}
    </group>
  );
}

export function Schoolhouse({ rotation, active }: { rotation: number; active: boolean }) {
  const glow = active ? 1.6 : 1.0;
  return (
    <group rotation={[0, rotation, 0]}>
      {/* footing */}
      <mesh position={[0, 0.06, 0]} receiveShadow castShadow>
        <boxGeometry args={[W + 0.2, 0.12, D + 0.2]} />
        <meshStandardMaterial color={trim} roughness={0.8} />
      </mesh>
      {/* walls */}
      <mesh position={[0, H / 2, 0]} castShadow receiveShadow>
        <boxGeometry args={[W, H, D]} />
        <meshStandardMaterial color={brick} roughness={0.85} />
      </mesh>
      {/* brick courses on the front */}
      {[0.3, 0.55, 1.15, 1.35].map((y) => (
        <mesh key={y} position={[0, y, FRONT + 0.004]}>
          <planeGeometry args={[W, 0.02]} />
          <meshStandardMaterial color={brickDark} />
        </mesh>
      ))}
      {/* white trim: cornice + corner pilasters */}
      <mesh position={[0, H - 0.04, 0]}>
        <boxGeometry args={[W + 0.08, 0.1, D + 0.08]} />
        <meshStandardMaterial color={trim} roughness={0.7} />
      </mesh>
      {[-1, 1].flatMap((sx) =>
        [-1, 1].map((sz) => (
          <mesh key={`${sx}${sz}`} position={[(sx * W) / 2, H / 2, (sz * D) / 2]}>
            <boxGeometry args={[0.12, H, 0.12]} />
            <meshStandardMaterial color={trim} roughness={0.7} />
          </mesh>
        )),
      )}
      <Roof />
      <ClockTower glow={glow} />
      {/* door with fanlight and a plaque above */}
      <group position={[0, 0.12, FRONT + 0.02]}>
        <mesh position={[0, 0.42, 0]}>
          <boxGeometry args={[0.5, 0.84, 0.04]} />
          <meshStandardMaterial color={wood} roughness={0.8} />
        </mesh>
        <mesh position={[0, 0.42, 0.025]}>
          <boxGeometry args={[0.015, 0.8, 0.01]} />
          <meshStandardMaterial color="#5c4130" />
        </mesh>
        <mesh position={[0, 0.84, 0]} rotation={[Math.PI / 2, 0, 0]}>
          <cylinderGeometry args={[0.25, 0.25, 0.04, 14, 1, false, -Math.PI / 2, Math.PI]} />
          <meshStandardMaterial color="#fff1c9" emissive={palette.window} emissiveIntensity={glow * 0.7} />
        </mesh>
        <mesh position={[0, 1.18, 0]}>
          <boxGeometry args={[0.7, 0.14, 0.03]} />
          <meshStandardMaterial color={trim} roughness={0.6} />
        </mesh>
      </group>
      {/* steps */}
      {[0, 1].map((i) => (
        <mesh key={i} position={[0, 0.04 + i * 0.04, FRONT + 0.32 - i * 0.12]} receiveShadow>
          <boxGeometry args={[0.9 - i * 0.15, 0.08, 0.26]} />
          <meshStandardMaterial color={trim} roughness={0.8} />
        </mesh>
      ))}
      <Window x={-0.8} glow={glow} />
      <Window x={0.8} glow={glow} />
      {/* CRT on a little table by the right window */}
      <group position={[0.8, 0, FRONT + 0.32]}>
        <mesh position={[0, 0.3, 0]} castShadow>
          <boxGeometry args={[0.5, 0.04, 0.42]} />
          <meshStandardMaterial color="#b98a62" roughness={0.8} />
        </mesh>
        {[-0.2, 0.2].map((x) => (
          <mesh key={x} position={[x, 0.15, 0]}>
            <boxGeometry args={[0.04, 0.3, 0.36]} />
            <meshStandardMaterial color="#8a6447" />
          </mesh>
        ))}
        <Crt position={[0, 0.32, -0.04]} />
      </group>
      <Bench position={[-0.85, 0, FRONT + 0.45]} rotY={0} />
      {/* flower bed along the front */}
      {[-1.15, -0.45, 0.45, 1.15].map((x, i) => (
        <mesh key={x} position={[x, 0.16, FRONT + 0.12]}>
          <icosahedronGeometry args={[0.1, 0]} />
          <meshStandardMaterial color={[palette.padauk, palette.blossom, "#f49cbb", palette.padauk][i]} flatShading />
        </mesh>
      ))}
      {[-1, 1].map((s) => (
        <group key={s} position={[s * 1.55, 0, FRONT + 0.55]}>
          <Lamp />
        </group>
      ))}
    </group>
  );
}
