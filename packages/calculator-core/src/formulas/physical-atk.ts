import type { CalculatorModifierEffects } from "../calculator-modifier-effects";
import type { EffectiveCharacter } from "../effective-character";
import type { Bonus, RoItem, RoMonster, RoSkill } from "../ro-types";

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

export function getPhysicalLegacyBonusRate(
  items: RoItem[],
  skill: RoSkill,
  monster: RoMonster,
) {
  return items
    .flatMap((item) => item.bonuses)
    .reduce(
      (total, bonus) => total + getApplicablePhysicalLegacyBonusRate(bonus, skill, monster),
      0,
    );
}

export function getPhysicalTraitFinalRate(character: EffectiveCharacter) {
  return character.traitEffects.pAtk;
}

export function getPhysicalModifierFinalRate(
  effects: CalculatorModifierEffects,
  monster: RoMonster,
  skill: RoSkill,
) {
  const skillRate = effects.skillDamageRate[skill.id] ?? 0;

  return (
    effects.atkRate +
    effects.pAtk +
    skillRate +
    getTargetedRate(effects.raceDamageRate, monster.race) +
    getTargetedRate(effects.elementDamageRate, monster.element) +
    getTargetedRate(effects.sizeDamageRate, monster.size)
  );
}

function getApplicablePhysicalLegacyBonusRate(
  bonus: Bonus,
  skill: RoSkill,
  monster: RoMonster,
) {
  if (bonus.type === "atkRate") return bonus.value;
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
