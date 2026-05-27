import type { LucideIcon } from "lucide-react";
import type { ReactNode } from "react";
import type { GuildDashboard, GuildMemberRole, MvpKillEntry } from "./guild-types";

export type GuildToolComponentProps = {
  dashboard: GuildDashboard;
  onCreateMvpEntry: (entry: MvpKillEntry) => void;
};

export type GuildToolStatus = "ready" | "planned";

export type GuildToolDefinition = {
  id: string;
  name: string;
  description: string;
  icon: LucideIcon;
  permissions: GuildMemberRole[];
  status: GuildToolStatus;
  category: "core" | "operations" | "management" | "insights";
  component: (props: GuildToolComponentProps) => ReactNode;
};
