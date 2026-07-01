"use client";

import { Field } from "@/components/ui/field";
import { NumberSelect } from "@/components/ui/number-select";
import type { CalculatorDictionary } from "./calculator-i18n";
import { CalculatorClassSelector } from "./calculator-class-selector";

type CalculatorCharacterControlsProps = {
  baseLevel: number;
  copy: CalculatorDictionary;
  isFourthJob: boolean;
  jobLevel: number;
  selectedClassId: string;
  onBaseLevelChange: (baseLevel: number) => void;
  onClassChange: (classId: string) => void;
  onJobLevelChange: (jobLevel: number) => void;
};

export function CalculatorCharacterControls({
  baseLevel,
  copy,
  isFourthJob,
  jobLevel,
  selectedClassId,
  onBaseLevelChange,
  onClassChange,
  onJobLevelChange,
}: CalculatorCharacterControlsProps) {


  return (
    <div className="grid grid-cols-[1.5fr_1fr_1fr] gap-4 mb-2 p-2">
      <Field label={copy.character.classLabel}>
        <CalculatorClassSelector
          selectedClassId={selectedClassId}
          onClassChange={onClassChange}
        />
      </Field>
      <Field label="Base">
        <NumberSelect
          fit="fill"
          max={275}
          value={baseLevel}
          onChange={onBaseLevelChange}
        />
      </Field>
      <Field label="Job">
        <NumberSelect
          fit="fill"
          max={isFourthJob ? 70 : 60}
          value={jobLevel}
          onChange={onJobLevelChange}
        />
      </Field>
    </div>
  );
}
