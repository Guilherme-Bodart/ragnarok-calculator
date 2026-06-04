import {
  resolveSkillTreeJob,
  type RoSkill,
  type SkillTreeCatalog,
  type SkillTreeSkill,
} from "@/packages/calculator-core/src";
import {
  toRoSkill,
  type RathenaNormalizedSkill,
} from "@/packages/calculator-core/src/datasets/rathena-normalized";
import type { CalculatorPanelSkill } from "./calculator-character-panel";
import { getCalculatorSkillTooltip } from "./calculator-skill-tooltip-data";
import { getSkillTooltipFormulaData } from "./calculator-skill-tooltip-formula";

export type CalculatorSkillKind = "damage" | "heal" | "buff" | "passive" | "utility";

type NormalizedSkillInfo = RathenaNormalizedSkill & {
  name: string;
  description?: string;
  targetType?: string | null;
  rawDamageFlags?: Record<string, boolean> | null;
};

// Keep the large JSON out of TypeScript's structural type inference.
// eslint-disable-next-line @typescript-eslint/no-require-imports
const rawSkills = require(
  "../../nightmare-data/normalized/skills/skills.en.json",
) as NormalizedSkillInfo[];

const rawSkillById = new Map(
  rawSkills.map((skill) => [skill.name, skill]),
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
  const normalizedSkill = rawSkillById.get(skill.id);
  const roSkill = normalizedSkill ? toRoSkill(normalizedSkill) : null;
  const tooltipFormula = getSkillTooltipFormulaData(
    getCalculatorSkillTooltip(skill.id)?.descriptionLines ?? [],
  );
  const tooltipMultipliers = tooltipFormula?.baseMultiplierByLevel ?? {};
  const baseMultiplierByLevel =
    Object.keys(tooltipMultipliers).length > 0
      ? tooltipMultipliers
      : roSkill?.baseMultiplierByLevel ?? createDefaultMultipliers(skill.maxLevel);

  return {
    id: skill.id,
    name: roSkill?.name ?? skill.name,
    numericId: skill.numericId,
    classTree: skill.sourceJobId,
    damageType: roSkill?.damageType ?? "physical",
    element: roSkill?.element ?? "neutral",
    maxLevel: skill.maxLevel,
    hitCount: tooltipFormula?.hitCount ?? roSkill?.hitCount ?? 1,
    hitCountByLevel: tooltipFormula?.hitCountByLevel ?? roSkill?.hitCountByLevel,
    baseMultiplierByLevel,
    source: "rathena",
  };
}

function createDefaultMultipliers(maxLevel: number) {
  return Object.fromEntries(
    Array.from({ length: maxLevel }, (_, index) => {
      const level = index + 1;

      return [String(level), 100 + level * 10];
    }),
  );
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
