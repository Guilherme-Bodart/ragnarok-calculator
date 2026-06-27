import type { CalculatorModifierEffects } from "./calculator-modifier-effects";
import { CastTimingEngine, type CastTimingResult } from "./cast-timing";
import type { EffectiveCharacter } from "./effective-character";
import {
  getDefenseMultiplier,
  getAttackElement,
  getElementMultiplier,
  getMagicalBasePower,
  getMagicalLegacyBonusRate,
  getMagicalModifierFinalRate,
  getMagicalModifierFlatPower,
  getMagicalTraitFinalRate,
  getPhysicalBasePower,
  getPhysicalLegacyBonusRate,
  getPhysicalModifierFinalRate,
  getPhysicalModifierFlatPower,
  getPhysicalTraitFinalRate,
  getWeaponRefineAtk,
  getWeaponSizeMultiplier,
  sumMagicalEquipmentPower,
  sumPhysicalEquipmentPower,
} from "./formulas";
import { SkillFormulaRegistry } from "./skills";
import type { ElementType, RoItem, RoMonster, RoSkill } from "./ro-types";

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
  unit?: "flat" | "percent" | "multiplier" | "count" | "milliseconds" | "dps";
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
  formulaId: string;
  castTiming: CastTimingResult;
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
  formulaId: string;
  weaponRefinePower: number;
  weaponSizeMultiplier: number;
  attackElement: ElementType;
  elementMultiplier: number;
  elementResistanceRate: number;
  defenseIgnoreRate: number;
  defenseMultiplier: number;
  softDefReduction: number;
  preDefenseDamage: number;
  postDefenseDamage: number;
  singleHitDamage: number;
  hitCount: number;
  castTiming: CastTimingResult;
  dps: number;
};

export class DamageFormulaPipeline {
  constructor(
    private readonly skillFormulaRegistry = new SkillFormulaRegistry(),
    private readonly castTimingEngine = new CastTimingEngine(),
  ) {}

  calculate(input: DamageFormulaInput): DamageFormulaResult {
    const context = this.createContext(input);
    const average = Math.max(1, context.singleHitDamage);
    const minimum = Math.max(1, Math.floor(average * 0.95));
    const maximum = Math.max(1, Math.floor(average * 1.05));
    const total = average * context.hitCount;

    return {
      damage: {
        minimum,
        average,
        maximum,
        total,
      },
      breakdown: this.createBreakdown(input, context),
      formulaId: context.formulaId,
      castTiming: context.castTiming,
    };
  }

  private createContext(input: DamageFormulaInput): DamageFormulaContext {
    const magical = input.skill.damageType === "magical";
    const basePower = magical
      ? getMagicalBasePower(input.character)
      : getPhysicalBasePower(input.character);
    const equipmentPower = magical
      ? sumMagicalEquipmentPower(input.items)
      : sumPhysicalEquipmentPower(input.items);
    const modifierFlatPower = magical
      ? getMagicalModifierFlatPower(input.modifierEffects)
      : getPhysicalModifierFlatPower(input.modifierEffects);
    const skillFormula = this.skillFormulaRegistry.calculate({
      character: input.character,
      monster: input.monster,
      skill: input.skill,
      skillLevel: input.skillLevel,
    });
    const skillMultiplier = skillFormula.multiplier;
    const legacyBonusRate = magical
      ? getMagicalLegacyBonusRate(input.items, input.skill, input.monster)
      : getPhysicalLegacyBonusRate(input.items, input.skill, input.monster);
    const traitFinalRate = magical
      ? getMagicalTraitFinalRate(input.character)
      : getPhysicalTraitFinalRate(input.character);
    const modifierFinalRate = magical
      ? getMagicalModifierFinalRate(
          input.modifierEffects,
          input.monster,
          input.skill,
        )
      : getPhysicalModifierFinalRate(
          input.modifierEffects,
          input.monster,
          input.skill,
        );
    const finalRateMultiplier =
      1 + (legacyBonusRate + traitFinalRate + modifierFinalRate) / 100;
    const weaponRefinePower = magical
      ? 0
      : getWeaponRefineAtk(input.character.weaponLevel, input.character.weaponRefine);
    const weaponSizeMultiplier = magical
      ? 1
      : getWeaponSizeMultiplier(input.character.weaponType, input.monster.size);
    const attackElement = getAttackElement(
      input.skill,
      magical ? undefined : input.modifierEffects.weaponElement,
    );
    const elementMultiplier = getElementMultiplier(
      input.skill,
      input.monster,
      magical ? undefined : input.modifierEffects.weaponElement,
    );
    const elementResistanceRate = getTargetedRate(
      input.monster.elementResistanceRates ?? {},
      attackElement,
    );
    const defenseIgnoreRate = magical
      ? getTargetedRate(input.modifierEffects.ignoreMagicDefenseRate, input.monster.race)
      : getTargetedRate(input.modifierEffects.ignoreDefenseRate, input.monster.race);
    const defenseMultiplier = getDefenseMultiplier(
      input.monster,
      input.skill.damageType,
      defenseIgnoreRate,
    );
    const preDefenseDamage = Math.floor(
      (basePower + equipmentPower + modifierFlatPower + weaponRefinePower) *
        skillMultiplier *
        finalRateMultiplier *
        weaponSizeMultiplier,
    );
    const postDefenseDamage = Math.floor(preDefenseDamage * defenseMultiplier);
    // rAthena Renewal: Soft DEF/MDEF — subtração flat por hit após Hard DEF/MDEF
    // Soft MDEF para monstros = floor((INT + Level) / 4), exposto em monster.softMdef
    const softDefReduction = magical
      ? (input.monster.softMdef ?? 0)
      : (input.monster.softDef ?? 0);
    const singleHitDamage = Math.max(
      1,
      Math.floor(
        postDefenseDamage * elementMultiplier * (1 - elementResistanceRate / 100),
      ) - softDefReduction,
    );
    const castTiming = this.castTimingEngine.calculate({
      skill: input.skill,
      skillLevel: input.skillLevel,
      effectiveStats: input.character.effectiveStats,
      modifierEffects: input.modifierEffects,
    });
    const totalDamage = singleHitDamage * skillFormula.hitCount;
    const dps =
      castTiming.cycleTimeMs > 0
        ? Math.floor(totalDamage / (castTiming.cycleTimeMs / 1000))
        : totalDamage;

    return {
      basePower,
      equipmentPower,
      modifierFlatPower,
      skillMultiplier,
      legacyBonusRate,
      traitFinalRate,
      modifierFinalRate,
      finalRateMultiplier,
      formulaId: skillFormula.formulaId,
      weaponRefinePower,
      weaponSizeMultiplier,
      attackElement,
      elementMultiplier,
      elementResistanceRate,
      defenseIgnoreRate,
      defenseMultiplier,
      softDefReduction,
      preDefenseDamage,
      postDefenseDamage,
      singleHitDamage,
      hitCount: skillFormula.hitCount,
      castTiming,
      dps,
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
        key: "weaponRefinePower",
        label: "Weapon refine power",
        value: context.weaponRefinePower,
        group: "item",
        unit: "flat",
      },
      {
        key: "weaponSizeMultiplier",
        label: "Weapon size multiplier",
        value: context.weaponSizeMultiplier,
        group: "item",
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
        key: "elementResistanceRate",
        label: "Element resistance rate",
        value: context.elementResistanceRate,
        group: "target",
        unit: "percent",
      },
      {
        key: "defenseIgnoreRate",
        label: "Defense ignore rate",
        value: context.defenseIgnoreRate,
        group: "modifier",
        unit: "percent",
      },
      {
        key: "defenseMultiplier",
        label: "Defense multiplier",
        value: context.defenseMultiplier,
        group: "target",
        unit: "multiplier",
      },
      {
        key: "softDefReduction",
        label: "Soft DEF/MDEF reduction (flat per hit)",
        value: context.softDefReduction,
        group: "target",
        unit: "flat",
      },
      {
        key: "preDefenseDamage",
        label: "Pre-defense damage",
        value: context.preDefenseDamage,
        group: "result",
        unit: "flat",
      },
      {
        key: "postDefenseDamage",
        label: "Post-defense damage",
        value: context.postDefenseDamage,
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
        value: context.hitCount,
        group: "skill",
        unit: "count",
      },
      {
        key: "variableCastMs",
        label: "Variable cast",
        value: context.castTiming.variableCastMs,
        group: "skill",
        unit: "milliseconds",
      },
      {
        key: "fixedCastMs",
        label: "Fixed cast",
        value: context.castTiming.fixedCastMs,
        group: "skill",
        unit: "milliseconds",
      },
      {
        key: "afterCastDelayMs",
        label: "After-cast delay",
        value: context.castTiming.afterCastDelayMs,
        group: "skill",
        unit: "milliseconds",
      },
      {
        key: "cooldownMs",
        label: "Cooldown",
        value: context.castTiming.cooldownMs,
        group: "skill",
        unit: "milliseconds",
      },
      {
        key: "cycleTimeMs",
        label: "Cycle time",
        value: context.castTiming.cycleTimeMs,
        group: "result",
        unit: "milliseconds",
      },
      {
        key: "dps",
        label: "DPS",
        value: context.dps,
        group: "result",
        unit: "dps",
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
}

function getTargetedRate<TTarget extends string>(
  rates: Partial<Record<TTarget | "all", number>>,
  target: TTarget | undefined,
) {
  return (target ? rates[target] ?? 0 : 0) + (rates.all ?? 0);
}
