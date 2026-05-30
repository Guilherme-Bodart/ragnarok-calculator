"use client";

import { Activity } from "lucide-react";
import { PanelHeader } from "@/components/ui/panel-header";
import {
  evaluateStatusPointBudget,
  type CharacterStats,
  type RoSkill,
} from "@/packages/calculator-core/src";
import { CalculatorCharacterControls } from "./calculator-character-controls";
import { CalculatorCharacterStats } from "./calculator-character-stats";
import {
  getCalculatorPresetStats,
  resolveNextCalculatorStats,
  type VisibleCalculatorStat,
} from "./calculator-character-utils";
import type { CalculatorDictionary } from "./calculator-i18n";

export type CalculatorPanelSkill = RoSkill & {
  numericId?: number;
};

type CalculatorCharacterPanelProps = {
  availableSkills: CalculatorPanelSkill[];
  baseLevel: number;
  copy: CalculatorDictionary;
  isFourthJob: boolean;
  isTranscendent?: boolean;
  jobLevel: number;
  selectedClassId: string;
  selectedClassName: string;
  skillLevel: number;
  selectedSkill: CalculatorPanelSkill;
  stats: CharacterStats;
  onBaseLevelChange: (baseLevel: number) => void;
  onJobLevelChange: (jobLevel: number) => void;
  onSkillChange: (skill: CalculatorPanelSkill) => void;
  onSkillLevelChange: (skillLevel: number) => void;
  onStatsChange: (stats: CharacterStats) => void;
};

export function CalculatorCharacterPanel({
  availableSkills,
  baseLevel,
  copy,
  isFourthJob,
  isTranscendent,
  jobLevel,
  selectedClassId,
  selectedClassName,
  skillLevel,
  selectedSkill,
  stats,
  onBaseLevelChange,
  onJobLevelChange,
  onSkillChange,
  onSkillLevelChange,
  onStatsChange,
}: CalculatorCharacterPanelProps) {
  const statusBudget = evaluateStatusPointBudget({
    baseLevel,
    isFourthJob,
    isTranscendent,
    stats,
  });

  function handleStatChange(stat: VisibleCalculatorStat, rawValue: number) {
    onStatsChange(
      resolveNextCalculatorStats({
        baseLevel,
        isFourthJob,
        isTranscendent,
        rawValue,
        stat,
        stats,
      }),
    );
  }

  function applyPreset(preset: "third" | "fourth" | "max") {
    const presetBuild = getCalculatorPresetStats(preset, isFourthJob);

    onBaseLevelChange(presetBuild.baseLevel);
    onJobLevelChange(presetBuild.jobLevel);
    onStatsChange(presetBuild.stats);
  }

  return (
    <aside className="calc-panel calc-character">
      <PanelHeader
        icon={<Activity size={17} />}
        title={copy.character.title}
        meta={`Base ${baseLevel} / Job ${jobLevel}`}
      />

      <CalculatorCharacterControls
        availableSkills={availableSkills}
        baseLevel={baseLevel}
        copy={copy}
        isFourthJob={isFourthJob}
        jobLevel={jobLevel}
        selectedClassId={selectedClassId}
        selectedClassName={selectedClassName}
        selectedSkill={selectedSkill}
        skillLevel={skillLevel}
        onBaseLevelChange={onBaseLevelChange}
        onJobLevelChange={onJobLevelChange}
        onPresetApply={applyPreset}
        onSkillChange={onSkillChange}
        onSkillLevelChange={onSkillLevelChange}
      />

      <CalculatorCharacterStats
        isFourthJob={isFourthJob}
        stats={stats}
        onStatChange={handleStatChange}
      />

      <div className="stat-budget" aria-live="polite">
        <span>
          {copy.character.statusPoints}:{" "}
          <strong>
            {statusBudget.regular.spent}/{statusBudget.regular.available}
          </strong>
          <small>
            {copy.character.remainingPoints}: {statusBudget.regular.remaining}
          </small>
        </span>
        {isFourthJob ? (
          <span>
            {copy.character.traitPoints}:{" "}
            <strong>
              {statusBudget.trait.spent}/{statusBudget.trait.available}
            </strong>
            <small>
              {copy.character.remainingPoints}: {statusBudget.trait.remaining}
            </small>
          </span>
        ) : null}
      </div>
    </aside>
  );
}
