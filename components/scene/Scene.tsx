"use client";

import { useEffect, useRef } from "react";
import { Canvas, useFrame, useThree } from "@react-three/fiber";
import { AdaptiveDpr, CameraControls } from "@react-three/drei";
import type { SectionId } from "@/content/profile";
import { Islands } from "./Island";
import { Landmarks } from "./Landmarks";
import { Mascot } from "./Mascot";
import { Sky } from "./Sky";
import { views } from "./layout";

type Props = {
  focus: SectionId | null;
  onSelect: (id: SectionId) => void;
  onClear: () => void;
  panelSide: "right" | "bottom";
  reducedMotion: boolean;
  paused: boolean;
  onReady: () => void;
};

function CameraRig({ focus, panelSide, reducedMotion, paused }: Pick<Props, "focus" | "panelSide" | "reducedMotion" | "paused">) {
  const controls = useRef<CameraControls>(null);
  const interacting = useRef(false);
  const first = useRef(true);
  const aspect = useThree((s) => s.size.width / s.size.height);
  // Portrait screens see less horizontally, so back the camera off.
  const fit = aspect < 1 ? Math.min(1.7, 1 / aspect) * 0.95 : 1;

  useEffect(() => {
    const c = controls.current;
    if (!c) return;
    const key = focus ?? "overview";
    const view = views[key];
    const animate = !reducedMotion;

    if (first.current) {
      first.current = false;
      c.setLookAt(60, 48, 80, 0, 4, 0, false);
    }
    const [tx, ty0, tz] = view.target;
    const [cx, cy0, cz] = view.camera;
    const lift = !focus && aspect < 1 ? -9 : 0; // portrait overview: village sits above the intro card
    const ty = ty0 + lift;
    const cy = cy0 + lift;
    const k = fit * (focus ? 1.3 : 1);
    c.setLookAt(tx + (cx - tx) * k, ty + (cy - ty) * k, tz + (cz - tz) * k, tx, ty, tz, animate);
    if (focus) {
      if (panelSide === "right") c.setFocalOffset(3.2, 0, 0, animate);
      else c.setFocalOffset(0, 4.5, 0, animate); // bottom sheet: lift the subject into the top half
    } else {
      c.setFocalOffset(panelSide === "right" ? -6 : 0, panelSide === "right" ? -2.5 : 0, 0, animate);
    }
  }, [focus, panelSide, reducedMotion, fit, aspect]);

  useEffect(() => {
    const c = controls.current;
    if (!c) return;
    const start = () => (interacting.current = true);
    const end = () => (interacting.current = false);
    c.addEventListener("controlstart", start);
    c.addEventListener("controlend", end);
    return () => {
      c.removeEventListener("controlstart", start);
      c.removeEventListener("controlend", end);
    };
  }, []);

  useFrame((_, dt) => {
    const c = controls.current;
    if (!c || focus || reducedMotion || paused || interacting.current) return;
    c.azimuthAngle += dt * 0.03;
  });

  return (
    <CameraControls
      ref={controls}
      makeDefault
      minDistance={6}
      maxDistance={90}
      maxPolarAngle={Math.PI * 0.5}
      smoothTime={0.75}
      draggingSmoothTime={0.15}
    />
  );
}

export default function Scene({ focus, onSelect, onClear, panelSide, reducedMotion, paused, onReady }: Props) {
  return (
    <Canvas
      shadows
      dpr={[1, 1.75]}
      frameloop={paused ? "demand" : "always"}
      camera={{ fov: 38, near: 0.5, far: 400, position: [60, 48, 80] }}
      gl={{ antialias: true, alpha: true, powerPreference: "high-performance" }}
      onCreated={onReady}
      onPointerMissed={onClear}
    >
      <fog attach="fog" args={["#e8eefb", 70, 190]} />
      <hemisphereLight args={["#fff6e6", "#b9c8ef", 1.25]} />
      <directionalLight
        position={[-22, 30, 14]}
        intensity={2.6}
        color="#fff0d6"
        castShadow
        shadow-mapSize={[2048, 2048]}
        shadow-camera-left={-26}
        shadow-camera-right={26}
        shadow-camera-top={26}
        shadow-camera-bottom={-26}
        shadow-camera-far={90}
        shadow-bias={-0.0004}
        shadow-normalBias={0.04}
      />
      <directionalLight position={[20, 8, -16]} intensity={0.6} color="#cfe0ff" />
      <Sky />
      <Islands />
      <Landmarks focus={focus} onSelect={onSelect} />
      <Mascot focus={focus} />
      <CameraRig focus={focus} panelSide={panelSide} reducedMotion={reducedMotion} paused={paused} />
      <AdaptiveDpr pixelated />
    </Canvas>
  );
}
