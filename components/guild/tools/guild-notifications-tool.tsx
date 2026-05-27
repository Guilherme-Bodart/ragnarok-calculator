import { Bell } from "lucide-react";
import type { GuildToolComponentProps } from "../guild-tool-types";

export function GuildNotificationsTool({ dashboard }: GuildToolComponentProps) {
  return (
    <section className="guild-module-panel">
      <div className="guild-panel-header">
        <span>
          <Bell size={17} />
          Notificacoes
        </span>
        <small>{dashboard.notifications.filter((item) => !item.read).length} unread</small>
      </div>
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
