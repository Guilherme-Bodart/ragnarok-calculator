import { describe, expect, it } from "vitest";
import {
  CalculatorDataError,
  CalculatorInputError,
  calculateDamageFromDataset,
  type CalculateDamageInput,
  type CalculatorDataset,
} from "./calculate-damage-from-dataset";
import type { RoItem, RoMonster, RoSkill } from "./ro-types";

const skill: RoSkill = {
  id: "SM_BASH",
  name: "Bash",
  classTree: "swordman",
  damageType: "physical",
  maxLevel: 10,
  hitCount: 1,
  baseMultiplierByLevel: {
    "10": 100,
  },
  source: "manual",
};

const monster: RoMonster = {
  id: 1001,
  name: "Training Target",
  level: 1,
  race: "demihuman",
  size: "medium",
  element: "neutral",
  elementLevel: 1,
  defense: 0,
  magicDefense: 0,
  hp: 1000,
  source: "manual",
};

const item: RoItem = {
  id: 1,
  name: "Modifier Test Sword",
  kind: "equipment",
  attack: 0,
  bonuses: [],
  rawScript: `
    bonus bBaseAtk,100;
    bonus bAtkRate,10;
    bonus2 bAddRace,RC_DemiHuman,15;
  `,
  source: "manual",
};

const input: CalculateDamageInput = {
  ruleset: {
    server: "latam",
    mechanics: "renewal",
  },
  learnedSkills: {},
  character: {
    baseLevel: 100,
    jobLevel: 50,
    stats: {
      str: 100,
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
  equipmentItemIds: [item.id],
  cardItemIds: [],
  buffItemIds: [],
  itemContexts: [],
  monsterId: monster.id,
  skillId: skill.id,
  skillLevel: 10,
};

const dataset: CalculatorDataset = {
  items: [item],
  monsters: [monster],
  skills: [skill],
};

describe("calculateDamageFromDataset", () => {
  it("calculates damage through the shared core flow", () => {
    const result = calculateDamageFromDataset(input, dataset);

    // StatusATK (rAthena Renewal) = STR + floor(STR/2) + floor(DEX/5) + floor(LUK/3) + floor(Level/4)
    // = 100 + 50 + 0 + 0 + 25 = 175
    // ATK = 175 (status) + 0 (weapon) + 100 (flatAtk do item) = 275
    // SM_BASH lv10 multiplier = (130 + 30*10)/100 = 4.0
    // finalRate = 1 + (atkRate:10 + raceDamage demihuman:15) / 100 = 1.25
    // preDefense = floor(275 * 4.0 * 1.25) = 1375
    // postDefense = floor(1375 * 1.0) = 1375 (monster DEF=0)
    // singleHit = max(1, floor(1375 * 1.0 * 1.0) - 0) = 1375
    expect(result.damage.average).toBe(1375);
    expect(result.damage.total).toBe(1375);
    expect(result.meta).toMatchObject({
      formulaId: "static:SM_BASH",
      precision: "validated",
      warnings: [],
    });
    expect(result.characterStatus).toMatchObject({
      statusAtk: 175,
      atk: 275,
      maxHp: 0,
      maxSp: 0,
    });
    expect(result.breakdown).toContainEqual(
      expect.objectContaining({
        key: "unsupportedModifierStatements",
        value: 0,
      }),
    );
  });

  it("resolves item context and learned skill conditions before damage", () => {
    const refineItem: RoItem = {
      ...item,
      rawScript: `
        if (getrefine()>=7) bonus bAtkRate,20;
      `,
    };
    const skillItem: RoItem = {
      ...item,
      id: 2,
      name: "Skill Modifier Test Card",
      kind: "card",
      rawScript: `
        if (getskilllv("SM_BASH") >= 10) {
          bonus2 bSkillAtk,"SM_BASH",50;
        }
      `,
    };

    const result = calculateDamageFromDataset(
      {
        ...input,
        equipmentItemIds: [refineItem.id],
        cardItemIds: [skillItem.id],
        learnedSkills: { SM_BASH: 10 },
        itemContexts: [{ itemId: refineItem.id, refine: 7 }],
      },
      {
        ...dataset,
        items: [refineItem, skillItem],
      },
    );

    // NOTA: refineItem substituí o item original — não tem bBaseAtk:100 nem bAddRace demihuman:15
    // ATK = statusAtk:175 + 0 (sem flatAtk) = 175
    // bAtkRate:20 (refine>=7), bSkillAtk SM_BASH:50 (skill level >=10)
    // finalRate = 1 + (atkRate:20 + skillDamage:50) / 100 = 1.70
    // preDefense = floor(175 * 4.0 * 1.70) = floor(1190) = 1190
    expect(result.damage.average).toBe(1190);
  });

  it("resolves item enchant grade conditions before damage", () => {
    const gradeItem: RoItem = {
      ...item,
      rawScript: `
        .@g = getenchantgrade();
        if (.@g>=ENCHANTGRADE_D) bonus bBaseAtk,50;
      `,
    };

    const result = calculateDamageFromDataset(
      {
        ...input,
        equipmentItemIds: [gradeItem.id],
        itemContexts: [{ itemId: gradeItem.id, grade: 1 }],
      },
      {
        ...dataset,
        items: [gradeItem],
      },
    );

    // StatusATK novo: 175. ATK base = 175 + 0 (no flat from item, grade bonus is flatAtk:50)
    // flatAtk do item = bBaseAtk:50 (com grade D)
    // atk = 175 (status) + 0 (weapon) + 50 (flatAtk do grade) = 225
    expect(result.characterStatus.atk).toBe(225);
    expect(result.meta.warnings).toEqual([]);
  });

  it("rejects skill levels above the selected skill max level", () => {
    expect(() =>
      calculateDamageFromDataset(
        {
          ...input,
          skillLevel: 11,
        },
        dataset,
      ),
    ).toThrow(CalculatorInputError);
  });

  it("reports missing data as a calculator data error", () => {
    expect(() =>
      calculateDamageFromDataset(
        {
          ...input,
          monsterId: 999999,
        },
        dataset,
      ),
    ).toThrow(CalculatorDataError);
  });

  it("adds warnings when item script statements are unsupported", () => {
    const result = calculateDamageFromDataset(
      input,
      {
        ...dataset,
        items: [
          {
            ...item,
            rawScript: "autobonus \"{ bonus bAtkRate,10; }\",10,5000;",
          },
        ],
      },
    );

    expect(result.meta.warnings).toEqual([
      "1 item modifier statement(s) were not applied.",
    ]);
  });

  it("adds active buff item count to the result breakdown", () => {
    const result = calculateDamageFromDataset(
      {
        ...input,
        buffItemIds: [item.id],
      },
      dataset,
    );

    expect(result.breakdown).toContainEqual(
      expect.objectContaining({
        key: "activeBuffItems",
        value: 1,
      }),
    );
  });

  it("keeps generic skill formulas marked as prototype", () => {
    const result = calculateDamageFromDataset(
      {
        ...input,
        skillId: "GENERIC_TEST_SKILL",
      },
      {
        ...dataset,
        skills: [
          {
            ...skill,
            id: "GENERIC_TEST_SKILL",
            name: "Generic Test Skill",
          },
        ],
      },
    );

    expect(result.meta).toMatchObject({
      formulaId: "generic",
      precision: "prototype",
    });
  });
});
