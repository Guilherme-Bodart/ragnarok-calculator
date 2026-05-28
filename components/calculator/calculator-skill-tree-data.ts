import rawSkillTree from "@/nightmare-data/normalized/skills/skill-tree.json";
import rawSkills from "@/nightmare-data/normalized/skills/skills.en.json";
import {
  createSkillTreeCatalog,
  type SkillTreeRawDataset,
  type SkillTreeRawSkillInfo,
} from "@/packages/calculator-core/src";

export const calculatorSkillTreeCatalog = createSkillTreeCatalog(
  rawSkillTree as SkillTreeRawDataset,
  rawSkills as SkillTreeRawSkillInfo[],
);

export const calculatorSkillTreeClassOptions =
  calculatorSkillTreeCatalog.jobOptions;
