import { ItemModifierPipeline } from "./modifiers";
import type {
  ModifierElementId,
  ModifierRaceId,
  ModifierResolutionContext,
  ModifierSizeId,
} from "./modifiers";
import type { DamageType, RoItem, RoMonster, RoSkill } from "./ro-types";

type BaseStat = "str" | "agi" | "vit" | "int" | "dex" | "luk";

export type CalculatorModifierEffects = {
  statBonuses: Record<BaseStat, number>;
  flatAtk: number;
  flatMatk: number;
  pAtk: number;
  smatk: number;
  atkRate: number;
  matkRate: number;
  raceDamageRate: Partial<Record<ModifierRaceId, number>>;
  elementDamageRate: Partial<Record<ModifierElementId, number>>;
  sizeDamageRate: Partial<Record<ModifierSizeId, number>>;
  skillDamageRate: Record<string, number>;
  magicRaceDamageRate: Partial<Record<ModifierRaceId, number>>;
  magicElementDamageRate: Partial<Record<ModifierElementId, number>>;
  magicSizeDamageRate: Partial<Record<ModifierSizeId, number>>;
  magicElementAttackRate: Partial<Record<ModifierElementId, number>>;
  unsupportedStatements: string[];
};

export class CalculatorModifierEffectsFactory {
  constructor(private readonly pipeline = new ItemModifierPipeline()) {}

  fromItems(
    items: RoItem[],
    contextByItemId: ReadonlyMap<number, ModifierResolutionContext> = new Map(),
    baseContext: ModifierResolutionContext = {},
  ): CalculatorModifierEffects {
    const effects: CalculatorModifierEffects = {
      statBonuses: {
        str: 0,
        agi: 0,
        vit: 0,
        int: 0,
        dex: 0,
        luk: 0,
      },
      flatAtk: 0,
      flatMatk: 0,
      pAtk: 0,
      smatk: 0,
      atkRate: 0,
      matkRate: 0,
      raceDamageRate: {},
      elementDamageRate: {},
      sizeDamageRate: {},
      skillDamageRate: {},
      magicRaceDamageRate: {},
      magicElementDamageRate: {},
      magicSizeDamageRate: {},
      magicElementAttackRate: {},
      unsupportedStatements: [],
    };

    for (const item of items) {
      const result = this.pipeline.getEffects(
        {
          rawScript: item.rawScript,
          modifiers: item.modifiers,
        },
        {
          ...baseContext,
          ...(contextByItemId.get(item.id) ?? {}),
        },
      );

      effects.unsupportedStatements.push(...result.unsupportedStatements);

      for (const bucket of result.aggregation.buckets) {
        if (bucket.target.type === "self" && isBaseStat(bucket.stat)) {
          effects.statBonuses[bucket.stat] += bucket.value;
          continue;
        }

        if (bucket.stat === "allStats" && bucket.target.type === "self") {
          for (const stat of baseStats) {
            effects.statBonuses[stat] += bucket.value;
          }

          continue;
        }

        if (
          (bucket.stat === "baseAtk" || bucket.stat === "atk") &&
          bucket.target.type === "self"
        ) {
          effects.flatAtk += bucket.value;
          continue;
        }

        if (bucket.stat === "matk" && bucket.target.type === "self") {
          effects.flatMatk += bucket.value;
          continue;
        }

        if (bucket.stat === "pAtk" && bucket.target.type === "self") {
          effects.pAtk += bucket.value;
          continue;
        }

        if (bucket.stat === "smatk" && bucket.target.type === "self") {
          effects.smatk += bucket.value;
          continue;
        }

        if (bucket.stat === "atkRate" && bucket.target.type === "self") {
          effects.atkRate += bucket.value;
          continue;
        }

        if (bucket.stat === "matkRate" && bucket.target.type === "self") {
          effects.matkRate += bucket.value;
          continue;
        }

        if (bucket.stat === "raceDamageRate" && bucket.target.type === "race") {
          const current = effects.raceDamageRate[bucket.target.raceId] ?? 0;
          effects.raceDamageRate[bucket.target.raceId] = current + bucket.value;
          continue;
        }

        if (
          bucket.stat === "elementDamageRate" &&
          bucket.target.type === "element"
        ) {
          const current =
            effects.elementDamageRate[bucket.target.elementId] ?? 0;
          effects.elementDamageRate[bucket.target.elementId] =
            current + bucket.value;
          continue;
        }

        if (bucket.stat === "sizeDamageRate" && bucket.target.type === "size") {
          const current = effects.sizeDamageRate[bucket.target.sizeId] ?? 0;
          effects.sizeDamageRate[bucket.target.sizeId] = current + bucket.value;
          continue;
        }

        if (bucket.stat === "skillDamageRate" && bucket.target.type === "skill") {
          const current = effects.skillDamageRate[bucket.target.skillId] ?? 0;
          effects.skillDamageRate[bucket.target.skillId] = current + bucket.value;
          continue;
        }

        if (
          bucket.stat === "magicRaceDamageRate" &&
          bucket.target.type === "race"
        ) {
          const current =
            effects.magicRaceDamageRate[bucket.target.raceId] ?? 0;
          effects.magicRaceDamageRate[bucket.target.raceId] =
            current + bucket.value;
          continue;
        }

        if (
          bucket.stat === "magicElementDamageRate" &&
          bucket.target.type === "element"
        ) {
          const current =
            effects.magicElementDamageRate[bucket.target.elementId] ?? 0;
          effects.magicElementDamageRate[bucket.target.elementId] =
            current + bucket.value;
          continue;
        }

        if (
          bucket.stat === "magicSizeDamageRate" &&
          bucket.target.type === "size"
        ) {
          const current =
            effects.magicSizeDamageRate[bucket.target.sizeId] ?? 0;
          effects.magicSizeDamageRate[bucket.target.sizeId] =
            current + bucket.value;
          continue;
        }

        if (
          bucket.stat === "magicElementAttackRate" &&
          bucket.target.type === "element"
        ) {
          const current =
            effects.magicElementAttackRate[bucket.target.elementId] ?? 0;
          effects.magicElementAttackRate[bucket.target.elementId] =
            current + bucket.value;
        }
      }
    }

    return effects;
  }

  getFlatPower(effects: CalculatorModifierEffects, damageType: DamageType) {
    if (damageType === "physical") {
      return effects.flatAtk;
    }

    return effects.flatMatk;
  }

  getPercentPower(
    effects: CalculatorModifierEffects,
    damageType: DamageType,
    monster: RoMonster,
    skill: RoSkill,
  ) {
    const skillRate = effects.skillDamageRate[skill.id] ?? 0;

    if (damageType === "magical") {
      return (
        effects.matkRate +
        effects.smatk +
        skillRate +
        this.getTargetedRate(effects.magicRaceDamageRate, monster.race) +
        this.getTargetedRate(effects.magicElementDamageRate, monster.element) +
        this.getTargetedRate(effects.magicSizeDamageRate, monster.size) +
        this.getTargetedRate(effects.magicElementAttackRate, skill.element)
      );
    }

    return (
      effects.atkRate +
      effects.pAtk +
      skillRate +
      this.getTargetedRate(effects.raceDamageRate, monster.race) +
      this.getTargetedRate(effects.elementDamageRate, monster.element) +
      this.getTargetedRate(effects.sizeDamageRate, monster.size)
    );
  }

  private getTargetedRate<TTarget extends string>(
    rates: Partial<Record<TTarget | "all", number>>,
    target: TTarget | undefined,
  ) {
    return (target ? rates[target] ?? 0 : 0) + (rates.all ?? 0);
  }
}

const baseStats: BaseStat[] = ["str", "agi", "vit", "int", "dex", "luk"];

function isBaseStat(stat: string): stat is BaseStat {
  return baseStats.includes(stat as BaseStat);
}
