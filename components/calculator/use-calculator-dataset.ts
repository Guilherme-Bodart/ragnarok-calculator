"use client";

import { useMemo } from "react";
import type { RoItem, RoMonster } from "@/packages/calculator-core/src";
import {
  calculatorDemoDataset,
} from "./calculator-demo-data";
import type { CalculatorItemDetail } from "./calculator-item-data";
import type { CalculatorMonsterDetail } from "./calculator-monster-data";
import { mergeCalculatorSkills } from "./calculator-skill-classification";

type CalculatorSkill = (typeof calculatorDemoDataset.skills)[number];

export function useCalculatorDataset({
  selectedCalculatorItems,
  selectedClassSkills,
  selectedMonsterDetail,
}: {
  selectedCalculatorItems: CalculatorItemDetail[];
  selectedClassSkills: CalculatorSkill[];
  selectedMonsterDetail?: CalculatorMonsterDetail | null;
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
      monsters: mergeCalculatorMonsters(
        calculatorDemoDataset.monsters,
        selectedMonsterDetail,
      ),
    }),
    [selectedCalculatorItems, selectedClassSkills, selectedMonsterDetail],
  );
}

function mergeCalculatorItems(baseItems: RoItem[], selectedItems: RoItem[]) {
  const itemById = new Map(baseItems.map((item) => [item.id, item]));

  for (const item of selectedItems) {
    itemById.set(item.id, item);
  }

  return Array.from(itemById.values());
}

function mergeCalculatorMonsters(
  baseMonsters: RoMonster[],
  selectedMonster?: RoMonster | null,
) {
  if (!selectedMonster) {
    return baseMonsters;
  }

  const monsterById = new Map(baseMonsters.map((monster) => [monster.id, monster]));

  monsterById.set(selectedMonster.id, selectedMonster);

  return Array.from(monsterById.values());
}
