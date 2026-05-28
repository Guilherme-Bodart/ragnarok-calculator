"use client";

import { useState } from "react";
import {
  Armchair,
  Circle,
  Gem,
  Hand,
  HardHat,
  Shield,
  Shirt,
  Sparkles,
  Swords,
} from "lucide-react";
import type { CalculatorDictionary } from "./calculator-i18n";

const equipSlots = [
  { id: "headTop", area: "headTop", icon: HardHat },
  { id: "headMid", area: "headMid", icon: Circle },
  { id: "headLow", area: "headLow", icon: Circle },
  { id: "weapon", area: "weapon", icon: Swords },
  { id: "armor", area: "armor", icon: Shirt },
  { id: "shield", area: "shield", icon: Shield },
  { id: "garment", area: "garment", icon: Armchair },
  { id: "shoes", area: "shoes", icon: Sparkles },
  { id: "accessoryLeft", area: "accessoryLeft", icon: Gem },
  { id: "accessoryRight", area: "accessoryRight", icon: Gem },
] as const;

const specialSlots = [
  { id: "costumeHeadTop", area: "headTop", icon: HardHat },
  { id: "costumeHeadMid", area: "headMid", icon: Circle },
  { id: "costumeHeadLow", area: "headLow", icon: Circle },
  { id: "costumeGarment", area: "garment", icon: Armchair },
  { id: "shadowWeapon", area: "shadowWeapon", icon: Hand },
  { id: "shadowShield", area: "shadowShield", icon: Shield },
  { id: "shadowArmor", area: "shadowArmor", icon: Shirt },
  { id: "shadowShoes", area: "shadowShoes", icon: Sparkles },
  { id: "shadowEarring", area: "shadowEarring", icon: Gem },
  { id: "shadowPendant", area: "shadowPendant", icon: Gem },
] as const;

type CalculatorEquipmentPanelProps = {
  copy: CalculatorDictionary;
};

export function CalculatorEquipmentPanel({ copy }: CalculatorEquipmentPanelProps) {
  const [activeTab, setActiveTab] = useState<"equip" | "special">("equip");
  const activeSlots = activeTab === "equip" ? equipSlots : specialSlots;

  return (
    <section className="calc-panel calc-equipment">
      <div className="calc-panel-header">
        <span>
          <Shield size={17} />
          {copy.equipment.title}
        </span>
        <small>{copy.equipment.meta}</small>
      </div>

      <div
        className="equipment-tabs"
        role="tablist"
        aria-label={copy.equipment.tabsAria}
      >
        <button
          type="button"
          role="tab"
          aria-selected={activeTab === "equip"}
          className={activeTab === "equip" ? "is-active" : undefined}
          onClick={() => setActiveTab("equip")}
        >
          {copy.equipment.tabs.equip}
        </button>
        <button
          type="button"
          role="tab"
          aria-selected={activeTab === "special"}
          className={activeTab === "special" ? "is-active" : undefined}
          onClick={() => setActiveTab("special")}
        >
          {copy.equipment.tabs.special}
        </button>
      </div>

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

        {activeSlots.map((slot) => {
          const Icon = slot.icon;
          const label = copy.equipment.slots[slot.id];

          return (
            <button
              type="button"
              className="equipment-slot"
              data-slot-area={slot.area}
              key={slot.id}
              aria-label={`${label}: ${copy.equipment.empty}`}
            >
              <Icon size={17} />
              <span>{label}</span>
              <strong>{copy.equipment.empty}</strong>
            </button>
          );
        })}
      </div>
    </section>
  );
}
