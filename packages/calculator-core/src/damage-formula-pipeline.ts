import type { CalculatorModifierEffects } from "./calculator-modifier-effects";
import type { EffectiveCharacter } from "./effective-character";
import {
  getDefenseMultiplier,
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
import type { RoItem, RoMonster, RoSkill } from "./ro-types";

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
  weaponRefinePower: number;
  weaponSizeMultiplier: number;
  elementMultiplier: number;
  defenseMultiplier: number;
  preDefenseDamage: number;
  singleHitDamage: number;
  hitCount: number;
};

export class DamageFormulaPipeline {
  constructor(private readonly skillFormulaRegistry = new SkillFormulaRegistry()) {}

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
    const elementMultiplier = getElementMultiplier(input.skill, input.monster);
    const defenseMultiplier = getDefenseMultiplier(
      input.monster,
      input.skill.damageType,
    );
    const preDefenseDamage = Math.floor(
      (basePower + equipmentPower + modifierFlatPower + weaponRefinePower) *
        skillMultiplier *
        finalRateMultiplier *
        weaponSizeMultiplier *
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
      weaponRefinePower,
      weaponSizeMultiplier,
      elementMultiplier,
      defenseMultiplier,
      preDefenseDamage,
      singleHitDamage,
      hitCount: skillFormula.hitCount,
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
        value: context.hitCount,
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
}
