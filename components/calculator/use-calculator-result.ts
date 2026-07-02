"use client";

import { useMemo } from "react";
import {
  calculateDamageFromDataset,
} from "@/packages/calculator-core/src";
import { isTranscendentEquivalentClassId } from "./calculator-class-rules";
import { defaultCalculatorInput } from "./calculator-base-data";

type CalculatorDataset = Parameters<typeof calculateDamageFromDataset>[1];
type CalculatorInput = Parameters<typeof calculateDamageFromDataset>[0];

export function useCalculatorResult({
  activeBuffItemIds,
  activeBuffs,
  baseLevel,
  calculatorDataset,
  effectiveLearnedSkills,
  itemContexts,
  jobLevel,
  resolvedCardItemIds,
  resolvedEquipmentItemIds,
  selectedClassId,
  selectedMonsterId,
  selectedSkillId,
  skillLevel,
  stats,
}: {
  activeBuffItemIds: number[];
  activeBuffs: Record<string, number>;
  baseLevel: number;
  calculatorDataset: CalculatorDataset;
  effectiveLearnedSkills: CalculatorInput["learnedSkills"];
  itemContexts: Record<number, { refine?: number; grade?: number }>;
  jobLevel: number;
  resolvedCardItemIds: number[];
  resolvedEquipmentItemIds: number[];
  selectedClassId: string;
  selectedMonsterId: number;
  selectedSkillId: string;
  skillLevel: number;
  stats: CalculatorInput["character"]["stats"];
}) {
  return useMemo(
    () =>
      calculateDamageFromDataset(
        {
          ...defaultCalculatorInput,
          character: {
            ...defaultCalculatorInput.character,
            classId: selectedClassId,
            baseLevel,
            jobLevel,
            isTranscendent: isTranscendentEquivalentClassId(selectedClassId),
            stats,
          },
          learnedSkills: effectiveLearnedSkills,
          equipmentItemIds: resolvedEquipmentItemIds,
          cardItemIds: resolvedCardItemIds,
          buffItemIds: [...defaultCalculatorInput.buffItemIds, ...activeBuffItemIds],
          activeBuffs,
          itemContexts: Object.entries(itemContexts).map(([itemId, context]) => ({
            itemId: Number(itemId),
            refine: context.refine,
            grade: context.grade,
          })),
          monsterId: calculatorDataset.monsters[0]?.id ?? selectedMonsterId,
          skillId: selectedSkillId,
          skillLevel,
        },
        calculatorDataset,
      ),
    [
      activeBuffItemIds,
      activeBuffs,
      baseLevel,
      calculatorDataset,
      effectiveLearnedSkills,
      itemContexts,
      jobLevel,
      resolvedCardItemIds,
      resolvedEquipmentItemIds,
      selectedClassId,
      selectedMonsterId,
      selectedSkillId,
      skillLevel,
      stats,
    ],
  );
}
