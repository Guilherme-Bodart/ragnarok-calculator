"use client";

import { Shield } from "lucide-react";

const equipmentSlots = [
  "Head Top",
  "Head Mid",
  "Head Low",
  "Armor",
  "Weapon",
  "Shield",
  "Garment",
  "Shoes",
  "Accessory 1",
  "Accessory 2",
  "Shadow Weapon",
  "Shadow Shield",
  "Shadow Armor",
  "Shadow Shoes",
  "Shadow Earring",
  "Shadow Pendant",
];

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

      <div className="equipment-grid">
        {equipmentSlots.map((slot) => (
          <button type="button" className="equipment-slot" key={slot}>
            <span>{slot}</span>
            <strong>Empty</strong>
          </button>
        ))}
      </div>
    </section>
  );
}
