"use client";

import type { ReactNode } from "react";
import { Activity } from "lucide-react";
import { PanelHeader } from "@/components/ui/panel-header";
import {
  evaluateStatusPointBudget,
  type CharacterStatus,
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
import { useCalculatorBuildStore } from "./calculator-build-store";
import { isFourthJobClassId, isTranscendentEquivalentClassId } from "./calculator-class-rules";

export type CalculatorPanelSkill = RoSkill & {
  numericId?: number;
};

type CalculatorCharacterPanelProps = {
  characterStatus: CharacterStatus;
  statBonuses?: Partial<CharacterStats>;
  copy: CalculatorDictionary;
  skillTreeSlot: ReactNode;
};

export function CalculatorCharacterPanel({
  characterStatus,
  statBonuses,
  copy,
  skillTreeSlot,
}: CalculatorCharacterPanelProps) {
  const baseLevel = useCalculatorBuildStore((s) => s.baseLevel);
  const setBaseLevel = useCalculatorBuildStore((s) => s.setBaseLevel);
  
  const jobLevel = useCalculatorBuildStore((s) => s.jobLevel);
  const setJobLevel = useCalculatorBuildStore((s) => s.setJobLevel);
  
  const stats = useCalculatorBuildStore((s) => s.stats);
  const setStats = useCalculatorBuildStore((s) => s.setStats);
  
  const selectedClassId = useCalculatorBuildStore((s) => s.selectedClassId);
  // Não podemos chamar o store.handleClassChange diretamente se precisarmos passar manualBuffSkills.
  // Porém, esse panel não faz a mudança de classe de verdade? Ah, ele repassa onClassChange pro Controls.
  // Vamos ver como o onClassChange era feito... ele usava o handleClassChange que precisava de manualBuffSkills.
  // Será melhor passar onClassChange como prop apenas?
  // O plano Fase 2 é remover prop drilling. 
  
  const isFourthJob = isFourthJobClassId(selectedClassId);
  const isTranscendent = isTranscendentEquivalentClassId(selectedClassId);

  const statusBudget = evaluateStatusPointBudget({
    baseLevel,
    isFourthJob,
    isTranscendent,
    stats,
  });

  function handleStatChange(stat: VisibleCalculatorStat, rawValue: number) {
    setStats(
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
    <section className="flex flex-col gap-4 backdrop-blur-md bg-[#020612]/60 border border-white/5 rounded-2xl p-5 shadow-2xl relative overflow-hidden">
      {/* Glow effect */}
      <div className="absolute top-0 left-1/4 w-1/2 h-px bg-gradient-to-r from-transparent via-sky-500/50 to-transparent"></div>

      <PanelHeader
        icon={<Activity size={17} />}
        title={copy.character.title}
        meta={<span className="text-slate-200 text-xs font-semibold tracking-wide">Base {baseLevel} / Job {jobLevel}</span>}
      />

      <CalculatorCharacterControls
        copy={copy}
      />

      {skillTreeSlot}

      <div className={`grid gap-x-6 gap-y-4 ${isFourthJob ? 'grid-cols-1 md:grid-cols-2' : 'grid-cols-1'}`}>
        <div className="flex justify-between items-center text-xs p-4 rounded-xl border border-white/5 bg-white/[0.02] shadow-inner transition-colors hover:bg-white/[0.04]" aria-live="polite">
          <span className="text-slate-400 font-medium tracking-wide uppercase text-[10px]">{copy.character.statusPoints}</span>
          <strong className="text-sky-300 font-mono text-sm drop-shadow-md">
            {statusBudget.regular.spent} / {statusBudget.regular.available}
          </strong>
        </div>
        
        {isFourthJob ? (
          <div className="flex justify-between items-center text-xs p-4 rounded-xl border border-white/5 bg-white/[0.02] shadow-inner transition-colors hover:bg-white/[0.04]">
            <span className="text-slate-400 font-medium tracking-wide uppercase text-[10px]">{copy.character.traitPoints}</span>
            <strong className="text-amber-300 font-mono text-sm drop-shadow-md">
              {statusBudget.trait.spent} / {statusBudget.trait.available}
            </strong>
          </div>
        ) : null}
      </div>

      <CalculatorCharacterStats
        isFourthJob={isFourthJob}
        stats={stats}
        statBonuses={statBonuses}
        onStatChange={handleStatChange}
      />
    </section>
  );
}
