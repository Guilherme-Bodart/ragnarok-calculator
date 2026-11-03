"use client";

import { Minus, Plus, RotateCcw } from "lucide-react";
import {
  getRegularStatIncreaseCost,
  type CharacterStats,
} from "@/packages/calculator-core/src";
import {
  calculatorStatRows,
  calculatorTraitStatRows,
  type VisibleCalculatorStat,
} from "./calculator-character-utils";

type CalculatorCharacterStatsProps = {
  isFourthJob: boolean;
  stats: CharacterStats;
  statBonuses?: Partial<CharacterStats>;
  onStatChange: (stat: VisibleCalculatorStat, rawValue: number) => void;
  onResetStats?: () => void;
};

const STAT_DESCRIPTIONS: Record<string, string> = {
  str: "ATK Físico & Peso",
  agi: "ASPD & Esquiva (Flee)",
  vit: "HP Máx & DEF Suave",
  int: "MATK, SP & Redução VCT",
  dex: "Precisão (Hit), VCT & ATK Dist.",
  luk: "Taxa Crítica & ATK/MATK",
  pow: "P.ATK & ATK Físico",
  sta: "RES (Resistência Física)",
  wis: "MRES (Resistência Mágica)",
  spl: "S.MATK & Dano Mágico",
  con: "Precisão, Esquiva & P.ATK/S.MATK",
  crt: "C.RATE (Bônus Dano Crítico) & H.PLUS",
};

export function CalculatorCharacterStats({
  isFourthJob,
  stats,
  statBonuses,
  onStatChange,
  onResetStats,
}: CalculatorCharacterStatsProps) {
  const renderStatRow = (stat: VisibleCalculatorStat) => {
    const isRegular = stat.group === "regular";
    const minVal = isRegular ? 1 : 0;
    const maxVal = isRegular ? 130 : 110;
    const currentValue = stats[stat.key];
    const statBonus = statBonuses?.[stat.key] ?? 0;

    let cost = 0;
    if (currentValue < maxVal) {
      cost = isRegular ? getRegularStatIncreaseCost(currentValue) : 1;
    }

    const adjustBy = (delta: number) => {
      const next = Math.max(minVal, Math.min(maxVal, currentValue + delta));
      if (next !== currentValue) {
        onStatChange(stat, next);
      }
    };

    return (
      <div
        key={stat.key}
        title={STAT_DESCRIPTIONS[stat.key]}
        className="group flex items-center justify-between gap-2 bg-[#121620]/90 border border-white/[0.08] rounded-lg px-2.5 py-1.5 hover:border-sky-400/40 hover:bg-[#161b26] transition-colors"
      >
        {/* Stat Label + Bonus + Cost/MAX Subtitle */}
        <div className="flex flex-col min-w-0 shrink-0">
          <div className="flex items-center gap-1">
            <label
              className={`text-xs font-black uppercase tracking-wider select-none ${
                isRegular ? "text-sky-200" : "text-amber-200"
              }`}
            >
              {stat.label}
            </label>
            {statBonus !== 0 && (
              <span
                className={`text-[10.5px] font-mono font-bold tabular-nums ${
                  statBonus > 0 ? "text-emerald-400" : "text-rose-400"
                }`}
              >
                {statBonus > 0 ? `+${statBonus}` : statBonus}
              </span>
            )}
          </div>

          <div className="flex items-center gap-1 mt-0.5">
            {currentValue < maxVal ? (
              <span className="text-[9.5px] font-mono text-slate-400 tabular-nums leading-none">
                Custo: <strong className="text-sky-300/90">{cost}</strong>
              </span>
            ) : (
              <span className="px-1 py-0.2 rounded bg-emerald-500/15 border border-emerald-500/30 text-[8.5px] text-emerald-300 font-mono font-black select-none tracking-wider leading-tight">
                MAX
              </span>
            )}
          </div>
        </div>

        {/* Unified Capsule Stepper (-10 | -1 | Input | +1 | +10) — Never Clips */}
        <div className="shrink-0 inline-flex items-center rounded-lg bg-[#090b10] border border-white/10 group-hover:border-white/20 divide-x divide-white/[0.07] overflow-hidden transition-colors">
          <button
            type="button"
            onClick={() => adjustBy(-10)}
            disabled={currentValue <= minVal}
            title="-10"
            className="h-7 px-1.5 shrink-0 flex items-center justify-center text-[9.5px] font-mono font-bold text-slate-500 group-hover:text-slate-300 hover:bg-white/10 hover:text-white disabled:opacity-25 transition-colors cursor-pointer"
          >
            -10
          </button>

          <button
            type="button"
            onClick={() => adjustBy(-1)}
            disabled={currentValue <= minVal}
            title="-1"
            className="w-6 h-7 shrink-0 flex items-center justify-center text-slate-300 hover:bg-white/10 hover:text-white disabled:opacity-25 transition-colors cursor-pointer"
          >
            <Minus size={11} />
          </button>

          <input
            type="number"
            min={minVal}
            max={maxVal}
            value={currentValue}
            onChange={(event) =>
              onStatChange(stat, Number(event.target.value))
            }
            className="w-9 h-7 bg-transparent text-center font-mono font-black text-slate-100 text-xs tabular-nums focus:outline-none focus:bg-sky-950/40 hide-arrows"
          />

          <button
            type="button"
            onClick={() => adjustBy(1)}
            disabled={currentValue >= maxVal}
            title="+1"
            className="w-6 h-7 shrink-0 flex items-center justify-center text-slate-300 hover:bg-white/10 hover:text-white disabled:opacity-25 transition-colors cursor-pointer"
          >
            <Plus size={11} />
          </button>

          <button
            type="button"
            onClick={() => adjustBy(10)}
            disabled={currentValue >= maxVal}
            title="+10"
            className="h-7 px-1.5 shrink-0 flex items-center justify-center text-[9.5px] font-mono font-bold text-slate-500 group-hover:text-slate-300 hover:bg-white/10 hover:text-white disabled:opacity-25 transition-colors cursor-pointer"
          >
            +10
          </button>
        </div>
      </div>
    );
  };

  return (
    <div className="flex flex-col gap-3">
      {onResetStats && (
        <div className="flex items-center justify-between px-1">
          <span className="text-[10.5px] font-bold uppercase tracking-widest text-slate-400">
            Distribuição de Atributos
          </span>
          <button
            type="button"
            onClick={onResetStats}
            className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-[10.5px] font-bold text-slate-300 hover:text-white bg-[#121620] hover:bg-white/10 border border-white/10 transition-colors cursor-pointer"
          >
            <RotateCcw size={11} />
            Resetar Atributos
          </button>
        </div>
      )}

      {isFourthJob ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
          {/* Regular Stats Column */}
          <div className="flex flex-col gap-1.5">
            <span className="text-[9.5px] font-black uppercase tracking-widest text-sky-300/85 pl-1 mb-0.5 truncate">
              Atributos Primários (STR – LUK)
            </span>
            {calculatorStatRows.map(renderStatRow)}
          </div>

          {/* Trait Stats Column */}
          <div className="flex flex-col gap-1.5">
            <span className="text-[9.5px] font-black uppercase tracking-widest text-amber-300/85 pl-1 mb-0.5 truncate">
              Traços 4ª Classe (POW – CRT)
            </span>
            {calculatorTraitStatRows.map(renderStatRow)}
          </div>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
          {calculatorStatRows.map(renderStatRow)}
        </div>
      )}
    </div>
  );
}
