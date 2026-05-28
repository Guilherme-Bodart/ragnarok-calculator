import type { ElementType, RoMonster, RoSkill } from "../ro-types";

export function getElementMultiplier(skill: RoSkill, monster: RoMonster) {
  const attackElement = skill.element ?? "neutral";
  const attackRates = elementRateTable[attackElement] ?? {};
  const defenseLevels = attackRates[monster.element] ?? [100, 100, 100, 100];
  const level = clampElementLevel(monster.elementLevel);

  return defenseLevels[level - 1] / 100;
}

const elementRateTable: Partial<
  Record<ElementType, Partial<Record<ElementType, [number, number, number, number]>>>
> = {
  neutral: {
    neutral: [100, 100, 100, 100],
    water: [100, 100, 100, 100],
    earth: [100, 100, 100, 100],
    fire: [100, 100, 100, 100],
    wind: [100, 100, 100, 100],
    poison: [100, 100, 100, 100],
    holy: [100, 100, 100, 100],
    dark: [100, 100, 100, 100],
    ghost: [25, 0, 0, 0],
    undead: [100, 100, 100, 100],
  },
  water: {
    neutral: [100, 100, 100, 100],
    water: [25, 0, 0, 0],
    earth: [100, 100, 100, 100],
    fire: [150, 175, 200, 200],
    wind: [50, 25, 0, 0],
    poison: [100, 100, 100, 75],
    holy: [100, 100, 100, 75],
    dark: [100, 100, 100, 75],
    ghost: [100, 100, 100, 100],
    undead: [100, 100, 100, 100],
  },
  earth: {
    neutral: [100, 100, 100, 100],
    water: [100, 100, 100, 100],
    earth: [25, 0, 0, 0],
    fire: [50, 25, 0, 0],
    wind: [150, 175, 200, 200],
    poison: [100, 100, 100, 75],
    holy: [100, 100, 100, 75],
    dark: [100, 100, 100, 75],
    ghost: [100, 100, 100, 100],
    undead: [100, 100, 100, 100],
  },
  fire: {
    neutral: [100, 100, 100, 100],
    water: [50, 25, 0, 0],
    earth: [150, 175, 200, 200],
    fire: [25, 0, 0, 0],
    wind: [100, 100, 100, 100],
    poison: [100, 100, 100, 75],
    holy: [100, 100, 100, 75],
    dark: [100, 100, 100, 75],
    ghost: [100, 100, 100, 100],
    undead: [125, 150, 175, 200],
  },
  wind: {
    neutral: [100, 100, 100, 100],
    water: [150, 175, 200, 200],
    earth: [50, 25, 0, 0],
    fire: [100, 100, 100, 100],
    wind: [25, 0, 0, 0],
    poison: [100, 100, 100, 75],
    holy: [100, 100, 100, 75],
    dark: [100, 100, 100, 75],
    ghost: [100, 100, 100, 100],
    undead: [100, 100, 100, 100],
  },
  poison: {
    neutral: [100, 100, 100, 100],
    water: [100, 100, 100, 100],
    earth: [100, 100, 100, 100],
    fire: [100, 100, 100, 100],
    wind: [100, 100, 100, 100],
    poison: [0, 0, 0, 0],
    holy: [100, 100, 100, 75],
    dark: [50, 25, 0, 0],
    ghost: [100, 100, 100, 100],
    undead: [50, 25, 0, 0],
  },
  holy: {
    neutral: [100, 100, 100, 100],
    water: [100, 100, 100, 75],
    earth: [100, 100, 100, 75],
    fire: [100, 100, 100, 75],
    wind: [100, 100, 100, 75],
    poison: [125, 150, 175, 200],
    holy: [0, 0, 0, 0],
    dark: [125, 150, 175, 200],
    ghost: [100, 100, 100, 100],
    undead: [150, 175, 200, 200],
  },
  dark: {
    neutral: [100, 100, 100, 100],
    water: [100, 100, 100, 75],
    earth: [100, 100, 100, 75],
    fire: [100, 100, 100, 75],
    wind: [100, 100, 100, 75],
    poison: [50, 25, 0, 0],
    holy: [125, 150, 175, 200],
    dark: [0, 0, 0, 0],
    ghost: [100, 100, 100, 100],
    undead: [0, 0, 0, 0],
  },
  ghost: {
    neutral: [25, 0, 0, 0],
    water: [100, 100, 100, 100],
    earth: [100, 100, 100, 100],
    fire: [100, 100, 100, 100],
    wind: [100, 100, 100, 100],
    poison: [100, 100, 100, 75],
    holy: [100, 100, 100, 75],
    dark: [100, 100, 100, 75],
    ghost: [125, 150, 175, 200],
    undead: [100, 100, 100, 100],
  },
  undead: {
    neutral: [100, 100, 100, 100],
    water: [100, 100, 100, 100],
    earth: [100, 100, 100, 100],
    fire: [125, 150, 175, 200],
    wind: [100, 100, 100, 100],
    poison: [0, 0, 0, 0],
    holy: [150, 175, 200, 200],
    dark: [0, 0, 0, 0],
    ghost: [100, 100, 100, 100],
    undead: [0, 0, 0, 0],
  },
};

function clampElementLevel(level: number) {
  return Math.min(4, Math.max(1, Math.trunc(level)));
}
