"use client";

import {
  Boxes,
  FlaskConical,
  RotateCcw,
} from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { useEffect, useState } from "react";
import { useNightmareLocale } from "@/components/site/use-nightmare-locale";
import { Button } from "@/components/ui/button";
import { CalculatorAttackPanel } from "./calculator-attack-panel";
import { CalculatorBuffsPanel } from "./calculator-buffs-panel";
import { CalculatorBuildsModal } from "./calculator-builds-modal";
import { CalculatorCharacterPanel } from "./calculator-character-panel";
import { CalculatorEquipmentPanel } from "./calculator-equipment-panel";
import {
  isFourthJobClassId,
  isTranscendentEquivalentClassId,
} from "./calculator-class-rules";
import { CalculatorSkillTreePanel } from "./calculator-skill-tree-panel";
import { CalculatorTargetPanel } from "./calculator-target-panel";
import { useCalculatorBuildState } from "./use-calculator-build-state";
import { useCalculatorDataset } from "./use-calculator-dataset";
import { useCalculatorResult } from "./use-calculator-result";

export function CalculatorWorkbench() {
  const { dictionary } = useNightmareLocale();
  const copy = dictionary.calculator;
  const [isBuildsModalOpen, setIsBuildsModalOpen] = useState(false);
  const build = useCalculatorBuildState(copy);
  const {
    selectedSkillId,
    setSelectedSkillId,
    setSkillLevel,
    skillLevel,
  } = build;
  const calculatorDataset = useCalculatorDataset({
    selectedCalculatorItems: build.selectedCalculatorItems,
    selectedClassSkills: build.selectedClassSkills,
    selectedMonsterDetail: build.selectedMonsterDetail,
  });
  const selectedSkill =
    calculatorDataset.skills.find((skill) => skill.id === selectedSkillId) ??
    build.selectedClassSkills[0] ??
    calculatorDataset.skills[0];
  const effectiveSkillLevel = Math.min(skillLevel, selectedSkill.maxLevel);
  const result = useCalculatorResult({
    activeBuffItemIds: build.activeBuffItemIds,
    baseLevel: build.baseLevel,
    calculatorDataset,
    effectiveLearnedSkills: build.effectiveLearnedSkills,
    itemContexts: build.itemContexts,
    jobLevel: build.jobLevel,
    resolvedCardItemIds: build.resolvedCardItemIds,
    resolvedEquipmentItemIds: build.resolvedEquipmentItemIds,
    selectedClassId: build.selectedClassId,
    selectedMonsterId: build.selectedMonsterId,
    selectedSkillId: selectedSkill.id,
    skillLevel: effectiveSkillLevel,
    stats: build.stats,
  });

  useEffect(() => {
    if (selectedSkill.id !== selectedSkillId) {
      setSelectedSkillId(selectedSkill.id);
    }

    if (skillLevel !== effectiveSkillLevel) {
      setSkillLevel(effectiveSkillLevel);
    }
  }, [
    effectiveSkillLevel,
    selectedSkillId,
    selectedSkill.id,
    setSelectedSkillId,
    setSkillLevel,
    skillLevel,
  ]);

  function handleSkillChange(skillId: string) {
    const nextSkill =
      build.selectedClassSkills.find((skill) => skill.id === skillId) ??
      selectedSkill;

    setSelectedSkillId(nextSkill.id);
    setSkillLevel(Math.min(skillLevel, nextSkill.maxLevel));
  }

  return (
    <main className="calculator-page">
      <div className="calculator-grid-bg" />
      <header className="calculator-topbar">
        <Link href="/" className="calculator-brand" aria-label={copy.backHomeAria}>
          <Image src="/nightmare-reaper.png" alt="" width={38} height={38} />
          <span>
            <strong>Nightmare</strong>
            <small>{copy.brandSubtitle}</small>
          </span>
        </Link>

        <nav className="calculator-actions" aria-label={copy.actionsAria}>
          <Button
            icon={<Boxes size={16} />}
            type="button"
            variant="ghost"
            onClick={() => setIsBuildsModalOpen(true)}
          >
            {copy.buildsAction}
          </Button>
          <Button icon={<FlaskConical size={16} />} type="button" variant="ghost">
            {copy.syncAction}
          </Button>
          <Button
            icon={<RotateCcw size={16} />}
            type="button"
            variant="ghost"
            onClick={build.resetBuild}
          >
            {copy.resetAction}
          </Button>
        </nav>
      </header>

      <section className="calculator-hero-panel">
        <CalculatorCharacterPanel
          baseLevel={build.baseLevel}
          copy={copy}
          isFourthJob={isFourthJobClassId(build.selectedClassId)}
          isTranscendent={isTranscendentEquivalentClassId(build.selectedClassId)}
          jobLevel={build.jobLevel}
          selectedClassId={build.selectedClassId}
          stats={build.stats}
          onBaseLevelChange={build.setBaseLevel}
          onClassChange={build.handleClassChange}
          onJobLevelChange={build.setJobLevel}
          onStatsChange={build.setStats}
        />
        <CalculatorSkillTreePanel
          copy={copy}
          learnedSkills={build.learnedSkills}
          selectedClassId={build.selectedClassId}
          onLearnedSkillsChange={build.setLearnedSkills}
        />
      </section>

      <section className="calculator-workspace" aria-label={copy.workspaceAria}>
        <div className="calculator-character-column">
          <CalculatorAttackPanel
            availableSkills={build.selectedClassSkills}
            copy={copy}
            result={result}
            resultMeta={result.meta}
            selectedSkill={selectedSkill}
            skillLevel={effectiveSkillLevel}
            onSkillChange={handleSkillChange}
            onSkillLevelChange={setSkillLevel}
          />
          <CalculatorBuffsPanel
            activeBuffs={build.activeBuffs}
            buffSkills={build.buffSkills}
            copy={copy}
            selectedBuffId={build.selectedBuffId}
            onActiveBuffsChange={build.setActiveBuffs}
            onSelectedBuffChange={build.setSelectedBuffId}
          />
        </div>
        <CalculatorEquipmentPanel
          copy={copy}
          itemContexts={build.itemContexts}
          selectedCardsBySlot={build.selectedCardsBySlot}
          selectedItemDetails={build.selectedItemDetails}
          selectedItemsBySlot={build.selectedItemsBySlot}
          onItemContextsChange={build.setItemContexts}
          onSelectedCardsBySlotChange={build.setSelectedCardsBySlot}
          onSelectedItemsBySlotChange={build.setSelectedItemsBySlot}
        />
        <CalculatorTargetPanel
          copy={copy}
          result={result}
          selectedMonster={build.selectedMonsterDetail}
          selectedMonsterId={build.selectedMonsterId}
          onMonsterChange={build.setSelectedMonsterId}
        />
      </section>

      {isBuildsModalOpen ? (
        <CalculatorBuildsModal
          copy={copy}
          currentBuild={build.currentBuild}
          onClose={() => setIsBuildsModalOpen(false)}
          onLoadBuild={build.loadBuild}
          onRenameBuild={build.renameBuild}
        />
      ) : null}
    </main>
  );
}
