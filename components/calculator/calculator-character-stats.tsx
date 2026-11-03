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
        className="group flex items-center justify-between gap-2 bg-slate-900/45 border border-slate-800/75 rounded-lg px-3 py-1.5 hover:border-sky-500/30 hover:bg-slate-900/75 transition-colors"
      >
        {/* Stat Label & Tooltip Subtitle */}
        <div className="flex flex-col min-w-[74px] shrink-0">
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
                className={`text-[11px] font-mono font-bold tabular-nums ${
                  statBonus > 0 ? "text-emerald-400" : "text-rose-400"
                }`}
              >
                {statBonus > 0 ? `+${statBonus}` : statBonus}
              </span>
            )}
          </div>
          <span className="text-[9px] text-slate-500 truncate max-w-[115px]">
            {STAT_DESCRIPTIONS[stat.key]}
          </span>
        </div>

        {/* Unified Capsule Stepper (-10 | -1 | Input | +1 | +10) */}
        <div className="inline-flex items-center rounded-lg bg-slate-950/90 border border-slate-800/90 group-hover:border-slate-700/90 divide-x divide-slate-800/80 overflow-hidden transition-colors">
          <button
            type="button"
            onClick={() => adjustBy(-10)}
            disabled={currentValue <= minVal}
            title="-10"
            className="h-7 px-1.5 shrink-0 flex items-center justify-center text-[10px] font-mono font-bold text-slate-500 group-hover:text-slate-300 hover:bg-slate-800/80 hover:text-white disabled:opacity-25 transition-colors cursor-pointer"
          >
            -10
          </button>

          <button
            type="button"
            onClick={() => adjustBy(-1)}
            disabled={currentValue <= minVal}
            title="-1"
            className="w-7 h-7 shrink-0 flex items-center justify-center text-slate-300 hover:bg-slate-800 hover:text-white disabled:opacity-25 transition-colors cursor-pointer"
          >
            <Minus size={12} />
          </button>

          <input
            type="number"
            min={minVal}
            max={maxVal}
            value={currentValue}
            onChange={(event) => onStatChange(stat, Number(event.target.value))}
            className="w-11 h-7 bg-transparent text-center font-mono font-black text-slate-100 text-xs tabular-nums focus:outline-none focus:bg-sky-950/40 hide-arrows"
          />

          <button
            type="button"
            onClick={() => adjustBy(1)}
            disabled={currentValue >= maxVal}
            title="+1"
            className="w-7 h-7 shrink-0 flex items-center justify-center text-slate-300 hover:bg-slate-800 hover:text-white disabled:opacity-25 transition-colors cursor-pointer"
          >
            <Plus size={12} />
          </button>

          <button
            type="button"
            onClick={() => adjustBy(10)}
            disabled={currentValue >= maxVal}
            title="+10"
            className="h-7 px-1.5 shrink-0 flex items-center justify-center text-[10px] font-mono font-bold text-slate-500 group-hover:text-slate-300 hover:bg-slate-800/80 hover:text-white disabled:opacity-25 transition-colors cursor-pointer"
          >
            +10
          </button>
        </div>

        {/* Next Point Cost / Max Badge */}
        <div className="flex flex-col items-end justify-center min-w-[38px] shrink-0">
          {currentValue < maxVal ? (
            <>
              <span className="text-[8px] text-slate-500 uppercase font-bold select-none leading-tight">
                Custo
              </span>
              <span className="text-[11px] font-mono text-sky-300/90 font-bold tabular-nums leading-none mt-0.5">
                {cost}
              </span>
            </>
          ) : (
            <span className="px-1.5 py-0.5 rounded bg-emerald-500/15 border border-emerald-500/30 text-[9px] text-emerald-300 font-black select-none tracking-wider">
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
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-3.5">
          {/* Regular Stats Column */}
          <div className="flex flex-col gap-1.5">
            <span className="text-[10px] font-black uppercase tracking-widest text-sky-300/85 pl-1 mb-0.5">
              Atributos Primários (STR – LUK)
            </span>
            {calculatorStatRows.map(renderStatRow)}
          </div>

          {/* Trait Stats Column */}
          <div className="flex flex-col gap-1.5">
            <span className="text-[10px] font-black uppercase tracking-widest text-amber-300/85 pl-1 mb-0.5">
              Traços de 4ª Classe (POW – CRT)
            </span>
            {calculatorTraitStatRows.map(renderStatRow)}
          </div>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
          {calculatorStatRows.map(renderStatRow)}
        </div>
      )}
    </div>
  );
}
