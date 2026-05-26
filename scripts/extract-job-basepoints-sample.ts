// scripts/extract-job-basepoints-sample.ts

import { readFileSync, writeFileSync, mkdirSync } from "node:fs";
import { dirname, resolve } from "node:path";

const inputPath = resolve("external/rathena/db/re/job_basepoints.yml");
const outputPath = resolve("nightmare-data/job-basepoints-sample.json");

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

type LevelTable = Record<string, number>;

type JobBasepointsGroup = {
  classIds: string[];
  baseHp: LevelTable;
  baseSp: LevelTable;
  baseAp: LevelTable;
};

const yaml = readFileSync(inputPath, "utf8");
const lines = yaml.split(/\r?\n/);

const groups: JobBasepointsGroup[] = [];

let current: JobBasepointsGroup | null = null;
let section: "jobs" | "baseHp" | "baseSp" | "baseAp" | null = null;
let currentLevel: number | null = null;

function flushGroup() {
  if (current && current.classIds.some((id) => wantedJobs.has(id))) {
    groups.push(current);
  }

  current = null;
  section = null;
  currentLevel = null;
}

for (const line of lines) {
  const trimmed = line.trim();

  if (!trimmed || trimmed.startsWith("#")) continue;

  if (trimmed === "- Jobs:") {
    flushGroup();

    current = {
      classIds: [],
      baseHp: {},
      baseSp: {},
      baseAp: {},
    };

    section = "jobs";
    currentLevel = null;
    continue;
  }

  if (!current) continue;

  if (trimmed === "BaseHp:") {
    section = "baseHp";
    currentLevel = null;
    continue;
  }

  if (trimmed === "BaseSp:") {
    section = "baseSp";
    currentLevel = null;
    continue;
  }

  if (trimmed === "BaseAp:") {
    section = "baseAp";
    currentLevel = null;
    continue;
  }

  if (section === "jobs") {
    const jobMatch = /^([A-Za-z0-9_]+):\s+true$/.exec(trimmed);

    if (jobMatch) {
      current.classIds.push(jobMatch[1]);
    }

    continue;
  }

  const levelMatch = /^-\s+Level:\s+(\d+)$/.exec(trimmed);

  if (levelMatch) {
    currentLevel = Number(levelMatch[1]);
    continue;
  }

  if (currentLevel != null && section === "baseHp") {
    const hpMatch = /^Hp:\s+(\d+)$/.exec(trimmed);

    if (hpMatch) {
      current.baseHp[String(currentLevel)] = Number(hpMatch[1]);
    }

    continue;
  }

  if (currentLevel != null && section === "baseSp") {
    const spMatch = /^Sp:\s+(\d+)$/.exec(trimmed);

    if (spMatch) {
      current.baseSp[String(currentLevel)] = Number(spMatch[1]);
    }

    continue;
  }

  if (currentLevel != null && section === "baseAp") {
    const apMatch = /^Ap:\s+(\d+)$/.exec(trimmed);

    if (apMatch) {
      current.baseAp[String(currentLevel)] = Number(apMatch[1]);
    }

    continue;
  }
}

flushGroup();

const normalized = groups.map((group) => {
  const output: Record<string, unknown> = {
    classIds: group.classIds,
    baseHp: group.baseHp,
    baseSp: group.baseSp,
  };

  if (Object.keys(group.baseAp).length > 0) {
    output.baseAp = group.baseAp;
  }

  return output;
});

mkdirSync(dirname(outputPath), { recursive: true });
writeFileSync(outputPath, `${JSON.stringify(normalized, null, 2)}\n`);

console.log(
  JSON.stringify(
    {
      inputPath,
      outputPath,
      groups: normalized.length,
      classes: normalized.flatMap((group) => group.classIds as string[]).length,
      hpEntries: normalized.reduce(
        (total, group) =>
          total + Object.keys(group.baseHp as Record<string, number>).length,
        0,
      ),
      spEntries: normalized.reduce(
        (total, group) =>
          total + Object.keys(group.baseSp as Record<string, number>).length,
        0,
      ),
      apEntries: normalized.reduce(
        (total, group) =>
          total +
          Object.keys((group.baseAp as Record<string, number>) ?? {}).length,
        0,
      ),
    },
    null,
    2,
  ),
);