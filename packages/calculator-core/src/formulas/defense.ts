import type { DamageType, RoMonster } from "../ro-types";

export function getDefenseMultiplier(monster: RoMonster, damageType: DamageType) {
  const defense = damageType === "magical" ? monster.magicDefense : monster.defense;
  return Math.max(0.1, 1 - defense / (defense + 400));
}
