import type { Dictionary } from "@/content/i18n";

type SiteFooterProps = {
  t: Dictionary["meta"];
};

export function SiteFooter({ t }: SiteFooterProps) {
  return (
    <footer className="pb-10 text-center">
      <p className="font-mono text-xs uppercase text-death-300/70">
        {t.siteName} · {t.footer}
      </p>
    </footer>
  );
}
