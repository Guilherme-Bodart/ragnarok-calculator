import fs from "fs";
import path from "path";

const ROOT = process.cwd();

type ItemSampleSource = {
  rawScript?: string | null;
};

type MonsterSampleSource = {
  level?: number;
  hp?: number;
  attackMax?: number;
};

type SkillSampleSource = {
  maxLevel?: number;
  raw?: unknown;
};

type Scored<T> = T & {
  complexityScore: number;
};

function readJson<T>(relativePath: string): T {
  return JSON.parse(
    fs.readFileSync(path.join(ROOT, relativePath), "utf8")
  ) as T;
}

function writeJson(relativePath: string, data: unknown) {
  fs.writeFileSync(
    path.join(ROOT, relativePath),
    JSON.stringify(data, null, 2),
    "utf8"
  );
}

function scoreScript(script: string | null | undefined): number {
  if (!script) return 0;

  let score = 0;

  score += (script.match(/bonus /g) || []).length * 2;
  score += (script.match(/bonus2 /g) || []).length * 3;
  score += (script.match(/bonus3 /g) || []).length * 4;
  score += (script.match(/if\s*\(/g) || []).length * 5;
  score += (script.match(/getrefine/g) || []).length * 8;
  score += (script.match(/getenchantgrade/g) || []).length * 8;
  score += (script.match(/autobonus/g) || []).length * 10;
  score += (script.match(/\.@/g) || []).length * 2;

  score += script.length / 100;

  return score;
}

console.log("Loading data...");

const items = readJson<ItemSampleSource[]>(
  "nightmare-data/normalized/items/items.en.json"
);

const monsters = readJson<MonsterSampleSource[]>(
  "nightmare-data/normalized/monsters/monsters.en.json"
);

const skills = readJson<SkillSampleSource[]>(
  "nightmare-data/normalized/skills/skills.en.json"
);

console.log("Selecting complex items...");

const complexItems = items
  .filter((item) => item.rawScript)
  .map<Scored<ItemSampleSource>>((item) => ({
    ...item,
    complexityScore: Math.round(scoreScript(item.rawScript)),
  }))
  .sort((a, b) => b.complexityScore - a.complexityScore)
  .slice(0, 25);

console.log("Selecting relevant monsters...");

const complexMonsters = monsters
  .map<Scored<MonsterSampleSource>>((monster) => ({
    ...monster,
    complexityScore:
      (monster.level || 0) +
      (monster.hp || 0) / 100000 +
      (monster.attackMax || 0) / 100,
  }))
  .sort((a, b) => b.complexityScore - a.complexityScore)
  .slice(0, 25);

console.log("Selecting relevant skills...");

const complexSkills = skills
  .map<Scored<SkillSampleSource>>((skill) => ({
    ...skill,
    complexityScore:
      JSON.stringify(skill.raw || {}).length +
      (skill.maxLevel || 0) * 10,
  }))
  .sort((a, b) => b.complexityScore - a.complexityScore)
  .slice(0, 25);

console.log("Writing sample files...");

writeJson(
  "nightmare-data/items-sample.json",
  complexItems
);

writeJson(
  "nightmare-data/monsters-sample.json",
  complexMonsters
);

writeJson(
  "nightmare-data/skills-sample.json",
  complexSkills
);

console.log("Done!");
console.log("Generated:");
console.log("- nightmare-data/items-sample.json");
console.log("- nightmare-data/monsters-sample.json");
console.log("- nightmare-data/skills-sample.json");
