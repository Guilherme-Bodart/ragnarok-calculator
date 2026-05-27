import {
  modifierResolutionContextSchema,
  type ModifierCondition,
  type ModifierResolutionContext,
  type NormalizedModifier,
} from "./modifier.types";

export class ModifierResolver {
  resolve(
    modifiers: NormalizedModifier[],
    context: ModifierResolutionContext = {},
  ): NormalizedModifier[] {
    const parsedContext = modifierResolutionContextSchema.parse(context);

    return modifiers.filter((modifier) =>
      modifier.conditions.every((condition: ModifierCondition) =>
        this.isConditionMet(condition, parsedContext),
      ),
    );
  }

  private isConditionMet(
    condition: ModifierCondition,
    context: ModifierResolutionContext,
  ) {
    if (condition.type === "refine") {
      return this.compare(context.refine, condition.operator, condition.value);
    }

    if (condition.type === "skillLevel") {
      return this.compare(
        context.learnedSkills?.[condition.skillId],
        condition.operator,
        condition.value,
      );
    }

    if (condition.type === "class") {
      if (!context.classId) {
        return false;
      }

      if (condition.operator === "==") {
        return context.classId === condition.classId;
      }

      return context.classId !== condition.classId;
    }

    return false;
  }

  private compare(
    actual: number | undefined,
    operator: ModifierCondition["operator"],
    expected: number,
  ) {
    if (actual === undefined) {
      return false;
    }

    if (operator === ">") return actual > expected;
    if (operator === ">=") return actual >= expected;
    if (operator === "<") return actual < expected;
    if (operator === "<=") return actual <= expected;
    if (operator === "==") return actual === expected;
    if (operator === "!=") return actual !== expected;

    return false;
  }
}
