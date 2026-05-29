"use client";

import { Bell, ChevronDown, Command, LogOut, Search, Settings, Swords } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { IconButton } from "@/components/ui/icon-button";
import { PanelHeader } from "@/components/ui/panel-header";
import { TabButton, Tabs } from "@/components/ui/tabs";
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

const apiBaseUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:4000/api";

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

  async function handleLogout() {
    await fetch(`${apiBaseUrl}/auth/logout`, {
      method: "POST",
      credentials: "include",
    });
    router.replace("/login");
    router.refresh();
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
                    <TabButton
                      active={tool.id === renderableTool.id}
                      className="guild-sidebar-tab"
                      disabled={tool.status !== "ready"}
                      key={tool.id}
                      onClick={() => activateTool(tool)}
                    >
                      <tool.icon size={16} />
                      <span>{tool.name}</span>
                      {tool.status === "planned" && <small>soon</small>}
                    </TabButton>
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
            <IconButton label="Search" type="button">
              <Search size={16} />
            </IconButton>
            <IconButton href="/calculator" label="Open calculator">
              <Swords size={16} />
            </IconButton>
            <IconButton label="Guild settings" type="button">
              <Settings size={16} />
            </IconButton>
            <Link className="guild-user-button" href="/profile">
              <Command size={16} />
              <span>{notice}</span>
              <ChevronDown size={14} />
            </Link>
            <IconButton
              label="Logout"
              onClick={() => void handleLogout()}
              type="button"
              variant="danger"
            >
              <LogOut size={16} />
            </IconButton>
          </div>
        </header>

        <Tabs label="Open tools">
          {visibleTools
            .filter((tool) => tool.status === "ready")
            .slice(0, 6)
            .map((tool) => (
              <TabButton
                active={tool.id === renderableTool.id}
                key={tool.id}
                onClick={() => activateTool(tool)}
              >
                <tool.icon size={15} />
                {tool.name}
              </TabButton>
            ))}
        </Tabs>

        <div className="guild-workspace-shell">
          <section className="guild-workspace-content">
            <ActiveComponent
              dashboard={dashboard}
              onCreateMvpEntry={onCreateMvpEntry}
              onRefreshDashboard={onRefreshDashboard}
            />
          </section>

          <aside className="guild-notification-center" aria-label="Notification center">
            <PanelHeader
              icon={<Bell size={17} />}
              title="Notifications"
              meta={`${unreadCount} new`}
            />
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
