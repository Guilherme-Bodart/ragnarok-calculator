import { mkdir, readFile, writeFile } from "node:fs/promises";
import { existsSync } from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import gifenc from "gifenc";
import { PNG } from "pngjs";

const { GIFEncoder, applyPalette, quantize } = gifenc;

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const rootDir = path.resolve(__dirname, "..");
const customCharacterPath = path.join(__dirname, "costume-character.json");
const exampleCharacterPath = path.join(__dirname, "costume-character.example.json");
const outputPath = path.join(rootDir, "public", "sprites", "nightmare-walker.gif");

const endpoint =
  "https://api.costume.irowiki.org/render?downloadimage&accesstoken=3iznpprsozjn3nh6rvdvqn2fl89mo1jd";

const walkFrames = [8, 9, 10, 11, 12, 13, 14, 15];

async function fetchFrame(character, action) {
  const response = await fetch(endpoint, {
    method: "POST",
    headers: {
      "Content-Type": "application/vnd.api+json",
    },
    body: JSON.stringify({
      ...character,
      action,
    }),
  });

  if (!response.ok) {
    throw new Error(`Frame ${action} failed with HTTP ${response.status}.`);
  }

  const contentType = response.headers.get("content-type") ?? "";
  if (!contentType.includes("image/png")) {
    throw new Error(`Frame ${action} returned ${contentType}, expected image/png.`);
  }

  const buffer = Buffer.from(await response.arrayBuffer());
  return PNG.sync.read(buffer);
}

function createGif(frames) {
  const width = frames[0].width;
  const height = frames[0].height;
  const rgbaFrames = frames.map((frame) => frame.data);
  const combined = Buffer.concat(rgbaFrames);
  const palette = quantize(combined, 256, {
    format: "rgba4444",
    oneBitAlpha: 1,
  });
  const transparentIndex = Math.max(
    0,
    palette.findIndex((color) => color[3] === 0),
  );

  const gif = GIFEncoder();

  for (const rgba of rgbaFrames) {
    const indexed = applyPalette(rgba, palette, "rgba4444");
    gif.writeFrame(indexed, width, height, {
      palette,
      delay: 90,
      repeat: 0,
      transparent: true,
      transparentIndex,
    });
  }

  gif.finish();
  return gif.bytes();
}

async function main() {
  const characterPath = existsSync(customCharacterPath)
    ? customCharacterPath
    : exampleCharacterPath;
  const character = JSON.parse(await readFile(characterPath, "utf8"));
  const frames = [];

  for (const action of walkFrames) {
    frames.push(await fetchFrame(character, action));
  }

  await mkdir(path.dirname(outputPath), { recursive: true });
  await writeFile(outputPath, createGif(frames));
  console.log(`Generated ${path.relative(rootDir, outputPath)} from ${frames.length} walk frames.`);
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
