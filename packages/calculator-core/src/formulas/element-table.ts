import type { ElementType, RoMonster, RoSkill } from "../ro-types";

export function getElementMultiplier(skill: RoSkill, monster: RoMonster) {
  const attackElement = skill.element ?? "neutral";
  const attackRates = elementRateTable[attackElement] ?? {};
  return (attackRates[monster.element] ?? 100) / 100;
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
