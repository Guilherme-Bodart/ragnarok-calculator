"use client";

import { Gauge, Sparkles } from "lucide-react";
import { useState } from "react";
import type {
  CharacterStatus,
  CalculatorModifierEffects,
} from "@/packages/calculator-core/src";
import { AnimatedNumber } from "@/components/ui/animated-number";
import { useDerivedStatsBonuses } from "./use-derived-stats-bonuses";

type CalculatorDerivedStatsProps = {
  status: CharacterStatus;
  modifierEffects: CalculatorModifierEffects;
};

export function CalculatorDerivedStats({
  status,
  modifierEffects,
}: CalculatorDerivedStatsProps) {
  const [activeTab, setActiveTab] = useState<"combat" | "modifiers">("combat");

  const dex = status.effectiveStats.dex || 0;
  const int = status.effectiveStats.int || 0;
  const dex2int1 = dex * 2 + int;

  const bonuses = useDerivedStatsBonuses(modifierEffects, status);
  const equipAtk = status.atk - status.statusAtk;
  const equipMatk = status.matk - status.statusMatk;
  const fctSeconds = Number((modifierEffects.fixedCast / 1000).toFixed(1));

  return (
    <section className="flex flex-col gap-3.5 p-4 rounded-xl border border-sky-500/20 bg-[#020612]/85 shadow-xl backdrop-blur-xl text-xs font-mono text-slate-300 w-full">
      {/* Header & Segmented Switcher */}
      <div className="flex items-center justify-between gap-2 border-b border-sky-500/15 pb-3 select-none">
        <div className="flex items-center gap-2">
          <Gauge size={16} className="text-sky-400 shrink-0" />
          <span className="text-xs text-sky-100 font-black uppercase tracking-widest font-sans">
            Status & Bônus
          </span>
        </div>

        <div className="inline-flex items-center gap-1 p-1 rounded-lg bg-slate-950/90 border border-slate-800/90">
          <button
            type="button"
            onClick={() => setActiveTab("combat")}
            className={`px-2.5 py-1 rounded-md text-[10px] font-sans font-bold uppercase tracking-wider transition-colors cursor-pointer border ${
              activeTab === "combat"
                ? "bg-sky-500/18 text-sky-100 border-sky-400/35"
                : "text-slate-400 hover:text-slate-200 border-transparent hover:bg-slate-800/50"
            }`}
          >
            Status
          </button>
          <button
            type="button"
            onClick={() => setActiveTab("modifiers")}
            className={`px-2.5 py-1 rounded-md text-[10px] font-sans font-bold uppercase tracking-wider transition-colors flex items-center gap-1.5 cursor-pointer border ${
              activeTab === "modifiers"
                ? "bg-sky-500/18 text-sky-100 border-sky-400/35"
                : "text-slate-400 hover:text-slate-200 border-transparent hover:bg-slate-800/50"
            }`}
          >
            <Sparkles size={10} className="text-amber-400 shrink-0" />
            <span>Modificadores</span>
            <span className="px-1.5 py-0.5 rounded bg-slate-900 text-sky-300 font-mono text-[9.5px] leading-none border border-slate-700/80 tabular-nums">
              {bonuses.length}
            </span>
          </button>
        </div>
      </div>

      {/* Top Vital & Alt+Q Strip (Always Visible) */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
        <div className="flex flex-col px-3 py-2 rounded-lg bg-rose-950/25 border border-rose-500/25">
          <span className="text-[9.5px] font-sans font-bold uppercase tracking-wider text-rose-300/85">
            HP Máximo
          </span>
          <strong className="text-xs font-black text-rose-300 tabular-nums mt-0.5">
            <AnimatedNumber value={status.maxHp} duration={240} />
          </strong>
        </div>

        <div className="flex flex-col px-3 py-2 rounded-lg bg-cyan-950/25 border border-cyan-500/25">
          <span className="text-[9.5px] font-sans font-bold uppercase tracking-wider text-cyan-300/85">
            SP Máximo
          </span>
          <strong className="text-xs font-black text-cyan-300 tabular-nums mt-0.5">
            <AnimatedNumber value={status.maxSp} duration={240} />
          </strong>
        </div>

        <div className="flex flex-col px-3 py-2 rounded-lg bg-amber-950/20 border border-amber-500/25">
          <span className="text-[9.5px] font-sans font-bold uppercase tracking-wider text-amber-300/85">
            Alt+Q ATK
          </span>
          <strong className="text-xs font-black text-amber-300 tabular-nums mt-0.5">
            <AnimatedNumber value={status.statusAtk} duration={220} />{" "}
            <span className="text-amber-200/90">
              + <AnimatedNumber value={equipAtk} duration={220} />
            </span>
          </strong>
        </div>

        <div className="flex flex-col px-3 py-2 rounded-lg bg-sky-950/25 border border-sky-500/25">
          <span className="text-[9.5px] font-sans font-bold uppercase tracking-wider text-sky-300/85">
            Alt+Q MATK
          </span>
          <strong className="text-xs font-black text-sky-300 tabular-nums mt-0.5">
            <AnimatedNumber value={status.statusMatk} duration={220} />{" "}
            <span className="text-sky-200/90">
              + <AnimatedNumber value={equipMatk} duration={220} />
            </span>
          </strong>
        </div>
      </div>

      {activeTab === "combat" ? (
        /* Unified Matrix Grid — eliminates 20 nested cell borders */
        <div className="grid grid-cols-4 gap-px rounded-xl border border-slate-800/85 bg-slate-800/55 overflow-hidden text-[10.5px]">
          {/* Row 1: Traits & Core Rates */}
          <StatCell
            label="P.ATK"
            numericValue={status.traitEffects.pAtk}
            highlight={status.traitEffects.pAtk > 0}
          />
          <StatCell
            label="S.MATK"
            numericValue={status.traitEffects.smatk}
            highlight={status.traitEffects.smatk > 0}
          />
          <StatCell
            label="C.RATE"
            numericValue={modifierEffects.crit}
            suffix="%"
            highlight={modifierEffects.crit > 0}
          />
          <StatCell
            label="MATK%"
            numericValue={modifierEffects.matkRate}
            suffix="%"
            highlight={modifierEffects.matkRate > 0}
            accent="sky"
          />

          {/* Row 2: Physical & Crit Rates */}
          <StatCell
            label="ASPD"
            numericValue={status.aspd}
            decimals={Number.isInteger(status.aspd) ? 0 : 2}
            formatLocale={false}
            accent="amber"
          />
          <StatCell
            label="Melee%"
            numericValue={modifierEffects.shortAttackRate}
            suffix="%"
            highlight={modifierEffects.shortAttackRate > 0}
          />
          <StatCell
            label="Range%"
            numericValue={modifierEffects.longAttackRate}
            suffix="%"
            highlight={modifierEffects.longAttackRate > 0}
          />
          <StatCell
            label="Crit Dmg"
            numericValue={modifierEffects.criticalDamageRate}
            suffix="%"
            highlight={modifierEffects.criticalDamageRate > 0}
            accent="rose"
          />

          {/* Row 3: Accuracy, Flee & Crit */}
          <StatCell label="HIT" numericValue={status.hit} accent="amber" />
          <StatCell
            label="Perf.Hit"
            numericValue={modifierEffects.perfectHitRate}
            suffix="%"
            highlight={modifierEffects.perfectHitRate > 0}
          />
          <StatCell label="FLEE" numericValue={status.flee} />
          <StatCell label="CRIT" numericValue={status.crit} accent="rose" />

          {/* Row 4: Defenses & Trait Resistances */}
          <StatCell label="DEF" numericValue={status.defense} />
          <StatCell label="MDEF" numericValue={status.magicDefense} />
          <StatCell
            label="RES"
            numericValue={status.traitEffects.res}
            highlight={status.traitEffects.res > 0}
          />
          <StatCell
            label="MRES"
            numericValue={status.traitEffects.mres}
            highlight={status.traitEffects.mres > 0}
          />

          {/* Row 5: Cast & After-Cast Delay */}
          <StatCell
            label="Delay%"
            numericValue={modifierEffects.afterCastDelayRate}
            suffix="%"
            highlight={modifierEffects.afterCastDelayRate > 0}
            accent="sky"
          />
          <StatCell
            label="FCT"
            numericValue={fctSeconds}
            decimals={1}
            formatLocale={false}
            suffix="s"
            highlight={modifierEffects.fixedCast !== 0}
            accent="sky"
          />
          <StatCell
            label="VCT%"
            numericValue={modifierEffects.variableCastRate}
            suffix="%"
            highlight={modifierEffects.variableCastRate > 0}
            accent="sky"
          />
          <StatCell
            label="2D+1I"
            numericValue={dex2int1}
            highlight={dex2int1 >= 530}
            accent="emerald"
          />
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-1.5 max-h-[195px] overflow-y-auto custom-scrollbar pr-1">
          {bonuses.map((bonus, index) => {
            const spaceIndex = bonus.indexOf(" ");
            const value =
              spaceIndex !== -1 ? bonus.substring(0, spaceIndex) : "";
            const label =
              spaceIndex !== -1 ? bonus.substring(spaceIndex + 1) : bonus;
            const isNegative = value.startsWith("-");
            const isIgnore = label.includes("Ignora");

            return (
              <div
                key={`${label}-${index}`}
                className="flex justify-between items-center px-2.5 py-1.5 rounded-lg bg-slate-900/75 border border-slate-800/80 hover:border-sky-500/30 text-[10.5px]"
              >
                <span
                  className="text-slate-300 select-all truncate mr-2 font-sans font-medium"
                  title={label}
                >
                  {label}
                </span>
                <strong
                  className={`font-mono font-black select-all shrink-0 tabular-nums ${
                    isNegative
                      ? "text-rose-400"
                      : isIgnore
                        ? "text-amber-300"
                        : "text-sky-300"
                  }`}
                >
                  {value}
                </strong>
              </div>
            );
          })}
          {bonuses.length === 0 && (
            <div className="col-span-2 text-center py-8 text-slate-500 italic font-sans text-xs border border-dashed border-slate-800 rounded-xl">
              Nenhum modificador extra de equipamento, carta ou buff ativo.
            </div>
          )}
        </div>
      )}
    </section>
  );
}

function StatCell({
  label,
  numericValue,
  decimals = 0,
  suffix = "",
  formatLocale = true,
  highlight = false,
  accent = "sky",
}: {
  label: string;
  numericValue: number;
  decimals?: number;
  suffix?: string;
  formatLocale?: boolean;
  highlight?: boolean;
  accent?: "sky" | "amber" | "rose" | "emerald";
}) {
  const accentColor =
    accent === "amber"
      ? "text-amber-300"
      : accent === "rose"
        ? "text-rose-300"
        : accent === "emerald"
          ? "text-emerald-300"
          : "text-sky-300";

  const highlightSurface =
    accent === "amber"
      ? "bg-amber-950/25"
      : accent === "rose"
        ? "bg-rose-950/25"
        : accent === "emerald"
          ? "bg-emerald-950/25"
          : "bg-sky-950/30";

  return (
    <div
      className={`flex items-center justify-between px-2.5 py-2 transition-colors ${
        highlight ? highlightSurface : "bg-slate-950/85 hover:bg-slate-900/85"
      }`}
    >
      <span className="text-[9.5px] text-slate-400 font-sans font-semibold">
        {label}
      </span>
      <strong
        className={`text-[10.5px] font-mono font-bold tabular-nums ${
          highlight ? accentColor : "text-slate-200"
        }`}
      >
        <AnimatedNumber
          value={numericValue}
          decimals={decimals}
          suffix={suffix}
          formatLocale={formatLocale}
          duration={220}
        />
      </strong>
    </div>
  );
}
