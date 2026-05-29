import { Crown, Flame, Gem, Handshake, Swords, Users } from "lucide-react";
import { Panel } from "@/components/ui/panel";
import { SectionHeading } from "@/components/ui/section-heading";
import type { Dictionary } from "@/content/i18n";

const icons = [Swords, Users, Flame, Handshake, Gem, Crown];

type ManifestoProps = {
  t: Dictionary["values"];
};

export function Manifesto({ t }: ManifestoProps) {
  return (
    <section id="valores" className="section-band">
      <SectionHeading
        className="narrow-shell reveal"
        eyebrow={t.kicker}
        title={t.title}
        description={t.description}
      />

      <div className="site-shell values-grid">
        {t.items.map((pillar, index) => {
          const Icon = icons[index] ?? Swords;

          return (
            <Panel
              as="article"
              key={pillar.title}
              className={`reveal reveal-delay-${(index % 3) + 1}`}
            >
              <div className="card-icon">
                <Icon aria-hidden className="size-5" />
              </div>
              <h3 className="card-title">{pillar.title}</h3>
              <p className="card-copy">{pillar.description}</p>
            </Panel>
          );
        })}
      </div>
    </section>
  );
}
