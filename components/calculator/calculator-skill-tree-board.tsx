"use client";

import { type CSSProperties } from "react";
import { Minus, Plus } from "lucide-react";
import {
  canDecreaseSkill,
  getMissingRequirements,
  resolveSkillTreeJob,
  type LearnedSkillLevels,
  type SkillTreeSkill,
} from "@/packages/calculator-core/src";
import { IconButton } from "@/components/ui/icon-button";
import type { CalculatorDictionary } from "./calculator-i18n";
import { CalculatorSkillTooltip } from "./calculator-skill-tooltip";
import { SkillTreeIcon } from "./calculator-skill-tree-icon";
import { layoutSkillTreeSkills } from "./calculator-skill-tree-layout";

type CalculatorSkillTreeBoardProps = {
  copy: CalculatorDictionary;
  learnedSkills: LearnedSkillLevels;
  resolvedJob: ReturnType<typeof resolveSkillTreeJob>;
  skills: SkillTreeSkill[];
  onDecreaseSkill: (skillId: string) => void;
  onIncreaseSkill: (skillId: string) => void;
};

export function CalculatorSkillTreeBoard({
  copy,
  learnedSkills,
  resolvedJob,
  skills,
  onDecreaseSkill,
  onIncreaseSkill,
}: CalculatorSkillTreeBoardProps) {
  const layout = layoutSkillTreeSkills(skills);

  return (
    <div
      className="skill-tree-board"
      style={
        {
          "--skill-tree-column-count": layout.columnCount,
        } as CSSProperties
      }
    >
      {layout.cells.map((cell) => {
        if (!cell.skill) {
          return (
            <span
              className="skill-tree-empty-cell"
              key={cell.key}
              aria-hidden="true"
            />
          );
        }

        return (
          <CalculatorSkillTreeCell
            copy={copy}
            key={`${cell.skill.sourceJobId}-${cell.skill.id}`}
            learnedSkills={learnedSkills}
            resolvedJob={resolvedJob}
            skill={cell.skill}
            onDecreaseSkill={onDecreaseSkill}
            onIncreaseSkill={onIncreaseSkill}
          />
        );
      })}
    </div>
  );
}

function CalculatorSkillTreeCell({
  copy,
  learnedSkills,
  resolvedJob,
  skill,
  onDecreaseSkill,
  onIncreaseSkill,
}: {
  copy: CalculatorDictionary;
  learnedSkills: LearnedSkillLevels;
  resolvedJob: ReturnType<typeof resolveSkillTreeJob>;
  skill: SkillTreeSkill;
  onDecreaseSkill: (skillId: string) => void;
  onIncreaseSkill: (skillId: string) => void;
}) {
  const currentLevel = learnedSkills[skill.id] ?? 0;
  const missingRequirements = getMissingRequirements(skill, learnedSkills);
  const isLocked = missingRequirements.length > 0;
  const canIncrease = currentLevel < skill.maxLevel;
  const canDecrease = canDecreaseSkill(resolvedJob, skill.id, learnedSkills);

  return (
    <article
      className="skill-tree-skill"
      data-locked={isLocked}
      data-learned={currentLevel > 0}
    >
      <strong>{skill.name}</strong>
      <CalculatorSkillTooltip skill={skill}>
        <SkillTreeIcon numericId={skill.numericId} name={skill.name} />
      </CalculatorSkillTooltip>
      <div className="skill-tree-leveler">
        <IconButton
          label={`${copy.skillTree.decreaseAction} ${skill.name}`}
          disabled={!canDecrease}
          onClick={() => onDecreaseSkill(skill.id)}
          type="button"
        >
          <Minus size={14} />
        </IconButton>
        <span>
          {currentLevel}/{skill.maxLevel}
        </span>
        <IconButton
          label={`${copy.skillTree.increaseAction} ${skill.name}`}
          disabled={!canIncrease}
          onClick={() => onIncreaseSkill(skill.id)}
          type="button"
        >
          <Plus size={14} />
        </IconButton>
      </div>
    </article>
  );
}
