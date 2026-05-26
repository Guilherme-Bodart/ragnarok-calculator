import type { Dictionary } from "@/content/i18n";

type SiteHeaderProps = {
  t: Dictionary["nav"];
};

export function SiteHeader({ t }: SiteHeaderProps) {
  const navItems = [
    { label: t.values, href: "#valores" },
    { label: t.agenda, href: "#agenda" },
    { label: t.calculator, href: "/calculator" },
    { label: t.discord, href: "#recrutamento" },
  ];

  return (
    <header className="site-header">
      <nav className="site-nav" aria-label={t.aria}>
        {navItems.map((item) => (
          <a key={item.href} href={item.href}>
            {item.label}
          </a>
        ))}
      </nav>
    </header>
  );
}
