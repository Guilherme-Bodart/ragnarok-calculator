import type { Metadata } from "next";
import { GuildHomeRedirect } from "@/components/guild/guild-home-redirect";

export const metadata: Metadata = {
  title: "Minhas Guildas | Nightmare",
  description: "Entrada da area de guilda com redirecionamento por usuario.",
};

export default function GuildsPage() {
  return <GuildHomeRedirect />;
}
