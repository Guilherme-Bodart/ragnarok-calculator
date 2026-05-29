import type { CalculatorPanelSkill } from "./calculator-character-panel";

export const calculatorManualBuffItems = [
  {
    itemId: 900001,
    name: "Blessing",
    type: "Consumable",
    rawScript: "bonus bStr,10; bonus bInt,10; bonus bDex,10;",
    source: "rathena",
  },
  {
    itemId: 900002,
    name: "Increase AGI",
    type: "Consumable",
    rawScript: "bonus bAgi,10;",
    source: "rathena",
  },
  {
    itemId: 900003,
    name: "Food +10",
    type: "Consumable",
    rawScript: "bonus bAllStats,10;",
    source: "rathena",
  },
  {
    itemId: 900004,
    name: "Guild Aura",
    type: "Consumable",
    rawScript: "bonus bAtkRate,5; bonus bMatkRate,5;",
    source: "rathena",
  },
] as const;

export const calculatorManualBuffSkills: CalculatorPanelSkill[] =
  calculatorManualBuffItems.map((item) => ({
    id: `BUFF_${item.itemId}`,
    name: item.name,
    classTree: "manual-buffs",
    damageType: "physical",
    element: "neutral",
    maxLevel: 1,
    hitCount: 1,
    baseMultiplierByLevel: {
      "1": 100,
    },
    source: "manual",
  }));

const manualBuffItemIdBySkillId = new Map(
  calculatorManualBuffItems.map((item) => [
    `BUFF_${item.itemId}`,
    item.itemId as number,
  ]),
);

export function getActiveCalculatorBuffItemIds(activeBuffs: Record<string, number>) {
  return Object.keys(activeBuffs)
    .map((buffId) => manualBuffItemIdBySkillId.get(buffId))
    .filter((itemId): itemId is number => typeof itemId === "number");
}
