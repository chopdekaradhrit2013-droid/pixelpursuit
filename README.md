# Pixel Pursuit

A browser survival hunt set on a seamless 3×3 jungle world.

You are the survivor. Recover three signal beacons, stay out of the predator’s cone, and extract through the southwest cave before the clock dies.

**Live (Lovable):** https://pixelpursuit.lovable.app

## What’s in this build

- Tiled large world with separate day and night art (your assets, not recolors)
- Camera follow, zoom, and mobile D-pad
- Predator AI: patrol → chase → search last seen
- Night vignette and reduced detection range
- Stamina sprint, swamp slow, water block, kennel snares
- Hide zones that break line of sight
- Beacon objectives + cave extraction
- Title, brief, pause, victory, and defeat flow
- Local high score
- Web-audio stingers (muteable)

## Controls

| Action | Input |
| --- | --- |
| Move | WASD / arrows / on-screen pad |
| Sprint | Shift or Space / RUN |
| Pause | P or Escape |
| Day / night | HUD toggle |

## Modes

- **Standard hunt** — 3:00, readable predator
- **Nightmare** — tighter clock, longer vision, faster chase

## Develop

```sh
npm i
npm run dev
```

Map sections live in `src/lib/world-map.ts`. Game feel lives in `src/game/config.ts`.

Do not flatten the world into one image. Keep tiles, and only render what the camera needs.
