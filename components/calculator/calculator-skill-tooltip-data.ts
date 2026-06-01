import rawSkillTooltips from "@/nightmare-data/normalized/skills/skill-tooltips.en.json";

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

const skillTooltipDataset =
  rawSkillTooltips as CalculatorSkillTooltipDataset;

export function getCalculatorSkillTooltip(skillCode: string) {
  return skillTooltipDataset.bySkillCode[skillCode];
}
