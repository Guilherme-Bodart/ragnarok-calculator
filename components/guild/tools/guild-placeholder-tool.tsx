import type { GuildToolComponentProps } from "../guild-tool-types";

export function GuildPlaceholderTool({ dashboard }: GuildToolComponentProps) {
  return (
    <section className="guild-module-panel guild-placeholder-tool">
      <strong>{dashboard.guild.name}</strong>
      <span>Module planned</span>
    </section>
  );
}
