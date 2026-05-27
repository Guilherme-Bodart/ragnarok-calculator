import type { Metadata } from "next";
import { GuildDashboard } from "@/components/guild/guild-dashboard";

type GuildPageProps = {
  params: Promise<{
    slug: string;
  }>;
};

export const metadata: Metadata = {
  title: "Guild Command Center | Nightmare",
  description: "Area de guilda com ferramentas para Ragnarok Online.",
};

export default async function GuildPage({ params }: GuildPageProps) {
  const { slug } = await params;

  return <GuildDashboard slug={slug} />;
}
