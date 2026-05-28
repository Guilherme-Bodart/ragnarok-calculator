import type { CalculatorDataset } from "../calculate-damage-from-dataset";
import type {
  DamageType,
  ElementType,
  MonsterRace,
  MonsterSize,
  RoItem,
  RoMonster,
  RoSkill,
} from "../ro-types";

export type RathenaNormalizedItem = {
  itemId: number;
  name: string;
  type: string | null;
  subType?: string | null;
  attack?: number | null;
  magicAttack?: number | null;
  defense?: number | null;
  slots?: number | null;
  rawScript?: string | null;
  source: "rathena";
};

export type RathenaNormalizedMonster = {
  monsterId: number;
  name: string;
  level?: number | null;
  race?: string | null;
  size?: string | null;
  element?: string | null;
  elementLevel?: number | null;
  defense?: number | null;
  magicDefense?: number | null;
  hp?: number | null;
  source: "rathena";
};

export type RathenaNormalizedSkill = {
  skillId: number;
  name: string;
  description?: string | null;
  maxLevel?: number | null;
  type?: string | null;
  targetType?: string | null;
  hit?: string | null;
  element?: unknown;
  rawDamageFlags?: unknown;
  raw?: {
    HitCount?: unknown;
  } | null;
  source: "rathena";
};

export type RathenaNormalizedDataset = {
  items: RathenaNormalizedItem[];
  monsters: RathenaNormalizedMonster[];
  skills: RathenaNormalizedSkill[];
};

export function createCalculatorDatasetFromRathenaNormalized(
  dataset: RathenaNormalizedDataset,
): CalculatorDataset {
  return {
    items: dataset.items.map(toRoItem),
    monsters: dataset.monsters.map(toRoMonster),
    skills: dataset.skills.map(toRoSkill).filter(isRoSkill),
  };
}

export function toRoItem(item: RathenaNormalizedItem): RoItem {
  return {
    id: item.itemId,
    name: item.name,
    kind: getItemKind(item.type),
    attack: numberOrUndefined(item.attack),
    magicAttack: numberOrUndefined(item.magicAttack),
    defense: numberOrUndefined(item.defense),
    cardSlots: numberOrUndefined(item.slots),
    bonuses: [],
    rawScript: item.rawScript ?? undefined,
    source: "rathena",
  };
}

export function toRoMonster(monster: RathenaNormalizedMonster): RoMonster {
  return {
    id: monster.monsterId,
    name: monster.name,
    level: monster.level ?? 1,
    race: getMonsterRace(monster.race),
    size: getMonsterSize(monster.size),
    element: getElement(monster.element),
    elementLevel: monster.elementLevel ?? 1,
    defense: monster.defense ?? 0,
    magicDefense: monster.magicDefense ?? 0,
    hp: monster.hp ?? 1,
    source: "rathena",
  };
}

export function toRoSkill(skill: RathenaNormalizedSkill): RoSkill | null {
  if (!isDamageSkill(skill)) {
    return null;
  }

  const element = getSkillElement(skill.element);

  return {
    id: skill.name,
    name: skill.description ?? skill.name,
    classTree: "unknown",
    damageType: getDamageType(skill.type),
    element,
    maxLevel: skill.maxLevel ?? 1,
    hitCount: getHitCount(skill.raw?.HitCount),
    baseMultiplierByLevel: createDefaultMultipliers(skill.maxLevel ?? 1),
    source: "rathena",
  };
}

function isDamageSkill(skill: RathenaNormalizedSkill) {
  if (hasNoDamageFlag(skill.rawDamageFlags)) {
    return false;
  }

  return Boolean(skill.targetType);
}

function hasNoDamageFlag(flags: unknown) {
  return (
    typeof flags === "object" &&
    flags !== null &&
    "NoDamage" in flags &&
    Boolean(flags.NoDamage)
  );
}

function getItemKind(type: string | null): RoItem["kind"] {
  const key = normalizeKey(type);

  if (key === "card") return "card";
  if (key.includes("shadow")) return "shadow";
  if (key.includes("costume")) return "costume";
  if (key === "weapon" || key === "armor" || key === "ammo") return "equipment";

  return "consumable";
}

function getDamageType(type: string | null | undefined): DamageType {
  return normalizeKey(type).includes("magic") ? "magical" : "physical";
}

function getMonsterRace(race: string | null | undefined): MonsterRace {
  const key = normalizeKey(race);

  return raceByRathenaKey[key] ?? "formless";
}

function getMonsterSize(size: string | null | undefined): MonsterSize {
  const key = normalizeKey(size);

  return sizeByRathenaKey[key] ?? "medium";
}

function getElement(element: string | null | undefined): ElementType {
  const key = normalizeKey(element);

  return elementByRathenaKey[key] ?? "neutral";
}

function getSkillElement(element: unknown): ElementType | undefined {
  if (typeof element === "string") {
    const key = normalizeKey(element);

    if (key === "weapon") {
      return undefined;
    }

    return elementByRathenaKey[key];
  }

  return undefined;
}

function getHitCount(hitCount: unknown) {
  if (typeof hitCount === "number") {
    return hitCount;
  }

  if (!Array.isArray(hitCount)) {
    return 1;
  }

  return hitCount.reduce((highest, entry) => {
    if (
      typeof entry === "object" &&
      entry !== null &&
      "Count" in entry &&
      typeof entry.Count === "number"
    ) {
      return Math.max(highest, entry.Count);
    }

    return highest;
  }, 1);
}

function createDefaultMultipliers(maxLevel: number) {
  return Object.fromEntries(
    Array.from({ length: maxLevel }, (_, index) => [String(index + 1), 100]),
  );
}

function numberOrUndefined(value: number | null | undefined) {
  return value ?? undefined;
}

function isRoSkill(skill: RoSkill | null): skill is RoSkill {
  return skill !== null;
}

function normalizeKey(value: string | null | undefined) {
  return value?.replace(/[\s_-]/g, "").toLowerCase() ?? "";
}

const raceByRathenaKey: Record<string, MonsterRace> = {
  formless: "formless",
  undead: "undead",
  brute: "brute",
  animal: "brute",
  plant: "plant",
  insect: "insect",
  fish: "fish",
  demon: "demon",
  demihuman: "demihuman",
  human: "demihuman",
  angel: "angel",
  dragon: "dragon",
};

const sizeByRathenaKey: Record<string, MonsterSize> = {
  small: "small",
  medium: "medium",
  large: "large",
};

const elementByRathenaKey: Record<string, ElementType> = {
  neutral: "neutral",
  water: "water",
  earth: "earth",
  fire: "fire",
  wind: "wind",
  poison: "poison",
  holy: "holy",
  dark: "dark",
  shadow: "dark",
  ghost: "ghost",
  undead: "undead",
};
