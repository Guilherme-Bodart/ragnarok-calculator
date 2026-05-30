import type { RoItem } from "@/packages/calculator-core/src";

export type CalculatorItemIndexOption = {
  id: number;
  name: string;
  kind: RoItem["kind"];
  cardSlots: number | null;
  refineable: boolean;
  attack: number | null;
  magicAttack: number | null;
  defense: number | null;
  hasModifiers: boolean;
};

export type CalculatorItemDetail = RoItem & {
  refineable: boolean;
  rawType?: string | null;
  rawSubType?: string | null;
};

type SearchCalculatorItemsInput = {
  limit?: number;
  query?: string;
  slot?: string;
  kind?: "card";
};

export async function searchCalculatorItems({
  kind,
  limit,
  query,
  slot,
}: SearchCalculatorItemsInput) {
  const params = new URLSearchParams();

  if (kind) params.set("kind", kind);
  if (limit) params.set("limit", String(limit));
  if (query) params.set("q", query);
  if (slot) params.set("slot", slot);

  const response = await fetch(`/api/calculator/items?${params.toString()}`);

  if (!response.ok) {
    throw new Error("Failed to load calculator items.");
  }

  return (await response.json()) as CalculatorItemIndexOption[];
}

export async function getCalculatorItemDetail(itemId: number) {
  const response = await fetch(`/api/calculator/items/${itemId}`);

  if (!response.ok) {
    throw new Error(`Failed to load item ${itemId}.`);
  }

  return (await response.json()) as CalculatorItemDetail;
}
