import type { CalculatorModifierEffects } from "./calculator-modifier-effects";
import { CastTimingEngine, type CastTimingResult } from "./cast-timing";
import type { EffectiveCharacter } from "./effective-character";
import {
  getDefenseMultiplier,
  getAttackElement,
  getElementMultiplier,
} from "./formulas";
import {
  getMagicalBasePower,
  getMagicalModifierFinalRateMultiplier,
  getMagicalModifierFlatPower,
  sumMagicalEquipmentPower,
} from "./formulas/magical-atk";
import {
  getPhysicalBasePower,
  getPhysicalModifierFinalRateMultiplier,
  getPhysicalModifierFlatPower,
  sumPhysicalEquipmentPower,
} from "./formulas/physical-atk";
import { getWeaponRefineAtk, getWeaponSizeMultiplier } from "./formulas/index";
import { CriticalEngine } from "./formulas/critical";
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
    damagePerHit: number;
    criticalChance?: number;
    criticalDamage?: number;
    weightedAverage?: number;
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
  legacyBonusRate?: number;
  traitFinalRate?: number;
  modifierFinalRate?: number;
  finalRateMultiplier: number;
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
  formulaId: string;
};

export class DamageFormulaPipeline {
  constructor(
    private readonly skillFormulaRegistry = new SkillFormulaRegistry(),
    private readonly castTimingEngine = new CastTimingEngine(),
    private readonly criticalEngine = new CriticalEngine(),
  ) {}

  calculate(input: DamageFormulaInput): DamageFormulaResult {
    const context = this.createContext(input);
    // Em RO Renewal, a fórmula da Skill normalmente representa o dano TOTAL da habilidade.
    // Os hits (hitCount) apenas dividem esse dano visualmente.
    let total = Math.max(1, context.singleHitDamage);
    let minimum = Math.max(1, Math.floor(total * 0.95));
    const maximum = Math.max(1, Math.floor(total * 1.05));

    if (input.modifierEffects.recognizedSpell && input.skill.damageType === "magical") {
      // Recognized Spell (Maestria Arcana) removes weapon MATK variance and locks it to maximum.
      // In our abstract variance model, this shifts the average and minimum up to the maximum.
      total = maximum;
      minimum = maximum;
    }

    const damagePerHit = Math.max(1, Math.floor(total / Math.max(1, context.hitCount)));

    let criticalChance: number | undefined;
    let criticalDamage: number | undefined;
    let weightedAverage: number | undefined;

    if (input.skill.damageType === "physical") {
      const critResult = this.criticalEngine.calculate(
        input.character, 
        input.modifierEffects,
        input.monster,
      );

      criticalChance = critResult.chance;
      criticalDamage = Math.max(1, Math.floor(total * critResult.damageMultiplier));
      
      const chance = criticalChance ?? 0;
      const normalChance = Math.max(0, 100 - chance) / 100;
      const critRate = chance / 100;
      weightedAverage = Math.floor(total * normalChance + criticalDamage * critRate);
    }

    return {
      damage: {
        minimum,
        average: total,
        maximum,
        total,
        damagePerHit,
        criticalChance,
        criticalDamage,
        weightedAverage,
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
      ? (console.log("weaponLevels: ", input.items.map(i => i.weaponLevel)), sumMagicalEquipmentPower(input.items, input.modifierEffects))
      : sumPhysicalEquipmentPower(input.items);
    const modifierFlatPower = magical
      ? getMagicalModifierFlatPower(input.modifierEffects)
      : getPhysicalModifierFlatPower(input.modifierEffects);
    const skillFormula = this.skillFormulaRegistry.calculate({
      character: input.character,
      modifierEffects: input.modifierEffects,
      monster: input.monster,
      skill: input.skill,
      skillLevel: input.skillLevel,
    });
    const skillMultiplier = skillFormula.multiplier;
    const finalRateMultiplier = magical
      ? getMagicalModifierFinalRateMultiplier(
          input.character,
          input.modifierEffects,
          input.items,
          input.monster,
          input.skill,
        )
      : getPhysicalModifierFinalRateMultiplier(
          input.character,
          input.modifierEffects,
          input.items,
          input.monster,
          input.skill,
        );
    const weaponRefinePower = getWeaponRefineAtk(
      input.character.weaponLevel,
      input.character.weaponRefine,
    );
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
    const defenseIgnoreRaceRate = magical
      ? getTargetedRate(input.modifierEffects.ignoreMagicDefenseRate, input.monster.race)
      : getTargetedRate(input.modifierEffects.ignoreDefenseRate, input.monster.race);
    const defenseIgnoreClassRate = magical
      ? getTargetedRate(input.modifierEffects.ignoreMagicDefenseClassRate, input.monster.classType)
      : getTargetedRate(input.modifierEffects.ignoreDefenseClassRate, input.monster.classType);
    const defenseIgnoreSizeRate = magical
      ? getTargetedRate(input.modifierEffects.ignoreMagicDefenseSizeRate, input.monster.size)
      : getTargetedRate(input.modifierEffects.ignoreDefenseSizeRate, input.monster.size);
    const defenseIgnoreRate = Math.min(100, defenseIgnoreRaceRate + defenseIgnoreClassRate + defenseIgnoreSizeRate);
    const defenseMultiplier = getDefenseMultiplier(
      input.monster,
      input.skill.damageType,
      defenseIgnoreRate,
    );
    const edpMultiplier = input.modifierEffects.edpActive && !magical ? 5 : 1;
    
    const preDefenseDamage =
      (basePower + (equipmentPower + modifierFlatPower + weaponRefinePower) * edpMultiplier) *
      skillMultiplier *
      finalRateMultiplier *
      weaponSizeMultiplier *
      elementMultiplier;
    
    const postDefenseDamage = Math.floor(preDefenseDamage * defenseMultiplier);
    const softDefReduction = magical
      ? (input.monster.softMdef ?? 0)
      : (input.monster.softDef ?? 0);
    const singleHitDamage = Math.max(
      1,
      Math.floor(
        postDefenseDamage * (1 - elementResistanceRate / 100),
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
        key: "finalRateMultiplier",
        label: "Final rate multiplier (Categories)",
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
