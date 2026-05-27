import { ForbiddenException, Injectable, NotFoundException } from "@nestjs/common";
import {
  type CreateMvpKillRequest,
  getMvpSpawnStatus,
} from "./guilds.schemas";
import type {
  GuildDashboard,
  GuildInvite,
  GuildMember,
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
    userRole: "owner",
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
      role: "owner",
      mainClass: "Dragon Knight",
      status: "online",
    },
    {
      id: "member_02",
      userId: "user_mock_officer",
      displayName: "Mika",
      role: "officer",
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
    { id: "loot-ledger", name: "Loot Ledger", status: "planned" },
    { id: "attendance", name: "Presenca", status: "planned" },
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
