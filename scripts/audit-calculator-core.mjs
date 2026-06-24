import { mkdir, readFile, writeFile } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const rootDir = path.resolve(__dirname, "..");
const outputDir = path.join(rootDir, "nightmare-data", "generated", "calculator", "coverage");
const outputPath = path.join(outputDir, "calculator-core-coverage.json");

const paths = {
  items: path.join(rootDir, "nightmare-data", "normalized", "items", "items.en.json"),
  monsters: path.join(rootDir, "nightmare-data", "normalized", "monsters", "monsters.en.json"),
  skills: path.join(rootDir, "nightmare-data", "normalized", "skills", "skills.en.json"),
  skillTree: path.join(rootDir, "nightmare-data", "normalized", "skills", "skill-tree.json"),
  skillTooltips: path.join(rootDir, "nightmare-data", "normalized", "skills", "skill-tooltips.en.json"),
  staticSkillFormulas: path.join(rootDir, "packages", "calculator-core", "src", "skills", "static-skill-formulas.ts"),
};

const actionTargetTypes = new Set(["Attack", "Ground"]);

async function main() {
  const [items, monsters, skills, skillTree, skillTooltips, staticFormulaSource] =
    await Promise.all([
      readJson(paths.items),
      readJson(paths.monsters),
      readJson(paths.skills),
      readJson(paths.skillTree),
      readJson(paths.skillTooltips),
      readFile(paths.staticSkillFormulas, "utf8"),
    ]);

  const report = {
    generatedAt: new Date().toISOString(),
    sources: relativeSources(paths),
    items: auditItems(items),
    monsters: auditMonsters(monsters),
    skills: auditSkills({ skills, skillTree, skillTooltips, staticFormulaSource }),
    nextRecommendedWork: [
      "Implementar mappers para os comandos/statements mais frequentes em items.topScriptCommands e items.topUnsupportedLikeStatements.",
      "Gerar catalogo detalhado de cartas separado de itens comuns.",
      "Expandir inferencia de formulas a partir de skill-tooltips para reduzir fallback generico.",
      "Criar relatorio de buffs/enchants quando as fontes estiverem normalizadas.",
    ],
  };

  await mkdir(outputDir, { recursive: true });
  await writeFile(outputPath, `${JSON.stringify(report, null, 2)}\n`);
  console.log(`Wrote ${path.relative(rootDir, outputPath)}`);
  console.log(
    [
      `items=${report.items.total}`,
      `scriptedItems=${report.items.withRawScript}`,
      `cards=${report.items.cards.total}`,
      `actionSkills=${report.skills.actionSkills.total}`,
      `staticSkillFormulas=${report.skills.formulas.static.total}`,
      `tooltipInferred=${report.skills.formulas.tooltipInferred.total}`,
    ].join(" "),
  );
}

async function readJson(filePath) {
  return JSON.parse(await readFile(filePath, "utf8"));
}

function relativeSources(sourcePaths) {
  return Object.fromEntries(
    Object.entries(sourcePaths).map(([key, value]) => [key, path.relative(rootDir, value)]),
  );
}

function auditItems(items) {
  const scriptedItems = items.filter((item) => item.rawScript?.trim());
  const cards = items.filter((item) => isCard(item));
  const scriptedCards = cards.filter((item) => item.rawScript?.trim());
  const commandCounts = new Map();
  const unsupportedLikeCounts = new Map();

  for (const item of scriptedItems) {
    for (const statement of splitStatements(item.rawScript)) {
      const command = getStatementCommand(statement);

      increment(commandCounts, command);

      if (!isCurrentlySupportedStatement(statement) && !isLowSignalStatement(statement)) {
        increment(unsupportedLikeCounts, normalizeStatement(statement));
      }
    }
  }

  return {
    total: items.length,
    withRawScript: scriptedItems.length,
    refineable: items.filter((item) => item.refineable).length,
    cards: {
      total: cards.length,
      withRawScript: scriptedCards.length,
    },
    topScriptCommands: topEntries(commandCounts, 25),
    topUnsupportedLikeStatements: topEntries(unsupportedLikeCounts, 30),
  };
}

function auditMonsters(monsters) {
  return {
    total: monsters.length,
    withRace: monsters.filter((monster) => Boolean(monster.race)).length,
    withElement: monsters.filter((monster) => Boolean(monster.element)).length,
    withDefense: monsters.filter((monster) => Number.isFinite(monster.defense)).length,
    withMagicDefense: monsters.filter((monster) => Number.isFinite(monster.magicDefense)).length,
  };
}

function auditSkills({ skills, skillTree, skillTooltips, staticFormulaSource }) {
  const skillByCode = new Map(skills.map((skill) => [skill.name, skill]));
  const treeSkills = collectSkillTreeSkills(skillTree);
  const actionSkills = treeSkills.filter((skill) => {
    const info = skillByCode.get(skill.id);

    return info && !info.rawDamageFlags?.NoDamage && actionTargetTypes.has(info.targetType);
  });
  const staticSkillIds = collectStaticSkillFormulaIds(staticFormulaSource);
  const tooltipFormulaSkillIds = collectTooltipFormulaSkillIds(skillTooltips);
  const actionSkillIds = new Set(actionSkills.map((skill) => skill.id));
  const staticActionSkillIds = staticSkillIds.filter((skillId) => actionSkillIds.has(skillId));
  const tooltipActionSkillIds = tooltipFormulaSkillIds.filter((skillId) =>
    actionSkillIds.has(skillId),
  );

  return {
    normalizedTotal: skills.length,
    tree: {
      jobs: countSkillTreeJobs(skillTree),
      uniqueSkills: treeSkills.length,
    },
    actionSkills: {
      total: actionSkills.length,
      staticFormulaCoverage: staticActionSkillIds.length,
      tooltipInferredCoverage: tooltipActionSkillIds.length,
      fallbackLikely: Math.max(
        0,
        actionSkills.length - new Set([...staticActionSkillIds, ...tooltipActionSkillIds]).size,
      ),
      sampleFallbackSkillIds: actionSkills
        .filter(
          (skill) =>
            !staticSkillIds.includes(skill.id) && !tooltipFormulaSkillIds.includes(skill.id),
        )
        .slice(0, 25)
        .map((skill) => skill.id),
    },
    formulas: {
      static: {
        total: staticSkillIds.length,
        skillIds: staticSkillIds,
      },
      tooltipInferred: {
        total: tooltipFormulaSkillIds.length,
        sampleSkillIds: tooltipFormulaSkillIds.slice(0, 50),
      },
    },
  };
}

function isCard(item) {
  return item.type === "Card" || item.subType === "Card" || /card$/i.test(item.aegisName ?? "");
}

function splitStatements(rawScript) {
  return rawScript
    .split(/;\s*/)
    .map((statement) => statement.trim())
    .filter(Boolean)
    .map((statement) => `${statement};`);
}

function getStatementCommand(statement) {
  if (/^\.\@\w+\s*=/.test(statement)) {
    return "assignment";
  }

  if (/^\}+\s*(else)?\s*;?$/.test(statement)) {
    return "blockClose";
  }

  const match = statement.match(/^([A-Za-z_][A-Za-z0-9_]*)/);

  return match?.[1] ?? "unknown";
}

function isCurrentlySupportedStatement(statement) {
  return (
    /^(bonus|bonus2)\s+/i.test(statement) ||
    /^if\s*\(/i.test(statement) ||
    /^\.\@r\s*=\s*getrefine\(\)\s*;$/i.test(statement) ||
    /^\.\@g\s*=\s*getenchantgrade\(\)\s*;$/i.test(statement)
  );
}

function isLowSignalStatement(statement) {
  return (
    /^[\}\s]+(else)?[\}\s]*;?$/.test(statement) ||
    /^\/?\*+\/?;?$/.test(statement)
  );
}

function normalizeStatement(statement) {
  return statement
    .replace(/\b\d+\b/g, "N")
    .replace(/\s+/g, " ")
    .slice(0, 180);
}

function collectSkillTreeSkills(skillTree) {
  const byId = new Map();
  const jobs = Array.isArray(skillTree.jobs) ? skillTree.jobs : Object.values(skillTree.jobs ?? {});

  for (const job of jobs) {
    for (const skill of toArray(job.skills)) {
      if (!byId.has(skill.id)) {
        byId.set(skill.id, skill);
      }
    }
  }

  return Array.from(byId.values());
}

function countSkillTreeJobs(skillTree) {
  return Array.isArray(skillTree.jobs)
    ? skillTree.jobs.length
    : Object.keys(skillTree.jobs ?? {}).length;
}

function toArray(value) {
  if (Array.isArray(value)) {
    return value;
  }

  if (value && typeof value === "object") {
    return Object.values(value);
  }

  return [];
}

function collectStaticSkillFormulaIds(source) {
  return Array.from(source.matchAll(/^\s*([A-Z0-9_]+):/gm), (match) => match[1]).sort();
}

function collectTooltipFormulaSkillIds(tooltips) {
  const descriptionsBySkillCode = tooltips.bySkillCode ?? {};

  return Object.entries(descriptionsBySkillCode)
    .filter(([, tooltip]) => hasTooltipFormulaData(tooltip.descriptionLines ?? []))
    .map(([skillId]) => skillId)
    .sort();
}

function hasTooltipFormulaData(descriptionLines) {
  return descriptionLines.some(
    (line) =>
      /\[Lv\s*\d+\]/i.test(line) &&
      (/\b(?:ATK|MATK)\s*(?:Per Hit\s*)?\d+(?:\.\d+)?%/i.test(line) ||
        /\b(?:x\s*)?\d+\s*times\b/i.test(line)),
  );
}

function increment(map, key) {
  map.set(key, (map.get(key) ?? 0) + 1);
}

function topEntries(map, limit) {
  return Array.from(map.entries())
    .sort((left, right) => right[1] - left[1] || left[0].localeCompare(right[0]))
    .slice(0, limit)
    .map(([key, count]) => ({ key, count }));
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
