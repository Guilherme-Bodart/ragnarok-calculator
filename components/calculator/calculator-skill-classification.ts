import rawSkills from "@/nightmare-data/normalized/skills/skills.en.json";
import {
  resolveSkillTreeJob,
  type RoSkill,
  type SkillTreeCatalog,
  type SkillTreeSkill,
} from "@/packages/calculator-core/src";
import type { CalculatorPanelSkill } from "./calculator-character-panel";

export type CalculatorSkillKind = "damage" | "heal" | "buff" | "passive" | "utility";

type NormalizedSkillInfo = {
  name: string;
  description?: string;
  targetType?: string | null;
  rawDamageFlags?: Record<string, boolean> | null;
};

const rawSkillById = new Map(
  (rawSkills as NormalizedSkillInfo[]).map((skill) => [skill.name, skill]),
);

export function getCalculatorClassSkills(
  catalog: SkillTreeCatalog,
  classId: string,
) {
  return resolveSkillTreeJob(catalog, classId).skills
    .filter((skill) => isCalculatorActionSkill(skill))
    .map(toCalculatorPanelSkill);
}

export function getCalculatorClassBuffSkills(
  catalog: SkillTreeCatalog,
  classId: string,
) {
  return resolveSkillTreeJob(catalog, classId).skills
    .filter((skill) => classifyCalculatorSkill(skill) === "buff")
    .map(toCalculatorPanelSkill);
}

export function isCalculatorActionSkill(skill: SkillTreeSkill) {
  const kind = classifyCalculatorSkill(skill);

  return kind === "damage" || kind === "heal";
}

export function classifyCalculatorSkill(skill: SkillTreeSkill): CalculatorSkillKind {
  const skillInfo = rawSkillById.get(skill.id);

  if (!skillInfo) {
    return "utility";
  }

  const targetType = skillInfo.targetType ?? "";
  const noDamage = Boolean(skillInfo.rawDamageFlags?.NoDamage);
  const isDamageSkill =
    !noDamage && (targetType === "Attack" || targetType === "Ground");
  const isHealingSkill =
    targetType === "Support" &&
    /\bheal\b|\bcure\b|cura|curar/i.test(
      `${skill.id} ${skillInfo.description ?? ""}`,
    );

  if (isDamageSkill) {
    return "damage";
  }

  if (isHealingSkill) {
    return "heal";
  }

  if (!targetType) {
    return "passive";
  }

  if (targetType === "Self" || targetType === "Support") {
    return "buff";
  }

  return "utility";
}

function toCalculatorPanelSkill(skill: SkillTreeSkill): CalculatorPanelSkill {
  return {
    id: skill.id,
    name: skill.name,
    numericId: skill.numericId,
    classTree: skill.sourceJobId,
    damageType: "physical",
    element: "neutral",
    maxLevel: skill.maxLevel,
    hitCount: 1,
    baseMultiplierByLevel: Object.fromEntries(
      Array.from({ length: skill.maxLevel }, (_, index) => {
        const level = index + 1;

        return [String(level), 100 + level * 10];
      }),
    ),
    source: "rathena",
  };
}

export function mergeCalculatorSkills(
  baseSkills: RoSkill[],
  classSkills: RoSkill[],
) {
  const skillById = new Map(baseSkills.map((skill) => [skill.id, skill]));

  for (const skill of classSkills) {
    if (!skillById.has(skill.id)) {
      skillById.set(skill.id, skill);
    }
  }

  return Array.from(skillById.values());
}
