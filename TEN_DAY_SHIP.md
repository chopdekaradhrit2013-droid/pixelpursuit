# Pixel Pursuit — 10-day school ship

Deadline: 10 days from 26 Aug 2026. Scope is frozen. No new maps. No new engine.

## What is already a complete game
- Title, briefing, hunt, pause, win, lose
- Predator AI, 3 beacons, cave extract, timer
- Day/night toggle
- Stamina, hide, swamp, water, snares
- Keyboard + mobile pad
- Score + best score

Live: https://pixelpursuit.lovable.app
Repo: https://github.com/chopdekaradhrit2013-droid/pixelpursuit

## Daily plan (do not skip playtests)

### Day 1 — Play and mark bugs
Play 5 full hunts on phone + laptop. Write a list: water feels wrong, hunter too fast, beacon hard to see, etc.

### Day 2 — Feel
Only change numbers in `src/game/config.ts` (speeds, detect radius, timer). Do not rewrite systems.

### Day 3 — Zones vs art
Walk the map. If a hide bush is not hiding you, move the rect in `config.ts`. Same for water, extract, traps.

### Day 4 — Teacher demo script
Practice a 3-minute demo:
1. Title + brief (15s)
2. Collect one beacon
3. Hide in swamp
4. Get spotted, break line of sight
5. Extract or show a clean death

### Day 5 — Mobile
Play only on phone. Pad must not cover the hunter.

### Day 6 — One polish pass
Pick ONE: heartbeat, beacon sparkle, or hunter glow. Not all three.

### Day 7 — Nightmare balance
Nightmare must be hard but not instant death.

### Day 8 — Freeze content
No new features after today. Only crash fixes.

### Day 9 — Presentation pack
Screenshot title, mid-hunt, extract. Six viva bullets: tiled world, AI states, hide, stamina, two difficulties, extract.

### Day 10 — Submit
Lock the URL. Do not add one more feature.

## Not in 10 days
Multiplayer, new maps, 3D, Unity rewrite, full animation sheets.
