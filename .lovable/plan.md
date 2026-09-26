# Stage 2: Closer camera and reliable touch controls

## Camera
- Raise active gameplay zoom to 1.8 on desktop and 1.6 on tablet/mobile.
- Use the same targets at game start, during play, and after viewport or orientation changes.
- Preserve smooth following and clamp the camera against every world edge without blank space.
- Keep menus, HUD, minimap, and controls fixed to the screen.

## Touch controls
- Keep the existing directional pad and sprint button.
- Track active pointers so repeated or interrupted events cannot leave movement or sprint stuck.
- Clear touch input on release, cancellation, lost pointer capture, window blur, pause, and leaving gameplay.
- Add clear pressed feedback, comfortable hit areas, and safe-area spacing for portrait and landscape.
- Restrict scroll/zoom prevention to the game surface while retaining desktop keyboard controls.

## Verification
- Test desktop, iPad/tablet portrait and landscape, and phone portrait and landscape.
- Check movement and sprint press/release, pause/resume, viewport resizing, camera scale, and map-edge clamping.
- Confirm the preview remains error-free.
