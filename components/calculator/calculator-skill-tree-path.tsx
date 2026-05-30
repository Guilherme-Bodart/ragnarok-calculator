import {
  type LearnedSkillLevels,
  type SkillTreeSkill,
} from "@/packages/calculator-core/src";
import type { CalculatorDictionary } from "./calculator-i18n";
import {
  getLearnedSkillPointCount,
  type SkillTreeCompactGroup,
  type SkillTreePathJob,
} from "./calculator-skill-tree-layout";

type CalculatorSkillTreePathProps = {
  copy: CalculatorDictionary;
  groups: SkillTreeCompactGroup[];
  jobPath: SkillTreePathJob[];
  learnedCount: number;
};

export function CalculatorSkillTreePath({
  copy,
  groups,
  jobPath,
  learnedCount,
}: CalculatorSkillTreePathProps) {
  const totalSkillPointLimit = groups.reduce(
    (total, group) => total + group.pointLimit,
    0,
  );

  return (
    <div className="skill-tree-path" aria-label={copy.skillTree.pathAria}>
      <strong className="skill-tree-total-points">
        Total {learnedCount}/{totalSkillPointLimit}
      </strong>
      {jobPath.map((job) => (
        <span key={job.id}>{job.name}</span>
      ))}
    </div>
  );
}

export function CalculatorSkillTreeGroupHeading({
  group,
  learnedSkills,
}: {
  group: SkillTreeCompactGroup & { visibleSkills: SkillTreeSkill[] };
  learnedSkills: LearnedSkillLevels;
}) {
  return (
    <h3>
      <span>{group.label}</span>
      <small>
        {getLearnedSkillPointCount(group.skills, learnedSkills)}/
        {group.pointLimit}
      </small>
    </h3>
  );
}
