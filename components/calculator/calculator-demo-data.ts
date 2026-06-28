import {
  calculateDamageFromDataset,
  createCalculatorDatasetFromRathenaNormalized,
  type CalculateDamageInput,
} from "@/packages/calculator-core/src";
import { calculatorManualBuffItems } from "./calculator-buff-data";

export const calculatorDemoDataset = createCalculatorDatasetFromRathenaNormalized({
  items: [...calculatorManualBuffItems],
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
    {
      monsterId: 1031,
      name: "Poporing",
      level: 30,
      hp: 489,
      defense: 36,
      magicDefense: 17,
      size: "Medium",
      race: "Plant",
      element: "Poison",
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
    {
      skillId: 14,
      name: "MG_COLDBOLT",
      description: "Cold Bolt",
      maxLevel: 10,
      type: "Magic",
      targetType: "Attack",
      hit: "Multi_Hit",
      element: "Water",
      rawDamageFlags: null,
      raw: {
        HitCount: [
          { Level: 1, Count: 1 },
          { Level: 2, Count: 2 },
          { Level: 3, Count: 3 },
          { Level: 4, Count: 4 },
          { Level: 5, Count: 5 },
          { Level: 6, Count: 6 },
          { Level: 7, Count: 7 },
          { Level: 8, Count: 8 },
          { Level: 9, Count: 9 },
          { Level: 10, Count: 10 },
        ],
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
    classId: "Arch_Mage",
    isTranscendent: true,
    baseLevel: 229,
    jobLevel: 46,
    stats: {
      str: 20,
      agi: 103,
      vit: 100,
      int: 125,
      dex: 120,
      luk: 83,
      pow: 0,
      sta: 0,
      wis: 0,
      spl: 100,
      con: 14,
      crt: 0,
    },
  },
  equipmentItemIds: [
    640012, 18849, 410233, 420213, 450179, 480019, 470021, 32237, 490152, 24595,
    24584, 24585, 24586, 24587, 24588,
  ],
  cardItemIds: [300733, 27161, 29468, 29469, 29470, 29471],
  buffItemIds: [],
  itemContexts: [
    { itemId: 640012, refine: 11 },
    { itemId: 18849, refine: 9 },
    { itemId: 450179, refine: 11 },
    { itemId: 480019, refine: 9 },
    { itemId: 470021, refine: 9 },
  ],
  monsterId: 1002,
  skillId: "AG_SOUL_VC_STRIKE",
  skillLevel: 5,
};

export const calculatorDemoResult = calculateDamageFromDataset(
  calculatorDemoInput,
  calculatorDemoDataset,
);
