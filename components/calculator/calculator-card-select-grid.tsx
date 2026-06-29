"use client";

import { Field } from "@/components/ui/field";
import { RichSelect } from "@/components/ui/rich-select";
import type { EquipmentSlot } from "@/packages/calculator-core/src";
import type { CalculatorDictionary } from "./calculator-i18n";
import type {
  CalculatorItemDetail,
  CalculatorItemIndexOption,
} from "./calculator-item-data";
import { ensureSelectedCardOptions } from "./calculator-item-picker-utils";

import { CalculatorItemIcon } from "./calculator-item-icon";

type CalculatorCardSelectGridProps = {
  cardOptions: CalculatorItemIndexOption[];
  cardQuery: string;
  cardSlotCount: number;
  isCardSearchReady: boolean;
  copy: CalculatorDictionary;
  editingSlot: EquipmentSlot;
  selectedCards: number[];
  selectedItemDetails: Record<number, CalculatorItemDetail>;
  onCardQueryChange: (query: string) => void;
  onSelectCard: (slotId: EquipmentSlot, index: number, itemId: string) => void;
};

export function CalculatorCardSelectGrid({
  cardOptions,
  cardQuery,
  cardSlotCount,
  isCardSearchReady,
  copy,
  editingSlot,
  selectedCards,
  selectedItemDetails,
  onCardQueryChange,
  onSelectCard,
}: CalculatorCardSelectGridProps) {
  if (cardSlotCount <= 0) {
    return null;
  }

  return (
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
                    icon: <CalculatorItemIcon itemId={card.id} size={20} />
                  })),
                ],
              },
            ]}
            searchable
            searchValue={cardQuery}
            searchPlaceholder={copy.equipment.searchCardPlaceholder}
            emptyText={
              isCardSearchReady
                ? copy.equipment.noSearchResults
                : copy.equipment.searchMinLengthHint
            }
            value={String(selectedCards[index] ?? "empty")}
            onChange={(itemId) => onSelectCard(editingSlot, index, itemId)}
            onSearchChange={onCardQueryChange}
          />
        </Field>
      ))}
    </div>
  );
}
