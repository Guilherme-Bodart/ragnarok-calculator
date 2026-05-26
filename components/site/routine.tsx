import { CalendarDays, ShieldCheck } from "lucide-react";
import type { Dictionary } from "@/content/i18n";

type RoutineProps = {
  t: Dictionary["agenda"];
};

export function Routine({ t }: RoutineProps) {
  return (
    <section id="agenda" className="section-band">
      <div className="narrow-shell section-heading reveal">
        <div className="ornament">{t.kicker}</div>
        <h2 className="section-title">{t.title}</h2>
        <p className="section-copy">{t.description}</p>
      </div>

      <div className="narrow-shell reveal reveal-delay-2">
        <div className="holo-panel">
          <span className="holo-badge">
            <CalendarDays aria-hidden className="size-4" />
            {t.badge}
          </span>
          <h3 className="holo-title">{t.eventTitle}</h3>
          <p className="holo-time">
            {t.day} · {t.time}
          </p>
          <p className="holo-copy">{t.copy}</p>
          <div className="cta-row">
            <span className="holo-badge">
              <ShieldCheck aria-hidden className="size-4" />
              {t.status}
            </span>
          </div>
        </div>
      </div>
    </section>
  );
}
