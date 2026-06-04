import { describe, expect, it } from "vitest";
import {
  calculatorBuffCatalog,
  calculatorBuffCatalogVersion,
  getActiveCalculatorBuffItemIds,
  getCalculatorBuffGroup,
  getCalculatorBuffPreview,
} from "./calculator-buff-data";

describe("calculator buff data", () => {
  it("keeps manual buffs in a versioned catalog", () => {
    expect(calculatorBuffCatalog.version).toBe(calculatorBuffCatalogVersion);
    expect(calculatorBuffCatalog.manual.map((buff) => buff.itemId)).toContain(
      900001,
    );
    expect(calculatorBuffCatalog.consumable.map((buff) => buff.itemId)).toContain(
      900003,
    );
  });

  it("resolves active buff item ids for the damage dataset", () => {
    expect(
      getActiveCalculatorBuffItemIds({
        BUFF_900001: 1,
        CLASS_BUFF: 5,
      }),
    ).toEqual([900001]);
  });

  it("classifies and previews recognized manual buff effects", () => {
    expect(getCalculatorBuffGroup("BUFF_900003")).toBe("consumable");
    expect(getCalculatorBuffPreview("BUFF_900001")).toContain("STR +10");
    expect(getCalculatorBuffPreview("BUFF_900004")).toContain("ATK +5%");
  });
});
