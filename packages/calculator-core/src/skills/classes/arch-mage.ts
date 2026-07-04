import type {
  SkillFormulaAdapter,
  SkillFormulaInput,
  SkillFormulaResult,
} from "../skill-formula.types";

/**
 * BÔNUS DE DANO BASE (Fácil Manutenção para o Servidor bRO / LATAM)
 * Você pode alterar esses valores abaixo caso o servidor aplique nerfs ou buffs nas skills.
 * Por exemplo, no rAthena puro, o base da Vulcan é 250 (250 * 5 = 1250%), 
 * mas se no bRO for 180 (180 * 5 = 900%), altere aqui.
 */
const BASE_MULTIPLIERS = {
  SOUL_VULCAN_STRIKE: 250, // Multiplicador por nível
  MYSTERY_ILLUSION: 150,
  TORNADO_STORM: 150,
  RAIN_OF_CRYSTAL: 150,
  FLORAL_FLARE_ROAD: 150,
};

const archMageFormulas: Record<
  string,
  (input: SkillFormulaInput) => SkillFormulaResult
> = {
  AG_SOUL_VC_STRIKE: (input) => {
    // Formula: [ (Base Dmg * SkillLv) + (SPL * 3) ] * (BaseLevel / 100)
    let baseDmg = BASE_MULTIPLIERS.SOUL_VULCAN_STRIKE * input.skillLevel;
    let multiplier = baseDmg + (input.character.effectiveStats.spl || 0) * 3;
    let finalMultiplier = (multiplier * input.character.baseLevel) / 100;

    return {
      formulaId: "AG_SOUL_VC_STRIKE",
      multiplier: finalMultiplier / 100,
      hitCount: 7, // Hita 7 vezes no nv 5
      precision: "validated",
    };
  },
  AG_MYSTERY_ILLUSION: (input) => {
    // Formula: [ (Base Dmg * SkillLv) + (SPL * 5) ] * (BaseLevel / 100)
    let baseDmg = BASE_MULTIPLIERS.MYSTERY_ILLUSION * input.skillLevel;
    let multiplier = baseDmg + (input.character.effectiveStats.spl || 0) * 5;
    let finalMultiplier = (multiplier * input.character.baseLevel) / 100;

    return {
      formulaId: "AG_MYSTERY_ILLUSION",
      multiplier: finalMultiplier / 100,
      hitCount: 1, // Mystery Illusion causa dano por tick
      precision: "validated",
    };
  },
  AG_TORNADO_STORM: (input) => {
    // Formula: [ (Base Dmg * SkillLv) + (SPL * 3) ] * (BaseLevel / 100)
    let baseDmg = BASE_MULTIPLIERS.TORNADO_STORM * input.skillLevel;
    let multiplier = baseDmg + (input.character.effectiveStats.spl || 0) * 3;
    let finalMultiplier = (multiplier * input.character.baseLevel) / 100;

    return {
      formulaId: "AG_TORNADO_STORM",
      multiplier: finalMultiplier / 100,
      hitCount: 1, // Depende do level, mas normalmente considerado por hit de tornado
      precision: "validated",
    };
  },
  AG_RAIN_OF_CRYSTAL: (input) => {
    // Formula: [ (Base Dmg * SkillLv) + (SPL * 5) ] * (BaseLevel / 100)
    let baseDmg = BASE_MULTIPLIERS.RAIN_OF_CRYSTAL * input.skillLevel;
    let multiplier = baseDmg + (input.character.effectiveStats.spl || 0) * 5;
    let finalMultiplier = (multiplier * input.character.baseLevel) / 100;

    return {
      formulaId: "AG_RAIN_OF_CRYSTAL",
      multiplier: finalMultiplier / 100,
      hitCount: 1, // Dano em área/ticks
      precision: "validated",
    };
  },
  AG_FLORAL_FLARE_ROAD: (input) => {
    // Formula: [ (Base Dmg * SkillLv) + (SPL * 5) ] * (BaseLevel / 100)
    let baseDmg = BASE_MULTIPLIERS.FLORAL_FLARE_ROAD * input.skillLevel;
    let multiplier = baseDmg + (input.character.effectiveStats.spl || 0) * 5;
    let finalMultiplier = (multiplier * input.character.baseLevel) / 100;

    return {
      formulaId: "AG_FLORAL_FLARE_ROAD",
      multiplier: finalMultiplier / 100,
      hitCount: 1,
      precision: "validated",
    };
  },
};

export class ArchMageSkillFormula implements SkillFormulaAdapter {
  readonly id = "arch-mage";

  supports(skill: { name: string }): boolean {
    return skill.name in archMageFormulas;
  }

  calculate(input: SkillFormulaInput): SkillFormulaResult {
    return archMageFormulas[input.skill.name](input);
  }
}
