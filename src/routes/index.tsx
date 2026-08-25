import { createFileRoute } from "@tanstack/react-router";
import { ChevronDown, ChevronLeft, ChevronRight, ChevronUp, Eye, EyeOff, MapPin, Moon, Sun, ZoomIn, ZoomOut } from "lucide-react";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { MAP_MARKERS, TILE_SIZE, WORLD_SIZE, WORLD_TILES, type TimeOfDay } from "@/lib/world-map";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "Night Hunt | Jungle World" },
      { name: "description", content: "Explore a seamless day and night jungle hunting ground." },
      { property: "og:title", content: "Night Hunt | Jungle World" },
      { property: "og:description", content: "Explore a seamless day and night jungle hunting ground." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: WorldGame,
});

type Point = { x: number; y: number };
const START: Point = { x: 768, y: 220 };
const PLAYER_RADIUS = 18;
const STEP = 10;

function WorldGame() {
  const viewportRef = useRef<HTMLDivElement>(null);
  const pressedRef = useRef(new Set<string>());
  const [player, setPlayer] = useState<Point>(START);
  const [viewport, setViewport] = useState({ width: 390, height: 844 });
  const [time, setTime] = useState<TimeOfDay>("night");
  const [zoom, setZoom] = useState(1.35);
  const [markersVisible, setMarkersVisible] = useState(true);

  useEffect(() => {
    const element = viewportRef.current;
    if (!element) return;
    const observer = new ResizeObserver(([entry]) => {
      if (!entry) return;
      setViewport({ width: entry.contentRect.width, height: entry.contentRect.height });
    });
    observer.observe(element);
    return () => observer.disconnect();
  }, []);

  const move = useCallback((dx: number, dy: number) => {
    setPlayer((current) => ({
      x: Math.max(PLAYER_RADIUS, Math.min(WORLD_SIZE - PLAYER_RADIUS, current.x + dx)),
      y: Math.max(PLAYER_RADIUS, Math.min(WORLD_SIZE - PLAYER_RADIUS, current.y + dy)),
    }));
  }, []);

  useEffect(() => {
    const onKeyDown = (event: KeyboardEvent) => {
      if (["ArrowUp", "ArrowDown", "ArrowLeft", "ArrowRight", "w", "a", "s", "d"].includes(event.key)) event.preventDefault();
      pressedRef.current.add(event.key.toLowerCase());
    };
    const onKeyUp = (event: KeyboardEvent) => pressedRef.current.delete(event.key.toLowerCase());
    window.addEventListener("keydown", onKeyDown);
    window.addEventListener("keyup", onKeyUp);
    let frame = 0;
    const tick = () => {
      const keys = pressedRef.current;
      const dx = (keys.has("d") || keys.has("arrowright") ? STEP : 0) - (keys.has("a") || keys.has("arrowleft") ? STEP : 0);
      const dy = (keys.has("s") || keys.has("arrowdown") ? STEP : 0) - (keys.has("w") || keys.has("arrowup") ? STEP : 0);
      if (dx || dy) move(dx, dy);
      frame = requestAnimationFrame(tick);
    };
    frame = requestAnimationFrame(tick);
    return () => {
      cancelAnimationFrame(frame);
      window.removeEventListener("keydown", onKeyDown);
      window.removeEventListener("keyup", onKeyUp);
    };
  }, [move]);

  const camera = useMemo(() => {
    const scaledWorld = WORLD_SIZE * zoom;
    const targetX = viewport.width / 2 - player.x * zoom;
    const targetY = viewport.height / 2 - player.y * zoom;
    return {
      x: scaledWorld <= viewport.width ? (viewport.width - scaledWorld) / 2 : Math.max(viewport.width - scaledWorld, Math.min(0, targetX)),
      y: scaledWorld <= viewport.height ? (viewport.height - scaledWorld) / 2 : Math.max(viewport.height - scaledWorld, Math.min(0, targetY)),
    };
  }, [player, viewport, zoom]);

  const visibleTiles = useMemo(() => {
    const col = Math.floor(player.x / TILE_SIZE);
    const row = Math.floor(player.y / TILE_SIZE);
    return WORLD_TILES.filter((tile) => Math.abs(tile.x / TILE_SIZE - col) <= 1 && Math.abs(tile.y / TILE_SIZE - row) <= 1);
  }, [player]);

  const currentTile = WORLD_TILES.find((tile) => player.x >= tile.x && player.x < tile.x + TILE_SIZE && player.y >= tile.y && player.y < tile.y + TILE_SIZE);
  const dayUnavailable = time === "day" && currentTile?.day === undefined;

  const holdMove = (dx: number, dy: number) => {
    move(dx, dy);
    const timer = window.setInterval(() => move(dx, dy), 60);
    const stop = () => window.clearInterval(timer);
    window.addEventListener("pointerup", stop, { once: true });
    window.addEventListener("pointercancel", stop, { once: true });
  };

  return (
    <main ref={viewportRef} className="game-viewport relative h-dvh w-screen overflow-hidden bg-world-edge" aria-label="Jungle game world">
      <div
        className="world-map absolute left-0 top-0 bg-world-edge"
        style={{ width: WORLD_SIZE, height: WORLD_SIZE, transform: `translate3d(${camera.x}px, ${camera.y}px, 0) scale(${zoom})` }}
      >
        {visibleTiles.map((tile) => {
          const source = time === "day" ? tile.day ?? tile.night : tile.night;
          return (
            <img
              key={`${tile.id}-${time}`}
              className="map-tile pixelated absolute block select-none object-cover"
              src={source}
              alt=""
              draggable={false}
              decoding="async"
              loading="eager"
              style={{ left: tile.x, top: tile.y, width: TILE_SIZE, height: TILE_SIZE }}
            />
          );
        })}

        {markersVisible && MAP_MARKERS.map((marker) => (
          <div key={marker.id} className="group absolute -translate-x-1/2 -translate-y-1/2" style={{ left: marker.x, top: marker.y }}>
            <span className={`marker-pulse block size-4 rounded-full border-2 border-hud-foreground ${marker.kind === "danger" || marker.kind === "trap" ? "bg-warning" : marker.kind === "escape" ? "bg-success" : "bg-primary"}`} />
            <span className="pointer-events-none absolute left-1/2 top-6 hidden -translate-x-1/2 whitespace-nowrap rounded bg-hud px-2 py-1 text-[9px] font-bold uppercase text-hud-foreground group-hover:block">{marker.label}</span>
          </div>
        ))}

        <div className="player-shadow absolute z-20 flex size-9 -translate-x-1/2 -translate-y-1/2 items-center justify-center rounded-full bg-primary text-primary-foreground" style={{ left: player.x, top: player.y }} aria-label="Player">
          <ChevronUp className="size-5" strokeWidth={4} />
        </div>
      </div>

      <header className="pointer-events-none absolute inset-x-0 top-0 z-30 flex items-start justify-between gap-3 p-3 pt-[max(0.75rem,env(safe-area-inset-top))]">
        <div className="min-w-0 rounded-md border border-border bg-hud px-3 py-2 text-hud-foreground shadow-lg backdrop-blur-sm">
          <p className="truncate font-display text-sm uppercase">{currentTile?.name ?? "Jungle World"}</p>
          <p className="mt-0.5 text-[10px] uppercase text-muted-foreground">Sector {Math.floor(player.x / TILE_SIZE) + 1}.{Math.floor(player.y / TILE_SIZE) + 1} · {Math.round(player.x)}, {Math.round(player.y)}</p>
        </div>
        <div className="pointer-events-auto flex shrink-0 gap-2">
          <button type="button" onClick={() => setMarkersVisible((value) => !value)} className="grid size-10 place-items-center rounded-md border border-border bg-hud text-hud-foreground shadow-lg" aria-label={markersVisible ? "Hide map markers" : "Show map markers"} title={markersVisible ? "Hide markers" : "Show markers"}>
            {markersVisible ? <Eye className="size-5" /> : <EyeOff className="size-5" />}
          </button>
          <button type="button" onClick={() => setTime((value) => value === "day" ? "night" : "day")} className="flex h-10 items-center gap-2 rounded-md border border-border bg-hud px-3 text-xs font-bold uppercase text-hud-foreground shadow-lg" aria-label={`Switch to ${time === "day" ? "night" : "day"}`}>
            {time === "day" ? <Sun className="size-5 text-primary" /> : <Moon className="size-5 text-accent" />}{time}
          </button>
        </div>
      </header>

      {dayUnavailable && (
        <div className="absolute left-1/2 top-20 z-30 -translate-x-1/2 rounded-md border border-warning bg-hud px-3 py-2 text-center text-xs font-bold text-hud-foreground shadow-lg">
          SE day tile pending · showing night art
        </div>
      )}

      <div className="absolute bottom-[max(1rem,env(safe-area-inset-bottom))] left-4 z-30 grid grid-cols-3 gap-1" aria-label="Movement controls">
        <span />
        <button type="button" className="grid size-12 place-items-center rounded-md border border-border bg-hud text-hud-foreground shadow-lg active:bg-secondary" onPointerDown={() => holdMove(0, -18)} aria-label="Move up"><ChevronUp /></button>
        <span />
        <button type="button" className="grid size-12 place-items-center rounded-md border border-border bg-hud text-hud-foreground shadow-lg active:bg-secondary" onPointerDown={() => holdMove(-18, 0)} aria-label="Move left"><ChevronLeft /></button>
        <button type="button" className="grid size-12 place-items-center rounded-md border border-border bg-hud text-primary shadow-lg" onClick={() => setPlayer(START)} aria-label="Return to spawn"><MapPin className="size-5" /></button>
        <button type="button" className="grid size-12 place-items-center rounded-md border border-border bg-hud text-hud-foreground shadow-lg active:bg-secondary" onPointerDown={() => holdMove(18, 0)} aria-label="Move right"><ChevronRight /></button>
        <span />
        <button type="button" className="grid size-12 place-items-center rounded-md border border-border bg-hud text-hud-foreground shadow-lg active:bg-secondary" onPointerDown={() => holdMove(0, 18)} aria-label="Move down"><ChevronDown /></button>
      </div>

      <div className="absolute bottom-[max(1rem,env(safe-area-inset-bottom))] right-4 z-30 flex flex-col gap-2">
        <button type="button" onClick={() => setZoom((value) => Math.min(2.2, value + 0.2))} className="grid size-11 place-items-center rounded-md border border-border bg-hud text-hud-foreground shadow-lg" aria-label="Zoom in"><ZoomIn /></button>
        <button type="button" onClick={() => setZoom((value) => Math.max(0.65, value - 0.2))} className="grid size-11 place-items-center rounded-md border border-border bg-hud text-hud-foreground shadow-lg" aria-label="Zoom out"><ZoomOut /></button>
      </div>
    </main>
  );
}
