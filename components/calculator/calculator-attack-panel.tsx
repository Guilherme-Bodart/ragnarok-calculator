"use client";

import { Crosshair } from "lucide-react";
import { Field } from "@/components/ui/field";
import { NumberSelect } from "@/components/ui/number-select";
import { PanelHeader } from "@/components/ui/panel-header";
import { RichSelect } from "@/components/ui/rich-select";
import type {
  CalculateDamageResult,
  CalculationMeta,
  RoSkill,
} from "@/packages/calculator-core/src";
import type { CalculatorDictionary } from "./calculator-i18n";
import { CalculatorSkillIcon } from "./calculator-skill-icon";

export type CalculatorAttackSkill = RoSkill & {
  numericId?: number;
};

type CalculatorAttackPanelProps = {
  availableSkills: CalculatorAttackSkill[];
  copy: CalculatorDictionary;
  resultMeta: CalculationMeta;
  selectedSkill: CalculatorAttackSkill;
  skillLevel: number;
  onSkillChange: (skillId: string) => void;
  onSkillLevelChange: (skillLevel: number) => void;
  result?: CalculateDamageResult;
};

export function CalculatorAttackPanel({
  availableSkills,
  copy,
  resultMeta,
  selectedSkill,
  skillLevel,
  onSkillChange,
  onSkillLevelChange,
  result,
}: CalculatorAttackPanelProps) {
  const hitCount =
    selectedSkill.hitCountByLevel?.[String(skillLevel)] ?? selectedSkill.hitCount;
  const multiplier =
    selectedSkill.baseMultiplierByLevel[String(skillLevel)] ??
    selectedSkill.baseMultiplierByLevel[String(selectedSkill.maxLevel)] ??
    100;
  const hasPrototypeWarning = resultMeta.precision === "prototype";

  return (
    <aside className="calc-panel calc-attack">
      <PanelHeader
        icon={<Crosshair size={17} />}
        title={copy.attack.title}
        meta={hasPrototypeWarning ? copy.attack.prototypeMeta : resultMeta.precision}
      />

      <div className="attack-picker-grid">
        <Field label={copy.attack.skillLabel}>
          <RichSelect
            value={selectedSkill.id}
            onChange={onSkillChange}
            searchPlaceholder={copy.attack.searchPlaceholder}
            groups={[
              {
                label: copy.attack.skillGroup,
                options: availableSkills.map((skill) => ({
                  id: skill.id,
                  label: skill.name,
                  icon: (
                    <CalculatorSkillIcon
                      name={skill.name}
                      numericId={skill.numericId}
                    />
                  ),
                })),
              },
            ]}
          />
        </Field>

        <Field label={copy.attack.levelLabel}>
          <NumberSelect
            max={selectedSkill.maxLevel}
            prefix="Lv."
            value={Math.min(skillLevel, selectedSkill.maxLevel)}
            onChange={onSkillLevelChange}
          />
        </Field>
      </div>

      <div className="attack-summary">
        <span>
          <strong>{selectedSkill.damageType}</strong>
          {copy.attack.damageTypeLabel}
        </span>
        <span>
          <strong>{selectedSkill.element ?? "weapon"}</strong>
          {copy.attack.elementLabel}
        </span>
        <span>
          <strong>{hitCount}</strong>
          {copy.attack.hitsLabel}
        </span>
        <span>
          <strong>{(multiplier / 100).toFixed(2)}x</strong>
          {copy.attack.multiplierLabel}
        </span>
      </div>

      {resultMeta.warnings.length > 0 || hasPrototypeWarning ? (
        <div className="attack-warning">
          <span>
            {copy.attack.formulaLabel}: {resultMeta.formulaId}
          </span>
          {hasPrototypeWarning ? <span>{resultMeta.note}</span> : null}
          {resultMeta.warnings.map((warning) => (
            <span key={warning}>{warning}</span>
          ))}
          {result ? (
            <span>
              {copy.attack.targetLabel}: {result.target.name}
            </span>
          ) : null}
        </div>
      ) : null}
    </aside>
  );
}
