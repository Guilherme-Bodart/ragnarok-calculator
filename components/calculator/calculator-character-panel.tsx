"use client";

import type { ReactNode } from "react";
import { Activity } from "lucide-react";
import { PanelHeader } from "@/components/ui/panel-header";
import { AnimatedNumber } from "@/components/ui/animated-number";
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
import {
  isFourthJobClassId,
  isTranscendentEquivalentClassId,
} from "./calculator-class-rules";

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
  statBonuses,
  copy,
  skillTreeSlot,
}: CalculatorCharacterPanelProps) {
  const baseLevel = useCalculatorBuildStore((s) => s.baseLevel);
  const jobLevel = useCalculatorBuildStore((s) => s.jobLevel);
  const stats = useCalculatorBuildStore((s) => s.stats);
  const setStats = useCalculatorBuildStore((s) => s.setStats);
  const selectedClassId = useCalculatorBuildStore((s) => s.selectedClassId);

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

  function handleResetStats() {
    setStats({
      str: 1,
      agi: 1,
      vit: 1,
      int: 1,
      dex: 1,
      luk: 1,
      pow: 0,
      sta: 0,
      wis: 0,
      spl: 0,
      con: 0,
      crt: 0,
    });
  }

  const regularRatio =
    statusBudget.regular.available > 0
      ? Math.min(
          100,
          Math.round(
            (statusBudget.regular.spent / statusBudget.regular.available) * 100,
          ),
        )
      : 0;
  const regularRemaining = Math.max(
    0,
    statusBudget.regular.available - statusBudget.regular.spent,
  );

  const traitRatio =
    statusBudget.trait.available > 0
      ? Math.min(
          100,
          Math.round(
            (statusBudget.trait.spent / statusBudget.trait.available) * 100,
          ),
        )
      : 0;
  const traitRemaining = Math.max(
    0,
    statusBudget.trait.available - statusBudget.trait.spent,
  );

  return (
    <section className="flex flex-col gap-4 backdrop-blur-xl bg-[#020612]/85 border border-sky-500/20 rounded-xl p-5 shadow-xl relative overflow-hidden">
      <PanelHeader
        icon={<Activity size={16} className="text-sky-400" />}
        title={copy.character.title}
        meta={
          <span className="text-sky-200 text-xs font-mono font-bold tracking-wide">
            Base {baseLevel} / Job {jobLevel}
          </span>
        }
      />

      <CalculatorCharacterControls copy={copy} />

      {skillTreeSlot}

      <div
        className={`grid gap-3 ${
          isFourthJob ? "grid-cols-1 md:grid-cols-2" : "grid-cols-1"
        }`}
      >
        {/* Status Points Budget Card */}
        <div
          className="flex flex-col gap-2 p-3 rounded-xl border border-slate-800/85 bg-slate-950/60"
          aria-live="polite"
        >
          <div className="flex justify-between items-center text-xs">
            <span className="text-slate-300 font-bold tracking-wider uppercase text-[10.5px]">
              {copy.character.statusPoints}
            </span>
            <div className="flex items-center gap-2 font-mono tabular-nums">
              <span className="text-[10.5px] text-emerald-400 font-bold">
                Restam:{" "}
                <AnimatedNumber value={regularRemaining} />
              </span>
              <strong className="text-sky-300 text-xs">
                (<AnimatedNumber value={statusBudget.regular.spent} showDelta={false} /> /{" "}
                {statusBudget.regular.available})
              </strong>
            </div>
          </div>
          <div className="w-full h-1.5 rounded-full bg-slate-900 overflow-hidden">
            <div
              className="h-full bg-gradient-to-r from-sky-500 to-cyan-300 shadow-[0_0_10px_rgba(56,189,248,0.45)] transition-[width] duration-300 ease-out"
              style={{ width: `${regularRatio}%` }}
            />
          </div>
        </div>

        {/* Trait Points Budget Card */}
        {isFourthJob ? (
          <div className="flex flex-col gap-2 p-3 rounded-xl border border-slate-800/85 bg-slate-950/60">
            <div className="flex justify-between items-center text-xs">
              <span className="text-slate-300 font-bold tracking-wider uppercase text-[10.5px]">
                {copy.character.traitPoints}
              </span>
              <div className="flex items-center gap-2 font-mono tabular-nums">
                <span className="text-[10.5px] text-amber-400 font-bold">
                  Restam:{" "}
                  <AnimatedNumber value={traitRemaining} />
                </span>
                <strong className="text-amber-200 text-xs">
                  (<AnimatedNumber value={statusBudget.trait.spent} showDelta={false} /> /{" "}
                  {statusBudget.trait.available})
                </strong>
              </div>
            </div>
            <div className="w-full h-1.5 rounded-full bg-slate-900 overflow-hidden">
              <div
                className="h-full bg-gradient-to-r from-amber-500 to-yellow-300 shadow-[0_0_10px_rgba(245,158,11,0.4)] transition-[width] duration-300 ease-out"
                style={{ width: `${traitRatio}%` }}
              />
            </div>
          </div>
        ) : null}
      </div>

      <CalculatorCharacterStats
        isFourthJob={isFourthJob}
        stats={stats}
        statBonuses={statBonuses}
        onStatChange={handleStatChange}
        onResetStats={handleResetStats}
      />
    </section>
  );
}
