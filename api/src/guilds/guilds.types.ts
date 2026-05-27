import type { MvpSpawnStatus } from "./guilds.schemas";

export type GuildMemberRole = "member" | "officer" | "leader" | "admin";

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

export type GuildNotification = {
  id: string;
  title: string;
  body: string;
  tone: "info" | "warning" | "success";
  createdAt: string;
  read: boolean;
};

export type GuildFeedItem = {
  id: string;
  author: string;
  title: string;
  body: string;
  createdAt: string;
  type: "announcement" | "activity" | "system";
};

export type GuildEvent = {
  id: string;
  title: string;
  startsAt: string;
  type: "woe" | "farm" | "meeting";
  requiredRole: GuildMemberRole;
};

export type CurrentGuildUser = {
  id: string;
  email: string;
  displayName: string;
};

export type CurrentGuildContext = {
  user: CurrentGuildUser;
  guilds: GuildSummary[];
  activeGuild: GuildSummary;
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
  notifications: GuildNotification[];
  feed: GuildFeedItem[];
  events: GuildEvent[];
  mvpEntries: MvpKillEntry[];
};
