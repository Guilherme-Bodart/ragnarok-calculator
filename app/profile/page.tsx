import type { Metadata } from "next";
import { GuildProfilePage } from "@/components/guild/guild-profile-page";

export const metadata: Metadata = {
  title: "Perfil | Nightmare",
  description: "Perfil do usuário e guildas no Nightmare Guild Workspace.",
};

export default function ProfilePage() {
  return <GuildProfilePage />;
}
