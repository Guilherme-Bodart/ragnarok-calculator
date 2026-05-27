"use client";

import type { ReactNode } from "react";
import { useEffect, useMemo, useState } from "react";
import {
  Bell,
  Crown,
  LayoutDashboard,
  LogOut,
  MailPlus,
  Shield,
  Swords,
  Users,
} from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { fallbackDashboard } from "./guild-mock-data";
import { GuildMvpTracker } from "./guild-mvp-tracker";
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

  const roleLabel = useMemo(
    () =>
      ({
        owner: "Guild Master",
        officer: "Officer",
        member: "Member",
      })[dashboard?.guild.userRole ?? "member"],
    [dashboard?.guild.userRole],
  );

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
    <main className="guild-page">
      <div className="guild-grid-bg" />
      <header className="guild-topbar">
        <Link href="/" className="calculator-brand" aria-label="Back to Nightmare home">
          <Image src="/nightmare-reaper.png" alt="" width={38} height={38} />
          <span>
            <strong>{dashboard.guild.name}</strong>
            <small>Guild Command</small>
          </span>
        </Link>

        <nav className="guild-actions" aria-label="Guild actions">
          <Link href="/calculator">
            <Swords size={16} />
            Calculator
          </Link>
          <button type="button">
            <Bell size={16} />
            Alerts
          </button>
          <button type="button">
            <LogOut size={16} />
            Exit
          </button>
        </nav>
      </header>

      <section className="guild-hero-panel">
        <div>
          <span className="calculator-kicker">
            <LayoutDashboard size={16} />
            Guild SaaS prototype
          </span>
          <h1>{dashboard.guild.name} Command Center</h1>
          <p>{dashboard.guild.description}</p>
        </div>
        <aside className="guild-role-panel">
          <Crown size={28} />
          <strong>{roleLabel}</strong>
          <span>{dashboard.guild.server}</span>
          <small>{notice}</small>
        </aside>
      </section>

      <section className="guild-summary-grid" aria-label="Guild summary">
        <SummaryTile icon={<Users size={18} />} label="Membros" value={dashboard.guild.memberCount} />
        <SummaryTile icon={<Shield size={18} />} label="Online agora" value={dashboard.guild.onlineCount} />
        <SummaryTile icon={<MailPlus size={18} />} label="Convites" value={dashboard.invites.length} />
        <SummaryTile
          icon={<LayoutDashboard size={18} />}
          label="Ferramentas"
          value={dashboard.tools.filter((tool) => tool.status === "ready").length}
        />
      </section>

      <section className="guild-workspace" aria-label="Guild workspace">
        <aside className="guild-side-stack">
          <section className="guild-panel">
            <div className="guild-panel-header">
              <span>
                <Users size={17} />
                Members
              </span>
              <small>{isLoading ? "Sync..." : "Mock"}</small>
            </div>
            <div className="guild-member-list">
              {dashboard.members.map((member) => (
                <div key={member.id} className="guild-member-row">
                  <span className={`guild-presence ${member.status}`} />
                  <div>
                    <strong>{member.displayName}</strong>
                    <small>
                      {member.mainClass} / {member.role}
                    </small>
                  </div>
                </div>
              ))}
            </div>
          </section>

          <section className="guild-panel">
            <div className="guild-panel-header">
              <span>
                <MailPlus size={17} />
                Invites
              </span>
              <small>{dashboard.invites.length} pending</small>
            </div>
            <div className="guild-invite-list">
              {dashboard.invites.map((invite) => (
                <div key={invite.id}>
                  <strong>{invite.email}</strong>
                  <small>
                    {invite.role} / {invite.status}
                  </small>
                </div>
              ))}
            </div>
            <button className="guild-secondary-button" type="button">
              <MailPlus size={16} />
              New invite
            </button>
          </section>
        </aside>

        <GuildMvpTracker
          entries={dashboard.mvpEntries}
          onCreateEntry={handleCreateMvpEntry}
          slug={dashboard.guild.slug}
        />
      </section>
    </main>
  );
}

function SummaryTile({
  icon,
  label,
  value,
}: {
  icon: ReactNode;
  label: string;
  value: number;
}) {
  return (
    <div className="guild-summary-tile">
      <span>{icon}</span>
      <small>{label}</small>
      <strong>{value}</strong>
    </div>
  );
}
