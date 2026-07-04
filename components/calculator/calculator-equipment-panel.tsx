"use client";

import { useState } from "react";
import { Shield } from "lucide-react";
import { PanelHeader } from "@/components/ui/panel-header";
import { TabButton, Tabs } from "@/components/ui/tabs";
import type { EquipmentSlot } from "@/packages/calculator-core/src";
import type { CalculatorDictionary } from "./calculator-i18n";
import { CalculatorEquipmentPaperdoll } from "./calculator-equipment-paperdoll";
import {
  calculatorEquipSlots,
  calculatorSpecialSlots,
} from "./calculator-equipment-slots";
import { CalculatorItemPickerModal } from "./calculator-item-picker-modal";
import { CalculatorCardEnchantModal } from "./calculator-card-enchant-modal";
import type { CalculatorItemDetail } from "./calculator-item-data";

type CalculatorEquipmentPanelProps = {
  itemContexts: Record<number, { refine?: number; grade?: number }>;
  selectedCardsBySlot: Partial<Record<EquipmentSlot, number[]>>;
  selectedItemDetails: Record<number, CalculatorItemDetail>;
  selectedItemsBySlot: Partial<Record<EquipmentSlot, number>>;
  copy: CalculatorDictionary;
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

export function CalculatorEquipmentPanel({
  copy,
  itemContexts,
  selectedCardsBySlot,
  selectedItemDetails,
  selectedItemsBySlot,
  onItemContextsChange,
  onSelectedCardsBySlotChange,
  onSelectedItemsBySlotChange,
}: CalculatorEquipmentPanelProps) {
  const [activeTab, setActiveTab] = useState<"equip" | "special">("equip");
  const [editingSlot, setEditingSlot] = useState<EquipmentSlot | null>(null);
  const [editingCardsAndEnchantsSlot, setEditingCardsAndEnchantsSlot] = useState<EquipmentSlot | null>(null);

  const activeSlots =
    activeTab === "equip" ? calculatorEquipSlots : calculatorSpecialSlots;

  return (
    <section className="flex flex-col gap-5">
      <PanelHeader
        icon={<Shield size={17} />}
        title={copy.equipment.title}
        meta={copy.equipment.meta}
      />

      <Tabs label={copy.equipment.tabsAria} variant="segmented">
        <TabButton
          active={activeTab === "equip"}
          onClick={() => setActiveTab("equip")}
        >
          {copy.equipment.tabs.equip}
        </TabButton>
        <TabButton
          active={activeTab === "special"}
          onClick={() => setActiveTab("special")}
        >
          {copy.equipment.tabs.special}
        </TabButton>
      </Tabs>

      <CalculatorEquipmentPaperdoll
        activeTab={activeTab}
        copy={copy}
        selectedCardsBySlot={selectedCardsBySlot}
        selectedItemDetails={selectedItemDetails}
        selectedItemsBySlot={selectedItemsBySlot}
        slots={activeSlots}
        onEditSlot={setEditingSlot}
        onEditCardsAndEnchants={setEditingCardsAndEnchantsSlot}
      />

      {editingSlot ? (
        <CalculatorItemPickerModal
          copy={copy}
          editingSlot={editingSlot}
          itemContexts={itemContexts}
          selectedCardsBySlot={selectedCardsBySlot}
          selectedItemDetails={selectedItemDetails}
          selectedItemsBySlot={selectedItemsBySlot}
          onClose={() => setEditingSlot(null)}
          onItemContextsChange={onItemContextsChange}
          onSelectedCardsBySlotChange={onSelectedCardsBySlotChange}
          onSelectedItemsBySlotChange={onSelectedItemsBySlotChange}
        />
      ) : null}

      {editingCardsAndEnchantsSlot ? (
        <CalculatorCardEnchantModal
          copy={copy}
          editingSlot={editingCardsAndEnchantsSlot}
          selectedCardsBySlot={selectedCardsBySlot}
          selectedItemDetails={selectedItemDetails}
          selectedItemsBySlot={selectedItemsBySlot}
          onClose={() => setEditingCardsAndEnchantsSlot(null)}
          onSelectedCardsBySlotChange={onSelectedCardsBySlotChange}
        />
      ) : null}
    </section>
  );
}
