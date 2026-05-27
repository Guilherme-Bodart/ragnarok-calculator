import type { GuildRole, GuildRoleLike, LegacyGuildRole } from "./guild-types";

const legacyRoleRank: Record<LegacyGuildRole, number> = {
  admin: 1,
  leader: 1,
  officer: 2,
  member: 3,
};

const legacyRoleLabel: Record<LegacyGuildRole, string> = {
  admin: "Admin",
  leader: "Leader",
  officer: "Officer",
  member: "Member",
};

export function canUseGuildTool(
  userRole: GuildRoleLike,
  minimumRole: GuildRole | null,
) {
  const userRank = getRoleRank(userRole);

  return !minimumRole || userRank <= minimumRole.rank;
}

export function formatGuildRole(role: GuildRoleLike) {
  if (typeof role === "string") {
    return legacyRoleLabel[role] ?? role;
  }

  return role.name;
}

export function getRoleRank(role: GuildRoleLike) {
  if (typeof role === "string") {
    return legacyRoleRank[role] ?? 1;
  }

  return Number.isFinite(role.rank) ? role.rank : 1;
}
