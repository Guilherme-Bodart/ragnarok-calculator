import {
  Activity,
  BarChart3,
  Bell,
  BookOpen,
  CalendarClock,
  Coins,
  Crown,
  FileClock,
  Radio,
  ShieldAlert,
  Sparkles,
  Sword,
  Users,
} from "lucide-react";
import { GuildMvpTracker } from "./guild-mvp-tracker";
import type { GuildToolDefinition } from "./guild-tool-types";
import { GuildCalendarTool } from "./tools/guild-calendar-tool";
import { GuildFeedTool } from "./tools/guild-feed-tool";
import { GuildMembersTool } from "./tools/guild-members-tool";
import { GuildNotificationsTool } from "./tools/guild-notifications-tool";
import { GuildOverviewTool } from "./tools/guild-overview-tool";
import { GuildPlaceholderTool } from "./tools/guild-placeholder-tool";

export const guildTools: GuildToolDefinition[] = [
  {
    id: "dashboard",
    name: "Dashboard",
    description: "Guild overview",
    icon: Activity,
    status: "ready",
    category: "core",
    component: GuildOverviewTool,
  },
  {
    id: "guild-feed",
    name: "Guild Feed",
    description: "Announcements and activity",
    icon: Radio,
    status: "ready",
    category: "core",
    component: GuildFeedTool,
  },
  {
    id: "notifications",
    name: "Notificacoes",
    description: "Guild notification center",
    icon: Bell,
    status: "ready",
    category: "core",
    component: GuildNotificationsTool,
  },
  {
    id: "guild-calendar",
    name: "Agenda",
    description: "Events and operations",
    icon: CalendarClock,
    status: "ready",
    category: "operations",
    component: GuildCalendarTool,
  },
  {
    id: "mvp-tracker",
    name: "MVP Tracker",
    description: "Respawn timers",
    icon: Crown,
    status: "ready",
    category: "operations",
    component: ({ dashboard, onCreateMvpEntry }) => (
      <GuildMvpTracker
        entries={dashboard.mvpEntries}
        onCreateEntry={onCreateMvpEntry}
        slug={dashboard.guild.slug}
      />
    ),
  },
  {
    id: "woe-tracker",
    name: "WoE Tracker",
    description: "War operations",
    icon: Sword,
    status: "planned",
    category: "operations",
    component: GuildPlaceholderTool,
  },
  {
    id: "economy",
    name: "Economia",
    description: "Guild treasury",
    icon: Coins,
    status: "planned",
    category: "management",
    component: GuildPlaceholderTool,
  },
  {
    id: "drops",
    name: "Drops",
    description: "Loot and split tracking",
    icon: Sparkles,
    status: "planned",
    category: "management",
    component: GuildPlaceholderTool,
  },
  {
    id: "builds",
    name: "Builds",
    description: "Guild build library",
    icon: BookOpen,
    status: "planned",
    category: "management",
    component: GuildPlaceholderTool,
  },
  {
    id: "calculator-tools",
    name: "Calculadoras",
    description: "Calculation utilities",
    icon: ShieldAlert,
    status: "planned",
    category: "insights",
    component: GuildPlaceholderTool,
  },
  {
    id: "analytics",
    name: "Analytics",
    description: "Guild metrics",
    icon: BarChart3,
    status: "planned",
    category: "insights",
    component: GuildPlaceholderTool,
  },
  {
    id: "member-management",
    name: "Membros",
    description: "Roster and invites",
    icon: Users,
    status: "ready",
    category: "management",
    component: GuildMembersTool,
  },
  {
    id: "logs",
    name: "Logs",
    description: "Audit trail",
    icon: FileClock,
    status: "planned",
    category: "insights",
    component: GuildPlaceholderTool,
  },
];

export function getGuildTool(toolId: string | null) {
  return guildTools.find((tool) => tool.id === toolId) ?? guildTools[0];
}
