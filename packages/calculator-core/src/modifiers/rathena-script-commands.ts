import type { ParsedCommand } from "./rathena-script-types";

export function parseRathenaCommand(statement: string): ParsedCommand | null {
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
