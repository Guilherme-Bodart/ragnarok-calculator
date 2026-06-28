import {
  calculatorBuildPayloadVersion,
  migrateCalculatorBuildPayload,
  type CalculatorBuildPayload,
} from "./calculator-build-payload";
import { calculatorDemoInput } from "./calculator-demo-data";
import archMageBuild from "@/packages/calculator-core/src/reference-scenarios/guilh-arch-mage-build.json";

export const calculatorBuildStorageKey = "nightmare-calculator-build";

export function createDefaultCalculatorBuild(): CalculatorBuildPayload {
  return {
    version: calculatorBuildPayloadVersion,
    name: "Build local",
    character: {
      selectedClassId: calculatorDemoInput.character.classId ?? "Dragon_Knight",
      baseLevel: calculatorDemoInput.character.baseLevel,
      jobLevel: calculatorDemoInput.character.jobLevel,
      stats: { ...calculatorDemoInput.character.stats },
    },
    attack: {
      selectedSkillId: calculatorDemoInput.skillId,
      skillLevel: calculatorDemoInput.skillLevel,
    },
    tree: {
      learnedSkills: {},
    },
    equipment: {
      itemContexts: archMageBuild.equipment.itemContexts as Record<number, { refine?: number; grade?: number }>,
      selectedCardsBySlot: archMageBuild.equipment.selectedCardsBySlot as any,
      selectedItemsBySlot: archMageBuild.equipment.selectedItemsBySlot as any,
    },
    buffs: {
      activeBuffs: {},
      selectedBuffId: "",
    },
    target: {
      selectedMonsterId: calculatorDemoInput.monsterId,
    },
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

    const migratedBuild = migrateCalculatorBuildPayload(parsedBuild);

    if (migratedBuild) {
      return migratedBuild;
    }
  } catch {
    // Fall through to the default build.
  }

  return createDefaultCalculatorBuild();
}
