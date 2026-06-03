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
  limit,
  query,
}: SearchCalculatorMonstersInput = {}) {
  const params = new URLSearchParams();

  if (limit) params.set("limit", String(limit));
  if (query) params.set("q", query);

  const response = await fetch(`/api/calculator/monsters?${params.toString()}`);

  if (!response.ok) {
    throw new Error("Failed to load calculator monsters.");
  }

  return (await response.json()) as CalculatorMonsterIndexOption[];
}

export async function getCalculatorMonsterDetail(monsterId: number) {
  const response = await fetch(`/api/calculator/monsters/${monsterId}`);

  if (!response.ok) {
    throw new Error(`Failed to load monster ${monsterId}.`);
  }

  return (await response.json()) as CalculatorMonsterDetail;
}
