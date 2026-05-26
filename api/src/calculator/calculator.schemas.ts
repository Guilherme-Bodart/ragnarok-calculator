import { z } from "zod";
import { defaultRulesetContext, rulesetContextSchema } from "../../../packages/calculator-core/src";

export const calculateDamageSchema = z.object({
  character: z.object({
    classId: z.string().min(1).optional(),
    baseLevel: z.number().int().min(1).max(260),
    jobLevel: z.number().int().min(1).max(70),
    stats: z.object({
      str: z.number().int().min(1).max(200),
      agi: z.number().int().min(1).max(200),
      vit: z.number().int().min(1).max(200),
      int: z.number().int().min(1).max(200),
      dex: z.number().int().min(1).max(200),
      luk: z.number().int().min(1).max(200),
      pow: z.number().int().min(0).max(200).default(0),
      sta: z.number().int().min(0).max(200).default(0),
      wis: z.number().int().min(0).max(200).default(0),
      spl: z.number().int().min(0).max(200).default(0),
      con: z.number().int().min(0).max(200).default(0),
      crt: z.number().int().min(0).max(200).default(0),
    }),
  }),
  ruleset: rulesetContextSchema.default(defaultRulesetContext),
  learnedSkills: z.record(z.string(), z.number().int().min(0)).default({}),
  equipmentItemIds: z.array(z.number().int().positive()).default([]),
  cardItemIds: z.array(z.number().int().positive()).default([]),
  buffItemIds: z.array(z.number().int().positive()).default([]),
  itemContexts: z
    .array(
      z.object({
        itemId: z.number().int().positive(),
        refine: z.number().int().min(0).max(20).optional(),
      }),
    )
    .default([]),
  monsterId: z.number().int().positive(),
  skillId: z.string().min(1),
  skillLevel: z.number().int().min(1).max(100),
});

export type CalculateDamageRequest = z.infer<typeof calculateDamageSchema>;
