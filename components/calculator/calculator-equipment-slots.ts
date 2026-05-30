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
  type LucideIcon,
} from "lucide-react";
import type { EquipmentSlot } from "@/packages/calculator-core/src";

export type CalculatorEquipmentSlotDefinition = {
  id: EquipmentSlot;
  area: string;
  icon: LucideIcon;
};

export const calculatorEquipSlots = [
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
] as const satisfies readonly CalculatorEquipmentSlotDefinition[];

export const calculatorSpecialSlots = [
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
] as const satisfies readonly CalculatorEquipmentSlotDefinition[];
