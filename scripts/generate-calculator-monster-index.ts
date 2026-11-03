import fs from "fs";
import path from "path";
import { toRoMonster, type RathenaNormalizedMonster } from "../packages/calculator-core/src/datasets/rathena-normalized.ts";

const root = process.cwd();
const inputPath = path.join(
  root,
  "nightmare-data/normalized/monsters/monsters.en.json",
);
const outputDir = path.join(root, "public/data/calculator");
const outputPath = path.join(outputDir, "monsters-index.json");
const generatedIndexPath = path.join(
  root,
  "nightmare-data/generated/calculator/monsters-index.json",
);
const detailsDir = path.join(outputDir, "monsters");

fs.mkdirSync(outputDir, { recursive: true });
fs.mkdirSync(detailsDir, { recursive: true });

// Remove legacy synthetic Cecil Damon dummy (999999) if present
const legacyDummyPath = path.join(detailsDir, "999999.json");
if (fs.existsSync(legacyDummyPath)) {
  fs.rmSync(legacyDummyPath, { force: true });
}

// IDs 22551..22668 are internal rAthena map-range (R10/R20/R30/M10/M20/M30) and
// aura clones of the base Prontera Training Dummies (21064..21088) with identical stats.
function isRedundantCloneDummy(monster: RathenaNormalizedMonster): boolean {
  return monster.monsterId >= 22551 && monster.monsterId <= 22668;
}

function formatMonsterDisplayName(monster: RathenaNormalizedMonster): string {
  // Distinguish 2413 (DUMMY_10_FIRE) from 2408 (DUMMY_10 Neutral)
  if (monster.monsterId === 2413 && monster.name === "Dummy 10") {
    return "Dummy 10 (Fire)";
  }
  // Clarify 21067 (S_DUMMY_100_NOTHING = Formless race) vs Neutral element
  if (monster.monsterId === 21067 && monster.name === "Training Dummy (Neutral)") {
    return "Training Dummy (Formless)";
  }
  return monster.name;
}

const monsters = JSON.parse(fs.readFileSync(inputPath, "utf8")) as RathenaNormalizedMonster[];
const index = monsters
  .filter((monster) => !isRedundantCloneDummy(monster))
  .map((monster) => ({
    id: monster.monsterId,
    name: formatMonsterDisplayName(monster),
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
  const detail = {
    ...toRoMonster(monster),
    name: formatMonsterDisplayName(monster),
  };
  fs.writeFileSync(
    path.join(detailsDir, `${monster.monsterId}.json`),
    JSON.stringify(detail),
    "utf8"
  );
}

const serializedIndex = JSON.stringify(index);
fs.writeFileSync(outputPath, serializedIndex, "utf8");
if (fs.existsSync(path.dirname(generatedIndexPath))) {
  fs.writeFileSync(generatedIndexPath, serializedIndex, "utf8");
}

console.log(`Generated ${index.length} monster index entries and details.`);
