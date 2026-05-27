import type { GuildMemberRole } from "./guild-types";

const roleRank: Record<GuildMemberRole, number> = {
  member: 1,
  officer: 2,
  leader: 3,
  admin: 4,
};

export function canUseGuildTool(
  userRole: GuildMemberRole,
  permissions: GuildMemberRole[],
) {
  return permissions.some((permission) => roleRank[userRole] >= roleRank[permission]);
}

export function formatGuildRole(role: GuildMemberRole) {
  return {
    member: "Member",
    officer: "Officer",
    leader: "Leader",
    admin: "Admin",
  }[role];
}
