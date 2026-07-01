"use client";

import { Swords } from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import { Field } from "@/components/ui/field";
import { PanelHeader } from "@/components/ui/panel-header";
import { RichSelect } from "@/components/ui/rich-select";
import type { CalculateDamageResult } from "@/packages/calculator-core/src";
import type { CalculatorDictionary } from "./calculator-i18n";
import {
  searchCalculatorMonsters,
  type CalculatorMonsterDetail,
  type CalculatorMonsterIndexOption,
} from "./calculator-monster-data";
import { getBreakdownValue } from "./calculator-utils";

import { CalculatorMonsterIcon } from "./calculator-monster-icon";

type CalculatorTargetPanelProps = {
  copy: CalculatorDictionary;
  result: CalculateDamageResult;
  selectedMonster: CalculatorMonsterDetail | null;
  selectedMonsterId: number;
  onMonsterChange: (monsterId: number) => void;
};

export function CalculatorTargetPanel({
  copy,
  result,
  selectedMonster,
  selectedMonsterId,
  onMonsterChange,
}: CalculatorTargetPanelProps) {
  const [monsterQuery, setMonsterQuery] = useState("");
  const [monsterOptions, setMonsterOptions] = useState<
    CalculatorMonsterIndexOption[]
  >([]);
  const totalDamage = result.damage.total.toLocaleString();
  const averageDamage = result.damage.average.toLocaleString();
  const hitCount = getBreakdownValue(result.breakdown, "hits") || result.skill.hitCount;
  const basePower = getBreakdownValue(result.breakdown, "basePower");
  const skillMultiplier = getBreakdownValue(result.breakdown, "skillMultiplier");
  const defenseMultiplier = getBreakdownValue(
    result.breakdown,
    "defenseMultiplier",
  );
  const elementMultiplier = getBreakdownValue(result.breakdown, "elementMultiplier");
  const weaponSizeMultiplier = getBreakdownValue(
    result.breakdown,
    "weaponSizeMultiplier",
  );
  const unsupportedModifierStatements = getBreakdownValue(
    result.breakdown,
    "unsupportedModifierStatements",
  );
  const activeBuffItems = getBreakdownValue(result.breakdown, "activeBuffItems");
  const cycleTimeMs = getBreakdownValue(result.breakdown, "cycleTimeMs");
  const dps = getBreakdownValue(result.breakdown, "dps");
  const options = useMemo(() => {
    const optionById = new Map(
      monsterOptions.map((monster) => [monster.id, monster]),
    );

    if (selectedMonster && !optionById.has(selectedMonster.id)) {
      optionById.set(selectedMonster.id, {
        id: selectedMonster.id,
        name: selectedMonster.name,
        level: selectedMonster.level,
        race: selectedMonster.race,
        size: selectedMonster.size,
        element: selectedMonster.element,
        elementLevel: selectedMonster.elementLevel,
        hp: selectedMonster.hp,
        defense: selectedMonster.defense,
        magicDefense: selectedMonster.magicDefense,
      });
    }

    return Array.from(optionById.values());
  }, [monsterOptions, selectedMonster]);

  useEffect(() => {
    let isCurrent = true;

    searchCalculatorMonsters({ limit: 80, query: monsterQuery })
      .then((monsters) => {
        if (isCurrent) {
          setMonsterOptions(monsters);
        }
      })
      .catch(() => undefined);

    return () => {
      isCurrent = false;
    };
  }, [monsterQuery]);

  return (
    <aside className="flex flex-col gap-4 p-5 rounded-xl border border-sky-500/20 bg-gradient-to-br from-slate-900/90 to-slate-950/80 shadow-[0_8px_30px_rgb(0,0,0,0.5)] backdrop-blur-xl flex-1 animate-in fade-in slide-in-from-right-8 duration-700">
      <div className="flex items-center gap-2 mb-2">
        <Swords size={18} className="text-sky-400" />
        <h2 className="text-sm font-black text-sky-100 uppercase tracking-widest">{copy.target.title}</h2>
      </div>

      <Field className="monster-picker" label={copy.target.monsterLabel}>
        <RichSelect
          className="text-sm bg-slate-900/60 border-slate-700/50"
          value={String(selectedMonsterId)}
          onChange={(monsterId) => onMonsterChange(Number(monsterId))}
          searchValue={monsterQuery}
          onSearchChange={setMonsterQuery}
          searchPlaceholder={copy.target.searchPlaceholder}
          groups={[
            {
              label: copy.target.monsterLabel,
              options: options.map((monster) => {
                const raceStr = monster.race ? monster.race.charAt(0).toUpperCase() + monster.race.slice(1) : "";
                const sizeMap: Record<string, string> = { small: "S", medium: "M", large: "L" };
                const sizeStr = monster.size && sizeMap[monster.size] ? sizeMap[monster.size] : "";
                const extra = [raceStr, sizeStr].filter(Boolean).join(" ");
                
                return {
                  id: String(monster.id),
                  label: `${monster.level || "?"} ${monster.name}${extra ? ` (${extra})` : ""}`,
                  icon: <CalculatorMonsterIcon monsterId={monster.id} size={24} />
                };
              }),
            },
          ]}
        />
      </Field>

      {selectedMonster ? (
        <div className="flex items-start gap-4 p-4 rounded-lg border border-slate-700/50 bg-slate-800/40 shadow-inner mt-2 shrink-0">
          <CalculatorMonsterIcon monsterId={selectedMonster.id} size={72} className="shrink-0 bg-slate-900/60 rounded-md border border-slate-700/50 p-1 drop-shadow-md" />
          <div className="flex flex-col w-full">
            <strong className="text-sm text-sky-50 mb-2 truncate">{selectedMonster.name}</strong>
            <div className="grid grid-cols-2 gap-x-3 gap-y-1 text-[11px]">
              <div className="font-semibold text-rose-400">HP <span className="text-slate-200 ml-1">{selectedMonster.hp.toLocaleString()}</span></div>
              <div className="font-semibold text-slate-400">Def <span className="text-slate-200 ml-1">{selectedMonster.defense}</span></div>
              <div className="font-semibold text-slate-400">Mdef <span className="text-slate-200 ml-1">{selectedMonster.magicDefense}</span></div>
              <div className="font-semibold text-amber-500/80 capitalize">{selectedMonster.element} {selectedMonster.elementLevel}</div>
              <div className="font-semibold text-sky-400/80 capitalize">{selectedMonster.size}</div>
            </div>
          </div>
        </div>
      ) : null}

      <div className="flex flex-col items-center justify-center p-6 rounded-xl border border-sky-400/30 bg-gradient-to-b from-sky-900/40 to-slate-900/60 shadow-[inset_0_0_20px_rgba(56,189,248,0.15)] mt-4 relative overflow-hidden flex-1 min-h-[200px]">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-sky-500/10 via-transparent to-transparent opacity-60 pointer-events-none" />
        <span className="text-xs font-bold text-sky-200/60 uppercase tracking-widest mb-1 z-10">{copy.target.totalDamage}</span>
        <strong className="text-5xl md:text-6xl font-black text-white drop-shadow-[0_0_15px_rgba(56,189,248,0.6)] z-10 tabular-nums tracking-tight">
          {totalDamage}
        </strong>
        <small className="text-xs text-sky-200/80 mt-3 font-medium z-10">
          {averageDamage} {copy.target.averageHit} / {hitCount} {copy.target.hit}
        </small>
        
        {selectedMonster && dps > 0 && (
          <div className="w-full mt-4 pt-3 border-t border-sky-500/20 flex justify-between items-center text-xs z-10">
            <span className="text-slate-400 font-semibold">DPS: <strong className="text-sky-300 ml-1 font-mono text-sm">{dps.toLocaleString()}</strong></span>
            <span className="text-slate-400 font-semibold">TTK: <strong className="text-amber-400 ml-1 font-mono text-sm">{formatTime(selectedMonster.hp / dps)}</strong></span>
          </div>
        )}
      </div>

      <div className="grid grid-cols-2 gap-2 mt-4 text-[10px] sm:text-xs">
        <div className="flex justify-between p-2 rounded bg-slate-900/50 border border-slate-800/60">
          <span className="text-slate-400">{copy.target.precision}</span>
          <strong className="text-slate-200 font-mono">{result.meta.precision}</strong>
        </div>
        <div className="flex justify-between p-2 rounded bg-slate-900/50 border border-slate-800/60">
          <span className="text-slate-400">Poder Base</span>
          <strong className="text-slate-200 font-mono">{basePower}</strong>
        </div>
        <div className="flex justify-between p-2 rounded bg-slate-900/50 border border-slate-800/60">
          <span className="text-slate-400">Skill Ratio</span>
          <strong className="text-slate-200 font-mono">{skillMultiplier.toFixed(2)}x</strong>
        </div>
        <div className="flex justify-between p-2 rounded bg-slate-900/50 border border-slate-800/60">
          <span className="text-slate-400">Def/Mdef</span>
          <strong className="text-slate-200 font-mono">{defenseMultiplier.toFixed(3)}x</strong>
        </div>
      </div>

      {result.meta.warnings.length > 0 ? (
        <div className="flex flex-col gap-1 mt-4 p-3 rounded-lg border border-rose-500/30 bg-rose-950/20 text-xs text-rose-300/90">
          {result.meta.warnings.map((warning) => (
            <span key={warning}>• {warning}</span>
          ))}
        </div>
      ) : null}
    </aside>
  );
}

function formatTime(seconds: number) {
  if (!isFinite(seconds)) return "∞";
  if (seconds < 60) return `${seconds.toFixed(1)}s`;
  
  const m = Math.floor(seconds / 60);
  const s = Math.floor(seconds % 60);
  
  if (m < 60) return `${m}m ${s}s`;
  
  const h = Math.floor(m / 60);
  const remM = m % 60;
  return `${h}h ${remM}m`;
}

