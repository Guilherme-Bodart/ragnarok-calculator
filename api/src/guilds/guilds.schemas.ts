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

const hexColorSchema = z
  .string()
  .trim()
  .regex(/^#(?:[0-9a-fA-F]{3}|[0-9a-fA-F]{6})$/);

export const createGuildRoleSchema = z.object({
  name: z.string().trim().min(1).max(40),
  color: hexColorSchema,
  rank: z.number().int().min(1).max(10).optional(),
});

export const updateGuildRoleSchema = z.object({
  name: z.string().trim().min(1).max(40).optional(),
  color: hexColorSchema.optional(),
  rank: z.number().int().min(1).max(10).optional(),
});

export const updateGuildMemberRoleSchema = z.object({
  roleId: z.string().trim().min(1),
});

export const updateGuildToolAccessSchema = z.object({
  minimumRoleId: z.string().trim().min(1),
});

export const transferGuildLeadershipSchema = z.object({
  memberId: z.string().trim().min(1),
});

export type CreateGuildRequest = z.infer<typeof createGuildSchema>;
export type CreateMvpKillRequest = z.infer<typeof createMvpKillSchema>;
export type CreateGuildRoleRequest = z.infer<typeof createGuildRoleSchema>;
export type UpdateGuildRoleRequest = z.infer<typeof updateGuildRoleSchema>;
export type UpdateGuildMemberRoleRequest = z.infer<typeof updateGuildMemberRoleSchema>;
export type UpdateGuildToolAccessRequest = z.infer<typeof updateGuildToolAccessSchema>;
export type TransferGuildLeadershipRequest = z.infer<typeof transferGuildLeadershipSchema>;

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
