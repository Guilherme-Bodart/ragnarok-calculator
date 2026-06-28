import type { CalculatorModifierEffects } from "../calculator-modifier-effects";
import type { EffectiveCharacter } from "../effective-character";
import type { RoItem, RoMonster, RoSkill } from "../ro-types";

export function getPhysicalBasePower(character: EffectiveCharacter) {
  return character.statusAtk;
}

export function sumPhysicalEquipmentPower(items: RoItem[]) {
  return items.reduce((total, item) => {
    const bonusPower = item.bonuses.reduce((bonusTotal, bonus) => {
      if (bonus.type === "flatAtk") {
        return bonusTotal + bonus.value;
      }

      return bonusTotal;
    }, 0);

    return total + (item.attack ?? 0) + bonusPower;
  }, 0);
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
  let legacyAtkRate = 0;
  let legacySkillRate = 0;
  let legacyRaceRate = 0;
  let legacyElementRate = 0;
  let legacySizeRate = 0;

  for (const item of items) {
    for (const bonus of item.bonuses) {
      if (bonus.type === "atkRate") legacyAtkRate += bonus.value;
      else if (bonus.type === "skillDamage" && bonus.skillId === skill.id) legacySkillRate += bonus.value;
      else if (bonus.type === "raceDamage" && bonus.race === monster.race) legacyRaceRate += bonus.value;
      else if (bonus.type === "elementDamage" && bonus.element === monster.element) legacyElementRate += bonus.value;
      else if (bonus.type === "sizeDamage" && bonus.size === monster.size) legacySizeRate += bonus.value;
    }
  }

  const atkRate = effects.atkRate + legacyAtkRate;
  const pAtk = effects.pAtk + character.traitEffects.pAtk;
  const skillRate = (effects.skillDamageRate[skill.id] ?? 0) + legacySkillRate;
  
  const raceRate = getTargetedRate(effects.raceDamageRate, monster.race) + legacyRaceRate;
  const elementRate = getTargetedRate(effects.elementDamageRate, monster.element) + legacyElementRate;
  const sizeRate = getTargetedRate(effects.sizeDamageRate, monster.size) + legacySizeRate;
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
