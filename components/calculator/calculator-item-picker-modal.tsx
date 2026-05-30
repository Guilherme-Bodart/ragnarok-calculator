"use client";

import { useEffect, useState } from "react";
import { Shield, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Field } from "@/components/ui/field";
import { IconButton } from "@/components/ui/icon-button";
import { NumberSelect } from "@/components/ui/number-select";
import { PanelHeader } from "@/components/ui/panel-header";
import { RichSelect } from "@/components/ui/rich-select";
import type { EquipmentSlot } from "@/packages/calculator-core/src";
import type { CalculatorDictionary } from "./calculator-i18n";
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
    <div className="calc-modal-backdrop" role="presentation">
      <section
        aria-modal="true"
        className="calc-modal"
        role="dialog"
        aria-label={copy.equipment.modalTitle}
      >
        <PanelHeader
          icon={<Shield size={17} />}
          title={copy.equipment.modalTitle}
          meta={copy.equipment.slots[editingSlot]}
        />
        <IconButton
          className="calc-modal-close"
          label={copy.equipment.closeAction}
          type="button"
          onClick={onClose}
        >
          <X size={17} />
        </IconButton>

        <div className="calc-item-modal-grid">
          <Field label={copy.equipment.itemLabel}>
            <RichSelect
              groups={[
                {
                  label: copy.equipment.itemLabel,
                  options: [
                    { id: "empty", label: copy.equipment.empty },
                    ...ensureSelectedOption(slotOptions, selectedItem).map((item) => ({
                      id: String(item.id),
                      label: item.name,
                    })),
                  ],
                },
              ]}
              searchable
              searchValue={itemQuery}
              searchPlaceholder={copy.equipment.searchItemPlaceholder}
              value={selectedItem ? String(selectedItem.id) : "empty"}
              onChange={(itemId) => selectItem(editingSlot, itemId)}
              onSearchChange={setItemQuery}
            />
          </Field>

          {selectedItem?.refineable ? (
            <Field label={copy.equipment.refineLabel}>
              <NumberSelect
                min={0}
                max={20}
                prefix="+"
                value={itemContexts[selectedItem.id]?.refine ?? 0}
                onChange={(refine) => setRefine(selectedItem, refine)}
              />
            </Field>
          ) : null}
        </div>

        {cardSlotCount > 0 ? (
          <div className="calc-card-grid">
            {Array.from({ length: cardSlotCount }, (_, index) => (
              <Field label={`${copy.equipment.cardLabel} ${index + 1}`} key={index}>
                <RichSelect
                  groups={[
                    {
                      label: copy.equipment.cardLabel,
                      options: [
                        { id: "empty", label: copy.equipment.empty },
                        ...ensureSelectedCardOptions(
                          cardOptions,
                          selectedCards,
                          selectedItemDetails,
                        ).map((card) => ({
                          id: String(card.id),
                          label: card.name,
                        })),
                      ],
                    },
                  ]}
                  searchable
                  searchValue={cardQuery}
                  searchPlaceholder={copy.equipment.searchCardPlaceholder}
                  value={String(selectedCards[index] ?? "empty")}
                  onChange={(itemId) => selectCard(editingSlot, index, itemId)}
                  onSearchChange={setCardQuery}
                />
              </Field>
            ))}
          </div>
        ) : null}

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
      </section>
    </div>
  );
}

function ensureSelectedOption(
  options: CalculatorItemIndexOption[],
  selectedItem: CalculatorItemIndexOption | CalculatorItemDetail | undefined,
) {
  if (!selectedItem || options.some((option) => option.id === selectedItem.id)) {
    return options;
  }

  return [selectedItem, ...options];
}

function ensureSelectedCardOptions(
  options: CalculatorItemIndexOption[],
  selectedCardIds: number[],
  selectedItemDetails: Record<number, CalculatorItemDetail>,
) {
  const missingCards = selectedCardIds
    .map((cardId) => selectedItemDetails[cardId])
    .filter(
      (card): card is CalculatorItemDetail =>
        Boolean(card) && !options.some((option) => option.id === card.id),
    );

  return [...missingCards, ...options];
}

function selectedItemHasModifiers(
  item: CalculatorItemIndexOption | CalculatorItemDetail | undefined,
) {
  if (!item) {
    return false;
  }

  return "hasModifiers" in item ? item.hasModifiers : Boolean(item.rawScript);
}
