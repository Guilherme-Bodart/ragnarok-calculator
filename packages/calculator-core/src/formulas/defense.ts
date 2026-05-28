import type { DamageType, RoMonster } from "../ro-types";

export function getDefenseMultiplier(monster: RoMonster, damageType: DamageType) {
  if (damageType === "magical") {
    return getHardMdefMultiplier(monster.magicDefense);
  }

  return getHardDefMultiplier(monster.defense);
}

export function getHardDefMultiplier(defense: number) {
  return (4000 + defense) / (4000 + defense * 10);
}

export function getHardMdefMultiplier(magicDefense: number) {
  return (1000 + magicDefense) / (1000 + magicDefense * 10);
}
