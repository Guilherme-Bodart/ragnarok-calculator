"use client";

import type { ReactNode } from "react";
import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Boxes, Calculator, Crown, Home } from "lucide-react";

type AppNavbarProps = {
  rightSlot?: ReactNode;
};

const NAV_LINKS = [
  { href: "/", label: "Início", icon: Home, exact: true },
  { href: "/calculator", label: "Calculadora", icon: Calculator, exact: false },
  { href: "/builds", label: "Builds", icon: Boxes, exact: false },
  { href: "/guilds", label: "Guildas", icon: Crown, exact: false },
] as const;

export function AppNavbar({ rightSlot }: AppNavbarProps) {
  const pathname = usePathname() || "/";

  return (
    <header className="sticky top-0 z-40 w-full border-b border-white/[0.08] bg-[#090b10]/85 backdrop-blur-xl">
      <div className="mx-auto flex max-w-[1680px] flex-wrap items-center justify-between gap-3 px-4 py-2.5 sm:px-6">
        {/* Brand */}
        <Link
          href="/"
          className="group flex items-center gap-3 text-left no-underline focus:outline-none"
        >
          <div className="relative flex h-9 w-9 items-center justify-center rounded-lg border border-white/10 bg-[#121620] shadow-inner transition-colors group-hover:border-sky-400/40">
            <Image
              src="/nightmare-reaper.png"
              alt="Nightmare"
              width={28}
              height={28}
              className="object-contain [image-rendering:pixelated]"
            />
          </div>
          <div className="flex flex-col">
            <span className="text-sm font-black uppercase tracking-wider text-slate-100 group-hover:text-sky-300 transition-colors">
              Nightmare
            </span>
            <span className="text-[10px] font-mono text-slate-400">
              Ragnarok Planner & Hub
            </span>
          </div>
        </Link>

        {/* Center Segmented Navigation */}
        <nav
          aria-label="Navegação Principal"
          className="flex items-center gap-1 rounded-xl border border-white/[0.08] bg-[#0d1017] p-1"
        >
          {NAV_LINKS.map((item) => {
            const Icon = item.icon;
            const isActive = item.exact
              ? pathname === item.href
              : pathname === item.href || pathname.startsWith(`${item.href}/`);

            return (
              <Link
                key={item.href}
                href={item.href}
                className={`inline-flex items-center gap-2 rounded-lg px-3 py-1.5 text-xs font-bold transition-all no-underline ${
                  isActive
                    ? "bg-sky-500/20 text-sky-200 border border-sky-400/35 shadow-[0_0_16px_rgba(14,165,233,0.18)]"
                    : "text-slate-400 border border-transparent hover:text-slate-100 hover:bg-white/[0.04]"
                }`}
              >
                <Icon
                  size={14}
                  className={isActive ? "text-sky-400" : "text-slate-400"}
                />
                <span>{item.label}</span>
              </Link>
            );
          })}
        </nav>

        {/* Contextual Right Actions */}
        <div className="flex items-center gap-2">
          {rightSlot ?? (
            <Link
              href="/login"
              className="inline-flex items-center gap-1.5 rounded-lg border border-white/10 bg-[#121620] px-3 py-1.5 text-xs font-bold text-slate-200 hover:border-sky-400/40 hover:text-sky-200 transition-colors no-underline"
            >
              <span>Minha Conta</span>
            </Link>
          )}
        </div>
      </div>
    </header>
  );
}
