import hunterAsset from "@/assets/characters/hunter_hooded_cutout.png.asset.json";
import runnerAsset from "@/assets/characters/runner_hunting_cutout.png.asset.json";
import survivorAsset from "@/assets/characters/survival_character_cutout.png.asset.json";

export const CHARACTER_SPRITES = {
  /** Runner idle pose */
  survivorIdle: survivorAsset.url,
  /** Runner sprinting pose */
  survivorRun: runnerAsset.url,
  /** Predator / killer */
  hunter: hunterAsset.url,
} as const;

/** Sprite footprint in world units (world is 1536x1536, tiles 512). */
export const SPRITE_SIZE = { runner: 46, hunter: 54 } as const;
