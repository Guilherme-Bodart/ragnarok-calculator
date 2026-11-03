"use client";

import { Crosshair, Sparkles, Zap } from "lucide-react";
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
import { useCalculatorBuildStore } from "./calculator-build-store";
import { getBreakdownValue } from "./calculator-utils";

export type CalculatorAttackSkill = RoSkill & {
  numericId?: number;
};

type CalculatorAttackPanelProps = {
  availableSkills: CalculatorAttackSkill[];
  copy: CalculatorDictionary;
  resultMeta: CalculationMeta;
  selectedSkill: CalculatorAttackSkill;
  result?: CalculateDamageResult;
};

export function CalculatorAttackPanel({
  availableSkills,
  copy,
  resultMeta,
  selectedSkill,
  result,
}: CalculatorAttackPanelProps) {
  const selectedSkillId = useCalculatorBuildStore((s) => s.selectedSkillId);
  const setSelectedSkillId = useCalculatorBuildStore(
    (s) => s.setSelectedSkillId,
  );

  const skillLevel = useCalculatorBuildStore((s) => s.skillLevel);
  const setSkillLevel = useCalculatorBuildStore((s) => s.setSkillLevel);

  function handleSkillChange(skillId: string) {
    const nextSkill =
      availableSkills.find((skill) => skill.id === skillId) ?? selectedSkill;

    setSelectedSkillId(nextSkill.id);
    setSkillLevel(Math.min(skillLevel, nextSkill.maxLevel));
  }

  const effectiveSkillLevel = Math.min(skillLevel, selectedSkill.maxLevel);

  const breakdownHits = result
    ? Number(getBreakdownValue(result.breakdown, "hits"))
    : 0;
  const hitCount =
    breakdownHits > 0
      ? breakdownHits
      : (selectedSkill.hitCountByLevel?.[String(effectiveSkillLevel)] ??
        selectedSkill.hitCount);

  const breakdownMultiplier = result
    ? Number(getBreakdownValue(result.breakdown, "skillMultiplier"))
    : 0;
  const fallbackMultiplierPercent =
    selectedSkill.baseMultiplierByLevel[String(effectiveSkillLevel)] ??
    selectedSkill.baseMultiplierByLevel[String(selectedSkill.maxLevel)] ??
    100;
  const effectiveMultiplierRatio =
    breakdownMultiplier > 0
      ? breakdownMultiplier
      : fallbackMultiplierPercent / 100;
  const effectiveMultiplierPercent = Math.round(effectiveMultiplierRatio * 100);

  const hasPrototypeWarning = resultMeta.precision === "prototype";

  const elementMap: Record<string, string> = {
    neutral: "Neutro",
    water: "Água",
    earth: "Terra",
    fire: "Fogo",
    wind: "Vento",
    poison: "Veneno",
    holy: "Sagrado",
    dark: "Sombrio",
    ghost: "Fantasma",
    undead: "Maldito",
    weapon: "Arma",
  };
  const rawElement =
    result?.breakdown.find((b) => b.key === "attackElement")?.value ??
    selectedSkill.element ??
    "weapon";
  const translatedElement =
    elementMap[String(rawElement).toLowerCase()] || String(rawElement);
  const translatedDamageType =
    selectedSkill.damageType === "magical" ? "Mágico" : "Físico";

  return (
    <aside className="flex flex-col gap-4 p-5 rounded-xl border border-sky-500/20 bg-[#020612]/85 shadow-xl backdrop-blur-xl">
      <PanelHeader
        icon={<Crosshair size={16} className="text-sky-400" />}
        title={copy.attack.title}
        meta={
          hasPrototypeWarning ? copy.attack.prototypeMeta : resultMeta.formulaId
        }
      />

      <div className="grid grid-cols-1 sm:grid-cols-[minmax(0,1fr)_140px] gap-3">
        <Field label={copy.attack.skillLabel}>
          <RichSelect
            value={selectedSkillId}
            onChange={handleSkillChange}
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
            fit="fill"
            max={selectedSkill.maxLevel}
            prefix="Lv."
            value={effectiveSkillLevel}
            onChange={setSkillLevel}
          />
        </Field>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
        <div className="flex flex-col p-3 rounded-lg bg-slate-900/70 border border-slate-800/80">
          <span className="text-[10px] text-slate-400 uppercase font-bold tracking-wider">
            {copy.attack.damageTypeLabel}
          </span>
          <strong className="text-sm font-black text-slate-100 capitalize mt-1 flex items-center gap-1.5">
            {selectedSkill.damageType === "magical" ? (
              <Sparkles size={13} className="text-indigo-400 shrink-0" />
            ) : (
              <Zap size={13} className="text-amber-400 shrink-0" />
            )}
            {translatedDamageType}
          </strong>
        </div>

        <div className="flex flex-col p-3 rounded-lg bg-slate-900/70 border border-slate-800/80">
          <span className="text-[10px] text-slate-400 uppercase font-bold tracking-wider">
            {copy.attack.elementLabel}
          </span>
          <strong className="text-sm font-black text-sky-200 capitalize mt-1">
            {translatedElement}
          </strong>
        </div>

        <div className="flex flex-col p-3 rounded-lg bg-slate-900/70 border border-slate-800/80">
          <span className="text-[10px] text-slate-400 uppercase font-bold tracking-wider">
            {copy.attack.hitsLabel}
          </span>
          <strong className="text-sm font-black text-slate-100 mt-1 tabular-nums">
            {hitCount} {hitCount === 1 ? "hit" : "hits"}
          </strong>
        </div>

        <div className="flex flex-col p-3 rounded-lg bg-sky-950/30 border border-sky-500/25">
          <span className="text-[10px] text-sky-300/80 uppercase font-bold tracking-wider">
            {copy.attack.multiplierLabel}
          </span>
          <div className="flex items-baseline gap-1.5 mt-1">
            <strong className="text-sm font-black text-sky-300 tabular-nums">
              {effectiveMultiplierPercent.toLocaleString()}%
            </strong>
            <small className="text-[10px] font-mono text-slate-400">
              ({effectiveMultiplierRatio.toFixed(2)}x)
            </small>
          </div>
        </div>
      </div>
    </aside>
  );
}
