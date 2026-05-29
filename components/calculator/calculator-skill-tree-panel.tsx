"use client";

import { Minus, Plus, Search, Sparkles, X } from "lucide-react";
import { useMemo, useState, type CSSProperties } from "react";
import {
  canDecreaseSkill,
  getMissingRequirements,
  increaseSkillWithRequirements,
  resolveSkillTreeJob,
  type LearnedSkillLevels,
  type SkillTreeSkill,
} from "@/packages/calculator-core/src";
import { Button } from "@/components/ui/button";
import { IconButton } from "@/components/ui/icon-button";
import { PanelHeader } from "@/components/ui/panel-header";
import { RichSelect } from "@/components/ui/rich-select";
import type { CalculatorDictionary } from "./calculator-i18n";
import {
  calculatorSkillTreeCatalog,
  calculatorSkillTreeClassGroups,
  getCalculatorSkillTreeDisplayJobId,
  shouldMergeNoviceIntoNextJob,
} from "./calculator-skill-tree-data";

type CalculatorSkillTreePanelProps = {
  copy: CalculatorDictionary;
  learnedSkills: LearnedSkillLevels;
  selectedClassId: string;
  onClassChange: (classId: string) => void;
  onLearnedSkillsChange: (skills: LearnedSkillLevels) => void;
};

export function CalculatorSkillTreePanel({
  copy,
  learnedSkills,
  selectedClassId,
  onClassChange,
  onLearnedSkillsChange,
}: CalculatorSkillTreePanelProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [search, setSearch] = useState("");
  const resolvedJob = useMemo(
    () => resolveSkillTreeJob(calculatorSkillTreeCatalog, selectedClassId),
    [selectedClassId],
  );
  const learnedCount = Object.values(learnedSkills).reduce(
    (total, level) => total + level,
    0,
  );
  const filteredSkills = resolvedJob.skills.filter((skill) => {
    const query = search.trim().toLowerCase();

    if (!query) {
      return true;
    }

    return (
      skill.name.toLowerCase().includes(query) ||
      skill.id.toLowerCase().includes(query) ||
      skill.sourceJobName.toLowerCase().includes(query)
    );
  });
  const skillGroups = useMemo(
    () => createCompactSkillGroups(resolvedJob.jobPath, resolvedJob.skills),
    [resolvedJob.jobPath, resolvedJob.skills],
  );
  const filteredSkillIds = useMemo(
    () => new Set(filteredSkills.map((skill) => skill.id)),
    [filteredSkills],
  );
  const visibleSkillGroups = useMemo(
    () =>
      skillGroups
        .map((group) => ({
          ...group,
          visibleSkills: group.skills.filter((skill) =>
            filteredSkillIds.has(skill.id),
          ),
        }))
        .filter((group) => group.visibleSkills.length > 0),
    [filteredSkillIds, skillGroups],
  );
  const totalSkillPointLimit = skillGroups.reduce(
    (total, group) => total + group.pointLimit,
    0,
  );
  const classSelectGroups = useMemo(
    () =>
      calculatorSkillTreeClassGroups.map((group) => ({
        label: group.label,
        options: group.options.map((job) => ({
          id: job.id,
          label: job.name,
          icon: <ClassOptionPortrait classId={job.id} name={job.name} />,
        })),
      })),
    [],
  );

  function increaseSkill(skillId: string) {
    onLearnedSkillsChange(
      increaseSkillWithRequirements(resolvedJob, skillId, learnedSkills),
    );
  }

  function decreaseSkill(skillId: string) {
    const nextLevel = Math.max(0, (learnedSkills[skillId] ?? 0) - 1);
    const nextSkills = { ...learnedSkills };

    if (nextLevel <= 0) {
      delete nextSkills[skillId];
    } else {
      nextSkills[skillId] = nextLevel;
    }

    onLearnedSkillsChange(nextSkills);
  }

  return (
    <>
      <aside className="calculator-skill-tree-card">
        <Sparkles size={26} />
        <strong>{copy.skillTree.title}</strong>
        <span>{resolvedJob.name}</span>
        <small>
          {learnedCount} {copy.skillTree.learnedLevels} ·{" "}
          {resolvedJob.skills.length} {copy.skillTree.availableSkills}
        </small>
        <Button type="button" onClick={() => setIsOpen(true)}>
          {copy.skillTree.openAction}
        </Button>
      </aside>

      {isOpen ? (
        <div className="skill-tree-modal-backdrop" role="presentation">
          <section
            className="skill-tree-modal"
            role="dialog"
            aria-modal="true"
            aria-labelledby="skill-tree-title"
          >
            <header className="skill-tree-modal-header">
              <PanelHeader
                title={<h2 id="skill-tree-title">{copy.skillTree.modalTitle}</h2>}
                meta={copy.skillTree.kicker}
              />
              <IconButton
                className="skill-tree-close"
                label={copy.skillTree.closeAction}
                onClick={() => setIsOpen(false)}
                type="button"
              >
                <X size={18} />
              </IconButton>
            </header>

            <div className="skill-tree-toolbar">
              <label>
                {copy.skillTree.classLabel}
                <RichSelect
                  groups={classSelectGroups}
                  value={selectedClassId}
                  searchPlaceholder="Filtrar classe"
                  onChange={(classId) => {
                    onClassChange(classId);
                    onLearnedSkillsChange({});
                  }}
                />
              </label>
              <label>
                {copy.skillTree.searchLabel}
                <span className="skill-tree-search">
                  <Search size={15} />
                  <input
                    type="search"
                    value={search}
                    placeholder={copy.skillTree.searchPlaceholder}
                    onChange={(event) => setSearch(event.target.value)}
                  />
                </span>
              </label>
            </div>

            <div className="skill-tree-path" aria-label={copy.skillTree.pathAria}>
              <strong className="skill-tree-total-points">
                Total {learnedCount}/{totalSkillPointLimit}
              </strong>
              {resolvedJob.jobPath.map((job) => (
                <span key={job.id}>{job.name}</span>
              ))}
            </div>

            <div className="skill-tree-groups">
              {visibleSkillGroups.map((group) => (
                <section className="skill-tree-group" key={group.key}>
                  <h3>
                    <span>{group.label}</span>
                    <small>
                      {getLearnedSkillPointCount(group.skills, learnedSkills)}/
                      {group.pointLimit}
                    </small>
                  </h3>
                  <SkillTreeBoard
                    copy={copy}
                    learnedSkills={learnedSkills}
                    resolvedJob={resolvedJob}
                    skills={group.visibleSkills}
                    onDecreaseSkill={decreaseSkill}
                    onIncreaseSkill={increaseSkill}
                  />
                </section>
              ))}
            </div>
          </section>
        </div>
      ) : null}
    </>
  );
}

function SkillTreeBoard({
  copy,
  learnedSkills,
  resolvedJob,
  skills,
  onDecreaseSkill,
  onIncreaseSkill,
}: {
  copy: CalculatorDictionary;
  learnedSkills: LearnedSkillLevels;
  resolvedJob: ReturnType<typeof resolveSkillTreeJob>;
  skills: SkillTreeSkill[];
  onDecreaseSkill: (skillId: string) => void;
  onIncreaseSkill: (skillId: string) => void;
}) {
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

        const skill = cell.skill;
        const currentLevel = learnedSkills[skill.id] ?? 0;
        const missingRequirements = getMissingRequirements(skill, learnedSkills);
        const isLocked = missingRequirements.length > 0;
        const canIncrease = currentLevel < skill.maxLevel;
        const canDecrease = canDecreaseSkill(
          resolvedJob,
          skill.id,
          learnedSkills,
        );

        return (
          <article
            className="skill-tree-skill"
            data-locked={isLocked}
            data-learned={currentLevel > 0}
            key={`${skill.sourceJobId}-${skill.id}`}
          >
            <strong>{skill.name}</strong>
            <SkillIcon numericId={skill.numericId} name={skill.name} />
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
      })}
    </div>
  );
}

function ClassOptionPortrait({
  classId,
  name,
}: {
  classId: string;
  name: string;
}) {
  const [hasError, setHasError] = useState(false);
  const initials = name
    .split(" ")
    .map((part) => part[0])
    .join("")
    .slice(0, 2);

  if (hasError) {
    return <span className="skill-tree-class-fallback">{initials}</span>;
  }

  return (
    <span className="skill-tree-class-fallback">
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        src={`/sprites/classes/${classId}.png`}
        alt=""
        width={28}
        height={28}
        loading="lazy"
        onError={() => setHasError(true)}
      />
      <b>{initials}</b>
    </span>
  );
}

type SkillTreePathJob = {
  id: string;
  name: string;
};

type SkillTreeCompactGroup = {
  key: string;
  label: string;
  ids: string[];
  pointLimit: number;
  skills: SkillTreeSkill[];
};

const skillPointLimitsByProgression = [50, 70, 70, 70];

function createCompactSkillGroups(
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

function getLearnedSkillPointCount(
  skills: SkillTreeSkill[],
  learnedSkills: LearnedSkillLevels,
) {
  return skills.reduce(
    (total, skill) => total + Math.max(0, learnedSkills[skill.id] ?? 0),
    0,
  );
}

function mergeLabel(currentLabel: string, nextLabel: string) {
  const labels = currentLabel.split(" / ");

  if (labels.includes(nextLabel)) {
    return currentLabel;
  }

  return [...labels, nextLabel].join(" / ");
}


type SkillTreeLayoutCell = {
  key: string;
  skill?: SkillTreeSkill;
};

type SkillTreeLayout = {
  cells: SkillTreeLayoutCell[];
  columnCount: number;
};

const skillTreeColumnCount = 7;
const skillTreeMaximumRowsPerColumn = 6;

function layoutSkillTreeSkills(skills: SkillTreeSkill[]): SkillTreeLayout {
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

  const cells = Array.from(
    { length: rowCount * columnCount },
    (_, index) => {
      const column = index % columnCount;
      const row = Math.floor(index / columnCount);
      const key = `${column}:${row}`;

      return {
        key,
        skill: skillByPosition.get(key),
      };
    },
  );

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

function SkillIcon({
  numericId,
  name,
}: {
  numericId?: number;
  name: string;
}) {
  const [hasError, setHasError] = useState(false);

  if (!numericId || hasError) {
    return <span className="skill-tree-icon-fallback">{name.slice(0, 2)}</span>;
  }

  return (
    // Tiny remote skill icons are content data; keep them unoptimized and lazy.
    // eslint-disable-next-line @next/next/no-img-element
    <img
      src={`https://static.divine-pride.net/images/skill/${numericId}.png`}
      alt=""
      width={28}
      height={28}
      loading="lazy"
      onError={() => setHasError(true)}
    />
  );
}
