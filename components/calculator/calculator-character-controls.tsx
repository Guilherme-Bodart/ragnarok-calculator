"use client";

import { Field } from "@/components/ui/field";
import { NumberSelect } from "@/components/ui/number-select";
import type { CalculatorDictionary } from "./calculator-i18n";
import { CalculatorClassSelector } from "./calculator-class-selector";
import { useCalculatorBuildStore } from "./calculator-build-store";
import { isFourthJobClassId } from "./calculator-class-rules";
import { getCalculatorManualBuffSkills } from "./calculator-buff-data";
import { useMemo } from "react";

type CalculatorCharacterControlsProps = {
  copy: CalculatorDictionary;
};

export function CalculatorCharacterControls({
  copy,
}: CalculatorCharacterControlsProps) {
  const baseLevel = useCalculatorBuildStore((s) => s.baseLevel);
  const setBaseLevel = useCalculatorBuildStore((s) => s.setBaseLevel);
  const jobLevel = useCalculatorBuildStore((s) => s.jobLevel);
  const setJobLevel = useCalculatorBuildStore((s) => s.setJobLevel);
  const selectedClassId = useCalculatorBuildStore((s) => s.selectedClassId);
  const handleClassChange = useCalculatorBuildStore((s) => s.handleClassChange);

  const isFourthJob = isFourthJobClassId(selectedClassId);

  const manualBuffSkills = useMemo(
    () => getCalculatorManualBuffSkills(copy.buffs),
    [copy.buffs],
  );

  function onClassChange(classId: string) {
    handleClassChange(classId, manualBuffSkills);
  }

  return (
    <div className="grid grid-cols-1 sm:grid-cols-[1.6fr_1fr_1fr] gap-3">
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
          onChange={setBaseLevel}
        />
      </Field>
      <Field label="Job">
        <NumberSelect
          fit="fill"
          max={isFourthJob ? 70 : 60}
          value={jobLevel}
          onChange={setJobLevel}
        />
      </Field>
    </div>
  );
}
