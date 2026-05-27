import { ForbiddenException, Injectable, NotFoundException } from "@nestjs/common";
import {
  type CreateMvpKillRequest,
  getMvpSpawnStatus,
} from "./guilds.schemas";
import type {
  GuildDashboard,
  GuildEvent,
  GuildFeedItem,
  GuildInvite,
  GuildMember,
  GuildNotification,
  GuildSummary,
  GuildTool,
  MvpKillEntry,
} from "./guilds.types";

type StoredMvpKillEntry = Omit<MvpKillEntry, "status">;
type StoredGuildMember = GuildMember & { userId: string };

const mockCurrentUser = {
  id: "user_mock_owner",
  email: "guild.master@example.com",
  displayName: "Bodart",
};

@Injectable()
export class MockGuildsStore {
  private readonly guild: GuildSummary = {
    id: "guild_nightmare",
    slug: "nightmare",
    name: "Nightmare",
    emblemUrl: "/nightmare-reaper.png",
    description: "War room para timers, drops, convites e rotina de guilda.",
    server: "Ragnarok Online",
    memberCount: 38,
    onlineCount: 11,
    userRole: "admin",
  };

  private readonly inaccessibleGuild: GuildSummary = {
    id: "guild_valhalla",
    slug: "valhalla",
    name: "Valhalla",
    emblemUrl: "/nightmare-reaper.png",
    description: "Guilda existente no mock, mas sem membership do usuario atual.",
    server: "Ragnarok Online",
    memberCount: 24,
    onlineCount: 4,
    userRole: "member",
  };

  private readonly members: StoredGuildMember[] = [
    {
      id: "member_01",
      userId: mockCurrentUser.id,
      displayName: "Bodart",
      role: "admin",
      mainClass: "Dragon Knight",
      status: "online",
    },
    {
      id: "member_02",
      userId: "user_mock_officer",
      displayName: "Mika",
      role: "leader",
      mainClass: "Cardinal",
      status: "online",
    },
    {
      id: "member_03",
      userId: "user_mock_member",
      displayName: "Zero",
      role: "member",
      mainClass: "Shadow Cross",
      status: "offline",
    },
  ];

  private readonly invites: GuildInvite[] = [
    {
      id: "invite_01",
      email: "new.recruit@example.com",
      role: "member",
      status: "pending",
      createdAt: new Date(Date.now() - 1000 * 60 * 42).toISOString(),
    },
  ];

  private readonly tools: GuildTool[] = [
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
  ];

  private readonly notifications: GuildNotification[] = [
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
  ];

  private readonly feed: GuildFeedItem[] = [
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
  ];

  private readonly events: GuildEvent[] = [
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
  ];

  private readonly mvpEntries: StoredMvpKillEntry[] = [
    createSeedMvpKill("mvp_seed_01", "Eddga", "pay_fild11", 120, -72, "Janela principal"),
    createSeedMvpKill("mvp_seed_02", "Maya", "anthell02", 120, -111, "Scout confirmado"),
    createSeedMvpKill("mvp_seed_03", "Moonlight Flower", "pay_dun04", 60, -75),
  ];

  getCurrentContext() {
    const member = this.findMembership(this.guild.slug, mockCurrentUser.id);

    if (!member) {
      throw new ForbiddenException("User has no guild access");
    }

    const activeGuild = {
      ...this.guild,
      userRole: member.role,
    };

    return {
      user: mockCurrentUser,
      guilds: [activeGuild],
      activeGuild,
    };
  }

  getDashboard(slug: string): GuildDashboard {
    const member = this.assertMembership(slug, mockCurrentUser.id);

    return {
      guild: {
        ...this.guild,
        userRole: member.role,
      },
      members: this.members.map((member) => ({
        id: member.id,
        displayName: member.displayName,
        role: member.role,
        mainClass: member.mainClass,
        status: member.status,
      })),
      invites: this.invites,
      tools: this.tools,
      notifications: this.notifications,
      feed: this.feed,
      events: this.events,
      mvpEntries: this.getMvpEntries(slug),
    };
  }

  getMvpEntries(slug: string): MvpKillEntry[] {
    this.assertMembership(slug, mockCurrentUser.id);

    return this.mvpEntries
      .map((entry) => this.withStatus(entry))
      .sort(
        (first, second) =>
          new Date(first.respawnAt).getTime() - new Date(second.respawnAt).getTime(),
      );
  }

  createMvpKill(slug: string, payload: CreateMvpKillRequest): MvpKillEntry {
    this.assertMembership(slug, mockCurrentUser.id);

    const killedAt = new Date(payload.killedAt);
    const respawnAt = new Date(
      killedAt.getTime() + payload.respawnMinutes * 60 * 1000,
    );

    const entry: StoredMvpKillEntry = {
      id: `mvp_${Date.now()}`,
      mvpName: payload.mvpName,
      map: payload.map,
      killedAt: killedAt.toISOString(),
      respawnMinutes: payload.respawnMinutes,
      respawnAt: respawnAt.toISOString(),
      notes: payload.notes,
      recordedBy: mockCurrentUser.displayName,
      createdAt: new Date().toISOString(),
    };

    this.mvpEntries.unshift(entry);

    return this.withStatus(entry);
  }

  private withStatus(entry: StoredMvpKillEntry): MvpKillEntry {
    return {
      ...entry,
      status: getMvpSpawnStatus(new Date(entry.respawnAt)),
    };
  }

  private assertGuild(slug: string) {
    if (slug !== this.guild.slug && slug !== this.inaccessibleGuild.slug) {
      throw new NotFoundException("Guild not found");
    }
  }

  private assertMembership(slug: string, userId: string) {
    this.assertGuild(slug);

    const member = this.findMembership(slug, userId);

    if (!member) {
      throw new ForbiddenException("User does not belong to this guild");
    }

    return member;
  }

  private findMembership(slug: string, userId: string) {
    if (slug !== this.guild.slug) {
      return null;
    }

    return this.members.find((member) => member.userId === userId) ?? null;
  }
}

function createSeedMvpKill(
  id: string,
  mvpName: string,
  map: string,
  respawnMinutes: number,
  killedMinutesAgo: number,
  notes?: string,
): StoredMvpKillEntry {
  const killedAt = new Date(Date.now() + killedMinutesAgo * 60 * 1000);
  const respawnAt = new Date(killedAt.getTime() + respawnMinutes * 60 * 1000);

  return {
    id,
    mvpName,
    map,
    killedAt: killedAt.toISOString(),
    respawnMinutes,
    respawnAt: respawnAt.toISOString(),
    notes,
    recordedBy: "Mock Officer",
    createdAt: killedAt.toISOString(),
  };
}
