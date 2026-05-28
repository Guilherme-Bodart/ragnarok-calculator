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

const equipmentSlots = [
  { id: "headTop", label: "Head Top", area: "headTop", icon: HardHat },
  { id: "headMid", label: "Head Mid", area: "headMid", icon: Circle },
  { id: "headLow", label: "Head Low", area: "headLow", icon: Circle },
  { id: "weapon", label: "Weapon", area: "weapon", icon: Swords },
  { id: "armor", label: "Armor", area: "armor", icon: Shirt },
  { id: "shield", label: "Shield", area: "shield", icon: Shield },
  { id: "garment", label: "Garment", area: "garment", icon: Armchair },
  { id: "shoes", label: "Shoes", area: "shoes", icon: Sparkles },
  { id: "accessoryLeft", label: "Accessory 1", area: "accessoryLeft", icon: Gem },
  { id: "accessoryRight", label: "Accessory 2", area: "accessoryRight", icon: Gem },
  { id: "shadowWeapon", label: "Shadow Wpn", area: "shadowWeapon", icon: Hand },
  { id: "shadowShield", label: "Shadow Shld", area: "shadowShield", icon: Shield },
  { id: "shadowArmor", label: "Shadow Arm", area: "shadowArmor", icon: Shirt },
  { id: "shadowShoes", label: "Shadow Shoes", area: "shadowShoes", icon: Sparkles },
] as const;

export function CalculatorEquipmentPanel() {
  return (
    <section className="calc-panel calc-equipment">
      <div className="calc-panel-header">
        <span>
          <Shield size={17} />
          Equipment, Cards, Costume & Shadow
        </span>
        <small>All slots prepared</small>
      </div>

      <div className="equipment-paperdoll" aria-label="Character equipment slots">
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

          return (
            <button
              type="button"
              className="equipment-slot"
              data-slot-area={slot.area}
              key={slot.id}
              aria-label={`${slot.label}: Empty`}
            >
              <Icon size={17} />
              <span>{slot.label}</span>
              <strong>Empty</strong>
            </button>
          );
        })}
      </div>
    </section>
  );
}
