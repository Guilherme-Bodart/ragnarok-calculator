import type { CalculatorModifierEffects } from "../calculator-modifier-effects";
import type { EffectiveCharacter } from "../effective-character";
import type { RoItem, RoMonster, RoSkill } from "../ro-types";

export function getMagicalBasePower(character: EffectiveCharacter) {
  return character.statusMatk;
}

export function sumMagicalEquipmentPower(items: RoItem[]) {
  return items.reduce((total, item) => {
    const bonusPower = item.bonuses.reduce((bonusTotal, bonus) => {
      if (bonus.type === "flatMatk") {
        return bonusTotal + bonus.value;
      }

      return bonusTotal;
    }, 0);

    return total + (item.magicAttack ?? 0) + bonusPower;
  }, 0);
}

export function getMagicalModifierFlatPower(effects: CalculatorModifierEffects) {
  return effects.flatMatk;
}

export function getMagicalModifierFinalRateMultiplier(
  character: EffectiveCharacter,
  effects: CalculatorModifierEffects,
  items: RoItem[],
  monster: RoMonster,
  skill: RoSkill,
) {
  let legacyMatkRate = 0;
  let legacySkillRate = 0;
  let legacyRaceRate = 0;
  let legacyElementRate = 0;
  let legacySizeRate = 0;

  for (const item of items) {
    for (const bonus of item.bonuses) {
      if (bonus.type === "matkRate") legacyMatkRate += bonus.value;
      else if (bonus.type === "skillDamage" && bonus.skillId === skill.id) legacySkillRate += bonus.value;
      else if (bonus.type === "raceDamage" && bonus.race === monster.race) legacyRaceRate += bonus.value;
      else if (bonus.type === "elementDamage" && bonus.element === monster.element) legacyElementRate += bonus.value;
      else if (bonus.type === "sizeDamage" && bonus.size === monster.size) legacySizeRate += bonus.value;
    }
  }

  const matkRate = effects.matkRate + legacyMatkRate;
  const smatk = effects.smatk + character.traitEffects.smatk;
  const skillRate = (effects.skillDamageRate[skill.id] ?? 0) + legacySkillRate;

  const raceRate = getTargetedRate(effects.magicRaceDamageRate, monster.race) + legacyRaceRate;
  const elementRate = getTargetedRate(effects.magicElementDamageRate, monster.element) + legacyElementRate;
  const sizeRate = getTargetedRate(effects.magicSizeDamageRate, monster.size) + legacySizeRate;
  const classRate = getTargetedRate(effects.magicClassDamageRate, monster.classType);
  const elementAttackRate = getTargetedRate(effects.magicElementAttackRate, skill.element);

  console.log("Rates Debug:", {
    matkRate, smatk, skillRate, raceRate, elementRate, sizeRate, classRate, elementAttackRate, monsterSize: monster.size
  });

  return (
    (1 + matkRate / 100) *
    (1 + smatk / 100) *
    (1 + skillRate / 100) *
    (1 + raceRate / 100) *
    (1 + elementRate / 100) *
    (1 + sizeRate / 100) *
    (1 + classRate / 100) *
    (1 + elementAttackRate / 100)
  );
}

function getTargetedRate<TTarget extends string>(
  rates: Partial<Record<TTarget | "all", number>>,
  target: TTarget | undefined,
) {
  return (target ? rates[target] ?? 0 : 0) + (rates.all ?? 0);
}
