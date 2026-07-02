import { globalBuffRegistry } from "./buff-registry";

globalBuffRegistry.register("AL_BLESSING", ({ level }) => ({
  statBonuses: {
    str: level,
    int: level,
    dex: level,
  },
}));

globalBuffRegistry.register("AL_INCAGI", ({ level }) => ({
  statBonuses: {
    agi: level + 2,
  },
}));

// EDP multiplier logic will be handled directly in the skill formula for skills that scale with EDP,
// or as a generic weapon attack multiplier for basic attacks if needed.
// For now, we flag it. The skill formula will check if EDP is active.
globalBuffRegistry.register("ASC_EDP", () => ({
  // EDP gives +400% weapon ATK in renewal for normal hits/some skills, but it's complex.
  // We can pass a specific custom flag or handle it in the modifier pipeline.
  // For now, we will add a flag that the formula can read if needed.
}));
