import fs from "fs";
import path from "path";
import yaml from "yaml";

const root = process.cwd();
const inputPath = path.join(root, "external/rathena/db/re/mob_db.yml");
const outputPath = path.join(root, "nightmare-data/normalized/monsters/monsters.en.json");

console.log(`Reading ${inputPath}...`);
const fileContents = fs.readFileSync(inputPath, "utf8");

const parsed = yaml.parse(fileContents, { uniqueKeys: false });

let monstersArray = Array.isArray(parsed) ? parsed : (parsed?.Body || parsed?.Header?.Body || []);

// Some yaml structures have a "Body" wrapper.
if (!Array.isArray(monstersArray)) {
    console.error("monstersArray is not an array. Check yaml structure.");
    process.exit(1);
}

console.log(`Found ${monstersArray.length} monsters in YAML. Parsing...`);

const normalizedMonsters = monstersArray.map((mob: any) => {
  let isBoss = false;
  if (mob.Modes) {
    if (mob.Modes.Boss === true) {
      isBoss = true;
    }
  }

  return {
    monsterId: mob.Id,
    aegisName: mob.AegisName,
    name: mob.Name,
    level: mob.Level ?? 1,
    hp: mob.Hp ?? 1,
    baseExp: mob.BaseExp ?? 0,
    jobExp: mob.JobExp ?? 0,
    attackMin: mob.Attack ?? 0,
    attackMax: mob.Attack2 ?? 0,
    defense: mob.Defense ?? 0,
    magicDefense: mob.MagicDefense ?? 0,
    stats: {
      str: mob.Str ?? 0,
      agi: mob.Agi ?? 0,
      vit: mob.Vit ?? 0,
      int: mob.Int ?? 0,
      dex: mob.Dex ?? 0,
      luk: mob.Luk ?? 0,
    },
    attackRange: mob.AttackRange ?? 1,
    skillRange: mob.SkillRange ?? 1,
    chaseRange: mob.ChaseRange ?? 1,
    size: mob.Size ?? "Medium",
    race: mob.Race ?? "Formless",
    element: mob.Element ?? "Neutral",
    elementLevel: mob.ElementLevel ?? 1,
    isBoss: isBoss,
    source: "rathena"
  };
});

fs.writeFileSync(outputPath, JSON.stringify(normalizedMonsters, null, 2), "utf8");
console.log(`Successfully wrote ${normalizedMonsters.length} normalized monsters to ${outputPath}`);
