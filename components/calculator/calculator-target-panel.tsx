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

  const activeBuffItems = getBreakdownValue(result.breakdown, "activeBuffItems");
  const cycleTimeMs = Number(getBreakdownValue(result.breakdown, "cycleTimeMs")) || 0;
  const dps = Number(getBreakdownValue(result.breakdown, "dps")) || 0;

  const vct = Number(getBreakdownValue(result.breakdown, "variableCastMs")) || 0;
  const fct = Number(getBreakdownValue(result.breakdown, "fixedCastMs")) || 0;
  const delay = Number(getBreakdownValue(result.breakdown, "afterCastDelayMs")) || 0;
  const cd = Number(getBreakdownValue(result.breakdown, "cooldownMs")) || 0;
  
  const skillPerSec = cycleTimeMs > 0 ? (1000 / cycleTimeMs).toFixed(2) : "0.00";

  const reqHit = selectedMonster ? 200 + selectedMonster.level + (selectedMonster.agi ?? 0) : 0;
  
  // Accuracy = (Hit + 100) - ReqHit. Cap at 100, Min 5.
  const hitDiff = result.characterStatus.hit + 100 - reqHit;
  const accuracy = selectedMonster ? Math.max(5, Math.min(100, hitDiff)) : 100;

  return (
    <aside className="flex flex-col gap-0 p-0 rounded-xl border border-sky-500/20 bg-gradient-to-br from-slate-900/90 to-slate-950/80 shadow-[0_8px_30px_rgb(0,0,0,0.5)] backdrop-blur-xl flex-1 animate-in fade-in slide-in-from-right-8 duration-700 overflow-hidden relative min-h-0">
      
      {/* MONSTER SECTION (60% HEIGHT) */}
      <div className="flex-[6] flex flex-col p-4 border-b border-sky-500/20 min-h-0 bg-slate-950/40 relative">
        <div className="flex items-center justify-between gap-4 mb-3 shrink-0">
          <div className="flex items-center gap-2 shrink-0">
            <Swords size={18} className="text-sky-400" />
            <h2 className="text-sm font-black text-sky-100 uppercase tracking-widest">{copy.target.title}</h2>
          </div>
          
          <div className="flex-1 w-full sm:w-auto sm:min-w-[280px]">
            <RichSelect
              className="text-xs bg-slate-900/60 border-slate-700/50"
              fit="fill"
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
                      label: `Lv.${monster.level || "?"} ${monster.name}${extra ? ` (${extra})` : ""}`,
                    };
                  }),
                },
              ]}
            />
          </div>
        </div>

        {selectedMonster ? (
          <div className="flex-1 min-h-0 flex items-start gap-4 pt-3 pb-1 overflow-y-auto custom-scrollbar">
             {/* Left side: Image */}
             <div className="flex flex-col gap-2 shrink-0 w-24 sm:w-28">
               <CalculatorMonsterIcon monsterId={selectedMonster.id} size={112} className="w-full h-auto drop-shadow-[0_0_10px_rgba(255,255,255,0.05)]" />
               {selectedMonster.classType === "boss" && (
                 <span className="text-[10px] font-bold text-rose-500 uppercase text-center tracking-widest bg-rose-950/40 rounded border border-rose-500/30 px-1 py-0.5">Boss</span>
               )}
             </div>

             {/* Right side: Dense Stats Grid */}
             <div className="flex-1 min-w-0 flex flex-col gap-2 justify-center">
                <div className="flex items-center justify-between pb-1 border-b border-slate-700/50">
                  <strong className="text-[13px] text-sky-50 truncate">Lv.{selectedMonster.level} {selectedMonster.name}</strong>
                </div>

                {/* Row 1: HP / Req.Hit / Def / Mdef */}
                <div className="flex justify-between items-center text-[10.5px] font-mono">
                  <div className="flex gap-1 text-rose-400 font-semibold"><span>HP:</span> <span>{selectedMonster.hp.toLocaleString()}</span></div>
                  <div className="flex gap-1 text-slate-300"><span>Req.Hit:</span> <span className="text-amber-100">{reqHit}</span></div>
                  <div className="flex gap-1 text-slate-300"><span>Def:</span> <span className="text-slate-100">{selectedMonster.defense}</span></div>
                  <div className="flex gap-1 text-slate-300"><span>Mdef:</span> <span className="text-slate-100">{selectedMonster.magicDefense}</span></div>
                </div>

                {/* Row 2: Race / Size / Element */}
                <div className="flex justify-between items-center text-[10.5px] font-mono">
                  <div className="flex gap-1 text-sky-300 capitalize"><span>Race:</span> <span className="text-sky-100">{selectedMonster.race}</span></div>
                  <div className="flex gap-1 text-sky-300 capitalize"><span>Size:</span> <span className="text-sky-100">{selectedMonster.size}</span></div>
                  <div className="flex gap-1 text-amber-500 capitalize"><span>Element:</span> <span className="text-amber-200">{selectedMonster.element} {selectedMonster.elementLevel}</span></div>
                </div>

                {/* Row 3: STR AGI VIT INT DEX LUK */}
                <div className="flex justify-between items-center text-[10px] font-mono text-center pt-1.5 border-t border-slate-700/50 opacity-90">
                  <div className="flex gap-1"><span className="text-slate-500">STR</span> <span className="text-slate-200">{selectedMonster.str ?? 0}</span></div>
                  <div className="flex gap-1"><span className="text-slate-500">AGI</span> <span className="text-slate-200">{selectedMonster.agi ?? 0}</span></div>
                  <div className="flex gap-1"><span className="text-slate-500">VIT</span> <span className="text-slate-200">{selectedMonster.vit ?? 0}</span></div>
                  <div className="flex gap-1"><span className="text-slate-500">INT</span> <span className="text-slate-200">{selectedMonster.int ?? 0}</span></div>
                  <div className="flex gap-1"><span className="text-slate-500">DEX</span> <span className="text-slate-200">{selectedMonster.dex ?? 0}</span></div>
                  <div className="flex gap-1"><span className="text-slate-500">LUK</span> <span className="text-slate-200">{selectedMonster.luk ?? 0}</span></div>
                </div>
             </div>
          </div>
        ) : (
          <div className="flex-1 flex items-center justify-center text-xs text-slate-500 border border-dashed border-slate-700/50 rounded-lg">
            Selecione um alvo para visualizar os atributos.
          </div>
        )}
      </div>

      {/* DAMAGE SECTION (40% HEIGHT) */}
      <div className="flex-[4] flex flex-col p-4 bg-slate-900/40 relative">
         {/* Hero Header */}
         <div className="flex justify-between items-start mb-4 shrink-0">
           <div className="flex flex-col">
             <span className="text-[10px] font-bold text-sky-300/80 uppercase tracking-widest">Dano Total da Skill</span>
             <strong className="text-3xl sm:text-4xl font-black text-white drop-shadow-[0_0_8px_rgba(56,189,248,0.5)] tabular-nums tracking-tight leading-none mt-1">
               {totalDamage}
             </strong>
             <span className="text-[10px] text-slate-400 mt-1">{result.damage.minimum.toLocaleString()} - {result.damage.maximum.toLocaleString()} (avg: {averageDamage})</span>
           </div>
           
           <div className="flex flex-col items-end text-right">
             <span className="text-[10px] font-bold text-amber-500/80 uppercase tracking-widest">DPS Estimado</span>
             <strong className="text-xl sm:text-2xl font-black text-amber-400 tabular-nums leading-none mt-1">{dps.toLocaleString()}</strong>
             {selectedMonster && dps > 0 && (
               <span className="text-[10px] text-slate-300 mt-1 font-mono">TTK: {formatTime(selectedMonster.hp / dps)}</span>
             )}
           </div>
         </div>

         {/* Advanced Stats Grid */}
         <div className="grid grid-cols-3 gap-x-4 gap-y-1.5 mt-auto shrink-0 border-t border-sky-500/10 pt-3 text-[10.5px] font-mono">
            {/* Column 1: Core Combat Stats */}
            <div className="flex flex-col gap-1.5 border-r border-sky-500/10 pr-3">
              <div className="flex justify-between"><span className="text-slate-400">Precisão</span> <strong className={accuracy >= 100 ? "text-emerald-400" : "text-rose-400"}>{accuracy}%</strong></div>
              <div className="flex justify-between"><span className="text-slate-400">Penetração</span> <strong className="text-sky-300">{Number(result.breakdown.find((b) => b.key === "defenseIgnoreRate")?.value ?? 0).toFixed(0)}%</strong></div>
              <div className="flex justify-between"><span className="text-slate-400">Crit. Rate</span> <strong className="text-rose-300">{result.characterStatus.crit}</strong></div>
            </div>

            {/* Column 2: Cast & Delay */}
            <div className="flex flex-col gap-1.5 border-r border-sky-500/10 pr-3 pl-1">
              <div className="flex justify-between"><span className="text-slate-400">VCT</span> <strong className="text-slate-200">{(vct / 1000).toFixed(3)}s</strong></div>
              <div className="flex justify-between"><span className="text-slate-400">FCT</span> <strong className="text-slate-200">{(fct / 1000).toFixed(3)}s</strong></div>
              <div className="flex justify-between"><span className="text-slate-400">Delay</span> <strong className="text-slate-200">{(delay / 1000).toFixed(3)}s</strong></div>
            </div>

            {/* Column 3: Speed & Output */}
            <div className="flex flex-col gap-1.5 pl-1">
              <div className="flex justify-between"><span className="text-slate-400">ASPD</span> <strong className="text-slate-200">{result.characterStatus.aspd}</strong></div>
              <div className="flex justify-between"><span className="text-slate-400">Skill/s</span> <strong className="text-amber-300">{skillPerSec}</strong></div>
            </div>
         </div>

         {result.meta.warnings.length > 0 ? (
           <div className="flex flex-col gap-1 mt-3 p-2 rounded border border-rose-500/30 bg-rose-950/20 text-[10px] text-rose-300/90 shrink-0">
             {result.meta.warnings.map((warning) => (
               <span key={warning}>• {warning}</span>
             ))}
           </div>
         ) : null}
      </div>
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

