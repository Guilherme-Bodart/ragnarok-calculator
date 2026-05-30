"use client";

import { useEffect, useMemo, useState } from "react";
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
import { calculatorDemoInput } from "./calculator-demo-data";
import {
  getCalculatorItemDetail,
  type CalculatorItemDetail,
} from "./calculator-item-data";
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
  const [savedBuild] = useState(readSavedCalculatorBuild);
  const [selectedClassId, setSelectedClassId] = useState(
    savedBuild.selectedClassId,
  );
  const [learnedSkills, setLearnedSkills] = useState<Record<string, number>>(
    savedBuild.learnedSkills,
  );
  const [baseLevel, setBaseLevel] = useState(savedBuild.baseLevel);
  const [jobLevel, setJobLevel] = useState(savedBuild.jobLevel);
  const [stats, setStats] = useState(savedBuild.stats);
  const [selectedSkillId, setSelectedSkillId] = useState(
    savedBuild.selectedSkillId,
  );
  const [skillLevel, setSkillLevel] = useState(savedBuild.skillLevel);
  const [selectedMonsterId, setSelectedMonsterId] = useState(
    savedBuild.selectedMonsterId,
  );
  const [activeBuffs, setActiveBuffs] = useState<Record<string, number>>(
    savedBuild.activeBuffs,
  );
  const [selectedBuffId, setSelectedBuffId] = useState(savedBuild.selectedBuffId);
  const [selectedItemsBySlot, setSelectedItemsBySlot] = useState<
    Partial<Record<EquipmentSlot, number>>
  >(savedBuild.selectedItemsBySlot);
  const [selectedCardsBySlot, setSelectedCardsBySlot] = useState<
    Partial<Record<EquipmentSlot, number[]>>
  >(savedBuild.selectedCardsBySlot);
  const [itemContexts, setItemContexts] = useState<
    Record<number, { refine?: number }>
  >(savedBuild.itemContexts);
  const [selectedItemDetails, setSelectedItemDetails] = useState<
    Record<number, CalculatorItemDetail>
  >({});

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

  useEffect(() => {
    const build: CalculatorBuildPayload = {
      version: calculatorBuildPayloadVersion,
      name: savedBuild.name,
      activeBuffs,
      baseLevel,
      jobLevel,
      learnedSkills,
      selectedBuffId,
      selectedClassId,
      selectedMonsterId,
      selectedSkillId,
      skillLevel,
      stats,
      itemContexts,
      selectedCardsBySlot,
      selectedItemsBySlot,
    };

    window.localStorage.setItem(calculatorBuildStorageKey, JSON.stringify(build));
  }, [
    activeBuffs,
    baseLevel,
    jobLevel,
    itemContexts,
    learnedSkills,
    savedBuild.name,
    selectedCardsBySlot,
    selectedBuffId,
    selectedClassId,
    selectedItemsBySlot,
    selectedMonsterId,
    selectedSkillId,
    skillLevel,
    stats,
  ]);

  useEffect(() => {
    const selectedItemIds = [...equipmentItemIds, ...cardItemIds].filter(
      (itemId) => !selectedItemDetails[itemId],
    );

    if (selectedItemIds.length === 0) {
      return;
    }

    let isCurrent = true;

    Promise.all(selectedItemIds.map((itemId) => getCalculatorItemDetail(itemId)))
      .then((items) => {
        if (!isCurrent) return;

        setSelectedItemDetails((currentDetails) => ({
          ...currentDetails,
          ...Object.fromEntries(items.map((item) => [item.id, item])),
        }));
      })
      .catch(() => undefined);

    return () => {
      isCurrent = false;
    };
  }, [cardItemIds, equipmentItemIds, selectedItemDetails]);

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
      calculatorDemoInput.character.classId ?? "Dragon_Knight";
    const nextSkills = getCalculatorClassSkills(
      calculatorSkillTreeCatalog,
      defaultClassId,
    );

    window.localStorage.removeItem(calculatorBuildStorageKey);
    setSelectedClassId(defaultClassId);
    setLearnedSkills({});
    setBaseLevel(calculatorDemoInput.character.baseLevel);
    setJobLevel(calculatorDemoInput.character.jobLevel);
    setStats(createDefaultCalculatorBuild().stats);
    setSelectedSkillId(nextSkills[0]?.id ?? calculatorDemoInput.skillId);
    setSkillLevel(calculatorDemoInput.skillLevel);
    setSelectedMonsterId(calculatorDemoInput.monsterId);
    setActiveBuffs({});
    setSelectedBuffId("");
    setSelectedItemsBySlot({});
    setSelectedCardsBySlot({});
    setItemContexts({});
    setSelectedItemDetails({});
  }

  return {
    activeBuffItemIds,
    activeBuffs,
    baseLevel,
    buffSkills,
    cardItemIds,
    effectiveLearnedSkills,
    equipmentItemIds,
    handleClassChange,
    itemContexts,
    jobLevel,
    learnedSkills,
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
  };
}

function isNumber(value: unknown): value is number {
  return typeof value === "number" && Number.isFinite(value);
}
