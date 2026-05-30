"use client";

import {
  Boxes,
  Calculator,
  FlaskConical,
  RotateCcw,
} from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { useState } from "react";
import { useNightmareLocale } from "@/components/site/use-nightmare-locale";
import { Button } from "@/components/ui/button";
import { Panel } from "@/components/ui/panel";
import { CalculatorBuffsPanel } from "./calculator-buffs-panel";
import { CalculatorBuildsModal } from "./calculator-builds-modal";
import { CalculatorCharacterPanel } from "./calculator-character-panel";
import { CalculatorEquipmentPanel } from "./calculator-equipment-panel";
import { isFourthJobClassId } from "./calculator-skill-tree-data";
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
  const calculatorDataset = useCalculatorDataset({
    selectedCalculatorItems: build.selectedCalculatorItems,
    selectedClassSkills: build.selectedClassSkills,
  });
  const selectedSkill =
    calculatorDataset.skills.find((skill) => skill.id === build.selectedSkillId) ??
    build.selectedClassSkills[0] ??
    calculatorDataset.skills[0];
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
    skillLevel: build.skillLevel,
    stats: build.stats,
  });

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
        <Panel>
          <span className="calculator-kicker">
            <Calculator size={16} />
            {copy.kicker}
          </span>
          <h1>{copy.title}</h1>
          <p>{copy.description}</p>
        </Panel>
        <CalculatorSkillTreePanel
          copy={copy}
          learnedSkills={build.learnedSkills}
          selectedClassId={build.selectedClassId}
          onClassChange={build.handleClassChange}
          onLearnedSkillsChange={build.setLearnedSkills}
        />
      </section>

      <section className="calculator-workspace" aria-label={copy.workspaceAria}>
        <div className="calculator-character-column">
          <CalculatorCharacterPanel
            availableSkills={build.selectedClassSkills}
            baseLevel={build.baseLevel}
            copy={copy}
            isFourthJob={isFourthJobClassId(build.selectedClassId)}
            isTranscendent={build.selectedClassId.includes("_T")}
            jobLevel={build.jobLevel}
            selectedClassId={build.selectedClassId}
            selectedClassName={build.selectedClassName}
            skillLevel={build.skillLevel}
            selectedSkill={selectedSkill}
            stats={build.stats}
            onBaseLevelChange={build.setBaseLevel}
            onJobLevelChange={build.setJobLevel}
            onSkillChange={(skill) => build.setSelectedSkillId(skill.id)}
            onSkillLevelChange={build.setSkillLevel}
            onStatsChange={build.setStats}
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
          selectedMonsterId={build.selectedMonsterId}
          onMonsterChange={build.setSelectedMonsterId}
        />
      </section>

      {isBuildsModalOpen ? (
        <CalculatorBuildsModal
          currentBuild={build.currentBuild}
          onClose={() => setIsBuildsModalOpen(false)}
          onLoadBuild={build.loadBuild}
          onRenameBuild={build.renameBuild}
        />
      ) : null}
    </main>
  );
}
