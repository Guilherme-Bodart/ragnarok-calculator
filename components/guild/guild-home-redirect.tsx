"use client";

import { useState, useEffect } from "react";
import { LayoutDashboard } from "lucide-react";
import { useRouter } from "next/navigation";
import { useNightmareLocale } from "@/components/site/use-nightmare-locale";
import type { CurrentGuildContext } from "./guild-types";

const apiBaseUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:4000/api";

export function GuildHomeRedirect() {
  const router = useRouter();
  const { dictionary } = useNightmareLocale();
  const t = dictionary.guild;
  const [message, setMessage] = useState(t.loadingMessage);

  useEffect(() => {
    let isMounted = true;

    async function resolveGuild() {
      try {
        const response = await fetch(`${apiBaseUrl}/guilds/me`, {
          credentials: "include",
        });

        if (response.status === 401) {
          router.replace("/login?next=/guilds");
          return;
        }

        if (!response.ok) {
          setMessage(t.loadError);
          return;
        }

        const context = (await response.json()) as CurrentGuildContext;

        if (context.activeGuild) {
          router.replace(`/guilds/${context.activeGuild.slug}`);
          return;
        }

        if (isMounted) {
          router.replace("/profile");
        }
      } catch {
        if (isMounted) {
          setMessage(t.loadError);
        }
      }
    }

    void resolveGuild();

    return () => {
      isMounted = false;
    };
  }, [router, t.loadError]);

  return (
    <main className="guild-page">
      <div className="guild-grid-bg" />
      <section className="guild-loading-panel" aria-live="polite">
        <LayoutDashboard size={22} />
        <strong>{t.loadingTitle}</strong>
        <span>{message}</span>
      </section>
    </main>
  );
}
