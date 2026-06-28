import fs from "fs";
import path from "path";
import {
  toRoMonster,
  type RathenaNormalizedMonster,
} from "@/packages/calculator-core/src/datasets/rathena-normalized";

const normalizedMonsters = readJsonFile<RathenaNormalizedMonster[]>(
  path.join(
    process.cwd(),
    "nightmare-data/normalized/monsters/monsters.en.json",
  ),
);
const monstersIndex = readJsonFile<CalculatorMonsterIndexEntry[]>(
  path.join(
    process.cwd(),
    "nightmare-data/generated/calculator/monsters-index.json",
  ),
);
const monsterById = new Map(
  normalizedMonsters.map((monster) => [monster.monsterId, monster]),
);

export type CalculatorMonsterIndexEntry = {
  id: number;
  name: string;
  level: number | null;
  race: string | null;
  size: string | null;
  element: string | null;
  elementLevel: number | null;
  hp: number | null;
  defense: number | null;
  magicDefense: number | null;
};

const DUMMY_TARGET_ID = 999999;
const dummyTarget: CalculatorMonsterIndexEntry = {
  id: DUMMY_TARGET_ID,
  name: "Cecil Damon (Test Dummy)",
  level: 160,
  race: "demi-human",
  size: "medium",
  element: "neutral",
  elementLevel: 1,
  hp: 10000000,
  defense: 100,
  magicDefense: 100,
};
const dummyTargetDetail = {
  id: DUMMY_TARGET_ID,
  name: "Cecil Damon (Test Dummy)",
  level: 160,
  hp: 10000000,
  baseExp: 0,
  jobExp: 0,
  attack: 0,
  magicAttack: 0,
  defense: 100,
  magicDefense: 100,
  race: "demi-human" as const,
  size: "medium" as const,
  element: "neutral" as const,
  elementLevel: 1,
  class: "normal" as const,
  elementResistanceRates: {},
};

export function searchMonsterIndex({
  limit,
  query,
}: {
  limit: number;
  query?: string;
}) {
  const source = [dummyTarget, ...monstersIndex];
  const normalizedQuery = normalizeSearch(query ?? "");
  const filteredMonsters = normalizedQuery
    ? source.filter((monster) =>
        normalizeSearch(`${monster.name} ${monster.id}`).includes(normalizedQuery),
      )
    : source;

  return filteredMonsters.slice(0, limit);
}

export function getMonsterDetail(monsterId: number) {
  if (monsterId === DUMMY_TARGET_ID) {
    return dummyTargetDetail;
  }

  const monster = monsterById.get(monsterId);

  if (!monster) {
    return null;
  }

  return toRoMonster(monster);
}

function readJsonFile<T>(filePath: string) {
  return JSON.parse(fs.readFileSync(filePath, "utf8")) as T;
}

function normalizeSearch(value: string) {
  return value
    .normalize("NFD")
    .replace(/\p{Diacritic}/gu, "")
    .trim()
    .toLowerCase();
}
