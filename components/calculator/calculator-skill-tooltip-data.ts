export type CalculatorSkillTooltipInfo = {
  skillId: number;
  skillCode: string;
  name: string;
  maxLevel: number | null;
  type: string | null;
  sp: number[] | null;
  ap: number[] | null;
  attackRange: number[] | null;
  descriptionLines: string[];
};

type CalculatorSkillTooltipDataset = {
  bySkillCode: Record<string, CalculatorSkillTooltipInfo | undefined>;
};

// Keep the large JSON out of TypeScript's structural type inference.
// eslint-disable-next-line @typescript-eslint/no-require-imports
const skillTooltipDataset = require(
  "../../nightmare-data/normalized/skills/skill-tooltips.en.json",
) as CalculatorSkillTooltipDataset;

export function getCalculatorSkillTooltip(skillCode: string) {
  return skillTooltipDataset.bySkillCode[skillCode];
}
