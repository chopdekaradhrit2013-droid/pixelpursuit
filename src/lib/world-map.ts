import nwDay from "@/assets/maps/jungle-cliffs-day-nw.webp.asset.json";
import nwNight from "@/assets/maps/jungle-island-night-nw.webp.asset.json";
import nDay from "@/assets/maps/shipwreck-day-n.webp.asset.json";
import nNight from "@/assets/maps/shipwreck-night-n.webp.asset.json";
import neDay from "@/assets/maps/chateau-day-ne.webp.asset.json";
import neNight from "@/assets/maps/chateau-night-ne.webp.asset.json";
import wDay from "@/assets/maps/swamp-day-w.webp.asset.json";
import wNight from "@/assets/maps/swamp-night-w.webp.asset.json";
import centerDay from "@/assets/maps/crossroads-day-center.webp.asset.json";
import centerNight from "@/assets/maps/crossroads-night-center.webp.asset.json";
import eDay from "@/assets/maps/kennels-day-e.webp.asset.json";
import eNight from "@/assets/maps/kennels-night-e.webp.asset.json";
import swDay from "@/assets/maps/cave-day-sw.webp.asset.json";
import swNight from "@/assets/maps/cave-night-sw.webp.asset.json";
import sDay from "@/assets/maps/beach-day-s.webp.asset.json";
import sNight from "@/assets/maps/beach-night-s.webp.asset.json";
import seNight from "@/assets/maps/delta-night-se.webp.asset.json";

export const TILE_SIZE = 512;
export const WORLD_SIZE = 1536;

export type TimeOfDay = "day" | "night";

export type WorldTile = {
  id: string;
  name: string;
  x: number;
  y: number;
  day?: string;
  night: string;
};

export const WORLD_TILES: WorldTile[] = [
  { id: "nw", name: "Jungle Cliffs", x: 0, y: 0, day: nwDay.url, night: nwNight.url },
  { id: "n", name: "Shipwreck Spawn", x: 512, y: 0, day: nDay.url, night: nNight.url },
  { id: "ne", name: "Chateau · Predator Base", x: 1024, y: 0, day: neDay.url, night: neNight.url },
  { id: "w", name: "Swamp / Fog", x: 0, y: 512, day: wDay.url, night: wNight.url },
  { id: "center", name: "Crossroads · Main Hunt", x: 512, y: 512, day: centerDay.url, night: centerNight.url },
  { id: "e", name: "Kennels + Watchtower", x: 1024, y: 512, day: eDay.url, night: eNight.url },
  { id: "sw", name: "Cliff Cave · Secret Escape", x: 0, y: 1024, day: swDay.url, night: swNight.url },
  { id: "s", name: "South Beach Wreckage", x: 512, y: 1024, day: sDay.url, night: sNight.url },
  { id: "se", name: "River Delta Choke", x: 1024, y: 1024, night: seNight.url },
];

export const MAP_MARKERS = [
  { id: "spawn-runner", label: "Runner spawn", kind: "spawn", x: 760, y: 160 },
  { id: "spawn-killer", label: "Predator base", kind: "danger", x: 1290, y: 180 },
  { id: "objective", label: "Crossroads beacon", kind: "objective", x: 768, y: 768 },
  { id: "hide", label: "Swamp cover", kind: "hide", x: 250, y: 720 },
  { id: "trap", label: "Kennel snares", kind: "trap", x: 1260, y: 760 },
  { id: "escape", label: "Cave extraction", kind: "escape", x: 250, y: 1280 },
] as const;
