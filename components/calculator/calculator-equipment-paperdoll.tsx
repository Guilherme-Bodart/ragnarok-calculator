"use client";

import type { EquipmentSlot } from "@/packages/calculator-core/src";
import type { CalculatorDictionary } from "./calculator-i18n";
import type { CalculatorItemDetail } from "./calculator-item-data";
import type { CalculatorEquipmentSlotDefinition } from "./calculator-equipment-slots";
import { getShortItemName } from "./calculator-item-picker-utils";

type CalculatorEquipmentPaperdollProps = {
  activeTab: "equip" | "special";
  copy: CalculatorDictionary;
  selectedItemDetails: Record<number, CalculatorItemDetail>;
  selectedCardsBySlot: Partial<Record<EquipmentSlot, number[]>>;
  selectedItemsBySlot: Partial<Record<EquipmentSlot, number>>;
  slots: readonly CalculatorEquipmentSlotDefinition[];
  onEditSlot: (slotId: EquipmentSlot) => void;
};

export function CalculatorEquipmentPaperdoll({
  activeTab,
  copy,
  selectedItemDetails,
  selectedCardsBySlot,
  selectedItemsBySlot,
  slots,
  onEditSlot,
}: CalculatorEquipmentPaperdollProps) {
  return (
    <div
      className="equipment-paperdoll"
      data-equipment-tab={activeTab}
      aria-label={copy.equipment.aria}
    >
      <div className="equipment-avatar" aria-hidden="true">
        <div className="equipment-avatar-ring" />
        <div className="equipment-avatar-sprite">
          <span className="equipment-avatar-head" />
          <span className="equipment-avatar-body" />
          <span className="equipment-avatar-arm equipment-avatar-arm-left" />
          <span className="equipment-avatar-arm equipment-avatar-arm-right" />
          <span className="equipment-avatar-leg equipment-avatar-leg-left" />
          <span className="equipment-avatar-leg equipment-avatar-leg-right" />
        </div>
      </div>

      {slots.map((slot) => {
        const Icon = slot.icon;
        const label = copy.equipment.slots[slot.id];
        const itemId = selectedItemsBySlot[slot.id];
        const item = itemId ? selectedItemDetails[itemId] : null;
        const cardCount = selectedCardsBySlot[slot.id]?.length ?? 0;

        return (
          <button
            type="button"
            className="equipment-slot"
            data-slot-area={slot.area}
            key={slot.id}
            aria-label={`${label}: ${item?.name ?? copy.equipment.empty}`}
            onClick={() => onEditSlot(slot.id)}
          >
            <Icon size={17} />
            <span>{label}</span>
            <strong>{item ? getShortItemName(item.name) : copy.equipment.empty}</strong>
            {cardCount > 0 ? <small>{cardCount} carta(s)</small> : null}
          </button>
        );
      })}
    </div>
  );
}
