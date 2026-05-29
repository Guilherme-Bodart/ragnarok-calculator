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
import { Button } from "@/components/ui/button";
import { Panel } from "@/components/ui/panel";
import { PanelHeader } from "@/components/ui/panel-header";
import { SectionHeading } from "@/components/ui/section-heading";
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
        <Panel as="header" className="guild-profile-header">
          <SectionHeading
            align="left"
            eyebrow={t.kicker}
            title={context.user.displayName}
            description={t.description}
          />
        </Panel>

        <section className="guild-profile-grid">
          <Panel as="article" className="guild-profile-card">
            <PanelHeader icon={<ShieldCheck size={17} />} title={t.accountTitle} />
            <div className="guild-profile-detail">
              <UserRound size={17} />
              <span>{context.user.displayName}</span>
            </div>
            <div className="guild-profile-detail">
              <Mail size={17} />
              <span>{context.user.email}</span>
            </div>
          </Panel>

          <Panel as="article" className="guild-profile-card">
            <PanelHeader
              icon={<Crown size={17} />}
              title={t.guildTitle}
              meta={guild ? "1" : "0"}
            />

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
                <Button
                  icon={<Plus size={16} />}
                  onClick={() => setIsCreateOpen((current) => !current)}
                  type="button"
                  variant="secondary"
                >
                  {isCreateOpen ? t.hideCreateAction : t.showCreateAction}
                </Button>
              </div>
            )}
          </Panel>
        </section>

        <Panel as="article" className="guild-profile-card">
          <PanelHeader icon={<Inbox size={17} />} title={t.invitesTitle} />
          <p className="guild-profile-empty">{t.emptyInvites}</p>
        </Panel>

        {!guild && isCreateOpen && <GuildCreatePanel compact />}
      </section>
    </main>
  );
}
