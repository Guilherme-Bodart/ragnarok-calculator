import { MessageCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { SectionHeading } from "@/components/ui/section-heading";
import type { Dictionary } from "@/content/i18n";
import { discordInviteUrl } from "./site-links";

type RecruitmentProps = {
  t: Dictionary["recruitment"];
};

export function Recruitment({ t }: RecruitmentProps) {
  return (
    <section id="recrutamento" className="join-section">
      <div className="narrow-shell reveal">
        <SectionHeading
          eyebrow={t.kicker}
          title={t.title}
          description={t.description}
        />
        <div className="cta-row">
          <Button
            href={discordInviteUrl}
            icon={<MessageCircle aria-hidden className="size-4" />}
            rel="noreferrer"
            target="_blank"
          >
            {t.action}
          </Button>
        </div>
      </div>
    </section>
  );
}
