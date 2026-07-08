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
import { useCalculatorBuildStore } from "./calculator-build-store";

type CalculatorEquipmentPanelProps = {
  selectedItemDetails: Record<number, CalculatorItemDetail>;
  copy: CalculatorDictionary;
};

export function CalculatorEquipmentPanel({
  copy,
  selectedItemDetails,
}: CalculatorEquipmentPanelProps) {
  const [activeTab, setActiveTab] = useState<"equip" | "special">("equip");
  const [editingSlot, setEditingSlot] = useState<EquipmentSlot | null>(null);
  const [editingCardsAndEnchantsSlot, setEditingCardsAndEnchantsSlot] = useState<EquipmentSlot | null>(null);

  const itemContexts = useCalculatorBuildStore((s) => s.itemContexts);
  const selectedCardsBySlot = useCalculatorBuildStore((s) => s.selectedCardsBySlot);
  const selectedItemsBySlot = useCalculatorBuildStore((s) => s.selectedItemsBySlot);
  const learnedSkills = useCalculatorBuildStore((s) => s.learnedSkills);
  
  const setItemContexts = useCalculatorBuildStore((s) => s.setItemContexts);
  const setSelectedCardsBySlot = useCalculatorBuildStore((s) => s.setSelectedCardsBySlot);
  const setSelectedItemsBySlot = useCalculatorBuildStore((s) => s.setSelectedItemsBySlot);

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
          learnedSkills={learnedSkills}
          onClose={() => setEditingSlot(null)}
          onItemContextsChange={setItemContexts}
          onSelectedCardsBySlotChange={setSelectedCardsBySlot}
          onSelectedItemsBySlotChange={setSelectedItemsBySlot}
        />
      ) : null}

      {editingCardsAndEnchantsSlot ? (
        <CalculatorCardEnchantModal
          copy={copy}
          editingSlot={editingCardsAndEnchantsSlot}
          selectedCardsBySlot={selectedCardsBySlot}
          selectedItemDetails={selectedItemDetails}
          selectedItemsBySlot={selectedItemsBySlot}
          itemContexts={itemContexts}
          learnedSkills={learnedSkills}
          onClose={() => setEditingCardsAndEnchantsSlot(null)}
          onSelectedCardsBySlotChange={setSelectedCardsBySlot}
        />
      ) : null}
    </section>
  );
}
