import type { CharacterStats, EquipmentSlot } from "@/packages/calculator-core/src";

export const calculatorBuildPayloadVersion = 2;

export type CalculatorBuildPayload = {
  version: typeof calculatorBuildPayloadVersion;
  name: string;
  character: {
    selectedClassId: string;
    baseLevel: number;
    jobLevel: number;
    stats: CharacterStats;
  };
  attack: {
    selectedSkillId: string;
    skillLevel: number;
  };
  tree: {
    learnedSkills: Record<string, number>;
  };
  equipment: {
    itemContexts: Record<number, { refine?: number; grade?: number }>;
    selectedCardsBySlot: Partial<Record<EquipmentSlot, number[]>>;
    selectedItemsBySlot: Partial<Record<EquipmentSlot, number>>;
  };
  buffs: {
    activeBuffs: Record<string, number>;
    selectedBuffId: string;
  };
  target: {
    selectedMonsterId: number;
  };
};

type CalculatorBuildPayloadV1 = {
  version: 1;
  name: string;
  activeBuffs: Record<string, number>;
  baseLevel: number;
  jobLevel: number;
  learnedSkills: Record<string, number>;
  itemContexts: Record<number, { refine?: number; grade?: number }>;
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
    isCharacterSection(value.character) &&
    isAttackSection(value.attack) &&
    isTreeSection(value.tree) &&
    isEquipmentSection(value.equipment) &&
    isBuffsSection(value.buffs) &&
    isTargetSection(value.target)
  );
}

export function migrateCalculatorBuildPayload(
  value: unknown,
): CalculatorBuildPayload | null {
  if (isCalculatorBuildPayload(value)) {
    return value;
  }

  if (!isCalculatorBuildPayloadV1(value)) {
    return null;
  }

  return {
    version: calculatorBuildPayloadVersion,
    name: value.name,
    character: {
      selectedClassId: value.selectedClassId,
      baseLevel: value.baseLevel,
      jobLevel: value.jobLevel,
      stats: value.stats,
    },
    attack: {
      selectedSkillId: value.selectedSkillId,
      skillLevel: value.skillLevel,
    },
    tree: {
      learnedSkills: value.learnedSkills,
    },
    equipment: {
      itemContexts: value.itemContexts,
      selectedCardsBySlot: value.selectedCardsBySlot,
      selectedItemsBySlot: value.selectedItemsBySlot,
    },
    buffs: {
      activeBuffs: value.activeBuffs,
      selectedBuffId: value.selectedBuffId,
    },
    target: {
      selectedMonsterId: value.selectedMonsterId,
    },
  };
}

function isCalculatorBuildPayloadV1(
  value: unknown,
): value is CalculatorBuildPayloadV1 {
  if (!isRecord(value) || value.version !== 1) {
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

function isCharacterSection(value: unknown) {
  return (
    isRecord(value) &&
    typeof value.selectedClassId === "string" &&
    isFiniteNumber(value.baseLevel) &&
    isFiniteNumber(value.jobLevel) &&
    isCharacterStats(value.stats)
  );
}

function isAttackSection(value: unknown) {
  return (
    isRecord(value) &&
    typeof value.selectedSkillId === "string" &&
    isFiniteNumber(value.skillLevel)
  );
}

function isTreeSection(value: unknown) {
  return isRecord(value) && isNumberRecord(value.learnedSkills);
}

function isEquipmentSection(value: unknown) {
  return (
    isRecord(value) &&
    isItemContextRecord(value.itemContexts) &&
    isCardSlotRecord(value.selectedCardsBySlot) &&
    isItemSlotRecord(value.selectedItemsBySlot)
  );
}

function isBuffsSection(value: unknown) {
  return (
    isRecord(value) &&
    isNumberRecord(value.activeBuffs) &&
    typeof value.selectedBuffId === "string"
  );
}

function isTargetSection(value: unknown) {
  return isRecord(value) && isFiniteNumber(value.selectedMonsterId);
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
): value is CalculatorBuildPayload["equipment"]["itemContexts"] {
  return (
    isRecord(value) &&
    Object.values(value).every(
      (context) =>
        isRecord(context) &&
        (!("refine" in context) || isFiniteNumber(context.refine)) &&
        (!("grade" in context) || isFiniteNumber(context.grade)),
    )
  );
}

function isItemSlotRecord(
  value: unknown,
): value is CalculatorBuildPayload["equipment"]["selectedItemsBySlot"] {
  return (
    isRecord(value) &&
    Object.values(value).every((itemId) => isFiniteNumber(itemId))
  );
}

function isCardSlotRecord(
  value: unknown,
): value is CalculatorBuildPayload["equipment"]["selectedCardsBySlot"] {
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
