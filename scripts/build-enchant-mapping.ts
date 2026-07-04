import * as fs from 'fs';
import * as path from 'path';

// 1. Load the raw enchant data
const rawEnchants = JSON.parse(fs.readFileSync('./scratch/enchant-raw.json', 'utf8'));

// 2. Load our local item and enchant databases
const itemsDir = './public/data/calculator/items';
const categories = fs.readdirSync(itemsDir).filter(f => f.endsWith('.json'));

const ourItems = new Map<string, any>();
const ourEnchants = new Map<string, any>();
const ourEnchantsList: any[] = [];
const ourEquipsList: any[] = [];

for (const file of categories) {
  const data = JSON.parse(fs.readFileSync(path.join(itemsDir, file), 'utf8'));
  for (const item of data) {
    if (item.rawSubType === 'Enchant') {
       if (item.sourceName) ourEnchants.set(item.sourceName, item);
       ourEnchants.set(item.name, item);
       ourEnchantsList.push(item);
    } else {
       ourEquipsList.push(item);
    }
  }
}

// Helper to find enchant by nas-calc string
function findEnchant(nasName: string) {
  if (ourEnchants.has(nasName)) return ourEnchants.get(nasName).id;

  // Try some normalizations
  const searchName1 = nasName.replace(/_/g, ' '); // Expert_Archer1 -> Expert Archer1
  if (ourEnchants.has(searchName1)) return ourEnchants.get(searchName1).id;
  
  const searchName2 = nasName.replace(/_(\d+)/g, ' $1'); // EA_1 -> EA 1
  if (ourEnchants.has(searchName2)) return ourEnchants.get(searchName2).id;

  const searchName3 = nasName.replace(/_/g, ' ').replace(/(\D)(\d+)$/, '$1 $2'); // Expert Archer1 -> Expert Archer 1
  if (ourEnchants.has(searchName3)) return ourEnchants.get(searchName3).id;

  // Search in searchText
  const lcNasName = nasName.toLowerCase();
  for (const enc of ourEnchantsList) {
     if (enc.searchText && enc.searchText.toLowerCase().includes(lcNasName)) {
         return enc.id;
     }
  }

  // Desperate fallback, checking if any part of the name matches closely
  for (const enc of ourEnchantsList) {
     if (enc.name === searchName1 || enc.name === searchName2 || enc.name === searchName3) {
        return enc.id;
     }
  }

  return null;
}

const mapping: Record<string, (number[] | null)[]> = {};
let unmappedEnchantSet = new Set<string>();
let unmappedItemSet = new Set<string>();
let mappedItemCount = 0;

for (const entry of rawEnchants) {
   let itemId = entry.name;
   
   // Tentar encontrar o aegisName do itemId na nossa base para mapear pelo ID do item real
   // Isso garante que se o AegisName no banco mudar de nome, ainda conectamos pelo ID
   let foundLocalEquip = ourEquipsList.find(eq => 
     eq.searchText && eq.searchText.includes(itemId)
   );

   if (!foundLocalEquip) {
      unmappedItemSet.add(itemId);
      // We will still add it to the mapping under its string name as a fallback!
   } else {
      mappedItemCount++;
   }

   let mappedSlots: (number[] | null)[] = [];
   for (const slot of entry.enchants) {
      if (!slot) {
         mappedSlots.push(null);
         continue;
      }
      
      let slotIds: number[] = [];
      for (const e of slot) {
          const matchedId = findEnchant(e);
          if (matchedId) {
             slotIds.push(matchedId);
          } else {
             unmappedEnchantSet.add(e);
          }
      }
      mappedSlots.push(slotIds);
   }

   // Register both by the AegisName string and by the numeric ID if found
   mapping[entry.name] = mappedSlots;
   if (foundLocalEquip) {
      mapping[foundLocalEquip.id] = mappedSlots;
   }
}

fs.writeFileSync('./public/data/calculator/enchant-mapping.json', JSON.stringify(mapping, null, 2));

console.log('--- ENCHANT MAPPING BUILD ---');
console.log(`Generated mappings for ${rawEnchants.length} tables.`);
console.log(`Successfully linked ${mappedItemCount} equipment to their local IDs.`);
console.log(`Could not link ${unmappedItemSet.size} equipment strictly to local IDs (they will use AegisName fallback).`);
console.log(`Unmapped Enchant strings (${unmappedEnchantSet.size}):`, Array.from(unmappedEnchantSet));
