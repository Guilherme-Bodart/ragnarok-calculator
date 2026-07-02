import type { ModifierCondition, NormalizedModifier } from "./modifier.types";
import { evaluateRathenaExpression } from "./rathena-expression";
import {
  toInternalClassId,
  toInternalElementId,
  toInternalRaceId,
  toInternalSizeId,
} from "./rathena-script-converters";
import type { ParsedCommand, ParserVariables } from "./rathena-script-types";

export type ModifierMapper = (
  command: ParsedCommand,
  conditions: ModifierCondition[],
  variables: ParserVariables,
) => NormalizedModifier | null;

export const BONUS_MAPPERS: Record<string, ModifierMapper> = {
  bAtk: (command, conditions, variables) =>
    createModifier("atk", "addFlat", command, conditions, variables),
  bMatk: (command, conditions, variables) =>
    createModifier("matk", "addFlat", command, conditions, variables),
  bStr: (command, conditions, variables) =>
    createModifier("str", "addFlat", command, conditions, variables),
  bAgi: (command, conditions, variables) =>
    createModifier("agi", "addFlat", command, conditions, variables),
  bVit: (command, conditions, variables) =>
    createModifier("vit", "addFlat", command, conditions, variables),
  bInt: (command, conditions, variables) =>
    createModifier("int", "addFlat", command, conditions, variables),
  bDex: (command, conditions, variables) =>
    createModifier("dex", "addFlat", command, conditions, variables),
  bLuk: (command, conditions, variables) =>
    createModifier("luk", "addFlat", command, conditions, variables),
  bPow: (command, conditions, variables) =>
    createModifier("pow", "addFlat", command, conditions, variables),
  bSta: (command, conditions, variables) =>
    createModifier("sta", "addFlat", command, conditions, variables),
  bWis: (command, conditions, variables) =>
    createModifier("wis", "addFlat", command, conditions, variables),
  bSpl: (command, conditions, variables) =>
    createModifier("spl", "addFlat", command, conditions, variables),
  bCon: (command, conditions, variables) =>
    createModifier("con", "addFlat", command, conditions, variables),
  bCrt: (command, conditions, variables) =>
    createModifier("crt", "addFlat", command, conditions, variables),
  bAllStats: (command, conditions, variables) =>
    createModifier("allStats", "addFlat", command, conditions, variables),
  bPAtk: (command, conditions, variables) =>
    createModifier("pAtk", "addFlat", command, conditions, variables),
  bSMatk: (command, conditions, variables) =>
    createModifier("smatk", "addFlat", command, conditions, variables),
  bAtkRate: (command, conditions, variables) =>
    createModifier("atkRate", "addPercent", command, conditions, variables),
  bShortAtkRate: (command, conditions, variables) =>
    createModifier("shortAttackRate", "addPercent", command, conditions, variables),
  bLongAtkRate: (command, conditions, variables) =>
    createModifier("longAttackRate", "addPercent", command, conditions, variables),
  bMatkRate: (command, conditions, variables) =>
    createModifier("matkRate", "addPercent", command, conditions, variables),
  bBaseAtk: (command, conditions, variables) =>
    createModifier("baseAtk", "addFlat", command, conditions, variables),
  bDef: (command, conditions, variables) =>
    createModifier("defense", "addFlat", command, conditions, variables),
  bMdef: (command, conditions, variables) =>
    createModifier("magicDefense", "addFlat", command, conditions, variables),
  bRes: (command, conditions, variables) =>
    createModifier("res", "addFlat", command, conditions, variables),
  bMRes: (command, conditions, variables) =>
    createModifier("mres", "addFlat", command, conditions, variables),
  bMres: (command, conditions, variables) =>
    createModifier("mres", "addFlat", command, conditions, variables),
  bAtkEle: (command, conditions) => {
    const [, rathenaElementId] = command.args;
    const elementId = toInternalElementId(rathenaElementId);

    if (!elementId || elementId === "all") {
      return null;
    }

    return createTargetedModifier(
      "weaponElement",
      { type: "element", elementId },
      command,
      conditions,
      1,
      "addFlat",
    );
  },
  bMaxHP: (command, conditions, variables) =>
    createModifier("maxHp", "addFlat", command, conditions, variables),
  bMaxHPrate: (command, conditions, variables) =>
    createModifier("maxHpRate", "addPercent", command, conditions, variables),
  bMaxSP: (command, conditions, variables) =>
    createModifier("maxSp", "addFlat", command, conditions, variables),
  bMaxSPrate: (command, conditions, variables) =>
    createModifier("maxSpRate", "addPercent", command, conditions, variables),
  bMaxAP: (command, conditions, variables) =>
    createModifier("maxAp", "addFlat", command, conditions, variables),
  bMaxAPrate: (command, conditions, variables) =>
    createModifier("maxApRate", "addPercent", command, conditions, variables),
  bHit: (command, conditions, variables) =>
    createModifier("hit", "addFlat", command, conditions, variables),
  bPerfectHitAddRate: (command, conditions, variables) =>
    createModifier("perfectHitRate", "addPercent", command, conditions, variables),
  bFlee: (command, conditions, variables) =>
    createModifier("flee", "addFlat", command, conditions, variables),
  bCritical: (command, conditions, variables) =>
    createModifier("crit", "addFlat", command, conditions, variables),
  bCritAtkRate: (command, conditions, variables) =>
    createModifier("criticalDamageRate", "addPercent", command, conditions, variables),
  bHealPower: (command, conditions, variables) =>
    createModifier("healPower", "addPercent", command, conditions, variables),
  bAspd: (command, conditions, variables) =>
    createModifier("aspd", "addFlat", command, conditions, variables),
  bAspdRate: (command, conditions, variables) =>
    createModifier("aspdRate", "addPercent", command, conditions, variables),
  bVariableCastrate: (command, conditions, variables) =>
    createModifier("variableCastRate", "addPercent", command, conditions, variables),
  bFixedCastrate: (command, conditions, variables) =>
    createModifier("fixedCastRate", "addPercent", command, conditions, variables),
  bFixedCast: (command, conditions, variables) =>
    createModifier("fixedCast", "addFlat", command, conditions, variables),
  bDelayrate: (command, conditions, variables) =>
    createModifier("afterCastDelayRate", "addPercent", command, conditions, variables),
  bUseSPrate: (command, conditions, variables) =>
    createModifier("spCostRate", "addPercent", command, conditions, variables),
};

export const BONUS2_MAPPERS: Record<string, ModifierMapper> = {
  bAddRace: (command, conditions, variables) => {
    const [, rathenaRaceId, value] = command.args;
    const raceId = toInternalRaceId(rathenaRaceId);
    const numericValue = evaluateModifierValue(value, variables);

    if (!raceId || numericValue === null) {
      return null;
    }

    return createTargetedModifier(
      "raceDamageRate",
      { type: "race", raceId },
      command,
      conditions,
      numericValue,
    );
  },
  bAddEle: (command, conditions, variables) => {
    const [, rathenaElementId, value] = command.args;
    const elementId = toInternalElementId(rathenaElementId);
    const numericValue = evaluateModifierValue(value, variables);

    if (!elementId || numericValue === null) {
      return null;
    }

    return createTargetedModifier(
      "elementDamageRate",
      { type: "element", elementId },
      command,
      conditions,
      numericValue,
    );
  },
  bSubRace: (command, conditions, variables) => {
    const [, rathenaRaceId, value] = command.args;
    const raceId = toInternalRaceId(rathenaRaceId);
    const numericValue = evaluateModifierValue(value, variables);

    if (!raceId || numericValue === null) {
      return null;
    }

    return createTargetedModifier(
      "incomingRaceDamageReductionRate",
      { type: "race", raceId },
      command,
      conditions,
      numericValue,
    );
  },
  bSubEle: (command, conditions, variables) => {
    const [, rathenaElementId, value] = command.args;
    const elementId = toInternalElementId(rathenaElementId);
    const numericValue = evaluateModifierValue(value, variables);

    if (!elementId || numericValue === null) {
      return null;
    }

    return createTargetedModifier(
      "incomingElementDamageReductionRate",
      { type: "element", elementId },
      command,
      conditions,
      numericValue,
    );
  },
  bAddSize: (command, conditions, variables) => {
    const [, rathenaSizeId, value] = command.args;
    const sizeId = toInternalSizeId(rathenaSizeId);
    const numericValue = evaluateModifierValue(value, variables);

    if (!sizeId || numericValue === null) {
      return null;
    }

    return createTargetedModifier(
      "sizeDamageRate",
      { type: "size", sizeId },
      command,
      conditions,
      numericValue,
    );
  },
  bSubSize: (command, conditions, variables) => {
    const [, rathenaSizeId, value] = command.args;
    const sizeId = toInternalSizeId(rathenaSizeId);
    const numericValue = evaluateModifierValue(value, variables);

    if (!sizeId || numericValue === null) {
      return null;
    }

    return createTargetedModifier(
      "incomingSizeDamageReductionRate",
      { type: "size", sizeId },
      command,
      conditions,
      numericValue,
    );
  },
  bMagicAddRace: (command, conditions, variables) => {
    const [, rathenaRaceId, value] = command.args;
    const raceId = toInternalRaceId(rathenaRaceId);
    const numericValue = evaluateModifierValue(value, variables);

    if (!raceId || numericValue === null) {
      return null;
    }

    return createTargetedModifier(
      "magicRaceDamageRate",
      { type: "race", raceId },
      command,
      conditions,
      numericValue,
    );
  },
  bMagicAddEle: (command, conditions, variables) => {
    const [, rathenaElementId, value] = command.args;
    const elementId = toInternalElementId(rathenaElementId);
    const numericValue = evaluateModifierValue(value, variables);

    if (!elementId || numericValue === null) {
      return null;
    }

    return createTargetedModifier(
      "magicElementDamageRate",
      { type: "element", elementId },
      command,
      conditions,
      numericValue,
    );
  },
  bMagicAddSize: (command, conditions, variables) => {
    const [, rathenaSizeId, value] = command.args;
    const sizeId = toInternalSizeId(rathenaSizeId);
    const numericValue = evaluateModifierValue(value, variables);

    if (!sizeId || numericValue === null) {
      return null;
    }

    return createTargetedModifier(
      "magicSizeDamageRate",
      { type: "size", sizeId },
      command,
      conditions,
      numericValue,
    );
  },
  bAddClass: (command, conditions, variables) => {
    const [, rathenaClassId, value] = command.args;
    const classId = toInternalClassId(rathenaClassId);
    const numericValue = evaluateModifierValue(value, variables);

    if (!classId || numericValue === null) {
      return null;
    }

    return createTargetedModifier(
      "classDamageRate",
      { type: "class", classId },
      command,
      conditions,
      numericValue,
    );
  },
  bMagicAddClass: (command, conditions, variables) => {
    const [, rathenaClassId, value] = command.args;
    const classId = toInternalClassId(rathenaClassId);
    const numericValue = evaluateModifierValue(value, variables);

    if (!classId || numericValue === null) return null;

    return createTargetedModifier(
      "magicClassDamageRate",
      { type: "class", classId },
      command,
      conditions,
      numericValue,
    );
  },
  bSubClass: (command, conditions, variables) => {
    const [, rathenaClassId, value] = command.args;
    const classId = toInternalClassId(rathenaClassId);
    const numericValue = evaluateModifierValue(value, variables);

    if (!classId || numericValue === null) {
      return null;
    }

    return createTargetedModifier(
      "incomingClassDamageReductionRate",
      { type: "class", classId },
      command,
      conditions,
      numericValue,
    );
  },
  bSkillAtk: (command, conditions, variables) => {
    const [, rawSkillId, value] = command.args;
    const skillId = normalizeScriptString(rawSkillId);
    const numericValue = evaluateModifierValue(value, variables);

    if (!skillId || numericValue === null) {
      return null;
    }

    return createTargetedModifier(
      "skillDamageRate",
      { type: "skill", skillId },
      command,
      conditions,
      numericValue,
    );
  },
  bVariableCastrate: (command, conditions, variables) =>
    createSkillModifier("skillVariableCastRate", command, conditions, variables),
  bFixedCastrate: (command, conditions, variables) =>
    createSkillModifier("skillFixedCastRate", command, conditions, variables),
  bSkillFixedCast: (command, conditions, variables) =>
    createSkillModifier(
      "skillFixedCast",
      command,
      conditions,
      variables,
      "addFlat",
    ),
  bMagicAtkEle: (command, conditions, variables) => {
    const [, rathenaElementId, value] = command.args;
    const elementId = toInternalElementId(rathenaElementId);
    const numericValue = evaluateModifierValue(value, variables);

    if (!elementId || numericValue === null) {
      return null;
    }

    return createTargetedModifier(
      "magicElementAttackRate",
      { type: "element", elementId },
      command,
      conditions,
      numericValue,
    );
  },
  bIgnoreDefRaceRate: (command, conditions, variables) => {
    const [, rathenaRaceId, value] = command.args;
    const raceId = toInternalRaceId(rathenaRaceId);
    const numericValue = evaluateModifierValue(value, variables);

    if (!raceId || numericValue === null) {
      return null;
    }

    return createTargetedModifier(
      "ignoreDefenseRate",
      { type: "race", raceId },
      command,
      conditions,
      numericValue,
    );
  },
  bIgnoreMdefRaceRate: (command, conditions, variables) => {
    const [, rathenaRaceId, value] = command.args;
    const raceId = toInternalRaceId(rathenaRaceId);
    const numericValue = evaluateModifierValue(value, variables);

    if (!raceId || numericValue === null) {
      return null;
    }

    return createTargetedModifier(
      "ignoreMagicDefenseRate",
      { type: "race", raceId },
      command,
      conditions,
      numericValue,
    );
  },
  bIgnoreDefSizeRate: (command, conditions, variables) => {
    const [, rathenaSizeId, value] = command.args;
    const sizeId = toInternalSizeId(rathenaSizeId);
    const numericValue = evaluateModifierValue(value, variables);

    if (!sizeId || numericValue === null) {
      return null;
    }

    return createTargetedModifier(
      "ignoreDefenseSizeRate",
      { type: "size", sizeId },
      command,
      conditions,
      numericValue,
    );
  },
  bIgnoreMdefSizeRate: (command, conditions, variables) => {
    const [, rathenaSizeId, value] = command.args;
    const sizeId = toInternalSizeId(rathenaSizeId);
    const numericValue = evaluateModifierValue(value, variables);

    if (!sizeId || numericValue === null) {
      return null;
    }

    return createTargetedModifier(
      "ignoreMagicDefenseSizeRate",
      { type: "size", sizeId },
      command,
      conditions,
      numericValue,
    );
  },
  bIgnoreDefRate: (command, conditions, variables) => {
    const numericValue = evaluateModifierValue(command.args[1], variables);

    if (numericValue === null) {
      return null;
    }

    return createTargetedModifier(
      "ignoreDefenseRate",
      { type: "race", raceId: "all" },
      command,
      conditions,
      numericValue,
    );
  },
  bIgnoreMdefRate: (command, conditions, variables) => {
    const numericValue = evaluateModifierValue(command.args[1], variables);

    if (numericValue === null) {
      return null;
    }

    return createTargetedModifier(
      "ignoreMagicDefenseRate",
      { type: "race", raceId: "all" },
      command,
      conditions,
      numericValue,
    );
  },
  bIgnoreDefClassRate: (command, conditions, variables) => {
    const [, rathenaClassId, value] = command.args;
    const classId = toInternalClassId(rathenaClassId);
    const numericValue = evaluateModifierValue(value, variables);

    if (!classId || numericValue === null) {
      return null;
    }

    return createTargetedModifier(
      "ignoreDefenseClassRate",
      { type: "class", classId },
      command,
      conditions,
      numericValue,
    );
  },
  bIgnoreMdefClassRate: (command, conditions, variables) => {
    const [, rathenaClassId, value] = command.args;
    const classId = toInternalClassId(rathenaClassId);
    const numericValue = evaluateModifierValue(value, variables);

    if (!classId || numericValue === null) {
      return null;
    }

    return createTargetedModifier(
      "ignoreMagicDefenseClassRate",
      { type: "class", classId },
      command,
      conditions,
      numericValue,
    );
  },
  bCritAtkRace: (command, conditions, variables) => {
    const [, rathenaRaceId, value] = command.args;
    const raceId = toInternalRaceId(rathenaRaceId);
    const numericValue = evaluateModifierValue(value, variables);

    if (!raceId || numericValue === null) {
      return null;
    }

    return createTargetedModifier(
      "criticalRaceDamageRate",
      { type: "race", raceId },
      command,
      conditions,
      numericValue,
    );
  },
};

function createModifier(
  stat:
    | "atk"
    | "matk"
    | "str"
    | "agi"
    | "vit"
    | "int"
    | "dex"
    | "luk"
    | "pow"
    | "sta"
    | "wis"
    | "spl"
    | "con"
    | "crt"
    | "allStats"
    | "pAtk"
    | "smatk"
    | "atkRate"
    | "shortAttackRate"
    | "longAttackRate"
    | "matkRate"
    | "baseAtk"
    | "defense"
    | "magicDefense"
    | "res"
    | "mres"
    | "weaponElement"
    | "maxHp"
    | "maxHpRate"
    | "maxSp"
    | "maxSpRate"
    | "maxAp"
    | "maxApRate"
    | "hit"
    | "perfectHitRate"
    | "flee"
    | "crit"
    | "criticalDamageRate"
    | "healPower"
    | "aspd"
    | "aspdRate"
    | "variableCastRate"
    | "fixedCastRate"
    | "fixedCast"
    | "afterCastDelayRate"
    | "spCostRate",
  operator: "addFlat" | "addPercent",
  command: ParsedCommand,
  conditions: ModifierCondition[],
  variables: ParserVariables,
): NormalizedModifier | null {
  const value = evaluateModifierValue(command.args[1], variables);

  if (value === null) {
    return null;
  }

  return {
    stat,
    operator,
    value,
    target: {
      type: "self",
    },
    conditions,
    source: {
      format: "rathena",
      command: command.command,
      raw: command.raw,
      args: command.args,
    },
  };
}

function createTargetedModifier(
  stat:
    | "raceDamageRate"
    | "elementDamageRate"
    | "sizeDamageRate"
    | "skillDamageRate"
    | "magicRaceDamageRate"
    | "magicElementDamageRate"
    | "magicSizeDamageRate"
    | "classDamageRate"
    | "magicClassDamageRate"
    | "magicElementAttackRate"
    | "ignoreDefenseRate"
    | "ignoreMagicDefenseRate"
    | "ignoreDefenseClassRate"
    | "ignoreMagicDefenseClassRate"
    | "ignoreDefenseSizeRate"
    | "ignoreMagicDefenseSizeRate"
    | "incomingRaceDamageReductionRate"
    | "incomingElementDamageReductionRate"
    | "incomingClassDamageReductionRate"
    | "incomingSizeDamageReductionRate"
    | "criticalRaceDamageRate"
    | "weaponElement"
    | "skillVariableCastRate"
    | "skillFixedCastRate"
    | "skillFixedCast",
  target: NormalizedModifier["target"],
  command: ParsedCommand,
  conditions: ModifierCondition[],
  value: number,
  operator: "addFlat" | "addPercent" = "addPercent",
): NormalizedModifier {
  return {
    stat,
    operator,
    value,
    target,
    conditions,
    source: {
      format: "rathena",
      command: command.command,
      raw: command.raw,
      args: command.args,
    },
  };
}

function createSkillModifier(
  stat: "skillVariableCastRate" | "skillFixedCastRate" | "skillFixedCast",
  command: ParsedCommand,
  conditions: ModifierCondition[],
  variables: ParserVariables,
  operator: "addFlat" | "addPercent" = "addPercent",
): NormalizedModifier | null {
  const [, rawSkillId, value] = command.args;
  const skillId = normalizeScriptString(rawSkillId);
  const numericValue = evaluateModifierValue(value, variables);

  if (!skillId || numericValue === null) {
    return null;
  }

  return createTargetedModifier(
    stat,
    { type: "skill", skillId },
    command,
    conditions,
    numericValue,
    operator,
  );
}

function evaluateModifierValue(
  value: string | undefined,
  variables: ParserVariables,
) {
  if (!value) {
    return null;
  }

  return evaluateRathenaExpression(value, variables);
}

function normalizeScriptString(value: string | undefined) {
  return value?.replace(/^["']|["']$/g, "").trim() ?? null;
}
