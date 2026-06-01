import { mkdir, readFile, writeFile } from "node:fs/promises";
import path from "node:path";
import { z } from "zod";

const IroSkillSchema = z.object({
  skill_id: z.number(),
  skill_code: z.string(),
  skill_name: z.string(),
  skill_description: z.array(z.string()).default([]),
  skill_type: z.string().nullable().optional(),
  max_level: z.number().nullable().optional(),
  sp: z.array(z.number()).nullable().optional(),
  ap: z.array(z.number()).nullable().optional(),
  attack_range: z.array(z.number()).nullable().optional(),
  needed_skills: z
    .array(
      z.object({
        skill_id: z.number().optional(),
        skill_code: z.string().optional(),
        skill_name: z.string().optional(),
        level: z.number().optional(),
      }).passthrough(),
    )
    .default([]),
}).passthrough();

const NormalizedSkillSchema = z.object({
  skillId: z.number(),
  name: z.string(),
  description: z.string().nullable(),
  maxLevel: z.number().nullable(),
}).passthrough();

const SkillTreeSchema = z.object({
  jobs: z.record(
    z.string(),
    z.object({
      skills: z.record(
        z.string(),
        z.object({
          id: z.string(),
        }).passthrough(),
      ),
    }).passthrough(),
  ),
}).passthrough();

type IroSkill = z.infer<typeof IroSkillSchema>;
type SkillTooltip = {
  skillId: number;
  skillCode: string;
  name: string;
  maxLevel: number | null;
  type: string | null;
  sp: number[] | null;
  ap: number[] | null;
  attackRange: number[] | null;
  neededSkills: IroSkill["needed_skills"];
  descriptionLines: string[];
  rawDescriptionLines: string[];
};

const root = process.cwd();
const rawPath = path.join(root, "nightmare-data/raw/iRo/skill_tree.json");
const normalizedSkillsPath = path.join(
  root,
  "nightmare-data/normalized/skills/skills.en.json",
);
const skillTreePath = path.join(
  root,
  "nightmare-data/normalized/skills/skill-tree.json",
);
const outputDir = path.join(root, "nightmare-data/normalized/skills");
const tooltipOutputPath = path.join(outputDir, "skill-tooltips.en.json");
const reportOutputPath = path.join(outputDir, "skill-tooltips.en.report.json");

async function main() {
  const [rawIroSkills, normalizedSkills, skillTree] = await Promise.all([
    readJson(rawPath),
    readJson(normalizedSkillsPath),
    readJson(skillTreePath),
  ]);
  const iroSkills = z.array(IroSkillSchema).parse(rawIroSkills);
  const skills = z.array(NormalizedSkillSchema).parse(normalizedSkills);
  const parsedSkillTree = SkillTreeSchema.parse(skillTree);
  const normalizedSkillCodes = new Set(skills.map((skill) => skill.name));
  const treeSkillCodes = collectTreeSkillCodes(parsedSkillTree.jobs);
  const tooltips: Record<string, SkillTooltip> = {};
  const duplicateCodes: string[] = [];

  for (const skill of iroSkills) {
    if (tooltips[skill.skill_code]) {
      duplicateCodes.push(skill.skill_code);
      continue;
    }

    tooltips[skill.skill_code] = {
      skillId: skill.skill_id,
      skillCode: skill.skill_code,
      name: skill.skill_name,
      maxLevel: skill.max_level ?? null,
      type: skill.skill_type ?? null,
      sp: skill.sp ?? null,
      ap: skill.ap ?? null,
      attackRange: skill.attack_range ?? null,
      neededSkills: skill.needed_skills,
      descriptionLines: cleanDescriptionLines(skill.skill_description),
      rawDescriptionLines: skill.skill_description,
    };
  }

  const tooltipCodes = new Set(Object.keys(tooltips));
  const matchedTreeSkills = [...treeSkillCodes]
    .filter((skillCode) => tooltipCodes.has(skillCode))
    .sort();
  const missingTreeSkills = [...treeSkillCodes]
    .filter((skillCode) => !tooltipCodes.has(skillCode))
    .sort();
  const extraIroSkills = [...tooltipCodes]
    .filter((skillCode) => !normalizedSkillCodes.has(skillCode))
    .sort();

  await mkdir(outputDir, { recursive: true });
  await writeFile(
    tooltipOutputPath,
    `${JSON.stringify(
      {
        generatedAt: new Date().toISOString(),
        locale: "en",
        source: "irowiki",
        bySkillCode: sortRecord(tooltips),
      },
      null,
      2,
    )}\n`,
    "utf8",
  );
  await writeFile(
    reportOutputPath,
    `${JSON.stringify(
      {
        generatedAt: new Date().toISOString(),
        rawIroSkills: iroSkills.length,
        normalizedSkills: skills.length,
        generatedTooltips: Object.keys(tooltips).length,
        uniqueTreeSkills: treeSkillCodes.size,
        matchedTreeSkills: matchedTreeSkills.length,
        missingTreeSkillCodes: missingTreeSkills,
        extraIroSkills: extraIroSkills.length,
        duplicateCodes,
      },
      null,
      2,
    )}\n`,
    "utf8",
  );

  console.log(`Tooltips gerados: ${Object.keys(tooltips).length}`);
  console.log(`Skills da arvore com tooltip: ${matchedTreeSkills.length}/${treeSkillCodes.size}`);
  console.log(`Skills da arvore sem tooltip: ${missingTreeSkills.length}`);
  console.log(`Arquivo: ${path.relative(root, tooltipOutputPath)}`);
  console.log(`Relatorio: ${path.relative(root, reportOutputPath)}`);
}

async function readJson(filePath: string) {
  return JSON.parse(await readFile(filePath, "utf8"));
}

function collectTreeSkillCodes(
  jobs: z.infer<typeof SkillTreeSchema>["jobs"],
): Set<string> {
  const skillCodes = new Set<string>();

  for (const job of Object.values(jobs)) {
    for (const skill of Object.values(job.skills)) {
      skillCodes.add(skill.id);
    }
  }

  return skillCodes;
}

function cleanDescriptionLines(lines: string[]) {
  return lines
    .map((line) =>
      line
        .replace(/\^[0-9a-fA-F]{6}/g, "")
        .replace(/\s+/g, " ")
        .trim(),
    )
    .filter((line) => line.length > 0 && line !== "_");
}

function sortRecord<T>(record: Record<string, T>) {
  return Object.fromEntries(
    Object.entries(record).sort(([firstKey], [secondKey]) =>
      firstKey.localeCompare(secondKey, "en"),
    ),
  );
}

main().catch((error) => {
  console.error("Falha ao gerar tooltips de skill:");
  console.error(error);
  process.exit(1);
});
