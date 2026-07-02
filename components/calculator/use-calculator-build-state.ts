"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import type { EquipmentSlot } from "@/packages/calculator-core/src";
import {
  getCalculatorManualBuffSkills,
  getActiveCalculatorBuffItemIds,
} from "./calculator-buff-data";
import {
  calculatorBuildPayloadVersion,
  type CalculatorBuildPayload,
} from "./calculator-build-payload";
import {
  calculatorBuildStorageKey,
  createDefaultCalculatorBuild,
  readSavedCalculatorBuild,
} from "./calculator-build-storage";
import { defaultCalculatorInput } from "./calculator-base-data";
import { useCalculatorItemDetails } from "./use-calculator-item-details";
import { useCalculatorMonsterDetail } from "./use-calculator-monster-detail";
import type { CalculatorItemDetail } from "./calculator-item-data";
import {
  getCalculatorClassBuffSkills,
  getCalculatorClassSkills,
} from "./calculator-skill-classification";
import {
  calculatorSkillTreeCatalog,
  calculatorSkillTreeClassOptions,
  isFourthJobClassId,
} from "./calculator-skill-tree-data";
import type { CalculatorDictionary } from "./calculator-i18n";

export function useCalculatorBuildState(copy: CalculatorDictionary) {
  const [savedBuild] = useState(createDefaultCalculatorBuild);
  const hasLoadedSavedBuildRef = useRef(false);
  const skipNextModificationRef = useRef(false);
  const [buildName, setBuildName] = useState(savedBuild.name);
  const [lastSavedAt, setLastSavedAt] = useState(Date.now());
  const [lastModifiedAt, setLastModifiedAt] = useState(Date.now());
  const [selectedClassId, setSelectedClassId] = useState(
    savedBuild.character.selectedClassId,
  );
  const [learnedSkills, setLearnedSkills] = useState<Record<string, number>>(
    savedBuild.tree.learnedSkills,
  );
  const [baseLevel, setBaseLevel] = useState(savedBuild.character.baseLevel);
  const [jobLevel, setJobLevel] = useState(savedBuild.character.jobLevel);
  const [stats, setStats] = useState(savedBuild.character.stats);
  const [selectedSkillId, setSelectedSkillId] = useState(
    savedBuild.attack.selectedSkillId,
  );
  const [skillLevel, setSkillLevel] = useState(savedBuild.attack.skillLevel);
  const [selectedMonsterId, setSelectedMonsterId] = useState(
    savedBuild.target.selectedMonsterId,
  );
  const [activeBuffs, setActiveBuffs] = useState<Record<string, number>>(
    savedBuild.buffs.activeBuffs,
  );
  const [selectedBuffId, setSelectedBuffId] = useState(
    savedBuild.buffs.selectedBuffId,
  );
  const [selectedItemsBySlot, setSelectedItemsBySlot] = useState<
    Partial<Record<EquipmentSlot, number>>
  >(savedBuild.equipment.selectedItemsBySlot);
  const [selectedCardsBySlot, setSelectedCardsBySlot] = useState<
    Partial<Record<EquipmentSlot, number[]>>
  >(savedBuild.equipment.selectedCardsBySlot);
  const [itemContexts, setItemContexts] = useState<
    Record<number, { refine?: number; grade?: number }>
  >(savedBuild.equipment.itemContexts);

  const { selectedItemDetails, setSelectedItemDetails } = useCalculatorItemDetails(
    selectedItemsBySlot,
    selectedCardsBySlot,
  );
  const { selectedMonsterDetail, setSelectedMonsterDetail } =
    useCalculatorMonsterDetail(selectedMonsterId);

  const selectedClassSkills = useMemo(
    () => getCalculatorClassSkills(calculatorSkillTreeCatalog, selectedClassId),
    [selectedClassId],
  );
  const classBuffSkills = useMemo(
    () =>
      getCalculatorClassBuffSkills(calculatorSkillTreeCatalog, selectedClassId),
    [selectedClassId],
  );
  const manualBuffSkills = useMemo(
    () => getCalculatorManualBuffSkills(copy.buffs),
    [copy.buffs],
  );
  const buffSkills = useMemo(
    () => [...manualBuffSkills, ...classBuffSkills],
    [classBuffSkills, manualBuffSkills],
  );
  const equipmentItemIds = useMemo(
    () => Object.values(selectedItemsBySlot).filter(isNumber),
    [selectedItemsBySlot],
  );
  const cardItemIds = useMemo(
    () => Object.values(selectedCardsBySlot).flat().filter(isNumber),
    [selectedCardsBySlot],
  );
  const selectedCalculatorItems = useMemo(
    () =>
      [...equipmentItemIds, ...cardItemIds]
        .map((itemId) => selectedItemDetails[itemId])
        .filter((item): item is CalculatorItemDetail => Boolean(item)),
    [cardItemIds, equipmentItemIds, selectedItemDetails],
  );
  const resolvedEquipmentItemIds = useMemo(
    () => equipmentItemIds.filter((itemId) => Boolean(selectedItemDetails[itemId])),
    [equipmentItemIds, selectedItemDetails],
  );
  const resolvedCardItemIds = useMemo(
    () => cardItemIds.filter((itemId) => Boolean(selectedItemDetails[itemId])),
    [cardItemIds, selectedItemDetails],
  );
  const selectedClassName =
    calculatorSkillTreeClassOptions.find((job) => job.id === selectedClassId)
      ?.name ?? selectedClassId.replace(/_/g, " ");
  const effectiveLearnedSkills = useMemo(
    () => ({ ...learnedSkills, ...activeBuffs }),
    [activeBuffs, learnedSkills],
  );
  const activeBuffItemIds = useMemo(
    () => getActiveCalculatorBuffItemIds(activeBuffs),
    [activeBuffs],
  );
  const currentBuild = useMemo<CalculatorBuildPayload>(
    () => ({
      version: calculatorBuildPayloadVersion,
      name: buildName,
      character: {
        selectedClassId,
        baseLevel,
        jobLevel,
        stats,
      },
      attack: {
        selectedSkillId,
        skillLevel,
      },
      tree: {
        learnedSkills,
      },
      equipment: {
        itemContexts,
        selectedCardsBySlot,
        selectedItemsBySlot,
      },
      buffs: {
        activeBuffs,
        selectedBuffId,
      },
      target: {
        selectedMonsterId,
      },
    }),
    [
      activeBuffs,
      baseLevel,
      buildName,
      itemContexts,
      jobLevel,
      learnedSkills,
      selectedBuffId,
      selectedCardsBySlot,
      selectedClassId,
      selectedItemsBySlot,
      selectedMonsterId,
      selectedSkillId,
      skillLevel,
      stats,
    ],
  );

  useEffect(() => {
    if (!hasLoadedSavedBuildRef.current) {
      return;
    }

    if (skipNextModificationRef.current) {
      skipNextModificationRef.current = false;
    } else {
      setLastModifiedAt(Date.now());
    }

    window.localStorage.setItem(
      calculatorBuildStorageKey,
      JSON.stringify(currentBuild),
    );
  }, [currentBuild]);

  useEffect(() => {
    loadBuild(readSavedCalculatorBuild());
    hasLoadedSavedBuildRef.current = true;
  }, []);

  const loadBuild = useCallback((nextBuild: CalculatorBuildPayload) => {
    skipNextModificationRef.current = true;
    setBuildName(nextBuild.name);
    setSelectedClassId(nextBuild.character.selectedClassId);
    setLearnedSkills(nextBuild.tree.learnedSkills);
    setBaseLevel(nextBuild.character.baseLevel);
    setJobLevel(nextBuild.character.jobLevel);
    setStats(nextBuild.character.stats);
    setSelectedSkillId(nextBuild.attack.selectedSkillId);
    setSkillLevel(nextBuild.attack.skillLevel);
    setSelectedMonsterId(nextBuild.target.selectedMonsterId);
    setActiveBuffs(nextBuild.buffs.activeBuffs);
    setSelectedBuffId(nextBuild.buffs.selectedBuffId);
    setSelectedItemsBySlot(nextBuild.equipment.selectedItemsBySlot);
    setSelectedCardsBySlot(nextBuild.equipment.selectedCardsBySlot);
    setItemContexts(nextBuild.equipment.itemContexts);
    setSelectedItemDetails({});
    setSelectedMonsterDetail(null);
    markAsSaved();
  }, []);

  function markAsSaved() {
    const now = Date.now();
    setLastSavedAt(now);
    setLastModifiedAt(now);
  }

  function renameBuild(nextName: string) {
    setBuildName(nextName);
  }

  function handleClassChange(classId: string) {
    const isFourthJob = isFourthJobClassId(classId);

    setSelectedClassId(classId);
    setLearnedSkills({});
    setActiveBuffs({});
    setJobLevel((currentJobLevel) =>
      Math.min(currentJobLevel, isFourthJob ? 70 : 60),
    );

    const nextSkills = getCalculatorClassSkills(calculatorSkillTreeCatalog, classId);
    const nextSkill = nextSkills[0];

    if (nextSkill) {
      setSelectedSkillId(nextSkill.id);
      setSkillLevel(Math.min(skillLevel, nextSkill.maxLevel));
    }

    setSelectedBuffId(manualBuffSkills[0]?.id ?? "");

    if (!isFourthJob) {
      setStats((currentStats) => ({
        ...currentStats,
        pow: 0,
        sta: 0,
        wis: 0,
        spl: 0,
        con: 0,
        crt: 0,
      }));
    }
  }

  function resetBuild() {
    const defaultClassId =
      defaultCalculatorInput.character.classId ?? "Dragon_Knight";

    skipNextModificationRef.current = true;
    window.localStorage.removeItem(calculatorBuildStorageKey);
    setBuildName(createDefaultCalculatorBuild().name);

    // Agora sim, reseta o form
    setSelectedClassId(defaultClassId);
    setStats({
      str: 1,
      agi: 1,
      vit: 1,
      int: 1,
      dex: 1,
      luk: 1,
      pow: 0,
      sta: 0,
      wis: 0,
      spl: 0,
      con: 0,
      crt: 0,
    });
    setBaseLevel(defaultCalculatorInput.character.baseLevel);
    setJobLevel(defaultCalculatorInput.character.jobLevel);
    setLearnedSkills({});
    setSelectedSkillId(defaultCalculatorInput.skillId);
    setSkillLevel(defaultCalculatorInput.skillLevel);
    setSelectedMonsterId(defaultCalculatorInput.monsterId);
    setActiveBuffs({});
    setSelectedBuffId("");
    setSelectedItemsBySlot({});
    setSelectedCardsBySlot({});
    setItemContexts({});
    setSelectedItemDetails({});
    setSelectedMonsterDetail(null);
  }

  return {
    activeBuffItemIds,
    activeBuffs,
    baseLevel,
    buildName,
    buffSkills,
    cardItemIds,
    effectiveLearnedSkills,
    equipmentItemIds,
    handleClassChange,
    itemContexts,
    jobLevel,
    lastModifiedAt,
    lastSavedAt,
    learnedSkills,
    loadBuild,
    markAsSaved,
    resetBuild,
    resolvedCardItemIds,
    resolvedEquipmentItemIds,
    selectedBuffId,
    selectedCalculatorItems,
    selectedCardsBySlot,
    selectedClassId,
    selectedClassName,
    selectedClassSkills,
    selectedItemDetails,
    selectedItemsBySlot,
    selectedMonsterDetail,
    selectedMonsterId,
    selectedSkillId,
    setActiveBuffs,
    setBaseLevel,
    setItemContexts,
    setJobLevel,
    setLearnedSkills,
    setSelectedBuffId,
    setSelectedCardsBySlot,
    setSelectedItemsBySlot,
    setSelectedMonsterId,
    setSelectedSkillId,
    setSkillLevel,
    setStats,
    skillLevel,
    stats,
    currentBuild,
    renameBuild,
  };
}

function isNumber(value: unknown): value is number {
  return typeof value === "number" && Number.isFinite(value);
}
