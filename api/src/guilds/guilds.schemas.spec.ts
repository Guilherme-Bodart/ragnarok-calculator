import { describe, expect, it } from "vitest";
import { createMvpKillSchema, getMvpSpawnStatus } from "./guilds.schemas";

describe("guild schemas", () => {
  it("accepts a valid MVP kill payload", () => {
    const payload = createMvpKillSchema.parse({
      mvpName: "Eddga",
      map: "pay_fild11",
      killedAt: "2026-05-27T10:00:00.000Z",
      respawnMinutes: 120,
    });

    expect(payload.mvpName).toBe("Eddga");
  });

  it("rejects invalid kill dates", () => {
    expect(() =>
      createMvpKillSchema.parse({
        mvpName: "Eddga",
        map: "pay_fild11",
        killedAt: "not-a-date",
        respawnMinutes: 120,
      }),
    ).toThrow();
  });

  it("calculates MVP spawn status from respawn time", () => {
    const now = new Date("2026-05-27T10:00:00.000Z");

    expect(getMvpSpawnStatus(new Date("2026-05-27T10:30:00.000Z"), now)).toBe(
      "waiting",
    );
    expect(getMvpSpawnStatus(new Date("2026-05-27T10:10:00.000Z"), now)).toBe(
      "soon",
    );
    expect(getMvpSpawnStatus(new Date("2026-05-27T09:59:00.000Z"), now)).toBe(
      "spawned",
    );
  });
});
