import { modifierParseResultSchema } from "./modifier.types";
import { RathenaScriptParser } from "./rathena-script-parser";
import type { ModifierResolutionContext } from "./modifier.types";

export class ModifierNormalizer {
  constructor(private readonly parser = new RathenaScriptParser()) {}

  fromRawScript(rawScript: string, context: ModifierResolutionContext = {}) {
    return modifierParseResultSchema.parse(this.parser.parse(rawScript, context));
  }
}
