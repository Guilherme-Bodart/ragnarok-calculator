import type { CalculatorModifierEffects } from "./calculator-modifier-effects";
import type { EffectiveCharacter } from "./effective-character";
import type { Bonus, DamageType, ElementType, RoItem, RoMonster, RoSkill } from "./ro-types";

export type DamageBreakdownGroup =
  | "character"
  | "item"
  | "skill"
  | "modifier"
  | "target"
  | "result";

export type DamageBreakdownLine = {
  key: string;
  label: string;
  value: number;
  group: DamageBreakdownGroup;
  unit?: "flat" | "percent" | "multiplier" | "count";
};

export type DamageFormulaInput = {
  character: EffectiveCharacter;
  items: RoItem[];
  modifierEffects: CalculatorModifierEffects;
  monster: RoMonster;
  skill: RoSkill;
  skillLevel: number;
};

export type DamageFormulaResult = {
  damage: {
    minimum: number;
    average: number;
    maximum: number;
    total: number;
  };
  breakdown: DamageBreakdownLine[];
};

type DamageFormulaContext = {
  basePower: number;
  equipmentPower: number;
  modifierFlatPower: number;
  skillMultiplier: number;
  legacyBonusRate: number;
  traitFinalRate: number;
  modifierFinalRate: number;
  finalRateMultiplier: number;
  elementMultiplier: number;
  defenseMultiplier: number;
  preDefenseDamage: number;
  singleHitDamage: number;
};

export class DamageFormulaPipeline {
  calculate(input: DamageFormulaInput): DamageFormulaResult {
    const context = this.createContext(input);
    const average = Math.max(1, context.singleHitDamage);
    const minimum = Math.max(1, Math.floor(average * 0.95));
    const maximum = Math.max(1, Math.floor(average * 1.05));
    const total = average * input.skill.hitCount;

    return {
      damage: {
        minimum,
        average,
        maximum,
        total,
      },
      breakdown: this.createBreakdown(input, context),
    };
  }

  private createContext(input: DamageFormulaInput): DamageFormulaContext {
    const basePower = this.getBasePower(input.character, input.skill.damageType);
    const equipmentPower = this.sumEquipmentPower(input.items, input.skill.damageType);
    const modifierFlatPower = this.getModifierFlatPower(
      input.modifierEffects,
      input.skill.damageType,
    );
    const skillMultiplier = this.getSkillMultiplier(input.skill, input.skillLevel);
    const legacyBonusRate = this.getLegacyBonusRate(
      input.items,
      input.skill,
      input.monster,
    );
    const traitFinalRate = this.getTraitFinalRate(
      input.character,
      input.skill.damageType,
    );
    const modifierFinalRate = this.getModifierFinalRate(
      input.modifierEffects,
      input.skill.damageType,
      input.monster,
      input.skill,
    );
    const finalRateMultiplier =
      1 + (legacyBonusRate + traitFinalRate + modifierFinalRate) / 100;
    const elementMultiplier = this.getElementMultiplier(input.skill, input.monster);
    const defenseMultiplier = this.getDefenseMultiplier(
      input.monster,
      input.skill.damageType,
    );
    const preDefenseDamage = Math.floor(
      (basePower + equipmentPower + modifierFlatPower) *
        skillMultiplier *
        finalRateMultiplier *
        elementMultiplier,
    );
    const singleHitDamage = Math.floor(preDefenseDamage * defenseMultiplier);

    return {
      basePower,
      equipmentPower,
      modifierFlatPower,
      skillMultiplier,
      legacyBonusRate,
      traitFinalRate,
      modifierFinalRate,
      finalRateMultiplier,
      elementMultiplier,
      defenseMultiplier,
      preDefenseDamage,
      singleHitDamage,
    };
  }

  private createBreakdown(
    input: DamageFormulaInput,
    context: DamageFormulaContext,
  ): DamageBreakdownLine[] {
    return [
      {
        key: "basePower",
        label: "Base power",
        value: context.basePower,
        group: "character",
        unit: "flat",
      },
      {
        key: "equipmentPower",
        label: "Equipment power",
        value: context.equipmentPower,
        group: "item",
        unit: "flat",
      },
      {
        key: "modifierFlatPower",
        label: "Modifier flat power",
        value: context.modifierFlatPower,
        group: "modifier",
        unit: "flat",
      },
      {
        key: "skillMultiplier",
        label: "Skill multiplier",
        value: context.skillMultiplier,
        group: "skill",
        unit: "multiplier",
      },
      {
        key: "legacyBonusRate",
        label: "Legacy item bonus rate",
        value: context.legacyBonusRate,
        group: "item",
        unit: "percent",
      },
      {
        key: "traitFinalRate",
        label: "Trait final rate",
        value: context.traitFinalRate,
        group: "character",
        unit: "percent",
      },
      {
        key: "modifierFinalRate",
        label: "Modifier final rate",
        value: context.modifierFinalRate,
        group: "modifier",
        unit: "percent",
      },
      {
        key: "finalRateMultiplier",
        label: "Final rate multiplier",
        value: context.finalRateMultiplier,
        group: "modifier",
        unit: "multiplier",
      },
      {
        key: "elementMultiplier",
        label: "Element multiplier",
        value: context.elementMultiplier,
        group: "target",
        unit: "multiplier",
      },
      {
        key: "defenseMultiplier",
        label: "Defense multiplier",
        value: context.defenseMultiplier,
        group: "target",
        unit: "multiplier",
      },
      {
        key: "preDefenseDamage",
        label: "Pre-defense damage",
        value: context.preDefenseDamage,
        group: "result",
        unit: "flat",
      },
      {
        key: "singleHitDamage",
        label: "Single hit damage",
        value: context.singleHitDamage,
        group: "result",
        unit: "flat",
      },
      {
        key: "hits",
        label: "Hits",
        value: input.skill.hitCount,
        group: "skill",
        unit: "count",
      },
      {
        key: "unsupportedModifierStatements",
        label: "Unsupported modifier statements",
        value: input.modifierEffects.unsupportedStatements.length,
        group: "modifier",
        unit: "count",
      },
    ];
  }

  private getBasePower(character: EffectiveCharacter, damageType: DamageType) {
    if (damageType === "magical") {
      return Math.floor(
        character.baseLevel +
          character.damageStats.int * 2 +
          character.damageStats.dex / 5 +
          character.traitEffects.statusMatk,
      );
    }

    return Math.floor(
      character.baseLevel +
        character.damageStats.str * 2 +
        character.damageStats.dex / 5 +
        character.traitEffects.statusAtk,
    );
  }

  private sumEquipmentPower(items: RoItem[], damageType: DamageType) {
    return items.reduce((total, item) => {
      const itemPower = damageType === "magical" ? item.magicAttack ?? 0 : item.attack ?? 0;
      const bonusPower = item.bonuses.reduce((bonusTotal, bonus) => {
        if (bonus.type === "flatAtk" && damageType === "physical") {
          return bonusTotal + bonus.value;
        }

        if (bonus.type === "flatMatk" && damageType === "magical") {
          return bonusTotal + bonus.value;
        }

        return bonusTotal;
      }, 0);

      return total + itemPower + bonusPower;
    }, 0);
  }

  private getModifierFlatPower(
    effects: CalculatorModifierEffects,
    damageType: DamageType,
  ) {
    return damageType === "physical" ? effects.flatAtk : effects.flatMatk;
  }

  private getSkillMultiplier(skill: RoSkill, level: number) {
    return (skill.baseMultiplierByLevel[String(level)] ?? 100) / 100;
  }

  private getLegacyBonusRate(items: RoItem[], skill: RoSkill, monster: RoMonster) {
    return items
      .flatMap((item) => item.bonuses)
      .reduce(
        (total, bonus) => total + this.getApplicableLegacyBonusRate(bonus, skill, monster),
        0,
      );
  }

  private getApplicableLegacyBonusRate(
    bonus: Bonus,
    skill: RoSkill,
    monster: RoMonster,
  ) {
    if (bonus.type === "atkRate" && skill.damageType === "physical") return bonus.value;
    if (bonus.type === "matkRate" && skill.damageType === "magical") return bonus.value;
    if (bonus.type === "skillDamage" && bonus.skillId === skill.id) return bonus.value;
    if (bonus.type === "raceDamage" && bonus.race === monster.race) return bonus.value;
    if (bonus.type === "elementDamage" && bonus.element === monster.element) return bonus.value;
    if (bonus.type === "sizeDamage" && bonus.size === monster.size) return bonus.value;

    return 0;
  }

  private getTraitFinalRate(character: EffectiveCharacter, damageType: DamageType) {
    return damageType === "physical"
      ? character.traitEffects.pAtk
      : character.traitEffects.smatk;
  }

  private getModifierFinalRate(
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

  private getElementMultiplier(skill: RoSkill, monster: RoMonster) {
    const attackElement = skill.element ?? "neutral";
    const attackRates = elementRateTable[attackElement] ?? {};
    return (attackRates[monster.element] ?? 100) / 100;
  }

  private getDefenseMultiplier(monster: RoMonster, damageType: DamageType) {
    const defense = damageType === "magical" ? monster.magicDefense : monster.defense;
    return Math.max(0.1, 1 - defense / (defense + 400));
  }

  private getTargetedRate<TTarget extends string>(
    rates: Partial<Record<TTarget | "all", number>>,
    target: TTarget | undefined,
  ) {
    return (target ? rates[target] ?? 0 : 0) + (rates.all ?? 0);
  }
}

const elementRateTable: Partial<Record<ElementType, Partial<Record<ElementType, number>>>> = {
  neutral: {
    neutral: 100,
    water: 100,
    earth: 100,
    fire: 100,
    wind: 100,
    poison: 100,
    holy: 100,
    dark: 100,
    ghost: 25,
    undead: 100,
  },
  water: {
    neutral: 100,
    water: 25,
    earth: 100,
    fire: 150,
    wind: 50,
    poison: 100,
    holy: 100,
    dark: 100,
    ghost: 100,
    undead: 100,
  },
  earth: {
    neutral: 100,
    water: 100,
    earth: 25,
    fire: 50,
    wind: 150,
    poison: 100,
    holy: 100,
    dark: 100,
    ghost: 100,
    undead: 100,
  },
  fire: {
    neutral: 100,
    water: 50,
    earth: 150,
    fire: 25,
    wind: 100,
    poison: 100,
    holy: 100,
    dark: 100,
    ghost: 100,
    undead: 125,
  },
  wind: {
    neutral: 100,
    water: 150,
    earth: 50,
    fire: 100,
    wind: 25,
    poison: 100,
    holy: 100,
    dark: 100,
    ghost: 100,
    undead: 100,
  },
  ghost: {
    neutral: 25,
    water: 100,
    earth: 100,
    fire: 100,
    wind: 100,
    poison: 100,
    holy: 100,
    dark: 100,
    ghost: 125,
    undead: 100,
  },
};
