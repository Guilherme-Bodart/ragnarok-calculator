import type { ModifierCondition, NormalizedModifier } from "./modifier.types";
import { evaluateRathenaExpression } from "./rathena-expression";
import {
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
  bFlee: (command, conditions, variables) =>
    createModifier("flee", "addFlat", command, conditions, variables),
  bCritical: (command, conditions, variables) =>
    createModifier("crit", "addFlat", command, conditions, variables),
  bAspd: (command, conditions, variables) =>
    createModifier("aspd", "addFlat", command, conditions, variables),
  bAspdRate: (command, conditions, variables) =>
    createModifier("aspdRate", "addPercent", command, conditions, variables),
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
    | "maxHp"
    | "maxHpRate"
    | "maxSp"
    | "maxSpRate"
    | "maxAp"
    | "maxApRate"
    | "hit"
    | "flee"
    | "crit"
    | "aspd"
    | "aspdRate",
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
    | "magicElementAttackRate"
    | "ignoreDefenseRate"
    | "ignoreMagicDefenseRate",
  target: NormalizedModifier["target"],
  command: ParsedCommand,
  conditions: ModifierCondition[],
  value: number,
): NormalizedModifier {
  return {
    stat,
    operator: "addPercent",
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
