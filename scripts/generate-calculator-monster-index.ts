import fs from "fs";
import path from "path";
import { toRoMonster, type RathenaNormalizedMonster } from "../packages/calculator-core/src/datasets/rathena-normalized";

const root = process.cwd();
const inputPath = path.join(
  root,
  "nightmare-data/normalized/monsters/monsters.en.json",
);
const outputDir = path.join(root, "public/data/calculator");
const outputPath = path.join(outputDir, "monsters-index.json");
const detailsDir = path.join(outputDir, "monsters");

fs.mkdirSync(outputDir, { recursive: true });
fs.mkdirSync(detailsDir, { recursive: true });

const monsters = JSON.parse(fs.readFileSync(inputPath, "utf8")) as RathenaNormalizedMonster[];
const index = monsters
  .map((monster) => ({
    id: monster.monsterId,
    name: monster.name,
    level: monster.level ?? null,
    race: monster.race ?? null,
    size: monster.size ?? null,
    element: monster.element ?? null,
    elementLevel: monster.elementLevel ?? null,
    hp: monster.hp ?? null,
    defense: monster.defense ?? null,
    magicDefense: monster.magicDefense ?? null,
  }))
  .sort((first, second) => first.name.localeCompare(second.name, "en"));

for (const monster of monsters) {
  const detail = toRoMonster(monster);
  fs.writeFileSync(
    path.join(detailsDir, `${monster.monsterId}.json`),
    JSON.stringify(detail),
    "utf8"
  );
}

const DUMMY_TARGET_ID = 999999;
const dummyTarget = {
  id: DUMMY_TARGET_ID,
  name: "Cecil Damon (Test Dummy)",
  level: 160,
  race: "demi-human",
  size: "medium",
  element: "neutral",
  elementLevel: 1,
  hp: 10000000,
  defense: 100,
  magicDefense: 100,
};
const dummyTargetDetail = {
  id: DUMMY_TARGET_ID,
  name: "Cecil Damon (Test Dummy)",
  level: 160,
  hp: 10000000,
  baseExp: 0,
  jobExp: 0,
  attack: 0,
  magicAttack: 0,
  defense: 100,
  magicDefense: 100,
  race: "demi-human" as const,
  size: "medium" as const,
  element: "neutral" as const,
  elementLevel: 1,
  classType: "normal" as const,
  elementResistanceRates: {},
};

index.unshift(dummyTarget);
fs.writeFileSync(
  path.join(detailsDir, `${DUMMY_TARGET_ID}.json`),
  JSON.stringify(dummyTargetDetail),
  "utf8"
);

fs.writeFileSync(outputPath, JSON.stringify(index), "utf8");

console.log(`Generated ${index.length} monster index entries and details.`);
