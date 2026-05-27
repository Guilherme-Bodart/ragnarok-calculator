import type { MvpSpawnStatus } from "./guilds.schemas";

export type GuildMemberRole = "owner" | "officer" | "member";

export type GuildSummary = {
  id: string;
  slug: string;
  name: string;
  emblemUrl: string;
  description: string;
  server: string;
  memberCount: number;
  onlineCount: number;
  userRole: GuildMemberRole;
};

export type GuildMember = {
  id: string;
  displayName: string;
  role: GuildMemberRole;
  mainClass: string;
  status: "online" | "offline";
};

export type GuildInvite = {
  id: string;
  email: string;
  role: GuildMemberRole;
  status: "pending" | "accepted";
  createdAt: string;
};

export type GuildTool = {
  id: string;
  name: string;
  status: "ready" | "planned";
};

export type MvpKillEntry = {
  id: string;
  mvpName: string;
  map: string;
  killedAt: string;
  respawnMinutes: number;
  respawnAt: string;
  status: MvpSpawnStatus;
  notes?: string;
  recordedBy: string;
  createdAt: string;
};

export type GuildDashboard = {
  guild: GuildSummary;
  members: GuildMember[];
  invites: GuildInvite[];
  tools: GuildTool[];
  mvpEntries: MvpKillEntry[];
};
