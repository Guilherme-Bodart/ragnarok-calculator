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

    // Calculate cost for next point
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
        className="flex items-center justify-between gap-2 bg-slate-900/65 border border-slate-800/90 rounded-xl px-3 py-2 shadow-sm hover:border-sky-500/35 hover:bg-slate-900/90 transition-all"
      >
        {/* Stat Label & Tooltip Subtitle */}
        <div className="flex flex-col min-w-[68px] shrink-0">
          <div className="flex items-center gap-1.5">
            <label
              className={`text-xs font-black uppercase tracking-wider select-none ${
                isRegular ? "text-sky-200" : "text-amber-200"
              }`}
            >
              {stat.label}
            </label>
            {statBonus !== 0 && (
              <span
                className={`text-[11px] font-mono font-bold ${
                  statBonus > 0 ? "text-emerald-400" : "text-rose-400"
                }`}
              >
                {statBonus > 0 ? `+${statBonus}` : statBonus}
              </span>
            )}
          </div>
          <span className="text-[9px] text-slate-500 truncate max-w-[110px]">
            {STAT_DESCRIPTIONS[stat.key]}
          </span>
        </div>

        {/* Step Controls (-10, -1, Input, +1, +10) */}
        <div className="flex items-center gap-1 justify-center">
          <button
            type="button"
            onClick={() => adjustBy(-10)}
            disabled={currentValue <= minVal}
            title="-10"
            className="h-7 px-1.5 shrink-0 flex items-center justify-center rounded-md bg-slate-950/70 text-[10px] font-mono font-bold text-slate-400 hover:bg-slate-800 hover:text-slate-100 disabled:opacity-30 border border-slate-800 transition-colors cursor-pointer"
          >
            -10
          </button>

          <button
            type="button"
            onClick={() => adjustBy(-1)}
            disabled={currentValue <= minVal}
            title="-1"
            className="w-7 h-7 shrink-0 flex items-center justify-center rounded-lg bg-slate-800/90 text-slate-300 hover:bg-slate-700 hover:text-white disabled:opacity-30 border border-slate-700 transition-colors cursor-pointer"
          >
            <Minus size={13} />
          </button>

          <input
            type="number"
            min={minVal}
            max={maxVal}
            value={currentValue}
            onChange={(event) => onStatChange(stat, Number(event.target.value))}
            className="w-12 h-8 bg-slate-950/80 border border-slate-700/80 text-center font-mono font-black text-slate-100 text-sm focus:outline-none focus:ring-1 focus:ring-sky-500 rounded-lg hide-arrows"
          />

          <button
            type="button"
            onClick={() => adjustBy(1)}
            disabled={currentValue >= maxVal}
            title="+1"
            className="w-7 h-7 shrink-0 flex items-center justify-center rounded-lg bg-slate-800/90 text-slate-300 hover:bg-slate-700 hover:text-white disabled:opacity-30 border border-slate-700 transition-colors cursor-pointer"
          >
            <Plus size={13} />
          </button>

          <button
            type="button"
            onClick={() => adjustBy(10)}
            disabled={currentValue >= maxVal}
            title="+10"
            className="h-7 px-1.5 shrink-0 flex items-center justify-center rounded-md bg-slate-950/70 text-[10px] font-mono font-bold text-slate-400 hover:bg-slate-800 hover:text-slate-100 disabled:opacity-30 border border-slate-800 transition-colors cursor-pointer"
          >
            +10
          </button>
        </div>

        {/* Next Point Cost / Max Badge */}
        <div className="flex flex-col items-end justify-center min-w-[42px] shrink-0">
          {currentValue < maxVal ? (
            <>
              <span className="text-[8.5px] text-slate-500 uppercase font-bold select-none leading-tight">
                Custo
              </span>
              <span className="text-[11px] font-mono text-sky-300 font-bold leading-none mt-0.5">
                {cost}
              </span>
            </>
          ) : (
            <span className="px-1.5 py-0.5 rounded bg-emerald-500/15 border border-emerald-500/30 text-[9.5px] text-emerald-300 font-black select-none tracking-wider">
              MAX
            </span>
          )}
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
            className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-[10.5px] font-bold text-slate-300 hover:text-white bg-slate-900/80 hover:bg-slate-800 border border-slate-700/70 transition-colors cursor-pointer"
          >
            <RotateCcw size={11} />
            Resetar Atributos
          </button>
        </div>
      )}

      {isFourthJob ? (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          {/* Regular Stats Column */}
          <div className="flex flex-col gap-2">
            <span className="text-[10px] font-black uppercase tracking-widest text-sky-300/85 pl-1">
              Atributos Primários (STR – LUK)
            </span>
            {calculatorStatRows.map(renderStatRow)}
          </div>

          {/* Trait Stats Column */}
          <div className="flex flex-col gap-2">
            <span className="text-[10px] font-black uppercase tracking-widest text-amber-300/85 pl-1">
              Traços de 4ª Classe (POW – CRT)
            </span>
            {calculatorTraitStatRows.map(renderStatRow)}
          </div>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-2.5">
          {calculatorStatRows.map(renderStatRow)}
        </div>
      )}
    </div>
  );
}
