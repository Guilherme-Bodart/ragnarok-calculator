import type {
  ModifierCondition,
  ModifierParseResult,
  ModifierResolutionContext,
  NormalizedModifier,
} from "./modifier.types";
import { parseRathenaCommand } from "./rathena-script-commands";
import {
  createClassConditions,
  createRefineCondition,
  createSkillLevelConditions,
} from "./rathena-script-conditions";
import { BONUS2_MAPPERS, BONUS_MAPPERS } from "./rathena-script-mappers";
import type {
  ParsedCommand,
  ParserVariables,
  ScriptSegment,
} from "./rathena-script-types";

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
      const command = parseRathenaCommand(segment.statement);

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
      const condition = createRefineCondition(operator, refineValue);

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
      const condition = createRefineCondition(operator, refineValue);

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

      const conditions = createSkillLevelConditions(match[1]);

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

      const conditions = createClassConditions(match[1]);

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

}
