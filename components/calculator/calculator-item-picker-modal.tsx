"use client";

import { useEffect, useState } from "react";
import { Shield } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Modal } from "@/components/ui/modal";
import type { EquipmentSlot } from "@/packages/calculator-core/src";
import { CalculatorCardSelectGrid } from "./calculator-card-select-grid";
import type { CalculatorDictionary } from "./calculator-i18n";
import { CalculatorItemPreview } from "./calculator-item-preview";
import { selectedItemHasModifiers } from "./calculator-item-picker-utils";
import { CalculatorItemSelectFields } from "./calculator-item-select-fields";
import {
  searchCalculatorItems,
  type CalculatorItemDetail,
  type CalculatorItemIndexOption,
} from "./calculator-item-data";

type CalculatorItemPickerModalProps = {
  copy: CalculatorDictionary;
  editingSlot: EquipmentSlot;
  itemContexts: Record<number, { refine?: number }>;
  selectedCardsBySlot: Partial<Record<EquipmentSlot, number[]>>;
  selectedItemDetails: Record<number, CalculatorItemDetail>;
  selectedItemsBySlot: Partial<Record<EquipmentSlot, number>>;
  onClose: () => void;
  onItemContextsChange: (contexts: Record<number, { refine?: number }>) => void;
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
  const [cardOptions, setCardOptions] = useState<CalculatorItemIndexOption[]>([]);
  const [cardQuery, setCardQuery] = useState("");
  const [itemQuery, setItemQuery] = useState("");
  const [slotOptions, setSlotOptions] = useState<CalculatorItemIndexOption[]>([]);
  const selectedItemId = selectedItemsBySlot[editingSlot];
  const selectedItem =
    slotOptions.find((item) => item.id === selectedItemId) ??
    (selectedItemId ? selectedItemDetails[selectedItemId] : undefined);
  const selectedCards = selectedCardsBySlot[editingSlot] ?? [];
  const cardSlotCount = Math.min(selectedItem?.cardSlots ?? 0, 4);

  useEffect(() => {
    let isCurrent = true;
    const timeoutId = window.setTimeout(() => {
      searchCalculatorItems({ limit: 80, query: itemQuery, slot: editingSlot })
        .then((items) => {
          if (isCurrent) setSlotOptions(items);
        })
        .catch(() => {
          if (isCurrent) setSlotOptions([]);
        });
    }, 180);

    return () => {
      isCurrent = false;
      window.clearTimeout(timeoutId);
    };
  }, [editingSlot, itemQuery]);

  useEffect(() => {
    if (cardSlotCount <= 0) {
      return;
    }

    let isCurrent = true;
    const timeoutId = window.setTimeout(() => {
      searchCalculatorItems({ kind: "card", limit: 80, query: cardQuery })
        .then((items) => {
          if (isCurrent) setCardOptions(items);
        })
        .catch(() => {
          if (isCurrent) setCardOptions([]);
        });
    }, 180);

    return () => {
      isCurrent = false;
      window.clearTimeout(timeoutId);
    };
  }, [cardQuery, cardSlotCount]);

  function selectItem(slotId: EquipmentSlot, itemId: string) {
    const nextItems = { ...selectedItemsBySlot };
    const nextCards = { ...selectedCardsBySlot };

    if (itemId === "empty") {
      delete nextItems[slotId];
      delete nextCards[slotId];
    } else {
      nextItems[slotId] = Number(itemId);
      nextCards[slotId] = [];
    }

    onSelectedItemsBySlotChange(nextItems);
    onSelectedCardsBySlotChange(nextCards);
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
      meta={copy.equipment.slots[editingSlot]}
      onClose={onClose}
    >
        <CalculatorItemSelectFields
          copy={copy}
          editingSlot={editingSlot}
          itemContexts={itemContexts}
          itemQuery={itemQuery}
          selectedItem={selectedItem}
          slotOptions={slotOptions}
          onItemQueryChange={setItemQuery}
          onRefineChange={setRefine}
          onSelectItem={selectItem}
        />

        <CalculatorItemPreview
          copy={copy}
          item={selectedItem}
          itemContexts={itemContexts}
          selectedCards={selectedCards}
          selectedItemDetails={selectedItemDetails}
        />

        <CalculatorCardSelectGrid
          cardOptions={cardOptions}
          cardQuery={cardQuery}
          cardSlotCount={cardSlotCount}
          copy={copy}
          editingSlot={editingSlot}
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
