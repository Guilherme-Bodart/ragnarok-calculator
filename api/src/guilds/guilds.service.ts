import {
  ConflictException,
  ForbiddenException,
  Injectable,
  NotFoundException,
} from "@nestjs/common";
import { Prisma } from "../generated/prisma/client";
import { PrismaService } from "../prisma/prisma.service";
import {
  type CreateGuildRequest,
  type CreateMvpKillRequest,
  getMvpSpawnStatus,
} from "./guilds.schemas";
import type {
  CurrentGuildUser,
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

type AuthenticatedUser = {
  id: string;
  email: string;
  name: string | null;
  createdAt: Date;
};

type GuildMembership = Prisma.GuildMemberGetPayload<{
  include: { guild: true };
}>;

const guildTools: GuildTool[] = [
  { id: "mvp-tracker", name: "MVP Tracker", status: "ready" },
  { id: "guild-feed", name: "Guild Feed", status: "ready" },
  { id: "notifications", name: "Notificações", status: "ready" },
  { id: "guild-calendar", name: "Agenda", status: "ready" },
  { id: "member-management", name: "Membros", status: "ready" },
  { id: "woe-tracker", name: "WoE Tracker", status: "planned" },
  { id: "economy", name: "Economia", status: "planned" },
  { id: "drops", name: "Drops", status: "planned" },
  { id: "builds", name: "Builds", status: "planned" },
  { id: "analytics", name: "Analytics", status: "planned" },
];

@Injectable()
export class GuildsService {
  constructor(private readonly prisma: PrismaService) {}

  async getCurrentContext(user: AuthenticatedUser) {
    const memberships = await this.prisma.guildMember.findMany({
      where: { userId: user.id },
      include: {
        guild: {
          include: {
            _count: { select: { members: true } },
          },
        },
      },
      orderBy: { createdAt: "asc" },
    });

    const guilds = await Promise.all(
      memberships.map((membership) => this.toGuildSummary(membership)),
    );

    return {
      user: this.toCurrentGuildUser(user),
      guilds,
      activeGuild: guilds[0] ?? null,
    };
  }

  async createGuild(user: AuthenticatedUser, payload: CreateGuildRequest) {
    const slug = payload.slug ?? slugify(payload.name);

    if (!slug) {
      throw new ConflictException("Guild slug is invalid");
    }

    try {
      const guild = await this.prisma.guild.create({
        data: {
          slug,
          name: payload.name,
          description:
            payload.description ??
            "Workspace da guilda para timers, eventos, membros e operações.",
          server: payload.server ?? "Ragnarok Online",
          members: {
            create: {
              userId: user.id,
              displayName: getDisplayName(user),
              role: "admin",
              status: "online",
            },
          },
          notifications: {
            create: {
              title: "Guilda criada",
              body: "Seu workspace está pronto para receber ferramentas.",
              tone: "success",
            },
          },
          feedItems: {
            create: {
              author: "System",
              title: "Workspace iniciado",
              body: `${payload.name} foi criada no Nightmare Guild Tools.`,
              type: "system",
            },
          },
        },
        include: {
          members: { where: { userId: user.id }, take: 1 },
          _count: { select: { members: true } },
        },
      });

      const member = guild.members[0];

      return {
        guild: {
          id: guild.id,
          slug: guild.slug,
          name: guild.name,
          emblemUrl: guild.emblemUrl,
          description: guild.description,
          server: guild.server,
          memberCount: guild._count.members,
          onlineCount: 1,
          userRole: member.role,
        } satisfies GuildSummary,
      };
    } catch (error) {
      if (isUniqueConstraintError(error)) {
        throw new ConflictException("Guild slug already exists");
      }

      throw error;
    }
  }

  async getDashboard(user: AuthenticatedUser, slug: string): Promise<GuildDashboard> {
    const membership = await this.assertMembership(user.id, slug);
    const [members, invites, notifications, feed, events, mvpEntries] =
      await Promise.all([
        this.getMembers(membership.guildId),
        this.getInvites(membership.guildId),
        this.getNotifications(membership.guildId),
        this.getFeed(membership.guildId),
        this.getEvents(membership.guildId),
        this.getMvpEntryList(membership.guildId),
      ]);

    return {
      guild: await this.toGuildSummary(membership),
      members,
      invites,
      tools: guildTools,
      notifications,
      feed,
      events,
      mvpEntries,
    };
  }

  async getMvpEntries(user: AuthenticatedUser, slug: string) {
    const membership = await this.assertMembership(user.id, slug);

    return { entries: await this.getMvpEntryList(membership.guildId) };
  }

  async createMvpKill(
    user: AuthenticatedUser,
    slug: string,
    payload: CreateMvpKillRequest,
  ) {
    const membership = await this.assertMembership(user.id, slug);
    const killedAt = new Date(payload.killedAt);
    const respawnAt = new Date(
      killedAt.getTime() + payload.respawnMinutes * 60 * 1000,
    );

    const entry = await this.prisma.mvpKill.create({
      data: {
        guildId: membership.guildId,
        mvpName: payload.mvpName,
        map: payload.map,
        killedAt,
        respawnMinutes: payload.respawnMinutes,
        respawnAt,
        notes: payload.notes,
        recordedById: user.id,
      },
      include: {
        recordedBy: { select: { email: true, name: true } },
      },
    });

    await this.prisma.guildFeedItem.create({
      data: {
        guildId: membership.guildId,
        author: getDisplayName(user),
        title: "Timer registrado",
        body: `${payload.mvpName} foi adicionada ao MVP Tracker.`,
        type: "activity",
      },
    });

    return { entry: this.toMvpEntry(entry) };
  }

  private async assertMembership(userId: string, slug: string) {
    const guild = await this.prisma.guild.findUnique({
      where: { slug },
      select: { id: true },
    });

    if (!guild) {
      throw new NotFoundException("Guild not found");
    }

    const membership = await this.prisma.guildMember.findUnique({
      where: {
        guildId_userId: {
          guildId: guild.id,
          userId,
        },
      },
      include: { guild: true },
    });

    if (!membership) {
      throw new ForbiddenException("User does not belong to this guild");
    }

    return membership;
  }

  private async toGuildSummary(
    membership: GuildMembership | (GuildMembership & { guild: { _count?: { members: number } } }),
  ): Promise<GuildSummary> {
    const memberCount =
      "_count" in membership.guild && membership.guild._count
        ? membership.guild._count.members
        : await this.prisma.guildMember.count({
            where: { guildId: membership.guildId },
          });
    const onlineCount = await this.prisma.guildMember.count({
      where: { guildId: membership.guildId, status: "online" },
    });

    return {
      id: membership.guild.id,
      slug: membership.guild.slug,
      name: membership.guild.name,
      emblemUrl: membership.guild.emblemUrl,
      description: membership.guild.description,
      server: membership.guild.server,
      memberCount,
      onlineCount,
      userRole: membership.role,
    };
  }

  private async getMembers(guildId: string): Promise<GuildMember[]> {
    const members = await this.prisma.guildMember.findMany({
      where: { guildId },
      orderBy: [{ role: "desc" }, { createdAt: "asc" }],
    });

    return members.map((member) => ({
      id: member.id,
      displayName: member.displayName,
      role: member.role,
      mainClass: member.mainClass,
      status: member.status,
    }));
  }

  private async getInvites(guildId: string): Promise<GuildInvite[]> {
    const invites = await this.prisma.guildInvite.findMany({
      where: { guildId },
      orderBy: { createdAt: "desc" },
    });

    return invites.map((invite) => ({
      id: invite.id,
      email: invite.email,
      role: invite.role,
      status: invite.status,
      createdAt: invite.createdAt.toISOString(),
    }));
  }

  private async getNotifications(guildId: string): Promise<GuildNotification[]> {
    const notifications = await this.prisma.guildNotification.findMany({
      where: { guildId },
      orderBy: { createdAt: "desc" },
      take: 20,
    });

    return notifications.map((notification) => ({
      id: notification.id,
      title: notification.title,
      body: notification.body,
      tone: notification.tone,
      createdAt: notification.createdAt.toISOString(),
      read: notification.read,
    }));
  }

  private async getFeed(guildId: string): Promise<GuildFeedItem[]> {
    const feed = await this.prisma.guildFeedItem.findMany({
      where: { guildId },
      orderBy: { createdAt: "desc" },
      take: 20,
    });

    return feed.map((item) => ({
      id: item.id,
      author: item.author,
      title: item.title,
      body: item.body,
      createdAt: item.createdAt.toISOString(),
      type: item.type,
    }));
  }

  private async getEvents(guildId: string): Promise<GuildEvent[]> {
    const events = await this.prisma.guildEvent.findMany({
      where: { guildId },
      orderBy: { startsAt: "asc" },
      take: 20,
    });

    return events.map((event) => ({
      id: event.id,
      title: event.title,
      startsAt: event.startsAt.toISOString(),
      type: event.type,
      requiredRole: event.requiredRole,
    }));
  }

  private async getMvpEntryList(guildId: string): Promise<MvpKillEntry[]> {
    const entries = await this.prisma.mvpKill.findMany({
      where: { guildId },
      include: {
        recordedBy: { select: { email: true, name: true } },
      },
      orderBy: { respawnAt: "asc" },
      take: 100,
    });

    return entries.map((entry) => this.toMvpEntry(entry));
  }

  private toCurrentGuildUser(user: AuthenticatedUser): CurrentGuildUser {
    return {
      id: user.id,
      email: user.email,
      displayName: getDisplayName(user),
    };
  }

  private toMvpEntry(
    entry: Prisma.MvpKillGetPayload<{
      include: { recordedBy: { select: { email: true; name: true } } };
    }>,
  ): MvpKillEntry {
    return {
      id: entry.id,
      mvpName: entry.mvpName,
      map: entry.map,
      killedAt: entry.killedAt.toISOString(),
      respawnMinutes: entry.respawnMinutes,
      respawnAt: entry.respawnAt.toISOString(),
      status: getMvpSpawnStatus(entry.respawnAt),
      notes: entry.notes ?? undefined,
      recordedBy: entry.recordedBy.name ?? entry.recordedBy.email,
      createdAt: entry.createdAt.toISOString(),
    };
  }
}

function getDisplayName(user: Pick<AuthenticatedUser, "email" | "name">) {
  return user.name ?? user.email.split("@")[0];
}

function slugify(value: string) {
  return value
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

function isUniqueConstraintError(error: unknown) {
  return (
    typeof error === "object" &&
    error !== null &&
    "code" in error &&
    error.code === "P2002"
  );
}
