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
const defaultOutputPath = path.join(rootDir, "public", "sprites", "nightmare-walker.gif");

const endpoint =
  "https://api.costume.irowiki.org/render?downloadimage&accesstoken=3iznpprsozjn3nh6rvdvqn2fl89mo1jd";

const defaultFrameCount = 8;

async function fetchFrame(character, frame) {
  const response = await fetch(endpoint, {
    method: "POST",
    headers: {
      "Content-Type": "application/vnd.api+json",
    },
    body: JSON.stringify({
      ...character,
      action: character.action ?? 8,
      frame,
    }),
  });

  if (!response.ok) {
    throw new Error(`Frame ${frame} failed with HTTP ${response.status}.`);
  }

  const contentType = response.headers.get("content-type") ?? "";
  if (!contentType.includes("image/png")) {
    throw new Error(`Frame ${frame} returned ${contentType}, expected image/png.`);
  }

  const buffer = Buffer.from(await response.arrayBuffer());
  return PNG.sync.read(buffer);
}

function createPalette(rgba) {
  return quantize(rgba, 256, {
    format: "rgba4444",
    oneBitAlpha: 1,
  });
}

function getTransparentIndex(palette) {
  return Math.max(
    0,
    palette.findIndex((color) => color[3] === 0),
  );
}

function createGif(frames, { paletteMode }) {
  const width = frames[0].width;
  const height = frames[0].height;
  const rgbaFrames = frames.map((frame) => frame.data);
  const globalPalette =
    paletteMode === "frame" ? null : createPalette(Buffer.concat(rgbaFrames));
  const globalTransparentIndex = globalPalette
    ? getTransparentIndex(globalPalette)
    : 0;

  const gif = GIFEncoder();

  for (const rgba of rgbaFrames) {
    const palette = globalPalette ?? createPalette(rgba);
    const indexed = applyPalette(rgba, palette, "rgba4444");
    gif.writeFrame(indexed, width, height, {
      palette,
      delay: 90,
      repeat: 0,
      transparent: true,
      transparentIndex: globalPalette
        ? globalTransparentIndex
        : getTransparentIndex(palette),
    });
  }

  gif.finish();
  return gif.bytes();
}

async function main() {
  const args = parseArgs(process.argv.slice(2));
  const characterPath = args.config
    ? path.resolve(args.config)
    : existsSync(customCharacterPath)
      ? customCharacterPath
      : exampleCharacterPath;
  const outputPath = args.output
    ? path.resolve(args.output)
    : defaultOutputPath;
  const frameCount = Number.isInteger(args.frames)
    ? Math.max(1, args.frames)
    : defaultFrameCount;
  const paletteMode = args.palette === "frame" ? "frame" : "global";
  const character = JSON.parse(await readFile(characterPath, "utf8"));
  const frames = [];

  for (let frame = 0; frame < frameCount; frame += 1) {
    frames.push(await fetchFrame(character, frame));
  }

  await mkdir(path.dirname(outputPath), { recursive: true });
  await writeFile(outputPath, createGif(frames, { paletteMode }));
  console.log(
    `Generated ${path.relative(rootDir, outputPath)} from ${frames.length} walk frames using ${path.relative(rootDir, characterPath)} (${paletteMode} palette).`,
  );
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
    } else if (arg === "--frames") {
      parsed.frames = Number(args[index + 1]);
      index += 1;
    } else if (arg === "--palette") {
      parsed.palette = args[index + 1];
      index += 1;
    }
  }

  return parsed;
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
