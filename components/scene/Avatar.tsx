"use client";

import { useMemo, useRef } from "react";
import { useFrame } from "@react-three/fiber";
import * as THREE from "three";
import { palette } from "./layout";
import { codeTexture } from "./textures";

/*
 * A little developer who codes at a two-monitor desk in the shade of the big treehouse tree,
 * and every so often gets up to pace about while still
 * typing on the laptop.
 *
 * Local frame: the desk is centred on the origin, monitors face +z, the chair
 * sits at +z. The model faces +z, so sitting at the desk means yaw = PI.
 */

const skin = "#e2b48c";
const hair = "#2a221d";
const hoodie = "#4a74b8";
const pants = "#34405a";
const shoe = "#f4f1ea";
const wood = "#b98a62";
const metal = "#59627a";

const CHAIR_Z = 0.62;
const WALK_R = 1.72;
const WALK_SPEED = 0.7;
const SIT_TIME = 14;
const STAND_TIME = 1;

export type WalkPoint = [x: number, z: number];

/** Default walk: out from the chair, a full lap round the desk, back in. */
function loopPoints(): WalkPoint[] {
  const pts: WalkPoint[] = [[0, CHAIR_Z]];
  for (let i = 0; i <= 48; i++) {
    const a = Math.PI / 2 + (i / 48) * Math.PI * 2;
    pts.push([Math.cos(a) * WALK_R, Math.sin(a) * WALK_R]);
  }
  pts.push([0, CHAIR_Z]);
  return pts;
}

/** Arc-length parametrised polyline in the workstation's local frame. */
function makePath(points: WalkPoint[]) {
  const lens = [0];
  for (let i = 1; i < points.length; i++) {
    lens.push(lens[i - 1] + Math.hypot(points[i][0] - points[i - 1][0], points[i][1] - points[i - 1][1]));
  }
  const total = lens[lens.length - 1];
  const at = (s: number, p: THREE.Vector3) => {
    const d = THREE.MathUtils.clamp(s, 0, total);
    let i = 1;
    while (i < lens.length - 1 && lens[i] < d) i++;
    const seg = lens[i] - lens[i - 1] || 1;
    const k = (d - lens[i - 1]) / seg;
    const [x0, z0] = points[i - 1];
    const [x1, z1] = points[i];
    return p.set(x0 + (x1 - x0) * k, 0, z0 + (z1 - z0) * k);
  };
  return { total, at };
}

const damp = (a: number, b: number, k: number, dt: number) => THREE.MathUtils.lerp(a, b, 1 - Math.exp(-k * dt));
const dampAngle = (a: number, b: number, k: number, dt: number) => {
  const d = Math.atan2(Math.sin(b - a), Math.cos(b - a));
  return a + d * (1 - Math.exp(-k * dt));
};

function Screen({ w, h, speed, tex }: { w: number; h: number; speed: number; tex: THREE.Texture }) {
  const map = useMemo(() => {
    const t = tex.clone();
    t.needsUpdate = true;
    t.repeat.set(1, h / w);
    return t;
  }, [tex, w, h]);
  useFrame((_, dt) => {
    map.offset.y -= dt * speed;
  });
  return (
    <mesh position={[0, 0, 0.021]}>
      <planeGeometry args={[w, h]} />
      <meshBasicMaterial map={map} toneMapped={false} />
    </mesh>
  );
}

function Monitor({ position, rotY, tex, speed }: { position: [number, number, number]; rotY: number; tex: THREE.Texture; speed: number }) {
  return (
    <group position={position} rotation={[0, rotY, 0]}>
      <mesh position={[0, 0.015, 0]} castShadow>
        <boxGeometry args={[0.2, 0.03, 0.14]} />
        <meshStandardMaterial color={metal} roughness={0.5} />
      </mesh>
      <mesh position={[0, 0.14, -0.02]} castShadow>
        <boxGeometry args={[0.04, 0.24, 0.03]} />
        <meshStandardMaterial color={metal} roughness={0.5} />
      </mesh>
      <group position={[0, 0.36, 0]} rotation={[-0.06, 0, 0]}>
        <mesh castShadow>
          <boxGeometry args={[0.62, 0.38, 0.04]} />
          <meshStandardMaterial color="#2b3142" roughness={0.6} />
        </mesh>
        <Screen w={0.58} h={0.34} speed={speed} tex={tex} />
      </group>
    </group>
  );
}

function Laptop({ tex, open = 1.9 }: { tex: THREE.Texture; open?: number }) {
  return (
    <group>
      <mesh position={[0, 0.01, 0]} castShadow>
        <boxGeometry args={[0.34, 0.02, 0.24]} />
        <meshStandardMaterial color="#c9ccd4" metalness={0.4} roughness={0.4} />
      </mesh>
      <mesh position={[0, 0.021, 0.03]}>
        <planeGeometry args={[0.28, 0.12]} />
        <meshStandardMaterial color="#3a3f4d" />
      </mesh>
      {/* lid hinged on the back edge; `open` is the angle between lid and base */}
      <group position={[0, 0.02, -0.12]} rotation={[-(open - Math.PI / 2), 0, 0]}>
        <mesh position={[0, 0.12, -0.006]} castShadow>
          <boxGeometry args={[0.34, 0.24, 0.012]} />
          <meshStandardMaterial color="#c9ccd4" metalness={0.4} roughness={0.4} />
        </mesh>
        <group position={[0, 0.12, -0.02]}>
          <Screen w={0.3} h={0.2} speed={0.09} tex={tex} />
        </group>
      </group>
    </group>
  );
}

function Desk({ tex, deskLaptop }: { tex: THREE.Texture; deskLaptop: React.RefObject<THREE.Group | null> }) {
  const top = 0.66;
  return (
    <group>
      <mesh position={[0, top - 0.025, 0]} castShadow receiveShadow>
        <boxGeometry args={[1.45, 0.05, 0.66]} />
        <meshStandardMaterial color={wood} roughness={0.7} />
      </mesh>
      {[-0.64, 0.64].flatMap((x) =>
        [-0.26, 0.26].map((z) => (
          <mesh key={`${x}${z}`} position={[x, (top - 0.05) / 2, z]} castShadow>
            <cylinderGeometry args={[0.025, 0.025, top - 0.05, 8]} />
            <meshStandardMaterial color={palette.goldDeep} metalness={0.4} roughness={0.5} />
          </mesh>
        )),
      )}
      <Monitor position={[-0.33, top, -0.12]} rotY={0.22} tex={tex} speed={0.05} />
      <Monitor position={[0.33, top, -0.12]} rotY={-0.22} tex={tex} speed={0.035} />
      {/* keyboard + mouse */}
      <mesh position={[-0.05, top + 0.012, 0.16]} castShadow>
        <boxGeometry args={[0.42, 0.024, 0.13]} />
        <meshStandardMaterial color="#e8e6e1" roughness={0.6} />
      </mesh>
      <mesh position={[0.26, top + 0.015, 0.17]} castShadow>
        <sphereGeometry args={[0.035, 10, 8]} />
        <meshStandardMaterial color="#e8e6e1" roughness={0.6} />
      </mesh>
      {/* laptop to the side, picked up when walking */}
      <group ref={deskLaptop} position={[0.5, top, 0.12]} rotation={[0, -0.5, 0]}>
        <Laptop tex={tex} />
      </group>
      {/* coffee */}
      <group position={[-0.58, top, 0.18]}>
        <mesh position={[0, 0.05, 0]} castShadow>
          <cylinderGeometry args={[0.04, 0.035, 0.1, 12]} />
          <meshStandardMaterial color="#f7f2e8" roughness={0.5} />
        </mesh>
        <mesh position={[0.045, 0.05, 0]} rotation={[Math.PI / 2, 0, 0]}>
          <torusGeometry args={[0.025, 0.008, 6, 12]} />
          <meshStandardMaterial color="#f7f2e8" roughness={0.5} />
        </mesh>
      </group>
      {/* little plant */}
      <group position={[0.62, top, -0.2]}>
        <mesh position={[0, 0.04, 0]}>
          <cylinderGeometry args={[0.045, 0.035, 0.08, 10]} />
          <meshStandardMaterial color="#d98e6a" roughness={0.8} />
        </mesh>
        <mesh position={[0, 0.13, 0]}>
          <icosahedronGeometry args={[0.07, 0]} />
          <meshStandardMaterial color="#7dbb5a" flatShading />
        </mesh>
      </group>
      {/* soft glow from the screens */}
      <pointLight position={[0, top + 0.4, 0.25]} color="#9fd2ff" intensity={1.2} distance={2.2} />
    </group>
  );
}

function Chair() {
  return (
    <group position={[0, 0, CHAIR_Z]}>
      <mesh position={[0, 0.36, 0]} castShadow>
        <boxGeometry args={[0.4, 0.06, 0.4]} />
        <meshStandardMaterial color="#3c465e" roughness={0.8} />
      </mesh>
      <mesh position={[0, 0.66, 0.19]} rotation={[0.08, 0, 0]} castShadow>
        <boxGeometry args={[0.38, 0.5, 0.05]} />
        <meshStandardMaterial color="#3c465e" roughness={0.8} />
      </mesh>
      <mesh position={[0, 0.18, 0]}>
        <cylinderGeometry args={[0.025, 0.025, 0.32, 8]} />
        <meshStandardMaterial color={metal} />
      </mesh>
      {[0, 1, 2, 3, 4].map((i) => {
        const a = (i / 5) * Math.PI * 2;
        return (
          <mesh key={i} position={[Math.cos(a) * 0.13, 0.03, Math.sin(a) * 0.13]} rotation={[0, -a, 0]}>
            <boxGeometry args={[0.26, 0.03, 0.04]} />
            <meshStandardMaterial color={metal} />
          </mesh>
        );
      })}
    </group>
  );
}

type Limb = { upper: THREE.Group | null; lower: THREE.Group | null };

function Coder({ tex, deskLaptop, walk }: { tex: THREE.Texture; deskLaptop: React.RefObject<THREE.Group | null>; walk?: WalkPoint[] }) {
  const root = useRef<THREE.Group>(null);
  const body = useRef<THREE.Group>(null);
  const head = useRef<THREE.Group>(null);
  const handLaptop = useRef<THREE.Group>(null);
  const legs = useRef<Limb[]>([{ upper: null, lower: null }, { upper: null, lower: null }]);
  const arms = useRef<Limb[]>([{ upper: null, lower: null }, { upper: null, lower: null }]);
  const path = useMemo(() => makePath(walk ?? loopPoints()), [walk]);
  const state = useRef({ yaw: Math.PI, sit: 1, carry: 0 });
  const p = useMemo(() => new THREE.Vector3(), []);
  const q = useMemo(() => new THREE.Vector3(), []);

  const walkTime = path.total / WALK_SPEED;
  const cycle = SIT_TIME + STAND_TIME + walkTime + STAND_TIME;

  useFrame(({ clock }, rawDt) => {
    const r = root.current;
    if (!r) return;
    const dt = Math.min(rawDt, 0.05);
    const t = clock.elapsedTime % cycle;
    const st = state.current;

    // phase: 0 sitting, 1 standing up, 2 walking, 3 sitting down
    let sitTarget = 1;
    let walking = false;
    let s = 0;
    if (t < SIT_TIME) sitTarget = 1;
    else if (t < SIT_TIME + STAND_TIME) sitTarget = 0;
    else if (t < SIT_TIME + STAND_TIME + walkTime) {
      sitTarget = 0;
      walking = true;
      s = (t - SIT_TIME - STAND_TIME) * WALK_SPEED;
    } else sitTarget = 1;

    st.sit = damp(st.sit, sitTarget, 5, dt);
    st.carry = damp(st.carry, walking || sitTarget === 0 ? 1 : 0, 6, dt);

    // position + heading
    if (walking) {
      path.at(s, p);
      path.at(Math.min(path.total, s + 0.05), q);
      const dx = q.x - p.x;
      const dz = q.z - p.z;
      if (dx * dx + dz * dz > 1e-6) st.yaw = dampAngle(st.yaw, Math.atan2(dx, dz), 8, dt);
      r.position.set(p.x, 0, p.z);
    } else {
      r.position.x = damp(r.position.x, 0, 6, dt);
      r.position.z = damp(r.position.z, CHAIR_Z, 6, dt);
      st.yaw = dampAngle(st.yaw, Math.PI, 5, dt);
    }
    r.rotation.y = st.yaw;

    const sit = st.sit;
    const gait = walking ? s * 7.5 : 0;
    const swing = walking ? Math.sin(gait) * 0.55 : 0;
    const bob = walking ? Math.abs(Math.sin(gait)) * 0.03 : 0;
    if (body.current) body.current.position.y = THREE.MathUtils.lerp(0, -0.24, sit) + bob;

    legs.current.forEach((leg, i) => {
      const sw = i === 0 ? swing : -swing;
      if (leg.upper) leg.upper.rotation.x = THREE.MathUtils.lerp(sw, -Math.PI / 2, sit);
      if (leg.lower) leg.lower.rotation.x = THREE.MathUtils.lerp(Math.max(0, -sw) * 0.9 + 0.05, Math.PI / 2, sit);
    });

    // arms: typing at the desk, or holding the laptop while walking
    const time = clock.elapsedTime;
    arms.current.forEach((arm, i) => {
      const tap = Math.sin(time * 18 + i * 1.7) * 0.06 + Math.sin(time * 11 + i) * 0.04;
      // seated: elbows forward by the ribs, forearms level so the hands rest on the keyboard
      const upperSit = -0.95;
      const lowerSit = -1.0 + tap * 0.6;
      const upperCarry = -0.4;
      const lowerCarry = -1.25 + tap * 0.6;
      const k = 1 - sit;
      if (arm.upper) {
        arm.upper.rotation.x = THREE.MathUtils.lerp(upperSit, upperCarry, k);
        arm.upper.rotation.z = (i === 0 ? 1 : -1) * THREE.MathUtils.lerp(-0.12, 0.28, k);
      }
      if (arm.lower) {
        arm.lower.rotation.x = THREE.MathUtils.lerp(lowerSit, lowerCarry, k);
        arm.lower.rotation.z = (i === 0 ? -1 : 1) * THREE.MathUtils.lerp(-0.3, 0.55, k);
      }
    });

    if (head.current) {
      head.current.rotation.x = THREE.MathUtils.lerp(0.1, 0.38, 1 - sit) + Math.sin(time * 0.7) * 0.03;
      head.current.rotation.y = sit > 0.5 ? Math.sin(time * 0.35) * 0.25 : 0;
    }

    // swap the laptop from the desk to the hands
    const c = st.carry;
    if (handLaptop.current) {
      handLaptop.current.visible = c > 0.02;
      handLaptop.current.scale.setScalar(Math.max(0.001, c));
    }
    if (deskLaptop.current) {
      deskLaptop.current.visible = c < 0.98;
      deskLaptop.current.scale.setScalar(Math.max(0.001, 1 - c));
    }
  });

  const limbRef = (store: React.RefObject<Limb[]>, i: number, key: keyof Limb) => (el: THREE.Group | null) => {
    store.current[i][key] = el;
  };

  return (
    <group ref={root} position={[0, 0, CHAIR_Z]} rotation={[0, Math.PI, 0]}>
      <group ref={body}>
        {/* legs: hip pivot at 0.64 */}
        {[-0.085, 0.085].map((x, i) => (
          <group key={x} ref={limbRef(legs, i, "upper")} position={[x, 0.64, 0]}>
            <mesh position={[0, -0.16, 0]} castShadow>
              <capsuleGeometry args={[0.065, 0.2, 4, 8]} />
              <meshStandardMaterial color={pants} roughness={0.8} />
            </mesh>
            <group ref={limbRef(legs, i, "lower")} position={[0, -0.32, 0]}>
              <mesh position={[0, -0.14, 0]} castShadow>
                <capsuleGeometry args={[0.055, 0.2, 4, 8]} />
                <meshStandardMaterial color={pants} roughness={0.8} />
              </mesh>
              <mesh position={[0, -0.3, 0.04]} castShadow>
                <boxGeometry args={[0.11, 0.07, 0.19]} />
                <meshStandardMaterial color={shoe} roughness={0.6} />
              </mesh>
            </group>
          </group>
        ))}
        {/* torso */}
        <mesh position={[0, 0.86, 0]} castShadow>
          <capsuleGeometry args={[0.17, 0.26, 4, 12]} />
          <meshStandardMaterial color={hoodie} roughness={0.85} />
        </mesh>
        {/* hood */}
        <mesh position={[0, 1.07, -0.09]} castShadow>
          <sphereGeometry args={[0.13, 12, 8]} />
          <meshStandardMaterial color={hoodie} roughness={0.85} />
        </mesh>
        {/* arms: shoulder pivot */}
        {[-0.2, 0.2].map((x, i) => (
          <group key={x} ref={limbRef(arms, i, "upper")} position={[x, 1.02, 0]}>
            <mesh position={[0, -0.12, 0]} castShadow>
              <capsuleGeometry args={[0.05, 0.16, 4, 8]} />
              <meshStandardMaterial color={hoodie} roughness={0.85} />
            </mesh>
            <group ref={limbRef(arms, i, "lower")} position={[0, -0.25, 0]}>
              <mesh position={[0, -0.1, 0]} castShadow>
                <capsuleGeometry args={[0.045, 0.14, 4, 8]} />
                <meshStandardMaterial color={hoodie} roughness={0.85} />
              </mesh>
              <mesh position={[0, -0.21, 0]}>
                <sphereGeometry args={[0.045, 8, 6]} />
                <meshStandardMaterial color={skin} roughness={0.7} />
              </mesh>
            </group>
          </group>
        ))}
        {/* head */}
        <group ref={head} position={[0, 1.16, 0]}>
          <mesh position={[0, 0.15, 0]} castShadow>
            <sphereGeometry args={[0.16, 16, 12]} />
            <meshStandardMaterial color={skin} roughness={0.7} />
          </mesh>
          <mesh position={[0, 0.2, -0.015]} castShadow>
            <sphereGeometry args={[0.168, 16, 12, 0, Math.PI * 2, 0, Math.PI / 2.1]} />
            <meshStandardMaterial color={hair} roughness={0.9} />
          </mesh>
          {/* glasses */}
          {[-0.06, 0.06].map((x) => (
            <mesh key={x} position={[x, 0.15, 0.15]}>
              <torusGeometry args={[0.035, 0.008, 6, 14]} />
              <meshStandardMaterial color="#26304a" />
            </mesh>
          ))}
          <mesh position={[0, 0.15, 0.152]}>
            <boxGeometry args={[0.04, 0.008, 0.008]} />
            <meshStandardMaterial color="#26304a" />
          </mesh>
          {/* headphones */}
          <mesh position={[0, 0.17, 0]} rotation={[0, Math.PI / 2, 0]}>
            <torusGeometry args={[0.175, 0.016, 6, 20, Math.PI]} />
            <meshStandardMaterial color="#e3b552" metalness={0.3} roughness={0.5} />
          </mesh>
          {[-0.17, 0.17].map((x) => (
            <mesh key={x} position={[x, 0.15, 0]} rotation={[0, 0, Math.PI / 2]}>
              <cylinderGeometry args={[0.05, 0.05, 0.04, 12]} />
              <meshStandardMaterial color="#e3b552" metalness={0.3} roughness={0.5} />
            </mesh>
          ))}
        </group>
        {/* laptop carried in both hands */}
        <group ref={handLaptop} position={[0, 0.8, 0.3]} rotation={[0.25, 0, 0]} visible={false}>
          <group rotation={[0, Math.PI, 0]}>
            <Laptop tex={tex} open={1.75} />
          </group>
        </group>
      </group>
    </group>
  );
}

/** Desk, chair and the developer. Place at floor level; `rotation` turns the setup toward the camera. */
export function Workstation({
  position,
  rotation,
  walk,
}: {
  position: [number, number, number];
  rotation: number;
  /** Walk route in the parent's frame, starting and ending at the chair. */
  walk?: WalkPoint[];
}) {
  const localWalk = useMemo(() => {
    if (!walk) return undefined;
    const c = Math.cos(rotation);
    const s = Math.sin(rotation);
    const pts = walk.map(([x, z]): WalkPoint => {
      const dx = x - position[0];
      const dz = z - position[2];
      // inverse of a Y rotation by `rotation`
      return [dx * c - dz * s, dx * s + dz * c];
    });
    return [[0, CHAIR_Z] as WalkPoint, ...pts, [0, CHAIR_Z] as WalkPoint];
  }, [walk, position, rotation]);
  const tex = useMemo(() => codeTexture(), []);
  const deskLaptop = useRef<THREE.Group>(null);
  return (
    <group position={position} rotation={[0, rotation, 0]}>
      <Desk tex={tex} deskLaptop={deskLaptop} />
      <Chair />
      <Coder tex={tex} deskLaptop={deskLaptop} walk={localWalk} />
    </group>
  );
}
