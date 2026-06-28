import type { RoItem } from "@/packages/calculator-core/src";

export type CalculatorItemIndexOption = CalculatorItemDetail & {
  sourceName?: string | null;
  searchText?: string | null;
  cardSlots: number | null;
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
  kind?: "card" | "consumable";
};

const itemsCache = new Map<string, Promise<CalculatorItemIndexOption[]>>();

export function clearCalculatorItemsCache() {
  itemsCache.clear();
}

export function fetchItemCategory(category: string): Promise<CalculatorItemIndexOption[]> {
  if (itemsCache.has(category)) {
    return itemsCache.get(category)!;
  }

  const promise = fetch(`/data/calculator/items/${category}.json`).then(async (response) => {
    if (!response.ok) {
      return [];
    }
    return (await response.json()) as CalculatorItemIndexOption[];
  }).catch(() => {
    itemsCache.delete(category);
    return [];
  });

  itemsCache.set(category, promise);
  return promise;
}

export async function searchCalculatorItems({
  kind,
  limit = 80,
  query,
  slot,
}: SearchCalculatorItemsInput) {
  let category = "";

  if (kind === "card") {
    category = "card";
  } else if (kind === "consumable") {
    category = "consumable";
  } else if (slot) {
    category = slot.replace(/[^a-zA-Z0-9]/g, "");
  } else {
    return [];
  }

  const items = await fetchItemCategory(category);

  if (!query) {
    return items.slice(0, limit);
  }

  const normalizedQuery = normalizeSearch(query);

  return items
    .filter((item) =>
      normalizeSearch(
        `${item.searchText ?? ""} ${item.name} ${item.sourceName ?? ""} ${item.id}`,
      ).includes(normalizedQuery),
    )
    .slice(0, limit);
}

export async function getCalculatorItemDetail(itemId: number, category: string) {
  const items = await fetchItemCategory(category);
  const found = items.find((item) => item.id === itemId);

  if (!found) {
    throw new Error(`Failed to load item ${itemId} from category ${category}.`);
  }

  return found as CalculatorItemDetail;
}

function normalizeSearch(value: string) {
  return value
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .trim()
    .toLowerCase();
}
