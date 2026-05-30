import fs from "fs";
import path from "path";

const root = process.cwd();
const inputPath = path.join(root, "nightmare-data/normalized/items/items.en.json");
const outputDir = path.join(root, "nightmare-data/generated/calculator");
const bySlotDir = path.join(outputDir, "items-by-slot");

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

const locationToSlot = {
  Head_Top: "headTop",
  Head_Mid: "headMid",
  Head_Low: "headLow",
  Armor: "armor",
  Right_Hand: "weapon",
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

fs.mkdirSync(bySlotDir, { recursive: true });

const items = JSON.parse(fs.readFileSync(inputPath, "utf8"));
const bySlot = new Map(equipmentSlots.map((slot) => [slot, []]));
const cards = [];

for (const item of items) {
  const indexItem = {
    id: item.itemId,
    name: item.name,
    kind: getItemKind(item.type),
    cardSlots: item.slots ?? null,
    refineable: Boolean(item.refineable),
    attack: item.attack ?? null,
    magicAttack: item.magicAttack ?? null,
    defense: item.defense ?? null,
    hasModifiers: Boolean(item.rawScript),
  };

  if (item.type === "Card") {
    cards.push(indexItem);
    continue;
  }

  for (const slot of getSlots(item.locations)) {
    bySlot.get(slot)?.push(indexItem);
  }
}

for (const [slot, slotItems] of bySlot) {
  fs.writeFileSync(
    path.join(bySlotDir, `${slot}.json`),
    JSON.stringify(sortByName(slotItems)),
    "utf8",
  );
}

fs.writeFileSync(
  path.join(outputDir, "cards-index.json"),
  JSON.stringify(sortByName(cards)),
  "utf8",
);

console.log(`Generated ${bySlot.size} slot indexes and ${cards.length} cards.`);

function getSlots(locations) {
  if (!locations) return [];

  return Object.entries(locationToSlot)
    .filter(([location]) => locations[location])
    .map(([, slot]) => slot);
}

function getItemKind(type) {
  const key = String(type ?? "").toLowerCase();

  if (key === "card") return "card";
  if (key.includes("shadow")) return "shadow";
  if (key.includes("costume")) return "costume";
  if (key === "weapon" || key === "armor" || key === "ammo") return "equipment";

  return "consumable";
}

function sortByName(itemsToSort) {
  return itemsToSort.sort((first, second) =>
    first.name.localeCompare(second.name, "en"),
  );
}
