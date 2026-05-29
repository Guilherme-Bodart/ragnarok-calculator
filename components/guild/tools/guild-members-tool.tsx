"use client";

import { ArrowDown, ArrowUp, Crown, MailPlus, Shield, Trash2, Users } from "lucide-react";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { useNightmareLocale } from "@/components/site/use-nightmare-locale";
import { Button } from "@/components/ui/button";
import { IconButton } from "@/components/ui/icon-button";
import { PanelHeader } from "@/components/ui/panel-header";
import { Select } from "@/components/ui/select";
import { getRoleRank } from "../guild-role-access";
import type { GuildRole } from "../guild-types";
import type { GuildToolComponentProps } from "../guild-tool-types";

const apiBaseUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:4000/api";

export function GuildMembersTool({
  dashboard,
  onRefreshDashboard,
}: GuildToolComponentProps) {
  const router = useRouter();
  const { dictionary } = useNightmareLocale();
  const t = dictionary.guild.management;
  const canManage = dashboard.guild.isOwner || getRoleRank(dashboard.guild.userRole) === 1;
  const [roleName, setRoleName] = useState("");
  const [roleColor, setRoleColor] = useState("#67e8f9");
  const [leaderMemberId, setLeaderMemberId] = useState(
    dashboard.members.find((member) => member.isOwner)?.id ?? dashboard.members[0]?.id ?? "",
  );
  const [message, setMessage] = useState("");

  async function request(path: string, init: RequestInit) {
    const response = await fetch(`${apiBaseUrl}${path}`, {
      ...init,
      credentials: "include",
      headers: {
        "Content-Type": "application/json",
        ...init.headers,
      },
    });

    if (!response.ok) {
      throw new Error("Guild management request failed");
    }
  }

  async function createRole() {
    if (!roleName.trim()) {
      return;
    }

    try {
      await request(`/guilds/${dashboard.guild.slug}/roles`, {
        method: "POST",
        body: JSON.stringify({ name: roleName, color: roleColor }),
      });
      setRoleName("");
      setMessage(t.roleSaved);
      await onRefreshDashboard();
    } catch {
      setMessage(t.actionError);
    }
  }

  async function moveRole(role: GuildRole, direction: -1 | 1) {
    await updateRole(role.id, { rank: role.rank + direction });
  }

  async function updateRole(
    roleId: string,
    payload: { name?: string; color?: string; rank?: number },
  ) {
    try {
      await request(`/guilds/${dashboard.guild.slug}/roles/${roleId}`, {
        method: "PATCH",
        body: JSON.stringify(payload),
      });
      await onRefreshDashboard();
    } catch {
      setMessage(t.actionError);
    }
  }

  async function updateMemberRole(memberId: string, roleId: string) {
    try {
      await request(`/guilds/${dashboard.guild.slug}/members/${memberId}/role`, {
        method: "PATCH",
        body: JSON.stringify({ roleId }),
      });
      await onRefreshDashboard();
    } catch {
      setMessage(t.actionError);
    }
  }

  async function updateToolAccess(toolId: string, minimumRoleId: string) {
    try {
      await request(`/guilds/${dashboard.guild.slug}/tools/${toolId}/access`, {
        method: "PATCH",
        body: JSON.stringify({ minimumRoleId }),
      });
      await onRefreshDashboard();
    } catch {
      setMessage(t.actionError);
    }
  }

  async function transferLeadership() {
    if (!dashboard.guild.isOwner || !leaderMemberId) {
      return;
    }

    try {
      await request(`/guilds/${dashboard.guild.slug}/transfer-leadership`, {
        method: "POST",
        body: JSON.stringify({ memberId: leaderMemberId }),
      });
      setMessage(t.leadershipTransferred);
      await onRefreshDashboard();
    } catch {
      setMessage(t.actionError);
    }
  }

  async function deleteGuild() {
    if (!dashboard.guild.isOwner || !window.confirm(t.deleteConfirm)) {
      return;
    }

    try {
      await request(`/guilds/${dashboard.guild.slug}`, {
        method: "DELETE",
      });
      router.replace("/profile");
    } catch {
      setMessage(t.actionError);
    }
  }

  return (
    <div className="guild-tool-grid guild-management-grid">
      <section className="guild-module-panel">
        <PanelHeader
          icon={<Users size={17} />}
          title={t.membersTitle}
          meta={dashboard.members.length}
        />
        <div className="guild-member-list">
          {dashboard.members.map((member) => (
            <div key={member.id} className="guild-member-row">
              <span className={`guild-presence ${member.status}`} />
              <div>
                <strong>
                  {member.displayName}
                  {member.isOwner && <Crown size={14} />}
                </strong>
                <small>
                  <RoleBadge role={member.role} />
                  {member.mainClass || t.noClass}
                </small>
              </div>
              {canManage && (
                <Select
                  aria-label={t.memberRoleLabel}
                  onChange={(event) => updateMemberRole(member.id, event.target.value)}
                  value={member.role.id}
                >
                  {dashboard.roles.map((role) => (
                    <option key={role.id} value={role.id}>
                      {role.name}
                    </option>
                  ))}
                </Select>
              )}
            </div>
          ))}
        </div>
      </section>

      <section className="guild-module-panel">
        <PanelHeader
          icon={<Shield size={17} />}
          title={t.rolesTitle}
          meta={`${dashboard.roles.length}/10`}
        />
        <div className="guild-role-list">
          {dashboard.roles.map((role, index) => (
            <article key={role.id} className="guild-role-row">
              {canManage ? (
                <span className="guild-role-edit">
                  <input
                    aria-label={t.roleNameLabel}
                    defaultValue={role.name}
                    onBlur={(event) => {
                      if (event.target.value.trim() && event.target.value !== role.name) {
                        void updateRole(role.id, { name: event.target.value });
                      }
                    }}
                  />
                  <input
                    aria-label={t.roleColorLabel}
                    defaultValue={role.color}
                    onBlur={(event) => {
                      if (event.target.value !== role.color) {
                        void updateRole(role.id, { color: event.target.value });
                      }
                    }}
                    type="color"
                  />
                </span>
              ) : (
                <RoleBadge role={role} />
              )}
              <small>{t.rankLabel} {role.rank}</small>
              {canManage && (
                <span className="guild-role-actions">
                  <IconButton
                    label={t.moveUp}
                    disabled={index === 0}
                    onClick={() => moveRole(role, -1)}
                    type="button"
                  >
                    <ArrowUp size={14} />
                  </IconButton>
                  <IconButton
                    label={t.moveDown}
                    disabled={index === dashboard.roles.length - 1}
                    onClick={() => moveRole(role, 1)}
                    type="button"
                  >
                    <ArrowDown size={14} />
                  </IconButton>
                </span>
              )}
            </article>
          ))}
        </div>
        {canManage && dashboard.roles.length < 10 && (
          <div className="guild-role-create">
            <input
              aria-label={t.roleNameLabel}
              onChange={(event) => setRoleName(event.target.value)}
              placeholder={t.roleNameLabel}
              value={roleName}
            />
            <input
              aria-label={t.roleColorLabel}
              onChange={(event) => setRoleColor(event.target.value)}
              type="color"
              value={roleColor}
            />
            <Button onClick={createRole} type="button" variant="secondary">
              {t.createRoleAction}
            </Button>
          </div>
        )}
      </section>

      <section className="guild-module-panel">
        <PanelHeader icon={<Shield size={17} />} title={t.toolsTitle} />
        <div className="guild-tool-access-list">
          {dashboard.tools.map((tool) => (
            <label key={tool.id}>
              <span>
                <strong>{tool.name}</strong>
                <small>{t.minimumRoleLabel}</small>
              </span>
              <Select
                disabled={!canManage}
                onChange={(event) => updateToolAccess(tool.id, event.target.value)}
                value={getMinimumRoleId(tool.minimumRole, dashboard.roles)}
              >
                {dashboard.roles.map((role) => (
                  <option key={role.id} value={role.id}>
                    {role.name}
                  </option>
                ))}
              </Select>
            </label>
          ))}
        </div>
      </section>

      <section className="guild-module-panel">
        <PanelHeader
          icon={<MailPlus size={17} />}
          title={t.invitesTitle}
          meta={dashboard.invites.length}
        />
        <div className="guild-invite-list">
          {dashboard.invites.map((invite) => (
            <div key={invite.id}>
              <strong>{invite.email}</strong>
              <small>
                {invite.role.name} / {invite.status}
              </small>
            </div>
          ))}
        </div>
      </section>

      {dashboard.guild.isOwner && (
        <section className="guild-module-panel guild-danger-panel">
          <PanelHeader icon={<Crown size={17} />} title={t.leadershipTitle} />
          <div className="guild-owner-actions">
            <Select
              onChange={(event) => setLeaderMemberId(event.target.value)}
              value={leaderMemberId}
            >
              {dashboard.members.map((member) => (
                <option key={member.id} value={member.id}>
                  {member.displayName}
                </option>
              ))}
            </Select>
            <Button onClick={transferLeadership} type="button" variant="secondary">
              {t.transferAction}
            </Button>
            <Button
              icon={<Trash2 size={15} />}
              onClick={deleteGuild}
              type="button"
              variant="danger"
            >
              {t.deleteGuildAction}
            </Button>
          </div>
        </section>
      )}

      {message && <p className="guild-inline-message">{message}</p>}
    </div>
  );
}

function RoleBadge({ role }: { role: GuildRole }) {
  return (
    <span className="guild-role-badge" style={{ ["--role-color" as string]: role.color }}>
      {role.name}
    </span>
  );
}

function getMinimumRoleId(
  minimumRole: GuildToolComponentProps["dashboard"]["tools"][number]["minimumRole"],
  roles: GuildRole[],
) {
  if (!minimumRole) {
    return roles[0]?.id ?? "";
  }

  if (typeof minimumRole !== "string") {
    return minimumRole.id ?? roles[0]?.id ?? "";
  }

  const legacyRank = getRoleRank(minimumRole);
  return roles.find((role) => role.rank === legacyRank)?.id ?? roles[0]?.id ?? "";
}
