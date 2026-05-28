"use client";

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

const equipmentSlots = [
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
  { id: "shadowWeapon", area: "shadowWeapon", icon: Hand },
  { id: "shadowShield", area: "shadowShield", icon: Shield },
  { id: "shadowArmor", area: "shadowArmor", icon: Shirt },
  { id: "shadowShoes", area: "shadowShoes", icon: Sparkles },
] as const;

type CalculatorEquipmentPanelProps = {
  copy: CalculatorDictionary;
};

export function CalculatorEquipmentPanel({ copy }: CalculatorEquipmentPanelProps) {
  return (
    <section className="calc-panel calc-equipment">
      <div className="calc-panel-header">
        <span>
          <Shield size={17} />
          {copy.equipment.title}
        </span>
        <small>{copy.equipment.meta}</small>
      </div>

      <div className="equipment-paperdoll" aria-label={copy.equipment.aria}>
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

        {equipmentSlots.map((slot) => {
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
