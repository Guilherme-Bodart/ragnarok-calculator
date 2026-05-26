import fs from "fs";
import path from "path";
import YAML from "yaml";
import { z } from "zod";

const RawItemSchema = z.object({
    Id: z.number(),
    AegisName: z.string().optional(),
    Name: z.string().optional(),
    Type: z.string().optional(),
    SubType: z.string().optional(),
    Buy: z.number().optional(),
    Weight: z.number().optional(),
    Attack: z.number().optional(),
    MagicAttack: z.number().optional(),
    Defense: z.number().optional(),
    Range: z.number().optional(),
    Slots: z.number().optional(),
    Jobs: z.any().optional(),
    Classes: z.any().optional(),
    Locations: z.any().optional(),
    WeaponLevel: z.number().optional(),
    EquipLevelMin: z.number().optional(),
    Refineable: z.boolean().optional(),
    Script: z.string().optional(),
}).passthrough();

type NightmareItem = {
    itemId: number;
    aegisName: string | null;
    name: string;
    type: string | null;
    subType: string | null;
    weight: number | null;
    attack: number | null;
    magicAttack: number | null;
    defense: number | null;
    range: number | null;
    slots: number | null;
    weaponLevel: number | null;
    equipLevelMin: number | null;
    refineable: boolean;
    rawScript: string | null;
    source: "rathena";
};

const ROOT = process.cwd();

const inputFiles = [
    "item_db_equip.yml",
    "item_db_usable.yml",
    "item_db_etc.yml",
];

const rawDir = path.join(ROOT, "nightmare-data/raw/rathena");
const outputDir = path.join(ROOT, "nightmare-data/normalized/items");

fs.mkdirSync(outputDir, { recursive: true });

const allItems: NightmareItem[] = [];

for (const file of inputFiles) {
    const filePath = path.join(rawDir, file);

    if (!fs.existsSync(filePath)) {
        console.warn(`Arquivo não encontrado: ${filePath}`);
        continue;
    }

    const content = fs.readFileSync(filePath, "utf8");
    const parsed = YAML.parse(content, {
        uniqueKeys: false,
    });

    const body = Array.isArray(parsed) ? parsed : parsed.Body;

    if (!Array.isArray(body)) {
        console.warn(`Formato inesperado em: ${file}`);
        continue;
    }

    for (const rawItem of body) {
        const result = RawItemSchema.safeParse(rawItem);

        if (!result.success) {
            console.warn("Item inválido ignorado:", rawItem?.Id);
            continue;
        }

        const item = result.data;

        allItems.push({
            itemId: item.Id,
            aegisName: item.AegisName ?? null,
            name: item.Name ?? item.AegisName ?? `Item ${item.Id}`,
            type: item.Type ?? null,
            subType: item.SubType ?? null,
            weight: item.Weight ?? null,
            attack: item.Attack ?? null,
            magicAttack: item.MagicAttack ?? null,
            defense: item.Defense ?? null,
            range: item.Range ?? null,
            slots: item.Slots ?? null,
            weaponLevel: item.WeaponLevel ?? null,
            equipLevelMin: item.EquipLevelMin ?? null,
            refineable: item.Refineable ?? false,
            rawScript: item.Script ?? null,
            source: "rathena",
        });
    }
}

allItems.sort((a, b) => a.itemId - b.itemId);

fs.writeFileSync(
    path.join(outputDir, "items.en.json"),
    JSON.stringify(allItems, null, 2),
    "utf8"
);

console.log(`Itens importados: ${allItems.length}`);
console.log(`Arquivo gerado: nightmare-data/normalized/items/items.en.json`);