import monstersIndex from "@/nightmare-data/generated/calculator/monsters-index.json";
import rawMonsters from "@/nightmare-data/normalized/monsters/monsters.en.json";
import {
  toRoMonster,
  type RathenaNormalizedMonster,
} from "@/packages/calculator-core/src/datasets/rathena-normalized";

const normalizedMonsters = rawMonsters as RathenaNormalizedMonster[];
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

export function searchMonsterIndex({
  limit,
  query,
}: {
  limit: number;
  query?: string;
}) {
  const source = monstersIndex as CalculatorMonsterIndexEntry[];
  const normalizedQuery = normalizeSearch(query ?? "");
  const filteredMonsters = normalizedQuery
    ? source.filter((monster) =>
        normalizeSearch(`${monster.name} ${monster.id}`).includes(normalizedQuery),
      )
    : source;

  return filteredMonsters.slice(0, limit);
}

export function getMonsterDetail(monsterId: number) {
  const monster = monsterById.get(monsterId);

  if (!monster) {
    return null;
  }

  return toRoMonster(monster);
}

function normalizeSearch(value: string) {
  return value
    .normalize("NFD")
    .replace(/\p{Diacritic}/gu, "")
    .trim()
    .toLowerCase();
}
