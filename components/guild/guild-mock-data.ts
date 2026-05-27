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
    userRole: "admin",
  },
  members: [
    {
      id: "member_01",
      displayName: "Bodart",
      role: "admin",
      mainClass: "Dragon Knight",
      status: "online",
    },
    {
      id: "member_02",
      displayName: "Mika",
      role: "leader",
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
    { id: "guild-feed", name: "Guild Feed", status: "ready" },
    { id: "notifications", name: "Notificacoes", status: "ready" },
    { id: "guild-calendar", name: "Agenda", status: "ready" },
    { id: "member-management", name: "Membros", status: "ready" },
    { id: "woe-tracker", name: "WoE Tracker", status: "planned" },
    { id: "economy", name: "Economia", status: "planned" },
    { id: "drops", name: "Drops", status: "planned" },
    { id: "builds", name: "Builds", status: "planned" },
    { id: "analytics", name: "Analytics", status: "planned" },
  ],
  notifications: [
    {
      id: "notification_01",
      title: "Janela de MVP abrindo",
      body: "Maya entra na janela de respawn em poucos minutos.",
      tone: "warning",
      createdAt: new Date(Date.now() - 1000 * 60 * 8).toISOString(),
      read: false,
    },
    {
      id: "notification_02",
      title: "Convite pendente",
      body: "1 novo recruta aguarda aprovacao.",
      tone: "info",
      createdAt: new Date(Date.now() - 1000 * 60 * 31).toISOString(),
      read: false,
    },
    {
      id: "notification_03",
      title: "Farm finalizado",
      body: "Relatorio de drops da party noturna foi publicado.",
      tone: "success",
      createdAt: new Date(Date.now() - 1000 * 60 * 74).toISOString(),
      read: true,
    },
  ],
  feed: [
    {
      id: "feed_01",
      author: "Mika",
      title: "Prioridade da noite",
      body: "Foco em timers de MVP e farm de consumiveis para WoE.",
      type: "announcement",
      createdAt: new Date(Date.now() - 1000 * 60 * 24).toISOString(),
    },
    {
      id: "feed_02",
      author: "System",
      title: "Timer registrado",
      body: "Moonlight Flower foi adicionada ao MVP Tracker.",
      type: "activity",
      createdAt: new Date(Date.now() - 1000 * 60 * 54).toISOString(),
    },
    {
      id: "feed_03",
      author: "Bodart",
      title: "Setup de builds",
      body: "Comecando a organizar presets para classes principais.",
      type: "announcement",
      createdAt: new Date(Date.now() - 1000 * 60 * 118).toISOString(),
    },
  ],
  events: [
    {
      id: "event_01",
      title: "WoE Training",
      startsAt: new Date(Date.now() + 1000 * 60 * 60 * 4).toISOString(),
      type: "woe",
      requiredRole: "member",
    },
    {
      id: "event_02",
      title: "Farm de consumiveis",
      startsAt: new Date(Date.now() + 1000 * 60 * 60 * 22).toISOString(),
      type: "farm",
      requiredRole: "member",
    },
    {
      id: "event_03",
      title: "Revisao de lineup",
      startsAt: new Date(Date.now() + 1000 * 60 * 60 * 31).toISOString(),
      type: "meeting",
      requiredRole: "officer",
    },
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
