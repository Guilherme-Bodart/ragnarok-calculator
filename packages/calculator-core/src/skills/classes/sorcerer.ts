import type {
  SkillFormulaAdapter,
  SkillFormulaInput,
  SkillFormulaResult,
} from "../skill-formula.types";

const formulas: Record<
  string,
  (input: SkillFormulaInput) => SkillFormulaResult
> = {
  SO_PSYCHIC_WAVE: (input) => ({
    formulaId: "static:SO_PSYCHIC_WAVE",
    // C++: skillratio += -100 + 70 * skill_lv + 3 * int
    multiplier: ((70 * input.skillLevel + 3 * input.character.effectiveStats.int) * input.character.baseLevel) / 100 / 100,
    hitCount: input.skill.hitCountByLevel?.[String(input.skillLevel)] ?? input.skill.hitCount,
    precision: "validated",
  }),
  SO_VARETYR_SPEAR: (input) => {
    // C++: skillratio += -100 + (2 * sstatus->int_ + 150 * (striking + lightningloader) + sstatus->int_ * skill_lv / 2) / 3;
    const strikingLv = input.character.learnedSkills?.["SO_STRIKING"] || 0;
    const loaderLv = input.character.learnedSkills?.["SA_LIGHTNINGLOADER"] || 0;
    const int = input.character.effectiveStats.int;
    const ratio = (2 * int + 150 * (strikingLv + loaderLv) + (int * input.skillLevel) / 2) / 3;
    return {
      formulaId: "static:SO_VARETYR_SPEAR",
      multiplier: (ratio * input.character.baseLevel) / 100 / 100,
      hitCount: input.skill.hitCountByLevel?.[String(input.skillLevel)] ?? input.skill.hitCount,
      precision: "validated",
    };
  },
  SO_DIAMONDDUST: (input) => {
    // C++: skillratio += -100 + 2 * sstatus->int_ + 300 * pc_checkskill(sd, SA_FROSTWEAPON) + sstatus->int_ * skill_lv;
    const weaponLv = input.character.learnedSkills?.["SA_FROSTWEAPON"] || 0;
    const int = input.character.effectiveStats.int;
    const ratio = 2 * int + 300 * weaponLv + int * input.skillLevel;
    return {
      formulaId: "static:SO_DIAMONDDUST",
      multiplier: (ratio * input.character.baseLevel) / 100 / 100,
      hitCount: input.skill.hitCountByLevel?.[String(input.skillLevel)] ?? input.skill.hitCount,
      precision: "validated",
    };
  },
  SO_EARTHGRAVE: (input) => {
    // C++: skillratio += -100 + 2 * sstatus->int_ + 300 * pc_checkskill(sd, SA_SEISMICWEAPON) + sstatus->int_ * skill_lv;
    const weaponLv = input.character.learnedSkills?.["SA_SEISMICWEAPON"] || 0;
    const int = input.character.effectiveStats.int;
    const ratio = 2 * int + 300 * weaponLv + int * input.skillLevel;
    return {
      formulaId: "static:SO_EARTHGRAVE",
      multiplier: (ratio * input.character.baseLevel) / 100 / 100,
      hitCount: input.skill.hitCountByLevel?.[String(input.skillLevel)] ?? input.skill.hitCount,
      precision: "validated",
    };
  }
};

export class SorcererSkillFormula implements SkillFormulaAdapter {
  readonly id = "sorcerer";

  supports(skill: { id: string }): boolean {
    return skill.id in formulas;
  }

  calculate(input: SkillFormulaInput): SkillFormulaResult {
    return formulas[input.skill.id](input);
  }
}
