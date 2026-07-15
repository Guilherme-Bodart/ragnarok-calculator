import type { Dictionary } from "@/content/i18n";

type SiteHeaderProps = {
  t: Dictionary["nav"];
};

export function SiteHeader({ t }: SiteHeaderProps) {
  const navItems: Array<{ label: string; href: string; external?: boolean }> = [
    { label: t.calculator, href: "/calculator" },
    { label: t.guild, href: "/login" },
  ];

  return (
    <header className="site-header">
      <nav className="site-nav" aria-label={t.aria}>
        {navItems.map((item) => (
          <a
            href={item.href}
            key={item.label}
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
