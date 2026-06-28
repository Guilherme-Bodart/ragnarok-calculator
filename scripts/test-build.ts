import { readFileSync } from "node:fs";
import { calculateDamageFromDataset, type CalculateDamageInput } from "../packages/calculator-core/src/calculate-damage-from-dataset";
import type { CalculatorBuildPayload } from "../components/calculator/calculator-build-payload";
import type { RoItem, RoMonster, RoSkill } from "../packages/calculator-core/src/ro-types";

async function main() {
  // 1. Load dataset
  const rawItems = JSON.parse(readFileSync("nightmare-data/normalized/items/items.en.json", "utf-8"));
  const items: RoItem[] = rawItems.map((raw: any) => ({
    id: raw.itemId || raw.id,
    name: raw.name || raw.aegisName,
    kind: "equipment", // fake
    attack: raw.attack || 0,
    magicAttack: raw.magicAttack || 0,
    defense: raw.defense || 0,
    slots: [],
    bonuses: [],
    rawScript: raw.rawScript || "",
    source: "rathena"
  }));


  const monsters = JSON.parse(readFileSync("nightmare-data/normalized/monsters/monsters.en.json", "utf-8")) as RoMonster[];
  const skills = JSON.parse(readFileSync("nightmare-data/normalized/skills/skills.en.json", "utf-8")) as RoSkill[];
  
  // Custom Dummy Monster based on screenshot
  const dummyMonster: RoMonster = {
    id: 99999,
    name: "100 Training Dummy (Medium) (Formless M)",
    level: 100,
    race: "formless",
    size: "medium",
    element: "neutral",
    elementLevel: 1,
    defense: 0,
    magicDefense: 0,
    softDef: 0, 
    softMdef: 0,
    hp: 2000000000,
    classType: "boss",
    source: "manual"
  };

  monsters.push(dummyMonster);

  const mockSkill: RoSkill = {
    id: "AG_SOUL_VC_STRIKE",
    name: "Soul Vulcan Strike",
    classTree: "Arch_Mage",
    damageType: "magical",
    element: "ghost",
    maxLevel: 5,
    hitCount: 7, // HITS do level 5
    baseMultiplierByLevel: {},
    source: "manual",
  };
  skills.push(mockSkill);

  const dataset = { items, monsters, skills };

  // 2. Load build
  const buildJson = readFileSync("packages/calculator-core/src/reference-scenarios/guilh-arch-mage-build.json", "utf-8");
  const build = JSON.parse(buildJson) as CalculatorBuildPayload;

  // 3. Assemble CalculateDamageInput
  const allEquipIds = Object.values(build.equipment.selectedItemsBySlot || {}).filter(Boolean) as number[];
  const equipmentItemIds = allEquipIds.filter(id => items.some(i => i.id === id));
  console.log("Missing equips:", allEquipIds.filter(id => !items.some(i => i.id === id)));

  const allCardIds = Object.values(build.equipment.selectedCardsBySlot || {}).flat().filter(Boolean) as number[];
  const cardItemIds = allCardIds.filter(id => items.some(i => i.id === id));
  console.log("Missing cards:", allCardIds.filter(id => !items.some(i => i.id === id)));

  const allBuffIds = Object.keys(build.buffs?.activeBuffs || {}).map(Number);
  const buffItemIds = allBuffIds.filter(id => items.some(i => i.id === id));
  console.log("Missing buffs:", allBuffIds.filter(id => !items.some(i => i.id === id)));
  
  const itemContexts = Object.entries(build.equipment.itemContexts || {}).map(([id, ctx]: [string, any]) => ({
    itemId: Number(id),
    refine: ctx.refine,
    grade: ctx.grade,
  }));

  const input: CalculateDamageInput = {
    character: {
      selectedClassId: build.character.selectedClassId,
      baseLevel: build.character.baseLevel,
      jobLevel: build.character.jobLevel,
      stats: build.character.stats,
      weaponType: "twoHandRod", // guessing based on Arch Mage, but items will give modifiers
    },
    learnedSkills: build.tree?.learnedSkills || {},
    equipmentItemIds,
    cardItemIds,
    buffItemIds,
    itemContexts,
    monsterId: 99999, // Use our Dummy Monster
    skillId: build.attack.selectedSkillId,
    skillLevel: build.attack.skillLevel,
    ruleset: {
      server: "latam",
      mechanics: "renewal"
    }
  };

  try {
    const result = calculateDamageFromDataset(input, dataset);
    console.log("Calculation Result for:", build.name);
    console.log("-----------------------------------------");
    console.log("Skill:", result.skill.name);
    console.log("Target:", result.target.name, `(${result.target.id})`);
    console.log("Target Element:", result.target.element, result.target.elementLevel);
    console.log("-----------------------------------------");
    console.log("Status MATK:", result.characterStatus.statusMatk);
    console.log("Equip MATK:", result.characterStatus.matk - result.characterStatus.statusMatk);
    console.log("Total MATK:", result.characterStatus.matk);
    console.log("-----------------------------------------");
    console.log("Damage Breakdown:");
    for (const line of result.breakdown) {
      if (line.value !== 0 && line.group !== "result") {
         console.log(`  - ${line.label} [${line.group}]: ${line.value}`);
      }
    }
    console.log("-----------------------------------------");
    console.log(`Damage: ${result.damage.minimum} ~ ${result.damage.maximum} (Avg: ${result.damage.average})`);
    console.log(`Total hits: ${result.damage.total}`);
  } catch (e) {
    console.error("Error calculating damage:", e);
  }
}

main();
