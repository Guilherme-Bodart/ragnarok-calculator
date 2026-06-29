import type { CalculatorModifierEffects } from "../calculator-modifier-effects";
import type { EffectiveCharacter } from "../effective-character";
import type { RoItem, RoMonster, RoSkill } from "../ro-types";

export function getPhysicalBasePower(character: EffectiveCharacter) {
  return character.statusAtk;
}

export function sumPhysicalEquipmentPower(items: RoItem[]) {
  return items.reduce((total, item) => total + (item.attack ?? 0), 0);
}

export function getPhysicalModifierFlatPower(effects: CalculatorModifierEffects) {
  return effects.flatAtk;
}

export function getPhysicalModifierFinalRateMultiplier(
  character: EffectiveCharacter,
  effects: CalculatorModifierEffects,
  items: RoItem[],
  monster: RoMonster,
  skill: RoSkill,
) {
  const atkRate = effects.atkRate;
  const pAtk = effects.pAtk + character.traitEffects.pAtk;
  const skillRate = effects.skillDamageRate[skill.id] ?? 0;
  
  const raceRate = getTargetedRate(effects.raceDamageRate, monster.race);
  const elementRate = getTargetedRate(effects.elementDamageRate, monster.element);
  const sizeRate = getTargetedRate(effects.sizeDamageRate, monster.size);
  const classRate = getTargetedRate(effects.classDamageRate, monster.classType);
  
  const rangeRate = getPhysicalRangeRate(effects, skill);

  return (
    (1 + atkRate / 100) *
    (1 + pAtk / 100) *
    (1 + rangeRate / 100) *
    (1 + skillRate / 100) *
    (1 + raceRate / 100) *
    (1 + elementRate / 100) *
    (1 + sizeRate / 100) *
    (1 + classRate / 100)
  );
}

function getPhysicalRangeRate(effects: CalculatorModifierEffects, skill: RoSkill) {
  return Math.abs(skill.attackRange ?? 1) > 3
    ? effects.longAttackRate
    : effects.shortAttackRate;
}

function getTargetedRate<TTarget extends string>(
  rates: Partial<Record<TTarget | "all", number>>,
  target: TTarget | undefined,
) {
  return (target ? rates[target] ?? 0 : 0) + (rates.all ?? 0);
}
