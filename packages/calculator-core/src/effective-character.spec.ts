import { describe, expect, it } from "vitest";
import { EffectiveCharacterBuilder } from "./effective-character";

describe("EffectiveCharacterBuilder", () => {
  const builder = new EffectiveCharacterBuilder();

  it("combines base stats, job bonuses, item stat bonuses, and trait effects", () => {
    const character = builder.build(
      {
        classId: "Dragon_Knight",
        baseLevel: 200,
        jobLevel: 5,
        stats: {
          str: 100,
          agi: 1,
          vit: 1,
          int: 1,
          dex: 1,
          luk: 1,
          pow: 3,
          sta: 0,
          wis: 0,
          spl: 3,
          con: 5,
          crt: 0,
        },
      },
      {
        str: 10,
        agi: 0,
        vit: 0,
        int: 0,
        dex: 5,
        luk: 0,
      },
    );

    expect(character.effectiveStats).toMatchObject({
      str: 101,
      agi: 3,
      vit: 2,
      dex: 3,
      pow: 4,
      spl: 4,
      con: 6,
    });
    expect(character.damageStats).toMatchObject({
      str: 111,
      dex: 8,
    });
    expect(character.traitEffects).toMatchObject({
      statusAtk: 20,
      statusMatk: 20,
      pAtk: 2,
      smatk: 2,
    });
  });
});
