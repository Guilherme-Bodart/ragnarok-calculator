import { Bell } from "lucide-react";
import { PanelHeader } from "@/components/ui/panel-header";
import type { GuildToolComponentProps } from "../guild-tool-types";

export function GuildNotificationsTool({ dashboard }: GuildToolComponentProps) {
  return (
    <section className="guild-module-panel">
      <PanelHeader
        icon={<Bell size={17} />}
        title="Notificacoes"
        meta={`${dashboard.notifications.filter((item) => !item.read).length} unread`}
      />
      <div className="guild-notification-list">
        {dashboard.notifications.map((notification) => (
          <article
            key={notification.id}
            className={`guild-notification-row tone-${notification.tone}`}
          >
            <div>
              <strong>{notification.title}</strong>
              <p>{notification.body}</p>
            </div>
            <small>{notification.read ? "Read" : "New"}</small>
          </article>
        ))}
      </div>
    </section>
  );
}
