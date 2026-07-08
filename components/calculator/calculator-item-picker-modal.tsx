"use client";

import { useEffect, useState } from "react";
import { Shield } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Modal } from "@/components/ui/modal";
import {
  CALCULATOR_ITEM_SEARCH_DEBOUNCE_MS,
  isCalculatorItemSearchReady,
  normalizeCalculatorItemSearchQuery,
} from "@/lib/calculator-item-search";
import type { EquipmentSlot } from "@/packages/calculator-core/src";
import type { CalculatorDictionary } from "./calculator-i18n";
import { CalculatorItemPreview } from "./calculator-item-preview";
import {
  getCardSlotCount,
  getValidCardsForItem,
} from "./calculator-item-picker-utils";
import { CalculatorItemSelectFields } from "./calculator-item-select-fields";
import {
  searchCalculatorItems,
  type CalculatorItemDetail,
  type CalculatorItemIndexOption,
} from "./calculator-item-data";
import { useDebouncedValue } from "./use-debounced-value";

type CalculatorItemPickerModalProps = {
  copy: CalculatorDictionary;
  editingSlot: EquipmentSlot;
  itemContexts: Record<number, { refine?: number; grade?: number }>;
  selectedCardsBySlot: Partial<Record<EquipmentSlot, number[]>>;
  selectedItemDetails: Record<number, CalculatorItemDetail>;
  selectedItemsBySlot: Partial<Record<EquipmentSlot, number>>;
  learnedSkills?: Record<string, number>;
  onClose: () => void;
  onItemContextsChange: (
    contexts: Record<number, { refine?: number; grade?: number }>,
  ) => void;
  onSelectedCardsBySlotChange: (
    cardsBySlot: Partial<Record<EquipmentSlot, number[]>>,
  ) => void;
  onSelectedItemsBySlotChange: (
    itemsBySlot: Partial<Record<EquipmentSlot, number>>,
  ) => void;
};

export function CalculatorItemPickerModal({
  copy,
  editingSlot,
  itemContexts,
  selectedCardsBySlot,
  selectedItemDetails,
  selectedItemsBySlot,
  learnedSkills,
  onClose,
  onItemContextsChange,
  onSelectedCardsBySlotChange,
  onSelectedItemsBySlotChange,
}: CalculatorItemPickerModalProps) {
  const [itemQuery, setItemQuery] = useState("");
  const [slotSearchResult, setSlotSearchResult] = useState<{
    options: CalculatorItemIndexOption[];
    query: string;
    slot: EquipmentSlot;
  }>({ options: [], query: "", slot: editingSlot });

  const debouncedItemQuery = useDebouncedValue(
    itemQuery,
    CALCULATOR_ITEM_SEARCH_DEBOUNCE_MS,
  );

  const isItemSearchReady = isCalculatorItemSearchReady(itemQuery);
  const normalizedItemQuery = normalizeCalculatorItemSearchQuery(itemQuery);

  const effectiveSlotOptions =
    isItemSearchReady &&
    slotSearchResult.query === normalizedItemQuery &&
    slotSearchResult.slot === editingSlot
      ? slotSearchResult.options
      : [];

  const selectedItemId = selectedItemsBySlot[editingSlot];
  const selectedItem =
    effectiveSlotOptions.find((item) => item.id === selectedItemId) ??
    (selectedItemId ? selectedItemDetails[selectedItemId] : undefined);

  const selectedCards = selectedCardsBySlot[editingSlot] ?? [];

  // Search items effect
  useEffect(() => {
    if (!isCalculatorItemSearchReady(debouncedItemQuery)) {
      return;
    }

    let isCurrent = true;

    const query = normalizeCalculatorItemSearchQuery(debouncedItemQuery);

    searchCalculatorItems({ limit: 80, query, slot: editingSlot })
      .then((items) => {
        if (isCurrent) setSlotSearchResult({ options: items, query, slot: editingSlot });
      })
      .catch(() => {
        if (isCurrent) setSlotSearchResult({ options: [], query, slot: editingSlot });
      });

    return () => {
      isCurrent = false;
    };
  }, [debouncedItemQuery, editingSlot]);

  function selectItem(slotId: EquipmentSlot, itemId: string) {
    const nextItems = { ...selectedItemsBySlot };
    const nextCards = { ...selectedCardsBySlot };
    const nextContexts = { ...itemContexts };
    const previousItemId = selectedItemsBySlot[slotId];

    if (itemId === "empty") {
      delete nextItems[slotId];
      delete nextCards[slotId];
      if (previousItemId) delete nextContexts[previousItemId];
    } else {
      const nextItemId = Number(itemId);
      const nextSelectedItem =
        effectiveSlotOptions.find((item) => item.id === nextItemId) ??
        selectedItemDetails[nextItemId];
      
      const validCards = getValidCardsForItem(
        selectedCardsBySlot[slotId] ?? [],
        nextSelectedItem,
      );

      nextItems[slotId] = nextItemId;
      if (validCards.length > 0) {
        nextCards[slotId] = validCards;
      } else {
        delete nextCards[slotId];
      }
      if (previousItemId && previousItemId !== nextItemId) {
        delete nextContexts[previousItemId];
      }

      if (
        slotId === "weapon" &&
        nextSelectedItem &&
        "isTwoHanded" in nextSelectedItem &&
        nextSelectedItem.isTwoHanded
      ) {
        delete nextItems.shield;
        delete nextCards.shield;
      }

      if (slotId === "shield" && nextItems.weapon) {
        const weaponId = nextItems.weapon;
        const weaponItem = selectedItemDetails[weaponId];
        if (weaponItem?.isTwoHanded) {
          delete nextItems.weapon;
          delete nextCards.weapon;
        }
      }
    }

    onSelectedItemsBySlotChange(nextItems);
    onSelectedCardsBySlotChange(nextCards);
    onItemContextsChange(nextContexts);
  }

  function setRefine(
    item: CalculatorItemIndexOption | CalculatorItemDetail,
    refine: number,
  ) {
    onItemContextsChange({
      ...itemContexts,
      [item.id]: {
        ...itemContexts[item.id],
        refine,
      },
    });
  }

  function setGrade(
    item: CalculatorItemIndexOption | CalculatorItemDetail,
    grade: number,
  ) {
    onItemContextsChange({
      ...itemContexts,
      [item.id]: {
        ...itemContexts[item.id],
        grade,
      },
    });
  }

  return (
    <Modal
      ariaLabel={copy.equipment.modalTitle}
      closeLabel={copy.equipment.closeAction}
      icon={<Shield size={17} />}
      title={copy.equipment.modalTitle}
      onClose={onClose}
    >
      <CalculatorItemSelectFields
        copy={copy}
        editingSlot={editingSlot}
        itemContexts={itemContexts}
        itemQuery={itemQuery}
        isItemSearchReady={isItemSearchReady}
        selectedItem={selectedItem}
        slotOptions={effectiveSlotOptions}
        onItemQueryChange={setItemQuery}
        onRefineChange={setRefine}
        onGradeChange={setGrade}
        onSelectItem={selectItem}
      />

      <CalculatorItemPreview
        cardOptions={[]}
        copy={copy}
        item={selectedItem}
        itemContexts={itemContexts}
        selectedCards={selectedCards}
        selectedItemDetails={selectedItemDetails}
        selectedItemsBySlot={selectedItemsBySlot}
        learnedSkills={learnedSkills}
      />

      <Button type="button" onClick={onClose} className="mt-4 w-full">
        {copy.equipment.doneAction}
      </Button>
    </Modal>
  );
}
