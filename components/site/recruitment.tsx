import { MessageCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import type { Dictionary } from "@/content/i18n";

type RecruitmentProps = {
  t: Dictionary["recruitment"];
};

export function Recruitment({ t }: RecruitmentProps) {
  return (
    <section id="recrutamento" className="join-section">
      <div className="narrow-shell reveal">
        <div className="ornament">{t.kicker}</div>
        <h2 className="section-title">{t.title}</h2>
        <p className="section-copy">{t.description}</p>
        <div className="cta-row">
          <Button href="#" icon={<MessageCircle aria-hidden className="size-4" />}>
            {t.action}
          </Button>
        </div>
      </div>
    </section>
  );
}
