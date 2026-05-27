import type { Metadata } from "next";
import { GuildDashboard } from "@/components/guild/guild-dashboard";

export const metadata: Metadata = {
  title: "Nightmare Guild | Command Center",
  description: "Area de guilda com ferramentas mockadas para MVP tracker.",
};

export default function NightmareGuildPage() {
  return <GuildDashboard slug="nightmare" />;
}
