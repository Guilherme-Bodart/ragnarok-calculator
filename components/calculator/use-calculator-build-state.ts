"use client";

import { useEffect, useMemo, useRef, useState } from "react";
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
  getCalculatorMonsterDetail,
  type CalculatorMonsterDetail,
} from "./calculator-monster-data";
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
  const [buildName, setBuildName] = useState(savedBuild.name);
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
    Record<number, { refine?: number }>
  >(savedBuild.equipment.itemContexts);
  const [selectedItemDetails, setSelectedItemDetails] = useState<
    Record<number, CalculatorItemDetail>
  >({});
  const [selectedMonsterDetail, setSelectedMonsterDetail] =
    useState<CalculatorMonsterDetail | null>(null);

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

    window.localStorage.setItem(
      calculatorBuildStorageKey,
      JSON.stringify(currentBuild),
    );
  }, [currentBuild]);

  useEffect(() => {
    loadBuild(readSavedCalculatorBuild());
    hasLoadedSavedBuildRef.current = true;
  }, []);

  function loadBuild(nextBuild: CalculatorBuildPayload) {
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
  }

  function renameBuild(nextName: string) {
    setBuildName(nextName);
  }
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

  useEffect(() => {
    let isCurrent = true;

    getCalculatorMonsterDetail(selectedMonsterId)
      .then((monster) => {
        if (isCurrent) {
          setSelectedMonsterDetail(monster);
        }
      })
      .catch(() => undefined);

    return () => {
      isCurrent = false;
    };
  }, [selectedMonsterId]);

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
    setBuildName(createDefaultCalculatorBuild().name);
    setSelectedClassId(defaultClassId);
    setLearnedSkills({});
    setBaseLevel(calculatorDemoInput.character.baseLevel);
    setJobLevel(calculatorDemoInput.character.jobLevel);
    setStats(createDefaultCalculatorBuild().character.stats);
    setSelectedSkillId(nextSkills[0]?.id ?? calculatorDemoInput.skillId);
    setSkillLevel(calculatorDemoInput.skillLevel);
    setSelectedMonsterId(calculatorDemoInput.monsterId);
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
    learnedSkills,
    loadBuild,
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
