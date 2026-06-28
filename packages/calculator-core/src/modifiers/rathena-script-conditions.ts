import type { ModifierCondition } from "./modifier.types";

export function createClassConditions(conditionText: string) {
  const conditions: ModifierCondition[] = [];
  const classPattern = /BaseJob\s*(==|!=)\s*(Job_[A-Za-z0-9_]+)/g;

  for (const match of conditionText.matchAll(classPattern)) {
    const [, operator, classId] = match;

    if (operator !== "==" && operator !== "!=") {
      return null;
    }

    conditions.push({
      type: "class",
      classId,
      operator,
    });
  }

  if (conditions.length === 0) {
    return null;
  }

  const leftover = conditionText
    .replace(classPattern, "")
    .replace(/eaclass\s*\(\s*\)\s*&\s*[A-Za-z0-9_]+/g, "")
    .replace(/[\s()&|]+/g, "");

  if (leftover) {
    return null;
  }

  return conditions;
}

export function createRefineCondition(
  operator: string,
  value: string,
): ModifierCondition | null {
  const numericValue = Number(value);

  if (!Number.isInteger(numericValue)) {
    return null;
  }

  if (!isRathenaConditionOperator(operator)) {
    return null;
  }

  return {
    type: "refine",
    operator,
    value: numericValue,
  };
}

export function createGradeCondition(
  operator: string,
  value: string,
): ModifierCondition | null {
  const numericValue = toEnchantGradeValue(value);

  if (numericValue === null || !isRathenaConditionOperator(operator)) {
    return null;
  }

  return {
    type: "grade",
    operator,
    value: numericValue,
  };
}

export function createSkillLevelConditions(conditionText: string) {
  const conditions: ModifierCondition[] = [];
  const skillLevelPattern =
    /getskilllv\s*\(\s*"([^"]+)"\s*\)\s*(>=|>|<=|<|==|!=)\s*(-?\d+)/g;

  for (const match of conditionText.matchAll(skillLevelPattern)) {
    const [, skillId, operator, value] = match;
    const condition = createSkillLevelCondition(skillId, operator, value);

    if (!condition) {
      return null;
    }

    conditions.push(condition);
  }

  if (conditions.length === 0) {
    return null;
  }

  const leftover = conditionText
    .replace(skillLevelPattern, "")
    .replace(/[\s()&|]+/g, "");

  if (leftover) {
    return null;
  }

  return conditions;
}

function createSkillLevelCondition(
  skillId: string,
  operator: string,
  value: string,
): ModifierCondition | null {
  const numericValue = Number(value);

  if (!Number.isInteger(numericValue) || !isRathenaConditionOperator(operator)) {
    return null;
  }

  return {
    type: "skillLevel",
    skillId,
    operator,
    value: numericValue,
  };
}

function isRathenaConditionOperator(
  operator: string,
): operator is ModifierCondition["operator"] {
  return [">", ">=", "<", "<=", "==", "!="].includes(operator);
}

function toEnchantGradeValue(value: string) {
  const gradeByConstant: Record<string, number> = {
    ENCHANTGRADE_NONE: 0,
    ENCHANTGRADE_D: 1,
    ENCHANTGRADE_C: 2,
    ENCHANTGRADE_B: 3,
    ENCHANTGRADE_A: 4,
  };

  if (value in gradeByConstant) {
    return gradeByConstant[value];
  }

  const numericValue = Number(value);

  return Number.isInteger(numericValue) ? numericValue : null;
}

export function createEquippedConditions(conditionText: string) {
  const conditions: ModifierCondition[] = [];
  const equippedPattern = /isequipped\s*\(\s*([\d\s,]+)\s*\)/g;

  for (const match of conditionText.matchAll(equippedPattern)) {
    const [, ids] = match;
    const itemIds = ids
      .split(",")
      .map((id) => id.trim())
      .filter((id) => id.length > 0)
      .map(Number)
      .filter(Number.isInteger);

    if (itemIds.length === 0) {
      return null;
    }

    conditions.push({
      type: "equipped",
      itemIds,
    });
  }

  if (conditions.length === 0) {
    return null;
  }

  const leftover = conditionText
    .replace(equippedPattern, "")
    .replace(/[\s()&|]+/g, "");

  if (leftover) {
    return null;
  }

  return conditions;
}
