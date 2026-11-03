"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  ArrowRight,
  Boxes,
  Calculator,
  Clock3,
  Crown,
  Flame,
  Gem,
  ShieldCheck,
  Sparkles,
  Swords,
  Users,
  Zap,
} from "lucide-react";
import {
  defaultLocale,
  dictionaries,
  isLocale,
  type Locale,
} from "@/content/i18n";
import { AppNavbar } from "@/components/site/app-navbar";
import { LanguageSwitcher } from "@/components/site/language-switcher";
import { SpriteStage } from "@/components/site/sprite-stage";
import { PRESET_BUILDS, type GalleryBuildEntry } from "@/components/builds/builds-hub-page";
import { useCalculatorBuildStore } from "@/components/calculator/calculator-build-store";

const storageKey = "nightmare-locale";

function getSavedLocale() {
  const savedLocale = window.localStorage.getItem(storageKey);
  if (savedLocale && isLocale(savedLocale)) {
    return savedLocale;
  }

  const browserLocale = window.navigator.language.slice(0, 2);
  return isLocale(browserLocale) ? browserLocale : defaultLocale;
}

export function NightmareLanding() {
  const router = useRouter();
  const loadBuild = useCalculatorBuildStore((s) => s.loadBuild);
  const renameBuild = useCalculatorBuildStore((s) => s.renameBuild);
  const [locale, setLocale] = useState<Locale>(defaultLocale);

  useEffect(() => {
    queueMicrotask(() => {
      setLocale(getSavedLocale());
    });
  }, []);

  useEffect(() => {
    document.documentElement.lang = locale === "pt" ? "pt-BR" : locale;
  }, [locale]);

  function handleLocaleChange(nextLocale: Locale) {
    setLocale(nextLocale);
    window.localStorage.setItem(storageKey, nextLocale);
  }

  function handleQuickImportPreset(entry: GalleryBuildEntry) {
    loadBuild(entry.payload);
    renameBuild(entry.name);
    router.push("/calculator");
  }

  const t = dictionaries[locale];
  const featuredPresets = PRESET_BUILDS.slice(0, 3);

  return (
    <div className="min-h-screen bg-[#090b10] text-slate-100 flex flex-col relative overflow-x-hidden">
      {/* Raycast-style subtle radial spotlight + grid */}
      <div
        aria-hidden="true"
        className="pointer-events-none fixed inset-0 z-0"
        style={{
          background:
            "radial-gradient(circle at 50% -10%, rgba(56, 189, 248, 0.14), transparent 45rem), radial-gradient(circle at 85% 20%, rgba(99, 102, 241, 0.08), transparent 36rem)",
        }}
      />

      <AppNavbar
        rightSlot={
          <div className="flex items-center gap-2">
            <Link
              href="/login"
              className="inline-flex items-center gap-1.5 rounded-lg border border-white/10 bg-[#121620] hover:bg-white/10 px-3 py-1.5 text-xs font-bold text-slate-200 transition-colors no-underline"
            >
              <span>Entrar</span>
            </Link>
            <Link
              href="/calculator"
              className="inline-flex items-center gap-1.5 rounded-lg bg-sky-500/20 hover:bg-sky-500/30 border border-sky-400/40 px-3.5 py-1.5 text-xs font-bold text-sky-100 transition-colors no-underline"
            >
              <span>Abrir Planner</span>
              <ArrowRight size={13} />
            </Link>
          </div>
        }
      />

      <LanguageSwitcher
        locale={locale}
        onLocaleChange={handleLocaleChange}
        t={t.language}
      />

      <main className="relative z-10 mx-auto w-full max-w-[1440px] flex-1 px-4 py-12 sm:px-6 flex flex-col gap-16">
        {/* RAYCAST STYLE HERO */}
        <section className="flex flex-col items-center text-center gap-6 pt-4">
          <div className="inline-flex items-center gap-2.5 rounded-full border border-white/10 bg-[#0d1017]/90 px-4 py-1.5 text-xs font-mono text-sky-300 shadow-lg">
            <Sparkles size={13} className="text-sky-400" />
            <span>Engine rAthena 4ª Classe • Simulador & Hub de Builds</span>
          </div>

          <div className="flex flex-col items-center gap-4 max-w-3xl">
            <Image
              src="/nightmare-reaper.png"
              alt={t.hero.imageAlt}
              width={116}
              height={80}
              className="object-contain [image-rendering:pixelated] drop-shadow-[0_12px_28px_rgba(14,165,233,0.3)]"
              priority
            />
            <h1 className="text-4xl sm:text-6xl font-black tracking-tight text-white leading-[1.05]">
              Planeje Builds, Simule Dano e{" "}
              <span className="bg-gradient-to-r from-sky-300 via-cyan-200 to-indigo-300 bg-clip-text text-transparent">
                Domine o Endgame.
              </span>
            </h1>
            <p className="text-sm sm:text-base text-slate-400 max-w-2xl leading-relaxed">
              Um ecossistema completo inspirado em{" "}
              <strong className="text-slate-200">Maxroll D4</strong> e{" "}
              <strong className="text-slate-200">PoE2 Planner</strong>: teste equipamentos, cartas e encantamentos em tempo real, importe builds prontas em 1 clique e organize sua guilda.
            </p>
          </div>

          {/* Primary Action Row */}
          <div className="flex flex-wrap items-center justify-center gap-3 pt-2">
            <Link
              href="/calculator"
              className="inline-flex items-center gap-2.5 rounded-xl bg-sky-500 hover:bg-sky-400 text-[#090b10] font-black text-xs sm:text-sm px-6 py-3 shadow-[0_0_30px_rgba(14,165,233,0.35)] transition-all no-underline"
            >
              <Calculator size={16} />
              <span>Abrir Calculadora & Planner</span>
              <ArrowRight size={15} />
            </Link>

            <Link
              href="/builds"
              className="inline-flex items-center gap-2 rounded-xl border border-white/15 bg-[#0d1017] hover:bg-[#141924] hover:border-sky-400/40 text-slate-100 font-bold text-xs sm:text-sm px-5 py-3 transition-all no-underline"
            >
              <Boxes size={16} className="text-sky-400" />
              <span>Explorar Galeria de Builds</span>
            </Link>

            <Link
              href="/guilds"
              className="inline-flex items-center gap-2 rounded-xl border border-white/10 bg-[#0d1017]/80 hover:bg-[#141924] text-slate-300 hover:text-white font-bold text-xs sm:text-sm px-5 py-3 transition-all no-underline"
            >
              <Crown size={16} className="text-amber-400" />
              <span>Workspace de Guildas</span>
            </Link>
          </div>
        </section>

        {/* BENTO GRID: THE 3 CORE WORKSPACES */}
        <section className="grid grid-cols-1 lg:grid-cols-12 gap-5">
          {/* BENTO 1 (7 COLS): MAXROLL D4 PLANNER & CALCULATOR PREVIEW */}
          <div className="lg:col-span-7 flex flex-col justify-between gap-6 rounded-2xl border border-white/10 bg-gradient-to-br from-[#121722] via-[#0d1017] to-[#090b10] p-6 shadow-2xl">
            <div className="flex flex-col gap-2">
              <div className="inline-flex items-center gap-2 text-[11px] font-mono uppercase tracking-widest text-sky-400">
                <Calculator size={14} />
                <span>Cockpit 3 Colunas • Tempo Real</span>
              </div>
              <h2 className="text-xl sm:text-2xl font-black text-white">
                Planner de Personagem & Simulador rAthena
              </h2>
              <p className="text-xs sm:text-sm text-slate-400 leading-relaxed">
                Altere atributos (`STR`..`LUK`), traits de 4ª classe (`POW`, `SPL`, `CON`, `CRT`), refinos e cartas vendo o impacto imediato com indicadores visuais de ganho (`+Delta` verde) e detalhamento completo da fórmula.
              </p>
            </div>

            {/* Interactive Mock Preview of the Calculator */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 rounded-xl border border-white/10 bg-[#090b10]/90 p-4">
              {/* Mock Paperdoll Slot */}
              <div className="flex flex-col justify-between gap-2.5 rounded-xl border border-white/15 bg-[#121620] p-3">
                <div className="flex items-center gap-2.5">
                  <div className="h-9 w-9 rounded-lg border border-amber-400/50 bg-[#090b10] flex items-center justify-center text-amber-300 font-mono text-xs font-black">
                    +12
                  </div>
                  <div className="flex flex-col min-w-0">
                    <span className="text-[9px] font-extrabold uppercase tracking-wider text-slate-400">
                      TOPO • GRAU [A]
                    </span>
                    <strong className="text-xs font-bold text-slate-100 truncate">
                      Laço da Celine [1]
                    </strong>
                  </div>
                </div>
                <div className="flex items-center gap-1.5 border-t border-white/[0.08] pt-2">
                  <span className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded bg-sky-500/15 border border-sky-400/30 text-[9.5px] font-mono font-semibold text-sky-200">
                    <Gem size={9} className="text-sky-400" />
                    Vesper
                  </span>
                  <span className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded bg-amber-500/15 border border-amber-400/30 text-[9.5px] font-mono font-semibold text-amber-200">
                    <Sparkles size={9} className="text-amber-400" />
                    Spell 5
                  </span>
                </div>
              </div>

              {/* Mock Live Damage Counter with Delta */}
              <div className="flex flex-col justify-between rounded-xl border border-sky-500/30 bg-gradient-to-br from-sky-950/40 via-[#121620] to-[#090b10] p-3">
                <div className="flex items-center justify-between">
                  <span className="text-[10px] font-black uppercase tracking-wider text-sky-300">
                    Dano Total da Skill
                  </span>
                  <span className="text-[10px] font-mono text-emerald-300 bg-emerald-500/15 border border-emerald-400/35 px-1.5 py-0.5 rounded font-bold">
                    +48.250
                  </span>
                </div>
                <strong className="text-2xl font-black font-mono text-emerald-300 tabular-nums my-1">
                  1.428.900
                </strong>
                <span className="text-[10px] font-mono text-slate-400">
                  Fórmula rAthena Validada • 7 Hits
                </span>
              </div>
            </div>

            <div className="flex items-center justify-between pt-1">
              <div className="flex flex-wrap gap-2 text-[11px] font-mono text-slate-400">
                <span className="px-2 py-0.5 rounded bg-white/[0.04] border border-white/10">
                  40 Classes c/ Sprites
                </span>
                <span className="px-2 py-0.5 rounded bg-white/[0.04] border border-white/10">
                  Cartas & Encantamentos
                </span>
                <span className="px-2 py-0.5 rounded bg-white/[0.04] border border-white/10">
                  Breakdown Completo
                </span>
              </div>

              <Link
                href="/calculator"
                className="inline-flex items-center gap-1.5 text-xs font-bold text-sky-300 hover:text-sky-200 no-underline"
              >
                <span>Ir para Calculadora</span>
                <ArrowRight size={14} />
              </Link>
            </div>
          </div>

          {/* BENTO 2 (5 COLS): POE2 STYLE BUILDS HUB & 1-CLICK IMPORT */}
          <div className="lg:col-span-5 flex flex-col justify-between gap-4 rounded-2xl border border-white/10 bg-[#0d1017] p-6 shadow-2xl">
            <div className="flex items-center justify-between gap-2">
              <div className="flex flex-col gap-1">
                <div className="inline-flex items-center gap-2 text-[11px] font-mono uppercase tracking-widest text-amber-400">
                  <Flame size={14} />
                  <span>PoE2 / Mobalytics Style</span>
                </div>
                <h2 className="text-xl font-black text-white">
                  Importe uma Build em 1 Clique
                </h2>
              </div>
              <Link
                href="/builds"
                className="text-xs font-bold text-sky-300 hover:text-sky-200 no-underline shrink-0"
              >
                Ver todas ({PRESET_BUILDS.length}) →
              </Link>
            </div>

            <div className="flex flex-col gap-2.5">
              {featuredPresets.map((preset) => (
                <div
                  key={preset.id}
                  onClick={() => handleQuickImportPreset(preset)}
                  className="group flex items-center justify-between gap-3 rounded-xl border border-white/10 bg-[#121620] hover:border-sky-400/45 hover:bg-[#161c28] p-3 transition-all cursor-pointer"
                >
                  <div className="flex items-center gap-3 min-w-0">
                    <div className="h-12 w-12 shrink-0 rounded-lg border border-white/10 bg-[#090b10] flex items-center justify-center overflow-hidden">
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img
                        src={`/sprites/classes/${preset.classId}.png`}
                        alt={preset.name}
                        className="h-11 w-auto object-contain [image-rendering:pixelated] group-hover:scale-105 transition-transform"
                      />
                    </div>
                    <div className="flex flex-col min-w-0">
                      <span className="text-[10px] font-mono uppercase tracking-wider text-sky-400 font-bold">
                        {preset.classId.replace(/_/g, " ")} • Lv.
                        {preset.payload.character.baseLevel}/
                        {preset.payload.character.jobLevel}
                      </span>
                      <strong className="text-xs font-bold text-slate-100 truncate">
                        {preset.name}
                      </strong>
                      <span className="text-[10.5px] font-mono text-slate-400 truncate">
                        Skill: {preset.payload.attack.selectedSkillId} Lv.
                        {preset.payload.attack.skillLevel}
                      </span>
                    </div>
                  </div>

                  <span className="shrink-0 inline-flex items-center gap-1 rounded-lg bg-sky-500/15 group-hover:bg-sky-500/30 border border-sky-400/35 px-2.5 py-1.5 text-[11px] font-bold text-sky-200 transition-colors">
                    <span>Testar</span>
                    <ArrowRight size={12} />
                  </span>
                </div>
              ))}
            </div>

            <Link
              href="/builds"
              className="w-full inline-flex items-center justify-center gap-2 rounded-xl border border-white/10 bg-[#121620] hover:bg-white/10 py-2.5 text-xs font-bold text-slate-200 transition-colors no-underline"
            >
              <Boxes size={14} className="text-sky-400" />
              <span>Abrir Página Completa de Builds (/builds)</span>
            </Link>
          </div>
        </section>

        {/* GUILD SAAS WORKSPACE SHOWCASE */}
        <section className="rounded-2xl border border-white/10 bg-gradient-to-br from-[#0d1017] via-[#0b0e15] to-[#090b10] p-6 sm:p-8 shadow-2xl">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
            <div className="lg:col-span-5 flex flex-col gap-4">
              <div className="inline-flex items-center gap-2 text-[11px] font-mono uppercase tracking-widest text-amber-400">
                <Crown size={14} />
                <span>{t.agenda.kicker}</span>
              </div>
              <h2 className="text-2xl sm:text-3xl font-black text-white leading-tight">
                {t.agenda.title}
              </h2>
              <p className="text-xs sm:text-sm text-slate-400 leading-relaxed">
                {t.agenda.description}
              </p>

              <div className="flex flex-wrap gap-2 pt-1">
                {t.agenda.features.map((feature) => (
                  <span
                    key={feature}
                    className="inline-flex items-center gap-1.5 rounded-lg border border-white/10 bg-[#121620] px-3 py-1 text-xs font-semibold text-slate-200"
                  >
                    <ShieldCheck size={13} className="text-sky-400" />
                    <span>{feature}</span>
                  </span>
                ))}
              </div>

              <div className="pt-2">
                <Link
                  href="/guilds"
                  className="inline-flex items-center gap-2 rounded-xl bg-amber-500/20 hover:bg-amber-500/30 border border-amber-400/40 px-5 py-2.5 text-xs font-bold text-amber-100 transition-colors no-underline"
                >
                  <Crown size={14} className="text-amber-400" />
                  <span>{t.agenda.action}</span>
                  <ArrowRight size={14} />
                </Link>
              </div>
            </div>

            {/* Clean Modern SaaS Preview Table */}
            <div className="lg:col-span-7 rounded-xl border border-white/10 bg-[#090b10] p-4 sm:p-5 flex flex-col gap-4">
              <div className="flex items-center justify-between border-b border-white/10 pb-3">
                <div className="flex items-center gap-2">
                  <Clock3 size={15} className="text-sky-400" />
                  <strong className="text-xs font-black uppercase tracking-wider text-slate-100">
                    {t.agenda.boardTitle}
                  </strong>
                </div>
                <span className="text-[11px] font-mono text-emerald-400 bg-emerald-500/10 border border-emerald-400/25 px-2 py-0.5 rounded-md">
                  {t.agenda.boardMeta}
                </span>
              </div>

              <div className="grid grid-cols-1 gap-2">
                {t.agenda.mvpRows.map((row) => (
                  <div
                    key={`${row.mvp}-${row.map}`}
                    className="flex items-center justify-between gap-3 rounded-lg border border-white/[0.06] bg-[#121620] px-3.5 py-2.5"
                  >
                    <div className="flex items-center gap-3 min-w-0">
                      <Swords size={14} className="text-rose-400 shrink-0" />
                      <div className="flex flex-col min-w-0">
                        <strong className="text-xs font-bold text-slate-100 truncate">
                          {row.mvp}
                        </strong>
                        <span className="text-[10px] font-mono text-slate-400">
                          {row.map}
                        </span>
                      </div>
                    </div>

                    <div className="flex items-center gap-3 shrink-0">
                      <time className="text-xs font-mono font-bold text-slate-200">
                        {row.time}
                      </time>
                      <span className="px-2 py-0.5 rounded text-[10px] font-mono font-bold bg-sky-500/15 text-sky-300 border border-sky-400/30">
                        {row.status}
                      </span>
                    </div>
                  </div>
                ))}
              </div>

              <div className="grid grid-cols-3 gap-2 pt-1 text-center">
                <div className="rounded-lg border border-white/[0.06] bg-[#0d1017] p-2.5">
                  <span className="block text-[10px] text-slate-400">
                    {t.agenda.sideAlerts}
                  </span>
                  <strong className="text-xs font-bold text-slate-100">
                    {t.agenda.sideAlertValue}
                  </strong>
                </div>
                <div className="rounded-lg border border-white/[0.06] bg-[#0d1017] p-2.5">
                  <span className="block text-[10px] text-slate-400">
                    {t.agenda.sideEvent}
                  </span>
                  <strong className="text-xs font-bold text-slate-100">
                    {t.agenda.sideEventValue}
                  </strong>
                </div>
                <div className="rounded-lg border border-white/[0.06] bg-[#0d1017] p-2.5">
                  <span className="block text-[10px] text-slate-400">
                    {t.agenda.sideAccess}
                  </span>
                  <strong className="text-xs font-bold text-slate-100">
                    {t.agenda.sideAccessValue}
                  </strong>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* PILLARS / MANIFESTO COMPACT GRID */}
        <section className="flex flex-col gap-5">
          <div className="flex flex-col gap-1">
            <span className="text-[11px] font-mono uppercase tracking-widest text-sky-400">
              {t.values.kicker}
            </span>
            <h2 className="text-xl sm:text-2xl font-black text-white">
              {t.values.title}
            </h2>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {t.values.items.map((pillar, index) => {
              const Icons = [Swords, Users, Flame, Zap, Gem, Crown];
              const Icon = Icons[index] ?? Swords;
              return (
                <article
                  key={pillar.title}
                  className="flex flex-col gap-2 rounded-xl border border-white/10 bg-[#0d1017] p-5 hover:border-white/20 transition-colors"
                >
                  <div className="h-8 w-8 rounded-lg bg-sky-500/15 border border-sky-400/30 flex items-center justify-center text-sky-300">
                    <Icon size={15} />
                  </div>
                  <h3 className="text-sm font-bold text-slate-100">
                    {pillar.title}
                  </h3>
                  <p className="text-xs text-slate-400 leading-relaxed">
                    {pillar.description}
                  </p>
                </article>
              );
            })}
          </div>
        </section>
      </main>

      <footer className="relative z-10 border-t border-white/[0.08] bg-[#090b10] py-6 px-4 text-center text-xs text-slate-500">
        <span>
          {t.meta.siteName} — {t.meta.footer}
        </span>
      </footer>

      <SpriteStage />
    </div>
  );
}
