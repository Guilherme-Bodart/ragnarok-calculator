import type {
  ModifierCondition,
  ModifierParseResult,
  ModifierResolutionContext,
  NormalizedModifier,
} from "./modifier.types";
import { parseRathenaCommand } from "./rathena-script-commands";
import {
  createClassConditions,
  createGradeCondition,
  createRefineCondition,
  createSkillLevelConditions,
  createEquippedConditions,
} from "./rathena-script-conditions";
import { evaluateRathenaExpression } from "./rathena-expression";
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
      grade: context.grade,
      baseLevel: context.baseLevel,
      learnedSkills: context.learnedSkills,
      locals: {},
    };

    for (const segment of this.extractSegments(rawScript, variables)) {
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

  private extractSegments(
    rawScript: string,
    variables: ParserVariables,
  ): ScriptSegment[] {
    const compactScript = rawScript
      .replace(/\r\n/g, "\n")
      .replace(/\/\/.*$/gm, "")
      .trim();

    if (!compactScript) {
      return [];
    }

    const segments: ScriptSegment[] = [];
    let scriptWithoutBlocks = this.extractAssignments(
      compactScript,
      variables,
    ).replace(
      /\.@r\s*=\s*getrefine\(\)\s*;/g,
      "",
    ).replace(
      /\.@g\s*=\s*getenchantgrade\(\)\s*;/g,
      "",
    );
    const refineBlockExtraction = this.extractRefineBlocks(scriptWithoutBlocks);
    segments.push(...refineBlockExtraction.segments);
    scriptWithoutBlocks = refineBlockExtraction.remainingScript;
    const gradeBlockExtraction = this.extractGradeBlocks(scriptWithoutBlocks);
    segments.push(...gradeBlockExtraction.segments);
    scriptWithoutBlocks = gradeBlockExtraction.remainingScript;
    const skillLevelBlockExtraction =
      this.extractSkillLevelBlocks(scriptWithoutBlocks);
    segments.push(...skillLevelBlockExtraction.segments);
    scriptWithoutBlocks = skillLevelBlockExtraction.remainingScript;
    const classBlockExtraction = this.extractClassBlocks(scriptWithoutBlocks);
    segments.push(...classBlockExtraction.segments);
    scriptWithoutBlocks = classBlockExtraction.remainingScript;
    const equippedBlockExtraction = this.extractEquippedBlocks(scriptWithoutBlocks);
    segments.push(...equippedBlockExtraction.segments);
    scriptWithoutBlocks = equippedBlockExtraction.remainingScript;

    const inlineRefine = /if\s*\(\s*(?:getrefine\(\)|\.@r)\s*(>=|>|<=|<|==|!=)\s*(-?\d+)\s*\)\s*([^;]+;)/g;
    const inlineGrade = /if\s*\(\s*(?:getenchantgrade\(\)|\.@g)\s*(>=|>|<=|<|==|!=)\s*(ENCHANTGRADE_[A-Z]+|-?\d+)\s*\)\s*([^;]+;)/g;
    const inlineEquipped = /if\s*\(\s*isequipped\s*\(\s*([\d\s,]+)\s*\)\s*\)\s*([^;]+;)/g;

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

    for (const match of scriptWithoutBlocks.matchAll(inlineGrade)) {
      const [, operator, gradeValue, statement] = match;
      const condition = createGradeCondition(operator, gradeValue);

      if (condition) {
        segments.push({
          statement: statement.trim(),
          conditions: [condition],
        });
      }

      scriptWithoutBlocks = scriptWithoutBlocks.replace(match[0], "");
    }

    for (const match of scriptWithoutBlocks.matchAll(inlineEquipped)) {
      const [, ids, statement] = match;
      const conditions = createEquippedConditions(`isequipped(${ids})`);

      if (conditions) {
        segments.push({
          statement: statement.trim(),
          conditions,
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

  private extractAssignments(script: string, variables: ParserVariables) {
    return script.replace(
      /\.@([A-Za-z_][A-Za-z0-9_]*)\s*=\s*([^;]+);/g,
      (statement, variableName: string, expression: string) => {
        const trimmedExpression = expression.trim();

        if (trimmedExpression === "getrefine()") {
          variables.locals = {
            ...variables.locals,
            [variableName]: variables.refine,
          };
          return "";
        }

        if (trimmedExpression === "getenchantgrade()") {
          variables.locals = {
            ...variables.locals,
            [variableName]: variables.grade,
          };
          return "";
        }

        const value = evaluateRathenaExpression(trimmedExpression, variables);

        if (value === null) {
          return statement;
        }

        variables.locals = {
          ...variables.locals,
          [variableName]: value,
        };
        return "";
      },
    );
  }

  private extractRefineBlocks(
    script: string,
    inheritedConditions: ModifierCondition[] = [],
  ) {
    const segments: ScriptSegment[] = [];
    const refineBlockPattern =
      /if\s*\(\s*(?:getrefine\(\)|\.@r)\s*(>=|>|<=|<|==|!=)\s*(-?\d+)\s*\)\s*\{/g;
    let cursor = 0;
    let remainingScript = "";

    for (const match of script.matchAll(refineBlockPattern)) {
      if (this.isInsideBlock(script, match.index)) {
        continue;
      }

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
          ...this.extractNestedConditionedSegments(blockBody, [
            ...inheritedConditions,
            condition,
          ]),
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

  private extractGradeBlocks(
    script: string,
    inheritedConditions: ModifierCondition[] = [],
  ) {
    const segments: ScriptSegment[] = [];
    const gradeBlockPattern =
      /if\s*\(\s*(?:getenchantgrade\(\)|\.@g)\s*(>=|>|<=|<|==|!=)\s*(ENCHANTGRADE_[A-Z]+|-?\d+)\s*\)\s*\{/g;
    let cursor = 0;
    let remainingScript = "";

    for (const match of script.matchAll(gradeBlockPattern)) {
      if (this.isInsideBlock(script, match.index)) {
        continue;
      }

      const braceStart = match.index + match[0].length - 1;
      const braceEnd = this.findMatchingBrace(script, braceStart);

      if (braceEnd === -1 || match.index < cursor) {
        continue;
      }

      const [, operator, gradeValue] = match;
      const condition = createGradeCondition(operator, gradeValue);

      remainingScript += script.slice(cursor, match.index);

      if (condition) {
        const blockBody = script.slice(braceStart + 1, braceEnd);
        segments.push(
          ...this.extractNestedConditionedSegments(blockBody, [
            ...inheritedConditions,
            condition,
          ]),
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

  private extractNestedConditionedSegments(
    script: string,
    inheritedConditions: ModifierCondition[],
  ): ScriptSegment[] {
    const segments: ScriptSegment[] = [];
    let remainingScript = script;

    const refineBlockExtraction = this.extractRefineBlocks(
      remainingScript,
      inheritedConditions,
    );
    segments.push(...refineBlockExtraction.segments);
    remainingScript = refineBlockExtraction.remainingScript;

    const gradeBlockExtraction = this.extractGradeBlocks(
      remainingScript,
      inheritedConditions,
    );
    segments.push(...gradeBlockExtraction.segments);
    remainingScript = gradeBlockExtraction.remainingScript;

    const equippedBlockExtraction = this.extractEquippedBlocks(
      remainingScript,
      inheritedConditions,
    );
    segments.push(...equippedBlockExtraction.segments);
    remainingScript = equippedBlockExtraction.remainingScript;

    segments.push(
      ...this.splitStatements(remainingScript).map((statement) => ({
        statement,
        conditions: inheritedConditions,
      })),
    );

    return segments;
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

  private extractEquippedBlocks(
    script: string,
    inheritedConditions: ModifierCondition[] = [],
  ) {
    const segments: ScriptSegment[] = [];
    const equipBlockPattern = /if\s*\(([^{}]+)\)\s*\{/g;
    let cursor = 0;
    let remainingScript = "";

    for (const match of script.matchAll(equipBlockPattern)) {
      if (this.isInsideBlock(script, match.index)) {
        continue;
      }

      const braceStart = match.index + match[0].length - 1;
      const braceEnd = this.findMatchingBrace(script, braceStart);

      if (braceEnd === -1 || match.index < cursor) {
        continue;
      }

      const conditions = createEquippedConditions(match[1]);

      if (!conditions) {
        continue;
      }

      remainingScript += script.slice(cursor, match.index);
      const blockBody = script.slice(braceStart + 1, braceEnd);
      segments.push(
        ...this.extractNestedConditionedSegments(blockBody, [
          ...inheritedConditions,
          ...conditions,
        ]),
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

  private isInsideBlock(script: string, index: number) {
    let braceDepth = 0;
    let quote: '"' | "'" | null = null;
    let isEscaped = false;

    for (let charIndex = 0; charIndex < index; charIndex += 1) {
      const char = script[charIndex];

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
      }
    }

    return braceDepth > 0;
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
