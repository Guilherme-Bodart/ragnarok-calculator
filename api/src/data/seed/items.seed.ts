import type { RoItem } from "../types";

export const itemsSeed: RoItem[] = [
  {
    id: 1201,
    name: "Knife",
    kind: "equipment",
    slots: ["weapon"],
    attack: 17,
    cardSlots: 3,
    modifiers: [],
    source: "manual",
    sourceUrl: "https://db.irowiki.org/db/item-info/1201/",
  },
  {
    id: 4001,
    name: "Poring Card",
    kind: "card",
    modifiers: [
      {
        stat: "atk",
        operator: "addFlat",
        value: 5,
        target: { type: "self" },
        conditions: [],
        source: { format: "rathena", command: "bonus", raw: "bonus bBaseAtk,5;", args: ["bBaseAtk", "5"] },
      },
    ],
    source: "manual",
    sourceUrl: "https://db.irowiki.org/db/item-info/4001/",
  },
  {
    id: 24000,
    name: "Nightmare Shadow Weapon",
    kind: "shadow",
    slots: ["shadowWeapon"],
    modifiers: [
      {
        stat: "atkRate",
        operator: "addFlat",
        value: 3,
        target: { type: "self" },
        conditions: [],
        source: { format: "rathena", command: "bonus", raw: "bonus bAtkRate,3;", args: ["bAtkRate", "3"] },
      },
    ],
    source: "manual",
  },
];
