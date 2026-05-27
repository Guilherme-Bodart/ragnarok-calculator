import type { GuildRole } from "./guild-types";

export function canUseGuildTool(
  userRole: GuildRole,
  minimumRole: GuildRole | null,
) {
  return !minimumRole || userRole.rank <= minimumRole.rank;
}

export function formatGuildRole(role: GuildRole) {
  return role.name;
}
