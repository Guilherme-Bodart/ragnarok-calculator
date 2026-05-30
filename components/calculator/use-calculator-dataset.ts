"use client";

import { useMemo } from "react";
import type { RoItem } from "@/packages/calculator-core/src";
import {
  calculatorDemoDataset,
} from "./calculator-demo-data";
import type { CalculatorItemDetail } from "./calculator-item-data";
import { mergeCalculatorSkills } from "./calculator-skill-classification";

type CalculatorSkill = (typeof calculatorDemoDataset.skills)[number];

export function useCalculatorDataset({
  selectedCalculatorItems,
  selectedClassSkills,
}: {
  selectedCalculatorItems: CalculatorItemDetail[];
  selectedClassSkills: CalculatorSkill[];
}) {
  return useMemo(
    () => ({
      ...calculatorDemoDataset,
      items: mergeCalculatorItems(
        calculatorDemoDataset.items,
        selectedCalculatorItems,
      ),
      skills: mergeCalculatorSkills(
        calculatorDemoDataset.skills,
        selectedClassSkills,
      ),
    }),
    [selectedCalculatorItems, selectedClassSkills],
  );
}

function mergeCalculatorItems(baseItems: RoItem[], selectedItems: RoItem[]) {
  const itemById = new Map(baseItems.map((item) => [item.id, item]));

  for (const item of selectedItems) {
    itemById.set(item.id, item);
  }

  return Array.from(itemById.values());
}
