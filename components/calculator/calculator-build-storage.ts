import {
  calculatorBuildPayloadVersion,
  isCalculatorBuildPayload,
  type CalculatorBuildPayload,
} from "./calculator-build-payload";
import { calculatorDemoInput } from "./calculator-demo-data";

export const calculatorBuildStorageKey = "nightmare-calculator-build";

export function createDefaultCalculatorBuild(): CalculatorBuildPayload {
  return {
    version: calculatorBuildPayloadVersion,
    name: "Build local",
    activeBuffs: {},
    baseLevel: calculatorDemoInput.character.baseLevel,
    jobLevel: calculatorDemoInput.character.jobLevel,
    learnedSkills: {},
    itemContexts: {},
    selectedBuffId: "",
    selectedCardsBySlot: {},
    selectedClassId: calculatorDemoInput.character.classId ?? "Dragon_Knight",
    selectedItemsBySlot: {},
    selectedMonsterId: calculatorDemoInput.monsterId,
    selectedSkillId: calculatorDemoInput.skillId,
    skillLevel: calculatorDemoInput.skillLevel,
    stats: { ...calculatorDemoInput.character.stats },
  };
}

export function readSavedCalculatorBuild(): CalculatorBuildPayload {
  if (typeof window === "undefined") {
    return createDefaultCalculatorBuild();
  }

  const rawBuild = window.localStorage.getItem(calculatorBuildStorageKey);

  if (!rawBuild) {
    return createDefaultCalculatorBuild();
  }

  try {
    const parsedBuild = JSON.parse(rawBuild) as unknown;

    if (isCalculatorBuildPayload(parsedBuild)) {
      return parsedBuild;
    }
  } catch {
    // Fall through to the default build.
  }

  return createDefaultCalculatorBuild();
}
