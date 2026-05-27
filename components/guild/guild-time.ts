import type { MvpSpawnStatus } from "./guild-types";

export function getMvpStatus(respawnAt: string): MvpSpawnStatus {
  const millisecondsUntilRespawn = new Date(respawnAt).getTime() - Date.now();

  if (millisecondsUntilRespawn <= 0) {
    return "spawned";
  }

  if (millisecondsUntilRespawn <= 1000 * 60 * 15) {
    return "soon";
  }

  return "waiting";
}
