import { Bell, CalendarClock, Crown, ShieldCheck, Users } from "lucide-react";
import { Button } from "@/components/ui/button";
import { FeaturePill } from "@/components/ui/feature-pill";
import type { Dictionary } from "@/content/i18n";

type GuildSaasShowcaseProps = {
  t: Dictionary["agenda"];
};

const toolIcons = [Crown, CalendarClock, Users, ShieldCheck];

export function GuildSaasShowcase({ t }: GuildSaasShowcaseProps) {
  return (
    <section className="guild-saas-showcase section-band">
      <div className="site-shell guild-saas-layout">
        <div className="guild-saas-copy reveal">
          <div className="section-kicker">{t.kicker}</div>
          <h2>{t.title}</h2>
          <p>{t.description}</p>
          <div className="ui-pill-row">
            {t.features.map((feature) => (
              <FeaturePill key={feature}>{feature}</FeaturePill>
            ))}
          </div>
          <Button href="/login">{t.action}</Button>
        </div>

        <div className="guild-workspace-preview reveal reveal-delay-2" aria-label={t.previewLabel}>
          <aside className="guild-preview-sidebar">
            <strong>Nightmare</strong>
            <nav>
              {t.tools.map((tool, index) => {
                const Icon = toolIcons[index] ?? Crown;

                return (
                  <span className={index === 0 ? "active" : ""} key={tool}>
                    <Icon aria-hidden size={15} />
                    {tool}
                  </span>
                );
              })}
            </nav>
          </aside>

          <section className="guild-preview-main">
            <div className="guild-preview-topline">
              <span>{t.boardEyebrow}</span>
              <small>{t.boardMeta}</small>
            </div>
            <h3>{t.boardTitle}</h3>

            <div className="guild-preview-table">
              {t.mvpRows.map((row) => (
                <article key={`${row.mvp}-${row.map}`}>
                  <span>
                    <strong>{row.mvp}</strong>
                    <small>{row.map}</small>
                  </span>
                  <time>{row.time}</time>
                  <em>{row.status}</em>
                </article>
              ))}
            </div>
          </section>

          <aside className="guild-preview-aside">
            <div>
              <Bell aria-hidden size={16} />
              <span>{t.sideAlerts}</span>
              <strong>{t.sideAlertValue}</strong>
            </div>
            <div>
              <CalendarClock aria-hidden size={16} />
              <span>{t.sideEvent}</span>
              <strong>{t.sideEventValue}</strong>
            </div>
            <div>
              <ShieldCheck aria-hidden size={16} />
              <span>{t.sideAccess}</span>
              <strong>{t.sideAccessValue}</strong>
            </div>
          </aside>
        </div>
      </div>
    </section>
  );
}
