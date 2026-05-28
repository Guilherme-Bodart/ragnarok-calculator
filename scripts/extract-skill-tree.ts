import { mkdir, readFile, writeFile } from "node:fs/promises";
import path from "node:path";
import YAML from "yaml";

type RawSkillRequirement = {
  Name: string;
  Level?: number;
};

type RawSkillTreeSkill = {
  Name: string;
  MaxLevel?: number;
  BaseLevel?: number;
  JobLevel?: number;
  Exclude?: boolean;
  Requires?: RawSkillRequirement[];
};

type RawSkillTreeJob = {
  Job: string;
  Inherit?: Record<string, boolean>;
  Tree?: RawSkillTreeSkill[];
};

async function main() {
  const inputPath = path.resolve("external/rathena/db/re/skill_tree.yml");
  const outputDir = path.resolve("nightmare-data/normalized/skills");
  const outputPath = path.join(outputDir, "skill-tree.json");

  const raw = await readFile(inputPath, "utf8");
  const parsed = YAML.parse(raw);
  const body = (parsed.Body ?? []) as RawSkillTreeJob[];

  const jobs = Object.fromEntries(
    body.map((job) => [
      job.Job,
      {
        inherit: job.Inherit ?? [],
        skills: Object.fromEntries(
          (job.Tree ?? []).map((skill) => [
            skill.Name,
            {
              id: skill.Name,
              maxLevel: skill.MaxLevel ?? 0,
              baseLevel: skill.BaseLevel ?? 0,
              jobLevel: skill.JobLevel ?? 0,
              exclude: skill.Exclude ?? false,
              requires: (skill.Requires ?? []).map((req) => ({
                id: req.Name,
                level: req.Level ?? 1,
              })),
            },
          ]),
        ),
      },
    ]),
  );

  await mkdir(outputDir, { recursive: true });

  await writeFile(
    outputPath,
    JSON.stringify(
      {
        generatedAt: new Date().toISOString(),
        jobs,
      },
      null,
      2,
    ),
    "utf8",
  );

  console.log(`Generated: ${outputPath}`);
}

main().catch((error) => {
  console.error("Failed to extract skill tree:");
  console.error(error);
  process.exit(1);
});
