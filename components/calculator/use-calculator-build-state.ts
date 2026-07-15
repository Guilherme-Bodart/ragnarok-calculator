"use client";

import { useMemo } from "react";
import {
  getCalculatorManualBuffSkills,
  getActiveCalculatorBuffItemIds,
} from "./calculator-buff-data";
import {
  calculatorBuildPayloadVersion,
  type CalculatorBuildPayload,
} from "./calculator-build-payload";
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
} from "./calculator-skill-tree-data";
import type { CalculatorDictionary } from "./calculator-i18n";
import { useCalculatorBuildStore } from "./calculator-build-store";

export function useCalculatorBuildState(copy: CalculatorDictionary) {
  const store = useCalculatorBuildStore();

  const { selectedItemDetails, setSelectedItemDetails } = useCalculatorItemDetails(
    store.selectedItemsBySlot,
    store.selectedCardsBySlot,
  );
  
  const { selectedMonsterDetail, setSelectedMonsterDetail } =
    useCalculatorMonsterDetail(store.selectedMonsterId);

  const selectedClassSkills = useMemo(
    () => getCalculatorClassSkills(calculatorSkillTreeCatalog, store.selectedClassId),
    [store.selectedClassId],
  );
  
  const classBuffSkills = useMemo(
    () =>
      getCalculatorClassBuffSkills(calculatorSkillTreeCatalog, store.selectedClassId),
    [store.selectedClassId],
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
    () => Object.values(store.selectedItemsBySlot).filter(isNumber),
    [store.selectedItemsBySlot],
  );
  
  const cardItemIds = useMemo(
    () => Object.values(store.selectedCardsBySlot).flat().filter(isNumber),
    [store.selectedCardsBySlot],
  );
  
  const selectedCalculatorItems = useMemo(
    () =>
      [...equipmentItemIds, ...cardItemIds]
        .map((itemId) => selectedItemDetails[itemId])
        .filter((item): item is CalculatorItemDetail => Boolean(item)),
    [cardItemIds, equipmentItemIds, selectedItemDetails],
  );
  
  const resolvedEquipmentItemIds = useMemo(() => {
    let ids = Object.entries(store.selectedItemsBySlot)
      .map(([slot, itemId]) => ({ slot, itemId: itemId as number }))
      .filter((entry) => Boolean(entry.itemId && selectedItemDetails[entry.itemId]));

    const weaponId = store.selectedItemsBySlot["weapon"];
    const weaponItem = weaponId ? selectedItemDetails[weaponId] : null;
    const isTwoHandedWeapon = weaponItem && [
      "twoHandSword", "twoHandSpear", "twoHandRod", "twoHandAxe",
      "bow", "katar", "rifle", "shotgun", "gatlingGun", "grenadeLauncher",
      "musicalInstrument", "whip"
    ].includes(weaponItem.weaponType ?? "");

    if (isTwoHandedWeapon) {
      ids = ids.filter((entry) => entry.slot !== "shield");
    }

    return ids.map((entry) => entry.itemId);
  }, [store.selectedItemsBySlot, selectedItemDetails]);
  
  const resolvedCardItemIds = useMemo(() => {
    const arr: { id: number; slot: string }[] = [];
    for (const [slot, cards] of Object.entries(store.selectedCardsBySlot)) {
      if (!Array.isArray(cards)) continue;
      for (const id of cards) {
        if (typeof id === "number" && selectedItemDetails[id]) {
          arr.push({ id, slot });
        }
      }
    }
    return arr;
  }, [store.selectedCardsBySlot, selectedItemDetails]);
  
  const selectedClassName =
    calculatorSkillTreeClassOptions.find((job) => job.id === store.selectedClassId)
      ?.name ?? store.selectedClassId.replace(/_/g, " ");
      
  const effectiveLearnedSkills = useMemo(
    () => ({ ...store.learnedSkills, ...store.activeBuffs }),
    [store.activeBuffs, store.learnedSkills],
  );
  
  const activeBuffItemIds = useMemo(
    () => getActiveCalculatorBuffItemIds(store.activeBuffs),
    [store.activeBuffs],
  );
  
  const currentBuild = useMemo<CalculatorBuildPayload>(
    () => ({
      version: calculatorBuildPayloadVersion,
      name: store.buildName,
      character: {
        selectedClassId: store.selectedClassId,
        baseLevel: store.baseLevel,
        jobLevel: store.jobLevel,
        stats: store.stats,
      },
      attack: {
        selectedSkillId: store.selectedSkillId,
        skillLevel: store.skillLevel,
      },
      tree: {
        learnedSkills: store.learnedSkills,
      },
      equipment: {
        itemContexts: store.itemContexts,
        selectedCardsBySlot: store.selectedCardsBySlot,
        selectedItemsBySlot: store.selectedItemsBySlot,
      },
      buffs: {
        activeBuffs: store.activeBuffs,
        selectedBuffId: store.selectedBuffId,
      },
      target: {
        selectedMonsterId: store.selectedMonsterId,
      },
    }),
    [
      store.activeBuffs,
      store.baseLevel,
      store.buildName,
      store.itemContexts,
      store.jobLevel,
      store.learnedSkills,
      store.selectedBuffId,
      store.selectedCardsBySlot,
      store.selectedClassId,
      store.selectedItemsBySlot,
      store.selectedMonsterId,
      store.selectedSkillId,
      store.skillLevel,
      store.stats,
    ],
  );

  function handleClassChange(classId: string) {
    store.handleClassChange(classId, manualBuffSkills);
  }

  function resetBuild() {
    store.resetBuild();
    setSelectedItemDetails({});
    setSelectedMonsterDetail(null);
  }

  function loadBuild(nextBuild: CalculatorBuildPayload) {
    store.loadBuild(nextBuild);
    setSelectedItemDetails({});
    setSelectedMonsterDetail(null);
  }

  return {
    activeBuffItemIds,
    activeBuffs: store.activeBuffs,
    baseLevel: store.baseLevel,
    buildName: store.buildName,
    buffSkills,
    cardItemIds,
    effectiveLearnedSkills,
    equipmentItemIds,
    handleClassChange,
    itemContexts: store.itemContexts,
    jobLevel: store.jobLevel,
    lastModifiedAt: store.lastModifiedAt,
    lastSavedAt: store.lastSavedAt,
    learnedSkills: store.learnedSkills,
    loadBuild,
    markAsSaved: store.markAsSaved,
    resetBuild,
    resolvedCardItemIds,
    resolvedEquipmentItemIds,
    selectedBuffId: store.selectedBuffId,
    selectedCalculatorItems,
    selectedCardsBySlot: store.selectedCardsBySlot,
    selectedClassId: store.selectedClassId,
    selectedClassName,
    selectedClassSkills,
    selectedItemDetails,
    selectedItemsBySlot: store.selectedItemsBySlot,
    selectedMonsterDetail,
    selectedMonsterId: store.selectedMonsterId,
    selectedSkillId: store.selectedSkillId,
    setActiveBuffs: store.setActiveBuffs,
    setBaseLevel: store.setBaseLevel,
    setItemContexts: store.setItemContexts,
    setJobLevel: store.setJobLevel,
    setLearnedSkills: store.setLearnedSkills,
    setSelectedBuffId: store.setSelectedBuffId,
    setSelectedCardsBySlot: store.setSelectedCardsBySlot,
    setSelectedItemsBySlot: store.setSelectedItemsBySlot,
    setSelectedMonsterId: store.setSelectedMonsterId,
    setSelectedSkillId: store.setSelectedSkillId,
    setSkillLevel: store.setSkillLevel,
    setStats: store.setStats,
    skillLevel: store.skillLevel,
    stats: store.stats,
    currentBuild,
    renameBuild: store.renameBuild,
  };
}

function isNumber(value: unknown): value is number {
  return typeof value === "number" && Number.isFinite(value);
}
