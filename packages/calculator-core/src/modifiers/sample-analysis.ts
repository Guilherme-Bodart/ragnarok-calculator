import { readFileSync } from "node:fs";
import { ModifierNormalizer } from "./modifier-normalizer";
import type { ModifierResolutionContext } from "./modifier.types";

export type ItemScriptSample = {
  itemId: number;
  name: string;
  rawScript?: string;
};

export type SampleSetSummary = {
  items: number;
  itemRawScripts: number;
  skills: number;
  monsters: number;
};

export type UnsupportedCommandExample = {
  itemId: number;
  itemName: string;
  rawLine: string;
};

export type UnsupportedCommandReason =
  | "unsupported-condition"
  | "ignored-runtime-effect"
  | "ignored-drop-effect"
  | "unsupported-non-damage-effect"
  | "unsupported-stat-effect"
  | "unsupported-bonus-code"
  | "script-fragment";

export type UnsupportedCommandReport = {
  command: string;
  reason: UnsupportedCommandReason;
  count: number;
  examples: UnsupportedCommandExample[];
};

export type ItemScriptCoverageReport = {
  samples: SampleSetSummary;
  itemScripts: number;
  fullySupportedItemScripts: number;
  partiallySupportedItemScripts: number;
  unsupportedItemScripts: number;
  itemScriptsWithModifiers: number;
  totalModifiers: number;
  unsupportedStatements: number;
  unsupportedCommands: UnsupportedCommandReport[];
};

type SampleInputs = {
  items: ItemScriptSample[];
  skills: unknown[];
  monsters: unknown[];
};

const maxExamplesPerCommand = 5;

export function readJsonSampleFile<T>(path: string): T {
  return JSON.parse(readFileSync(path, "utf8")) as T;
}

export function analyzeSamples(
  samples: SampleInputs,
  normalizer = new ModifierNormalizer(),
  context: ModifierResolutionContext = {},
): ItemScriptCoverageReport {
  const unsupportedByCommand = new Map<string, UnsupportedCommandReport>();
  let fullySupportedItemScripts = 0;
  let partiallySupportedItemScripts = 0;
  let unsupportedItemScripts = 0;
  let itemScriptsWithModifiers = 0;
  let totalModifiers = 0;
  let unsupportedStatements = 0;

  const itemSamplesWithScripts = samples.items.filter((item) =>
    Boolean(item.rawScript?.trim()),
  );

  for (const item of itemSamplesWithScripts) {
    const result = normalizer.fromRawScript(item.rawScript ?? "", context);
    totalModifiers += result.modifiers.length;
    unsupportedStatements += result.unsupportedStatements.length;

    if (result.modifiers.length > 0) {
      itemScriptsWithModifiers += 1;
    }

    if (result.unsupportedStatements.length === 0) {
      fullySupportedItemScripts += 1;
    } else {
      unsupportedItemScripts += 1;

      if (result.modifiers.length > 0) {
        partiallySupportedItemScripts += 1;
      }

      for (const unsupportedStatement of result.unsupportedStatements) {
        const command = extractUnsupportedCommand(unsupportedStatement);
        const reason = classifyUnsupportedCommand(command);
        const report = unsupportedByCommand.get(command) ?? {
          command,
          reason,
          count: 0,
          examples: [],
        };

        report.count += 1;

        if (report.examples.length < maxExamplesPerCommand) {
          report.examples.push({
            itemId: item.itemId,
            itemName: item.name,
            rawLine: unsupportedStatement,
          });
        }

        unsupportedByCommand.set(command, report);
      }
    }
  }

  return {
    samples: {
      items: samples.items.length,
      itemRawScripts: itemSamplesWithScripts.length,
      skills: samples.skills.length,
      monsters: samples.monsters.length,
    },
    itemScripts: itemSamplesWithScripts.length,
    fullySupportedItemScripts,
    partiallySupportedItemScripts,
    unsupportedItemScripts,
    itemScriptsWithModifiers,
    totalModifiers,
    unsupportedStatements,
    unsupportedCommands: Array.from(unsupportedByCommand.values()).sort(
      (left, right) =>
        right.count - left.count || left.command.localeCompare(right.command),
    ),
  };
}

export function extractUnsupportedCommand(statement: string) {
  const trimmedStatement = statement.trim();
  const commandMatch = /^([A-Za-z_][A-Za-z0-9_]*)\b/.exec(trimmedStatement);
  const command = commandMatch?.[1];

  if (!command) {
    return "<script-fragment>";
  }

  if (["bonus", "bonus2", "bonus3"].includes(command)) {
    const bonusCodeMatch = new RegExp(`^${command}\\s+([^,;\\s]+)`).exec(
      trimmedStatement,
    );

    return bonusCodeMatch ? `${command} ${bonusCodeMatch[1]}` : command;
  }

  return command;
}

export function classifyUnsupportedCommand(
  command: string,
): UnsupportedCommandReason {
  if (command === "<script-fragment>") {
    return "script-fragment";
  }

  if (command === "if" || command === "else") {
    return "unsupported-condition";
  }

  if (
    command.startsWith("autobonus") ||
    command === "bonus3 bAutoSpellWhenHit"
  ) {
    return "ignored-runtime-effect";
  }

  if (
    command === "bonus2 bAddMonsterDropItem" ||
    command === "bonus3 bAddMonsterIdDropItem"
  ) {
    return "ignored-drop-effect";
  }

  if (
    command === "skill" ||
    command === "sc_end" ||
    command === "heal" ||
    command === "bonus2 bSkillCooldown" ||
    command === "bonus2 bSkillUseSP" ||
    command === "bonus2 bSkillFixedCast" ||
    command === "bonus2 bFixedCastrate" ||
    command === "bonus bDelayrate" ||
    command === "bonus bAspdRate" ||
    command === "bonus bUnbreakableWeapon"
  ) {
    return "unsupported-non-damage-effect";
  }

  if (
    command === "bonus bAllStats" ||
    command === "bonus bMdef" ||
    command === "bonus bMRes" ||
    command === "bonus bMaxHPrate" ||
    command === "bonus bMaxSPrate" ||
    command === "bonus bInt" ||
    command === "bonus bVit" ||
    command === "bonus bLongAtkRate"
  ) {
    return "unsupported-stat-effect";
  }

  return "unsupported-bonus-code";
}
