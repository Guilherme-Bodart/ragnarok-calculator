"use client";

import { useEffect, useState } from "react";
import { LayoutDashboard } from "lucide-react";
import { useRouter } from "next/navigation";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useNightmareLocale } from "@/components/site/use-nightmare-locale";
import { GuildAppShell } from "./guild-app-shell";
import type { GuildDashboard as GuildDashboardData, MvpKillEntry } from "./guild-types";

const apiBaseUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:4000/api";

export function GuildDashboard({ slug }: { slug: string }) {
  const router = useRouter();
  const queryClient = useQueryClient();
  const { dictionary } = useNightmareLocale();
  const t = dictionary.guild;

  const { data: dashboard, isLoading, error, refetch } = useQuery<GuildDashboardData, Error>({
    queryKey: ["guild-dashboard", slug],
    queryFn: async () => {
      const response = await fetch(`${apiBaseUrl}/guilds/${slug}/dashboard`, {
        credentials: "include",
      });

      if (response.status === 401 || response.status === 403 || response.status === 404) {
        throw new GuildDashboardStatusError(response.status);
      }

      if (!response.ok) {
        throw new Error("Unable to load guild dashboard");
      }

      return (await response.json()) as GuildDashboardData;
    },
    retry: false,
  });

  useEffect(() => {
    if (error instanceof GuildDashboardStatusError) {
      router.replace(error.status === 401 ? `/login?next=/guilds/${slug}` : "/guilds");
    }
  }, [error, router, slug]);

  const notice = isLoading ? t.loadingDashboardMessage : (error ? t.loadError : t.connected);

  async function refreshDashboard() {
    await refetch();
  }

  function handleCreateMvpEntry(entry: MvpKillEntry) {
    queryClient.setQueryData<GuildDashboardData>(["guild-dashboard", slug], (current) => {
      if (!current) return current;
      return {
        ...current,
        mvpEntries: [entry, ...current.mvpEntries],
      };
    });
  }

  if (isLoading || !dashboard || (error && error instanceof GuildDashboardStatusError)) {
    return (
      <main className="guild-page">
        <div className="guild-grid-bg" />
        <section className="guild-loading-panel" aria-live="polite">
          <LayoutDashboard size={22} />
          <strong>{t.loadingDashboardTitle}</strong>
          <span>{notice}</span>
        </section>
      </main>
    );
  }

  return (
    <GuildAppShell
      dashboard={dashboard}
      notice={isLoading ? t.syncing : notice}
      onCreateMvpEntry={handleCreateMvpEntry}
      onRefreshDashboard={refreshDashboard}
    />
  );
}

class GuildDashboardStatusError extends Error {
  constructor(readonly status: number) {
    super("Guild dashboard status error");
  }
}
