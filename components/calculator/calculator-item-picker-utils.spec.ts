import { describe, expect, it } from "vitest";
import {
  ensureSelectedCardOptions,
  ensureSelectedOption,
  getCardSlotCount,
  getShortItemName,
  getValidCardsForItem,
  selectedItemHasModifiers,
} from "./calculator-item-picker-utils";
import type {
  CalculatorItemDetail,
  CalculatorItemIndexOption,
} from "./calculator-item-data";

const option: CalculatorItemIndexOption = {
  id: 1,
  name: "Sword",
  kind: "equipment",
  cardSlots: 1,
  refineable: true,
  attack: 100,
  magicAttack: 0,
  defense: 0,
  hasModifiers: false,
};

const detail: CalculatorItemDetail = {
  ...option,
  bonuses: [],
  rawScript: "bonus bAtk,10;",
  source: "manual",
};

describe("calculator item picker utils", () => {
  it("prepends the selected item when it is missing from current search results", () => {
    expect(ensureSelectedOption([], option)).toEqual([option]);
    expect(ensureSelectedOption([option], option)).toEqual([option]);
  });

  it("keeps selected cards visible from loaded item details", () => {
    expect(ensureSelectedCardOptions([], [detail.id], { [detail.id]: detail })).toEqual([
      detail,
    ]);
  });

  it("detects modifiers from index or detail data", () => {
    expect(selectedItemHasModifiers({ ...option, hasModifiers: true })).toBe(true);
    expect(selectedItemHasModifiers(detail)).toBe(true);
  });

  it("limits selected cards to the selected item slot count", () => {
    expect(getCardSlotCount({ ...option, cardSlots: 9 })).toBe(4);
    expect(getValidCardsForItem([4001, 4002, 4003], option)).toEqual([4001]);
    expect(getValidCardsForItem([4001], { ...option, cardSlots: 0 })).toEqual([]);
  });

  it("shortens long item names for the paperdoll", () => {
    expect(getShortItemName("Abyss Blade", 18)).toBe("Abyss Blade");
    expect(getShortItemName("Very Long Equipment Name", 10)).toBe("Very Long…");
  });
});
