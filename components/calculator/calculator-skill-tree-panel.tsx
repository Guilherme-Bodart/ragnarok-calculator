"use client";

import { Search, Sparkles, X } from "lucide-react";
import { useMemo, useState } from "react";
import {
  canDecreaseSkill,
  canIncreaseSkill,
  getMissingRequirements,
  resolveSkillTreeJob,
  type LearnedSkillLevels,
} from "@/packages/calculator-core/src";
import type { CalculatorDictionary } from "./calculator-i18n";
import {
  calculatorSkillTreeCatalog,
  calculatorSkillTreeClassOptions,
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
  const skillsByJob = resolvedJob.jobPath
    .map((job) => ({
      job,
      skills: filteredSkills.filter((skill) => skill.sourceJobId === job.id),
    }))
    .filter((group) => group.skills.length > 0);

  function setSkillLevel(skillId: string, nextLevel: number) {
    onLearnedSkillsChange({
      ...learnedSkills,
      [skillId]: nextLevel,
    });
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
        <button type="button" onClick={() => setIsOpen(true)}>
          {copy.skillTree.openAction}
        </button>
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
              <div>
                <span>{copy.skillTree.kicker}</span>
                <h2 id="skill-tree-title">{copy.skillTree.modalTitle}</h2>
              </div>
              <button
                type="button"
                className="skill-tree-close"
                aria-label={copy.skillTree.closeAction}
                onClick={() => setIsOpen(false)}
              >
                <X size={18} />
              </button>
            </header>

            <div className="skill-tree-toolbar">
              <label>
                {copy.skillTree.classLabel}
                <select
                  value={selectedClassId}
                  onChange={(event) => {
                    onClassChange(event.target.value);
                    onLearnedSkillsChange({});
                  }}
                >
                  {calculatorSkillTreeClassOptions.map((job) => (
                    <option value={job.id} key={job.id}>
                      {job.name}
                    </option>
                  ))}
                </select>
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
              {resolvedJob.jobPath.map((job) => (
                <span key={job.id}>{job.name}</span>
              ))}
            </div>

            <div className="skill-tree-groups">
              {skillsByJob.map((group) => (
                <section className="skill-tree-group" key={group.job.id}>
                  <h3>{group.job.name}</h3>
                  <div className="skill-tree-grid">
                    {group.skills.map((skill) => {
                      const currentLevel = learnedSkills[skill.id] ?? 0;
                      const missingRequirements = getMissingRequirements(
                        skill,
                        learnedSkills,
                      );
                      const isLocked = missingRequirements.length > 0;
                      const canIncrease = canIncreaseSkill(skill, learnedSkills);
                      const canDecrease = canDecreaseSkill(
                        resolvedJob,
                        skill.id,
                        learnedSkills,
                      );

                      return (
                        <article
                          className="skill-tree-skill"
                          data-locked={isLocked}
                          key={`${skill.sourceJobId}-${skill.id}`}
                        >
                          <SkillIcon
                            numericId={skill.numericId}
                            name={skill.name}
                          />
                          <div>
                            <strong>{skill.name}</strong>
                            <small>{skill.id}</small>
                            <em>
                              {copy.skillTree.levelLabel} {currentLevel}/
                              {skill.maxLevel}
                            </em>
                            <p>
                              {skill.requirements.length > 0
                                ? skill.requirements
                                    .map(
                                      (requirement) =>
                                        `${requirement.name} ${requirement.level}`,
                                    )
                                    .join(", ")
                                : copy.skillTree.noRequirements}
                            </p>
                          </div>
                          <div className="skill-tree-leveler">
                            <button
                              type="button"
                              aria-label={`${copy.skillTree.decreaseAction} ${skill.name}`}
                              disabled={!canDecrease}
                              onClick={() => decreaseSkill(skill.id)}
                            >
                              -
                            </button>
                            <span>{currentLevel}</span>
                            <button
                              type="button"
                              aria-label={`${copy.skillTree.increaseAction} ${skill.name}`}
                              disabled={!canIncrease}
                              onClick={() =>
                                setSkillLevel(skill.id, currentLevel + 1)
                              }
                            >
                              +
                            </button>
                          </div>
                          {isLocked ? (
                            <mark>
                              {copy.skillTree.lockedBy}{" "}
                              {missingRequirements
                                .map(
                                  (requirement) =>
                                    `${requirement.name} ${requirement.level}`,
                                )
                                .join(", ")}
                            </mark>
                          ) : null}
                        </article>
                      );
                    })}
                  </div>
                </section>
              ))}
            </div>
          </section>
        </div>
      ) : null}
    </>
  );
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
