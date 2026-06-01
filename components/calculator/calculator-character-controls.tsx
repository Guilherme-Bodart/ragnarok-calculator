"use client";

import { useMemo } from "react";
import { Field } from "@/components/ui/field";
import { NumberSelect } from "@/components/ui/number-select";
import { RichSelect } from "@/components/ui/rich-select";
import type { CalculatorDictionary } from "./calculator-i18n";
import { CalculatorClassOptionPortrait } from "./calculator-class-option-portrait";
import { calculatorSkillTreeClassGroups } from "./calculator-skill-tree-data";

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
  const classSelectGroups = useMemo(
    () =>
      calculatorSkillTreeClassGroups.map((group) => ({
        label: group.label,
        options: group.options.map((job) => ({
          id: job.id,
          label: job.name,
          icon: (
            <CalculatorClassOptionPortrait classId={job.id} name={job.name} />
          ),
        })),
      })),
    [],
  );

  return (
    <div className="calc-select-row">
      <Field label={copy.character.classLabel}>
        <RichSelect
          groups={classSelectGroups}
          searchPlaceholder="Filtrar classe"
          value={selectedClassId}
          onChange={onClassChange}
        />
      </Field>
      <Field label="Base">
        <NumberSelect
          max={275}
          prefix="Base"
          value={baseLevel}
          onChange={onBaseLevelChange}
        />
      </Field>
      <Field label="Job">
        <NumberSelect
          max={isFourthJob ? 70 : 60}
          prefix="Job"
          value={jobLevel}
          onChange={onJobLevelChange}
        />
      </Field>
    </div>
  );
}
