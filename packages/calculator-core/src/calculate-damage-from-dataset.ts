import { CalculatorModifierEffectsFactory } from "./calculator-modifier-effects";
import { CharacterStatusEngine } from "./character-status-engine";
import { DamageEngine } from "./damage-engine";
import type { CalculateDamageResult } from "./calculation-result";
import type { RulesetContext } from "./rulesets";
import type { CalculatorCharacter, RoItem, RoMonster, RoSkill } from "./ro-types";

export type CalculatorItemContext = {
  itemId: number;
  refine?: number;
};

export type CalculateDamageInput = {
  character: CalculatorCharacter;
  learnedSkills: Record<string, number>;
  equipmentItemIds: number[];
  cardItemIds: number[];
  buffItemIds: number[];
  itemContexts: CalculatorItemContext[];
  monsterId: number;
  skillId: string;
  skillLevel: number;
  ruleset: RulesetContext;
};

export type CalculatorDataset = {
  items: RoItem[];
  monsters: RoMonster[];
  skills: RoSkill[];
};

export class CalculatorDataError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "CalculatorDataError";
  }
}

export class CalculatorInputError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "CalculatorInputError";
  }
}

export function calculateDamageFromDataset(
  input: CalculateDamageInput,
  dataset: CalculatorDataset,
): CalculateDamageResult {
  const monster = findMonsterById(dataset.monsters, input.monsterId);
  const skill = findSkillById(dataset.skills, input.skillId);

  if (input.skillLevel > skill.maxLevel) {
    throw new CalculatorInputError(`${skill.name} max level is ${skill.maxLevel}.`);
  }

  const items = [
    ...input.equipmentItemIds,
    ...input.cardItemIds,
    ...input.buffItemIds,
  ].map((itemId) => findItemById(dataset.items, itemId));

  const modifierEffectsFactory = new CalculatorModifierEffectsFactory();
  const modifierEffects = modifierEffectsFactory.fromItems(
    items,
    createItemContextMap(input.itemContexts),
    {
      classId: input.character.classId,
      learnedSkills: input.learnedSkills,
      ruleset: input.ruleset,
    },
  );
  const characterStatus = new CharacterStatusEngine().calculate({
    character: input.character,
    items,
    modifierEffects,
  });
  const result = new DamageEngine().calculate({
    character: characterStatus,
    items,
    modifierEffects,
    monster,
    skill,
    skillLevel: input.skillLevel,
  });

  return {
    meta: {
      precision: "prototype",
      note: "Initial calculator engine. Renewal/iRO rounding and skill exceptions will be added per class tree.",
      warnings: createWarnings(modifierEffects.unsupportedStatements.length),
    },
    characterStatus,
    target: monster,
    skill,
    damage: result.damage,
    breakdown: result.breakdown,
  };
}

function createWarnings(unsupportedStatementCount: number) {
  if (unsupportedStatementCount === 0) {
    return [];
  }

  return [
    `${unsupportedStatementCount} item modifier statement(s) were not applied.`,
  ];
}

function createItemContextMap(itemContexts: CalculatorItemContext[]) {
  return new Map(
    itemContexts.map((context) => [context.itemId, { refine: context.refine }]),
  );
}

function findItemById(items: RoItem[], itemId: number) {
  const item = items.find((candidate) => candidate.id === itemId);

  if (!item) {
    throw new CalculatorDataError(`Item ${itemId} was not found.`);
  }

  return item;
}

function findMonsterById(monsters: RoMonster[], monsterId: number) {
  const monster = monsters.find((candidate) => candidate.id === monsterId);

  if (!monster) {
    throw new CalculatorDataError(`Monster ${monsterId} was not found.`);
  }

  return monster;
}

function findSkillById(skills: RoSkill[], skillId: string) {
  const skill = skills.find((candidate) => candidate.id === skillId);

  if (!skill) {
    throw new CalculatorDataError(`Skill ${skillId} was not found.`);
  }

  return skill;
}
