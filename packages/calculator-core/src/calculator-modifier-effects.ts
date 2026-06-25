import { ItemModifierPipeline } from "./modifiers";
import type {
  ModifierClassId,
  ModifierElementId,
  ModifierRaceId,
  ModifierResolutionContext,
  ModifierSizeId,
} from "./modifiers";
import type { DamageType, ElementType, RoItem, RoMonster, RoSkill } from "./ro-types";

type BaseStat = "str" | "agi" | "vit" | "int" | "dex" | "luk";
type TraitStat = "pow" | "sta" | "wis" | "spl" | "con" | "crt";
type CharacterStat = BaseStat | TraitStat;

export type CalculatorModifierEffects = {
  statBonuses: Record<CharacterStat, number>;
  flatAtk: number;
  flatMatk: number;
  flatDefense: number;
  flatMagicDefense: number;
  weaponElement?: ElementType;
  pAtk: number;
  smatk: number;
  atkRate: number;
  shortAttackRate: number;
  longAttackRate: number;
  matkRate: number;
  maxHp: number;
  maxHpRate: number;
  maxSp: number;
  maxSpRate: number;
  maxAp: number;
  maxApRate: number;
  hit: number;
  flee: number;
  crit: number;
  criticalDamageRate: number;
  healPower: number;
  aspd: number;
  aspdRate: number;
  variableCastRate: number;
  fixedCastRate: number;
  fixedCast: number;
  afterCastDelayRate: number;
  skillVariableCastRate: Record<string, number>;
  skillFixedCastRate: Record<string, number>;
  skillFixedCast: Record<string, number>;
  raceDamageRate: Partial<Record<ModifierRaceId, number>>;
  elementDamageRate: Partial<Record<ModifierElementId, number>>;
  sizeDamageRate: Partial<Record<ModifierSizeId, number>>;
  skillDamageRate: Record<string, number>;
  magicRaceDamageRate: Partial<Record<ModifierRaceId, number>>;
  magicElementDamageRate: Partial<Record<ModifierElementId, number>>;
  magicSizeDamageRate: Partial<Record<ModifierSizeId, number>>;
  classDamageRate: Partial<Record<ModifierClassId, number>>;
  magicClassDamageRate: Partial<Record<ModifierClassId, number>>;
  magicElementAttackRate: Partial<Record<ModifierElementId, number>>;
  ignoreDefenseRate: Partial<Record<ModifierRaceId, number>>;
  ignoreMagicDefenseRate: Partial<Record<ModifierRaceId, number>>;
  incomingRaceDamageReductionRate: Partial<Record<ModifierRaceId, number>>;
  incomingElementDamageReductionRate: Partial<Record<ModifierElementId, number>>;
  incomingClassDamageReductionRate: Partial<Record<ModifierClassId, number>>;
  unsupportedStatements: string[];
};

export class CalculatorModifierEffectsFactory {
  constructor(private readonly pipeline = new ItemModifierPipeline()) { }

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
        pow: 0,
        sta: 0,
        wis: 0,
        spl: 0,
        con: 0,
        crt: 0,
      },
      flatAtk: 0,
      flatMatk: 0,
      flatDefense: 0,
      flatMagicDefense: 0,
      weaponElement: undefined,
      pAtk: 0,
      smatk: 0,
      atkRate: 0,
      shortAttackRate: 0,
      longAttackRate: 0,
      matkRate: 0,
      maxHp: 0,
      maxHpRate: 0,
      maxSp: 0,
      maxSpRate: 0,
      maxAp: 0,
      maxApRate: 0,
      hit: 0,
      flee: 0,
      crit: 0,
      criticalDamageRate: 0,
      healPower: 0,
      aspd: 0,
      aspdRate: 0,
      variableCastRate: 0,
      fixedCastRate: 0,
      fixedCast: 0,
      afterCastDelayRate: 0,
      skillVariableCastRate: {},
      skillFixedCastRate: {},
      skillFixedCast: {},
      raceDamageRate: {},
      elementDamageRate: {},
      sizeDamageRate: {},
      skillDamageRate: {},
      magicRaceDamageRate: {},
      magicElementDamageRate: {},
      magicSizeDamageRate: {},
      classDamageRate: {},
      magicClassDamageRate: {},
      magicElementAttackRate: {},
      ignoreDefenseRate: {},
      ignoreMagicDefenseRate: {},
      incomingRaceDamageReductionRate: {},
      incomingElementDamageReductionRate: {},
      incomingClassDamageReductionRate: {},
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
        if (bucket.target.type === "self" && isCharacterStat(bucket.stat)) {
          const stat = bucket.stat as CharacterStat;
          effects.statBonuses[stat] += bucket.value;
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

        if (bucket.stat === "defense" && bucket.target.type === "self") {
          effects.flatDefense += bucket.value;
          continue;
        }

        if (bucket.stat === "magicDefense" && bucket.target.type === "self") {
          effects.flatMagicDefense += bucket.value;
          continue;
        }

        if (
          bucket.stat === "weaponElement" &&
          bucket.target.type === "element" &&
          bucket.target.elementId !== "all"
        ) {
          effects.weaponElement = bucket.target.elementId;
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

        if (
          bucket.stat === "shortAttackRate" &&
          bucket.target.type === "self"
        ) {
          effects.shortAttackRate += bucket.value;
          continue;
        }

        if (
          bucket.stat === "longAttackRate" &&
          bucket.target.type === "self"
        ) {
          effects.longAttackRate += bucket.value;
          continue;
        }

        if (bucket.stat === "matkRate" && bucket.target.type === "self") {
          effects.matkRate += bucket.value;
          continue;
        }

        if (bucket.stat === "maxHp" && bucket.target.type === "self") {
          effects.maxHp += bucket.value;
          continue;
        }

        if (bucket.stat === "maxHpRate" && bucket.target.type === "self") {
          effects.maxHpRate += bucket.value;
          continue;
        }

        if (bucket.stat === "maxSp" && bucket.target.type === "self") {
          effects.maxSp += bucket.value;
          continue;
        }

        if (bucket.stat === "maxSpRate" && bucket.target.type === "self") {
          effects.maxSpRate += bucket.value;
          continue;
        }

        if (bucket.stat === "maxAp" && bucket.target.type === "self") {
          effects.maxAp += bucket.value;
          continue;
        }

        if (bucket.stat === "maxApRate" && bucket.target.type === "self") {
          effects.maxApRate += bucket.value;
          continue;
        }

        if (bucket.stat === "hit" && bucket.target.type === "self") {
          effects.hit += bucket.value;
          continue;
        }

        if (bucket.stat === "flee" && bucket.target.type === "self") {
          effects.flee += bucket.value;
          continue;
        }

        if (bucket.stat === "crit" && bucket.target.type === "self") {
          effects.crit += bucket.value;
          continue;
        }

        if (
          bucket.stat === "criticalDamageRate" &&
          bucket.target.type === "self"
        ) {
          effects.criticalDamageRate += bucket.value;
          continue;
        }

        if (bucket.stat === "healPower" && bucket.target.type === "self") {
          effects.healPower += bucket.value;
          continue;
        }

        if (bucket.stat === "aspd" && bucket.target.type === "self") {
          effects.aspd += bucket.value;
          continue;
        }

        if (bucket.stat === "aspdRate" && bucket.target.type === "self") {
          effects.aspdRate += bucket.value;
          continue;
        }

        if (
          bucket.stat === "variableCastRate" &&
          bucket.target.type === "self"
        ) {
          effects.variableCastRate += bucket.value;
          continue;
        }

        if (bucket.stat === "fixedCastRate" && bucket.target.type === "self") {
          effects.fixedCastRate += bucket.value;
          continue;
        }

        if (bucket.stat === "fixedCast" && bucket.target.type === "self") {
          effects.fixedCast += bucket.value;
          continue;
        }

        if (
          bucket.stat === "afterCastDelayRate" &&
          bucket.target.type === "self"
        ) {
          effects.afterCastDelayRate += bucket.value;
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
          bucket.stat === "skillVariableCastRate" &&
          bucket.target.type === "skill"
        ) {
          const current =
            effects.skillVariableCastRate[bucket.target.skillId] ?? 0;
          effects.skillVariableCastRate[bucket.target.skillId] =
            current + bucket.value;
          continue;
        }

        if (
          bucket.stat === "skillFixedCastRate" &&
          bucket.target.type === "skill"
        ) {
          const current = effects.skillFixedCastRate[bucket.target.skillId] ?? 0;
          effects.skillFixedCastRate[bucket.target.skillId] =
            current + bucket.value;
          continue;
        }

        if (bucket.stat === "skillFixedCast" && bucket.target.type === "skill") {
          const current = effects.skillFixedCast[bucket.target.skillId] ?? 0;
          effects.skillFixedCast[bucket.target.skillId] =
            current + bucket.value;
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

        if (bucket.stat === "classDamageRate" && bucket.target.type === "class") {
          const current = effects.classDamageRate[bucket.target.classId] ?? 0;
          effects.classDamageRate[bucket.target.classId] = current + bucket.value;
          continue;
        }

        if (
          bucket.stat === "magicClassDamageRate" &&
          bucket.target.type === "class"
        ) {
          const current =
            effects.magicClassDamageRate[bucket.target.classId] ?? 0;
          effects.magicClassDamageRate[bucket.target.classId] =
            current + bucket.value;
          continue;
        }

        if (
          bucket.stat === "incomingRaceDamageReductionRate" &&
          bucket.target.type === "race"
        ) {
          const current =
            effects.incomingRaceDamageReductionRate[bucket.target.raceId] ?? 0;
          effects.incomingRaceDamageReductionRate[bucket.target.raceId] =
            current + bucket.value;
          continue;
        }

        if (
          bucket.stat === "incomingClassDamageReductionRate" &&
          bucket.target.type === "class"
        ) {
          const current =
            effects.incomingClassDamageReductionRate[bucket.target.classId] ?? 0;
          effects.incomingClassDamageReductionRate[bucket.target.classId] =
            current + bucket.value;
          continue;
        }

        if (
          bucket.stat === "incomingElementDamageReductionRate" &&
          bucket.target.type === "element"
        ) {
          const current =
            effects.incomingElementDamageReductionRate[
              bucket.target.elementId
            ] ?? 0;
          effects.incomingElementDamageReductionRate[
            bucket.target.elementId
          ] = current + bucket.value;
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
          continue;
        }

        if (
          bucket.stat === "ignoreDefenseRate" &&
          bucket.target.type === "race"
        ) {
          const current =
            effects.ignoreDefenseRate[bucket.target.raceId] ?? 0;
          effects.ignoreDefenseRate[bucket.target.raceId] =
            current + bucket.value;
          continue;
        }

        if (
          bucket.stat === "ignoreMagicDefenseRate" &&
          bucket.target.type === "race"
        ) {
          const current =
            effects.ignoreMagicDefenseRate[bucket.target.raceId] ?? 0;
          effects.ignoreMagicDefenseRate[bucket.target.raceId] =
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
        this.getTargetedRate(effects.magicClassDamageRate, monster.classType) +
        this.getTargetedRate(effects.magicElementAttackRate, skill.element)
      );
    }

    return (
      effects.atkRate +
      this.getPhysicalRangeRate(effects, skill) +
      effects.pAtk +
      skillRate +
      this.getTargetedRate(effects.raceDamageRate, monster.race) +
      this.getTargetedRate(effects.elementDamageRate, monster.element) +
      this.getTargetedRate(effects.sizeDamageRate, monster.size) +
      this.getTargetedRate(effects.classDamageRate, monster.classType)
    );
  }

  private getTargetedRate<TTarget extends string>(
    rates: Partial<Record<TTarget | "all", number>>,
    target: TTarget | undefined,
  ) {
    return (target ? rates[target] ?? 0 : 0) + (rates.all ?? 0);
  }

  private getPhysicalRangeRate(effects: CalculatorModifierEffects, skill: RoSkill) {
    return isLongRangePhysicalSkill(skill)
      ? effects.longAttackRate
      : effects.shortAttackRate;
  }
}

const baseStats: BaseStat[] = ["str", "agi", "vit", "int", "dex", "luk"];
const traitStats: TraitStat[] = ["pow", "sta", "wis", "spl", "con", "crt"];
const characterStats: CharacterStat[] = [...baseStats, ...traitStats];

function isCharacterStat(stat: string): stat is CharacterStat {
  return characterStats.includes(stat as CharacterStat);
}

function isLongRangePhysicalSkill(skill: RoSkill) {
  if (skill.damageType !== "physical") {
    return false;
  }

  return Math.abs(skill.attackRange ?? 1) > 3;
}
