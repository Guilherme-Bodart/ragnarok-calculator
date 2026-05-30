"use client";

import { Field } from "@/components/ui/field";
import { NumberSelect } from "@/components/ui/number-select";
import { RichSelect } from "@/components/ui/rich-select";
import type { EquipmentSlot } from "@/packages/calculator-core/src";
import type { CalculatorDictionary } from "./calculator-i18n";
import type {
  CalculatorItemDetail,
  CalculatorItemIndexOption,
} from "./calculator-item-data";
import { ensureSelectedOption } from "./calculator-item-picker-utils";

type CalculatorItemSelectFieldsProps = {
  copy: CalculatorDictionary;
  editingSlot: EquipmentSlot;
  itemContexts: Record<number, { refine?: number }>;
  itemQuery: string;
  selectedItem: CalculatorItemIndexOption | CalculatorItemDetail | undefined;
  slotOptions: CalculatorItemIndexOption[];
  onItemQueryChange: (query: string) => void;
  onRefineChange: (
    item: CalculatorItemIndexOption | CalculatorItemDetail,
    refine: number,
  ) => void;
  onSelectItem: (slotId: EquipmentSlot, itemId: string) => void;
};

export function CalculatorItemSelectFields({
  copy,
  editingSlot,
  itemContexts,
  itemQuery,
  selectedItem,
  slotOptions,
  onItemQueryChange,
  onRefineChange,
  onSelectItem,
}: CalculatorItemSelectFieldsProps) {
  return (
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
          onChange={(itemId) => onSelectItem(editingSlot, itemId)}
          onSearchChange={onItemQueryChange}
        />
      </Field>

      {selectedItem?.refineable ? (
        <Field label={copy.equipment.refineLabel}>
          <NumberSelect
            min={0}
            max={20}
            prefix="+"
            value={itemContexts[selectedItem.id]?.refine ?? 0}
            onChange={(refine) => onRefineChange(selectedItem, refine)}
          />
        </Field>
      ) : null}
    </div>
  );
}
