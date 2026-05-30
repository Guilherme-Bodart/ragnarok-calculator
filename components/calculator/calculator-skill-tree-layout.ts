import type {
  LearnedSkillLevels,
  SkillTreeSkill,
} from "@/packages/calculator-core/src";
import {
  getCalculatorSkillTreeDisplayJobId,
  shouldMergeNoviceIntoNextJob,
} from "./calculator-skill-tree-data";

export type SkillTreePathJob = {
  id: string;
  name: string;
};

export type SkillTreeCompactGroup = {
  key: string;
  label: string;
  ids: string[];
  pointLimit: number;
  skills: SkillTreeSkill[];
};

export type SkillTreeLayoutCell = {
  key: string;
  skill?: SkillTreeSkill;
};

export type SkillTreeLayout = {
  cells: SkillTreeLayoutCell[];
  columnCount: number;
};

const skillPointLimitsByProgression = [50, 70, 70, 70];
const skillTreeColumnCount = 7;
const skillTreeMaximumRowsPerColumn = 6;

export function createCompactSkillGroups(
  jobPath: SkillTreePathJob[],
  skills: SkillTreeSkill[],
): SkillTreeCompactGroup[] {
  const availableJobIds = new Set(jobPath.map((job) => job.id));
  const firstPlayableJob = jobPath.find(
    (job) => !shouldMergeNoviceIntoNextJob(job.id),
  );
  const groupById = new Map<string, SkillTreeCompactGroup>();

  for (const job of jobPath) {
    const displayJobId =
      shouldMergeNoviceIntoNextJob(job.id) && firstPlayableJob
        ? getCalculatorSkillTreeDisplayJobId(firstPlayableJob.id, availableJobIds)
        : getCalculatorSkillTreeDisplayJobId(job.id, availableJobIds);
    const existingGroup = groupById.get(displayJobId);

    if (existingGroup) {
      existingGroup.ids.push(job.id);

      if (!shouldMergeNoviceIntoNextJob(job.id)) {
        existingGroup.label = mergeLabel(existingGroup.label, job.name);
      }

      continue;
    }

    groupById.set(displayJobId, {
      key: displayJobId,
      label:
        shouldMergeNoviceIntoNextJob(job.id) && firstPlayableJob
          ? firstPlayableJob.name
          : job.name,
      ids: [job.id],
      pointLimit: 0,
      skills: [],
    });
  }

  const skillIdsByJobId = new Map<string, Set<string>>();

  for (const skill of skills) {
    const skillIds = skillIdsByJobId.get(skill.sourceJobId) ?? new Set<string>();
    skillIds.add(skill.id);
    skillIdsByJobId.set(skill.sourceJobId, skillIds);
  }

  const preferredSourceJobIdBySkillId = new Map<string, string>();

  for (const job of jobPath) {
    const skillIds = skillIdsByJobId.get(job.id);

    if (!skillIds) {
      continue;
    }

    for (const skillId of skillIds) {
      if (!preferredSourceJobIdBySkillId.has(skillId)) {
        preferredSourceJobIdBySkillId.set(skillId, job.id);
      }
    }
  }

  const displayedSkillIds = new Set<string>();

  for (const skill of skills) {
    if (displayedSkillIds.has(skill.id)) {
      continue;
    }

    const preferredSourceJobId =
      skill.displaySourceJobId ??
      preferredSourceJobIdBySkillId.get(skill.id) ??
      skill.sourceJobId;
    const sourceDisplayJobId =
      shouldMergeNoviceIntoNextJob(preferredSourceJobId) && firstPlayableJob
        ? getCalculatorSkillTreeDisplayJobId(firstPlayableJob.id, availableJobIds)
        : getCalculatorSkillTreeDisplayJobId(preferredSourceJobId, availableJobIds);
    const group = groupById.get(sourceDisplayJobId);

    if (group) {
      group.skills.push({
        ...skill,
        sourceJobId: preferredSourceJobId,
      });
      displayedSkillIds.add(skill.id);
    }
  }

  return Array.from(groupById.values())
    .filter((group) => group.skills.length > 0)
    .map((group, index) => ({
      ...group,
      pointLimit:
        skillPointLimitsByProgression[index] ??
        skillPointLimitsByProgression[skillPointLimitsByProgression.length - 1],
    }));
}

export function getLearnedSkillPointCount(
  skills: SkillTreeSkill[],
  learnedSkills: LearnedSkillLevels,
) {
  return skills.reduce(
    (total, skill) => total + Math.max(0, learnedSkills[skill.id] ?? 0),
    0,
  );
}

export function layoutSkillTreeSkills(skills: SkillTreeSkill[]): SkillTreeLayout {
  const skillById = new Map(skills.map((skill) => [skill.id, skill]));
  const positionById = new Map<string, { column: number; row: number }>();
  const occupied = new Set<string>();
  let nextRootIndex = 0;

  function reservePosition(skill: SkillTreeSkill, column: number, row: number) {
    let nextRow = row;

    while (occupied.has(`${column}:${nextRow}`)) {
      nextRow += 1;
    }

    occupied.add(`${column}:${nextRow}`);
    positionById.set(skill.id, { column, row: nextRow });
  }

  function placeSkill(skill: SkillTreeSkill) {
    const existingPosition = positionById.get(skill.id);

    if (existingPosition) {
      return existingPosition;
    }

    const parentRequirement = skill.requirements.find((requirement) =>
      skillById.has(requirement.id),
    );

    if (parentRequirement) {
      const parentSkill = skillById.get(parentRequirement.id)!;
      const parentPosition = placeSkill(parentSkill);

      reservePosition(skill, parentPosition.column, parentPosition.row + 1);
      return positionById.get(skill.id)!;
    }

    const column = nextRootIndex % skillTreeColumnCount;
    const row = Math.floor(nextRootIndex / skillTreeColumnCount);
    nextRootIndex += 1;
    reservePosition(skill, column, row);

    return positionById.get(skill.id)!;
  }

  for (const skill of skills) {
    placeSkill(skill);
  }

  const wrappedPositionById = wrapTallSkillTreeColumns(positionById);
  const columnCount = skillTreeColumnCount;
  const rowCount = Math.max(
    1,
    ...Array.from(wrappedPositionById.values()).map(
      (position) => position.row + 1,
    ),
  );
  const skillByPosition = new Map(
    Array.from(wrappedPositionById.entries()).map(([skillId, position]) => [
      `${position.column}:${position.row}`,
      skillById.get(skillId),
    ]),
  );
  const cells = Array.from({ length: rowCount * columnCount }, (_, index) => {
    const column = index % columnCount;
    const row = Math.floor(index / columnCount);
    const key = `${column}:${row}`;

    return {
      key,
      skill: skillByPosition.get(key),
    };
  });

  return { cells, columnCount };
}

function wrapTallSkillTreeColumns(
  positionById: Map<string, { column: number; row: number }>,
) {
  const wrappedPositionById = new Map<string, { column: number; row: number }>();
  const occupied = new Set<string>();
  const rowCountsByColumn = Array.from({ length: skillTreeColumnCount }, () => 0);
  const entries = Array.from(positionById.entries()).sort(
    ([, first], [, second]) =>
      first.column - second.column || first.row - second.row,
  );

  function getNextOpenRow(column: number) {
    for (let row = 0; row < skillTreeMaximumRowsPerColumn; row += 1) {
      if (!occupied.has(`${column}:${row}`)) {
        return row;
      }
    }

    return skillTreeMaximumRowsPerColumn;
  }

  function getLeastFilledColumn() {
    let leastFilledColumn = 0;

    for (let column = 1; column < skillTreeColumnCount; column += 1) {
      if (rowCountsByColumn[column] < rowCountsByColumn[leastFilledColumn]) {
        leastFilledColumn = column;
      }
    }

    return leastFilledColumn;
  }

  for (const [skillId, position] of entries) {
    let column = Math.min(position.column, skillTreeColumnCount - 1);
    let row = position.row;

    if (
      row >= skillTreeMaximumRowsPerColumn ||
      occupied.has(`${column}:${row}`)
    ) {
      column = getLeastFilledColumn();
      row = getNextOpenRow(column);
    }

    if (row >= skillTreeMaximumRowsPerColumn) {
      row = rowCountsByColumn[column];
    }

    occupied.add(`${column}:${row}`);
    rowCountsByColumn[column] = Math.max(rowCountsByColumn[column], row + 1);
    wrappedPositionById.set(skillId, { column, row });
  }

  return wrappedPositionById;
}

function mergeLabel(currentLabel: string, nextLabel: string) {
  const labels = currentLabel.split(" / ");

  if (labels.includes(nextLabel)) {
    return currentLabel;
  }

  return [...labels, nextLabel].join(" / ");
}
