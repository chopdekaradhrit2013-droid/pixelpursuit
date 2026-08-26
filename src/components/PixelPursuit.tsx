import { useCallback, useEffect, useRef, useState, type ReactNode, type PointerEvent } from "react";
import { audio } from "@/game/audio";
import {
  BEST_KEY,
  EXTRACT_ZONE,
  formatTime,
  GAME,
  SETTINGS_KEY,
  SHARD_SPAWNS,
} from "@/game/config";
import { createSim, stepSim, type Difficulty, type Phase, type Sim } from "@/game/engine";
import { CHARACTER_SPRITES, SPRITE_SIZE } from "@/lib/characters";
import { TILE_SIZE, WORLD_SIZE, WORLD_TILES, type TimeOfDay } from "@/lib/world-map";
import { useIsMobile } from "@/hooks/use-mobile";

type Settings = { muted: boolean; lastDifficulty: Difficulty };

function loadSettings(): Settings {
  try {
    const raw = localStorage.getItem(SETTINGS_KEY);
    if (!raw) return { muted: false, lastDifficulty: "standard" };
    const parsed = JSON.parse(raw) as Partial<Settings>;
    return {
      muted: Boolean(parsed.muted),
      lastDifficulty: parsed.lastDifficulty === "nightmare" ? "nightmare" : "standard",
    };
  } catch {
    return { muted: false, lastDifficulty: "standard" };
  }
}

function loadBest(): number {
  try {
    return Number(localStorage.getItem(BEST_KEY) || 0) || 0;
  } catch {
    return 0;
  }
}

function snapshotHud(sim: Sim) {
  return {
    px: sim.player.x,
    py: sim.player.y,
    pf: sim.player.facing,
    moving: sim.player.moving,
    hidden: sim.player.hidden,
    stamina: sim.player.stamina,
    sprinting: sim.player.sprinting,
    hx: sim.hunter.x,
    hy: sim.hunter.y,
    hf: sim.hunter.facing,
    hState: sim.hunter.state,
    collected: sim.collected,
    timeLeft: sim.timeLeft,
    shards: sim.shards.map((s) => ({ id: s.id, x: s.x, y: s.y, taken: s.taken, label: s.label })),
    heartbeat: sim.heartbeat,
    spotted: sim.spotted,
    trapTimer: sim.trapTimer,
  };
}

type Hud = ReturnType<typeof snapshotHud>;

const RUNNER_CAM_X = 500;
const RUNNER_CAM_Y = 40;

export function PixelPursuit() {
  const isMobile = useIsMobile();
  const viewportRef = useRef<HTMLDivElement>(null);
  const worldRef = useRef<HTMLDivElement>(null);
  const simRef = useRef<Sim>(createSim("standard"));
  const inputRef = useRef({ x: 0, y: 0, sprint: false });
  const keysRef = useRef(new Set<string>());
  const padRef = useRef({ x: 0, y: 0, sprint: false });
  const cameraRef = useRef({ x: RUNNER_CAM_X, y: RUNNER_CAM_Y, zoom: 1.15 });
  const lastTsRef = useRef(0);
  const hudAccRef = useRef(0);
  const collectedRef = useRef(0);
  const phaseRef = useRef<Phase>("title");
  const timeRef = useRef<TimeOfDay>("day");
  const diffRef = useRef<Difficulty>("standard");

  const [phase, setPhase] = useState<Phase>("title");
  const [time, setTime] = useState<TimeOfDay>("day");
  const [difficulty, setDifficulty] = useState<Difficulty>("standard");
  const [hud, setHud] = useState<Hud>(() => snapshotHud(simRef.current));
  const [muted, setMuted] = useState(false);
  const [best, setBest] = useState(0);
  const [flash, setFlash] = useState<string | null>(null);
  const [vw, setVw] = useState(1200);
  const [vh, setVwH] = useState(800);

  useEffect(() => {
    const s = loadSettings();
    setMuted(s.muted);
    audio.muted = s.muted;
    setDifficulty(s.lastDifficulty);
    diffRef.current = s.lastDifficulty;
    setBest(loadBest());
  }, []);

  useEffect(() => {
    const el = viewportRef.current;
    if (!el) return;
    const apply = () => {
      setVw(el.clientWidth);
      setVwH(el.clientHeight);
    };
    apply();
    const ro = new ResizeObserver(apply);
    ro.observe(el);
    return () => ro.disconnect();
  }, []);

  const persistSettings = useCallback((next: Partial<Settings>) => {
    const cur = loadSettings();
    const merged: Settings = { ...cur, ...next };
    try {
      localStorage.setItem(SETTINGS_KEY, JSON.stringify(merged));
    } catch {
      /* ignore */
    }
  }, []);

  const setPhaseBoth = useCallback((p: Phase) => {
    phaseRef.current = p;
    setPhase(p);
  }, []);

  const beginHunt = useCallback(
    (d: Difficulty) => {
      diffRef.current = d;
      setDifficulty(d);
      persistSettings({ lastDifficulty: d });
      simRef.current = createSim(d);
      collectedRef.current = 0;
      cameraRef.current = { x: RUNNER_CAM_X, y: RUNNER_CAM_Y, zoom: isMobile ? 1.05 : 1.18 };
      lastTsRef.current = 0;
      setHud(snapshotHud(simRef.current));
      audio.resume();
      audio.start();
      setPhaseBoth("play");
    },
    [isMobile, persistSettings, setPhaseBoth],
  );

  const toggleMute = useCallback(() => {
    const next = audio.toggleMute();
    setMuted(next);
    persistSettings({ muted: next });
  }, [persistSettings]);

  const toggleDay = useCallback(() => {
    const next: TimeOfDay = timeRef.current === "day" ? "night" : "day";
    timeRef.current = next;
    setTime(next);
    audio.ui();
  }, []);

  useEffect(() => {
    const onKey = (e: KeyboardEvent, down: boolean) => {
      const k = e.key.toLowerCase();
      if (["arrowup", "arrowdown", "arrowleft", "arrowright", " "].includes(k) || k === "w" || k === "a" || k === "s" || k === "d") {
        e.preventDefault();
      }
      if (down) keysRef.current.add(k);
      else keysRef.current.delete(k);

      if (down && (k === "p" || k === "escape")) {
        if (phaseRef.current === "play") setPhaseBoth("pause");
        else if (phaseRef.current === "pause") setPhaseBoth("play");
      }
      if (down && k === "m") toggleMute();
      if (down && k === "n" && phaseRef.current === "play") toggleDay();
    };
    const down = (e: KeyboardEvent) => onKey(e, true);
    const up = (e: KeyboardEvent) => onKey(e, false);
    window.addEventListener("keydown", down);
    window.addEventListener("keyup", up);
    window.addEventListener("blur", () => keysRef.current.clear());
    return () => {
      window.removeEventListener("keydown", down);
      window.removeEventListener("keyup", up);
    };
  }, [setPhaseBoth, toggleDay, toggleMute]);

  useEffect(() => {
    let raf = 0;
    const tick = (ts: number) => {
      raf = requestAnimationFrame(tick);
      const last = lastTsRef.current || ts;
      lastTsRef.current = ts;
      let dt = (ts - last) / 1000;
      if (dt > 0.05) dt = 0.05;

      const keys = keysRef.current;
      let ix = padRef.current.x;
      let iy = padRef.current.y;
      if (keys.has("w") || keys.has("arrowup")) iy -= 1;
      if (keys.has("s") || keys.has("arrowdown")) iy += 1;
      if (keys.has("a") || keys.has("arrowleft")) ix -= 1;
      if (keys.has("d") || keys.has("arrowright")) ix += 1;
      const sprint = padRef.current.sprint || keys.has("shift") || keys.has(" ");
      inputRef.current = { x: ix, y: iy, sprint };

      const cam = cameraRef.current;
      const sim = simRef.current;
      const playing = phaseRef.current === "play";

      if (playing) {
        const ev = stepSim(sim, dt, inputRef.current, timeRef.current, diffRef.current);
        if (ev.justHidden) audio.hide();
        if (ev.justTrapped) {
          audio.trap();
          setFlash("SNARE");
          window.setTimeout(() => setFlash(null), 700);
        }
        if (ev.justSpotted && sim.hunter.state === "chase") audio.alert();
        const takenNow = sim.shards.filter((s) => s.taken).length;
        if (takenNow > collectedRef.current) audio.pickup();
        collectedRef.current = takenNow;

        if (ev.justCaught) {
          audio.lose();
          setPhaseBoth("lose");
        } else if (ev.extracted) {
          audio.win();
          const score = Math.round(sim.timeLeft * 10 + sim.collected * 250);
          const prev = loadBest();
          if (score > prev) {
            try {
              localStorage.setItem(BEST_KEY, String(score));
            } catch {
              /* ignore */
            }
            setBest(score);
          }
          setPhaseBoth("win");
        } else if (ev.timedOut) {
          audio.lose();
          setPhaseBoth("lose");
        }
      }

      const targetZoom = playing ? (isMobile ? 1.02 : 1.16) : 0.72;
      cam.zoom += (targetZoom - cam.zoom) * Math.min(1, dt * 4);
      const tx = sim.player.x - vw / 2 / cam.zoom;
      const ty = sim.player.y - vh / 2 / cam.zoom;
      const lerp = 1 - Math.exp(-GAME.cameraLerp * dt);
      cam.x += (tx - cam.x) * lerp;
      cam.y += (ty - cam.y) * lerp;
      const maxX = WORLD_SIZE - vw / cam.zoom;
      const maxY = WORLD_SIZE - vh / cam.zoom;
      cam.x = Math.max(0, Math.min(maxX, cam.x));
      cam.y = Math.max(0, Math.min(maxY, cam.y));

      const world = worldRef.current;
      if (world) {
        world.style.transform = `translate(${-cam.x * cam.zoom}px, ${-cam.y * cam.zoom}px) scale(${cam.zoom})`;
      }

      hudAccRef.current += dt;
      if (hudAccRef.current >= 1 / 12) {
        hudAccRef.current = 0;
        setHud(snapshotHud(sim));
      }
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [isMobile, setPhaseBoth, vh, vw]);

  const pressPad = (dx: number, dy: number, on: boolean) => {
    if (on) {
      padRef.current.x += dx;
      padRef.current.y += dy;
    } else {
      padRef.current.x -= dx;
      padRef.current.y -= dy;
    }
  };

  const vig = time === "night" ? GAME.nightVignette : GAME.dayVignette;
  const score = Math.round(hud.timeLeft * 10 + hud.collected * 250);

  return (
    <div ref={viewportRef} className="game-viewport relative h-[100dvh] w-full overflow-hidden bg-[var(--color-world-edge)]">
      <div
        ref={worldRef}
        className="world-map absolute left-0 top-0"
        style={{ width: WORLD_SIZE, height: WORLD_SIZE }}
      >
        {WORLD_TILES.map((tile) => {
          const src = time === "day" ? tile.day ?? tile.night : tile.night;
          return (
            <img
              key={tile.id}
              alt={tile.name}
              src={src}
              className="map-tile pixelated absolute select-none"
              draggable={false}
              style={{ left: tile.x, top: tile.y, width: TILE_SIZE, height: TILE_SIZE }}
            />
          );
        })}

        {hud.shards.map((s) =>
          s.taken ? null : (
            <div
              key={s.id}
              className="shard-glow absolute z-10 h-4 w-4 rounded-full bg-amber-300 shadow-[0_0_16px_#fbbf24]"
              style={{ left: s.x, top: s.y }}
              title={s.label}
            />
          ),
        )}

        <div
          className="pointer-events-none absolute z-10 rounded-sm border border-emerald-300/40 bg-emerald-400/10"
          style={{
            left: EXTRACT_ZONE.x,
            top: EXTRACT_ZONE.y,
            width: EXTRACT_ZONE.w,
            height: EXTRACT_ZONE.h,
            opacity: hud.collected >= SHARD_SPAWNS.length ? 1 : 0.25,
          }}
        />

        <img
          alt="Hunter"
          src={CHARACTER_SPRITES.hunter}
          className="pixelated player-shadow absolute z-20 select-none"
          draggable={false}
          style={{
            left: hud.hx - SPRITE_SIZE.hunter / 2,
            top: hud.hy - SPRITE_SIZE.hunter + 8,
            width: SPRITE_SIZE.hunter,
            height: SPRITE_SIZE.hunter,
            transform: `scaleX(${hud.hf})`,
            filter: hud.hState === "chase" ? "drop-shadow(0 0 10px #ef4444)" : "none",
          }}
        />
        <img
          alt="Survivor"
          src={hud.sprinting || hud.moving ? CHARACTER_SPRITES.survivorRun : CHARACTER_SPRITES.survivorIdle}
          className="pixelated player-shadow absolute z-30 select-none"
          draggable={false}
          style={{
            left: hud.px - SPRITE_SIZE.runner / 2,
            top: hud.py - SPRITE_SIZE.runner + 8,
            width: SPRITE_SIZE.runner,
            height: SPRITE_SIZE.runner,
            transform: `scaleX(${hud.pf})`,
            opacity: hud.hidden ? 0.62 : 1,
          }}
        />
      </div>

      <div
        className="pointer-events-none absolute inset-0 z-40"
        style={{
          background: `radial-gradient(circle at 50% 48%, transparent 28%, rgba(0,0,0,${vig}) 100%)`,
        }}
      />

      {hud.hState === "chase" && phase === "play" && (
        <div className="chase-flash pointer-events-none absolute inset-x-0 top-0 z-40 h-1.5 bg-red-500" />
      )}

      {phase === "play" || phase === "pause" ? (
        <HudBar
          hud={hud}
          time={time}
          muted={muted}
          onMute={toggleMute}
          onPause={() => setPhaseBoth(phase === "pause" ? "play" : "pause")}
          onToggleDay={toggleDay}
        />
      ) : null}

      {phase === "play" && (
        <>
          <Minimap hud={hud} />
          <div className="pointer-events-none absolute bottom-4 left-1/2 z-50 -translate-x-1/2 text-center text-[11px] font-bold uppercase tracking-[0.2em] text-white/80">
            {hud.hidden ? "Hidden in cover" : hud.sprinting ? "Sprinting" : hud.hState === "chase" ? "Spotted" : "Stay low"}
            {flash ? ` · ${flash}` : ""}
          </div>
        </>
      )}

      {isMobile && phase === "play" && (
        <MobilePad
          onDir={pressPad}
          onSprint={(on) => {
            padRef.current.sprint = on;
          }}
        />
      )}

      {phase === "title" && (
        <Overlay>
          <p className="mb-2 text-xs font-bold uppercase tracking-[0.35em] text-amber-300">Operation Night Vine</p>
          <h1 className="font-[family-name:var(--font-display)] text-5xl uppercase leading-none text-white md:text-7xl">
            Pixel Pursuit
          </h1>
          <p className="mt-4 max-w-md text-sm leading-relaxed text-white/75">
            Recover three signal beacons across a seamless jungle. Break the predator’s line of sight. Extract through the southwest cave before the clock dies.
          </p>
          <p className="mt-2 text-xs text-white/50">Best extraction score · {best || "—"}</p>
          <div className="mt-8 flex flex-wrap justify-center gap-3">
            <button className="menu-btn" onClick={() => { audio.ui(); setPhaseBoth("brief"); }}>
              Briefing
            </button>
            <button className="menu-btn-ghost" onClick={() => beginHunt(difficulty)}>
              Skip to hunt
            </button>
          </div>
        </Overlay>
      )}

      {phase === "brief" && (
        <Overlay>
          <h2 className="font-[family-name:var(--font-display)] text-3xl uppercase text-white">Mission brief</h2>
          <ol className="mt-5 max-w-md space-y-2 text-left text-sm text-white/80">
            <li>1. Collect the three glowing beacons — cliffs, crossroads, river delta.</li>
            <li>2. Hide in swamp fog and cave brush. Standing still in cover shrinks detection.</li>
            <li>3. Avoid kennel snares and open water. Sprint drains stamina.</li>
            <li>4. After all beacons, run the southwest cave extraction ring.</li>
          </ol>
          <div className="mt-6 flex gap-2">
            <button
              className={difficulty === "standard" ? "menu-btn" : "menu-btn-ghost"}
              onClick={() => setDifficulty("standard")}
            >
              Standard
            </button>
            <button
              className={difficulty === "nightmare" ? "menu-btn" : "menu-btn-ghost"}
              onClick={() => setDifficulty("nightmare")}
            >
              Nightmare
            </button>
          </div>
          <div className="mt-6 flex gap-3">
            <button className="menu-btn" onClick={() => beginHunt(difficulty)}>
              Deploy
            </button>
            <button className="menu-btn-ghost" onClick={() => setPhaseBoth("title")}>
              Back
            </button>
          </div>
        </Overlay>
      )}

      {phase === "pause" && (
        <Overlay dim>
          <h2 className="font-[family-name:var(--font-display)] text-3xl uppercase text-white">Paused</h2>
          <p className="mt-2 text-sm text-white/70">P or Esc to resume</p>
          <div className="mt-6 flex gap-3">
            <button className="menu-btn" onClick={() => setPhaseBoth("play")}>
              Resume
            </button>
            <button className="menu-btn-ghost" onClick={() => setPhaseBoth("title")}>
              Abort
            </button>
          </div>
        </Overlay>
      )}

      {phase === "win" && (
        <Overlay>
          <p className="text-xs font-bold uppercase tracking-[0.3em] text-emerald-300">Extracted</p>
          <h2 className="mt-2 font-[family-name:var(--font-display)] text-4xl uppercase text-white">You made it out</h2>
          <p className="mt-3 text-sm text-white/75">Score {score} · Best {best}</p>
          <div className="mt-6 flex gap-3">
            <button className="menu-btn" onClick={() => beginHunt(difficulty)}>
              Hunt again
            </button>
            <button className="menu-btn-ghost" onClick={() => setPhaseBoth("title")}>
              Title
            </button>
          </div>
        </Overlay>
      )}

      {phase === "lose" && (
        <Overlay>
          <p className="text-xs font-bold uppercase tracking-[0.3em] text-red-400">Hunt over</p>
          <h2 className="mt-2 font-[family-name:var(--font-display)] text-4xl uppercase text-white">
            {hud.timeLeft <= 0 ? "The clock died" : "The predator caught you"}
          </h2>
          <p className="mt-3 text-sm text-white/75">
            Beacons {hud.collected}/{hud.shards.length}
          </p>
          <div className="mt-6 flex gap-3">
            <button className="menu-btn" onClick={() => beginHunt(difficulty)}>
              Retry
            </button>
            <button className="menu-btn-ghost" onClick={() => setPhaseBoth("title")}>
              Title
            </button>
          </div>
        </Overlay>
      )}
    </div>
  );
}

function Overlay({ children, dim }: { children: ReactNode; dim?: boolean }) {
  return (
    <div className={`scan-veil absolute inset-0 z-[60] flex flex-col items-center justify-center px-6 text-center ${dim ? "bg-black/55" : ""}`}>
      {children}
    </div>
  );
}

function HudBar({
  hud,
  time,
  muted,
  onMute,
  onPause,
  onToggleDay,
}: {
  hud: Hud;
  time: TimeOfDay;
  muted: boolean;
  onMute: () => void;
  onPause: () => void;
  onToggleDay: () => void;
}) {
  return (
    <div className="absolute left-3 right-3 top-3 z-50 flex items-start justify-between gap-3">
      <div className="rounded-md border border-white/15 bg-[var(--color-hud)] px-3 py-2 text-[var(--color-hud-foreground)] shadow-lg">
        <div className="flex items-baseline gap-3">
          <span className="font-[family-name:var(--font-display)] text-xl tabular-nums">{formatTime(hud.timeLeft)}</span>
          <span className="text-[10px] uppercase tracking-widest text-white/60">
            Beacons {hud.collected}/{hud.shards.length}
          </span>
        </div>
        <div className="mt-1 h-1.5 w-40 overflow-hidden rounded-full bg-white/15">
          <div className="h-full bg-amber-300" style={{ width: `${hud.stamina}%` }} />
        </div>
      </div>
      <div className="flex gap-2">
        <button className="hud-btn" onClick={onToggleDay} title="Day / night">
          {time === "day" ? "☀" : "☽"}
        </button>
        <button className="hud-btn" onClick={onMute} title="Mute">
          {muted ? "🔇" : "🔊"}
        </button>
        <button className="hud-btn" onClick={onPause} title="Pause">
          ❚❚
        </button>
      </div>
    </div>
  );
}

function Minimap({ hud }: { hud: Hud }) {
  const scale = 84 / WORLD_SIZE;
  return (
    <div className="absolute right-3 top-16 z-50 h-[84px] w-[84px] overflow-hidden rounded-md border border-white/20 bg-black/55">
      {WORLD_TILES.map((t) => (
        <div
          key={t.id}
          className="absolute bg-emerald-900/50"
          style={{ left: t.x * scale, top: t.y * scale, width: TILE_SIZE * scale, height: TILE_SIZE * scale }}
        />
      ))}
      {hud.shards
        .filter((s) => !s.taken)
        .map((s) => (
          <div
            key={s.id}
            className="absolute h-1.5 w-1.5 rounded-full bg-amber-300"
            style={{ left: s.x * scale - 1, top: s.y * scale - 1 }}
          />
        ))}
      <div
        className="absolute h-1.5 w-1.5 rounded-full bg-red-500"
        style={{ left: hud.hx * scale - 1, top: hud.hy * scale - 1 }}
      />
      <div
        className="absolute h-2 w-2 rounded-full bg-white"
        style={{ left: hud.px * scale - 2, top: hud.py * scale - 2 }}
      />
    </div>
  );
}

function MobilePad({
  onDir,
  onSprint,
}: {
  onDir: (dx: number, dy: number, on: boolean) => void;
  onSprint: (on: boolean) => void;
}) {
  const hold = (dx: number, dy: number) => ({
    onPointerDown: (e: PointerEvent) => {
      e.preventDefault();
      (e.currentTarget as HTMLButtonElement).setPointerCapture(e.pointerId);
      onDir(dx, dy, true);
    },
    onPointerUp: () => onDir(dx, dy, false),
    onPointerCancel: () => onDir(dx, dy, false),
  });
  return (
    <div className="absolute bottom-4 left-3 right-3 z-50 flex items-end justify-between">
      <div className="grid grid-cols-3 gap-1">
        <span />
        <button className="pad-btn" {...hold(0, -1)}>
          ▲
        </button>
        <span />
        <button className="pad-btn" {...hold(-1, 0)}>
          ◀
        </button>
        <span />
        <button className="pad-btn" {...hold(1, 0)}>
          ▶
        </button>
        <span />
        <button className="pad-btn" {...hold(0, 1)}>
          ▼
        </button>
        <span />
      </div>
      <button
        className="pad-btn h-16 w-16 rounded-full text-xs font-bold tracking-widest"
        onPointerDown={(e) => {
          e.preventDefault();
          onSprint(true);
        }}
        onPointerUp={() => onSprint(false)}
        onPointerCancel={() => onSprint(false)}
      >
        RUN
      </button>
    </div>
  );
}
