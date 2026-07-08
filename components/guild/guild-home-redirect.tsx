"use client";

import { useEffect } from "react";
import { LayoutDashboard } from "lucide-react";
import { useRouter } from "next/navigation";
import { useQuery } from "@tanstack/react-query";
import { useNightmareLocale } from "@/components/site/use-nightmare-locale";
import type { CurrentGuildContext } from "./guild-types";

const apiBaseUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:4000/api";

export function GuildHomeRedirect() {
  const router = useRouter();
  const { dictionary } = useNightmareLocale();
  const t = dictionary.guild;

  const { data: context, error, isLoading } = useQuery<CurrentGuildContext, Error>({
    queryKey: ["guilds-me"],
    queryFn: async () => {
      const response = await fetch(`${apiBaseUrl}/guilds/me`, {
        credentials: "include",
      });

      if (response.status === 401) {
        throw new GuildHomeStatusError(response.status);
      }

      if (!response.ok) {
        throw new Error("Unable to load profile");
      }

      return (await response.json()) as CurrentGuildContext;
    },
    retry: false,
  });

  useEffect(() => {
    if (error instanceof GuildHomeStatusError && error.status === 401) {
      router.replace("/login?next=/guilds");
    } else if (context) {
      if (context.activeGuild) {
        router.replace(`/guilds/${context.activeGuild.slug}`);
      } else {
        router.replace("/profile");
      }
    }
  }, [context, error, router]);

  const message = isLoading ? t.loadingMessage : (error ? t.loadError : t.loadingMessage);

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

class GuildHomeStatusError extends Error {
  constructor(readonly status: number) {
    super("Guild home status error");
  }
}
