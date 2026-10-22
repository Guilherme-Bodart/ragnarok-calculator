"use client";

import {
  Boxes,
  FlaskConical,
  RotateCcw,
  Shield,
  Sparkles,
  User,
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
import { CalculatorDerivedStats } from "./calculator-derived-stats";
import { CalculatorEquipmentPanel } from "./calculator-equipment-panel";
import { CalculatorSkillTreePanel } from "./calculator-skill-tree-panel";
import { CalculatorTargetPanel } from "./calculator-target-panel";
import { useCalculatorBuildState } from "./use-calculator-build-state";
import { useCalculatorDataset } from "./use-calculator-dataset";
import { useCalculatorResult } from "./use-calculator-result";
import { useCalculatorBuildStore } from "./calculator-build-store";

export function CalculatorWorkbench() {
  const { dictionary } = useNightmareLocale();
  const copy = dictionary.calculator;
  const [isBuildsModalOpen, setIsBuildsModalOpen] = useState(false);
  const [activeTab, setActiveTab] = useState<
    "character" | "equipment" | "combat"
  >("character");

  // O adapter traz os Derived States complexos e metadados
  const build = useCalculatorBuildState(copy);
  
  // Acesso direto à Store para estados primitivos que orquestram a interface no top-level
  const selectedSkillId = useCalculatorBuildStore((s) => s.selectedSkillId);
  const skillLevel = useCalculatorBuildStore((s) => s.skillLevel);
  const setSelectedSkillId = useCalculatorBuildStore((s) => s.setSelectedSkillId);
  const setSkillLevel = useCalculatorBuildStore((s) => s.setSkillLevel);
  const baseLevel = useCalculatorBuildStore((s) => s.baseLevel);
  const jobLevel = useCalculatorBuildStore((s) => s.jobLevel);
  const stats = useCalculatorBuildStore((s) => s.stats);
  const selectedClassId = useCalculatorBuildStore((s) => s.selectedClassId);
  const selectedMonsterId = useCalculatorBuildStore((s) => s.selectedMonsterId);
  const itemContexts = useCalculatorBuildStore((s) => s.itemContexts);
  const selectedItemsBySlot = useCalculatorBuildStore((s) => s.selectedItemsBySlot);

  const equippedCount = Object.values(selectedItemsBySlot).filter(Boolean).length;
  const activeBuffCount = Object.values(build.activeBuffs).filter((lvl) => lvl > 0).length;

  const calculatorDataset = useCalculatorDataset({
    selectedCalculatorItems: build.selectedCalculatorItems,
    selectedClassSkills: build.selectedClassSkills,
    selectedMonsterDetail: build.selectedMonsterDetail,
  });

  const selectedSkill =
    calculatorDataset.skills.find((skill) => skill.id === selectedSkillId) ??
    build.selectedClassSkills[0] ??
    calculatorDataset.skills[0] ?? {
      id: "DUMMY",
      name: "None",
      maxLevel: 1,
    };
    
  const effectiveSkillLevel = Math.min(skillLevel, selectedSkill.maxLevel);

  const result = useCalculatorResult({
    activeBuffItemIds: build.activeBuffItemIds,
    activeBuffs: build.activeBuffs,
    baseLevel,
    calculatorDataset,
    effectiveLearnedSkills: build.effectiveLearnedSkills,
    itemContexts,
    jobLevel,
    resolvedCardItemIds: build.resolvedCardItemIds,
    resolvedEquipmentItemIds: build.resolvedEquipmentItemIds,
    selectedClassId,
    selectedMonsterId,
    selectedSkillId: selectedSkill.id,
    skillLevel: effectiveSkillLevel,
    stats,
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

  return (
    <main className="calculator-page">
      <div className="calculator-grid-bg" />
      <header className="calculator-topbar">
        <Link
          href="/"
          className="calculator-brand"
          aria-label={copy.backHomeAria}
        >
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
          <Button
            icon={<FlaskConical size={16} />}
            type="button"
            variant="ghost"
          >
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

      <section className="calculator-workspace" aria-label={copy.workspaceAria}>
        {/* COLUNA 1: CONFIGURAÇÃO (Lado Esquerdo - 60%) */}
        <div className="calculator-config-column flex flex-col gap-3 min-w-0">
          <nav
            className="calculator-tabs-nav grid grid-cols-3 gap-2 p-1.5 rounded-2xl bg-[#020612]/80 border border-sky-500/15 shadow-lg backdrop-blur-md"
            aria-label="Seções da Calculadora"
          >
            <Button
              icon={<User size={14} />}
              className="text-[10px] sm:text-xs px-2 sm:px-3 py-2 h-9 font-bold whitespace-nowrap overflow-hidden text-ellipsis"
              variant={activeTab === "character" ? "primary" : "ghost"}
              onClick={() => setActiveTab("character")}
            >
              Personagem & Skills
            </Button>
            <Button
              icon={<Shield size={14} />}
              className="text-[10px] sm:text-xs px-2 sm:px-3 py-2 h-9 font-bold whitespace-nowrap overflow-hidden text-ellipsis"
              variant={activeTab === "equipment" ? "primary" : "ghost"}
              onClick={() => setActiveTab("equipment")}
            >
              <span>Equipamentos</span>
              {equippedCount > 0 && (
                <span className="ml-1.5 px-1.5 py-0.2 rounded-full bg-sky-500/20 border border-sky-400/30 text-[10px] font-mono text-sky-200">
                  {equippedCount}
                </span>
              )}
            </Button>
            <Button
              icon={<Sparkles size={14} />}
              className="text-[10px] sm:text-xs px-2 sm:px-3 py-2 h-9 font-bold whitespace-nowrap overflow-hidden text-ellipsis"
              variant={activeTab === "combat" ? "primary" : "ghost"}
              onClick={() => setActiveTab("combat")}
            >
              <span>Combate & Buffs</span>
              {activeBuffCount > 0 && (
                <span className="ml-1.5 px-1.5 py-0.2 rounded-full bg-amber-500/20 border border-amber-400/35 text-[10px] font-mono text-amber-200">
                  {activeBuffCount}
                </span>
              )}
            </Button>
          </nav>

          {activeTab === "character" && (
            <div className="flex flex-col gap-3 animate-in fade-in slide-in-from-bottom-2 duration-300">
              <CalculatorCharacterPanel
                characterStatus={result.characterStatus}
                statBonuses={{
                  str: result.characterStatus.effectiveStats.str - result.characterStatus.baseStats.str,
                  agi: result.characterStatus.effectiveStats.agi - result.characterStatus.baseStats.agi,
                  vit: result.characterStatus.effectiveStats.vit - result.characterStatus.baseStats.vit,
                  int: result.characterStatus.effectiveStats.int - result.characterStatus.baseStats.int,
                  dex: result.characterStatus.effectiveStats.dex - result.characterStatus.baseStats.dex,
                  luk: result.characterStatus.effectiveStats.luk - result.characterStatus.baseStats.luk,
                  pow: result.characterStatus.effectiveStats.pow - result.characterStatus.baseStats.pow,
                  sta: result.characterStatus.effectiveStats.sta - result.characterStatus.baseStats.sta,
                  wis: result.characterStatus.effectiveStats.wis - result.characterStatus.baseStats.wis,
                  spl: result.characterStatus.effectiveStats.spl - result.characterStatus.baseStats.spl,
                  con: result.characterStatus.effectiveStats.con - result.characterStatus.baseStats.con,
                  crt: result.characterStatus.effectiveStats.crt - result.characterStatus.baseStats.crt,
                }}
                copy={copy}
                skillTreeSlot={
                  <CalculatorSkillTreePanel
                    copy={copy}
                  />
                }
              />
            </div>
          )}

          {activeTab === "equipment" && (
            <div className="flex flex-col gap-5 animate-in fade-in slide-in-from-bottom-2 duration-300">
              <CalculatorEquipmentPanel
                copy={copy}
                selectedItemDetails={build.selectedItemDetails}
              />
            </div>
          )}

          {activeTab === "combat" && (
            <div className="flex flex-col gap-5 animate-in fade-in slide-in-from-bottom-2 duration-300">
              <CalculatorAttackPanel
                availableSkills={build.selectedClassSkills}
                copy={copy}
                result={result}
                resultMeta={result.meta}
                selectedSkill={selectedSkill}
              />
              <CalculatorBuffsPanel
                buffSkills={build.buffSkills}
                copy={copy}
              />
            </div>
          )}
        </div>

        {/* COLUNA 2: SIMULAÇÃO E RESULTADO (Lado Direito - Fixo/Sticky) */}
        <div className="calculator-result-column flex flex-col gap-4 min-w-0 sticky top-6 self-start">
          <div>
            <CalculatorDerivedStats
              status={result.characterStatus}
              modifierEffects={result.modifierEffects}
            />
          </div>

          <CalculatorTargetPanel
            availableSkills={build.selectedClassSkills}
            copy={copy}
            result={result}
            selectedMonster={build.selectedMonsterDetail}
            selectedSkill={selectedSkill}
          />
        </div>
      </section>

      {isBuildsModalOpen ? (
        <CalculatorBuildsModal
          copy={copy}
          currentBuild={build.currentBuild}
          onClose={() => setIsBuildsModalOpen(false)}
          onLoadBuild={build.loadBuild}
          onMarkAsSaved={build.markAsSaved}
          onRenameBuild={build.renameBuild}
        />
      ) : null}
    </main>
  );
}
