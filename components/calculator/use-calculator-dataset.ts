"use client";

import { useMemo } from "react";
import type { RoItem, RoMonster } from "@/packages/calculator-core/src";
import {
  baseCalculatorDataset,
} from "./calculator-base-data";
import type { CalculatorItemDetail } from "./calculator-item-data";
import type { CalculatorMonsterDetail } from "./calculator-monster-data";
import { mergeCalculatorSkills } from "./calculator-skill-classification";

type CalculatorSkill = (typeof baseCalculatorDataset.skills)[number];

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
      ...baseCalculatorDataset,
      items: mergeCalculatorItems(
        baseCalculatorDataset.items,
        selectedCalculatorItems,
      ),
      skills: mergeCalculatorSkills(
        baseCalculatorDataset.skills,
        selectedClassSkills,
      ),
      monsters: mergeCalculatorMonsters(
        baseCalculatorDataset.monsters,
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
  const monsterById = new Map(baseMonsters.map((monster) => [monster.id, monster]));

  if (selectedMonster) {
    monsterById.set(selectedMonster.id, selectedMonster);
  } else if (!monsterById.has(1002)) {
    // Add dummy Poring if nothing is selected and Poring is missing from base (unlikely, but just in case)
    monsterById.set(1002, {
      id: 1002,
      name: "Poring (Loading...)",
      level: 1,
      hp: 55,
      defense: 2,
      magicDefense: 5,
      size: "medium",
      race: "plant",
      element: "water",
      elementLevel: 1,
      source: "rathena",
      classType: "normal",
      baseExp: 0,
      jobExp: 0,
      attack: 0,
      magicAttack: 0,
      elementResistanceRates: {},
    } as any);
  }

  return Array.from(monsterById.values());
}
