import fs from "fs";
import path from "path";
import YAML from "yaml";
import { z } from "zod";

const ROOT = process.cwd();
const itemsJsonPath = path.join(ROOT, "nightmare-data/normalized/items/items.en.json");
const comboDbPath = path.join(ROOT, "nightmare-data/raw/rathena/item_combos.yml");

const ComboDbSchema = z.object({
  Body: z.array(
    z.object({
      Combos: z.array(
        z.object({
          Combo: z.array(z.string()),
        })
      ),
      Script: z.string().optional(),
    }).passthrough()
  ),
}).passthrough();

async function run() {
  if (!fs.existsSync(comboDbPath)) {
    console.log("Baixando item_combos.yml do rAthena...");
    const response = await fetch("https://raw.githubusercontent.com/rathena/rathena/master/db/re/item_combos.yml");
    if (!response.ok) {
      throw new Error(`Erro ao baixar item_combos.yml: ${response.statusText}`);
    }
    const text = await response.text();
    fs.mkdirSync(path.dirname(comboDbPath), { recursive: true });
    fs.writeFileSync(comboDbPath, text, "utf8");
  }

  if (!fs.existsSync(itemsJsonPath)) {
    throw new Error("Arquivo items.en.json não encontrado. Rode o sync-rathena-items.ts primeiro.");
  }

  const items = JSON.parse(fs.readFileSync(itemsJsonPath, "utf8"));
  const aegisNameToId = new Map<string, number>();
  const idToItem = new Map<number, any>();

  for (const item of items) {
    idToItem.set(item.itemId, item);
    if (item.aegisName) {
      aegisNameToId.set(item.aegisName, item.itemId);
    }
  }

  const comboContent = fs.readFileSync(comboDbPath, "utf8");
  const parsed = YAML.parse(comboContent, { uniqueKeys: false });
  
  if (!parsed || !parsed.Body) {
    throw new Error("Formato inválido do item_combos.yml");
  }

  let combosAdded = 0;

  for (const entry of parsed.Body) {
    if (!entry.Script || !entry.Combos) continue;

    for (const comboDef of entry.Combos) {
      if (!comboDef.Combo) continue;
      
      const itemIds = comboDef.Combo.map((name: string) => aegisNameToId.get(name)).filter(Boolean);
      
      if (itemIds.length !== comboDef.Combo.length) {
        continue;
      }

      const hostItemId = Math.min(...itemIds);
      const hostItem = idToItem.get(hostItemId);

      if (hostItem) {
        const comboScript = `\nif (isequipped(${itemIds.join(",")})) {\n${entry.Script}\n}`;
        hostItem.rawScript = (hostItem.rawScript || "") + comboScript;
        combosAdded++;
      }
    }
  }

  fs.writeFileSync(itemsJsonPath, JSON.stringify(items, null, 2), "utf8");
  console.log(`Sucesso! Foram injetados ${combosAdded} scripts de combo no items.en.json.`);
}

run().catch(console.error);
