import type { RoMonster } from "@/packages/calculator-core/src";

export type CalculatorMonsterIndexOption = {
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

export type CalculatorMonsterDetail = RoMonster;

type SearchCalculatorMonstersInput = {
  limit?: number;
  query?: string;
};

export async function searchCalculatorMonsters({
  limit = 80,
  query,
}: SearchCalculatorMonstersInput = {}) {
  const response = await fetch("/data/calculator/monsters-index.json");

  if (!response.ok) {
    return [];
  }

  const monsters = (await response.json()) as CalculatorMonsterIndexOption[];

  if (!query) {
    return monsters.slice(0, limit);
  }

  const normalizedQuery = normalizeSearch(query);

  return monsters
    .filter((monster) =>
      normalizeSearch(`${monster.name} ${monster.id}`).includes(normalizedQuery),
    )
    .slice(0, limit);
}

export async function getCalculatorMonsterDetail(monsterId: number) {
  const response = await fetch(`/data/calculator/monsters/${monsterId}.json`);

  if (!response.ok) {
    throw new Error(`Failed to load monster ${monsterId}.`);
  }

  return (await response.json()) as CalculatorMonsterDetail;
}

function normalizeSearch(value: string) {
  return value
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .trim()
    .toLowerCase();
}
