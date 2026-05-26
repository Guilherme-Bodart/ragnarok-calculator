import type { RoMonster } from "../types";

export const monstersSeed: RoMonster[] = [
  {
    id: 1002,
    name: "Poring",
    level: 1,
    race: "plant",
    size: "medium",
    element: "water",
    elementLevel: 1,
    defense: 2,
    magicDefense: 5,
    hp: 60,
    source: "manual",
    sourceUrl: "https://db.irowiki.org/db/monster-info/1002/",
  },
  {
    id: 1031,
    name: "Poporing",
    level: 14,
    race: "plant",
    size: "medium",
    element: "poison",
    elementLevel: 1,
    defense: 24,
    magicDefense: 11,
    hp: 344,
    source: "manual",
    sourceUrl: "https://db.irowiki.org/db/monster-info/1031/",
  },
];
