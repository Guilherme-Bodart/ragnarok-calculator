import { mkdir, readFile, readdir, writeFile } from "node:fs/promises";
import { existsSync } from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const rootDir = path.resolve(__dirname, "..");
const spritesDir = path.join(rootDir, "public", "sprites");
const walkerSpritesManifestPath = path.join(rootDir, "components", "site", "walker-sprites.json");
const customCharacterPath = path.join(__dirname, "costume-character.json");
const exampleCharacterPath = path.join(__dirname, "costume-character.example.json");
const defaultOutputPath = path.join(spritesDir, "walker1.apng");

const endpoint =
  "https://api.costume.irowiki.org/render?downloadimage&accesstoken=3iznpprsozjn3nh6rvdvqn2fl89mo1jd";

async function fetchRender(character) {
  const response = await fetch(endpoint, {
    method: "POST",
    headers: {
      "Content-Type": "application/vnd.api+json",
    },
    body: JSON.stringify({
      ...character,
      action: character.action ?? 8,
    }),
  });

  if (!response.ok) {
    throw new Error(`Costume render failed with HTTP ${response.status}.`);
  }

  const contentType = response.headers.get("content-type") ?? "";
  if (!contentType.includes("image/png")) {
    throw new Error(`Costume render returned ${contentType}, expected image/png.`);
  }

  const buffer = Buffer.from(await response.arrayBuffer());
  if (!buffer.includes(Buffer.from("acTL"))) {
    throw new Error("Costume render returned a static PNG, expected APNG.");
  }

  return buffer;
}

async function main() {
  const args = parseArgs(process.argv.slice(2));

  if (args.refreshManifest) {
    await updateWalkerSpritesManifest();
    console.log(`Updated ${path.relative(rootDir, walkerSpritesManifestPath)}.`);
    return;
  }

  const characterPath = args.config
    ? path.resolve(args.config)
    : existsSync(customCharacterPath)
      ? customCharacterPath
      : exampleCharacterPath;
  const outputPath = args.output
    ? resolveOutputPath(args.output)
    : args.name
      ? path.join(spritesDir, `${sanitizeSpriteName(args.name)}.apng`)
    : defaultOutputPath;
  const character = JSON.parse(await readFile(characterPath, "utf8"));
  const render = await fetchRender(character);

  await mkdir(path.dirname(outputPath), { recursive: true });
  await writeFile(outputPath, render);
  await updateWalkerSpritesManifest();
  console.log(
    `Generated ${path.relative(rootDir, outputPath)} as APNG using ${path.relative(rootDir, characterPath)}.`,
  );
}

async function updateWalkerSpritesManifest() {
  const spriteExtensions = new Set([".apng", ".gif", ".png", ".webp"]);
  const sprites = (await readdir(spritesDir))
    .filter((file) => file.toLowerCase().startsWith("walker"))
    .filter((file) => spriteExtensions.has(path.extname(file).toLowerCase()))
    .sort((left, right) => left.localeCompare(right, "en", { numeric: true }));

  await writeFile(walkerSpritesManifestPath, `${JSON.stringify(sprites, null, 2)}\n`);
}

function parseArgs(args) {
  const parsed = {};

  for (let index = 0; index < args.length; index += 1) {
    const arg = args[index];

    if (arg === "--config") {
      parsed.config = args[index + 1];
      index += 1;
    } else if (arg === "--output") {
      parsed.output = args[index + 1];
      index += 1;
    } else if (arg === "--name") {
      parsed.name = args[index + 1];
      index += 1;
    } else if (arg === "--refresh-manifest") {
      parsed.refreshManifest = true;
    }
  }

  return parsed;
}

function resolveOutputPath(output) {
  const hasDirectory = output.includes("/") || output.includes("\\");
  const hasExtension = path.extname(output) !== "";

  if (hasDirectory) {
    return path.resolve(output);
  }

  return path.join(spritesDir, hasExtension ? output : `${sanitizeSpriteName(output)}.apng`);
}

function sanitizeSpriteName(name) {
  const sanitized = name
    .trim()
    .replace(/\.[a-z0-9]+$/i, "")
    .replace(/[^a-z0-9_-]+/gi, "-")
    .replace(/^-+|-+$/g, "")
    .toLowerCase();

  if (!sanitized) {
    throw new Error("Sprite name cannot be empty.");
  }

  return sanitized;
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
