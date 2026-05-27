"use client";

import { useEffect, useState } from "react";
import { LayoutDashboard } from "lucide-react";
import { useRouter } from "next/navigation";
import { GuildAppShell } from "./guild-app-shell";
import { fallbackDashboard } from "./guild-mock-data";
import type { GuildDashboard as GuildDashboardData, MvpKillEntry } from "./guild-types";

const apiBaseUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:4000/api";

export function GuildDashboard({ slug }: { slug: string }) {
  const router = useRouter();
  const [dashboard, setDashboard] = useState<GuildDashboardData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [notice, setNotice] = useState("Carregando guilda mockada...");

  useEffect(() => {
    let isMounted = true;

    async function loadDashboard() {
      try {
        const response = await fetch(`${apiBaseUrl}/guilds/${slug}/dashboard`);

        if (response.status === 403 || response.status === 404) {
          router.replace("/");
          return;
        }

        if (!response.ok) {
          throw new Error("Unable to load guild dashboard");
        }

        const payload = (await response.json()) as GuildDashboardData;

        if (isMounted) {
          setDashboard(payload);
          setNotice("Mock API conectada.");
        }
      } catch {
        if (isMounted) {
          if (slug === fallbackDashboard.guild.slug) {
            setDashboard(fallbackDashboard);
            setNotice("API offline: usando dados locais de preview.");
          } else {
            router.replace("/");
          }
        }
      } finally {
        if (isMounted) {
          setIsLoading(false);
        }
      }
    }

    void loadDashboard();

    return () => {
      isMounted = false;
    };
  }, [router, slug]);

  function handleCreateMvpEntry(entry: MvpKillEntry) {
    setDashboard((current) => {
      const baseDashboard = current ?? fallbackDashboard;

      return {
        ...baseDashboard,
        mvpEntries: [entry, ...baseDashboard.mvpEntries],
      };
    });
  }

  if (!dashboard) {
    return (
      <main className="guild-page">
        <div className="guild-grid-bg" />
        <section className="guild-loading-panel" aria-live="polite">
          <LayoutDashboard size={22} />
          <strong>Carregando guilda</strong>
          <span>Validando acesso do usuario mockado...</span>
        </section>
      </main>
    );
  }

  return (
    <GuildAppShell
      dashboard={dashboard}
      notice={isLoading ? "Syncing" : notice}
      onCreateMvpEntry={handleCreateMvpEntry}
    />
  );
}
