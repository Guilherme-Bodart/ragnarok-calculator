"use client";

import { Sparkles, X } from "lucide-react";
import { useMemo, useState } from "react";
import {
  increaseSkillWithRequirements,
  resolveSkillTreeJob,
  type LearnedSkillLevels,
} from "@/packages/calculator-core/src";
import { Button } from "@/components/ui/button";
import { IconButton } from "@/components/ui/icon-button";
import { PanelHeader } from "@/components/ui/panel-header";
import { ScrollArea } from "@/components/ui/scroll-area";
import type { CalculatorDictionary } from "./calculator-i18n";
import { CalculatorSkillTreeBoard } from "./calculator-skill-tree-board";
import {
  calculatorSkillTreeCatalog,
} from "./calculator-skill-tree-data";
import {
  createCompactSkillGroups,
} from "./calculator-skill-tree-layout";
import {
  CalculatorSkillTreeGroupHeading,
  CalculatorSkillTreePath,
} from "./calculator-skill-tree-path";
import { CalculatorSkillTreeToolbar } from "./calculator-skill-tree-toolbar";

type CalculatorSkillTreePanelProps = {
  copy: CalculatorDictionary;
  learnedSkills: LearnedSkillLevels;
  selectedClassId: string;
  onLearnedSkillsChange: (skills: LearnedSkillLevels) => void;
};

export function CalculatorSkillTreePanel({
  copy,
  learnedSkills,
  selectedClassId,
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

            <CalculatorSkillTreeToolbar
              copy={copy}
              search={search}
              onSearchChange={setSearch}
            />

            <CalculatorSkillTreePath
              copy={copy}
              groups={skillGroups}
              jobPath={resolvedJob.jobPath}
              learnedCount={learnedCount}
            />

            <ScrollArea className="skill-tree-groups">
              {visibleSkillGroups.map((group) => (
                <section className="skill-tree-group" key={group.key}>
                  <CalculatorSkillTreeGroupHeading
                    group={group}
                    learnedSkills={learnedSkills}
                  />
                  <CalculatorSkillTreeBoard
                    copy={copy}
                    learnedSkills={learnedSkills}
                    resolvedJob={resolvedJob}
                    skills={group.visibleSkills}
                    onDecreaseSkill={decreaseSkill}
                    onIncreaseSkill={increaseSkill}
                  />
                </section>
              ))}
            </ScrollArea>
          </section>
        </div>
      ) : null}
    </>
  );
}
