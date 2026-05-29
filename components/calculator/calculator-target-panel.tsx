"use client";

import { Swords } from "lucide-react";
import { Field } from "@/components/ui/field";
import { PanelHeader } from "@/components/ui/panel-header";
import { RichSelect } from "@/components/ui/rich-select";
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
      <PanelHeader
        icon={<Swords size={17} />}
        title={copy.target.title}
        meta={copy.target.meta}
      />

      <Field className="monster-picker" label={copy.target.monsterLabel}>
        <RichSelect
          value={String(selectedMonsterId)}
          onChange={(monsterId) => onMonsterChange(Number(monsterId))}
          searchPlaceholder="Filtrar monstro"
          groups={[
            {
              label: copy.target.monsterLabel,
              options: calculatorDemoDataset.monsters.map((monster) => ({
                id: String(monster.id),
                label: monster.name,
              })),
            },
          ]}
        />
      </Field>

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
