import {
  CalculatorTraitEffectsFactory,
  type CalculatorTraitEffects,
} from "./calculator-trait-effects";
import type { CalculatorModifierEffects } from "./calculator-modifier-effects";
import { JobBasepointsFactory, type JobBasepoints } from "./job-basepoints";
import {
  JobStatBonusFactory,
  emptyStatBonus,
  type StatBonus,
} from "./job-stats";
import type { CalculatorCharacter, CharacterStats, RoItem } from "./ro-types";

export type BaseStat = "str" | "agi" | "vit" | "int" | "dex" | "luk";

export type CharacterStatus = {
  baseLevel: number;
  jobLevel: number;
  classId?: string;
  baseStats: StatBonus;
  jobStatBonuses: StatBonus;
  itemStatBonuses: Pick<StatBonus, BaseStat>;
  effectiveStats: StatBonus;
  damageStats: Pick<StatBonus, BaseStat>;
  jobBasepoints: JobBasepoints;
  maxHp: number;
  maxSp: number;
  maxAp: number;
  statusAtk: number;
  statusMatk: number;
  atk: number;
  matk: number;
  hit: number;
  flee: number;
  crit: number;
  traitEffects: CalculatorTraitEffects;
};

export type CharacterStatusEngineInput = {
  character: CalculatorCharacter;
  items?: RoItem[];
  modifierEffects?: CalculatorModifierEffects;
  itemStatBonuses?: Partial<Record<BaseStat, number>>;
};

export class CharacterStatusEngine {
  constructor(
    private readonly jobStatBonusFactory = new JobStatBonusFactory(),
    private readonly jobBasepointsFactory = new JobBasepointsFactory(),
    private readonly traitEffectsFactory = new CalculatorTraitEffectsFactory(),
  ) {}

  calculate(input: CharacterStatusEngineInput): CharacterStatus {
    const baseStats = this.toStatBonus(input.character.stats);
    const jobStatBonuses = this.jobStatBonusFactory.fromClassAndJobLevel(
      input.character.classId,
      input.character.jobLevel,
    );
    const itemStatBonuses = this.toBaseStatBonuses(
      input.itemStatBonuses ?? input.modifierEffects?.statBonuses,
    );
    const effectiveStats = addStatBonuses(
      addStatBonuses(baseStats, jobStatBonuses),
      this.baseStatsToStatBonus(itemStatBonuses),
    );
    const traitEffects = this.traitEffectsFactory.fromStats(effectiveStats);
    const jobBasepoints = this.jobBasepointsFactory.fromClassAndBaseLevel(
      input.character.classId,
      input.character.baseLevel,
    );
    const statusAtk = Math.floor(
      input.character.baseLevel +
        effectiveStats.str * 2 +
        effectiveStats.dex / 5 +
        traitEffects.statusAtk,
    );
    const statusMatk = Math.floor(
      input.character.baseLevel +
        effectiveStats.int * 2 +
        effectiveStats.dex / 5 +
        traitEffects.statusMatk,
    );
    const equipmentAtk = this.sumEquipmentPower(input.items ?? [], "attack");
    const equipmentMatk = this.sumEquipmentPower(input.items ?? [], "magicAttack");
    const flatAtk = input.modifierEffects?.flatAtk ?? 0;
    const flatMatk = input.modifierEffects?.flatMatk ?? 0;

    return {
      baseLevel: input.character.baseLevel,
      jobLevel: input.character.jobLevel,
      classId: input.character.classId,
      baseStats,
      jobStatBonuses,
      itemStatBonuses,
      effectiveStats,
      damageStats: {
        str: effectiveStats.str,
        agi: effectiveStats.agi,
        vit: effectiveStats.vit,
        int: effectiveStats.int,
        dex: effectiveStats.dex,
        luk: effectiveStats.luk,
      },
      jobBasepoints,
      maxHp: this.calculateMaxHp(jobBasepoints.baseHp, effectiveStats.vit),
      maxSp: this.calculateMaxSp(jobBasepoints.baseSp, effectiveStats.int),
      maxAp: jobBasepoints.baseAp,
      statusAtk,
      statusMatk,
      atk: statusAtk + equipmentAtk + flatAtk,
      matk: statusMatk + equipmentMatk + flatMatk,
      hit: Math.floor(
        input.character.baseLevel +
          effectiveStats.dex +
          effectiveStats.luk / 3 +
          effectiveStats.con,
      ),
      flee: Math.floor(
        input.character.baseLevel +
          effectiveStats.agi +
          effectiveStats.luk / 5 +
          effectiveStats.con * 2,
      ),
      crit: Math.floor(effectiveStats.luk / 3 + traitEffects.criticalDamageRate),
      traitEffects,
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

  private toBaseStatBonuses(
    bonuses: Partial<Record<BaseStat, number>> | undefined,
  ): Pick<StatBonus, BaseStat> {
    return {
      str: bonuses?.str ?? 0,
      agi: bonuses?.agi ?? 0,
      vit: bonuses?.vit ?? 0,
      int: bonuses?.int ?? 0,
      dex: bonuses?.dex ?? 0,
      luk: bonuses?.luk ?? 0,
    };
  }

  private baseStatsToStatBonus(stats: Pick<StatBonus, BaseStat>): StatBonus {
    return {
      ...emptyStatBonus,
      ...stats,
    };
  }

  private sumEquipmentPower(items: RoItem[], stat: "attack" | "magicAttack") {
    return items.reduce((total, item) => {
      const itemPower = item[stat] ?? 0;
      const bonusPower = item.bonuses.reduce((bonusTotal, bonus) => {
        if (bonus.type === "flatAtk" && stat === "attack") {
          return bonusTotal + bonus.value;
        }

        if (bonus.type === "flatMatk" && stat === "magicAttack") {
          return bonusTotal + bonus.value;
        }

        return bonusTotal;
      }, 0);

      return total + itemPower + bonusPower;
    }, 0);
  }

  private calculateMaxHp(baseHp: number, vit: number) {
    return baseHp > 0 ? Math.floor(baseHp * (1 + vit / 100)) : 0;
  }

  private calculateMaxSp(baseSp: number, int: number) {
    return baseSp > 0 ? Math.floor(baseSp * (1 + int / 100)) : 0;
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
