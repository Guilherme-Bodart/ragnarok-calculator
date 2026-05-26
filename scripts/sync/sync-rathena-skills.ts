import fs from "fs";
import path from "path";
import YAML from "yaml";
import { z } from "zod";

const RawSkillSchema = z.object({
    Id: z.number(),
    Name: z.string().optional(),
    Description: z.string().optional(),
    MaxLevel: z.number().optional(),
    Type: z.string().optional(),
    TargetType: z.string().optional(),
    DamageFlags: z.any().optional(),
    Flags: z.any().optional(),
    Hit: z.string().optional(),
    Element: z.union([
        z.string(),
        z.array(z.object({
            Level: z.number(),
            Element: z.string(),
        })),
    ]).optional(),
    SplashArea: z.any().optional(),
    ActiveInstance: z.any().optional(),
    KnockBackTiles: z.any().optional(),
    CastCancel: z.boolean().optional(),
    CastDefenseReduction: z.number().optional(),
    SkillData1: z.any().optional(),
    SkillData2: z.any().optional(),
    SkillData3: z.any().optional(),
}).passthrough();

type NightmareSkill = {
    skillId: number;
    name: string;
    description: string | null;
    maxLevel: number | null;
    type: string | null;
    targetType: string | null;
    hit: string | null;
    element: unknown;
    rawFlags: unknown;
    rawDamageFlags: unknown;
    raw: unknown;
    source: "rathena";
};

const ROOT = process.cwd();
const rawDir = path.join(ROOT, "nightmare-data/raw/rathena");
const outputDir = path.join(ROOT, "nightmare-data/normalized/skills");

fs.mkdirSync(outputDir, { recursive: true });

const filePath = path.join(rawDir, "skill_db.yml");

if (!fs.existsSync(filePath)) {
    throw new Error(`Arquivo não encontrado: ${filePath}`);
}

const content = fs.readFileSync(filePath, "utf8");

const parsed = YAML.parse(content, {
    uniqueKeys: false,
});

const body = Array.isArray(parsed) ? parsed : parsed.Body;

if (!Array.isArray(body)) {
    throw new Error("Formato inesperado em skill_db.yml");
}

const skills: NightmareSkill[] = [];

for (const rawSkill of body) {
    const result = RawSkillSchema.safeParse(rawSkill);

    if (!result.success) {
        console.warn("Skill inválida ignorada:", rawSkill?.Id);
        continue;
    }

    const skill = result.data;

    skills.push({
        skillId: skill.Id,
        name: skill.Name ?? `Skill ${skill.Id}`,
        description: skill.Description ?? null,
        maxLevel: skill.MaxLevel ?? null,
        type: skill.Type ?? null,
        targetType: skill.TargetType ?? null,
        hit: skill.Hit ?? null,
        element: skill.Element ?? null,
        rawFlags: skill.Flags ?? null,
        rawDamageFlags: skill.DamageFlags ?? null,
        raw: rawSkill,
        source: "rathena",
    });
}

skills.sort((a, b) => a.skillId - b.skillId);

fs.writeFileSync(
    path.join(outputDir, "skills.en.json"),
    JSON.stringify(skills, null, 2),
    "utf8"
);

console.log(`Skills importadas: ${skills.length}`);
console.log(`Arquivo gerado: nightmare-data/normalized/skills/skills.en.json`);