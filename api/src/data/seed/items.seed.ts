import type { RoItem } from "../types";

export const itemsSeed: RoItem[] = [
  {
    id: 1201,
    name: "Knife",
    kind: "equipment",
    slots: ["weapon"],
    attack: 17,
    cardSlots: 3,
    bonuses: [],
    source: "manual",
    sourceUrl: "https://db.irowiki.org/db/item-info/1201/",
  },
  {
    id: 4001,
    name: "Poring Card",
    kind: "card",
    bonuses: [{ type: "flatAtk", value: 5 }],
    source: "manual",
    sourceUrl: "https://db.irowiki.org/db/item-info/4001/",
  },
  {
    id: 24000,
    name: "Nightmare Shadow Weapon",
    kind: "shadow",
    slots: ["shadowWeapon"],
    bonuses: [{ type: "atkRate", value: 3 }],
    source: "manual",
  },
];
