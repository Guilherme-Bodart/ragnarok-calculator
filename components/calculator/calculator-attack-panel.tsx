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
import { CalculatorSkillIcon } from "./calculator-skill-icon";

export type CalculatorAttackSkill = RoSkill & {
  numericId?: number;
};

type CalculatorAttackPanelProps = {
  availableSkills: CalculatorAttackSkill[];
  resultMeta: CalculationMeta;
  selectedSkill: CalculatorAttackSkill;
  skillLevel: number;
  onSkillChange: (skillId: string) => void;
  onSkillLevelChange: (skillLevel: number) => void;
  result?: CalculateDamageResult;
};

export function CalculatorAttackPanel({
  availableSkills,
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
        title="Ataque"
        meta={hasPrototypeWarning ? "Formula prototipo" : resultMeta.precision}
      />

      <div className="attack-picker-grid">
        <Field label="Habilidade">
          <RichSelect
            value={selectedSkill.id}
            onChange={onSkillChange}
            searchPlaceholder="Filtrar skill"
            groups={[
              {
                label: "Skills",
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

        <Field label="Nivel">
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
          Tipo
        </span>
        <span>
          <strong>{selectedSkill.element ?? "weapon"}</strong>
          Elemento
        </span>
        <span>
          <strong>{hitCount}</strong>
          Hits
        </span>
        <span>
          <strong>{(multiplier / 100).toFixed(2)}x</strong>
          Multiplicador
        </span>
      </div>

      {resultMeta.warnings.length > 0 || hasPrototypeWarning ? (
        <div className="attack-warning">
          {hasPrototypeWarning ? <span>{resultMeta.note}</span> : null}
          {resultMeta.warnings.map((warning) => (
            <span key={warning}>{warning}</span>
          ))}
          {result ? <span>Alvo: {result.target.name}</span> : null}
        </div>
      ) : null}
    </aside>
  );
}
