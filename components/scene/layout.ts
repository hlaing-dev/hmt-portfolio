import type { SectionId } from "@/content/profile";

export type Vec3 = [number, number, number];

/** Grass surface height relative to an island's position. */
export const TOP_Y = 0.25;

/** "Heaven at dawn": pearl clouds, marble, gold, soft blue sky with a peach horizon. */
export const palette = {
  grass: "#9ccc6a",
  grassDark: "#7fb257",
  cloud: "#ffffff",
  cloudShade: "#eaf0ff",
  marble: "#f7f2e8",
  marbleShade: "#e4dccb",
  gold: "#e3b552",
  goldDeep: "#c8943a",
  roof: "#6f9fd8",
  ink: "#26304a",
  window: "#ffe1a1",
  trunk: "#9a7356",
  leaf: "#7dbb5a",
  leafDeep: "#5f9e48",
  blossom: "#f7b7c9",
  padauk: "#f5c842",
  water: "#bfe9ff",
  plank: "#c9a27a",
  rope: "#8d6e55",
};

export type IslandId = "hall" | "origin" | "skills" | "projects" | "contact";

export const islands: Record<IslandId, { position: Vec3; radius: number; seed: number; flora: number; clear: number }> = {
  hall: { position: [0, 0, 0], radius: 6.2, seed: 11, flora: 26, clear: 3.4 },
  origin: { position: [-12.5, 2.2, -6], radius: 3.6, seed: 23, flora: 10, clear: 1.8 },
  skills: { position: [13, 1.2, -2], radius: 3.8, seed: 37, flora: 10, clear: 2.1 },
  projects: { position: [3, -1.6, 13.5], radius: 4.8, seed: 41, flora: 9, clear: 3.6 },
  contact: { position: [-11, -2.4, 9], radius: 3.2, seed: 53, flora: 7, clear: 1.8 },
};

/** Rope bridges between islands. */
export const bridges: [IslandId, IslandId][] = [
  ["hall", "origin"],
  ["hall", "skills"],
  ["hall", "projects"],
  ["projects", "contact"],
  ["contact", "origin"],
];

/** Career stairway: one cloud step per job, oldest at the bottom. */
export const steps: Vec3[] = [
  [-5, 2.2, -11],
  [-1.4, 4.3, -13.4],
  [2.4, 6.4, -14.2],
  [6.2, 8.5, -13],
  [9.6, 10.6, -10.6],
];
export const STEP_RADIUS = 1.7;

export const views: Record<SectionId | "overview", { camera: Vec3; target: Vec3; mascot: Vec3 }> = {
  overview: { camera: [36, 26, 44], target: [0, 2.5, -1], mascot: [4.2, 3.6, 5.2] },
  about: { camera: [10, 7.5, 13], target: [0, 2.6, 0], mascot: [4.4, 2.6, 4.4] },
  origin: { camera: [-17, 8.5, 6], target: [-12.5, 4.2, -6], mascot: [-10.2, 4.2, -3.2] },
  experience: { camera: [15, 12.5, 7], target: [0.6, 6.4, -12.4], mascot: [4.8, 7.6, -8.6] },
  skills: { camera: [22, 7.5, 8], target: [13, 3.6, -2], mascot: [15.6, 3.2, 1.4] },
  projects: { camera: [7.4, 5.4, 23.5], target: [2.6, 1.6, 13.5], mascot: [7.6, 1.4, 17.4] },
  contact: { camera: [-17.5, 4, 16], target: [-11, 0.6, 9], mascot: [-13.6, 1.4, 12] },
};

/** Where the floating label for each section sits. */
export const labelAnchors: Record<SectionId, Vec3> = {
  about: [0, 7.6, 0],
  origin: [-12.5, 7.6, -6],
  experience: [9.6, 13.2, -10.6],
  skills: [13, 7.8, -2],
  projects: [3, 3.8, 13.5],
  contact: [-11, 7.4, 9],
};

/** Small deterministic PRNG so the world looks the same on every load. */
export function mulberry32(seed: number) {
  return function () {
    let t = (seed += 0x6d2b79f5);
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

/** Angle (around Y) from island a toward island b. */
export function angleTo(a: Vec3, b: Vec3) {
  return Math.atan2(b[2] - a[2], b[0] - a[0]);
}

/**
 * A point placed relative to how a section's camera sees `origin`:
 * `forward` toward the camera, `side` to the camera's right, `up` above.
 * Keeps signboards in a tidy row facing the viewer whatever the camera angle.
 */
export function along(id: SectionId, origin: Vec3, forward: number, side: number, up: number): Vec3 {
  const cam = views[id].camera;
  let dx = cam[0] - origin[0];
  let dz = cam[2] - origin[2];
  const len = Math.hypot(dx, dz) || 1;
  dx /= len;
  dz /= len;
  return [origin[0] + dx * forward + dz * side, origin[1] + up, origin[2] + dz * forward - dx * side];
}
