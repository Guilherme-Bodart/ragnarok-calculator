"use client";

import { Gauge, Sparkles } from "lucide-react";
import { useState } from "react";
import type {
  CharacterStatus,
  CalculatorModifierEffects,
} from "@/packages/calculator-core/src";
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

  return (
    <section className="flex flex-col gap-3 p-4 rounded-2xl border border-sky-500/20 bg-[#020612]/85 shadow-[0_12px_36px_rgb(0,0,0,0.5)] backdrop-blur-xl text-xs font-mono text-slate-300 w-full">
      {/* Header & Segmented Switcher */}
      <div className="flex items-center justify-between gap-2 border-b border-sky-500/15 pb-2.5 select-none">
        <div className="flex items-center gap-2">
          <Gauge size={15} className="text-sky-400" />
          <span className="text-[11px] text-sky-100 font-black uppercase tracking-widest font-sans">
            Status & Bônus
          </span>
        </div>

        <div className="inline-flex items-center p-0.5 rounded-lg bg-slate-950/90 border border-slate-800">
          <button
            type="button"
            onClick={() => setActiveTab("combat")}
            className={`px-2.5 py-1 rounded-md text-[10px] font-sans font-bold uppercase tracking-wider transition-all cursor-pointer ${
              activeTab === "combat"
                ? "bg-sky-500/20 text-sky-200 border border-sky-400/35 shadow-sm"
                : "text-slate-400 hover:text-slate-200 border border-transparent"
            }`}
          >
            Status
          </button>
          <button
            type="button"
            onClick={() => setActiveTab("modifiers")}
            className={`px-2.5 py-1 rounded-md text-[10px] font-sans font-bold uppercase tracking-wider transition-all flex items-center gap-1.5 cursor-pointer ${
              activeTab === "modifiers"
                ? "bg-sky-500/20 text-sky-200 border border-sky-400/35 shadow-sm"
                : "text-slate-400 hover:text-slate-200 border border-transparent"
            }`}
          >
            <Sparkles size={10} className="text-amber-400" />
            <span>Modificadores</span>
            <span className="px-1.5 py-0.2 rounded-full bg-slate-900 text-sky-300 font-mono text-[9.5px] border border-slate-700">
              {bonuses.length}
            </span>
          </button>
        </div>
      </div>

      {/* Top Vital & Alt+Q Strip (Always Visible) */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
        <div className="flex flex-col px-2.5 py-1.5 rounded-xl bg-rose-950/25 border border-rose-500/25">
          <span className="text-[9px] font-sans font-bold uppercase tracking-wider text-rose-300/80">
            HP Máximo
          </span>
          <strong className="text-xs font-black text-rose-300 tabular-nums mt-0.5">
            {status.maxHp.toLocaleString()}
          </strong>
        </div>

        <div className="flex flex-col px-2.5 py-1.5 rounded-xl bg-cyan-950/25 border border-cyan-500/25">
          <span className="text-[9px] font-sans font-bold uppercase tracking-wider text-cyan-300/80">
            SP Máximo
          </span>
          <strong className="text-xs font-black text-cyan-300 tabular-nums mt-0.5">
            {status.maxSp.toLocaleString()}
          </strong>
        </div>

        <div className="flex flex-col px-2.5 py-1.5 rounded-xl bg-amber-950/20 border border-amber-500/25">
          <span className="text-[9px] font-sans font-bold uppercase tracking-wider text-amber-300/80">
            Alt+Q ATK
          </span>
          <strong className="text-xs font-black text-amber-300 tabular-nums mt-0.5">
            {status.statusAtk}{" "}
            <span className="text-amber-200/90">+ {equipAtk}</span>
          </strong>
        </div>

        <div className="flex flex-col px-2.5 py-1.5 rounded-xl bg-sky-950/25 border border-sky-500/25">
          <span className="text-[9px] font-sans font-bold uppercase tracking-wider text-sky-300/80">
            Alt+Q MATK
          </span>
          <strong className="text-xs font-black text-sky-300 tabular-nums mt-0.5">
            {status.statusMatk}{" "}
            <span className="text-sky-200/90">+ {equipMatk}</span>
          </strong>
        </div>
      </div>

      {activeTab === "combat" ? (
        <div className="grid grid-cols-4 gap-1.5 text-[10.5px]">
          {/* Row 1: Traits & Core Rates */}
          <StatCell
            label="P.ATK"
            value={status.traitEffects.pAtk}
            highlight={status.traitEffects.pAtk > 0}
          />
          <StatCell
            label="S.MATK"
            value={status.traitEffects.smatk}
            highlight={status.traitEffects.smatk > 0}
          />
          <StatCell
            label="C.RATE"
            value={`${modifierEffects.crit}%`}
            highlight={modifierEffects.crit > 0}
          />
          <StatCell
            label="MATK%"
            value={`${modifierEffects.matkRate}%`}
            highlight={modifierEffects.matkRate > 0}
            accent="sky"
          />

          {/* Row 2: Physical & Crit Rates */}
          <StatCell label="ASPD" value={status.aspd} accent="amber" />
          <StatCell
            label="Melee%"
            value={`${modifierEffects.shortAttackRate}%`}
            highlight={modifierEffects.shortAttackRate > 0}
          />
          <StatCell
            label="Range%"
            value={`${modifierEffects.longAttackRate}%`}
            highlight={modifierEffects.longAttackRate > 0}
          />
          <StatCell
            label="Crit Dmg"
            value={`${modifierEffects.criticalDamageRate}%`}
            highlight={modifierEffects.criticalDamageRate > 0}
            accent="rose"
          />

          {/* Row 3: Accuracy, Flee & Crit */}
          <StatCell label="HIT" value={status.hit} accent="amber" />
          <StatCell
            label="Perf.Hit"
            value={`${modifierEffects.perfectHitRate}%`}
            highlight={modifierEffects.perfectHitRate > 0}
          />
          <StatCell label="FLEE" value={status.flee} />
          <StatCell label="CRIT" value={status.crit} accent="rose" />

          {/* Row 4: Defenses & Trait Resistances */}
          <StatCell label="DEF" value={status.defense} />
          <StatCell label="MDEF" value={status.magicDefense} />
          <StatCell
            label="RES"
            value={status.traitEffects.res}
            highlight={status.traitEffects.res > 0}
          />
          <StatCell
            label="MRES"
            value={status.traitEffects.mres}
            highlight={status.traitEffects.mres > 0}
          />

          {/* Row 5: Cast & After-Cast Delay */}
          <StatCell
            label="Delay%"
            value={`${modifierEffects.afterCastDelayRate}%`}
            highlight={modifierEffects.afterCastDelayRate > 0}
            accent="sky"
          />
          <StatCell
            label="FCT"
            value={`${(modifierEffects.fixedCast / 1000).toFixed(1)}s`}
            highlight={modifierEffects.fixedCast !== 0}
            accent="sky"
          />
          <StatCell
            label="VCT%"
            value={`${modifierEffects.variableCastRate}%`}
            highlight={modifierEffects.variableCastRate > 0}
            accent="sky"
          />
          <StatCell
            label="2D+1I"
            value={dex2int1}
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
                  className={`font-mono font-black select-all shrink-0 ${
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
  value,
  highlight = false,
  accent = "sky",
}: {
  label: string;
  value: string | number;
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

  return (
    <div
      className={`flex items-center justify-between px-2 py-1 rounded-lg border transition-colors ${
        highlight
          ? "bg-sky-950/30 border-sky-500/25"
          : "bg-slate-900/60 border-slate-800/80"
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
        {value}
      </strong>
    </div>
  );
}
