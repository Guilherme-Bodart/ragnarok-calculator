import type { RoSkill } from "../types";

export const skillsSeed: RoSkill[] = [
  {
    id: "SM_BASH",
    name: "Bash",
    classTree: "Swordman",
    damageType: "physical",
    maxLevel: 10,
    hitCount: 1,
    baseMultiplierByLevel: {
      "1": 130,
      "2": 160,
      "3": 190,
      "4": 220,
      "5": 250,
      "6": 280,
      "7": 310,
      "8": 340,
      "9": 370,
      "10": 400
    },
    source: "manual",
    sourceUrl: "https://irowiki.org/wiki/Bash",
  },
  {
    id: "MG_COLDBOLT",
    name: "Cold Bolt",
    classTree: "Mage",
    damageType: "magical",
    maxLevel: 10,
    hitCount: 1,
    baseMultiplierByLevel: {
      "1": 100,
      "2": 200,
      "3": 300,
      "4": 400,
      "5": 500,
      "6": 600,
      "7": 700,
      "8": 800,
      "9": 900,
      "10": 1000
    },
    source: "manual",
    sourceUrl: "https://irowiki.org/wiki/Cold_Bolt",
  }
];
