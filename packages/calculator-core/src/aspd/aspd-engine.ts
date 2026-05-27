import { getJobBaseAspd } from "./job-aspd";
import type { StatBonus } from "../job-stats";
import type { CalculatorCharacter } from "../ro-types";

export type AspdEngineInput = {
  classId?: string;
  weaponType: NonNullable<CalculatorCharacter["weaponType"]>;
  effectiveStats: Pick<StatBonus, "agi" | "dex">;
  flatAspd?: number;
  aspdRate?: number;
};

export class AspdEngine {
  calculate(input: AspdEngineInput) {
    const baseAspd = getJobBaseAspd(input.classId, input.weaponType);
    const statBonus =
      Math.sqrt(input.effectiveStats.agi * 10) / 2 +
      input.effectiveStats.dex / 10;
    const rateBonus = (193 - baseAspd) * ((input.aspdRate ?? 0) / 100);
    const aspd = baseAspd + statBonus + rateBonus + (input.flatAspd ?? 0);

    return Math.min(193, Math.floor(aspd * 100) / 100);
  }
}
