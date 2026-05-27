import { z } from "zod";

export const createMvpKillSchema = z.object({
  mvpName: z.string().trim().min(2).max(80),
  map: z.string().trim().min(2).max(80),
  killedAt: z.string().refine((value) => !Number.isNaN(Date.parse(value)), {
    message: "Invalid killedAt date",
  }),
  respawnMinutes: z.number().int().min(1).max(24 * 60),
  notes: z.string().trim().max(240).optional(),
});

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
