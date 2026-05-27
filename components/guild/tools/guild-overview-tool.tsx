import { Activity, Bell, CalendarClock, Radio, TimerReset, Users } from "lucide-react";
import { getMvpStatus } from "../guild-mock-data";
import type { GuildToolComponentProps } from "../guild-tool-types";

export function GuildOverviewTool({ dashboard }: GuildToolComponentProps) {
  const activeTimers = dashboard.mvpEntries.filter(
    (entry) => getMvpStatus(entry.respawnAt) !== "spawned",
  );
  const unreadNotifications = dashboard.notifications.filter(
    (notification) => !notification.read,
  );
  const nextEvent = dashboard.events
    .slice()
    .sort(
      (first, second) =>
        new Date(first.startsAt).getTime() - new Date(second.startsAt).getTime(),
    )[0];

  return (
    <div className="guild-tool-page">
      <section className="guild-overview-metrics" aria-label="Guild overview">
        <MetricTile icon={Users} label="Online" value={dashboard.guild.onlineCount} />
        <MetricTile icon={TimerReset} label="Timers" value={activeTimers.length} />
        <MetricTile icon={Bell} label="Alerts" value={unreadNotifications.length} />
        <MetricTile icon={Activity} label="Tools" value={dashboard.tools.length} />
      </section>

      <section className="guild-tool-grid">
        <div className="guild-module-panel">
          <div className="guild-panel-header">
            <span>
              <Radio size={17} />
              Guild Feed
            </span>
            <small>{dashboard.feed.length} updates</small>
          </div>
          <div className="guild-feed-stack compact">
            {dashboard.feed.slice(0, 3).map((item) => (
              <article key={item.id} className="guild-feed-item">
                <small>{item.author}</small>
                <strong>{item.title}</strong>
                <p>{item.body}</p>
              </article>
            ))}
          </div>
        </div>

        <div className="guild-module-panel">
          <div className="guild-panel-header">
            <span>
              <CalendarClock size={17} />
              Next Event
            </span>
            <small>{nextEvent ? formatDateTime(nextEvent.startsAt) : "Empty"}</small>
          </div>
          {nextEvent && (
            <div className="guild-event-focus">
              <strong>{nextEvent.title}</strong>
              <span>{nextEvent.type}</span>
              <small>{formatDateTime(nextEvent.startsAt)}</small>
            </div>
          )}
        </div>
      </section>
    </div>
  );
}

function MetricTile({
  icon: Icon,
  label,
  value,
}: {
  icon: typeof Users;
  label: string;
  value: number;
}) {
  return (
    <div className="guild-metric-tile">
      <span>
        <Icon size={18} />
      </span>
      <small>{label}</small>
      <strong>{value}</strong>
    </div>
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
