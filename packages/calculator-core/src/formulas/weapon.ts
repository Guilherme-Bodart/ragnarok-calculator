import type { MonsterSize, WeaponType } from "../ro-types";

export function getWeaponRefineAtk(weaponLevel: number, weaponRefine: number) {
  const refinePowerByLevel: Record<number, number> = {
    0: 0,
    1: 2,
    2: 3,
    3: 5,
    4: 7,
    5: 10,
  };

  return weaponRefine * (refinePowerByLevel[weaponLevel] ?? refinePowerByLevel[4]);
}

export function getWeaponSizeMultiplier(
  weaponType: WeaponType | undefined,
  targetSize: MonsterSize,
) {
  const table = weaponSizePenaltyTable[weaponType ?? "bareHand"];
  return table?.[targetSize] ?? 1;
}

const allSizes = {
  small: 1,
  medium: 1,
  large: 1,
};

const weaponSizePenaltyTable: Record<WeaponType, Record<MonsterSize, number>> = {
  bareHand: allSizes,
  dagger: {
    small: 1,
    medium: 0.75,
    large: 0.5,
  },
  oneHandSword: {
    small: 0.75,
    medium: 1,
    large: 0.75,
  },
  twoHandSword: {
    small: 0.75,
    medium: 0.75,
    large: 1,
  },
  oneHandSpear: {
    small: 0.75,
    medium: 0.75,
    large: 1,
  },
  twoHandSpear: {
    small: 0.75,
    medium: 0.75,
    large: 1,
  },
  oneHandAxe: {
    small: 0.5,
    medium: 0.75,
    large: 1,
  },
  twoHandAxe: {
    small: 0.5,
    medium: 0.75,
    large: 1,
  },
  mace: {
    small: 0.75,
    medium: 1,
    large: 1,
  },
  rod: allSizes,
  bow: {
    small: 1,
    medium: 1,
    large: 0.75,
  },
  katar: {
    small: 0.75,
    medium: 1,
    large: 0.75,
  },
  book: allSizes,
  knuckle: {
    small: 1,
    medium: 0.75,
    large: 0.5,
  },
  musicalInstrument: {
    small: 0.75,
    medium: 1,
    large: 0.75,
  },
  whip: {
    small: 0.75,
    medium: 1,
    large: 0.75,
  },
  revolver: allSizes,
  rifle: allSizes,
  gatlingGun: allSizes,
  shotgun: allSizes,
  grenadeLauncher: allSizes,
  huuma: {
    small: 0.75,
    medium: 0.75,
    large: 1,
  },
  twoHandRod: allSizes,
};
