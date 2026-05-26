import { CalculatorTraitEffectsFactory, type CalculatorTraitEffects } from "./calculator-trait-effects";
import { JobStatBonusFactory, type StatBonus } from "./job-stats";
import type { CalculatorCharacter, CharacterStats } from "./ro-types";

type BaseStat = "str" | "agi" | "vit" | "int" | "dex" | "luk";

export type EffectiveCharacter = {
  baseLevel: number;
  jobLevel: number;
  classId?: string;
  baseStats: StatBonus;
  jobStatBonuses: StatBonus;
  effectiveStats: StatBonus;
  damageStats: Pick<StatBonus, BaseStat>;
  traitEffects: CalculatorTraitEffects;
};

export class EffectiveCharacterBuilder {
  constructor(
    private readonly jobStatBonusFactory = new JobStatBonusFactory(),
    private readonly traitEffectsFactory = new CalculatorTraitEffectsFactory(),
  ) {}

  build(
    character: CalculatorCharacter,
    itemStatBonuses: Record<BaseStat, number>,
  ): EffectiveCharacter {
    const baseStats = this.toStatBonus(character.stats);
    const jobStatBonuses = this.jobStatBonusFactory.fromClassAndJobLevel(
      character.classId,
      character.jobLevel,
    );
    const effectiveStats = addStatBonuses(baseStats, jobStatBonuses);

    return {
      baseLevel: character.baseLevel,
      jobLevel: character.jobLevel,
      classId: character.classId,
      baseStats,
      jobStatBonuses,
      effectiveStats,
      damageStats: {
        str: effectiveStats.str + itemStatBonuses.str,
        agi: effectiveStats.agi + itemStatBonuses.agi,
        vit: effectiveStats.vit + itemStatBonuses.vit,
        int: effectiveStats.int + itemStatBonuses.int,
        dex: effectiveStats.dex + itemStatBonuses.dex,
        luk: effectiveStats.luk + itemStatBonuses.luk,
      },
      traitEffects: this.traitEffectsFactory.fromStats(effectiveStats),
    };
  }

  private toStatBonus(stats: CharacterStats): StatBonus {
    return {
      str: stats.str,
      agi: stats.agi,
      vit: stats.vit,
      int: stats.int,
      dex: stats.dex,
      luk: stats.luk,
      pow: stats.pow,
      sta: stats.sta,
      wis: stats.wis,
      spl: stats.spl,
      con: stats.con,
      crt: stats.crt,
    };
  }
}

function addStatBonuses(left: StatBonus, right: StatBonus): StatBonus {
  return {
    str: left.str + right.str,
    agi: left.agi + right.agi,
    vit: left.vit + right.vit,
    int: left.int + right.int,
    dex: left.dex + right.dex,
    luk: left.luk + right.luk,
    pow: left.pow + right.pow,
    sta: left.sta + right.sta,
    wis: left.wis + right.wis,
    spl: left.spl + right.spl,
    con: left.con + right.con,
    crt: left.crt + right.crt,
  };
}
