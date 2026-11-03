"use client";

import {
  Boxes,
  Check,
  RotateCcw,
  Save,
  Shield,
  Swords,
  User,
} from "lucide-react";
import Link from "next/link";
import { useEffect, useState } from "react";
import { AppNavbar } from "@/components/site/app-navbar";
import { useNightmareLocale } from "@/components/site/use-nightmare-locale";
import {
  readLocalGalleryBuilds,
  writeLocalGalleryBuilds,
  type GalleryBuildEntry,
} from "@/components/builds/builds-hub-page";
import { saveCalculatorAccountBuild } from "./calculator-build-api";
import { CalculatorBuffsPanel } from "./calculator-buffs-panel";
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

  // Responsive tab state for screens < 1280px (on desktop xl, all 3 columns are visible simultaneously)
  const [mobileSection, setMobileSection] = useState<
    "character" | "equipment" | "simulation"
  >("character");
  const [justSaved, setJustSaved] = useState(false);

  const build = useCalculatorBuildState(copy);

  const selectedSkillId = useCalculatorBuildStore((s) => s.selectedSkillId);
  const skillLevel = useCalculatorBuildStore((s) => s.skillLevel);
  const setSelectedSkillId = useCalculatorBuildStore(
    (s) => s.setSelectedSkillId,
  );
  const setSkillLevel = useCalculatorBuildStore((s) => s.setSkillLevel);
  const baseLevel = useCalculatorBuildStore((s) => s.baseLevel);
  const jobLevel = useCalculatorBuildStore((s) => s.jobLevel);
  const stats = useCalculatorBuildStore((s) => s.stats);
  const selectedClassId = useCalculatorBuildStore((s) => s.selectedClassId);
  const selectedMonsterId = useCalculatorBuildStore((s) => s.selectedMonsterId);
  const itemContexts = useCalculatorBuildStore((s) => s.itemContexts);
  const selectedItemsBySlot = useCalculatorBuildStore(
    (s) => s.selectedItemsBySlot,
  );

  const equippedCount =
    Object.values(selectedItemsBySlot).filter(Boolean).length;
  const activeBuffCount = Object.values(build.activeBuffs).filter(
    (lvl) => lvl > 0,
  ).length;

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

  async function handleQuickSaveBuild() {
    const trimmedName =
      build.buildName?.trim() || `${build.selectedClassName} Lv.${baseLevel}`;
    const payloadToSave = {
      ...build.currentBuild,
      name: trimmedName,
    };

    // Always save to local gallery immediately
    const existingLocal = readLocalGalleryBuilds();
    const newEntry: GalleryBuildEntry = {
      id: `local-${Date.now()}`,
      name: trimmedName,
      classId: selectedClassId,
      source: "local",
      updatedAt: new Date().toLocaleDateString("pt-BR"),
      payload: payloadToSave,
    };
    writeLocalGalleryBuilds([newEntry, ...existingLocal]);
    build.renameBuild(trimmedName);
    build.markAsSaved();

    // Best-effort save to Account API if authenticated
    try {
      await saveCalculatorAccountBuild(payloadToSave);
    } catch {
      // Unauthenticated or offline — local save already succeeded
    }

    setJustSaved(true);
    window.setTimeout(() => setJustSaved(false), 2200);
  }

  return (
    <div className="min-h-screen bg-[#090b10] text-slate-100 flex flex-col">
      <div className="calculator-grid-bg" />

      {/* UNIFIED APP NAVBAR WITH PLANNER CONTROLS */}
      <AppNavbar
        rightSlot={
          <div className="flex flex-wrap items-center gap-2">
            {/* Active Build Name Input */}
            <div className="hidden sm:flex items-center gap-1.5 rounded-lg border border-white/10 bg-[#0d1017] px-2.5 py-1">
              <span className="text-[10px] font-mono uppercase tracking-wider text-slate-500">
                Build:
              </span>
              <input
                type="text"
                value={build.buildName}
                onChange={(e) => build.renameBuild(e.target.value)}
                placeholder="Nome da build..."
                maxLength={60}
                className="w-36 bg-transparent text-xs font-bold text-slate-100 focus:outline-none focus:text-sky-300"
              />
            </div>

            {/* Quick Save to Builds Hub */}
            <button
              type="button"
              onClick={handleQuickSaveBuild}
              className={`inline-flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-bold border transition-all cursor-pointer ${
                justSaved
                  ? "bg-emerald-500/20 text-emerald-200 border-emerald-400/40"
                  : "bg-sky-500/20 hover:bg-sky-500/30 text-sky-100 border-sky-400/35"
              }`}
              title="Salvar build atual na Galeria de Builds"
            >
              {justSaved ? <Check size={14} /> : <Save size={14} />}
              <span>{justSaved ? "Build Salva!" : "Salvar Build"}</span>
            </button>

            {/* Open Full Builds Page */}
            <Link
              href="/builds"
              className="inline-flex items-center gap-1.5 rounded-lg border border-white/10 bg-[#121620] hover:bg-white/10 px-3 py-1.5 text-xs font-bold text-slate-200 transition-colors no-underline"
            >
              <Boxes size={14} className="text-sky-400" />
              <span>Galeria de Builds</span>
            </Link>

            {/* Reset Build */}
            <button
              type="button"
              onClick={build.resetBuild}
              className="inline-flex items-center gap-1.5 rounded-lg border border-white/10 bg-[#121620] hover:bg-rose-950/60 hover:border-rose-500/30 px-2.5 py-1.5 text-xs font-bold text-slate-300 hover:text-rose-200 transition-colors cursor-pointer"
              title={copy.resetAction}
            >
              <RotateCcw size={13} />
              <span className="hidden md:inline">{copy.resetAction}</span>
            </button>
          </div>
        }
      />

      {/* MOBILE / TABLET SECTION SWITCHER (Hidden on Desktop XL 3-Column Cockpit) */}
      <div className="xl:hidden mx-auto w-full max-w-[1760px] px-4 pt-4">
        <div className="grid grid-cols-3 gap-1 rounded-xl border border-white/10 bg-[#0d1017] p-1">
          <button
            type="button"
            onClick={() => setMobileSection("character")}
            className={`inline-flex items-center justify-center gap-1.5 py-2 px-2 rounded-lg text-xs font-bold transition-colors cursor-pointer ${
              mobileSection === "character"
                ? "bg-sky-500/20 text-sky-100 border border-sky-400/35"
                : "text-slate-400 hover:text-slate-200"
            }`}
          >
            <User size={14} />
            <span className="truncate">Personagem</span>
          </button>
          <button
            type="button"
            onClick={() => setMobileSection("equipment")}
            className={`inline-flex items-center justify-center gap-1.5 py-2 px-2 rounded-lg text-xs font-bold transition-colors cursor-pointer ${
              mobileSection === "equipment"
                ? "bg-sky-500/20 text-sky-100 border border-sky-400/35"
                : "text-slate-400 hover:text-slate-200"
            }`}
          >
            <Shield size={14} />
            <span className="truncate">
              Equips ({equippedCount + activeBuffCount})
            </span>
          </button>
          <button
            type="button"
            onClick={() => setMobileSection("simulation")}
            className={`inline-flex items-center justify-center gap-1.5 py-2 px-2 rounded-lg text-xs font-bold transition-colors cursor-pointer ${
              mobileSection === "simulation"
                ? "bg-sky-500/20 text-sky-100 border border-sky-400/35"
                : "text-slate-400 hover:text-slate-200"
            }`}
          >
            <Swords size={14} />
            <span className="truncate">Dano & Alvo</span>
          </button>
        </div>
      </div>

      {/* MAXROLL D4 STYLE 3-COLUMN PLANNER COCKPIT */}
      <main
        className="mx-auto w-full max-w-[1760px] flex-1 px-4 py-5 sm:px-6 grid grid-cols-1 xl:grid-cols-12 gap-4 items-start"
        aria-label={copy.workspaceAria}
      >
        {/* COLUNA 1 (ESQUERDA - 4 COLS): PERSONAGEM, ATRIBUTOS, TRAITS & SKILL TREE */}
        <div
          className={`xl:col-span-4 flex-col gap-4 min-w-0 ${
            mobileSection === "character" ? "flex" : "hidden xl:flex"
          }`}
        >
          <CalculatorCharacterPanel
            characterStatus={result.characterStatus}
            statBonuses={{
              str:
                result.characterStatus.effectiveStats.str -
                result.characterStatus.baseStats.str,
              agi:
                result.characterStatus.effectiveStats.agi -
                result.characterStatus.baseStats.agi,
              vit:
                result.characterStatus.effectiveStats.vit -
                result.characterStatus.baseStats.vit,
              int:
                result.characterStatus.effectiveStats.int -
                result.characterStatus.baseStats.int,
              dex:
                result.characterStatus.effectiveStats.dex -
                result.characterStatus.baseStats.dex,
              luk:
                result.characterStatus.effectiveStats.luk -
                result.characterStatus.baseStats.luk,
              pow:
                result.characterStatus.effectiveStats.pow -
                result.characterStatus.baseStats.pow,
              sta:
                result.characterStatus.effectiveStats.sta -
                result.characterStatus.baseStats.sta,
              wis:
                result.characterStatus.effectiveStats.wis -
                result.characterStatus.baseStats.wis,
              spl:
                result.characterStatus.effectiveStats.spl -
                result.characterStatus.baseStats.spl,
              con:
                result.characterStatus.effectiveStats.con -
                result.characterStatus.baseStats.con,
              crt:
                result.characterStatus.effectiveStats.crt -
                result.characterStatus.baseStats.crt,
            }}
            copy={copy}
            skillTreeSlot={<CalculatorSkillTreePanel copy={copy} />}
          />
        </div>

        {/* COLUNA 2 (CENTRO - 4 COLS): PAPERDOLL DE EQUIPAMENTOS, CARTAS, ENCANTAMENTOS & BUFFS */}
        <div
          className={`xl:col-span-4 flex-col gap-4 min-w-0 ${
            mobileSection === "equipment" ? "flex" : "hidden xl:flex"
          }`}
        >
          <CalculatorEquipmentPanel
            copy={copy}
            selectedItemDetails={build.selectedItemDetails}
          />

          <CalculatorBuffsPanel
            buffSkills={build.buffSkills}
            copy={copy}
          />
        </div>

        {/* COLUNA 3 (DIREITA - 4 COLS, STICKY): DANO EM TEMPO REAL, ALVO & STATUS ALT+Q */}
        <div
          className={`xl:col-span-4 flex-col gap-4 min-w-0 xl:sticky xl:top-16 ${
            mobileSection === "simulation" ? "flex" : "hidden xl:flex"
          }`}
        >
          <CalculatorTargetPanel
            availableSkills={build.selectedClassSkills}
            copy={copy}
            result={result}
            selectedMonster={build.selectedMonsterDetail}
            selectedSkill={selectedSkill}
          />

          <CalculatorDerivedStats
            status={result.characterStatus}
            modifierEffects={result.modifierEffects}
          />
        </div>
      </main>
    </div>
  );
}
