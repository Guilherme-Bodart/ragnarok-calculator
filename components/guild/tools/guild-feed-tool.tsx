import { Radio } from "lucide-react";
import { PanelHeader } from "@/components/ui/panel-header";
import type { GuildToolComponentProps } from "../guild-tool-types";

export function GuildFeedTool({ dashboard }: GuildToolComponentProps) {
  return (
    <section className="guild-module-panel">
      <PanelHeader
        icon={<Radio size={17} />}
        title="Guild Feed"
        meta={`${dashboard.feed.length} posts`}
      />
      <div className="guild-feed-stack">
        {dashboard.feed.map((item) => (
          <article key={item.id} className="guild-feed-item">
            <small>
              {item.author} / {formatDateTime(item.createdAt)}
            </small>
            <strong>{item.title}</strong>
            <p>{item.body}</p>
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
