import { WORLD_SIZE } from "@/lib/world-map";

export const GAME = {
  walkSpeed: 168,
  sprintSpeed: 268,
  hideWalkSpeed: 92,
  swampMul: 0.72,
  staminaMax: 100,
  staminaDrain: 28,
  staminaRegen: 16,
  matchSeconds: 180,
  catchRadius: 36,
  shardRadius: 34,
  extractRadius: 52,
  hideRadiusBoost: 0,
  hunterWalk: 132,
  hunterChase: 214,
  hunterSearch: 156,
  detectDay: 268,
  detectNight: 168,
  detectHiddenMul: 0.28,
  loseSightSeconds: 2.6,
  trapSlowSeconds: 1.6,
  trapSlowMul: 0.45,
  cameraLerp: 8,
  nightVignette: 0.72,
  dayVignette: 0.18,
} as const;

export type Rect = { x: number; y: number; w: number; h: number };
export type Vec = { x: number; y: number };

export const RUNNER_SPAWN: Vec = { x: 768, y: 220 };
export const HUNTER_SPAWN: Vec = { x: 1290, y: 180 };

export const HIDE_ZONES: Rect[] = [
  { x: 36, y: 548, w: 440, h: 400 },
  { x: 48, y: 48, w: 220, h: 180 },
];

export const TRAP_ZONES: Rect[] = [{ x: 1120, y: 560, w: 380, h: 390 }];

export const EXTRACT_ZONE: Rect = { x: 70, y: 1140, w: 360, h: 320 };

export const WATER_ZONES: Rect[] = [
  { x: 500, y: 1348, w: 540, h: 188 },
  { x: 1124, y: 1288, w: 412, h: 248 },
];

export const SWAMP_ZONE: Rect = { x: 0, y: 512, w: 512, h: 512 };

export const SHARD_SPAWNS: Array<Vec & { id: string; label: string }> = [
  { id: "crossroads", label: "Crossroads beacon", x: 768, y: 768 },
  { id: "cliffs", label: "Cliff cache", x: 210, y: 210 },
  { id: "delta", label: "Delta crate", x: 1288, y: 1188 },
];

export const HUNTER_PATROL: Vec[] = [
  { x: 1290, y: 180 },
  { x: 1280, y: 760 },
  { x: 760, y: 760 },
  { x: 760, y: 240 },
  { x: 250, y: 760 },
  { x: 1280, y: 1180 },
];

export function clamp(n: number, min: number, max: number) {
  return Math.max(min, Math.min(max, n));
}

export function dist(a: Vec, b: Vec) {
  const dx = a.x - b.x;
  const dy = a.y - b.y;
  return Math.hypot(dx, dy);
}

export function inRect(p: Vec, r: Rect) {
  return p.x >= r.x && p.x <= r.x + r.w && p.y >= r.y && p.y <= r.y + r.h;
}

export function inAny(p: Vec, rects: Rect[]) {
  return rects.some((r) => inRect(p, r));
}

export function clampWorld(p: Vec, radius = 18): Vec {
  return {
    x: clamp(p.x, radius, WORLD_SIZE - radius),
    y: clamp(p.y, radius, WORLD_SIZE - radius),
  };
}

export function formatTime(total: number) {
  const s = Math.max(0, Math.ceil(total));
  const m = Math.floor(s / 60);
  const r = s % 60;
  return `${m}:${r.toString().padStart(2, "0")}`;
}

export const BEST_KEY = "pixelpursuit.best";
export const SETTINGS_KEY = "pixelpursuit.settings";
