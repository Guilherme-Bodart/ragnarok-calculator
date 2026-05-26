import { Crown, Flame, Gem, Handshake, Swords, Users } from "lucide-react";
import type { Dictionary } from "@/content/i18n";

const icons = [Swords, Users, Flame, Handshake, Gem, Crown];

type ManifestoProps = {
  t: Dictionary["values"];
};

export function Manifesto({ t }: ManifestoProps) {
  return (
    <section id="valores" className="section-band">
      <div className="narrow-shell section-heading reveal">
        <div className="ornament">{t.kicker}</div>
        <h2 className="section-title">{t.title}</h2>
        <p className="section-copy">{t.description}</p>
      </div>

      <div className="site-shell values-grid">
        {t.items.map((pillar, index) => {
          const Icon = icons[index] ?? Swords;

          return (
            <article
              key={pillar.title}
              className={`glass-card reveal reveal-delay-${(index % 3) + 1}`}
            >
              <div className="card-icon">
                <Icon aria-hidden className="size-5" />
              </div>
              <h3 className="card-title">{pillar.title}</h3>
              <p className="card-copy">{pillar.description}</p>
            </article>
          );
        })}
      </div>
    </section>
  );
}
