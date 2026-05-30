import type { EquipmentSlot } from "@/packages/calculator-core/src";
import type { CharacterStats } from "@/packages/calculator-core/src";

export const calculatorBuildPayloadVersion = 1;

export type CalculatorBuildPayload = {
  version: typeof calculatorBuildPayloadVersion;
  name: string;
  activeBuffs: Record<string, number>;
  baseLevel: number;
  jobLevel: number;
  learnedSkills: Record<string, number>;
  itemContexts: Record<number, { refine?: number }>;
  selectedBuffId: string;
  selectedCardsBySlot: Partial<Record<EquipmentSlot, number[]>>;
  selectedClassId: string;
  selectedItemsBySlot: Partial<Record<EquipmentSlot, number>>;
  selectedMonsterId: number;
  selectedSkillId: string;
  skillLevel: number;
  stats: CharacterStats;
};

export function isCalculatorBuildPayload(
  value: unknown,
): value is CalculatorBuildPayload {
  return (
    typeof value === "object" &&
    value !== null &&
    "version" in value &&
    value.version === calculatorBuildPayloadVersion
  );
}
