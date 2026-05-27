import { z } from "zod";

export const createGuildSchema = z.object({
  name: z.string().trim().min(2).max(80),
  slug: z
    .string()
    .trim()
    .min(2)
    .max(64)
    .regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/)
    .optional(),
  description: z.string().trim().max(240).optional(),
  server: z.string().trim().min(2).max(80).optional(),
});

export const createMvpKillSchema = z.object({
  catalogEntryId: z.string().trim().min(2).max(120).optional(),
  mvpName: z.string().trim().min(2).max(80).optional(),
  map: z.string().trim().min(2).max(80).optional(),
  killedAt: z.string().refine((value) => !Number.isNaN(Date.parse(value)), {
    message: "Invalid killedAt date",
  }),
  respawnMinutes: z.number().int().min(1).max(24 * 60).optional(),
  notes: z.string().trim().max(240).optional(),
}).superRefine((payload, context) => {
  if (payload.catalogEntryId) {
    return;
  }

  if (!payload.mvpName) {
    context.addIssue({
      code: "custom",
      message: "mvpName is required when catalogEntryId is not provided",
      path: ["mvpName"],
    });
  }

  if (!payload.map) {
    context.addIssue({
      code: "custom",
      message: "map is required when catalogEntryId is not provided",
      path: ["map"],
    });
  }

  if (!payload.respawnMinutes) {
    context.addIssue({
      code: "custom",
      message: "respawnMinutes is required when catalogEntryId is not provided",
      path: ["respawnMinutes"],
    });
  }
});

export type CreateGuildRequest = z.infer<typeof createGuildSchema>;
export type CreateMvpKillRequest = z.infer<typeof createMvpKillSchema>;

export type MvpSpawnStatus = "waiting" | "soon" | "spawned";

export function getMvpSpawnStatus(
  respawnAt: Date,
  now = new Date(),
): MvpSpawnStatus {
  const millisecondsUntilRespawn = respawnAt.getTime() - now.getTime();

  if (millisecondsUntilRespawn <= 0) {
    return "spawned";
  }

  if (millisecondsUntilRespawn <= 1000 * 60 * 15) {
    return "soon";
  }

  return "waiting";
}
