import {
  calculateDamageFromDataset,
  createCalculatorDatasetFromRathenaNormalized,
  type CalculateDamageInput,
} from "@/packages/calculator-core/src";
import { calculatorManualBuffItems } from "./calculator-buff-data";

export const calculatorDemoDataset = createCalculatorDatasetFromRathenaNormalized({
  items: [...calculatorManualBuffItems],
  monsters: [],
  skills: [],
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
  equipmentItemIds: [],
  cardItemIds: [],
  buffItemIds: [],
  itemContexts: [],
  monsterId: 1002,
  skillId: "AG_SOUL_VC_STRIKE",
  skillLevel: 5,
};

export const calculatorDemoResult = calculateDamageFromDataset(
  calculatorDemoInput,
  calculatorDemoDataset,
);
