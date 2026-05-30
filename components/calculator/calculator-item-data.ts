import rawItems from "@/nightmare-data/normalized/items/items.en.json";
import {
  toRoItem,
  type RathenaNormalizedItem,
} from "@/packages/calculator-core/src/datasets/rathena-normalized";
import type { EquipmentSlot, RoItem } from "@/packages/calculator-core/src";

export type CalculatorItemOption = RoItem & {
  refineable: boolean;
  rawType?: string | null;
  rawSubType?: string | null;
};

const normalizedItems = rawItems as RathenaNormalizedItem[];

export const calculatorItemCatalog: CalculatorItemOption[] = normalizedItems
  .map((item) => ({
    ...toRoItem(item),
    refineable: Boolean((item as { refineable?: boolean }).refineable),
    rawType: item.type,
    rawSubType: item.subType,
  }))
  .filter((item) => item.kind === "card" || Boolean(item.slots?.length));

export const calculatorCardOptions = calculatorItemCatalog.filter(
  (item) => item.kind === "card",
);

export function getCalculatorItemsForSlot(slot: EquipmentSlot) {
  return calculatorItemCatalog.filter((item) => item.slots?.includes(slot));
}

export function findCalculatorItem(itemId: number) {
  return calculatorItemCatalog.find((item) => item.id === itemId);
}
