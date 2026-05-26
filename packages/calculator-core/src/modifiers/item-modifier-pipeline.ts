import { ModifierAggregator } from "./modifier-aggregator";
import { ModifierNormalizer } from "./modifier-normalizer";
import { ModifierResolver } from "./modifier-resolver";
import {
  itemModifierPipelineResultSchema,
  itemModifierSourceSchema,
  type ItemModifierPipelineResult,
  type ItemModifierSource,
  type ModifierResolutionContext,
} from "./modifier.types";

export class ItemModifierPipeline {
  constructor(
    private readonly normalizer = new ModifierNormalizer(),
    private readonly resolver = new ModifierResolver(),
    private readonly aggregator = new ModifierAggregator(),
  ) {}

  getEffects(
    source: ItemModifierSource,
    context: ModifierResolutionContext = {},
  ): ItemModifierPipelineResult {
    const parsedSource = itemModifierSourceSchema.parse(source);
    const parsed = this.getInputModifiers(parsedSource, context);
    const applicableModifiers = this.resolver.resolve(parsed.modifiers, context);
    const aggregation = this.aggregator.aggregate(applicableModifiers);

    return itemModifierPipelineResultSchema.parse({
      inputModifiers: parsed.modifiers,
      applicableModifiers,
      aggregation,
      unsupportedStatements: parsed.unsupportedStatements,
    });
  }

  private getInputModifiers(
    source: ItemModifierSource,
    context: ModifierResolutionContext,
  ) {
    if (source.modifiers) {
      return {
        modifiers: source.modifiers,
        unsupportedStatements: [],
      };
    }

    if (source.rawScript) {
      return this.normalizer.fromRawScript(source.rawScript, context);
    }

    return {
      modifiers: [],
      unsupportedStatements: [],
    };
  }
}
