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

import { CalculatorItemIcon } from "./calculator-item-icon";

type CalculatorItemSelectFieldsProps = {
  copy: CalculatorDictionary;
  editingSlot: EquipmentSlot;
  itemContexts: Record<number, { refine?: number; grade?: number }>;
  itemQuery: string;
  isItemSearchReady: boolean;
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
  isItemSearchReady,
  selectedItem,
  slotOptions,
  onItemQueryChange,
  onRefineChange,
  onSelectItem,
}: CalculatorItemSelectFieldsProps) {
  const canRefineSelectedItem = Boolean(selectedItem?.refineable);
  const selectedRefineValue =
    selectedItem && canRefineSelectedItem ? itemContexts[selectedItem.id]?.refine ?? 0 : 0;

  return (
    <div className="calc-item-modal-grid">
      <Field className="calc-item-select-field" label={copy.equipment.itemLabel}>
        <RichSelect
          fit="fill"
          groups={[
            {
              label: copy.equipment.itemLabel,
              options: [
                { id: "empty", label: copy.equipment.empty },
                ...ensureSelectedOption(slotOptions, selectedItem).map((item) => ({
                  id: String(item.id),
                  label: item.name,
                  icon: <CalculatorItemIcon itemId={item.id} size={20} />
                })),
              ],
            },
          ]}
          searchable
          searchValue={itemQuery}
          searchPlaceholder={copy.equipment.searchItemPlaceholder}
          emptyText={
            isItemSearchReady
              ? copy.equipment.noSearchResults
              : copy.equipment.searchMinLengthHint
          }
          value={selectedItem ? String(selectedItem.id) : "empty"}
          onChange={(itemId) => onSelectItem(editingSlot, itemId)}
          onSearchChange={onItemQueryChange}
        />
      </Field>

      <Field className="calc-refine-select-field" label={copy.equipment.refineLabel}>
        <NumberSelect
          disabled={!canRefineSelectedItem}
          min={0}
          max={20}
          prefix="+"
          value={selectedRefineValue}
          onChange={(refine) => {
            if (selectedItem && canRefineSelectedItem) {
              onRefineChange(selectedItem, refine);
            }
          }}
        />
      </Field>
    </div>
  );
}
