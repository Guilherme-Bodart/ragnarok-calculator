import type { GuildRoleLike, LegacyGuildRole } from "./guild-types";

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
  minimumRole: GuildRoleLike,
) {
  if (!userRole || !minimumRole) {
    return true;
  }

  const userRank = getRoleRank(userRole);
  const minimumRank = getRoleRank(minimumRole);

  return userRank <= minimumRank;
}

export function formatGuildRole(role: GuildRoleLike) {
  if (!role) {
    return "Member";
  }

  if (typeof role === "string") {
    return legacyRoleLabel[role] ?? role;
  }

  return role.name ?? "Member";
}

export function getRoleRank(role: GuildRoleLike) {
  if (!role) {
    return 99;
  }

  if (typeof role === "string") {
    return legacyRoleRank[role] ?? 1;
  }

  return Number.isFinite(role.rank) ? role.rank : 1;
}
