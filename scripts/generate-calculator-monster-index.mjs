import fs from "fs";
import path from "path";

const root = process.cwd();
const inputPath = path.join(
  root,
  "nightmare-data/normalized/monsters/monsters.en.json",
);
const outputDir = path.join(root, "nightmare-data/generated/calculator");
const outputPath = path.join(outputDir, "monsters-index.json");

fs.mkdirSync(outputDir, { recursive: true });

const monsters = JSON.parse(fs.readFileSync(inputPath, "utf8"));
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

fs.writeFileSync(outputPath, JSON.stringify(index), "utf8");

console.log(`Generated ${index.length} monster index entries.`);
