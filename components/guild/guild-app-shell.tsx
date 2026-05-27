"use client";

import { Bell, ChevronDown, Command, LogOut, Search, Settings, Swords } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { canUseGuildTool, formatGuildRole } from "./guild-role-access";
import { getGuildTool, guildTools } from "./guild-tool-registry";
import type { GuildToolDefinition } from "./guild-tool-types";
import type { GuildDashboard, MvpKillEntry } from "./guild-types";

type GuildAppShellProps = {
  dashboard: GuildDashboard;
  notice: string;
  onCreateMvpEntry: (entry: MvpKillEntry) => void;
  onRefreshDashboard: () => Promise<void>;
};

const categoryLabels: Record<GuildToolDefinition["category"], string> = {
  core: "Workspace",
  operations: "Operations",
  management: "Management",
  insights: "Insights",
};

export function GuildAppShell({
  dashboard,
  notice,
  onCreateMvpEntry,
  onRefreshDashboard,
}: GuildAppShellProps) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const activeToolId = searchParams.get("tool");
  const activeTool = getGuildTool(activeToolId);
  const activeAccess = getDashboardTool(dashboard, activeTool.id);
  const canUseActiveTool = canUseGuildTool(dashboard.guild.userRole, activeAccess?.minimumRole ?? null);
  const renderableTool = canUseActiveTool && activeTool.status === "ready" ? activeTool : guildTools[0];
  const ActiveComponent = renderableTool.component;
  const unreadCount = dashboard.notifications.filter((item) => !item.read).length;
  const visibleTools = guildTools.filter((tool) =>
    canUseGuildTool(
      dashboard.guild.userRole,
      getDashboardTool(dashboard, tool.id)?.minimumRole ?? null,
    ),
  );

  function activateTool(tool: GuildToolDefinition) {
    if (tool.status !== "ready") {
      return;
    }

    const params = new URLSearchParams(searchParams.toString());

    if (tool.id === "dashboard") {
      params.delete("tool");
    } else {
      params.set("tool", tool.id);
    }

    const query = params.toString();
    router.replace(`/guilds/${dashboard.guild.slug}${query ? `?${query}` : ""}`);
  }

  return (
    <main className="guild-saas-page">
      <div className="guild-grid-bg" />

      <aside className="guild-sidebar" aria-label="Guild tools">
        <Link href="/guilds" className="guild-sidebar-brand" aria-label="Guild home">
          <Image src={dashboard.guild.emblemUrl} alt="" width={38} height={38} />
          <span>
            <strong>{dashboard.guild.name}</strong>
            <small>{formatGuildRole(dashboard.guild.userRole)}</small>
          </span>
        </Link>

        <nav className="guild-sidebar-nav">
          {(Object.keys(categoryLabels) as GuildToolDefinition["category"][]).map(
            (category) => {
              const tools = visibleTools.filter((tool) => tool.category === category);

              if (tools.length === 0) {
                return null;
              }

              return (
                <section key={category}>
                  <span className="guild-sidebar-section">{categoryLabels[category]}</span>
                  {tools.map((tool) => (
                    <button
                      className={tool.id === renderableTool.id ? "active" : ""}
                      disabled={tool.status !== "ready"}
                      key={tool.id}
                      onClick={() => activateTool(tool)}
                      type="button"
                    >
                      <tool.icon size={16} />
                      <span>{tool.name}</span>
                      {tool.status === "planned" && <small>soon</small>}
                    </button>
                  ))}
                </section>
              );
            },
          )}
        </nav>
      </aside>

      <section className="guild-shell">
        <header className="guild-shell-header">
          <div className="guild-current-tool">
            <renderableTool.icon size={19} />
            <div>
              <strong>{renderableTool.name}</strong>
              <small>{renderableTool.description}</small>
            </div>
          </div>

          <div className="guild-header-actions">
            <button type="button">
              <Search size={16} />
            </button>
            <Link href="/calculator" aria-label="Open calculator">
              <Swords size={16} />
            </Link>
            <button type="button" aria-label="Guild settings">
              <Settings size={16} />
            </button>
            <Link className="guild-user-button" href="/profile">
              <Command size={16} />
              <span>{notice}</span>
              <ChevronDown size={14} />
            </Link>
            <button type="button" aria-label="Exit guild">
              <LogOut size={16} />
            </button>
          </div>
        </header>

        <div className="guild-tool-tabs" role="tablist" aria-label="Open tools">
          {visibleTools
            .filter((tool) => tool.status === "ready")
            .slice(0, 6)
            .map((tool) => (
              <button
                aria-selected={tool.id === renderableTool.id}
                className={tool.id === renderableTool.id ? "active" : ""}
                key={tool.id}
                onClick={() => activateTool(tool)}
                role="tab"
                type="button"
              >
                <tool.icon size={15} />
                {tool.name}
              </button>
            ))}
        </div>

        <div className="guild-workspace-shell">
          <section className="guild-workspace-content">
            <ActiveComponent
              dashboard={dashboard}
              onCreateMvpEntry={onCreateMvpEntry}
              onRefreshDashboard={onRefreshDashboard}
            />
          </section>

          <aside className="guild-notification-center" aria-label="Notification center">
            <div className="guild-panel-header">
              <span>
                <Bell size={17} />
                Notifications
              </span>
              <small>{unreadCount} new</small>
            </div>
            <div className="guild-notification-mini-list">
              {dashboard.notifications.slice(0, 4).map((notification) => (
                <article key={notification.id}>
                  <strong>{notification.title}</strong>
                  <p>{notification.body}</p>
                </article>
              ))}
            </div>
          </aside>
        </div>
      </section>
    </main>
  );
}

function getDashboardTool(dashboard: GuildDashboard, toolId: string) {
  return dashboard.tools.find((tool) => tool.id === toolId) ?? null;
}
