import Image from "next/image";
import { Calculator, MessageCircle, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import type { Dictionary } from "@/content/i18n";
import { ParticleField } from "./particle-field";

type HeroProps = {
  siteName: string;
  t: Dictionary["hero"];
};

export function Hero({ siteName, t }: HeroProps) {
  return (
    <section id="topo" className="hero-section">
      <div className="hero-aura" aria-hidden="true" />
      <ParticleField />

      <div className="site-shell">
        <Image
          src="/nightmare-reaper.png"
          alt={t.imageAlt}
          width={220}
          height={151}
          className="hero-mark pixelated"
          priority
        />

        <p className="hero-kicker reveal">&lt; {t.eyebrow} &gt;</p>
        <h1 className="hero-title reveal reveal-delay-1">{siteName}</h1>
        <p className="hero-motto reveal reveal-delay-2">{t.motto}</p>
        <p className="hero-copy reveal reveal-delay-3">{t.description}</p>

        <div className="cta-row reveal reveal-delay-3">
          <Button
            href="#recrutamento"
            icon={<MessageCircle aria-hidden className="size-4" />}
          >
            {t.primaryAction}
          </Button>
          <Button
            href="#valores"
            variant="secondary"
            icon={<Sparkles aria-hidden className="size-4" />}
          >
            {t.secondaryAction}
          </Button>
          <Button
            href="/calculator"
            variant="secondary"
            icon={<Calculator aria-hidden className="size-4" />}
          >
            {t.calculatorAction}
          </Button>
        </div>
      </div>
    </section>
  );
}
