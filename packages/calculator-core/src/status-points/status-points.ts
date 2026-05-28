import type { CharacterStats } from "../ro-types";

export const regularStatusStatKeys = [
  "str",
  "agi",
  "vit",
  "int",
  "dex",
  "luk",
] as const;

export const traitStatusStatKeys = [
  "pow",
  "sta",
  "wis",
  "spl",
  "con",
  "crt",
] as const;

export type RegularStatusStatKey = (typeof regularStatusStatKeys)[number];
export type TraitStatusStatKey = (typeof traitStatusStatKeys)[number];

export type StatusPointGroup = {
  available: number;
  spent: number;
  remaining: number;
  overBudget: number;
  overMaxStats: string[];
  isValid: boolean;
};

export type StatusPointBudget = {
  regular: StatusPointGroup;
  trait: StatusPointGroup;
};

export type StatusPointBudgetInput = {
  baseLevel: number;
  stats: CharacterStats;
  isTranscendent?: boolean;
  isFourthJob?: boolean;
};

const TRANSCENDENT_STATUS_POINTS = 52;
const FOURTH_JOB_TRAIT_POINTS = 7;
const MAX_REGULAR_STAT = 130;
const MAX_TRAIT_STAT = 110;

export function getRegularStatusPointsForBaseLevel(baseLevel: number): number {
  const level = clampLevel(baseLevel);
  let points = 48;

  for (let currentLevel = 2; currentLevel <= Math.min(level, 200); currentLevel += 1) {
    points += getStatusPointsForLevel(currentLevel);
  }

  return points;
}

export function getTraitStatusPointsForBaseLevel(baseLevel: number): number {
  const traitLevels = Math.max(0, clampLevel(baseLevel) - 200);

  return traitLevels * 3 + Math.floor(traitLevels / 5) * 4;
}

export function getRegularStatIncreaseCost(currentValue: number): number {
  if (currentValue < 100) {
    return 2 + Math.floor((currentValue - 1) / 10);
  }

  return 16 + 4 * Math.floor((currentValue - 100) / 5);
}

export function getRegularStatCost(value: number): number {
  const target = Math.max(1, Math.floor(value));
  let cost = 0;

  for (let currentValue = 1; currentValue < target; currentValue += 1) {
    cost += getRegularStatIncreaseCost(currentValue);
  }

  return cost;
}

export function evaluateStatusPointBudget(
  input: StatusPointBudgetInput,
): StatusPointBudget {
  const regularAvailable =
    getRegularStatusPointsForBaseLevel(input.baseLevel) +
    (input.isTranscendent ? TRANSCENDENT_STATUS_POINTS : 0);
  const traitAvailable =
    getTraitStatusPointsForBaseLevel(input.baseLevel) +
    ((input.isFourthJob ?? input.baseLevel >= 200) ? FOURTH_JOB_TRAIT_POINTS : 0);

  return {
    regular: evaluateRegularStats(input.stats, regularAvailable),
    trait: evaluateTraitStats(input.stats, traitAvailable),
  };
}

function evaluateRegularStats(
  stats: CharacterStats,
  available: number,
): StatusPointGroup {
  const spent = regularStatusStatKeys.reduce(
    (total, stat) => total + getRegularStatCost(stats[stat]),
    0,
  );
  const overMaxStats = regularStatusStatKeys.filter(
    (stat) => stats[stat] < 1 || stats[stat] > MAX_REGULAR_STAT,
  );

  return toGroup(available, spent, overMaxStats);
}

function evaluateTraitStats(
  stats: CharacterStats,
  available: number,
): StatusPointGroup {
  const spent = traitStatusStatKeys.reduce(
    (total, stat) => total + Math.max(0, Math.floor(stats[stat])),
    0,
  );
  const overMaxStats = traitStatusStatKeys.filter(
    (stat) => stats[stat] < 0 || stats[stat] > MAX_TRAIT_STAT,
  );

  return toGroup(available, spent, overMaxStats);
}

function toGroup(
  available: number,
  spent: number,
  overMaxStats: string[],
): StatusPointGroup {
  const remaining = available - spent;

  return {
    available,
    spent,
    remaining,
    overBudget: Math.max(0, -remaining),
    overMaxStats,
    isValid: remaining >= 0 && overMaxStats.length === 0,
  };
}

function getStatusPointsForLevel(level: number): number {
  if (level <= 1 || level > 200) {
    return 0;
  }

  if (level <= 100) {
    return Math.floor((level - 1) / 5) + 3;
  }

  if (level <= 150) {
    return Math.floor((level - 101) / 10) + 23;
  }

  if (level <= 199) {
    return Math.floor((level - 151) / 7) + 28;
  }

  return 35;
}

function clampLevel(baseLevel: number): number {
  return Math.max(1, Math.min(275, Math.floor(baseLevel)));
}
