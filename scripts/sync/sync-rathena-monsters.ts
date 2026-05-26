import fs from "fs";
import path from "path";
import YAML from "yaml";
import { z } from "zod";

const RawMonsterSchema = z.object({
  Id: z.number(),
  AegisName: z.string().optional(),
  Name: z.string().optional(),
  Level: z.number().optional(),
  Hp: z.number().optional(),
  BaseExp: z.number().optional(),
  JobExp: z.number().optional(),
  Attack: z.number().optional(),
  Attack2: z.number().optional(),
  Defense: z.number().optional(),
  MagicDefense: z.number().optional(),
  Str: z.number().optional(),
  Agi: z.number().optional(),
  Vit: z.number().optional(),
  Int: z.number().optional(),
  Dex: z.number().optional(),
  Luk: z.number().optional(),
  AttackRange: z.number().optional(),
  SkillRange: z.number().optional(),
  ChaseRange: z.number().optional(),
  Size: z.string().optional(),
  Race: z.string().optional(),
  Element: z.string().optional(),
  ElementLevel: z.number().optional(),
}).passthrough();

type NightmareMonster = {
  monsterId: number;
  aegisName: string | null;
  name: string;
  level: number | null;
  hp: number | null;
  baseExp: number | null;
  jobExp: number | null;
  attackMin: number | null;
  attackMax: number | null;
  defense: number | null;
  magicDefense: number | null;
  stats: {
    str: number | null;
    agi: number | null;
    vit: number | null;
    int: number | null;
    dex: number | null;
    luk: number | null;
  };
  attackRange: number | null;
  skillRange: number | null;
  chaseRange: number | null;
  size: string | null;
  race: string | null;
  element: string | null;
  elementLevel: number | null;
  source: "rathena";
};

const ROOT = process.cwd();
const rawDir = path.join(ROOT, "nightmare-data/raw/rathena");
const outputDir = path.join(ROOT, "nightmare-data/normalized/monsters");

fs.mkdirSync(outputDir, { recursive: true });

const filePath = path.join(rawDir, "mob_db.yml");

if (!fs.existsSync(filePath)) {
  throw new Error(`Arquivo não encontrado: ${filePath}`);
}

const content = fs.readFileSync(filePath, "utf8");

const parsed = YAML.parse(content, {
  uniqueKeys: false,
});

const body = Array.isArray(parsed) ? parsed : parsed.Body;

if (!Array.isArray(body)) {
  throw new Error("Formato inesperado em mob_db.yml");
}

const monsters: NightmareMonster[] = [];

for (const rawMonster of body) {
  const result = RawMonsterSchema.safeParse(rawMonster);

  if (!result.success) {
    console.warn("Monstro inválido ignorado:", rawMonster?.Id);
    continue;
  }

  const monster = result.data;

  monsters.push({
    monsterId: monster.Id,
    aegisName: monster.AegisName ?? null,
    name: monster.Name ?? monster.AegisName ?? `Monster ${monster.Id}`,
    level: monster.Level ?? null,
    hp: monster.Hp ?? null,
    baseExp: monster.BaseExp ?? null,
    jobExp: monster.JobExp ?? null,
    attackMin: monster.Attack ?? null,
    attackMax: monster.Attack2 ?? null,
    defense: monster.Defense ?? null,
    magicDefense: monster.MagicDefense ?? null,
    stats: {
      str: monster.Str ?? null,
      agi: monster.Agi ?? null,
      vit: monster.Vit ?? null,
      int: monster.Int ?? null,
      dex: monster.Dex ?? null,
      luk: monster.Luk ?? null,
    },
    attackRange: monster.AttackRange ?? null,
    skillRange: monster.SkillRange ?? null,
    chaseRange: monster.ChaseRange ?? null,
    size: monster.Size ?? null,
    race: monster.Race ?? null,
    element: monster.Element ?? null,
    elementLevel: monster.ElementLevel ?? null,
    source: "rathena",
  });
}

monsters.sort((a, b) => a.monsterId - b.monsterId);

fs.writeFileSync(
  path.join(outputDir, "monsters.en.json"),
  JSON.stringify(monsters, null, 2),
  "utf8"
);

console.log(`Monstros importados: ${monsters.length}`);
console.log(`Arquivo gerado: nightmare-data/normalized/monsters/monsters.en.json`);