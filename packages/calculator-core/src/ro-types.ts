import type { NormalizedModifier } from "./modifiers";

export type DamageType = "physical" | "magical";

export type ElementType =
  | "neutral"
  | "water"
  | "earth"
  | "fire"
  | "wind"
  | "poison"
  | "holy"
  | "dark"
  | "ghost"
  | "undead";

export type MonsterSize = "small" | "medium" | "large";

export type MonsterRace =
  | "formless"
  | "undead"
  | "brute"
  | "plant"
  | "insect"
  | "fish"
  | "demon"
  | "demihuman"
  | "angel"
  | "dragon";

export type WeaponType =
  | "bareHand"
  | "dagger"
  | "oneHandSword"
  | "twoHandSword"
  | "oneHandSpear"
  | "twoHandSpear"
  | "oneHandAxe"
  | "twoHandAxe"
  | "mace"
  | "rod"
  | "bow"
  | "katar"
  | "book"
  | "knuckle"
  | "musicalInstrument"
  | "whip"
  | "revolver"
  | "rifle"
  | "gatlingGun"
  | "shotgun"
  | "grenadeLauncher"
  | "huuma"
  | "twoHandRod";

export type EquipmentSlot =
  | "headTop"
  | "headMid"
  | "headLow"
  | "armor"
  | "weapon"
  | "shield"
  | "garment"
  | "shoes"
  | "accessoryLeft"
  | "accessoryRight"
  | "costumeHeadTop"
  | "costumeHeadMid"
  | "costumeHeadLow"
  | "costumeGarment"
  | "shadowWeapon"
  | "shadowShield"
  | "shadowArmor"
  | "shadowShoes"
  | "shadowEarring"
  | "shadowPendant";

export type Bonus =
  | { type: "flatAtk"; value: number }
  | { type: "flatMatk"; value: number }
  | { type: "atkRate"; value: number }
  | { type: "matkRate"; value: number }
  | { type: "skillDamage"; skillId: string; value: number }
  | { type: "raceDamage"; race: MonsterRace; value: number }
  | { type: "elementDamage"; element: ElementType; value: number }
  | { type: "sizeDamage"; size: MonsterSize; value: number };

export type RoItem = {
  id: number;
  name: string;
  kind: "equipment" | "card" | "shadow" | "costume" | "consumable";
  slots?: EquipmentSlot[];
  attack?: number;
  magicAttack?: number;
  defense?: number;
  cardSlots?: number;
  bonuses: Bonus[];
  rawScript?: string;
  modifiers?: NormalizedModifier[];
  source: "manual" | "iwdb" | "rathena";
  sourceUrl?: string;
};

export type RoMonster = {
  id: number;
  name: string;
  level: number;
  race: MonsterRace;
  size: MonsterSize;
  element: ElementType;
  elementLevel: number;
  defense: number;
  magicDefense: number;
  hp: number;
  source: "manual" | "iwdb" | "rathena";
  sourceUrl?: string;
};

export type RoSkill = {
  id: string;
  name: string;
  classTree: string;
  damageType: DamageType;
  element?: ElementType;
  maxLevel: number;
  hitCount: number;
  hitCountByLevel?: Record<string, number>;
  baseMultiplierByLevel: Record<string, number>;
  source: "manual" | "irowiki" | "rathena";
  sourceUrl?: string;
};

export type CharacterStats = {
  str: number;
  agi: number;
  vit: number;
  int: number;
  dex: number;
  luk: number;
  pow: number;
  sta: number;
  wis: number;
  spl: number;
  con: number;
  crt: number;
};

export type CalculatorCharacter = {
  classId?: string;
  baseJob?: string;
  isTranscendent?: boolean;
  weaponType?: WeaponType;
  weaponLevel?: number;
  weaponRefine?: number;
  baseLevel: number;
  jobLevel: number;
  stats: CharacterStats;
};
