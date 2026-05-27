import type {
  ModifierCondition,
  ModifierElementId,
  ModifierParseResult,
  ModifierRaceId,
  ModifierResolutionContext,
  ModifierSizeId,
  NormalizedModifier,
} from "./modifier.types";
import { evaluateRathenaExpression } from "./rathena-expression";

type ParsedCommand = {
  command: "bonus" | "bonus2";
  args: string[];
  raw: string;
};

type ScriptSegment = {
  statement: string;
  conditions: ModifierCondition[];
};

type ParserVariables = {
  refine?: number;
};

type ModifierMapper = (
  command: ParsedCommand,
  conditions: ModifierCondition[],
  variables: ParserVariables,
) => NormalizedModifier | null;

const BONUS_MAPPERS: Record<
  string,
  ModifierMapper
> = {
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
  bAllStats: (command, conditions, variables) =>
    createModifier("allStats", "addFlat", command, conditions, variables),
  bPAtk: (command, conditions, variables) =>
    createModifier("pAtk", "addFlat", command, conditions, variables),
  bSMatk: (command, conditions, variables) =>
    createModifier("smatk", "addFlat", command, conditions, variables),
  bAtkRate: (command, conditions, variables) =>
    createModifier("atkRate", "addPercent", command, conditions, variables),
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

const BONUS2_MAPPERS: Record<
  string,
  ModifierMapper
> = {
  bAddRace: (command, conditions, variables) => {
    const [, rathenaRaceId, value] = command.args;
    const raceId = toInternalRaceId(rathenaRaceId);
    const numericValue = evaluateModifierValue(value, variables);

    if (!raceId || numericValue === null) {
      return null;
    }

    return {
      stat: "raceDamageRate",
      operator: "addPercent",
      value: numericValue,
      target: {
        type: "race",
        raceId,
      },
      conditions,
      source: {
        format: "rathena",
        command: command.command,
        raw: command.raw,
        args: command.args,
      },
    };
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
};

export class RathenaScriptParser {
  parse(
    rawScript: string,
    context: ModifierResolutionContext = {},
  ): ModifierParseResult {
    const result: ModifierParseResult = {
      modifiers: [],
      unsupportedStatements: [],
    };
    const variables: ParserVariables = {
      refine: context.refine,
    };

    for (const segment of this.extractSegments(rawScript)) {
      const command = this.parseCommand(segment.statement);

      if (!command) {
        result.unsupportedStatements.push(segment.statement);
        continue;
      }

      const modifier = this.toModifier(command, segment.conditions, variables);

      if (!modifier) {
        result.unsupportedStatements.push(segment.statement);
        continue;
      }

      result.modifiers.push(modifier);
    }

    return result;
  }

  private extractSegments(rawScript: string): ScriptSegment[] {
    const compactScript = rawScript
      .replace(/\r\n/g, "\n")
      .replace(/\/\/.*$/gm, "")
      .trim();

    if (!compactScript) {
      return [];
    }

    const segments: ScriptSegment[] = [];
    let scriptWithoutBlocks = compactScript.replace(
      /\.@r\s*=\s*getrefine\(\)\s*;/g,
      "",
    );
    const refineBlockExtraction = this.extractRefineBlocks(scriptWithoutBlocks);
    segments.push(...refineBlockExtraction.segments);
    scriptWithoutBlocks = refineBlockExtraction.remainingScript;
    const skillLevelBlockExtraction =
      this.extractSkillLevelBlocks(scriptWithoutBlocks);
    segments.push(...skillLevelBlockExtraction.segments);
    scriptWithoutBlocks = skillLevelBlockExtraction.remainingScript;
    const classBlockExtraction = this.extractClassBlocks(scriptWithoutBlocks);
    segments.push(...classBlockExtraction.segments);
    scriptWithoutBlocks = classBlockExtraction.remainingScript;

    const inlineRefine = /if\s*\(\s*(?:getrefine\(\)|\.@r)\s*(>=|>|<=|<|==|!=)\s*(-?\d+)\s*\)\s*([^;]+;)/g;

    for (const match of scriptWithoutBlocks.matchAll(inlineRefine)) {
      const [, operator, refineValue, statement] = match;
      const condition = this.createRefineCondition(operator, refineValue);

      if (condition) {
        segments.push({
          statement: statement.trim(),
          conditions: [condition],
        });
      }

      scriptWithoutBlocks = scriptWithoutBlocks.replace(match[0], "");
    }

    segments.push(
      ...this.splitStatements(scriptWithoutBlocks).map((statement) => ({
        statement,
        conditions: [],
      })),
    );

    return segments;
  }

  private extractRefineBlocks(script: string) {
    const segments: ScriptSegment[] = [];
    const refineBlockPattern =
      /if\s*\(\s*(?:getrefine\(\)|\.@r)\s*(>=|>|<=|<|==|!=)\s*(-?\d+)\s*\)\s*\{/g;
    let cursor = 0;
    let remainingScript = "";

    for (const match of script.matchAll(refineBlockPattern)) {
      const braceStart = match.index + match[0].length - 1;
      const braceEnd = this.findMatchingBrace(script, braceStart);

      if (braceEnd === -1 || match.index < cursor) {
        continue;
      }

      const [, operator, refineValue] = match;
      const condition = this.createRefineCondition(operator, refineValue);

      remainingScript += script.slice(cursor, match.index);

      if (condition) {
        const blockBody = script.slice(braceStart + 1, braceEnd);
        segments.push(
          ...this.splitStatements(blockBody).map((statement) => ({
            statement,
            conditions: [condition],
          })),
        );
      }

      cursor = braceEnd + 1;
    }

    remainingScript += script.slice(cursor);

    return {
      segments,
      remainingScript,
    };
  }

  private extractSkillLevelBlocks(script: string) {
    const segments: ScriptSegment[] = [];
    const skillBlockPattern = /if\s*\(([^{}]+)\)\s*\{/g;
    let cursor = 0;
    let remainingScript = "";

    for (const match of script.matchAll(skillBlockPattern)) {
      const braceStart = match.index + match[0].length - 1;
      const braceEnd = this.findMatchingBrace(script, braceStart);

      if (braceEnd === -1 || match.index < cursor) {
        continue;
      }

      const conditions = this.createSkillLevelConditions(match[1]);

      if (!conditions) {
        continue;
      }

      remainingScript += script.slice(cursor, match.index);
      const blockBody = script.slice(braceStart + 1, braceEnd);
      segments.push(
        ...this.splitStatements(blockBody).map((statement) => ({
          statement,
          conditions,
        })),
      );
      cursor = braceEnd + 1;
    }

    remainingScript += script.slice(cursor);

    return {
      segments,
      remainingScript,
    };
  }

  private extractClassBlocks(script: string) {
    const segments: ScriptSegment[] = [];
    const classBlockPattern = /if\s*\(([^{}]+)\)\s*\{/g;
    let cursor = 0;
    let remainingScript = "";

    for (const match of script.matchAll(classBlockPattern)) {
      const braceStart = match.index + match[0].length - 1;
      const braceEnd = this.findMatchingBrace(script, braceStart);

      if (braceEnd === -1 || match.index < cursor) {
        continue;
      }

      const conditions = this.createClassConditions(match[1]);

      if (!conditions) {
        continue;
      }

      remainingScript += script.slice(cursor, match.index);
      const blockBody = script.slice(braceStart + 1, braceEnd);
      segments.push(
        ...this.splitStatements(blockBody).map((statement) => ({
          statement,
          conditions,
        })),
      );
      cursor = braceEnd + 1;
    }

    remainingScript += script.slice(cursor);

    return {
      segments,
      remainingScript,
    };
  }

  private createClassConditions(conditionText: string) {
    const conditions: ModifierCondition[] = [];
    const classPattern = /BaseJob\s*(==|!=)\s*(Job_[A-Za-z0-9_]+)/g;

    for (const match of conditionText.matchAll(classPattern)) {
      const [, operator, classId] = match;

      if (operator !== "==" && operator !== "!=") {
        return null;
      }

      conditions.push({
        type: "class",
        classId,
        operator,
      });
    }

    if (conditions.length === 0) {
      return null;
    }

    const leftover = conditionText
      .replace(classPattern, "")
      .replace(/eaclass\s*\(\s*\)\s*&\s*[A-Za-z0-9_]+/g, "")
      .replace(/[\s()&|]+/g, "");

    if (leftover) {
      return null;
    }

    return conditions;
  }

  private createSkillLevelConditions(conditionText: string) {
    const conditions: ModifierCondition[] = [];
    const skillLevelPattern =
      /getskilllv\s*\(\s*"([^"]+)"\s*\)\s*(>=|>|<=|<|==|!=)\s*(-?\d+)/g;

    for (const match of conditionText.matchAll(skillLevelPattern)) {
      const [, skillId, operator, value] = match;
      const condition = this.createSkillLevelCondition(skillId, operator, value);

      if (!condition) {
        return null;
      }

      conditions.push(condition);
    }

    if (conditions.length === 0) {
      return null;
    }

    const leftover = conditionText
      .replace(skillLevelPattern, "")
      .replace(/[\s()&|]+/g, "");

    if (leftover) {
      return null;
    }

    return conditions;
  }

  private findMatchingBrace(script: string, openingBraceIndex: number) {
    let braceDepth = 0;
    let quote: '"' | "'" | null = null;
    let isEscaped = false;

    for (let index = openingBraceIndex; index < script.length; index += 1) {
      const char = script[index];

      if (isEscaped) {
        isEscaped = false;
        continue;
      }

      if (char === "\\") {
        isEscaped = true;
        continue;
      }

      if (quote) {
        if (char === quote) {
          quote = null;
        }

        continue;
      }

      if (char === '"' || char === "'") {
        quote = char;
        continue;
      }

      if (char === "{") {
        braceDepth += 1;
        continue;
      }

      if (char === "}") {
        braceDepth -= 1;

        if (braceDepth === 0) {
          return index;
        }
      }
    }

    return -1;
  }

  private splitStatements(script: string): string[] {
    const statements: string[] = [];
    let currentStatement = "";
    let quote: '"' | "'" | null = null;
    let braceDepth = 0;
    let isEscaped = false;

    for (const char of script) {
      currentStatement += char;

      if (isEscaped) {
        isEscaped = false;
        continue;
      }

      if (char === "\\") {
        isEscaped = true;
        continue;
      }

      if (quote) {
        if (char === quote) {
          quote = null;
        }

        continue;
      }

      if (char === '"' || char === "'") {
        quote = char;
        continue;
      }

      if (char === "{") {
        braceDepth += 1;
        continue;
      }

      if (char === "}") {
        braceDepth = Math.max(0, braceDepth - 1);
        continue;
      }

      if (char === ";" && braceDepth === 0) {
        statements.push(currentStatement.trim());
        currentStatement = "";
      }
    }

    const trailingStatement = currentStatement.trim();

    if (trailingStatement) {
      statements.push(
        trailingStatement.endsWith(";")
          ? trailingStatement
          : `${trailingStatement};`,
      );
    }

    return statements.filter(Boolean);
  }

  private parseCommand(statement: string): ParsedCommand | null {
    const match = /^(bonus2?|bonus)\s+(.+);$/.exec(statement);

    if (!match) {
      return null;
    }

    const command = match[1];

    if (command !== "bonus" && command !== "bonus2") {
      return null;
    }

    return {
      command,
      args: match[2].split(",").map((arg) => arg.trim()).filter(Boolean),
      raw: statement,
    };
  }

  private toModifier(
    command: ParsedCommand,
    conditions: ModifierCondition[],
    variables: ParserVariables,
  ): NormalizedModifier | null {
    const [code] = command.args;

    if (!code) {
      return null;
    }

    if (command.command === "bonus") {
      return BONUS_MAPPERS[code]?.(command, conditions, variables) ?? null;
    }

    return BONUS2_MAPPERS[code]?.(command, conditions, variables) ?? null;
  }

  private createRefineCondition(
    operator: string,
    value: string,
  ): ModifierCondition | null {
    const numericValue = Number(value);

    if (!Number.isInteger(numericValue)) {
      return null;
    }

    if (!isRefineOperator(operator)) {
      return null;
    }

    return {
      type: "refine",
      operator,
      value: numericValue,
    };
  }

  private createSkillLevelCondition(
    skillId: string,
    operator: string,
    value: string,
  ): ModifierCondition | null {
    const numericValue = Number(value);

    if (!Number.isInteger(numericValue) || !isRefineOperator(operator)) {
      return null;
    }

    return {
      type: "skillLevel",
      skillId,
      operator,
      value: numericValue,
    };
  }
}

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
    | "allStats"
    | "pAtk"
    | "smatk"
    | "atkRate"
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
    | "magicElementAttackRate",
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

function isRefineOperator(
  operator: string,
): operator is ModifierCondition["operator"] {
  return [">", ">=", "<", "<=", "==", "!="].includes(operator);
}

function toInternalRaceId(rathenaRaceId: string | undefined): ModifierRaceId | null {
  if (!rathenaRaceId) {
    return null;
  }

  const raceIds: Record<string, ModifierRaceId> = {
    RC_All: "all",
    RC_Formless: "formless",
    RC_Undead: "undead",
    RC_Brute: "brute",
    RC_Animal: "brute",
    RC_Plant: "plant",
    RC_Insect: "insect",
    RC_Fish: "fish",
    RC_Demon: "demon",
    RC_DemiHuman: "demihuman",
    RC_Player_Human: "demihuman",
    RC_Angel: "angel",
    RC_Dragon: "dragon",
  };

  return raceIds[rathenaRaceId] ?? null;
}

function toInternalElementId(
  rathenaElementId: string | undefined,
): ModifierElementId | null {
  if (!rathenaElementId) {
    return null;
  }

  const elementIds: Record<string, ModifierElementId> = {
    Ele_All: "all",
    Ele_Neutral: "neutral",
    Ele_Water: "water",
    Ele_Earth: "earth",
    Ele_Fire: "fire",
    Ele_Wind: "wind",
    Ele_Poison: "poison",
    Ele_Holy: "holy",
    Ele_Dark: "dark",
    Ele_Ghost: "ghost",
    Ele_Undead: "undead",
  };

  return elementIds[rathenaElementId] ?? null;
}

function toInternalSizeId(
  rathenaSizeId: string | undefined,
): ModifierSizeId | null {
  if (!rathenaSizeId) {
    return null;
  }

  const sizeIds: Record<string, ModifierSizeId> = {
    Size_All: "all",
    Size_Small: "small",
    Size_Medium: "medium",
    Size_Large: "large",
  };

  return sizeIds[rathenaSizeId] ?? null;
}
