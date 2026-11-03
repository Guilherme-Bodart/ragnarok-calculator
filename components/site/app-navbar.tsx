"use client";

import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Boxes, Calculator, Crown, Home, User } from "lucide-react";

const NAV_LINKS = [
  { href: "/", label: "Início", icon: Home, exact: true },
  { href: "/calculator", label: "Calculadora", icon: Calculator, exact: false },
  { href: "/builds", label: "Builds", icon: Boxes, exact: false },
  { href: "/guilds", label: "Guildas", icon: Crown, exact: false },
] as const;

export function AppNavbar() {
  const pathname = usePathname() || "/";

  return (
    <header className="sticky top-0 z-40 h-14 w-full border-b border-white/[0.08] bg-[#090b10]/90 backdrop-blur-xl select-none">
      <div className="mx-auto grid h-full max-w-[1760px] grid-cols-[1fr_auto_1fr] items-center gap-4 px-4 sm:px-6">
        {/* Left: Brand (Always identical) */}
        <div className="flex items-center justify-start min-w-0">
          <Link
            href="/"
            className="group inline-flex items-center gap-2.5 text-left no-underline focus:outline-none"
          >
            <div className="relative flex h-8 w-8 shrink-0 items-center justify-center rounded-lg border border-white/10 bg-[#121620] transition-colors group-hover:border-sky-400/40">
              <Image
                src="/nightmare-reaper.png"
                alt="Nightmare"
                width={24}
                height={24}
                className="object-contain [image-rendering:pixelated]"
              />
            </div>
            <div className="hidden sm:flex flex-col leading-none">
              <span className="text-xs font-black uppercase tracking-wider text-slate-100 group-hover:text-sky-300 transition-colors">
                Nightmare
              </span>
              <span className="text-[9.5px] font-mono text-slate-400 mt-0.5">
                Ragnarok Hub
              </span>
            </div>
          </Link>
        </div>

        {/* Center: Locked Geometric Center Navigation */}
        <nav
          aria-label="Navegação Principal"
          className="flex items-center justify-center gap-1 rounded-xl border border-white/[0.08] bg-[#0d1017] p-1"
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
                className={`inline-flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-bold transition-colors no-underline whitespace-nowrap ${
                  isActive
                    ? "bg-sky-500/20 text-sky-200 border border-sky-400/35 shadow-[0_0_14px_rgba(14,165,233,0.16)]"
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

        {/* Right: Fixed Account Button (Never shifts across pages) */}
        <div className="flex items-center justify-end min-w-0">
          <Link
            href="/login"
            className={`inline-flex items-center gap-1.5 rounded-lg border px-3 py-1.5 text-xs font-bold transition-colors no-underline whitespace-nowrap ${
              pathname.startsWith("/login") || pathname.startsWith("/profile")
                ? "bg-sky-500/20 text-sky-200 border-sky-400/35"
                : "border-white/10 bg-[#121620] text-slate-200 hover:border-sky-400/40 hover:text-sky-200"
            }`}
          >
            <User size={13} className="text-sky-400" />
            <span className="hidden sm:inline">Minha Conta</span>
          </Link>
        </div>
      </div>
    </header>
  );
}
