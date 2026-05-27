import { describe, expect, it } from "vitest";
import type { CalculatorModifierEffects } from "./calculator-modifier-effects";
import { CharacterStatusEngine } from "./character-status-engine";
import type { RoItem } from "./ro-types";

const emptyModifierEffects: CalculatorModifierEffects = {
  statBonuses: {
    str: 0,
    agi: 0,
    vit: 0,
    int: 0,
    dex: 0,
    luk: 0,
  },
  flatAtk: 0,
  flatMatk: 0,
  pAtk: 0,
  smatk: 0,
  atkRate: 0,
  matkRate: 0,
  raceDamageRate: {},
  elementDamageRate: {},
  sizeDamageRate: {},
  skillDamageRate: {},
  magicRaceDamageRate: {},
  magicElementDamageRate: {},
  magicSizeDamageRate: {},
  magicElementAttackRate: {},
  unsupportedStatements: [],
};

describe("CharacterStatusEngine", () => {
  const engine = new CharacterStatusEngine();

  it("calculates effective stats, HP, SP and derived combat stats", () => {
    const status = engine.calculate({
      character: {
        classId: "Swordman",
        baseLevel: 99,
        jobLevel: 10,
        stats: {
          str: 100,
          agi: 20,
          vit: 50,
          int: 30,
          dex: 40,
          luk: 9,
          pow: 3,
          sta: 0,
          wis: 0,
          spl: 3,
          con: 5,
          crt: 3,
        },
      },
      modifierEffects: {
        ...emptyModifierEffects,
        statBonuses: {
          str: 10,
          agi: 0,
          vit: 5,
          int: 0,
          dex: 5,
          luk: 0,
        },
        flatAtk: 25,
      },
    });

    expect(status.effectiveStats).toMatchObject({
      str: 111,
      vit: 56,
      dex: 46,
      pow: 3,
      spl: 3,
      con: 5,
    });
    expect(status.maxHp).toBe(6238);
    expect(status.maxSp).toBe(270);
    expect(status.statusAtk).toBe(345);
    expect(status.statusMatk).toBe(183);
    expect(status.atk).toBe(370);
    expect(status.hit).toBe(153);
    expect(status.flee).toBe(130);
    expect(status.crit).toBe(4);
    expect(status.aspd).toBe(167.67);
  });

  it("adds equipment power and flat modifiers to final attack values", () => {
    const weapon: RoItem = {
      id: 1,
      name: "Training Sword",
      kind: "equipment",
      attack: 100,
      magicAttack: 50,
      bonuses: [
        { type: "flatAtk", value: 10 },
        { type: "flatMatk", value: 20 },
      ],
      source: "manual",
    };

    const status = engine.calculate({
      character: {
        classId: "Knight",
        baseLevel: 99,
        jobLevel: 1,
        stats: {
          str: 1,
          agi: 1,
          vit: 1,
          int: 1,
          dex: 1,
          luk: 1,
          pow: 0,
          sta: 0,
          wis: 0,
          spl: 0,
          con: 0,
          crt: 0,
        },
      },
      items: [weapon],
      modifierEffects: {
        ...emptyModifierEffects,
        flatAtk: 5,
        flatMatk: 7,
      },
    });

    expect(status.atk).toBe(status.statusAtk + 115);
    expect(status.matk).toBe(status.statusMatk + 77);
  });

  it("calculates AP from fourth job basepoints", () => {
    const status = engine.calculate({
      character: {
        classId: "Dragon_Knight",
        baseLevel: 200,
        jobLevel: 1,
        stats: {
          str: 1,
          agi: 1,
          vit: 1,
          int: 1,
          dex: 1,
          luk: 1,
          pow: 0,
          sta: 0,
          wis: 0,
          spl: 0,
          con: 0,
          crt: 0,
        },
      },
    });

    expect(status.maxAp).toBe(200);
  });
});
