import type { RoSkill } from "../ro-types";

export function getSkillMultiplier(skill: RoSkill, level: number) {
  return (skill.baseMultiplierByLevel[String(level)] ?? 100) / 100;
}
