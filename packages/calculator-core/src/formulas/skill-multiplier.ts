import type { RoSkill } from "../ro-types";

/**
 * Generic multiplier lookup. Specific skills should use SkillFormulaAdapter.
 */
export function getSkillMultiplier(skill: RoSkill, level: number) {
  return (skill.baseMultiplierByLevel[String(level)] ?? 100) / 100;
}
