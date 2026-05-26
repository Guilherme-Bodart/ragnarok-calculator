import { describe, expect, it } from "vitest";
import { CalculatorTraitEffectsFactory } from "./calculator-trait-effects";

describe("CalculatorTraitEffectsFactory", () => {
  const factory = new CalculatorTraitEffectsFactory();

  it("derives offensive 4th job effects from POW, SPL, and CON", () => {
    const effects = factory.fromStats({
      str: 1,
      agi: 1,
      vit: 1,
      int: 1,
      dex: 1,
      luk: 1,
      pow: 10,
      sta: 0,
      wis: 0,
      spl: 10,
      con: 10,
      crt: 0,
    });

    expect(effects).toMatchObject({
      statusAtk: 50,
      statusMatk: 50,
      pAtk: 5,
      smatk: 5,
    });
  });

  it("derives defensive, healing, and critical trait effects for future engines", () => {
    const effects = factory.fromStats({
      str: 1,
      agi: 1,
      vit: 1,
      int: 1,
      dex: 1,
      luk: 1,
      pow: 0,
      sta: 9,
      wis: 9,
      spl: 0,
      con: 0,
      crt: 9,
    });

    expect(effects).toMatchObject({
      res: 24,
      mres: 24,
      healPlus: 9,
      criticalDamageRate: 3,
    });
  });
});
