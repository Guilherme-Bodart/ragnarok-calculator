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
  }),
  RL_H_MINE: (input) => ({
    formulaId: "static:RL_H_MINE",
    // C++: skillratio += -100 + 200 + 200 * skill_lv;
    multiplier: (200 + 200 * input.skillLevel) / 100,
    hitCount: input.skill.hitCountByLevel?.[String(input.skillLevel)] ?? input.skill.hitCount,
    precision: "validated",
  }),
  NW_BASIC_GRENADE: (input) => ({
    formulaId: "static:NW_BASIC_GRENADE",
    // C++: skillratio += -100 + 1500 + 2100 * skill_lv + pc_checkskill(sd, NW_GRENADE_MASTERY) * 50 + 5 * sstatus->con; RE_LVL_DMOD(100);
    multiplier:
      ((1500 +
        2100 * input.skillLevel +
        (input.character.learnedSkills?.["NW_GRENADE_MASTERY"] ?? 0) * 50 +
        5 * (input.character.effectiveStats.con ?? 0)) *
        input.character.baseLevel) /
      100 /
      100,
    hitCount: input.skill.hitCountByLevel?.[String(input.skillLevel)] ?? input.skill.hitCount,
    precision: "validated",
  }),
  NW_ONLY_ONE_BULLET: (input) => ({
    formulaId: "static:NW_ONLY_ONE_BULLET",
    // C++: skillratio += -100 + 1200 + 3000 * skill_lv + 5 * sstatus->con; RE_LVL_DMOD(100);
    multiplier:
      ((1200 +
        3000 * input.skillLevel +
        5 * (input.character.effectiveStats.con ?? 0)) *
        input.character.baseLevel) /
      100 /
      100,
    hitCount: input.skill.hitCountByLevel?.[String(input.skillLevel)] ?? input.skill.hitCount,
    precision: "validated",
  }),
  NW_SPIRAL_SHOOTING: (input) => ({
    formulaId: "static:NW_SPIRAL_SHOOTING",
    // C++: skillratio += -100 + 1200 + 1700 * skill_lv + 5 * sstatus->con; RE_LVL_DMOD(100);
    multiplier:
      ((1200 +
        1700 * input.skillLevel +
        5 * (input.character.effectiveStats.con ?? 0)) *
        input.character.baseLevel) /
      100 /
      100,
    hitCount: input.skill.hitCountByLevel?.[String(input.skillLevel)] ?? input.skill.hitCount,
    precision: "validated",
  }),
  NW_MAGAZINE_FOR_ONE: (input) => ({
    formulaId: "static:NW_MAGAZINE_FOR_ONE",
    // C++: skillratio += -100 + 250 + 500 * skill_lv + 5 * sstatus->con; RE_LVL_DMOD(100);
    multiplier:
      ((250 +
        500 * input.skillLevel +
        5 * (input.character.effectiveStats.con ?? 0)) *
        input.character.baseLevel) /
      100 /
      100,
    hitCount: input.skill.hitCountByLevel?.[String(input.skillLevel)] ?? input.skill.hitCount,
    precision: "validated",
  }),
  NW_WILD_FIRE: (input) => ({
    formulaId: "static:NW_WILD_FIRE",
    // C++: skillratio += -100 + 1500 + 3000 * skill_lv + 5 * sstatus->con; RE_LVL_DMOD(100);
    multiplier:
      ((1500 +
        3000 * input.skillLevel +
        5 * (input.character.effectiveStats.con ?? 0)) *
        input.character.baseLevel) /
      100 /
      100,
    hitCount: input.skill.hitCountByLevel?.[String(input.skillLevel)] ?? input.skill.hitCount,
    precision: "validated",
  }),
  NW_HASTY_FIRE_IN_THE_HOLE: (input) => ({
    formulaId: "static:NW_HASTY_FIRE_IN_THE_HOLE",
    // C++: skillratio += -100 + 1500 + 1500 * skill_lv + pc_checkskill(sd, NW_GRENADE_MASTERY) * 20 + 5 * sstatus->con; RE_LVL_DMOD(100);
    multiplier:
      ((1500 +
        1500 * input.skillLevel +
        (input.character.learnedSkills?.["NW_GRENADE_MASTERY"] ?? 0) * 20 +
        5 * (input.character.effectiveStats.con ?? 0)) *
        input.character.baseLevel) /
      100 /
      100,
    hitCount: input.skill.hitCountByLevel?.[String(input.skillLevel)] ?? input.skill.hitCount,
    precision: "validated",
  }),
  NW_GRENADES_DROPPING: (input) => ({
    formulaId: "static:NW_GRENADES_DROPPING",
    // C++: skillratio += -100 + 550 + 850 * skill_lv + pc_checkskill(sd, NW_GRENADE_MASTERY) * 30 + 5 * sstatus->con; RE_LVL_DMOD(100);
    multiplier:
      ((550 +
        850 * input.skillLevel +
        (input.character.learnedSkills?.["NW_GRENADE_MASTERY"] ?? 0) * 30 +
        5 * (input.character.effectiveStats.con ?? 0)) *
        input.character.baseLevel) /
      100 /
      100,
    hitCount: input.skill.hitCountByLevel?.[String(input.skillLevel)] ?? input.skill.hitCount,
    precision: "validated",
  }),
  NW_MISSION_BOMBARD: (input) => ({
    formulaId: "static:NW_MISSION_BOMBARD",
    // C++: skillratio += -100 + 800 + 200 * skill_lv + pc_checkskill(sd, NW_GRENADE_MASTERY) * 30 + 5 * sstatus->con; RE_LVL_DMOD(100);
    multiplier:
      ((800 +
        200 * input.skillLevel +
        (input.character.learnedSkills?.["NW_GRENADE_MASTERY"] ?? 0) * 30 +
        5 * (input.character.effectiveStats.con ?? 0)) *
        input.character.baseLevel) /
      100 /
      100,
    hitCount: input.skill.hitCountByLevel?.[String(input.skillLevel)] ?? input.skill.hitCount,
    precision: "validated",
  }),
  NW_WILD_SHOT: (input) => ({
    formulaId: "static:NW_WILD_SHOT",
    // C++: skillratio += -100 + 870 + 180 * skill_lv + 5 * sstatus->con; RE_LVL_DMOD(100);
    multiplier:
      ((870 +
        180 * input.skillLevel +
        5 * (input.character.effectiveStats.con ?? 0)) *
        input.character.baseLevel) /
      100 /
      100,
    hitCount: input.skill.hitCountByLevel?.[String(input.skillLevel)] ?? input.skill.hitCount,
    precision: "validated",
  }),
  NW_MIDNIGHT_FALLEN: (input) => ({
    formulaId: "static:NW_MIDNIGHT_FALLEN",
    // C++: skillratio += -100 + 2400 + 800 * skill_lv + 5 * sstatus->con; RE_LVL_DMOD(100);
    multiplier:
      ((2400 +
        800 * input.skillLevel +
        5 * (input.character.effectiveStats.con ?? 0)) *
        input.character.baseLevel) /
      100 /
      100,
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
