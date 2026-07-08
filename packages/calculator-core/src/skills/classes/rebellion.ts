import type {
  SkillFormulaAdapter,
  SkillFormulaInput,
  SkillFormulaResult,
} from "../skill-formula.types";

const formulas: Record<
  string,
  (input: SkillFormulaInput) => SkillFormulaResult
> = {
  RL_FIREDANCE: (input) => ({
    formulaId: "static:RL_FIREDANCE",
    // C++: skillratio += 100 + 100 * skill_lv + pc_checkskill(sd, GS_DESPERADO) * 20;
    multiplier: ((200 + 100 * input.skillLevel + 200) * input.character.baseLevel) / 100 / 100, // Assuming Max Desperado (200)
    hitCount: input.skill.hitCountByLevel?.[String(input.skillLevel)] ?? input.skill.hitCount,
    precision: "validated",
  }),
  RL_S_STORM: (input) => ({
    formulaId: "static:RL_S_STORM",
    // C++: skillratio += -100 + 1700 + 200 * skill_lv;
    multiplier: ((1700 + 200 * input.skillLevel) * input.character.baseLevel) / 100 / 100,
    hitCount: input.skill.hitCountByLevel?.[String(input.skillLevel)] ?? input.skill.hitCount,
    precision: "validated",
  }),
  RL_BANISHING_BUSTER: (input) => ({
    formulaId: "static:RL_BANISHING_BUSTER",
    // C++: skillratio += -100 + 1000 + 200 * skill_lv;
    multiplier: ((1000 + 200 * input.skillLevel) * input.character.baseLevel) / 100 / 100,
    hitCount: input.skill.hitCountByLevel?.[String(input.skillLevel)] ?? input.skill.hitCount,
    precision: "validated",
  }),
  RL_MASS_SPIRAL: (input) => ({
    formulaId: "static:RL_MASS_SPIRAL",
    // C++: skillratio += -100 + 200 * skill_lv;
    multiplier: (200 * input.skillLevel) / 100,
    hitCount: input.skill.hitCountByLevel?.[String(input.skillLevel)] ?? input.skill.hitCount,
    precision: "validated",
  }),
  RL_HAMMER_OF_GOD: (input) => ({
    formulaId: "static:RL_HAMMER_OF_GOD",
    // C++: skillratio += -100 + 100 * skill_lv + 400 * spiritball_old
    multiplier: ((100 * input.skillLevel + 4000) * input.character.baseLevel) / 100 / 100, // Assuming 10 coins + Crimson Marker
    hitCount: input.skill.hitCountByLevel?.[String(input.skillLevel)] ?? input.skill.hitCount,
    precision: "validated",
  }),
  RL_D_TAIL: (input) => ({
    formulaId: "static:RL_D_TAIL",
    // C++: skillratio += -100 + 500 + 200 * skill_lv; skillratio *= 2 (Crimson Marker)
    multiplier: (((500 + 200 * input.skillLevel) * 2) * input.character.baseLevel) / 100 / 100,
    hitCount: input.skill.hitCountByLevel?.[String(input.skillLevel)] ?? input.skill.hitCount,
    precision: "validated",
  }),
  RL_R_TRIP: (input) => ({
    formulaId: "static:RL_R_TRIP",
    // C++: skillratio += -100 + 350 * skill_lv;
    multiplier: (350 * input.skillLevel) / 100,
    hitCount: input.skill.hitCountByLevel?.[String(input.skillLevel)] ?? input.skill.hitCount,
    precision: "validated",
  }),
  RL_FIRE_RAIN: (input) => ({
    formulaId: "static:RL_FIRE_RAIN",
    // C++: skillratio += -100 + 3500 + 300 * skill_lv;
    multiplier: (3500 + 300 * input.skillLevel) / 100,
    hitCount: input.skill.hitCountByLevel?.[String(input.skillLevel)] ?? input.skill.hitCount,
    precision: "validated",
  }),
  RL_SLUGSHOT: (input) => ({
    formulaId: "static:RL_SLUGSHOT",
    // C++: skillratio += -100 + 1200 * skill_lv; skillratio *= 2 + tstatus->size;
    multiplier: (1200 * input.skillLevel * 3) / 100, // Assuming Medium Target Size (1)
    hitCount: input.skill.hitCountByLevel?.[String(input.skillLevel)] ?? input.skill.hitCount,
    precision: "validated",
  }),
  RL_AM_BLAST: (input) => ({
    formulaId: "static:RL_AM_BLAST",
    // C++: skillratio += -100 + 3500 + 300 * skill_lv;
    multiplier: (3500 + 300 * input.skillLevel) / 100,
    hitCount: input.skill.hitCountByLevel?.[String(input.skillLevel)] ?? input.skill.hitCount,
    precision: "validated",
  })
};

export class RebellionSkillFormula implements SkillFormulaAdapter {
  readonly id = "rebellion";

  supports(skill: { id: string }): boolean {
    return skill.id in formulas;
  }

  calculate(input: SkillFormulaInput): SkillFormulaResult {
    return formulas[input.skill.id](input);
  }
}
