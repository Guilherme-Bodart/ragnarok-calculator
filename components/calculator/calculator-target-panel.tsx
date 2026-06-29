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
    <aside className="calc-panel calc-target">
      <PanelHeader
        icon={<Swords size={17} />}
        title={copy.target.title}
        meta={copy.target.meta}
      />

      <Field className="monster-picker" label={copy.target.monsterLabel}>
        <RichSelect
          className="text-sm"
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
        <div className="target-monster-summary flex items-start gap-3 p-3 bg-card border border-border/50 rounded-md mt-4 shadow-sm">
          <CalculatorMonsterIcon monsterId={selectedMonster.id} size={96} className="shrink-0 bg-muted/30 rounded border border-border/50 p-1" />
          <div className="flex flex-col gap-1.5 w-full">
            <div className="grid grid-cols-2 gap-x-2 gap-y-1 text-xs">
              <div className="font-semibold text-rose-500">HP <span className="text-foreground ml-1">{selectedMonster.hp.toLocaleString()}</span></div>
              <div className="font-semibold text-muted-foreground">Def <span className="text-foreground ml-1">{selectedMonster.defense}</span></div>
              <div className="font-semibold text-muted-foreground">Mdef <span className="text-foreground ml-1">{selectedMonster.magicDefense}</span></div>
              <div className="font-semibold text-muted-foreground">Res <span className="text-foreground ml-1">0</span></div>
              <div className="font-semibold text-muted-foreground">M.Res <span className="text-foreground ml-1">0</span></div>
            </div>
            
            <div className="flex flex-col gap-0.5 mt-1 text-xs font-medium">
              {selectedMonster.classType === "boss" ? <span className="text-rose-500">Boss</span> : <span className="text-emerald-500">Normal</span>}
              <span className="text-amber-500 capitalize">{selectedMonster.element} {selectedMonster.elementLevel}</span>
              <span className="text-orange-400 capitalize">{selectedMonster.race}</span>
              <span className="text-sky-400 capitalize">{selectedMonster.size}</span>
            </div>
          </div>
        </div>
      ) : null}

      <div className="damage-card">
        <span>{copy.target.totalDamage}</span>
        <strong>{totalDamage}</strong>
        <small>
          {averageDamage} {copy.target.averageHit} / {hitCount}{" "}
          {copy.target.hit} / {result.skill.damageType}
        </small>
        {selectedMonster && dps > 0 && (
          <div className="mt-2 pt-2 border-t border-border/30 flex justify-between text-xs text-muted-foreground">
            <span>DPS: <strong className="text-foreground">{dps.toLocaleString()}</strong></span>
            <span>Tempo: <strong className="text-amber-500">{formatTime(selectedMonster.hp / dps)}</strong></span>
          </div>
        )}
      </div>

      <div className="breakdown-list">
        <div>
          <span>{copy.target.precision}</span>
          <strong>{result.meta.precision}</strong>
        </div>
        <div>
          <span>{copy.target.formula}</span>
          <strong>{result.meta.formulaId}</strong>
        </div>
        <div>
          <span>{copy.target.basePower}</span>
          <strong>{basePower}</strong>
        </div>
        <div>
          <span>{copy.target.skillMultiplier}</span>
          <strong>{skillMultiplier.toFixed(2)}x</strong>
        </div>
        <div>
          <span>{copy.target.defenseMitigation}</span>
          <strong>{defenseMultiplier.toFixed(3)}x</strong>
        </div>
        <div>
          <span>{copy.target.elementMultiplier}</span>
          <strong>{elementMultiplier.toFixed(3)}x</strong>
        </div>
        <div>
          <span>{copy.target.sizeMultiplier}</span>
          <strong>{weaponSizeMultiplier.toFixed(3)}x</strong>
        </div>
        <div>
          <span>{copy.target.unsupportedModifiers}</span>
          <strong>{unsupportedModifierStatements}</strong>
        </div>
        <div>
          <span>{copy.target.activeBuffs}</span>
          <strong>{activeBuffItems}</strong>
        </div>
        <div>
          <span>{copy.target.cycleTime}</span>
          <strong>{(cycleTimeMs / 1000).toFixed(2)}s</strong>
        </div>
        <div>
          <span>{copy.target.dps}</span>
          <strong>{dps.toLocaleString()}</strong>
        </div>
        <div>
          <span>{copy.target.source}</span>
          <strong>{copy.target.sourceValue}</strong>
        </div>
      </div>

      {result.meta.warnings.length > 0 ? (
        <div className="target-warning-list">
          {result.meta.warnings.map((warning) => (
            <span key={warning}>{warning}</span>
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

