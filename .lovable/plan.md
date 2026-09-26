# Stage 1: Closer gameplay camera

## Goal
Make active gameplay feel noticeably closer without changing the map, art, controls, or game rules.

## Changes
- Centralize the camera zoom values so every initial and active gameplay state uses the same targets.
- Set desktop gameplay zoom to about 1.45 and mobile/tablet gameplay zoom to about 1.28.
- Keep the existing eased camera follow and zoom transition.
- Harden world-edge clamping so the camera remains valid at all viewport sizes and never exposes space beyond the map.
- Leave title, briefing, pause, HUD, minimap, and touch controls screen-fixed and readable.

## Verification
- Check desktop and mobile/tablet views at spawn and while moving toward map edges.
- Confirm overlays and controls remain usable and that no camera or runtime errors appear.
- Resolve the existing TypeScript inference errors only as needed to restore a clean verification build, without changing gameplay values.

## Technical details
- Camera values will live as named constants near the existing camera configuration in `PixelPursuit`.
- Clamp bounds will use non-negative maximum offsets derived from viewport size divided by zoom.
