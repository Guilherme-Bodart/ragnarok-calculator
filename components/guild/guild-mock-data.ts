import type { GuildDashboard, MvpKillEntry, MvpSpawnStatus } from "./guild-types";

export const fallbackDashboard: GuildDashboard = {
  guild: {
    id: "guild_nightmare",
    slug: "nightmare",
    name: "Nightmare",
    emblemUrl: "/nightmare-reaper.png",
    description: "War room para timers, drops, convites e rotina de guilda.",
    server: "Ragnarok Online",
    memberCount: 38,
    onlineCount: 11,
    userRole: "owner",
  },
  members: [
    {
      id: "member_01",
      displayName: "Bodart",
      role: "owner",
      mainClass: "Dragon Knight",
      status: "online",
    },
    {
      id: "member_02",
      displayName: "Mika",
      role: "officer",
      mainClass: "Cardinal",
      status: "online",
    },
    {
      id: "member_03",
      displayName: "Zero",
      role: "member",
      mainClass: "Shadow Cross",
      status: "offline",
    },
  ],
  invites: [
    {
      id: "invite_01",
      email: "new.recruit@example.com",
      role: "member",
      status: "pending",
      createdAt: new Date(Date.now() - 1000 * 60 * 42).toISOString(),
    },
  ],
  tools: [
    { id: "mvp-tracker", name: "MVP Tracker", status: "ready" },
    { id: "loot-ledger", name: "Loot Ledger", status: "planned" },
    { id: "attendance", name: "Presenca", status: "planned" },
  ],
  mvpEntries: [
    createFallbackMvp("mvp_seed_01", "Eddga", "pay_fild11", 120, -72, "Janela principal"),
    createFallbackMvp("mvp_seed_02", "Maya", "anthell02", 120, -111, "Scout confirmado"),
    createFallbackMvp("mvp_seed_03", "Moonlight Flower", "pay_dun04", 60, -75),
  ],
};

export function getMvpStatus(respawnAt: string, now = new Date()): MvpSpawnStatus {
  const millisecondsUntilRespawn = new Date(respawnAt).getTime() - now.getTime();

  if (millisecondsUntilRespawn <= 0) {
    return "spawned";
  }

  if (millisecondsUntilRespawn <= 1000 * 60 * 15) {
    return "soon";
  }

  return "waiting";
}

export function createLocalMvpEntry(input: {
  mvpName: string;
  map: string;
  killedAt: string;
  respawnMinutes: number;
  notes?: string;
}): MvpKillEntry {
  const killedAt = new Date(input.killedAt);
  const respawnAt = new Date(
    killedAt.getTime() + input.respawnMinutes * 60 * 1000,
  ).toISOString();

  return {
    id: `local_${Date.now()}`,
    mvpName: input.mvpName,
    map: input.map,
    killedAt: killedAt.toISOString(),
    respawnMinutes: input.respawnMinutes,
    respawnAt,
    status: getMvpStatus(respawnAt),
    notes: input.notes,
    recordedBy: "Mock Officer",
    createdAt: new Date().toISOString(),
  };
}

function createFallbackMvp(
  id: string,
  mvpName: string,
  map: string,
  respawnMinutes: number,
  killedMinutesAgo: number,
  notes?: string,
): MvpKillEntry {
  const killedAt = new Date(Date.now() + killedMinutesAgo * 60 * 1000);
  const respawnAt = new Date(
    killedAt.getTime() + respawnMinutes * 60 * 1000,
  ).toISOString();

  return {
    id,
    mvpName,
    map,
    killedAt: killedAt.toISOString(),
    respawnMinutes,
    respawnAt,
    status: getMvpStatus(respawnAt),
    notes,
    recordedBy: "Mock Officer",
    createdAt: killedAt.toISOString(),
  };
}
