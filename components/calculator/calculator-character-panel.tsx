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
  resolveNextCalculatorStats,
  type VisibleCalculatorStat,
} from "./calculator-character-utils";
import type { CalculatorDictionary } from "./calculator-i18n";

export type CalculatorPanelSkill = RoSkill & {
  numericId?: number;
};

type CalculatorCharacterPanelProps = {
  baseLevel: number;
  copy: CalculatorDictionary;
  isFourthJob: boolean;
  isTranscendent?: boolean;
  jobLevel: number;
  selectedClassId: string;
  stats: CharacterStats;
  onBaseLevelChange: (baseLevel: number) => void;
  onClassChange: (classId: string) => void;
  onJobLevelChange: (jobLevel: number) => void;
  onStatsChange: (stats: CharacterStats) => void;
};

export function CalculatorCharacterPanel({
  baseLevel,
  copy,
  isFourthJob,
  isTranscendent,
  jobLevel,
  selectedClassId,
  stats,
  onBaseLevelChange,
  onClassChange,
  onJobLevelChange,
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

  return (
    <aside className="calc-panel calc-character">
      <PanelHeader
        icon={<Activity size={17} />}
        title={copy.character.title}
        meta={`Base ${baseLevel} / Job ${jobLevel}`}
      />

      <CalculatorCharacterControls
        baseLevel={baseLevel}
        copy={copy}
        isFourthJob={isFourthJob}
        jobLevel={jobLevel}
        selectedClassId={selectedClassId}
        onBaseLevelChange={onBaseLevelChange}
        onClassChange={onClassChange}
        onJobLevelChange={onJobLevelChange}
      />

      <CalculatorCharacterStats
        isFourthJob={isFourthJob}
        stats={stats}
        onStatChange={handleStatChange}
      />

      <div className="stat-budget" aria-live="polite">
        <div>
          <span>{copy.character.statusPoints}</span>
          <strong>
            {statusBudget.regular.spent}/{statusBudget.regular.available}
          </strong>
          <small>
            {copy.character.remainingPoints}: {statusBudget.regular.remaining}
          </small>
        </div>
        {isFourthJob ? (
          <div>
            <span>{copy.character.traitPoints}</span>
            <strong>
              {statusBudget.trait.spent}/{statusBudget.trait.available}
            </strong>
            <small>
              {copy.character.remainingPoints}: {statusBudget.trait.remaining}
            </small>
          </div>
        ) : null}
      </div>
    </aside>
  );
}
