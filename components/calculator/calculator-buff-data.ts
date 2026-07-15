import { CalculatorModifierEffectsFactory } from "@/packages/calculator-core/src";
import type { CalculatorPanelSkill } from "./calculator-character-panel";
import type { CalculatorDictionary } from "./calculator-i18n";

export const calculatorBuffCatalogVersion = 1;

export type CalculatorBuffGroup = "manual" | "class-skill" | "consumable";

export type CalculatorBuffCatalogEntry = {
  group: CalculatorBuffGroup;
  itemId: number;
  name: string;
  rawScript: string;
  source: "rathena";
  type: "Consumable";
};

export const calculatorManualBuffItems = [
  {
    group: "manual",
    itemId: 900001,
    name: "Blessing",
    type: "Consumable",
    rawScript: "bonus bStr,10; bonus bInt,10; bonus bDex,10; bonus bHit,10;",
    source: "rathena",
  },
  {
    group: "manual",
    itemId: 900002,
    name: "Increase AGI",
    type: "Consumable",
    rawScript: "bonus bAgi,10;",
    source: "rathena",
  },
  {
    group: "consumable",
    itemId: 900003,
    name: "Food +10",
    type: "Consumable",
    rawScript: "bonus bAllStats,10;",
    source: "rathena",
  },
  {
    group: "manual",
    itemId: 900004,
    name: "Guild Aura",
    type: "Consumable",
    rawScript: "bonus bAtkRate,5; bonus bMatkRate,5;",
    source: "rathena",
  },
  {
    group: "consumable",
    itemId: 900005,
    name: "Poção de Fúria Selvagem",
    type: "Consumable",
    rawScript: "bonus bAspdRate,20;",
    source: "rathena",
  },
  {
    group: "consumable",
    itemId: 900006,
    name: "Poção de Despertar",
    type: "Consumable",
    rawScript: "bonus bAspdRate,15;",
    source: "rathena",
  },
  {
    group: "consumable",
    itemId: 900007,
    name: "Poção de Concentração",
    type: "Consumable",
    rawScript: "bonus bAspdRate,10;",
    source: "rathena",
  },
  {
    group: "manual",
    itemId: 900008,
    name: "Buff VIP",
    type: "Consumable",
    rawScript: "bonus bAllStats,10; bonus bAtkRate,5; bonus bMatkRate,5; bonus bMaxHPrate,10; bonus bMaxSPrate,10;",
    source: "rathena",
  },
  {
    group: "manual",
    itemId: 900009,
    name: "Clementia (Nível Máximo)",
    type: "Consumable",
    rawScript: "bonus bStr,15; bonus bInt,15; bonus bDex,15;",
    source: "rathena",
  },
  {
    group: "manual",
    itemId: 900010,
    name: "Canto Candidus (Nível Máximo)",
    type: "Consumable",
    rawScript: "bonus bAgi,15;",
    source: "rathena",
  },
] as const satisfies readonly CalculatorBuffCatalogEntry[];

export const calculatorBuffCatalog = {
  version: calculatorBuffCatalogVersion,
  manual: calculatorManualBuffItems.filter((item) => item.group === "manual"),
  consumable: calculatorManualBuffItems.filter(
    (item) => item.group === "consumable",
  ),
} as const;

const manualBuffLabelByItemId: Record<number, keyof CalculatorDictionary["buffs"]> = {
  900001: "blessing",
  900002: "increaseAgi",
  900003: "food",
  900004: "guildAura",
};

export function getCalculatorManualBuffSkills(
  copy: CalculatorDictionary["buffs"],
): CalculatorPanelSkill[] {
  return calculatorManualBuffItems.map((item) => {
    const labelKey = manualBuffLabelByItemId[item.itemId];
    return {
      id: `BUFF_${item.itemId}`,
      name: labelKey ? copy[labelKey] : item.name,
      classTree: "manual-buffs",
      damageType: "physical",
      element: "neutral",
      maxLevel: 1,
      hitCount: 1,
      baseMultiplierByLevel: {
        "1": 100,
      },
      source: "manual",
    };
  });
}

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

export function getCalculatorBuffGroup(buffId: string): CalculatorBuffGroup {
  const itemId = manualBuffItemIdBySkillId.get(buffId);
  const item = calculatorManualBuffItems.find((candidate) => candidate.itemId === itemId);

  return item?.group ?? "class-skill";
}

export function getCalculatorBuffPreview(buffId: string) {
  const itemId = manualBuffItemIdBySkillId.get(buffId);
  const item = calculatorManualBuffItems.find((candidate) => candidate.itemId === itemId);

  if (!item) {
    return "Skill buff: aplicado pela arvore/classe quando suportado pelo core.";
  }

  const effects = new CalculatorModifierEffectsFactory().fromItems([
    {
      item: {
        id: item.itemId,
        name: item.name,
        kind: "consumable",
        rawScript: item.rawScript,
        source: item.source as any,
      }
    },
  ]);
  const previewParts = [
    ...Object.entries(effects.statBonuses)
      .filter(([, value]) => value !== 0)
      .map(([stat, value]) => `${stat.toUpperCase()} +${value}`),
    effects.atkRate ? `ATK +${effects.atkRate}%` : "",
    effects.matkRate ? `MATK +${effects.matkRate}%` : "",
    effects.flatAtk ? `ATK +${effects.flatAtk}` : "",
    effects.flatMatk ? `MATK +${effects.flatMatk}` : "",
  ].filter(Boolean);

  if (effects.unsupportedStatements.length > 0) {
    previewParts.push(`${effects.unsupportedStatements.length} efeito(s) pendente(s)`);
  }

  return previewParts.length > 0 ? previewParts.join(" · ") : "Sem efeito reconhecido";
}
