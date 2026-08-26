# PIXEL PURSUIT

**Recover three signal beacons. Outrun the predator. Extract before night takes the island.**

A browser survival hunt on a seamless 3×3 jungle — separate day and night art, a hunter that patrols / chases / searches, and a cave extract when the last beacon is live.

Play: https://pixelpursuit.lovable.app

## Play
- Move: WASD, arrows, or on-screen pad
- Sprint: Shift, Space, or RUN
- Pause: P / Esc
- Night: N or the sun button (auto nightfall under 1:15)

**Standard** — three minutes, readable hunter  
**Nightmare** — shorter clock, longer vision, faster chase

## Systems
- Tiled 1536×1536 world (do not flatten to one image)
- Hide zones cut detection if you stand still
- Swamp slows, water blocks, kennels snare
- Compass points at the next beacon, then the cave
- Local best score

## Publish
See `PUBLISH.md` for Vercel + itch.io.

## Dev
```sh
npm i
npm run dev
```
Feel numbers: `src/game/config.ts`  
Tiles: `src/lib/world-map.ts`
