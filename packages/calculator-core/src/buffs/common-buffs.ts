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

globalBuffRegistry.register("ASC_EDP", () => ({
  edpActive: true,
}));

globalBuffRegistry.register("WL_RECOGNIZEDSPELL", () => ({
  recognizedSpell: true,
}));
