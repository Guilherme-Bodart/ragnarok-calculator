import type { Dictionary } from "@/content/i18n";
import { discordInviteUrl } from "./site-links";

type SiteHeaderProps = {
  t: Dictionary["nav"];
};

export function SiteHeader({ t }: SiteHeaderProps) {
  const navItems = [
    { label: t.calculator, href: "/calculator" },
    { label: t.guild, href: "/login" },
    { label: t.discord, href: discordInviteUrl, external: true },
  ];

  return (
    <header className="site-header">
      <nav className="site-nav" aria-label={t.aria}>
        {navItems.map((item) => (
          <a
            href={item.href}
            key={item.href}
            rel={item.external ? "noreferrer" : undefined}
            target={item.external ? "_blank" : undefined}
          >
            {item.label}
          </a>
        ))}
      </nav>
    </header>
  );
}
