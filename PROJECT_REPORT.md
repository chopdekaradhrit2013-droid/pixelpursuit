# PIXEL PURSUIT
## Class project report — browser survival hunt

**Student:** Adhrit Chopdekar  
**Title:** Pixel Pursuit  
**Platform:** Web (phone + laptop)  
**Live:** https://pixelpursuit.lovable.app  
**Source:** https://github.com/chopdekaradhrit2013-droid/pixelpursuit  

---

### 1. What the game is
The player is a survivor on a 3×3 tiled jungle island. A predator patrols the world. The survivor must recover three signal beacons and extract through the southwest cave before the timer hits zero.

### 2. Learning outcomes shown
- Game loop with win and lose states
- Enemy AI with more than one behaviour
- Collision / zone logic (hide, water, swamp, traps, extract)
- Camera follow on a large tiled map (not one screenshot)
- Mobile and keyboard controls
- HUD, minimap, scoring, settings saved locally

### 3. How to play (for the examiner)
1. Open the live link.
2. Briefing → Standard → Deploy.
3. WASD or on-screen pad to move. Shift / RUN to sprint.
4. Gold dots are beacons. Walk onto them.
5. Grey-green swamp and brush are hide zones — stand still to drop out of sight.
6. After three beacons, enter the glowing cave ring in the southwest.
7. If the red hunter touches you in the open, you lose.

### 4. Systems
| System | Behaviour |
| --- | --- |
| Predator AI | Patrol waypoints → chase when seen → search last seen → return to patrol |
| Detection | Larger in day, smaller at night, much smaller while hidden and still |
| Stamina | Sprint drains, regenerates when walking |
| Terrain | Swamp slows, water blocks / slides, kennels snare |
| Day / night | Auto nightfall near the end of the clock; manual toggle |
| Score | Time remaining × 10 + 250 per beacon |

### 5. Controls
| Action | PC | Phone |
| --- | --- | --- |
| Move | WASD / arrows | D-pad |
| Sprint | Shift or Space | RUN |
| Pause | P / Esc | pause button |
| Day/night | N or sun button | sun/moon |
| Mute | M | speaker |

### 6. Tools
React + TypeScript, TanStack Start / Vite, tiled map assets, Web Audio beeps. No Unity / Unreal. Runs in the browser.

### 7. Credits
World tiles and character cutouts from the project asset pack. Design, systems, and code assembled for this submission.
