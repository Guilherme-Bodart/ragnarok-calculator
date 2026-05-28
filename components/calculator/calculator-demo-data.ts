import {
  calculateDamageFromDataset,
  createCalculatorDatasetFromRathenaNormalized,
  type CalculateDamageInput,
} from "@/packages/calculator-core/src";

export const calculatorDemoDataset = createCalculatorDatasetFromRathenaNormalized({
  items: [],
  monsters: [
    {
      monsterId: 1002,
      name: "Poring",
      level: 1,
      hp: 55,
      defense: 2,
      magicDefense: 5,
      size: "Medium",
      race: "Plant",
      element: "Water",
      elementLevel: 1,
      source: "rathena",
    },
  ],
  skills: [
    {
      skillId: 5,
      name: "SM_BASH",
      description: "Bash",
      maxLevel: 10,
      type: "Weapon",
      targetType: "Attack",
      hit: "Single",
      element: "Weapon",
      rawDamageFlags: null,
      raw: {
        HitCount: 1,
      },
      source: "rathena",
    },
  ],
});

export const calculatorDemoInput: CalculateDamageInput = {
  ruleset: {
    server: "latam",
    mechanics: "renewal",
  },
  learnedSkills: {},
  character: {
    classId: "dragon-knight",
    baseLevel: 260,
    jobLevel: 55,
    stats: {
      str: 120,
      agi: 90,
      vit: 100,
      int: 1,
      dex: 100,
      luk: 60,
      pow: 80,
      sta: 0,
      wis: 0,
      spl: 0,
      con: 45,
      crt: 0,
    },
  },
  equipmentItemIds: [],
  cardItemIds: [],
  buffItemIds: [],
  itemContexts: [],
  monsterId: 1002,
  skillId: "SM_BASH",
  skillLevel: 10,
};

export const calculatorDemoResult = calculateDamageFromDataset(
  calculatorDemoInput,
  calculatorDemoDataset,
);
