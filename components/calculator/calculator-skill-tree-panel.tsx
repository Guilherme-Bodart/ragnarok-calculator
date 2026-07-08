"use client";

import { Network } from "lucide-react";
import { useMemo, useState } from "react";
import {
  increaseSkillWithRequirements,
  resolveSkillTreeJob,
} from "@/packages/calculator-core/src";
import { Button } from "@/components/ui/button";
import { Modal } from "@/components/ui/modal";
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
import { useCalculatorBuildStore } from "./calculator-build-store";

type CalculatorSkillTreePanelProps = {
  copy: CalculatorDictionary;
};

export function CalculatorSkillTreePanel({
  copy,
}: CalculatorSkillTreePanelProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [search, setSearch] = useState("");
  
  const selectedClassId = useCalculatorBuildStore((s) => s.selectedClassId);
  const learnedSkills = useCalculatorBuildStore((s) => s.learnedSkills);
  const setLearnedSkills = useCalculatorBuildStore((s) => s.setLearnedSkills);

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
    setLearnedSkills(
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

    setLearnedSkills(nextSkills);
  }

  return (
    <>
      <div className="flex items-center justify-between gap-4 p-3 rounded-lg border border-slate-700/50 bg-slate-900/60 w-full">
        <div className="flex items-center justify-between flex-1 text-sm px-2">
          <span className="text-slate-400 font-medium">{copy.skillTree.title}</span>
        </div>
        <Button type="button" variant="link" onClick={() => setIsOpen(true)} className="text-xs mr-2 uppercase font-bold tracking-wide">
          {copy.skillTree.openAction}
        </Button>
      </div>

      {isOpen ? (
        <Modal
          icon={<Network size={18} className="text-emerald-400" />}
          title={copy.skillTree.modalTitle}
          meta={copy.skillTree.kicker}
          onClose={() => setIsOpen(false)}
          size="xl"
          className="bg-gradient-to-br from-slate-900/90 to-slate-950/95"
        >
          <div className="flex flex-col gap-4">
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

            <div className="skill-tree-groups">
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
            </div>
          </div>
        </Modal>
      ) : null}
    </>
  );
}
