"use client";

import { useMemo } from "react";
import {
  calculateDamageFromDataset,
} from "@/packages/calculator-core/src";
import { calculatorDemoInput } from "./calculator-demo-data";

type CalculatorDataset = Parameters<typeof calculateDamageFromDataset>[1];
type CalculatorInput = Parameters<typeof calculateDamageFromDataset>[0];

export function useCalculatorResult({
  activeBuffItemIds,
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
  baseLevel: number;
  calculatorDataset: CalculatorDataset;
  effectiveLearnedSkills: CalculatorInput["learnedSkills"];
  itemContexts: Record<number, { refine?: number }>;
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
          ...calculatorDemoInput,
          character: {
            ...calculatorDemoInput.character,
            classId: selectedClassId,
            baseLevel,
            jobLevel,
            isTranscendent: selectedClassId.includes("_T"),
            stats,
          },
          learnedSkills: effectiveLearnedSkills,
          equipmentItemIds: resolvedEquipmentItemIds,
          cardItemIds: resolvedCardItemIds,
          buffItemIds: [...calculatorDemoInput.buffItemIds, ...activeBuffItemIds],
          itemContexts: Object.entries(itemContexts).map(([itemId, context]) => ({
            itemId: Number(itemId),
            refine: context.refine,
          })),
          monsterId: selectedMonsterId,
          skillId: selectedSkillId,
          skillLevel,
        },
        calculatorDataset,
      ),
    [
      activeBuffItemIds,
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
