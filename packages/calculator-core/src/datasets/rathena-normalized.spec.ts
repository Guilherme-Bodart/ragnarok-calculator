import { describe, expect, it } from "vitest";
import {
  createCalculatorDatasetFromRathenaNormalized,
  toRoItem,
  toRoMonster,
  toRoSkill,
} from "./rathena-normalized";

describe("rAthena normalized dataset adapter", () => {
  it("maps normalized monsters into calculator monster contracts", () => {
    expect(
      toRoMonster({
        monsterId: 1002,
        name: "Poring",
        level: 1,
        race: "Plant",
        size: "Medium",
        element: "Water",
        elementLevel: 1,
        defense: 2,
        magicDefense: 5,
        hp: 55,
        source: "rathena",
      }),
    ).toMatchObject({
      id: 1002,
      race: "plant",
      size: "medium",
      element: "water",
      defense: 2,
      magicDefense: 5,
      hp: 55,
    });
  });

  it("uses safe defaults for nullable monster fields", () => {
    expect(
      toRoMonster({
        monsterId: 999,
        name: "Unknown Target",
        race: null,
        size: null,
        element: null,
        source: "rathena",
      }),
    ).toMatchObject({
      level: 1,
      race: "formless",
      size: "medium",
      element: "neutral",
      elementLevel: 1,
      defense: 0,
      magicDefense: 0,
      hp: 1,
    });
  });

  it("maps normalized item data without treating card slots as equipment slots", () => {
    expect(
      toRoItem({
        itemId: 400177,
        name: "Fafnir Helm",
        type: "Armor",
        attack: null,
        magicAttack: null,
        defense: 10,
        slots: 1,
        rawScript: "bonus bBaseAtk,10;",
        source: "rathena",
      }),
    ).toMatchObject({
      id: 400177,
      kind: "equipment",
      defense: 10,
      cardSlots: 1,
      bonuses: [],
      rawScript: "bonus bBaseAtk,10;",
    });
  });

  it("maps damage skills and preserves rAthena skill ids as calculator ids", () => {
    expect(
      toRoSkill({
        skillId: 5,
        name: "SM_BASH",
        description: "Bash",
        maxLevel: 10,
        type: "Weapon",
        targetType: "Attack",
        hit: "Single",
        element: "Weapon",
        rawDamageFlags: null,
        raw: {
          HitCount: 1,
        },
        source: "rathena",
      }),
    ).toMatchObject({
      id: "SM_BASH",
      name: "Bash",
      damageType: "physical",
      element: undefined,
      maxLevel: 10,
      hitCount: 1,
      baseMultiplierByLevel: {
        "1": 130,
        "10": 400,
      },
    });
  });

  it("maps per-level hit counts from rAthena skill data", () => {
    expect(
      toRoSkill({
        skillId: 14,
        name: "MG_COLDBOLT",
        description: "Cold Bolt",
        maxLevel: 10,
        type: "Magic",
        targetType: "Attack",
        element: "Water",
        raw: {
          HitCount: [
            { Level: 1, Count: 1 },
            { Level: 2, Count: 2 },
            { Level: 10, Count: 10 },
          ],
        },
        source: "rathena",
      }),
    ).toMatchObject({
      id: "MG_COLDBOLT",
      damageType: "magical",
      element: "water",
      hitCount: 10,
      hitCountByLevel: {
        "1": 1,
        "2": 2,
        "10": 10,
      },
    });
  });

  it("filters skills that are explicitly marked as non-damaging", () => {
    expect(
      toRoSkill({
        skillId: 1,
        name: "NV_BASIC",
        maxLevel: 9,
        type: null,
        targetType: "Self",
        rawDamageFlags: {
          NoDamage: true,
        },
        raw: null,
        source: "rathena",
      }),
    ).toBeNull();
  });

  it("builds a calculator dataset and omits non-damage skills", () => {
    const dataset = createCalculatorDatasetFromRathenaNormalized({
      items: [
        {
          itemId: 501,
          name: "Red Potion",
          type: "Healing",
          source: "rathena",
        },
      ],
      monsters: [
        {
          monsterId: 1002,
          name: "Poring",
          race: "Plant",
          size: "Medium",
          element: "Water",
          source: "rathena",
        },
      ],
      skills: [
        {
          skillId: 5,
          name: "SM_BASH",
          maxLevel: 10,
          type: "Weapon",
          targetType: "Attack",
          raw: {
            HitCount: 1,
          },
          source: "rathena",
        },
        {
          skillId: 2,
          name: "SM_SWORD",
          maxLevel: 10,
          type: "Weapon",
          targetType: null,
          source: "rathena",
        },
      ],
    });

    expect(dataset.items).toHaveLength(1);
    expect(dataset.monsters).toHaveLength(1);
    expect(dataset.skills.map((skill) => skill.id)).toEqual(["SM_BASH"]);
  });
});
