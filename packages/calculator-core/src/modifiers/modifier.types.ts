import { z } from "zod";
import { rulesetContextSchema } from "../rulesets";

export const modifierOperatorSchema = z.enum([
  "addFlat",
  "addPercent",
]);

export const modifierRaceIdSchema = z.enum([
  "all",
  "formless",
  "undead",
  "brute",
  "plant",
  "insect",
  "fish",
  "demon",
  "demihuman",
  "angel",
  "dragon",
]);

export const modifierElementIdSchema = z.enum([
  "all",
  "neutral",
  "water",
  "earth",
  "fire",
  "wind",
  "poison",
  "holy",
  "dark",
  "ghost",
  "undead",
]);

export const modifierSizeIdSchema = z.enum(["all", "small", "medium", "large"]);

export const modifierTargetSchema = z.discriminatedUnion("type", [
  z.object({ type: z.literal("self") }),
  z.object({
    type: z.literal("race"),
    raceId: modifierRaceIdSchema,
  }),
  z.object({
    type: z.literal("element"),
    elementId: modifierElementIdSchema,
  }),
  z.object({
    type: z.literal("size"),
    sizeId: modifierSizeIdSchema,
  }),
  z.object({
    type: z.literal("skill"),
    skillId: z.string().min(1),
  }),
]);

export const modifierConditionSchema = z.discriminatedUnion("type", [
  z.object({
    type: z.literal("refine"),
    operator: z.enum([">", ">=", "<", "<=", "==", "!="]),
    value: z.number().int(),
  }),
  z.object({
    type: z.literal("skillLevel"),
    skillId: z.string().min(1),
    operator: z.enum([">", ">=", "<", "<=", "==", "!="]),
    value: z.number().int(),
  }),
  z.object({
    type: z.literal("class"),
    classId: z.string().min(1),
    operator: z.enum(["==", "!="]),
  }),
]);

export const normalizedModifierSchema = z.object({
  stat: z.enum([
    "atk",
    "matk",
    "str",
    "agi",
    "vit",
    "int",
    "dex",
    "luk",
    "allStats",
    "pAtk",
    "smatk",
    "atkRate",
    "matkRate",
    "baseAtk",
    "raceDamageRate",
    "elementDamageRate",
    "sizeDamageRate",
    "skillDamageRate",
    "magicRaceDamageRate",
    "magicElementDamageRate",
    "magicSizeDamageRate",
    "magicElementAttackRate",
  ]),
  operator: modifierOperatorSchema,
  value: z.number(),
  target: modifierTargetSchema,
  conditions: z.array(modifierConditionSchema).default([]),
  source: z.object({
    format: z.literal("rathena"),
    command: z.enum(["bonus", "bonus2"]),
    raw: z.string(),
    args: z.array(z.string()),
  }),
});

export const modifierParseResultSchema = z.object({
  modifiers: z.array(normalizedModifierSchema),
  unsupportedStatements: z.array(z.string()),
});

export const aggregatedModifierSchema = z.object({
  stat: normalizedModifierSchema.shape.stat,
  operator: modifierOperatorSchema,
  target: modifierTargetSchema,
  value: z.number(),
  breakdown: z.array(normalizedModifierSchema),
});

export const modifierAggregationResultSchema = z.object({
  buckets: z.array(aggregatedModifierSchema),
});

export const modifierResolutionContextSchema = z.object({
  classId: z.string().min(1).optional(),
  refine: z.number().int().min(0).optional(),
  learnedSkills: z.record(z.string(), z.number().int().min(0)).optional(),
  ruleset: rulesetContextSchema.optional(),
});

export const itemModifierSourceSchema = z.object({
  rawScript: z.string().optional(),
  modifiers: z.array(normalizedModifierSchema).optional(),
});

export const itemModifierPipelineResultSchema = z.object({
  inputModifiers: z.array(normalizedModifierSchema),
  applicableModifiers: z.array(normalizedModifierSchema),
  aggregation: modifierAggregationResultSchema,
  unsupportedStatements: z.array(z.string()),
});

export type ModifierOperator = z.infer<typeof modifierOperatorSchema>;
export type ModifierRaceId = z.infer<typeof modifierRaceIdSchema>;
export type ModifierElementId = z.infer<typeof modifierElementIdSchema>;
export type ModifierSizeId = z.infer<typeof modifierSizeIdSchema>;
export type ModifierTarget = z.infer<typeof modifierTargetSchema>;
export type ModifierCondition = z.infer<typeof modifierConditionSchema>;
export type NormalizedModifier = z.infer<typeof normalizedModifierSchema>;
export type ModifierParseResult = z.infer<typeof modifierParseResultSchema>;
export type AggregatedModifier = z.infer<typeof aggregatedModifierSchema>;
export type ModifierAggregationResult = z.infer<
  typeof modifierAggregationResultSchema
>;
export type ModifierResolutionContext = z.infer<
  typeof modifierResolutionContextSchema
>;
export type ItemModifierSource = z.infer<typeof itemModifierSourceSchema>;
export type ItemModifierPipelineResult = z.infer<
  typeof itemModifierPipelineResultSchema
>;
