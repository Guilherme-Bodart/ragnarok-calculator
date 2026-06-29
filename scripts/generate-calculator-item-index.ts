import fs from "fs";
import path from "path";
import { toRoItem, type RathenaNormalizedItem } from "../packages/calculator-core/src/datasets/rathena-normalized";

const root = process.cwd();
const inputPath = path.join(root, "nightmare-data/normalized/items/items.en.json");
const localizedInputPath = path.join(
  root,
  "nightmare-data/normalized/items/items.br.json",
);
const outputDir = path.join(root, "public/data/calculator/items");

const equipmentSlots = [
  "headTop",
  "headMid",
  "headLow",
  "armor",
  "weapon",
  "shield",
  "garment",
  "shoes",
  "accessoryLeft",
  "accessoryRight",
  "costumeHeadTop",
  "costumeHeadMid",
  "costumeHeadLow",
  "costumeGarment",
  "shadowWeapon",
  "shadowShield",
  "shadowArmor",
  "shadowShoes",
  "shadowEarring",
  "shadowPendant",
];

const locationToSlot: Record<string, string> = {
  Head_Top: "headTop",
  Head_Mid: "headMid",
  Head_Low: "headLow",
  Armor: "armor",
  Right_Hand: "weapon",
  Both_Hand: "weapon",
  Left_Hand: "shield",
  Garment: "garment",
  Shoes: "shoes",
  Left_Accessory: "accessoryLeft",
  Right_Accessory: "accessoryRight",
  Costume_Head_Top: "costumeHeadTop",
  Costume_Head_Mid: "costumeHeadMid",
  Costume_Head_Low: "costumeHeadLow",
  Costume_Garment: "costumeGarment",
  Shadow_Weapon: "shadowWeapon",
  Shadow_Shield: "shadowShield",
  Shadow_Armor: "shadowArmor",
  Shadow_Shoes: "shadowShoes",
  Shadow_Right_Accessory: "shadowEarring",
  Shadow_Left_Accessory: "shadowPendant",
};

if (fs.existsSync(outputDir)) {
  fs.rmSync(outputDir, { recursive: true, force: true });
}
fs.mkdirSync(outputDir, { recursive: true });

const items = JSON.parse(fs.readFileSync(inputPath, "utf8")) as RathenaNormalizedItem[];
const localizedItems = readLocalizedItems(localizedInputPath);
const byCategory = new Map<string, any[]>(equipmentSlots.map((slot) => [slot, []]));
const cards: any[] = [];
const consumables: any[] = [];

for (const item of items) {
  const localizedItem = localizedItems.get(item.itemId);
  const localizedName = localizedItem?.name;
  
  const mergedItemDetail = {
    ...toRoItem(item),
    name: localizedName ?? item.name,
    refineable: Boolean((item as any).refineable),
    rawType: item.type,
    rawSubType: item.subType,
    // Add index properties that aren't in RoItem
    sourceName: localizedName ? item.name : null,
    searchText: [
      localizedName,
      localizedItem?.unidName,
      item.name,
      item.aegisName,
      item.itemId,
    ]
      .filter(Boolean)
      .join(" "),
    kind: getItemKind(item.type),
    cardSlots: item.slots ?? null,
    attack: item.attack ?? null,
    magicAttack: item.magicAttack ?? null,
    defense: item.defense ?? null,
    hasModifiers: Boolean(item.rawScript),
  };

  if (item.type === "Card") {
    cards.push(mergedItemDetail);
    continue;
  }

  if (mergedItemDetail.kind === "consumable") {
    consumables.push(mergedItemDetail);
    continue;
  }

  for (const slot of getSlots(item.locations)) {
    byCategory.get(slot)?.push(mergedItemDetail);
  }
}

for (const [slot, slotItems] of byCategory) {
  fs.writeFileSync(
    path.join(outputDir, `${slot}.json`),
    JSON.stringify(sortByName(slotItems)),
    "utf8",
  );
}

fs.writeFileSync(
  path.join(outputDir, "card.json"),
  JSON.stringify(sortByName(cards)),
  "utf8",
);

fs.writeFileSync(
  path.join(outputDir, "consumable.json"),
  JSON.stringify(sortByName(consumables)),
  "utf8",
);

console.log(`Generated ${byCategory.size} category files, cards, and consumables.`);

function getSlots(locations: any) {
  if (!locations) return [];

  const slots = Object.entries(locationToSlot)
    .filter(([location]) => locations[location])
    .map(([, slot]) => slot);

  if (slots.includes("accessoryLeft") || slots.includes("accessoryRight")) {
    if (!slots.includes("accessoryLeft")) slots.push("accessoryLeft");
    if (!slots.includes("accessoryRight")) slots.push("accessoryRight");
  }

  return slots;
}

function getItemKind(type: any) {
  const key = String(type ?? "").toLowerCase();

  if (key === "card") return "card";
  if (key.includes("shadow")) return "shadow";
  if (key.includes("costume")) return "costume";
  if (key === "weapon" || key === "armor" || key === "ammo") return "equipment";

  return "consumable";
}

function sortByName(itemsToSort: any[]) {
  return itemsToSort.sort((first, second) =>
    first.name.localeCompare(second.name, "en"),
  );
}

function readLocalizedItems(filePath: string) {
  if (!fs.existsSync(filePath)) {
    return new Map();
  }

  const rawItems = JSON.parse(fs.readFileSync(filePath, "utf8"));

  return new Map(
    Object.values(rawItems)
      .filter((item: any) => Number.isInteger(item?.id) && item?.name)
      .map((item: any) => [
        item.id,
        {
          name: item.name,
          unidName: item.unidName ?? null,
        },
      ]),
  );
}
