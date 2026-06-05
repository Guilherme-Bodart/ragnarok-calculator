import { describe, expect, it } from "vitest";
import {
  CALCULATOR_ITEM_SEARCH_DEBOUNCE_MS,
  CALCULATOR_ITEM_SEARCH_MIN_LENGTH,
  isCalculatorItemSearchReady,
  normalizeCalculatorItemSearchQuery,
} from "@/lib/calculator-item-search";

describe("calculator item search", () => {
  it("requires a bounded query before searching large item indexes", () => {
    expect(CALCULATOR_ITEM_SEARCH_MIN_LENGTH).toBe(3);
    expect(CALCULATOR_ITEM_SEARCH_DEBOUNCE_MS).toBe(500);
    expect(isCalculatorItemSearchReady("ab")).toBe(false);
    expect(isCalculatorItemSearchReady("  abc  ")).toBe(true);
  });

  it("normalizes empty search input", () => {
    expect(normalizeCalculatorItemSearchQuery(undefined)).toBe("");
    expect(normalizeCalculatorItemSearchQuery("  armor ")).toBe("armor");
  });
});
