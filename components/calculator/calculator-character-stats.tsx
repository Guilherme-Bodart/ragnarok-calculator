"use client";

import { Minus, Plus } from "lucide-react";
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
  onStatChange: (stat: VisibleCalculatorStat, rawValue: number) => void;
};

export function CalculatorCharacterStats({
  isFourthJob,
  stats,
  onStatChange,
}: CalculatorCharacterStatsProps) {
  const renderStatRow = (stat: VisibleCalculatorStat) => {
    const isRegular = stat.group === "regular";
    const minVal = isRegular ? 1 : 0;
    const maxVal = isRegular ? 130 : 110;
    const currentValue = stats[stat.key];

    // Calculate cost for next point
    let cost = 0;
    if (currentValue < maxVal) {
      cost = isRegular ? getRegularStatIncreaseCost(currentValue) : 1;
    }

    const decrement = () => {
      if (currentValue > minVal) onStatChange(stat, currentValue - 1);
    };

    const increment = () => {
      if (currentValue < maxVal) onStatChange(stat, currentValue + 1);
    };

    return (
      <div
        key={stat.key}
        className="flex items-center justify-between bg-slate-900/60 border border-slate-700/50 rounded-xl p-3 shadow-sm hover:border-sky-500/30 hover:bg-slate-900/80 transition-colors"
      >
        {/* Label */}
        <div className="flex items-center w-14 ml-2">
          <label className="text-sm font-bold text-sky-200 uppercase tracking-widest cursor-pointer select-none">
            {stat.label}
          </label>
        </div>

        {/* Input Area */}
        <div className="flex items-center gap-2 flex-1 justify-center">
          <button
            type="button"
            onClick={decrement}
            className="w-9 h-9 flex items-center justify-center rounded-lg bg-slate-800 text-slate-300 hover:bg-slate-700 hover:text-white border border-slate-600 transition-colors focus:outline-none focus:ring-1 focus:ring-sky-500/50"
          >
            <Minus size={16} />
          </button>

          <input
            type="number"
            min={minVal}
            max={maxVal}
            value={currentValue}
            onChange={(event) => onStatChange(stat, Number(event.target.value))}
            className="w-16 h-10 bg-slate-950/50 border border-slate-800 text-center font-mono font-bold text-slate-100 text-base focus:outline-none focus:ring-1 focus:ring-sky-500 rounded-lg hide-arrows"
          />

          <button
            type="button"
            onClick={increment}
            className="w-9 h-9 flex items-center justify-center rounded-lg bg-slate-800 text-slate-300 hover:bg-slate-700 hover:text-white border border-slate-600 transition-colors focus:outline-none focus:ring-1 focus:ring-sky-500/50"
          >
            <Plus size={16} />
          </button>
        </div>

        {/* Cost */}
        <div className="mr-1">
          {currentValue < maxVal ? (
            <span className="text-[11px] text-slate-400 font-medium select-none">
              Custo: <span className="text-sky-300 font-bold">{cost}</span>
            </span>
          ) : (
            <span className="text-[11px] text-emerald-400 font-bold select-none tracking-wider">
              MAX
            </span>
          )}
        </div>
      </div>
    );
  };

  return (
    <div
      className={`grid gap-x-8 gap-y-4 ${isFourthJob ? "grid-cols-1 md:grid-cols-2" : "grid-cols-1 md:grid-cols-2 max-w-4xl"} p-2`}
    >
      {/* Regular Stats Column */}
      <div className="flex flex-col gap-3">
        {calculatorStatRows.map(renderStatRow)}
      </div>

      {/* Trait Stats Column */}
      {isFourthJob && (
        <div className="flex flex-col gap-3">
          {calculatorTraitStatRows.map(renderStatRow)}
        </div>
      )}
    </div>
  );
}
