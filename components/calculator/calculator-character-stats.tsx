"use client";

import { Field, Input } from "@/components/ui/field";
import type { CharacterStats } from "@/packages/calculator-core/src";
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
  return (
    <div className="stat-grid">
      {[...calculatorStatRows, ...(isFourthJob ? calculatorTraitStatRows : [])].map(
        (stat) => (
          <Field label={stat.label} key={stat.key}>
            <Input
              type="number"
              min={stat.group === "regular" ? 1 : 0}
              max={stat.group === "regular" ? 130 : 110}
              value={stats[stat.key]}
              onChange={(event) => onStatChange(stat, Number(event.target.value))}
            />
          </Field>
        ),
      )}
    </div>
  );
}
