export type MvpSpawnStatus = "waiting" | "soon" | "spawned";

export type GuildRole = {
  id: string;
  name: string;
  color: string;
  rank: number;
};

export type GuildSummary = {
  id: string;
  slug: string;
  name: string;
  emblemUrl: string;
  description: string;
  server: string;
  memberCount: number;
  onlineCount: number;
  userRole: GuildRole;
  isOwner: boolean;
};

export type GuildMember = {
  id: string;
  userId: string;
  displayName: string;
  role: GuildRole;
  mainClass: string;
  status: "online" | "offline";
  isOwner: boolean;
};

export type GuildInvite = {
  id: string;
  email: string;
  role: GuildRole;
  status: "pending" | "accepted";
  createdAt: string;
};

export type GuildTool = {
  id: string;
  name: string;
  status: "ready" | "planned";
  minimumRole: GuildRole | null;
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
  requiredRole: GuildRole;
};

export type CurrentGuildUser = {
  id: string;
  email: string;
  displayName: string;
};

export type CurrentGuildContext = {
  user: CurrentGuildUser;
  guilds: GuildSummary[];
  activeGuild: GuildSummary | null;
};

export type MvpKillEntry = {
  id: string;
  mvpName: string;
  map: string;
  killedAt: string;
  respawnMinutes: number;
  respawnAt: string;
  respawnWindowEndAt?: string;
  status: MvpSpawnStatus;
  notes?: string;
  recordedBy: string;
  createdAt: string;
};

export type GuildDashboard = {
  guild: GuildSummary;
  roles: GuildRole[];
  members: GuildMember[];
  invites: GuildInvite[];
  tools: GuildTool[];
  notifications: GuildNotification[];
  feed: GuildFeedItem[];
  events: GuildEvent[];
  mvpEntries: MvpKillEntry[];
};
