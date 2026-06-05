import fs from "fs";
import path from "path";
import {
  toRoItem,
  type RathenaNormalizedItem,
} from "@/packages/calculator-core/src/datasets/rathena-normalized";

const generatedDir = path.join(
  process.cwd(),
  "nightmare-data/generated/calculator",
);
const slotDir = path.join(generatedDir, "items-by-slot");
const normalizedItems = readJsonFile<RathenaNormalizedItem[]>(
  path.join(
    process.cwd(),
    "nightmare-data/normalized/items/items.en.json",
  ),
);
const localizedItems = readOptionalLocalizedItems(
  path.join(
    process.cwd(),
    "nightmare-data/normalized/items/items.br.json",
  ),
);
const itemById = new Map(normalizedItems.map((item) => [item.itemId, item]));

export type CalculatorItemIndexEntry = {
  id: number;
  name: string;
  sourceName?: string | null;
  searchText?: string | null;
  kind: string;
  cardSlots: number | null;
  refineable: boolean;
  attack: number | null;
  magicAttack: number | null;
  defense: number | null;
  hasModifiers: boolean;
};

export function getCardIndex() {
  return readIndexFile(path.join(generatedDir, "cards-index.json"));
}

export function getSlotItemIndex(slot: string) {
  const safeSlot = slot.replace(/[^a-zA-Z0-9]/g, "");

  return readIndexFile(path.join(slotDir, `${safeSlot}.json`));
}

export function searchItemIndex({
  kind,
  limit,
  query,
  slot,
}: {
  kind?: "card";
  limit: number;
  query?: string;
  slot?: string;
}) {
  const source = kind === "card" ? getCardIndex() : slot ? getSlotItemIndex(slot) : [];
  const normalizedQuery = normalizeSearch(query ?? "");
  const filteredItems = normalizedQuery
    ? source.filter((item) =>
        normalizeSearch(
          `${item.searchText ?? ""} ${item.name} ${item.sourceName ?? ""} ${item.id}`,
        ).includes(normalizedQuery),
      )
    : source;

  return filteredItems.slice(0, limit);
}

export function getItemDetail(itemId: number) {
  const item = itemById.get(itemId);

  if (!item) {
    return null;
  }

  return {
    ...toRoItem(item),
    name: localizedItems.get(item.itemId)?.name ?? item.name,
    refineable: Boolean((item as { refineable?: boolean }).refineable),
    rawType: item.type,
    rawSubType: item.subType,
  };
}

function readIndexFile(filePath: string) {
  if (!fs.existsSync(filePath)) {
    return [];
  }

  return JSON.parse(fs.readFileSync(filePath, "utf8")) as CalculatorItemIndexEntry[];
}

function readJsonFile<T>(filePath: string) {
  return JSON.parse(fs.readFileSync(filePath, "utf8")) as T;
}

function readOptionalLocalizedItems(filePath: string) {
  if (!fs.existsSync(filePath)) {
    return new Map<number, { name: string; unidName?: string | null }>();
  }

  const rawItems = readJsonFile<
    Record<string, { id?: number; name?: string; unidName?: string | null }>
  >(filePath);

  return new Map(
    Object.values(rawItems)
      .filter((item) => typeof item.id === "number" && item.name)
      .map((item) => [
        item.id as number,
        {
          name: item.name as string,
          unidName: item.unidName ?? null,
        },
      ]),
  );
}

function normalizeSearch(value: string) {
  return value
    .normalize("NFD")
    .replace(/\p{Diacritic}/gu, "")
    .trim()
    .toLowerCase();
}
