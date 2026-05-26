import type { StatBonus } from "./job-stats";

export type CalculatorTraitEffects = {
  statusAtk: number;
  statusMatk: number;
  pAtk: number;
  smatk: number;
  res: number;
  mres: number;
  healPlus: number;
  criticalDamageRate: number;
};

export class CalculatorTraitEffectsFactory {
  fromStats(stats: StatBonus): CalculatorTraitEffects {
    return {
      statusAtk: stats.pow * 5,
      statusMatk: stats.spl * 5,
      pAtk: Math.floor(stats.pow / 3) + Math.floor(stats.con / 5),
      smatk: Math.floor(stats.spl / 3) + Math.floor(stats.con / 5),
      res: stats.sta + Math.floor(stats.sta / 3) * 5,
      mres: stats.wis + Math.floor(stats.wis / 3) * 5,
      healPlus: stats.crt,
      criticalDamageRate: Math.floor(stats.crt / 3),
    };
  }
}
