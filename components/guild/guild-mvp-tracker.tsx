"use client";

import { FormEvent, useMemo, useState } from "react";
import { Clock3, MapPin, Plus, Skull, TimerReset } from "lucide-react";
import {
  MVP_RESPAWN_RANDOM_DELAY_MINUTES,
  mvpCatalog,
} from "@/packages/guild-core/src";
import { cn } from "@/lib/utils";
import { useNightmareLocale } from "@/components/site/use-nightmare-locale";
import { Button } from "@/components/ui/button";
import { PanelHeader } from "@/components/ui/panel-header";
import { Select } from "@/components/ui/select";
import { getMvpStatus } from "./guild-time";
import type { MvpKillEntry, MvpSpawnStatus } from "./guild-types";

type GuildMvpTrackerProps = {
  entries: MvpKillEntry[];
  onCreateEntry: (entry: MvpKillEntry) => void;
  slug: string;
};

const apiBaseUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:4000/api";

export function GuildMvpTracker({
  entries,
  onCreateEntry,
  slug,
}: GuildMvpTrackerProps) {
  const { dictionary } = useNightmareLocale();
  const t = dictionary.guild.mvp;
  const [catalogEntryId, setCatalogEntryId] = useState<string>(mvpCatalog[0].id);
  const [killedAt, setKilledAt] = useState(() => toDatetimeLocal(new Date()));
  const [notes, setNotes] = useState("");
  const [message, setMessage] = useState("");
  const [isSaving, setIsSaving] = useState(false);
  const selectedMvp = useMemo(
    () => mvpCatalog.find((entry) => entry.id === catalogEntryId) ?? mvpCatalog[0],
    [catalogEntryId],
  );

  const sortedEntries = useMemo(
    () =>
      [...entries]
        .map((entry) => ({
          ...entry,
          status: getMvpStatus(entry.respawnAt),
        }))
        .sort(
          (first, second) =>
            new Date(first.respawnAt).getTime() - new Date(second.respawnAt).getTime(),
        ),
    [entries],
  );
  const statusSummary = useMemo(
    () => ({
      waiting: sortedEntries.filter((entry) => entry.status === "waiting").length,
      soon: sortedEntries.filter((entry) => entry.status === "soon").length,
      spawned: sortedEntries.filter((entry) => entry.status === "spawned").length,
    }),
    [sortedEntries],
  );

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setIsSaving(true);
    setMessage("");

    const payload = {
      catalogEntryId,
      killedAt: new Date(killedAt).toISOString(),
      notes: notes || undefined,
    };

    try {
      const response = await fetch(`${apiBaseUrl}/guilds/${slug}/mvp-kills`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify(payload),
      });

      if (!response.ok) {
        throw new Error("Unable to save MVP kill");
      }

      const data = (await response.json()) as { entry: MvpKillEntry };
      onCreateEntry(data.entry);
      setNotes("");
      setMessage(t.saved);
    } catch {
      setMessage(t.saveError);
    } finally {
      setIsSaving(false);
    }
  }

  return (
    <section className="guild-mvp-panel" aria-label="MVP tracker">
      <header className="guild-mvp-hero">
        <div>
          <span className="guild-tool-eyebrow">
            <Skull size={16} />
            {t.eyebrow}
          </span>
          <h2>{t.title}</h2>
          <p>{t.description}</p>
        </div>
        <div className="guild-mvp-summary">
          <SummaryCard label={t.waiting} value={statusSummary.waiting} tone="waiting" />
          <SummaryCard label={t.soon} value={statusSummary.soon} tone="soon" />
          <SummaryCard label={t.spawned} value={statusSummary.spawned} tone="spawned" />
        </div>
      </header>

      <form className="guild-mvp-form" onSubmit={handleSubmit}>
        <div className="guild-mvp-form-grid">
          <label>
            {t.mvpLabel}
            <Select
              value={catalogEntryId}
              onChange={(event) => setCatalogEntryId(event.target.value)}
            >
              {mvpCatalog.map((mvp) => (
                <option key={mvp.id} value={mvp.id}>
                  {mvp.name} - {mvp.mapId} ({mvp.respawnLabel})
                </option>
              ))}
            </Select>
          </label>
          <label>
            {t.mapLabel}
            <input readOnly value={selectedMvp.mapId} />
          </label>
          <label>
            {t.killedAtLabel}
            <input
              type="datetime-local"
              value={killedAt}
              onChange={(event) => setKilledAt(event.target.value)}
            />
          </label>
          <label>
            {t.cooldownLabel}
            <input
              readOnly
              value={`${selectedMvp.respawnLabel} (+0-${MVP_RESPAWN_RANDOM_DELAY_MINUTES} min)`}
            />
          </label>
          <label className="guild-mvp-notes">
            {t.notesLabel}
            <input value={notes} onChange={(event) => setNotes(event.target.value)} />
          </label>
        </div>
        <Button
          className="guild-primary-button"
          disabled={isSaving}
          icon={<Plus size={16} />}
          type="submit"
        >
          {t.submit}
        </Button>
      </form>

      {message && <p className="guild-inline-message">{message}</p>}

      <div className="guild-mvp-board">
        <PanelHeader
          icon={<TimerReset size={17} />}
          title={t.activeTimers}
          meta={`${sortedEntries.length} ${t.records}`}
        />
        <table className="guild-mvp-table">
          <thead>
            <tr>
              <th>MVP</th>
              <th>{t.mapLabel}</th>
              <th>{t.deathColumn}</th>
              <th>{t.respawnColumn}</th>
              <th>{t.statusColumn}</th>
              <th>{t.recordedByColumn}</th>
            </tr>
          </thead>
          <tbody>
            {sortedEntries.map((entry) => (
              <tr key={entry.id}>
                <td>
                  <strong>{entry.mvpName}</strong>
                  {entry.notes && <small>{entry.notes}</small>}
                </td>
                <td>{entry.map}</td>
                <td>{formatDateTime(entry.killedAt)}</td>
                <td>
                  <span className="guild-time-cell">
                    <Clock3 size={14} />
                    {formatRespawnWindow(entry)}
                  </span>
                </td>
                <td>
                  <StatusPill
                    labels={{
                      waiting: t.waiting,
                      soon: t.soonStatus,
                      spawned: t.spawnedStatus,
                    }}
                    status={entry.status}
                  />
                </td>
                <td>{entry.recordedBy}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </section>
  );
}

function SummaryCard({
  label,
  tone,
  value,
}: {
  label: string;
  tone: MvpSpawnStatus;
  value: number;
}) {
  return (
    <div className={cn("guild-mvp-summary-card", `tone-${tone}`)}>
      <MapPin size={15} />
      <strong>{value}</strong>
      <span>{label}</span>
    </div>
  );
}

function StatusPill({
  labels,
  status,
}: {
  labels: Record<MvpSpawnStatus, string>;
  status: MvpSpawnStatus;
}) {
  return (
    <span className={cn("guild-status-pill", `status-${status}`)}>
      <TimerReset size={14} />
      {labels[status]}
    </span>
  );
}

function formatDateTime(value: string) {
  return new Intl.DateTimeFormat("pt-BR", {
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
    month: "2-digit",
  }).format(new Date(value));
}

function formatRespawnWindow(entry: MvpKillEntry) {
  if (!entry.respawnWindowEndAt) {
    return formatDateTime(entry.respawnAt);
  }

  return `${formatDateTime(entry.respawnAt)} - ${formatTime(entry.respawnWindowEndAt)}`;
}

function formatTime(value: string) {
  return new Intl.DateTimeFormat("pt-BR", {
    hour: "2-digit",
    minute: "2-digit",
  }).format(new Date(value));
}

function toDatetimeLocal(date: Date) {
  const timezoneOffset = date.getTimezoneOffset() * 60 * 1000;
  return new Date(date.getTime() - timezoneOffset).toISOString().slice(0, 16);
}
