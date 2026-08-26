import type { TimeOfDay } from "@/lib/world-map";
import {
  EXTRACT_ZONE,
  GAME,
  HIDE_ZONES,
  HUNTER_PATROL,
  HUNTER_SPAWN,
  RUNNER_SPAWN,
  SHARD_SPAWNS,
  SWAMP_ZONE,
  TRAP_ZONES,
  WATER_ZONES,
  clampWorld,
  dist,
  inAny,
  inRect,
  type Vec,
} from "./config";

export type HunterState = "patrol" | "chase" | "search";
export type Phase = "title" | "brief" | "play" | "pause" | "win" | "lose";
export type Difficulty = "standard" | "nightmare";

export type Sim = {
  player: Vec & { facing: 1 | -1; moving: boolean; hidden: boolean; stamina: number; sprinting: boolean };
  hunter: Vec & { facing: 1 | -1; state: HunterState; patrolIndex: number; lastSeen: Vec | null; loseTimer: number };
  shards: Array<{ id: string; label: string; x: number; y: number; taken: boolean }>;
  collected: number;
  timeLeft: number;
  trapTimer: number;
  heartbeat: number;
  spotted: boolean;
};

export function createSim(difficulty: Difficulty): Sim {
  return {
    player: { ...RUNNER_SPAWN, facing: 1, moving: false, hidden: false, stamina: GAME.staminaMax, sprinting: false },
    hunter: { ...HUNTER_SPAWN, facing: -1, state: "patrol", patrolIndex: 1, lastSeen: null, loseTimer: 0 },
    shards: SHARD_SPAWNS.map((s) => ({ ...s, taken: false })),
    collected: 0,
    timeLeft: difficulty === "nightmare" ? GAME.matchSeconds - 30 : GAME.matchSeconds,
    trapTimer: 0,
    heartbeat: 0,
    spotted: false,
  };
}

function detectRadius(time: TimeOfDay, hidden: boolean, difficulty: Difficulty) {
  const base = time === "night" ? GAME.detectNight : GAME.detectDay;
  const hard = difficulty === "nightmare" ? 1.18 : 1;
  return base * hard * (hidden ? GAME.detectHiddenMul : 1);
}

function moveToward(from: Vec, to: Vec, speed: number, dt: number) {
  const dx = to.x - from.x;
  const dy = to.y - from.y;
  const d = Math.hypot(dx, dy) || 1;
  const step = speed * dt;
  if (d <= step) return { ...to, arrived: true };
  return { x: from.x + (dx / d) * step, y: from.y + (dy / d) * step, arrived: false };
}

export function stepSim(
  sim: Sim,
  dt: number,
  input: { x: number; y: number; sprint: boolean },
  time: TimeOfDay,
  difficulty: Difficulty,
) {
  if (dt <= 0 || dt > 0.08) dt = Math.min(dt, 0.08);

  const wasHidden = sim.player.hidden;
  sim.player.hidden = inAny(sim.player, HIDE_ZONES);
  const inSwamp = inRect(sim.player, SWAMP_ZONE);
  const inWater = inAny(sim.player, WATER_ZONES);
  const inTrap = inAny(sim.player, TRAP_ZONES);
  if (inTrap && sim.trapTimer <= 0) sim.trapTimer = GAME.trapSlowSeconds;
  sim.trapTimer = Math.max(0, sim.trapTimer - dt);

  const wantSprint = input.sprint && sim.player.stamina > 4 && !sim.player.hidden;
  sim.player.sprinting = wantSprint;
  if (wantSprint) sim.player.stamina = Math.max(0, sim.player.stamina - GAME.staminaDrain * dt);
  else sim.player.stamina = Math.min(GAME.staminaMax, sim.player.stamina + GAME.staminaRegen * dt);

  let speed = wantSprint ? GAME.sprintSpeed : GAME.walkSpeed;
  if (sim.player.hidden) speed = GAME.hideWalkSpeed;
  if (inSwamp) speed *= GAME.swampMul;
  if (sim.trapTimer > 0) speed *= GAME.trapSlowMul;
  if (inWater) speed *= 0.35;

  const mag = Math.hypot(input.x, input.y);
  if (mag > 0.12) {
    const nx = input.x / mag;
    const ny = input.y / mag;
    const next = clampWorld({
      x: sim.player.x + nx * speed * dt,
      y: sim.player.y + ny * speed * dt,
    });
    if (!inAny(next, WATER_ZONES) || inWater) {
      sim.player.x = next.x;
      sim.player.y = next.y;
    } else {
      const slideX = clampWorld({ x: sim.player.x + nx * speed * dt, y: sim.player.y });
      const slideY = clampWorld({ x: sim.player.x, y: sim.player.y + ny * speed * dt });
      if (!inAny(slideX, WATER_ZONES)) {
        sim.player.x = slideX.x;
      } else if (!inAny(slideY, WATER_ZONES)) {
        sim.player.y = slideY.y;
      }
    }
    sim.player.moving = true;
    if (nx !== 0) sim.player.facing = nx > 0 ? 1 : -1;
  } else {
    sim.player.moving = false;
  }

  for (const shard of sim.shards) {
    if (!shard.taken && dist(sim.player, shard) <= GAME.shardRadius) {
      shard.taken = true;
      sim.collected += 1;
    }
  }

  const vision = detectRadius(time, sim.player.hidden && !sim.player.moving, difficulty);
  const dHunter = dist(sim.hunter, sim.player);
  const canSee = dHunter <= vision && !(sim.player.hidden && !sim.player.sprinting && dHunter > vision * 0.55);
  sim.spotted = canSee && sim.hunter.state !== "patrol";

  if (canSee) {
    sim.hunter.state = "chase";
    sim.hunter.lastSeen = { x: sim.player.x, y: sim.player.y };
    sim.hunter.loseTimer = GAME.loseSightSeconds;
  } else if (sim.hunter.state === "chase") {
    sim.hunter.loseTimer -= dt;
    if (sim.hunter.loseTimer <= 0) sim.hunter.state = "search";
  }

  let hunterSpeed = GAME.hunterWalk;
  if (sim.hunter.state === "chase") hunterSpeed = GAME.hunterChase * (difficulty === "nightmare" ? 1.12 : 1);
  if (sim.hunter.state === "search") hunterSpeed = GAME.hunterSearch;

  let dest: Vec;
  if (sim.hunter.state === "chase") dest = sim.player;
  else if (sim.hunter.state === "search" && sim.hunter.lastSeen) dest = sim.hunter.lastSeen;
  else {
    dest = HUNTER_PATROL[sim.hunter.patrolIndex % HUNTER_PATROL.length];
  }

  const moved = moveToward(sim.hunter, dest, hunterSpeed, dt);
  sim.hunter.x = moved.x;
  sim.hunter.y = moved.y;
  const hdx = dest.x - sim.hunter.x;
  if (Math.abs(hdx) > 2) sim.hunter.facing = hdx > 0 ? 1 : -1;

  if (moved.arrived) {
    if (sim.hunter.state === "search") {
      sim.hunter.state = "patrol";
      sim.hunter.lastSeen = null;
    } else if (sim.hunter.state === "patrol") {
      sim.hunter.patrolIndex = (sim.hunter.patrolIndex + 1) % HUNTER_PATROL.length;
    }
  }

  sim.timeLeft = Math.max(0, sim.timeLeft - dt);
  sim.heartbeat = dHunter < 220 ? Math.max(0, 1 - dHunter / 220) : 0;

  return {
    justHidden: !wasHidden && sim.player.hidden,
    justCaught: dHunter <= GAME.catchRadius && !sim.player.hidden,
    justTrapped: inTrap && sim.trapTimer > GAME.trapSlowSeconds - dt - 0.01,
    extracted: sim.collected >= sim.shards.length && inRect(sim.player, EXTRACT_ZONE),
    timedOut: sim.timeLeft <= 0,
    justSpotted: canSee && sim.hunter.state === "chase" && dHunter < vision * 0.85,
  };
}
