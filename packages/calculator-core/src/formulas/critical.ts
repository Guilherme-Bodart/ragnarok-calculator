import type { CharacterStatus } from "../character-status-engine";
import type { CalculatorModifierEffects } from "../calculator-modifier-effects";
import type { RoMonster } from "../ro-types";

export type CriticalCalculationResult = {
  /** Chance of landing a critical hit (0 to 100) */
  chance: number;
  /** Critical damage multiplier (e.g. 1.4 for 140%) */
  damageMultiplier: number;
};

export class CriticalEngine {
  calculate(
    characterStatus: CharacterStatus,
    modifierEffects: CalculatorModifierEffects,
    monster?: RoMonster
  ): CriticalCalculationResult {
    // A chance base vem do CharacterStatus (que já considera LUK/3 + bônus de equipamentos)
    // Se o monstro fosse levado em conta, subtrairíamos Target LUK / 5.
    // Atualmente, não temos Target LUK, então usamos apenas o crit do atacante.
    let chance = characterStatus.crit;

    if (chance < 0) chance = 0;
    if (chance > 100) chance = 100;

    // Em Renewal, Dano Crítico padrão é 140% (1.4x)
    // Modificadores de CriticalDamageRate (tanto de traits quanto bônus de equipamentos) são somados
    const traitCritDamageRate = characterStatus.traitEffects.criticalDamageRate;
    const modifierCritDamageRate = modifierEffects.criticalDamageRate ?? 0;

    const damageMultiplier = 1.4 + (traitCritDamageRate + modifierCritDamageRate) / 100;

    return {
      chance,
      damageMultiplier,
    };
  }
}
