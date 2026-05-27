import { randomUUID } from "node:crypto";
import {
  BadRequestException,
  ConflictException,
  ForbiddenException,
  Injectable,
  NotFoundException,
} from "@nestjs/common";
import {
  MVP_RESPAWN_RANDOM_DELAY_MINUTES,
  getMvpCatalogEntry,
} from "../../../packages/guild-core/src";
import { Prisma } from "../generated/prisma/client";
import { PrismaService } from "../prisma/prisma.service";
import {
  type CreateGuildRequest,
  type CreateGuildRoleRequest,
  type CreateMvpKillRequest,
  type TransferGuildLeadershipRequest,
  type UpdateGuildMemberRoleRequest,
  type UpdateGuildRoleRequest,
  type UpdateGuildToolAccessRequest,
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
  GuildRole,
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
  include: { guild: true; role: true };
}>;

type ToolAccessLevel = "member" | "officer" | "leader";

const maxGuildRoles = 10;

const guildToolDefinitions: Array<{
  id: string;
  name: string;
  status: GuildTool["status"];
  defaultAccess: ToolAccessLevel;
}> = [
  { id: "dashboard", name: "Dashboard", status: "ready", defaultAccess: "member" },
  { id: "guild-feed", name: "Guild Feed", status: "ready", defaultAccess: "member" },
  { id: "notifications", name: "Notificacoes", status: "ready", defaultAccess: "member" },
  { id: "guild-calendar", name: "Agenda", status: "ready", defaultAccess: "officer" },
  { id: "mvp-tracker", name: "MVP Tracker", status: "ready", defaultAccess: "member" },
  { id: "member-management", name: "Membros", status: "ready", defaultAccess: "officer" },
  { id: "woe-tracker", name: "WoE Tracker", status: "planned", defaultAccess: "officer" },
  { id: "economy", name: "Economia", status: "planned", defaultAccess: "officer" },
  { id: "drops", name: "Drops", status: "planned", defaultAccess: "member" },
  { id: "builds", name: "Builds", status: "planned", defaultAccess: "member" },
  { id: "calculator-tools", name: "Calculadoras", status: "planned", defaultAccess: "member" },
  { id: "analytics", name: "Analytics", status: "planned", defaultAccess: "leader" },
  { id: "logs", name: "Logs", status: "planned", defaultAccess: "leader" },
];

@Injectable()
export class GuildsService {
  constructor(private readonly prisma: PrismaService) {}

  async getCurrentContext(user: AuthenticatedUser) {
    const memberships = await this.prisma.guildMember.findMany({
      where: { userId: user.id },
      include: {
        role: true,
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

    const existingMembership = await this.prisma.guildMember.findUnique({
      where: { userId: user.id },
      select: { id: true },
    });

    if (existingMembership) {
      throw new ConflictException("User already belongs to a guild");
    }

    const leaderRoleId = randomUUID();
    const officerRoleId = randomUUID();
    const memberRoleId = randomUUID();

    try {
      const membership = await this.prisma.$transaction(async (tx) => {
        const guild = await tx.guild.create({
          data: {
            slug,
            name: payload.name,
            ownerUserId: user.id,
            description:
              payload.description ??
              "Workspace da guilda para timers, eventos, membros e operacoes.",
            server: payload.server ?? "Ragnarok Online",
            roles: {
              create: [
                {
                  id: leaderRoleId,
                  name: "Lider",
                  color: "#f4c95d",
                  rank: 1,
                },
                {
                  id: officerRoleId,
                  name: "Oficial",
                  color: "#67e8f9",
                  rank: 2,
                },
                {
                  id: memberRoleId,
                  name: "Membro",
                  color: "#a7b0c0",
                  rank: 3,
                },
              ],
            },
            notifications: {
              create: {
                title: "Guilda criada",
                body: "Seu workspace esta pronto para receber ferramentas.",
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
        });

        await tx.guildMember.create({
          data: {
            guildId: guild.id,
            userId: user.id,
            displayName: getDisplayName(user),
            roleId: leaderRoleId,
            status: "online",
          },
        });

        return tx.guildMember.findUniqueOrThrow({
          where: { userId: user.id },
          include: {
            role: true,
            guild: {
              include: {
                _count: { select: { members: true } },
              },
            },
          },
        });
      });

      return {
        guild: await this.toGuildSummary(membership),
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
    const [roles, members, invites, notifications, feed, events, canUseMvpTracker] =
      await Promise.all([
        this.getRoles(membership.guildId),
        this.getMembers(membership.guildId, membership.guild.ownerUserId),
        this.getInvites(membership.guildId),
        this.getNotifications(membership.guildId),
        this.getFeed(membership.guildId),
        this.getEvents(membership.guildId),
        this.canUseTool(membership, "mvp-tracker"),
      ]);
    const mvpEntries = canUseMvpTracker
      ? await this.getMvpEntryList(membership.guildId)
      : [];

    return {
      guild: await this.toGuildSummary(membership),
      roles,
      members,
      invites,
      tools: await this.getTools(membership.guildId, roles),
      notifications,
      feed,
      events,
      mvpEntries,
    };
  }

  async deleteGuild(user: AuthenticatedUser, slug: string) {
    const membership = await this.assertOwner(user.id, slug);

    await this.prisma.guild.delete({
      where: { id: membership.guildId },
    });

    return { deleted: true };
  }

  async createRole(
    user: AuthenticatedUser,
    slug: string,
    payload: CreateGuildRoleRequest,
  ) {
    const membership = await this.assertGuildManager(user.id, slug);
    const roles = await this.getRoles(membership.guildId);

    if (roles.length >= maxGuildRoles) {
      throw new ConflictException("Guild roles limit reached");
    }

    const rank = clampRank(payload.rank ?? roles.length + 1, roles.length + 1);

    const role = await this.prisma.$transaction(async (tx) => {
      await this.moveRanksToTemporaryRange(tx, membership.guildId);

      const created = await tx.guildRole.create({
        data: {
          guildId: membership.guildId,
          name: payload.name,
          color: payload.color,
          rank: 99,
        },
      });

      const ordered = [...roles.map((item) => item.id)];
      ordered.splice(rank - 1, 0, created.id);
      await this.applyRoleOrder(tx, membership.guildId, ordered);

      return tx.guildRole.findUniqueOrThrow({ where: { id: created.id } });
    });

    return { role: this.toRole(role) };
  }

  async updateRole(
    user: AuthenticatedUser,
    slug: string,
    roleId: string,
    payload: UpdateGuildRoleRequest,
  ) {
    const membership = await this.assertGuildManager(user.id, slug);
    const roles = await this.getRoles(membership.guildId);
    const role = roles.find((item) => item.id === roleId);

    if (!role) {
      throw new NotFoundException("Role not found");
    }

    const updated = await this.prisma.$transaction(async (tx) => {
      await tx.guildRole.update({
        where: { id: roleId },
        data: {
          name: payload.name,
          color: payload.color,
        },
      });

      if (payload.rank) {
        const ordered = roles.map((item) => item.id).filter((id) => id !== roleId);
        ordered.splice(clampRank(payload.rank, roles.length) - 1, 0, roleId);
        await this.moveRanksToTemporaryRange(tx, membership.guildId);
        await this.applyRoleOrder(tx, membership.guildId, ordered);
      }

      return tx.guildRole.findUniqueOrThrow({ where: { id: roleId } });
    });

    return { role: this.toRole(updated) };
  }

  async updateMemberRole(
    user: AuthenticatedUser,
    slug: string,
    memberId: string,
    payload: UpdateGuildMemberRoleRequest,
  ) {
    const membership = await this.assertGuildManager(user.id, slug);
    const role = await this.assertRole(membership.guildId, payload.roleId);

    const member = await this.prisma.guildMember.findFirst({
      where: { id: memberId, guildId: membership.guildId },
    });

    if (!member) {
      throw new NotFoundException("Member not found");
    }

    await this.prisma.guildMember.update({
      where: { id: member.id },
      data: { roleId: role.id },
    });

    return { updated: true };
  }

  async updateToolAccess(
    user: AuthenticatedUser,
    slug: string,
    toolId: string,
    payload: UpdateGuildToolAccessRequest,
  ) {
    const membership = await this.assertGuildManager(user.id, slug);
    const tool = guildToolDefinitions.find((item) => item.id === toolId);

    if (!tool) {
      throw new NotFoundException("Tool not found");
    }

    const role = await this.assertRole(membership.guildId, payload.minimumRoleId);

    await this.prisma.guildToolAccess.upsert({
      where: {
        guildId_toolId: {
          guildId: membership.guildId,
          toolId,
        },
      },
      create: {
        guildId: membership.guildId,
        toolId,
        minimumRoleId: role.id,
      },
      update: {
        minimumRoleId: role.id,
      },
    });

    return { updated: true };
  }

  async transferLeadership(
    user: AuthenticatedUser,
    slug: string,
    payload: TransferGuildLeadershipRequest,
  ) {
    const membership = await this.assertOwner(user.id, slug);
    const target = await this.prisma.guildMember.findFirst({
      where: {
        id: payload.memberId,
        guildId: membership.guildId,
      },
    });

    if (!target) {
      throw new NotFoundException("Member not found");
    }

    await this.prisma.guild.update({
      where: { id: membership.guildId },
      data: { ownerUserId: target.userId },
    });

    return { transferred: true };
  }

  async getMvpEntries(user: AuthenticatedUser, slug: string) {
    const membership = await this.assertMembership(user.id, slug);

    if (!(await this.canUseTool(membership, "mvp-tracker"))) {
      throw new ForbiddenException("User cannot access this tool");
    }

    return { entries: await this.getMvpEntryList(membership.guildId) };
  }

  async createMvpKill(
    user: AuthenticatedUser,
    slug: string,
    payload: CreateMvpKillRequest,
  ) {
    const membership = await this.assertMembership(user.id, slug);

    if (!(await this.canUseTool(membership, "mvp-tracker"))) {
      throw new ForbiddenException("User cannot access this tool");
    }

    const catalogEntry = payload.catalogEntryId
      ? getMvpCatalogEntry(payload.catalogEntryId)
      : null;

    if (payload.catalogEntryId && !catalogEntry) {
      throw new BadRequestException("Unknown MVP catalog entry");
    }

    const mvpName = catalogEntry?.name ?? payload.mvpName;
    const map = catalogEntry?.mapId ?? payload.map;
    const respawnMinutes = catalogEntry?.respawnMinutes ?? payload.respawnMinutes;

    if (!mvpName || !map || !respawnMinutes) {
      throw new BadRequestException("MVP data is incomplete");
    }

    const killedAt = new Date(payload.killedAt);
    const respawnAt = new Date(
      killedAt.getTime() + respawnMinutes * 60 * 1000,
    );

    const entry = await this.prisma.mvpKill.create({
      data: {
        guildId: membership.guildId,
        mvpName,
        map,
        killedAt,
        respawnMinutes,
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
        body: `${mvpName} foi adicionada ao MVP Tracker.`,
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
      include: { guild: true, role: true },
    });

    if (!membership) {
      throw new ForbiddenException("User does not belong to this guild");
    }

    return membership;
  }

  private async assertOwner(userId: string, slug: string) {
    const membership = await this.assertMembership(userId, slug);

    if (membership.guild.ownerUserId !== userId) {
      throw new ForbiddenException("Only the guild leader can do this");
    }

    return membership;
  }

  private async assertGuildManager(userId: string, slug: string) {
    const membership = await this.assertMembership(userId, slug);

    if (membership.guild.ownerUserId !== userId && membership.role.rank !== 1) {
      throw new ForbiddenException("User cannot manage guild settings");
    }

    return membership;
  }

  private async assertRole(guildId: string, roleId: string) {
    const role = await this.prisma.guildRole.findFirst({
      where: { id: roleId, guildId },
    });

    if (!role) {
      throw new NotFoundException("Role not found");
    }

    return role;
  }

  private async canUseTool(membership: GuildMembership, toolId: string) {
    const roles = await this.getRoles(membership.guildId);
    const tool = await this.getTool(membership.guildId, roles, toolId);

    if (!tool) {
      return false;
    }

    return !tool.minimumRole || membership.role.rank <= tool.minimumRole.rank;
  }

  private async getTool(guildId: string, roles: GuildRole[], toolId: string) {
    const tool = guildToolDefinitions.find((definition) => definition.id === toolId);

    if (!tool) {
      return null;
    }

    const access = await this.prisma.guildToolAccess.findUnique({
      where: {
        guildId_toolId: {
          guildId,
          toolId,
        },
      },
      include: { minimumRole: true },
    });

    return {
      id: tool.id,
      name: tool.name,
      status: tool.status,
      minimumRole: access
        ? this.toRole(access.minimumRole)
        : this.getDefaultAccessRole(roles, tool.defaultAccess),
    } satisfies GuildTool;
  }

  private async getTools(guildId: string, roles: GuildRole[]): Promise<GuildTool[]> {
    const accessList = await this.prisma.guildToolAccess.findMany({
      where: { guildId },
      include: { minimumRole: true },
    });

    return guildToolDefinitions.map((tool) => {
      const access = accessList.find((item) => item.toolId === tool.id);

      return {
        id: tool.id,
        name: tool.name,
        status: tool.status,
        minimumRole: access
          ? this.toRole(access.minimumRole)
          : this.getDefaultAccessRole(roles, tool.defaultAccess),
      };
    });
  }

  private getDefaultAccessRole(roles: GuildRole[], level: ToolAccessLevel) {
    if (roles.length === 0) {
      return null;
    }

    const sorted = [...roles].sort((a, b) => a.rank - b.rank);

    if (level === "leader") {
      return sorted[0];
    }

    if (level === "officer") {
      return sorted[Math.min(1, sorted.length - 1)];
    }

    return sorted[sorted.length - 1];
  }

  private async toGuildSummary(
    membership: GuildMembership & { guild: { _count?: { members: number } } },
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
      userRole: this.toRole(membership.role),
      isOwner: membership.guild.ownerUserId === membership.userId,
    };
  }

  private async getRoles(guildId: string): Promise<GuildRole[]> {
    const roles = await this.prisma.guildRole.findMany({
      where: { guildId },
      orderBy: { rank: "asc" },
    });

    return roles.map((role) => this.toRole(role));
  }

  private async getMembers(
    guildId: string,
    ownerUserId: string,
  ): Promise<GuildMember[]> {
    const members = await this.prisma.guildMember.findMany({
      where: { guildId },
      include: { role: true },
      orderBy: [{ role: { rank: "asc" } }, { createdAt: "asc" }],
    });

    return members.map((member) => ({
      id: member.id,
      userId: member.userId,
      displayName: member.displayName,
      role: this.toRole(member.role),
      mainClass: member.mainClass,
      status: member.status,
      isOwner: member.userId === ownerUserId,
    }));
  }

  private async getInvites(guildId: string): Promise<GuildInvite[]> {
    const invites = await this.prisma.guildInvite.findMany({
      where: { guildId },
      include: { role: true },
      orderBy: { createdAt: "desc" },
    });

    return invites.map((invite) => ({
      id: invite.id,
      email: invite.email,
      role: this.toRole(invite.role),
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
      include: { requiredRole: true },
      orderBy: { startsAt: "asc" },
      take: 20,
    });

    return events.map((event) => ({
      id: event.id,
      title: event.title,
      startsAt: event.startsAt.toISOString(),
      type: event.type,
      requiredRole: this.toRole(event.requiredRole),
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

  private toRole(role: { id: string; name: string; color: string; rank: number }) {
    return {
      id: role.id,
      name: role.name,
      color: role.color,
      rank: role.rank,
    } satisfies GuildRole;
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
      respawnWindowEndAt: new Date(
        entry.respawnAt.getTime() + MVP_RESPAWN_RANDOM_DELAY_MINUTES * 60 * 1000,
      ).toISOString(),
      status: getMvpSpawnStatus(entry.respawnAt),
      notes: entry.notes ?? undefined,
      recordedBy: entry.recordedBy.name ?? entry.recordedBy.email,
      createdAt: entry.createdAt.toISOString(),
    };
  }

  private async moveRanksToTemporaryRange(
    tx: Prisma.TransactionClient,
    guildId: string,
  ) {
    await tx.$executeRaw`
      UPDATE "GuildRole"
      SET "rank" = "rank" + 100
      WHERE "guildId" = ${guildId}
    `;
  }

  private async applyRoleOrder(
    tx: Prisma.TransactionClient,
    guildId: string,
    orderedRoleIds: string[],
  ) {
    for (const [index, roleId] of orderedRoleIds.entries()) {
      await tx.guildRole.updateMany({
        where: { id: roleId, guildId },
        data: { rank: index + 1 },
      });
    }
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

function clampRank(rank: number, max: number) {
  return Math.min(Math.max(rank, 1), max);
}
