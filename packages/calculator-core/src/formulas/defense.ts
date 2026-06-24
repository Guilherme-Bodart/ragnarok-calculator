import type { DamageType, RoMonster } from "../ro-types";

export function getDefenseMultiplier(
  monster: RoMonster,
  damageType: DamageType,
  ignoreRate = 0,
) {
  if (damageType === "magical") {
    return getHardMdefMultiplier(applyDefenseIgnore(monster.magicDefense, ignoreRate));
  }

  return getHardDefMultiplier(applyDefenseIgnore(monster.defense, ignoreRate));
}

export function getHardDefMultiplier(defense: number) {
  return (4000 + defense) / (4000 + defense * 10);
}

export function getHardMdefMultiplier(magicDefense: number) {
  return (1000 + magicDefense) / (1000 + magicDefense * 10);
}

function applyDefenseIgnore(defense: number, ignoreRate: number) {
  const safeRate = Math.min(Math.max(ignoreRate, 0), 100);

  return defense * (1 - safeRate / 100);
}
