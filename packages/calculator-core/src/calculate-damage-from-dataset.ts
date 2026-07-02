import { CalculatorModifierEffectsFactory } from "./calculator-modifier-effects";
import { CharacterStatusEngine } from "./character-status-engine";
import { DamageEngine } from "./damage-engine";
import { mergeBuffEffects, type BuffEffect } from "./buff-effects";
import { globalBuffRegistry } from "./buffs";
import type { CalculateDamageResult } from "./calculation-result";
import type { RulesetContext } from "./rulesets";
import type { CalculatorCharacter, RoItem, RoMonster, RoSkill } from "./ro-types";

export type CalculatorItemContext = {
  itemId: number;
  refine?: number;
  grade?: number;
};

export type CalculateDamageInput = {
  character: CalculatorCharacter;
  learnedSkills: Record<string, number>;
  equipmentItemIds: number[];
  cardItemIds: number[];
  buffItemIds: number[];
  /** Buffs ativos mapeados por ID da habilidade (ex: AL_BLESSING) para o Nível.
   *  O core utilizará o BuffRegistry para converter esses níveis em BuffEffects reais. */
  activeBuffs?: Record<string, number>;
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
  let modifierEffects = modifierEffectsFactory.fromItems(
    items,
    createItemContextMap(input.itemContexts),
    {
      classId: input.character.classId,
      baseLevel: input.character.baseLevel,
      learnedSkills: input.learnedSkills,
      ruleset: input.ruleset,
    },
  );

  // Aplicar buffs ativos (habilidades/consumíveis)
  if (input.activeBuffs && Object.keys(input.activeBuffs).length > 0) {
    const resolvedBuffEffects = globalBuffRegistry.resolve(
      input.activeBuffs,
      input.character.baseLevel,
      input.character.jobLevel,
    );
    if (resolvedBuffEffects.length > 0) {
      modifierEffects = mergeBuffEffects(modifierEffects, resolvedBuffEffects);
    }
  }

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
      formulaId: result.formulaId,
      precision: result.formulaId === "generic" ? "prototype" : "validated",
      note:
        result.formulaId === "generic"
          ? "Generic skill formula. Renewal/iRO rounding and skill exceptions still need validation."
          : "Validated static skill formula for the selected skill.",
      warnings: createWarnings(modifierEffects.unsupportedStatements.length),
    },
    characterStatus,
    modifierEffects,
    target: monster,
    skill,
    damage: result.damage,
    breakdown: [
      ...result.breakdown,
      {
        key: "activeBuffItems",
        label: "Active buff items",
        value: input.buffItemIds.length,
        group: "modifier",
        unit: "count",
      },
    ],
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
    itemContexts.map((context) => [
      context.itemId,
      { refine: context.refine, grade: context.grade },
    ]),
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
