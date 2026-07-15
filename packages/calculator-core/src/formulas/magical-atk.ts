import type { CalculatorModifierEffects } from "../calculator-modifier-effects";
import type { EffectiveCharacter } from "../effective-character";
import type { RoItem, RoMonster, RoSkill } from "../ro-types";

export function getMagicalBasePower(character: EffectiveCharacter) {
  return character.statusMatk;
}

export function sumMagicalEquipmentPower(items: RoItem[], effects?: CalculatorModifierEffects) {
  return items.reduce((total, item) => {
    let base = item.magicAttack ?? 0;

    if (effects?.recognizedSpell && item.slots?.includes("weapon") && item.weaponLevel) {
      base += Math.floor(base * (item.weaponLevel * 0.1));
    }

    return total + base;
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
  const matkRate = effects.matkRate;
  const smatk = effects.smatk + character.traitEffects.smatk;
  const skillRate = effects.skillDamageRate[skill.id] ?? 0;

  const raceRate = getTargetedRate(effects.magicRaceDamageRate, monster.race);
  const elementRate = getTargetedRate(effects.magicElementDamageRate, monster.element);
  const sizeRate = getTargetedRate(effects.magicSizeDamageRate, monster.size);
  const classRate = getTargetedRate(effects.magicClassDamageRate, monster.classType);
  const elementAttackRate = getTargetedRate(effects.magicElementAttackRate, skill.element);

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
