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
import { CalculatorCardSelectGrid } from "./calculator-card-select-grid";
import type { CalculatorDictionary } from "./calculator-i18n";
import { CalculatorItemPreview } from "./calculator-item-preview";
import {
  getCardSlotCount,
  getValidCardsForItem,
  selectedItemHasModifiers,
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
  onClose,
  onItemContextsChange,
  onSelectedCardsBySlotChange,
  onSelectedItemsBySlotChange,
}: CalculatorItemPickerModalProps) {
  const [cardSearchResult, setCardSearchResult] = useState<{
    options: CalculatorItemIndexOption[];
    query: string;
  }>({ options: [], query: "" });
  const [cardQuery, setCardQuery] = useState("");
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
  const debouncedCardQuery = useDebouncedValue(
    cardQuery,
    CALCULATOR_ITEM_SEARCH_DEBOUNCE_MS,
  );
  const isItemSearchReady = isCalculatorItemSearchReady(itemQuery);
  const isCardSearchReady = isCalculatorItemSearchReady(cardQuery);
  const normalizedItemQuery = normalizeCalculatorItemSearchQuery(itemQuery);
  const normalizedCardQuery = normalizeCalculatorItemSearchQuery(cardQuery);
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
  const cardSlotCount = getCardSlotCount(selectedItem);
  const effectiveCardOptions =
    isCardSearchReady &&
    cardSlotCount > 0 &&
    cardSearchResult.query === normalizedCardQuery
      ? cardSearchResult.options
      : [];

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

  useEffect(() => {
    if (cardSlotCount <= 0) {
      return;
    }

    if (!isCalculatorItemSearchReady(debouncedCardQuery)) {
      return;
    }

    let isCurrent = true;

    const query = normalizeCalculatorItemSearchQuery(debouncedCardQuery);

    searchCalculatorItems({ kind: "card", limit: 80, query })
      .then((items) => {
        if (isCurrent) setCardSearchResult({ options: items, query });
      })
      .catch(() => {
        if (isCurrent) setCardSearchResult({ options: [], query });
      });

    return () => {
      isCurrent = false;
    };
  }, [cardSlotCount, debouncedCardQuery]);

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

  function selectCard(slotId: EquipmentSlot, index: number, itemId: string) {
    const cards = [...(selectedCardsBySlot[slotId] ?? [])];

    if (itemId === "empty") {
      cards.splice(index, 1);
    } else {
      cards[index] = Number(itemId);
    }

    onSelectedCardsBySlotChange({
      ...selectedCardsBySlot,
      [slotId]: cards.filter(Boolean),
    });
  }

  function setRefine(
    item: CalculatorItemIndexOption | CalculatorItemDetail,
    refine: number,
  ) {
    onItemContextsChange({
      ...itemContexts,
      [item.id]: {
        refine,
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
          onSelectItem={selectItem}
        />

        <CalculatorItemPreview
          cardOptions={effectiveCardOptions}
          copy={copy}
          item={selectedItem}
          itemContexts={itemContexts}
          selectedCards={selectedCards}
          selectedItemDetails={selectedItemDetails}
        />

        <CalculatorCardSelectGrid
          cardOptions={effectiveCardOptions}
          cardQuery={cardQuery}
          cardSlotCount={cardSlotCount}
          copy={copy}
          editingSlot={editingSlot}
          isCardSearchReady={isCardSearchReady}
          selectedCards={selectedCards}
          selectedItemDetails={selectedItemDetails}
          onCardQueryChange={setCardQuery}
          onSelectCard={selectCard}
        />

        <div className="calc-modifier-preview">
          <strong>{copy.equipment.modifiersTitle}</strong>
          <p>
            {selectedItemHasModifiers(selectedItem)
              ? copy.equipment.modifiersReady
              : copy.equipment.noModifiers}
          </p>
        </div>

        <Button type="button" onClick={onClose}>
          {copy.equipment.doneAction}
        </Button>
    </Modal>
  );
}
