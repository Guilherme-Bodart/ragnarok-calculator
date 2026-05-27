"use client";

import { FormEvent, useMemo, useState } from "react";
import { Clock3, MapPin, Plus, Skull, TimerReset } from "lucide-react";
import { cn } from "@/lib/utils";
import { createLocalMvpEntry, getMvpStatus } from "./guild-mock-data";
import type { MvpKillEntry, MvpSpawnStatus } from "./guild-types";

type GuildMvpTrackerProps = {
  entries: MvpKillEntry[];
  onCreateEntry: (entry: MvpKillEntry) => void;
  slug: string;
};

const apiBaseUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:4000/api";

const commonMvps = [
  { name: "Eddga", map: "pay_fild11", respawnMinutes: 120 },
  { name: "Maya", map: "anthell02", respawnMinutes: 120 },
  { name: "Moonlight Flower", map: "pay_dun04", respawnMinutes: 60 },
  { name: "Pharaoh", map: "in_sphinx5", respawnMinutes: 60 },
  { name: "Orc Hero", map: "gef_fild03", respawnMinutes: 60 },
];

export function GuildMvpTracker({
  entries,
  onCreateEntry,
  slug,
}: GuildMvpTrackerProps) {
  const [mvpName, setMvpName] = useState(commonMvps[0].name);
  const [map, setMap] = useState(commonMvps[0].map);
  const [killedAt, setKilledAt] = useState(() => toDatetimeLocal(new Date()));
  const [respawnMinutes, setRespawnMinutes] = useState(commonMvps[0].respawnMinutes);
  const [notes, setNotes] = useState("");
  const [message, setMessage] = useState("");
  const [isSaving, setIsSaving] = useState(false);

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

  function handlePresetChange(value: string) {
    const preset = commonMvps.find((item) => item.name === value);

    setMvpName(value);

    if (preset) {
      setMap(preset.map);
      setRespawnMinutes(preset.respawnMinutes);
    }
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setIsSaving(true);
    setMessage("");

    const payload = {
      mvpName,
      map,
      killedAt: new Date(killedAt).toISOString(),
      respawnMinutes,
      notes: notes || undefined,
    };

    try {
      const response = await fetch(`${apiBaseUrl}/guilds/${slug}/mvp-kills`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      if (!response.ok) {
        throw new Error("Unable to save MVP kill");
      }

      const data = (await response.json()) as { entry: MvpKillEntry };
      onCreateEntry(data.entry);
      setNotes("");
      setMessage("MVP registrado.");
    } catch {
      onCreateEntry(createLocalMvpEntry(payload));
      setMessage("API offline: registro salvo localmente para preview.");
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
            MVP Tracker
          </span>
          <h2>Respawn command board</h2>
          <p>Registre mortes, acompanhe janelas e mantenha a guilda alinhada.</p>
        </div>
        <div className="guild-mvp-summary">
          <SummaryCard label="Aguardando" value={statusSummary.waiting} tone="waiting" />
          <SummaryCard label="Em breve" value={statusSummary.soon} tone="soon" />
          <SummaryCard label="Nasceu" value={statusSummary.spawned} tone="spawned" />
        </div>
      </header>

      <form className="guild-mvp-form" onSubmit={handleSubmit}>
        <div className="guild-mvp-form-grid">
          <label>
            MVP
            <select value={mvpName} onChange={(event) => handlePresetChange(event.target.value)}>
              {commonMvps.map((mvp) => (
                <option key={mvp.name} value={mvp.name}>
                  {mvp.name}
                </option>
              ))}
            </select>
          </label>
          <label>
            Mapa
            <input value={map} onChange={(event) => setMap(event.target.value)} />
          </label>
          <label>
            Horario da morte
            <input
              type="datetime-local"
              value={killedAt}
              onChange={(event) => setKilledAt(event.target.value)}
            />
          </label>
          <label>
            Cooldown
            <input
              min={1}
              max={1440}
              type="number"
              value={respawnMinutes}
              onChange={(event) => setRespawnMinutes(Number(event.target.value))}
            />
          </label>
          <label className="guild-mvp-notes">
            Nota
            <input value={notes} onChange={(event) => setNotes(event.target.value)} />
          </label>
        </div>
        <button className="guild-primary-button" disabled={isSaving} type="submit">
          <Plus size={16} />
          Registrar morte
        </button>
      </form>

      {message && <p className="guild-inline-message">{message}</p>}

      <div className="guild-mvp-board">
        <div className="guild-panel-header">
          <span>
            <TimerReset size={17} />
            Timers ativos
          </span>
          <small>{sortedEntries.length} registros</small>
        </div>
        <table className="guild-mvp-table">
          <thead>
            <tr>
              <th>MVP</th>
              <th>Mapa</th>
              <th>Morte</th>
              <th>Respawn</th>
              <th>Status</th>
              <th>Por</th>
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
                    {formatDateTime(entry.respawnAt)}
                  </span>
                </td>
                <td>
                  <StatusPill status={entry.status} />
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

function StatusPill({ status }: { status: MvpSpawnStatus }) {
  const label = {
    waiting: "Aguardando",
    soon: "Nascendo em breve",
    spawned: "Ja nasceu",
  }[status];

  return (
    <span className={cn("guild-status-pill", `status-${status}`)}>
      <TimerReset size={14} />
      {label}
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

function toDatetimeLocal(date: Date) {
  const timezoneOffset = date.getTimezoneOffset() * 60 * 1000;
  return new Date(date.getTime() - timezoneOffset).toISOString().slice(0, 16);
}
