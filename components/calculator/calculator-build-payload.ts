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
  if (!isRecord(value) || value.version !== calculatorBuildPayloadVersion) {
    return false;
  }

  return (
    typeof value.name === "string" &&
    isNumberRecord(value.activeBuffs) &&
    isFiniteNumber(value.baseLevel) &&
    isFiniteNumber(value.jobLevel) &&
    isNumberRecord(value.learnedSkills) &&
    isItemContextRecord(value.itemContexts) &&
    typeof value.selectedBuffId === "string" &&
    isCardSlotRecord(value.selectedCardsBySlot) &&
    typeof value.selectedClassId === "string" &&
    isItemSlotRecord(value.selectedItemsBySlot) &&
    isFiniteNumber(value.selectedMonsterId) &&
    typeof value.selectedSkillId === "string" &&
    isFiniteNumber(value.skillLevel) &&
    isCharacterStats(value.stats)
  );
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null;
}

function isFiniteNumber(value: unknown): value is number {
  return typeof value === "number" && Number.isFinite(value);
}

function isNumberRecord(value: unknown): value is Record<string, number> {
  return (
    isRecord(value) &&
    Object.values(value).every((recordValue) => isFiniteNumber(recordValue))
  );
}

function isItemContextRecord(
  value: unknown,
): value is CalculatorBuildPayload["itemContexts"] {
  return (
    isRecord(value) &&
    Object.values(value).every(
      (context) =>
        isRecord(context) &&
        (!("refine" in context) || isFiniteNumber(context.refine)),
    )
  );
}

function isItemSlotRecord(
  value: unknown,
): value is CalculatorBuildPayload["selectedItemsBySlot"] {
  return (
    isRecord(value) &&
    Object.values(value).every((itemId) => isFiniteNumber(itemId))
  );
}

function isCardSlotRecord(
  value: unknown,
): value is CalculatorBuildPayload["selectedCardsBySlot"] {
  return (
    isRecord(value) &&
    Object.values(value).every(
      (cards) => Array.isArray(cards) && cards.every(isFiniteNumber),
    )
  );
}

function isCharacterStats(value: unknown): value is CharacterStats {
  if (!isRecord(value)) {
    return false;
  }

  return [
    "str",
    "agi",
    "vit",
    "int",
    "dex",
    "luk",
    "pow",
    "sta",
    "wis",
    "spl",
    "con",
    "crt",
  ].every((stat) => isFiniteNumber(value[stat]));
}
