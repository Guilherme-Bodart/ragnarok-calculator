export const CALCULATOR_ITEM_SEARCH_MIN_LENGTH = 3;
export const CALCULATOR_ITEM_SEARCH_DEBOUNCE_MS = 500;

export function normalizeCalculatorItemSearchQuery(query: string | undefined) {
  return (query ?? "").trim();
}

export function isCalculatorItemSearchReady(query: string | undefined) {
  return normalizeCalculatorItemSearchQuery(query).length >= CALCULATOR_ITEM_SEARCH_MIN_LENGTH;
}
