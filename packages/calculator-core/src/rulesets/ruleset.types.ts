import { z } from "zod";

export const rulesetServerSchema = z.enum(["latam", "iro", "bro", "kro"]);
export const rulesetMechanicsSchema = z.enum(["renewal"]);

export const rulesetContextSchema = z.object({
  server: rulesetServerSchema.default("latam"),
  mechanics: rulesetMechanicsSchema.default("renewal"),
  episode: z.string().min(1).optional(),
});

export const defaultRulesetContext = {
  server: "latam",
  mechanics: "renewal",
} as const;

export type RulesetServer = z.infer<typeof rulesetServerSchema>;
export type RulesetMechanics = z.infer<typeof rulesetMechanicsSchema>;
export type RulesetContext = z.infer<typeof rulesetContextSchema>;
