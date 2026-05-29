import { CalendarClock } from "lucide-react";
import { PanelHeader } from "@/components/ui/panel-header";
import type { GuildToolComponentProps } from "../guild-tool-types";

export function GuildCalendarTool({ dashboard }: GuildToolComponentProps) {
  return (
    <section className="guild-module-panel">
      <PanelHeader
        icon={<CalendarClock size={17} />}
        title="Agenda"
        meta={`${dashboard.events.length} events`}
      />
      <div className="guild-event-list">
        {dashboard.events.map((event) => (
          <article key={event.id} className="guild-event-row">
            <div>
              <strong>{event.title}</strong>
              <small>
                {event.type} / {event.requiredRole.name}
              </small>
            </div>
            <time>{formatDateTime(event.startsAt)}</time>
          </article>
        ))}
      </div>
    </section>
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
