import type { CalculatorModifierEffects } from "../calculator-modifier-effects";
import type { EffectiveCharacter } from "../effective-character";
import type { Bonus, RoItem, RoMonster, RoSkill } from "../ro-types";

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

export function getMagicalLegacyBonusRate(
  items: RoItem[],
  skill: RoSkill,
  monster: RoMonster,
) {
  return items
    .flatMap((item) => item.bonuses)
    .reduce(
      (total, bonus) => total + getApplicableMagicalLegacyBonusRate(bonus, skill, monster),
      0,
    );
}

export function getMagicalTraitFinalRate(character: EffectiveCharacter) {
  return character.traitEffects.smatk;
}

export function getMagicalModifierFinalRate(
  effects: CalculatorModifierEffects,
  monster: RoMonster,
  skill: RoSkill,
) {
  const skillRate = effects.skillDamageRate[skill.id] ?? 0;

  return (
    effects.matkRate +
    effects.smatk +
    skillRate +
    getTargetedRate(effects.magicRaceDamageRate, monster.race) +
    getTargetedRate(effects.magicElementDamageRate, monster.element) +
    getTargetedRate(effects.magicSizeDamageRate, monster.size) +
    getTargetedRate(effects.magicElementAttackRate, skill.element)
  );
}

function getApplicableMagicalLegacyBonusRate(
  bonus: Bonus,
  skill: RoSkill,
  monster: RoMonster,
) {
  if (bonus.type === "matkRate") return bonus.value;
  if (bonus.type === "skillDamage" && bonus.skillId === skill.id) return bonus.value;
  if (bonus.type === "raceDamage" && bonus.race === monster.race) return bonus.value;
  if (bonus.type === "elementDamage" && bonus.element === monster.element) return bonus.value;
  if (bonus.type === "sizeDamage" && bonus.size === monster.size) return bonus.value;

  return 0;
}

function getTargetedRate<TTarget extends string>(
  rates: Partial<Record<TTarget | "all", number>>,
  target: TTarget | undefined,
) {
  return (target ? rates[target] ?? 0 : 0) + (rates.all ?? 0);
}
