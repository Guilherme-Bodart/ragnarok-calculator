"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import {
  Crown,
  Inbox,
  LayoutDashboard,
  Loader2,
  Mail,
  Plus,
  ShieldCheck,
  UserRound,
} from "lucide-react";
import { useRouter } from "next/navigation";
import { useNightmareLocale } from "@/components/site/use-nightmare-locale";
import { GuildCreatePanel } from "./guild-create-panel";
import { formatGuildRole } from "./guild-role-access";
import type { CurrentGuildContext } from "./guild-types";

const apiBaseUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:4000/api";

export function GuildProfilePage() {
  const router = useRouter();
  const { dictionary } = useNightmareLocale();
  const t = dictionary.guild.profile;
  const [context, setContext] = useState<CurrentGuildContext | null>(null);
  const [message, setMessage] = useState(t.loading);
  const [isLoading, setIsLoading] = useState(true);
  const [isCreateOpen, setIsCreateOpen] = useState(false);

  useEffect(() => {
    let isMounted = true;

    async function loadProfile() {
      try {
        const response = await fetch(`${apiBaseUrl}/guilds/me`, {
          credentials: "include",
        });

        if (response.status === 401) {
          router.replace("/login?next=/profile");
          return;
        }

        if (!response.ok) {
          throw new Error("Unable to load profile");
        }

        const payload = (await response.json()) as CurrentGuildContext;

        if (isMounted) {
          setContext(payload);
        }
      } catch {
        if (isMounted) {
          setMessage(t.loadError);
        }
      } finally {
        if (isMounted) {
          setIsLoading(false);
        }
      }
    }

    void loadProfile();

    return () => {
      isMounted = false;
    };
  }, [router, t.loadError]);

  if (isLoading || !context) {
    return (
      <main className="guild-page">
        <div className="guild-grid-bg" />
        <section className="guild-loading-panel" aria-live="polite">
          {isLoading ? <Loader2 className="spin" size={22} /> : <UserRound size={22} />}
          <strong>{t.loadingTitle}</strong>
          <span>{message}</span>
        </section>
      </main>
    );
  }

  const guild = context.activeGuild ?? context.guilds[0] ?? null;

  return (
    <main className="guild-page">
      <div className="guild-grid-bg" />
      <section className="guild-profile-shell">
        <header className="guild-profile-header">
          <span className="guild-tool-eyebrow">
            <UserRound size={16} />
            {t.kicker}
          </span>
          <div>
            <h1>{context.user.displayName}</h1>
            <p>{t.description}</p>
          </div>
        </header>

        <section className="guild-profile-grid">
          <article className="guild-profile-card">
            <div className="guild-panel-header">
              <span>
                <ShieldCheck size={17} />
                {t.accountTitle}
              </span>
            </div>
            <div className="guild-profile-detail">
              <UserRound size={17} />
              <span>{context.user.displayName}</span>
            </div>
            <div className="guild-profile-detail">
              <Mail size={17} />
              <span>{context.user.email}</span>
            </div>
          </article>

          <article className="guild-profile-card">
            <div className="guild-panel-header">
              <span>
                <Crown size={17} />
                {t.guildTitle}
              </span>
              <small>{guild ? "1" : "0"}</small>
            </div>

            {guild ? (
              <div className="guild-profile-guild-list">
                <Link className="guild-profile-guild-row" href={`/guilds/${guild.slug}`}>
                  <span>
                    <strong>{guild.name}</strong>
                    <small>
                      {guild.server} - {formatGuildRole(guild.userRole)}
                    </small>
                  </span>
                  <LayoutDashboard size={16} />
                </Link>
              </div>
            ) : (
              <div className="guild-profile-empty-stack">
                <p className="guild-profile-empty">{t.emptyGuild}</p>
                <button
                  className="guild-secondary-button"
                  onClick={() => setIsCreateOpen((current) => !current)}
                  type="button"
                >
                  <Plus size={16} />
                  {isCreateOpen ? t.hideCreateAction : t.showCreateAction}
                </button>
              </div>
            )}
          </article>
        </section>

        <article className="guild-profile-card">
          <div className="guild-panel-header">
            <span>
              <Inbox size={17} />
              {t.invitesTitle}
            </span>
          </div>
          <p className="guild-profile-empty">{t.emptyInvites}</p>
        </article>

        {!guild && isCreateOpen && <GuildCreatePanel compact />}
      </section>
    </main>
  );
}
