"use client";

import { Swords } from "lucide-react";
import type { CalculateDamageResult } from "@/packages/calculator-core/src";
import { calculatorDemoDataset } from "./calculator-demo-data";
import type { CalculatorDictionary } from "./calculator-i18n";
import { getBreakdownValue } from "./calculator-utils";

type CalculatorTargetPanelProps = {
  copy: CalculatorDictionary;
  result: CalculateDamageResult;
  selectedMonsterId: number;
  onMonsterChange: (monsterId: number) => void;
};

export function CalculatorTargetPanel({
  copy,
  result,
  selectedMonsterId,
  onMonsterChange,
}: CalculatorTargetPanelProps) {
  const totalDamage = result.damage.total.toLocaleString();
  const averageDamage = result.damage.average.toLocaleString();
  const hitCount = getBreakdownValue(result.breakdown, "hits") || result.skill.hitCount;
  const basePower = getBreakdownValue(result.breakdown, "basePower");
  const skillMultiplier = getBreakdownValue(result.breakdown, "skillMultiplier");
  const defenseMultiplier = getBreakdownValue(
    result.breakdown,
    "defenseMultiplier",
  );

  return (
    <aside className="calc-panel calc-target">
      <div className="calc-panel-header">
        <span>
          <Swords size={17} />
          {copy.target.title}
        </span>
        <small>{copy.target.meta}</small>
      </div>

      <label className="monster-picker">
        {copy.target.monsterLabel}
        <select
          value={selectedMonsterId}
          onChange={(event) => onMonsterChange(Number(event.target.value))}
        >
          {calculatorDemoDataset.monsters.map((monster) => (
            <option value={monster.id} key={monster.id}>
              {monster.name}
            </option>
          ))}
        </select>
      </label>

      <div className="damage-card">
        <span>{copy.target.totalDamage}</span>
        <strong>{totalDamage}</strong>
        <small>
          {averageDamage} {copy.target.averageHit} / {hitCount}{" "}
          {copy.target.hit} / {result.skill.damageType}
        </small>
      </div>

      <div className="breakdown-list">
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
          <span>{copy.target.source}</span>
          <strong>{copy.target.sourceValue}</strong>
        </div>
      </div>
    </aside>
  );
}
