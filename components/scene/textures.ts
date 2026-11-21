import * as THREE from "three";
import { mulberry32 } from "./layout";

const cache = new Map<string, THREE.Texture>();

function canvasTexture(key: string, size: number, draw: (ctx: CanvasRenderingContext2D, s: number) => void) {
  const hit = cache.get(key);
  if (hit) return hit;
  const c = document.createElement("canvas");
  c.width = c.height = size;
  const ctx = c.getContext("2d")!;
  draw(ctx, size);
  const tex = new THREE.CanvasTexture(c);
  tex.colorSpace = THREE.SRGBColorSpace;
  cache.set(key, tex);
  return tex;
}

/** Soft puffy cloud made of overlapping radial blobs, for billboard sprites. */
export function cloudTexture(variant = 0) {
  return canvasTexture(`cloud-${variant}`, 256, (ctx, s) => {
    const rand = mulberry32(100 + variant);
    for (let i = 0; i < 14; i++) {
      const x = s * (0.22 + rand() * 0.56);
      const y = s * (0.42 + rand() * 0.2 - (Math.abs(x / s - 0.5) < 0.2 ? 0.08 : 0));
      const r = s * (0.12 + rand() * 0.16);
      const g = ctx.createRadialGradient(x, y, 0, x, y, r);
      g.addColorStop(0, "rgba(255,255,255,0.9)");
      g.addColorStop(0.6, "rgba(255,255,255,0.45)");
      g.addColorStop(1, "rgba(255,255,255,0)");
      ctx.fillStyle = g;
      ctx.beginPath();
      ctx.arc(x, y, r, 0, Math.PI * 2);
      ctx.fill();
    }
  });
}

/** Radial glow for the sun, lanterns and mist. */
export function glowTexture() {
  return canvasTexture("glow", 128, (ctx, s) => {
    const g = ctx.createRadialGradient(s / 2, s / 2, 0, s / 2, s / 2, s / 2);
    g.addColorStop(0, "rgba(255,255,255,1)");
    g.addColorStop(0.25, "rgba(255,255,255,0.55)");
    g.addColorStop(1, "rgba(255,255,255,0)");
    ctx.fillStyle = g;
    ctx.fillRect(0, 0, s, s);
  });
}

/** Vertical streaks that scroll down to read as falling water / light. */
export function fallTexture() {
  const tex = canvasTexture("fall", 128, (ctx, s) => {
    ctx.clearRect(0, 0, s, s);
    const rand = mulberry32(9);
    for (let i = 0; i < 40; i++) {
      const x = rand() * s;
      const w = 1 + rand() * 4;
      const y = rand() * s;
      const h = s * (0.2 + rand() * 0.5);
      const g = ctx.createLinearGradient(0, y, 0, y + h);
      g.addColorStop(0, "rgba(255,255,255,0)");
      g.addColorStop(0.5, `rgba(255,255,255,${0.35 + rand() * 0.5})`);
      g.addColorStop(1, "rgba(255,255,255,0)");
      ctx.fillStyle = g;
      ctx.fillRect(x, y, w, h);
      ctx.fillRect(x, y - s, w, h); // wrap seamlessly
    }
  });
  tex.wrapS = tex.wrapT = THREE.RepeatWrapping;
  return tex;
}

/** Vertical fade used on light shafts so they dissolve at both ends. */
export function rayTexture() {
  return canvasTexture("ray", 64, (ctx, s) => {
    const g = ctx.createLinearGradient(0, 0, 0, s);
    g.addColorStop(0, "rgba(255,255,255,0)");
    g.addColorStop(0.35, "rgba(255,255,255,0.9)");
    g.addColorStop(1, "rgba(255,255,255,0)");
    ctx.fillStyle = g;
    ctx.fillRect(0, 0, s, s);
  });
}

/** Dark editor screen with syntax-coloured lines; tiles vertically so it can scroll. */
export function codeTexture() {
  const tex = canvasTexture("code", 256, (ctx, s) => {
    ctx.fillStyle = "#1d2333";
    ctx.fillRect(0, 0, s, s);
    const rand = mulberry32(31);
    const colors = ["#7fc8f8", "#f49cbb", "#f6c453", "#9be39b", "#c7a6dd", "#e6ebf5"];
    const lineH = s / 22;
    let indent = 0;
    for (let i = 0; i < 22; i++) {
      const y = i * lineH + lineH * 0.3;
      if (rand() < 0.12) continue;
      indent = Math.max(0, Math.min(3, indent + (rand() < 0.3 ? 1 : rand() < 0.3 ? -1 : 0)));
      let x = 10 + indent * 14;
      const words = 1 + Math.floor(rand() * 4);
      for (let w = 0; w < words && x < s - 12; w++) {
        const len = 12 + rand() * 46;
        ctx.fillStyle = colors[Math.floor(rand() * colors.length)];
        ctx.globalAlpha = 0.9;
        ctx.fillRect(x, y, Math.min(len, s - 12 - x), lineH * 0.42);
        x += len + 6;
      }
    }
    ctx.globalAlpha = 1;
  });
  tex.wrapS = tex.wrapT = THREE.RepeatWrapping;
  return tex;
}
