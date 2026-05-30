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
