"use client";

import { useCallback, useEffect, useState } from "react";
import { LayoutDashboard } from "lucide-react";
import { useRouter } from "next/navigation";
import { useNightmareLocale } from "@/components/site/use-nightmare-locale";
import { GuildAppShell } from "./guild-app-shell";
import type { GuildDashboard as GuildDashboardData, MvpKillEntry } from "./guild-types";

const apiBaseUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:4000/api";

export function GuildDashboard({ slug }: { slug: string }) {
  const router = useRouter();
  const { dictionary } = useNightmareLocale();
  const t = dictionary.guild;
  const [dashboard, setDashboard] = useState<GuildDashboardData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [notice, setNotice] = useState(t.loadingDashboardMessage);

  const loadDashboard = useCallback(async () => {
    const payload = await fetchDashboard(slug);
    setDashboard(payload);
    setNotice(t.connected);
  }, [slug, t.connected]);

  useEffect(() => {
    let isMounted = true;

    async function loadInitialDashboard() {
    try {
        const payload = await fetchDashboard(slug);

        if (isMounted) {
          setDashboard(payload);
          setNotice(t.connected);
        }
      } catch (error) {
        if (error instanceof GuildDashboardStatusError) {
          router.replace(error.status === 401 ? `/login?next=/guilds/${slug}` : "/guilds");
          return;
        }

        if (isMounted) {
          setNotice(t.loadError);
        }
      } finally {
        if (isMounted) {
          setIsLoading(false);
        }
      }
    }

    void loadInitialDashboard();

    return () => {
      isMounted = false;
    };
  }, [router, slug, t.connected, t.loadError]);

  async function refreshDashboard() {
    try {
      await loadDashboard();
    } catch {
      setNotice(t.loadError);
    }
  }

  function handleCreateMvpEntry(entry: MvpKillEntry) {
    setDashboard((current) =>
      current
        ? {
            ...current,
            mvpEntries: [entry, ...current.mvpEntries],
          }
        : current,
    );
  }

  if (!dashboard) {
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

async function fetchDashboard(slug: string) {
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
}

class GuildDashboardStatusError extends Error {
  constructor(readonly status: number) {
    super("Guild dashboard status error");
  }
}
