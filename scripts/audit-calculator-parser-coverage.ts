import { mkdir, readFile, writeFile } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { analyzeSamples } from "../packages/calculator-core/src/modifiers/sample-analysis";

type NormalizedItem = {
  itemId: number;
  name: string;
  rawScript?: string | null;
};

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const rootDir = path.resolve(__dirname, "..");
const itemsPath = path.join(
  rootDir,
  "nightmare-data",
  "normalized",
  "items",
  "items.en.json",
);
const outputDir = path.join(
  rootDir,
  "nightmare-data",
  "generated",
  "calculator",
  "coverage",
);
const outputPath = path.join(outputDir, "calculator-parser-coverage.json");

async function main() {
  const items = JSON.parse(await readFile(itemsPath, "utf8")) as NormalizedItem[];
  const report = analyzeSamples(
    {
      items: items.map((item) => ({
        itemId: item.itemId,
        name: item.name,
        rawScript: item.rawScript ?? undefined,
      })),
      skills: [],
      monsters: [],
    },
    undefined,
    {
      baseLevel: 260,
      refine: 12,
      grade: 4,
    },
  );

  await mkdir(outputDir, { recursive: true });
  await writeFile(outputPath, `${JSON.stringify(report, null, 2)}\n`);

  console.log(`Wrote ${path.relative(rootDir, outputPath)}`);
  console.log(
    [
      `itemScripts=${report.itemScripts}`,
      `fullySupported=${report.fullySupportedItemScripts}`,
      `partiallySupported=${report.partiallySupportedItemScripts}`,
      `unsupportedStatements=${report.unsupportedStatements}`,
      `modifiers=${report.totalModifiers}`,
    ].join(" "),
  );
  console.log(
    JSON.stringify(
      report.unsupportedCommands
        .filter((command) => command.reason === "unsupported-bonus-code")
        .slice(0, 10)
        .map(({ command, count }) => ({ command, count })),
      null,
      2,
    ),
  );
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
