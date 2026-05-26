import { describe, expect, it } from "vitest";
import { BadRequestException, NotFoundException } from "@nestjs/common";
import { CalculatorService } from "./calculator.service";
import type { CalculateDamageRequest } from "./calculator.schemas";
import type { DataService } from "../data/data.service";
import type { RoItem, RoMonster, RoSkill } from "../data/types";

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

const modifierItem: RoItem = {
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

const payload: CalculateDamageRequest = {
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
  equipmentItemIds: [modifierItem.id],
  cardItemIds: [],
  buffItemIds: [],
  itemContexts: [],
  monsterId: monster.id,
  skillId: skill.id,
  skillLevel: 10,
};

describe("CalculatorService modifier integration", () => {
  it("applies supported rawScript modifiers alongside the current damage flow", () => {
    const service = new CalculatorService(
      createDataServiceStub([modifierItem]),
    );

    const result = service.calculateDamage(payload);

    expect(result.damage.average).toBe(500);
    expect(result.damage.total).toBe(500);
    expect(result.breakdown).toContainEqual(
      expect.objectContaining({
        key: "unsupportedModifierStatements",
        value: 0,
      }),
    );
  });

  it("uses item refine context when resolving rawScript modifiers", () => {
    const refinedItem: RoItem = {
      ...modifierItem,
      rawScript: `
        bonus bBaseAtk,100;
        if (getrefine()>=7) bonus bAtkRate,20;
      `,
    };
    const service = new CalculatorService(createDataServiceStub([refinedItem]));

    const withoutRefine = service.calculateDamage(payload);
    const withRefine = service.calculateDamage({
      ...payload,
      itemContexts: [{ itemId: refinedItem.id, refine: 7 }],
    });

    expect(withoutRefine.damage.average).toBe(400);
    expect(withRefine.damage.average).toBe(480);
  });

  it("applies offensive 4th job trait final attack effects", () => {
    const service = new CalculatorService(
      createDataServiceStub([
        {
          ...modifierItem,
          rawScript: "",
        },
      ]),
    );

    const result = service.calculateDamage({
      ...payload,
      character: {
        ...payload.character,
        stats: {
          ...payload.character.stats,
          pow: 3,
          con: 5,
        },
      },
    });

    expect(result.damage.average).toBe(321);
  });

  it("applies skill-level conditioned item modifiers when learned skills match", () => {
    const skillConditionItem: RoItem = {
      ...modifierItem,
      rawScript: `
        if (getskilllv("SM_BASH") >= 10) {
          bonus2 bSkillAtk,"SM_BASH",50;
        }
      `,
    };
    const service = new CalculatorService(
      createDataServiceStub([skillConditionItem]),
    );

    const withoutSkill = service.calculateDamage({
      ...payload,
      equipmentItemIds: [skillConditionItem.id],
    });
    const withSkill = service.calculateDamage({
      ...payload,
      equipmentItemIds: [skillConditionItem.id],
      learnedSkills: { SM_BASH: 10 },
    });

    expect(withoutSkill.damage.average).toBe(300);
    expect(withSkill.damage.average).toBe(450);
  });

  it("applies class-conditioned item modifiers when class context matches", () => {
    const classConditionItem: RoItem = {
      ...modifierItem,
      rawScript: `
        if (BaseJob == Job_Swordman) {
          bonus2 bSkillAtk,"SM_BASH",50;
        }
      `,
    };
    const service = new CalculatorService(
      createDataServiceStub([classConditionItem]),
    );

    const withoutClass = service.calculateDamage({
      ...payload,
      equipmentItemIds: [classConditionItem.id],
    });
    const withClass = service.calculateDamage({
      ...payload,
      character: {
        ...payload.character,
        classId: "Job_Swordman",
      },
      equipmentItemIds: [classConditionItem.id],
    });

    expect(withoutClass.damage.average).toBe(300);
    expect(withClass.damage.average).toBe(450);
  });

  it("applies item base stat modifiers before base power calculation", () => {
    const statItem: RoItem = {
      ...modifierItem,
      rawScript: `
        bonus bAllStats,10;
        bonus bStr,5;
      `,
    };
    const service = new CalculatorService(createDataServiceStub([statItem]));

    const result = service.calculateDamage({
      ...payload,
      equipmentItemIds: [statItem.id],
    });

    expect(result.damage.average).toBe(332);
  });

  it("applies class job stat bonuses before damage calculation", () => {
    const service = new CalculatorService(
      createDataServiceStub([
        {
          ...modifierItem,
          rawScript: "",
        },
      ]),
    );

    const result = service.calculateDamage({
      ...payload,
      character: {
        ...payload.character,
        classId: "Swordman",
        jobLevel: 10,
      },
    });

    expect(result.damage.average).toBe(302);
  });

  it("applies fourth job trait bonuses from job stats", () => {
    const service = new CalculatorService(
      createDataServiceStub([
        {
          ...modifierItem,
          rawScript: "",
        },
      ]),
    );

    const result = service.calculateDamage({
      ...payload,
      character: {
        ...payload.character,
        classId: "Dragon_Knight",
        jobLevel: 5,
      },
    });

    expect(result.damage.average).toBe(307);
  });

  it("maps calculator input errors to bad request responses", () => {
    const service = new CalculatorService(createDataServiceStub([modifierItem]));

    expect(() =>
      service.calculateDamage({
        ...payload,
        skillLevel: 11,
      }),
    ).toThrow(BadRequestException);
  });

  it("maps missing calculator data to not found responses", () => {
    const service = new CalculatorService(createDataServiceStub([modifierItem]));

    expect(() =>
      service.calculateDamage({
        ...payload,
        monsterId: 999999,
      }),
    ).toThrow(NotFoundException);
  });
});

function createDataServiceStub(items: RoItem[]) {
  return {
    getItems() {
      return items;
    },
    getMonsters() {
      return [monster];
    },
    getSkills() {
      return [skill];
    },
    getItemById(id: number) {
      const item = items.find((candidate) => candidate.id === id);

      if (!item) {
        throw new Error(`Missing test item ${id}.`);
      }

      return item;
    },
    getMonsterById() {
      return monster;
    },
    getSkillById() {
      return skill;
    },
  } as unknown as DataService;
}
