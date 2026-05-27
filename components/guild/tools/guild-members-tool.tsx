import { MailPlus, Users } from "lucide-react";
import type { GuildToolComponentProps } from "../guild-tool-types";

export function GuildMembersTool({ dashboard }: GuildToolComponentProps) {
  return (
    <div className="guild-tool-grid">
      <section className="guild-module-panel">
        <div className="guild-panel-header">
          <span>
            <Users size={17} />
            Members
          </span>
          <small>{dashboard.members.length} visible</small>
        </div>
        <div className="guild-member-list">
          {dashboard.members.map((member) => (
            <div key={member.id} className="guild-member-row">
              <span className={`guild-presence ${member.status}`} />
              <div>
                <strong>{member.displayName}</strong>
                <small>
                  {member.mainClass} / {member.role}
                </small>
              </div>
            </div>
          ))}
        </div>
      </section>

      <section className="guild-module-panel">
        <div className="guild-panel-header">
          <span>
            <MailPlus size={17} />
            Invites
          </span>
          <small>{dashboard.invites.length} pending</small>
        </div>
        <div className="guild-invite-list">
          {dashboard.invites.map((invite) => (
            <div key={invite.id}>
              <strong>{invite.email}</strong>
              <small>
                {invite.role} / {invite.status}
              </small>
            </div>
          ))}
        </div>
        <button className="guild-secondary-button" type="button">
          <MailPlus size={16} />
          New invite
        </button>
      </section>
    </div>
  );
}
