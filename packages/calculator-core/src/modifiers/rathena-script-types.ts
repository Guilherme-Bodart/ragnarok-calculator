import type { ModifierCondition } from "./modifier.types";

export type ParsedCommand = {
  command: "bonus" | "bonus2";
  args: string[];
  raw: string;
};

export type ScriptSegment = {
  statement: string;
  conditions: ModifierCondition[];
};

export type ParserVariables = {
  refine?: number;
  grade?: number;
  baseLevel?: number;
  locals?: Record<string, number | undefined>;
};
