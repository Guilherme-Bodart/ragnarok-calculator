import { mkdir, writeFile } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const rootDir = path.resolve(__dirname, "..");
const outPath = path.join(
  rootDir,
  "public",
  "sprites",
  "item-view-map.json",
);

async function main() {
  console.log("Fetching iROWiki headgear & garment costume metadata...");
  const [headgears, garments] = await Promise.all([
    fetch("https://db.irowiki.org/metadata/headgear_costumes.json").then((r) =>
      r.json(),
    ),
    fetch("https://db.irowiki.org/metadata/garment_costumes.json").then((r) =>
      r.json(),
    ),
  ]);

  const headgearViewByItemId = {};
  const garmentViewByItemId = {};

  for (const entry of headgears) {
    const viewId = Number(entry.accessory_id);
    if (!viewId || !Array.isArray(entry.items)) continue;
    for (const item of entry.items) {
      if (item?.item_id) {
        headgearViewByItemId[item.item_id] = viewId;
      }
    }
  }

  for (const entry of garments) {
    const viewId = Number(entry.garment_id);
    if (!viewId || !Array.isArray(entry.items)) continue;
    for (const item of entry.items) {
      if (item?.item_id) {
        garmentViewByItemId[item.item_id] = viewId;
      }
    }
  }

  // Also supplement from rAthena master item_db_equip.yml for any newer kRO items
  try {
    console.log("Fetching rAthena item_db_equip.yml for additional View IDs...");
    const ymlText = await fetch(
      "https://raw.githubusercontent.com/rathena/rathena/master/db/re/item_db_equip.yml",
    ).then((r) => r.text());

    const blocks = ymlText.split(/\n  - Id:\s+/);
    for (let i = 1; i < blocks.length; i++) {
      const block = blocks[i];
      const idMatch = /^(\d+)/.exec(block);
      const viewMatch = /\n    View:\s*(\d+)/.exec(block);
      if (!idMatch || !viewMatch) continue;

      const itemId = Number(idMatch[1]);
      const viewId = Number(viewMatch[1]);
      if (!itemId || !viewId) continue;

      const isGarment =
        block.includes("Garment: true") ||
        block.includes("Costume_Garment: true");
      const isHead =
        block.includes("Head_Top: true") ||
        block.includes("Head_Mid: true") ||
        block.includes("Head_Low: true") ||
        block.includes("Costume_Head_Top: true") ||
        block.includes("Costume_Head_Mid: true") ||
        block.includes("Costume_Head_Low: true");

      if (isGarment && !garmentViewByItemId[itemId]) {
        garmentViewByItemId[itemId] = viewId;
      } else if (isHead && !headgearViewByItemId[itemId]) {
        headgearViewByItemId[itemId] = viewId;
      }
    }
  } catch (err) {
    console.warn("Optional rAthena supplement skipped:", err.message);
  }

  await mkdir(path.dirname(outPath), { recursive: true });
  await writeFile(
    outPath,
    JSON.stringify({
      headgear: headgearViewByItemId,
      garment: garmentViewByItemId,
    }),
    "utf8",
  );

  console.log(
    `Saved item-view-map.json (${Object.keys(headgearViewByItemId).length} headgears, ${Object.keys(garmentViewByItemId).length} garments).`,
  );
}

main().catch((err) => {
  console.error(err);
  process.exitCode = 1;
});
