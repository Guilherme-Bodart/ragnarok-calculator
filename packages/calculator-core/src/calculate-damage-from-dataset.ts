import { CalculatorModifierEffectsFactory } from "./calculator-modifier-effects";
import { CharacterStatusEngine } from "./character-status-engine";
import { DamageEngine } from "./damage-engine";
import { mergeBuffEffects, type BuffEffect } from "./buff-effects";
import { globalBuffRegistry } from "./buffs";
import type { CalculateDamageResult } from "./calculation-result";
import type { RulesetContext } from "./rulesets";
import type { CalculatorCharacter, RoItem, RoMonster, RoSkill } from "./ro-types";
import { EffectiveCharacterBuilder } from "./effective-character";

export type CalculatorItemContext = {
  itemId: number;
  refine?: number;
  grade?: number;
  extraScript?: string;
  slot?: string;
};

export type CalculateDamageInput = {
  character: CalculatorCharacter;
  learnedSkills: Record<string, number>;
  equipmentItemIds: number[];
  cardItemIds: { id: number; slot: string }[];
  buffItemIds: number[];
  /** Buffs ativos mapeados por ID da habilidade (ex: AL_BLESSING) para o Nível.
   *  O core utilizará o BuffRegistry para converter esses níveis em BuffEffects reais. */
  activeBuffs?: Record<string, number>;
  itemContexts: CalculatorItemContext[];
  monsterId: number;
  skillId: string;
  skillLevel: number;
  ruleset: RulesetContext;
  manualBonuses?: {
    stat: string;
    value: number;
    target?:
      | { type: "self" }
      | { type: "enemy" }
      | { type: "element"; elementId: string }
      | { type: "race"; raceId: string }
      | { type: "size"; sizeId: string }
      | { type: "class"; classId: string };
  }[];
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

  const modifierEffectsFactory = new CalculatorModifierEffectsFactory();
  const contextMap = createItemContextMap(input.itemContexts);

  const itemsWithContext: { item: RoItem; context?: CalculatorItemContext }[] = [];
  const items: RoItem[] = [];

  for (const eqId of input.equipmentItemIds) {
    const baseItem = findItemById(dataset.items, eqId);
    if (!baseItem) continue;
    const ctx = contextMap.get(baseItem.id);
    const item = ctx && ctx.extraScript ? { ...baseItem, rawScript: (baseItem.rawScript || "") + "\n" + ctx.extraScript } : baseItem;
    itemsWithContext.push({ item, context: ctx });
    items.push(item);
  }

  for (const { id, slot } of input.cardItemIds) {
    const baseItem = findItemById(dataset.items, id);
    if (!baseItem) continue;
    
    // Find the equipment that occupies this slot to inherit its refine/grade
    const hostEq = input.equipmentItemIds.map(e => findItemById(dataset.items, e)).find(e => e?.slots?.includes(slot as any));
    const hostCtx = hostEq ? contextMap.get(hostEq.id) : undefined;
    
    // Cards also can have their own extraScript in contextMap
    const selfCtx = contextMap.get(baseItem.id);
    const item = selfCtx && selfCtx.extraScript ? { ...baseItem, rawScript: (baseItem.rawScript || "") + "\n" + selfCtx.extraScript } : baseItem;
    
    // We pass the host's refine and grade, but the card's itemId
    itemsWithContext.push({ item, context: hostCtx ? { ...selfCtx, itemId: item.id, refine: hostCtx.refine, grade: hostCtx.grade } : selfCtx });
    items.push(item);
  }

  for (const buffId of input.buffItemIds) {
    const baseItem = findItemById(dataset.items, buffId);
    if (!baseItem) continue;
    const ctx = contextMap.get(baseItem.id);
    const item = ctx && ctx.extraScript ? { ...baseItem, rawScript: (baseItem.rawScript || "") + "\n" + ctx.extraScript } : baseItem;
    itemsWithContext.push({ item, context: ctx });
    items.push(item);
  }

  let modifierEffects = modifierEffectsFactory.fromItems(
    itemsWithContext,
    {
      classId: input.character.classId,
      baseLevel: input.character.baseLevel,
      learnedSkills: input.learnedSkills,
      ruleset: input.ruleset,
      equippedItemIds: [
        ...input.equipmentItemIds,
        ...input.cardItemIds.map((c) => c.id),
      ],
      refinesBySlot: Object.fromEntries(
        (input.itemContexts || [])
          .filter((c) => c.slot && c.refine !== undefined)
          .map((c) => [c.slot, c.refine])
      ),
      stats: {
        str: input.character.stats.str,
        agi: input.character.stats.agi,
        vit: input.character.stats.vit,
        int: input.character.stats.int,
        dex: input.character.stats.dex,
        luk: input.character.stats.luk,
      },
    }
  );

  let weaponType = input.character.weaponType;
  let weaponLevel = input.character.weaponLevel;
  let weaponRefine = input.character.weaponRefine ?? 0;

  const weaponItem = items.find((item) => item.slots?.includes("weapon") || item.weaponType !== undefined);
  if (weaponItem) {
    weaponType = weaponItem.weaponType;
    weaponLevel = weaponItem.weaponLevel;
    const weaponCtx = input.itemContexts?.find((c) => c.itemId === weaponItem.id);
    if (weaponCtx?.refine !== undefined) {
      weaponRefine = weaponCtx.refine;
    }
  }

  const character = new EffectiveCharacterBuilder().build(
    {
      ...input.character,
      learnedSkills: input.learnedSkills,
      weaponType,
      weaponLevel,
      weaponRefine,
    },
    modifierEffects.statBonuses,
  );

  // Aplicar bônus manuais (encantamentos/extras passados manualmente pela UI)
  if (input.manualBonuses) {
    for (const bonus of input.manualBonuses) {
      const target = bonus.target || { type: "self" };
      if (target.type === "self") {
        if (bonus.stat === "matkRate") modifierEffects.matkRate += bonus.value;
        if (bonus.stat === "atkRate") modifierEffects.atkRate += bonus.value;
        if (bonus.stat === "variableCastRate") modifierEffects.variableCastRate += bonus.value;
        if (bonus.stat === "flatMatk") modifierEffects.flatMatk += bonus.value;
        if (bonus.stat === "flatAtk") modifierEffects.flatAtk += bonus.value;
        if (bonus.stat === "flee") modifierEffects.flee += bonus.value;
        if (bonus.stat === "fixedCast") modifierEffects.fixedCast += bonus.value;
        if (bonus.stat === "afterCastDelayRate") modifierEffects.afterCastDelayRate += bonus.value;
        if (bonus.stat === "ignoreMagicDefenseRate" && typeof modifierEffects.ignoreMagicDefenseRate === "object") {
          modifierEffects.ignoreMagicDefenseRate.all = (modifierEffects.ignoreMagicDefenseRate.all || 0) + bonus.value;
        }
        if (bonus.stat === "ignoreDefenseRate" && typeof modifierEffects.ignoreDefenseRate === "object") {
          modifierEffects.ignoreDefenseRate.all = (modifierEffects.ignoreDefenseRate.all || 0) + bonus.value;
        }
      } else if (target.type === "element" && bonus.stat === "magicElementAttackRate" && typeof modifierEffects.magicElementAttackRate === "object") {
        const key = target.elementId as keyof typeof modifierEffects.magicElementAttackRate;
        modifierEffects.magicElementAttackRate[key] = (modifierEffects.magicElementAttackRate[key] ?? 0) + bonus.value;
      } else if (target.type === "size" && bonus.stat === "magicSizeDamageRate" && typeof modifierEffects.magicSizeDamageRate === "object") {
        const key = target.sizeId as keyof typeof modifierEffects.magicSizeDamageRate;
        modifierEffects.magicSizeDamageRate[key] = (modifierEffects.magicSizeDamageRate[key] ?? 0) + bonus.value;
      }
    }
  }

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

  // Combos Fixos Nativos
  // Carta Ancião Primitivo (300269) + Carta Observação (4392)
  const hasEldest = input.cardItemIds.some(c => c.id === 300269) || input.equipmentItemIds.includes(300269);
  const hasObservation = input.cardItemIds.some(c => c.id === 4392) || input.equipmentItemIds.includes(4392);
  
  if (hasEldest && hasObservation && input.character.baseLevel >= 200) {
    // bonus2 bMagicAtkEle,Ele_Ghost,15*(readparam(bInt)/40)
    const bonusValue = 15 * Math.floor(input.character.stats.int / 40);
    if (typeof modifierEffects.magicElementAttackRate === "object") {
      modifierEffects.magicElementAttackRate.ghost = (modifierEffects.magicElementAttackRate.ghost ?? 0) + bonusValue;
    }
  }

  // Combo: Celine's Dress (450179) + Celine's Brooch (32237)
  const hasCelineDress = input.equipmentItemIds.includes(450179);
  const hasCelineBrooch = input.equipmentItemIds.includes(32237);
  if (hasCelineDress && hasCelineBrooch) {
    const dressCtx = input.itemContexts.find(c => c.itemId === 450179);
    const dressRefine = dressCtx?.refine ?? 0;
    modifierEffects.flatMatk += 10 * dressRefine;
    
    if (dressRefine >= 9) {
      modifierEffects.variableCastRate -= 5;
      if (dressRefine >= 11) {
        if (typeof modifierEffects.magicElementAttackRate === "object") {
          modifierEffects.magicElementAttackRate.neutral = (modifierEffects.magicElementAttackRate.neutral ?? 0) + 10;
          modifierEffects.magicElementAttackRate.fire = (modifierEffects.magicElementAttackRate.fire ?? 0) + 10;
          modifierEffects.magicElementAttackRate.earth = (modifierEffects.magicElementAttackRate.earth ?? 0) + 10;
          modifierEffects.magicElementAttackRate.water = (modifierEffects.magicElementAttackRate.water ?? 0) + 10;
          modifierEffects.magicElementAttackRate.wind = (modifierEffects.magicElementAttackRate.wind ?? 0) + 10;
        }
      }
    }
  }

  // Combo: Celine's Ribbon (18849) + Celine's Brooch (32237)
  const hasCelineRibbon = input.equipmentItemIds.includes(18849);
  if (hasCelineRibbon && hasCelineBrooch) {
    const ribbonCtx = input.itemContexts.find(c => c.itemId === 18849);
    const ribbonRefine = ribbonCtx?.refine ?? 0;
    
    modifierEffects.fixedCast -= 300;
    
    if (ribbonRefine > 0) {
      modifierEffects.flatMatk += 10 * ribbonRefine;
      
      if (ribbonRefine >= 7) {
        if (typeof modifierEffects.magicRaceDamageRate === "object") {
          modifierEffects.magicRaceDamageRate.demihuman = (modifierEffects.magicRaceDamageRate.demihuman ?? 0) + 10;
          modifierEffects.magicRaceDamageRate.demon = (modifierEffects.magicRaceDamageRate.demon ?? 0) + 10;
        }
        
        if (ribbonRefine >= 9) {
          if (typeof modifierEffects.magicElementAttackRate === "object") {
            modifierEffects.magicElementAttackRate.water = (modifierEffects.magicElementAttackRate.water ?? 0) + 10;
            modifierEffects.magicElementAttackRate.wind = (modifierEffects.magicElementAttackRate.wind ?? 0) + 10;
            modifierEffects.magicElementAttackRate.earth = (modifierEffects.magicElementAttackRate.earth ?? 0) + 10;
            modifierEffects.magicElementAttackRate.fire = (modifierEffects.magicElementAttackRate.fire ?? 0) + 10;
            modifierEffects.magicElementAttackRate.neutral = (modifierEffects.magicElementAttackRate.neutral ?? 0) + 10;
          }
          
          if (ribbonRefine >= 11) {
             if (typeof modifierEffects.magicClassDamageRate === "object") {
               modifierEffects.magicClassDamageRate.boss = (modifierEffects.magicClassDamageRate.boss ?? 0) + 20;
             }
          }
        }
      }
    }
  }




  const characterStatus = new CharacterStatusEngine().calculate({
    character: {
      ...input.character,
      learnedSkills: input.learnedSkills,
      weaponType,
      weaponLevel,
      weaponRefine,
    },
    items,
    modifierEffects,
    itemStatBonuses: modifierEffects.statBonuses,
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
      context,
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
