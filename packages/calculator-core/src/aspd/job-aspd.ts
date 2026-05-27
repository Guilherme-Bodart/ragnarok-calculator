import type { WeaponType } from "../ro-types";

export type JobAspdGroup = {
  classIds: string[];
  baseAspdByWeapon: Partial<Record<WeaponType, number>>;
};

export const defaultBaseAspdByWeapon: Record<WeaponType, number> = {
  bareHand: 156,
  dagger: 140,
  oneHandSword: 140,
  twoHandSword: 138,
  oneHandSpear: 138,
  twoHandSpear: 137,
  oneHandAxe: 136,
  twoHandAxe: 134,
  mace: 140,
  rod: 140,
  bow: 140,
  katar: 140,
  book: 140,
  knuckle: 140,
  musicalInstrument: 140,
  whip: 140,
  revolver: 140,
  rifle: 130,
  gatlingGun: 130,
  shotgun: 130,
  grenadeLauncher: 130,
  huuma: 135,
  twoHandRod: 138,
};

export const jobAspdGroups: JobAspdGroup[] = [
  {
    classIds: ["Swordman", "Swordman_High", "Baby_Swordman"],
    baseAspdByWeapon: {
      bareHand: 156,
      dagger: 145,
      oneHandSword: 145,
      twoHandSword: 141,
      oneHandSpear: 142,
      twoHandSpear: 141,
      oneHandAxe: 141,
      twoHandAxe: 139,
      mace: 141,
    },
  },
  {
    classIds: ["Knight", "Knight2", "Lord_Knight", "Lord_Knight2"],
    baseAspdByWeapon: {
      bareHand: 156,
      dagger: 145,
      oneHandSword: 150,
      twoHandSword: 147,
      oneHandSpear: 148,
      twoHandSpear: 145,
      oneHandAxe: 141,
      twoHandAxe: 139,
      mace: 141,
    },
  },
  {
    classIds: ["Dragon_Knight", "Dragon_Knight2"],
    baseAspdByWeapon: {
      bareHand: 156,
      dagger: 150,
      oneHandSword: 156,
      twoHandSword: 154,
      oneHandSpear: 154,
      twoHandSpear: 152,
      oneHandAxe: 148,
      twoHandAxe: 146,
      mace: 148,
    },
  },
];

export function getJobBaseAspd(classId: string | undefined, weaponType: WeaponType) {
  const group = classId
    ? jobAspdGroups.find((candidate) => candidate.classIds.includes(classId))
    : undefined;

  return (
    group?.baseAspdByWeapon[weaponType] ??
    defaultBaseAspdByWeapon[weaponType] ??
    defaultBaseAspdByWeapon.bareHand
  );
}
