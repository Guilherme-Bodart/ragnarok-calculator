"use client";

import { Button } from "@/components/ui/button";
import { Field, FieldValue } from "@/components/ui/field";
import { NumberSelect } from "@/components/ui/number-select";
import { RichSelect } from "@/components/ui/rich-select";
import type { CalculatorDictionary } from "./calculator-i18n";
import { CalculatorSkillIcon } from "./calculator-skill-icon";
import type { CalculatorPanelSkill } from "./calculator-character-panel";

type CalculatorCharacterControlsProps = {
  availableSkills: CalculatorPanelSkill[];
  baseLevel: number;
  copy: CalculatorDictionary;
  isFourthJob: boolean;
  jobLevel: number;
  selectedClassId: string;
  selectedClassName: string;
  selectedSkill: CalculatorPanelSkill;
  skillLevel: number;
  onBaseLevelChange: (baseLevel: number) => void;
  onJobLevelChange: (jobLevel: number) => void;
  onPresetApply: (preset: "third" | "fourth" | "max") => void;
  onSkillChange: (skill: CalculatorPanelSkill) => void;
  onSkillLevelChange: (skillLevel: number) => void;
};

export function CalculatorCharacterControls({
  availableSkills,
  baseLevel,
  copy,
  isFourthJob,
  jobLevel,
  selectedClassId,
  selectedClassName,
  selectedSkill,
  skillLevel,
  onBaseLevelChange,
  onJobLevelChange,
  onPresetApply,
  onSkillChange,
  onSkillLevelChange,
}: CalculatorCharacterControlsProps) {
  const skillOptions = [
    {
      label: selectedClassName,
      options: availableSkills.map((skill) => ({
        id: skill.id,
        label: skill.name,
        icon: <CalculatorSkillIcon name={skill.name} numericId={skill.numericId} />,
      })),
    },
  ];

  return (
    <>
      <div className="calc-select-row">
        <Field label={copy.character.classLabel}>
          <FieldValue title={selectedClassId}>{selectedClassName}</FieldValue>
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
        <Field label={copy.character.skillLabel}>
          <RichSelect
            groups={skillOptions}
            menuSize="compact"
            searchPlaceholder="Filtrar skill"
            value={selectedSkill.id}
            onChange={(skillId) => {
              const nextSkill =
                availableSkills.find((skill) => skill.id === skillId) ??
                selectedSkill;

              onSkillChange(nextSkill);
              onSkillLevelChange(Math.min(skillLevel, nextSkill.maxLevel));
            }}
          />
        </Field>
        <Field label={copy.character.levelLabel}>
          <NumberSelect
            max={selectedSkill.maxLevel}
            prefix="Lv."
            value={skillLevel}
            onChange={onSkillLevelChange}
          />
        </Field>
      </div>

      <div className="calc-preset-row">
        <Button type="button" variant="ghost" onClick={() => onPresetApply("third")}>
          {copy.character.thirdPreset}
        </Button>
        <Button
          type="button"
          variant="ghost"
          onClick={() => onPresetApply("fourth")}
        >
          {copy.character.fourthPreset}
        </Button>
        <Button type="button" variant="ghost" onClick={() => onPresetApply("max")}>
          {copy.character.maxPreset}
        </Button>
      </div>
    </>
  );
}
