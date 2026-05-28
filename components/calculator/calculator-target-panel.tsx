"use client";

import { Swords } from "lucide-react";
import type { CalculateDamageResult } from "@/packages/calculator-core/src";
import { calculatorDemoDataset } from "./calculator-demo-data";
import { getBreakdownValue } from "./calculator-utils";

type CalculatorTargetPanelProps = {
  result: CalculateDamageResult;
  selectedMonsterId: number;
  onMonsterChange: (monsterId: number) => void;
};

export function CalculatorTargetPanel({
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
          Target & Output
        </span>
        <small>iRO profile</small>
      </div>

      <label className="monster-picker">
        Monster
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
        <span>Total Damage</span>
        <strong>{totalDamage}</strong>
        <small>
          {averageDamage} average hit / {hitCount} hit / {result.skill.damageType}
        </small>
      </div>

      <div className="breakdown-list">
        <div>
          <span>Base Power</span>
          <strong>{basePower}</strong>
        </div>
        <div>
          <span>Skill Multiplier</span>
          <strong>{skillMultiplier.toFixed(2)}x</strong>
        </div>
        <div>
          <span>Defense Mitigation</span>
          <strong>{defenseMultiplier.toFixed(3)}x</strong>
        </div>
        <div>
          <span>Source</span>
          <strong>Local core</strong>
        </div>
      </div>
    </aside>
  );
}
