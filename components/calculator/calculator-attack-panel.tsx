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
  
  const elementMap: Record<string, string> = {
    neutral: "Neutro", water: "Água", earth: "Terra", fire: "Fogo", wind: "Vento",
    poison: "Veneno", holy: "Sagrado", dark: "Sombrio", ghost: "Fantasma", undead: "Maldito"
  };
  const translatedElement = selectedSkill.element ? (elementMap[selectedSkill.element] || selectedSkill.element) : "Arma";
  const translatedDamageType = selectedSkill.damageType === "magical" ? "Mágico" : "Físico";

  return (
    <aside className="flex flex-col gap-4 p-5 rounded-xl border border-rose-500/10 bg-slate-900/40 shadow-[0_8px_30px_rgb(0,0,0,0.3)] backdrop-blur-md">
      <PanelHeader
        icon={<Crosshair size={17} />}
        title={copy.attack.title}
        meta={hasPrototypeWarning ? copy.attack.prototypeMeta : undefined}
      />

      <div className="grid grid-cols-[minmax(0,1fr)_140px] gap-3">
        <Field label={copy.attack.skillLabel}>
          <RichSelect
            value={selectedSkill.id}
            onChange={onSkillChange}
            searchPlaceholder={copy.attack.searchPlaceholder}
            className="bg-slate-950/60 border-slate-700/50"
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
            fit="fill"
            max={selectedSkill.maxLevel}
            prefix="Lv."
            value={Math.min(skillLevel, selectedSkill.maxLevel)}
            onChange={onSkillLevelChange}
          />
        </Field>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 mt-2">
        <div className="flex flex-col p-2.5 rounded-lg bg-slate-900/60 border border-slate-700/50">
          <strong className="text-xs font-bold text-slate-200 capitalize">{translatedDamageType}</strong>
          <span className="text-[10px] text-slate-500 uppercase tracking-wider mt-0.5">{copy.attack.damageTypeLabel}</span>
        </div>
        <div className="flex flex-col p-2.5 rounded-lg bg-slate-900/60 border border-slate-700/50">
          <strong className="text-xs font-bold text-slate-200 capitalize">{translatedElement}</strong>
          <span className="text-[10px] text-slate-500 uppercase tracking-wider mt-0.5">{copy.attack.elementLabel}</span>
        </div>
        <div className="flex flex-col p-2.5 rounded-lg bg-slate-900/60 border border-slate-700/50">
          <strong className="text-xs font-bold text-slate-200">{hitCount}</strong>
          <span className="text-[10px] text-slate-500 uppercase tracking-wider mt-0.5">{copy.attack.hitsLabel}</span>
        </div>
        <div className="flex flex-col p-2.5 rounded-lg bg-slate-900/60 border border-slate-700/50">
          <strong className="text-xs font-bold text-slate-200">{(multiplier / 100).toFixed(2)}x</strong>
          <span className="text-[10px] text-slate-500 uppercase tracking-wider mt-0.5">{copy.attack.multiplierLabel}</span>
        </div>
      </div>
    </aside>
  );
}
