"use client";

import { useEffect, useState } from "react";
import { LayoutDashboard } from "lucide-react";
import { useRouter } from "next/navigation";
import { fallbackDashboard } from "./guild-mock-data";
import type { CurrentGuildContext } from "./guild-types";

const apiBaseUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:4000/api";

export function GuildHomeRedirect() {
  const router = useRouter();
  const [message, setMessage] = useState("Procurando sua guilda...");

  useEffect(() => {
    let isMounted = true;

    async function resolveGuild() {
      try {
        const response = await fetch(`${apiBaseUrl}/guilds/me`);

        if (!response.ok) {
          router.replace("/");
          return;
        }

        const context = (await response.json()) as CurrentGuildContext;
        router.replace(`/guilds/${context.activeGuild.slug}`);
      } catch {
        if (isMounted) {
          setMessage("API offline: abrindo guilda mockada de preview.");
        }
        router.replace(`/guilds/${fallbackDashboard.guild.slug}`);
      }
    }

    void resolveGuild();

    return () => {
      isMounted = false;
    };
  }, [router]);

  return (
    <main className="guild-page">
      <div className="guild-grid-bg" />
      <section className="guild-loading-panel" aria-live="polite">
        <LayoutDashboard size={22} />
        <strong>Guild Command</strong>
        <span>{message}</span>
      </section>
    </main>
  );
}
