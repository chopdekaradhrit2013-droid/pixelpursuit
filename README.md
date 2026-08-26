# Day & Night Worlds

IMPORTANT MAP REQUIREMENT — LARGE WORLD + DAY/NIGHT

The game maps are large, so do NOT treat the entire map as one image.

I have multiple image assets that together form each complete map.

Each map should be assembled from multiple map sections/tiles/assets.

For example:

        [MAP 1] [MAP 2] [MAP 3]

        [MAP 4] [MAP 5] [MAP 6]

        [MAP 7] [MAP 8] [MAP 9]

These sections together create one large playable world.

The player should be able to move seamlessly between map sections without visible loading screens or obvious seams.

MAP REQUIREMENTS

Each map should support:

Large explorable world

Multiple connected map sections

Camera following the player

Player collision with environment

Different areas of the map

Hiding locations

Trap placement locations

Objectives

Escape/extraction locations

Killer and Runner spawn zones

The camera should only show the relevant portion of the large world around the player rather than displaying the entire map at once.

The game should load/map-manage assets efficiently so a large world does not unnecessarily hurt performance on mobile devices.



DAY AND NIGHT SYSTEM

Each map has two visual versions:

☀️ DAY

Bright environment with normal visibility.

🌙 NIGHT

Dark environment with reduced visibility and a more dangerous atmosphere.

Both versions should use my existing assets.

Do NOT simply recolor the entire map if separate day/night assets are provided.

The architecture should allow the game to switch between:

DAY MAP

    ↕

NIGHT MAP

without changing the actual gameplay layout.

The collision, objectives, hiding spots, trap locations and map geometry should remain consistent between day and night.

Only the visual/environmental presentation should change unless I specifically decide otherwise.



DAY/NIGHT GAMEPLAY

Day and night should eventually affect gameplay.

For example:

DAY

Better visibility

Easier navigation

Killer can see farther

NIGHT

Reduced visibility

More opportunities to hide

More tension

Runners can use darkness strategically

Do NOT make night completely impossible to see.

Players should still be able to understand the environment and navigate.

The exact visibility values should be configurable so we can balance them later.



LARGE MAP PERFORMANCE

Because the maps are large and made from multiple images:

Use efficient asset management.

Only render/load what is necessary where technically appropriate.

Avoid creating one enormous image that causes excessive memory usage.

Keep the game responsive on:

Mobile

Tablet

Desktop

Target smooth gameplay and fast loading.



IMPORTANT ASSET RULE

I already have the map images/assets.

Do not generate replacement map artwork.

Before implementing the map, ask me to provide or identify:

All map sections

Which sections belong together

Which are Day versions

Which are Night versions

Now I’m giving only night maps as the limit is 10 I’ll slowly add the sprites and day maps 

Their intended arrangement/order

Then build the map using those exact assets.

Do not assume the arrangement of my map images.

This project was built with [Lovable](https://lovable.dev).

**Live app**: https://pixelpursuit.lovable.app

## Build with Lovable

Continue developing this project in the [Lovable editor](https://lovable.dev/projects/21894406-0cd7-4b5e-868e-895922e0b7d9).

- **Ship faster**: describe what you want to build and Lovable handles the code.
- **Stay in sync**: every change made in Lovable is committed straight to this repository.
- **Full ownership**: this code is yours. Push to `main` on GitHub and your changes sync back into Lovable, ready for your next prompt.

## Development

Prefer working locally? You need Node.js and npm — [install with nvm](https://github.com/nvm-sh/nvm#installing-and-updating).

```sh
git clone <this-repository-url>
cd <repository-name>
npm i
npm run dev
```
