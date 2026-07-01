"use client";

import type { ReactNode } from "react";
import { Activity } from "lucide-react";
import { PanelHeader } from "@/components/ui/panel-header";
import {
  evaluateStatusPointBudget,
  type CharacterStats,
  type CharacterStatus,
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
  characterStatus: CharacterStatus;
  copy: CalculatorDictionary;
  isFourthJob: boolean;
  isTranscendent?: boolean;
  jobLevel: number;
  selectedClassId: string;
  skillTreeSlot: ReactNode;
  stats: CharacterStats;
  onBaseLevelChange: (baseLevel: number) => void;
  onClassChange: (classId: string) => void;
  onJobLevelChange: (jobLevel: number) => void;
  onStatsChange: (stats: CharacterStats) => void;
};

export function CalculatorCharacterPanel({
  baseLevel,
  characterStatus,
  copy,
  isFourthJob,
  isTranscendent,
  jobLevel,
  selectedClassId,
  skillTreeSlot,
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
    <section className="flex flex-col gap-3">
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

      {skillTreeSlot}

      <div className={`grid gap-x-8 gap-y-4 ${isFourthJob ? 'grid-cols-1 md:grid-cols-2' : 'grid-cols-1 md:grid-cols-2 max-w-4xl'}`}>
        <div className="flex justify-between items-center text-xs p-3 rounded-lg border border-slate-700/50 bg-slate-900/60" aria-live="polite">
          <span className="text-slate-400 font-medium">{copy.character.statusPoints}</span>
          <strong className="text-sky-300 font-mono text-sm">
            {statusBudget.regular.spent} / {statusBudget.regular.available}
          </strong>
        </div>
        
        {isFourthJob ? (
          <div className="flex justify-between items-center text-xs p-3 rounded-lg border border-slate-700/50 bg-slate-900/60">
            <span className="text-slate-400 font-medium">{copy.character.traitPoints}</span>
            <strong className="text-amber-300 font-mono text-sm">
              {statusBudget.trait.spent} / {statusBudget.trait.available}
            </strong>
          </div>
        ) : <div />}
      </div>

      <CalculatorCharacterStats
        isFourthJob={isFourthJob}
        stats={stats}
        onStatChange={handleStatChange}
      />
    </section>
  );
}
