import { readFileSync, writeFileSync, mkdirSync } from "node:fs";
import { dirname, resolve } from "node:path";

type StatKey =
  | "Str"
  | "Agi"
  | "Vit"
  | "Int"
  | "Dex"
  | "Luk"
  | "Pow"
  | "Sta"
  | "Wis"
  | "Spl"
  | "Con"
  | "Crt";

const inputPath = resolve("external/rathena/db/re/job_stats.yml");
const outputPath = resolve("nightmare-data/job-stats-sample.json");

const wantedJobs = new Set([
  "Novice",
  "Swordman",
  "Mage",
  "Archer",
  "Acolyte",
  "Merchant",
  "Thief",

  "Knight",
  "Wizard",
  "Hunter",
  "Priest",
  "Blacksmith",
  "Assassin",

  "Lord_Knight",
  "High_Wizard",
  "Sniper",
  "High_Priest",
  "Whitesmith",
  "Assassin_Cross",

  "Rune_Knight",
  "Warlock",
  "Ranger",
  "Arch_Bishop",
  "Mechanic",
  "Guillotine_Cross",

  "Dragon_Knight",
  "Arch_Mage",
  "Windhawk",
  "Cardinal",
  "Meister",
  "Shadow_Cross",
]);

const statKeys: StatKey[] = [
  "Str",
  "Agi",
  "Vit",
  "Int",
  "Dex",
  "Luk",
  "Pow",
  "Sta",
  "Wis",
  "Spl",
  "Con",
  "Crt",
];

const yaml = readFileSync(inputPath, "utf8");
const lines = yaml.split(/\r?\n/);

type JobGroup = {
  classIds: string[];
  maxJobLevel?: number;
  bonusStats: Array<Record<string, number>>;
};

const groups: JobGroup[] = [];
let current: JobGroup | null = null;
let inJobs = false;
let inBonusStats = false;
let currentBonus: Record<string, number> | null = null;

function countIndent(line: string) {
  return line.match(/^ */)?.[0].length ?? 0;
}

function flushBonus() {
  if (current && currentBonus) {
    current.bonusStats.push(currentBonus);
  }
  currentBonus = null;
}

function flushGroup() {
  flushBonus();

  if (current && current.classIds.some((id) => wantedJobs.has(id))) {
    groups.push(current);
  }

  current = null;
  inJobs = false;
  inBonusStats = false;
}

for (const line of lines) {
  const trimmed = line.trim();

  if (!trimmed || trimmed.startsWith("#")) continue;

  if (/^-\s+Jobs:\s*$/.test(trimmed)) {
    flushGroup();
    current = {
      classIds: [],
      bonusStats: [],
    };
    inJobs = true;
    inBonusStats = false;
    continue;
  }

  if (!current) continue;

  const indent = countIndent(line);

  if (indent === 4 && /^[A-Za-z]+/.test(trimmed) && !trimmed.startsWith("-")) {
    inJobs = false;
    inBonusStats = false;
  }

  if (inJobs) {
    const jobMatch = /^([A-Za-z0-9_]+):\s+true$/.exec(trimmed);
    if (jobMatch) {
      current.classIds.push(jobMatch[1]);
    }
    continue;
  }

  const maxJobMatch = /^MaxJobLevel:\s+(\d+)$/.exec(trimmed);
  if (maxJobMatch) {
    current.maxJobLevel = Number(maxJobMatch[1]);
    continue;
  }

  if (/^BonusStats:\s*$/.test(trimmed)) {
    inBonusStats = true;
    continue;
  }

  if (inBonusStats) {
    const levelMatch = /^-\s+Level:\s+(\d+)$/.exec(trimmed);
    if (levelMatch) {
      flushBonus();
      currentBonus = {
        level: Number(levelMatch[1]),
      };
      continue;
    }

    const statMatch = /^([A-Za-z]+):\s+(-?\d+)$/.exec(trimmed);
    if (statMatch && currentBonus && statKeys.includes(statMatch[1] as StatKey)) {
      const key = statMatch[1].toLowerCase();
      currentBonus[key] = Number(statMatch[2]);
      continue;
    }
  }
}

flushGroup();

const normalized = groups.map((group) => ({
  classIds: group.classIds,
  maxJobLevel: group.maxJobLevel,
  bonusStats: group.bonusStats,
}));

mkdirSync(dirname(outputPath), { recursive: true });
writeFileSync(outputPath, `${JSON.stringify(normalized, null, 2)}\n`);

console.log(
  JSON.stringify(
    {
      inputPath,
      outputPath,
      groups: normalized.length,
      classes: normalized.flatMap((group) => group.classIds).length,
      bonusEntries: normalized.reduce(
        (total, group) => total + group.bonusStats.length,
        0,
      ),
    },
    null,
    2,
  ),
);