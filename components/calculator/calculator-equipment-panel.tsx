"use client";

import { useState } from "react";
import { Shield, Trash2 } from "lucide-react";
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
  const [editingCardsAndEnchantsSlot, setEditingCardsAndEnchantsSlot] =
    useState<EquipmentSlot | null>(null);

  const itemContexts = useCalculatorBuildStore((s) => s.itemContexts);
  const selectedCardsBySlot = useCalculatorBuildStore(
    (s) => s.selectedCardsBySlot,
  );
  const selectedItemsBySlot = useCalculatorBuildStore(
    (s) => s.selectedItemsBySlot,
  );
  const learnedSkills = useCalculatorBuildStore((s) => s.learnedSkills);

  const setItemContexts = useCalculatorBuildStore((s) => s.setItemContexts);
  const setSelectedCardsBySlot = useCalculatorBuildStore(
    (s) => s.setSelectedCardsBySlot,
  );
  const setSelectedItemsBySlot = useCalculatorBuildStore(
    (s) => s.setSelectedItemsBySlot,
  );

  const activeSlots =
    activeTab === "equip" ? calculatorEquipSlots : calculatorSpecialSlots;

  const equipTabCount = calculatorEquipSlots.filter((s) =>
    Boolean(selectedItemsBySlot[s.id]),
  ).length;
  const specialTabCount = calculatorSpecialSlots.filter((s) =>
    Boolean(selectedItemsBySlot[s.id]),
  ).length;
  const activeTabEquippedCount =
    activeTab === "equip" ? equipTabCount : specialTabCount;

  function handleUnequipSlot(slotId: EquipmentSlot) {
    const nextItems = { ...selectedItemsBySlot };
    const nextCards = { ...selectedCardsBySlot };
    const nextContexts = { ...itemContexts };
    const removedItemId = selectedItemsBySlot[slotId];

    delete nextItems[slotId];
    delete nextCards[slotId];
    if (removedItemId) {
      delete nextContexts[removedItemId];
    }

    setSelectedItemsBySlot(nextItems);
    setSelectedCardsBySlot(nextCards);
    setItemContexts(nextContexts);
  }

  function handleClearActiveTab() {
    const nextItems = { ...selectedItemsBySlot };
    const nextCards = { ...selectedCardsBySlot };
    const nextContexts = { ...itemContexts };

    for (const slot of activeSlots) {
      const removedItemId = selectedItemsBySlot[slot.id];
      delete nextItems[slot.id];
      delete nextCards[slot.id];
      if (removedItemId) {
        delete nextContexts[removedItemId];
      }
    }

    setSelectedItemsBySlot(nextItems);
    setSelectedCardsBySlot(nextCards);
    setItemContexts(nextContexts);
  }

  return (
    <section className="flex flex-col gap-5 backdrop-blur-xl bg-[#020612]/75 border border-sky-500/15 rounded-2xl p-5 shadow-2xl relative overflow-hidden">
      {/* Glow effect */}
      <div className="absolute top-0 right-1/4 w-1/3 h-px bg-gradient-to-r from-transparent via-sky-400/50 to-transparent" />

      <div className="flex items-center justify-between gap-3">
        <PanelHeader
          icon={<Shield size={17} className="text-sky-400" />}
          title={copy.equipment.title}
          meta={`${equipTabCount + specialTabCount} equipados`}
        />

        {activeTabEquippedCount > 0 && (
          <button
            type="button"
            onClick={handleClearActiveTab}
            className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-[11px] font-bold text-rose-300/90 hover:text-rose-200 bg-rose-950/30 hover:bg-rose-950/60 border border-rose-500/25 transition-colors cursor-pointer"
            title="Desequipar todos os itens desta aba"
          >
            <Trash2 size={12} />
            Limpar Aba
          </button>
        )}
      </div>

      <Tabs label={copy.equipment.tabsAria} variant="segmented">
        <TabButton
          active={activeTab === "equip"}
          onClick={() => setActiveTab("equip")}
        >
          <span>{copy.equipment.tabs.equip}</span>
          <span className="ml-1.5 text-[10px] font-mono opacity-80">
            ({equipTabCount}/{calculatorEquipSlots.length})
          </span>
        </TabButton>
        <TabButton
          active={activeTab === "special"}
          onClick={() => setActiveTab("special")}
        >
          <span>{copy.equipment.tabs.special}</span>
          <span className="ml-1.5 text-[10px] font-mono opacity-80">
            ({specialTabCount}/{calculatorSpecialSlots.length})
          </span>
        </TabButton>
      </Tabs>

      <CalculatorEquipmentPaperdoll
        activeTab={activeTab}
        copy={copy}
        itemContexts={itemContexts}
        selectedCardsBySlot={selectedCardsBySlot}
        selectedItemDetails={selectedItemDetails}
        selectedItemsBySlot={selectedItemsBySlot}
        slots={activeSlots}
        onEditSlot={setEditingSlot}
        onEditCardsAndEnchants={setEditingCardsAndEnchantsSlot}
        onUnequipSlot={handleUnequipSlot}
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
