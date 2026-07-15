import fs from "fs";
import {
  CalculatorModifierEffectsFactory,
  DamageFormulaPipeline,
  EffectiveCharacterBuilder,
  RoMonster,
  RoSkill,
  SkillFormulaRegistry,
  CastTimingEngine,
  CriticalEngine,
} from "../packages/calculator-core/src/index.ts";
import itemsEn from "../nightmare-data/normalized/items/items.en.json";
import skillsEn from "../nightmare-data/normalized/skills/skills.en.json";
import monstersEn from "../nightmare-data/normalized/monsters/monsters.en.json";

// 1. Setup Build
(async () => {
// Equips from Outrigger.json
const equipIds = [
  640012, // Báculo Primordial
  18849,  // Laço Celine
  410233, // Selo de Loki
  420213, // Selo de Espadas
  450179, // Vestido Celine
  480019, // Capa Grácil
  470021, // Bota Grácil
  32237,  // Bracelete Celine
  490152, // Heroic Token (Arch Mage)
];
// Cards
const cardIds = [
  4392,   // Dame of Sentinel (armor)
  300269, // Eldest (garment)
  27161,  // Mavka (accessoryRight)
];
// Shadows (full set)
const shadowIds = [
  24595, 24584, 24585, 24586, 24587, 24588,
];
const allIds = [...equipIds, ...cardIds, ...shadowIds];
const itemContexts: Record<string, { refine: number }> = {
  "640012": { refine: 11 },
  "18849": { refine: 9 },
  "450179": { refine: 11 },
  "480019": { refine: 9 },
  "470021": { refine: 9 },
};
// Map rAthena locations to EquipmentSlot names
const locationToSlot: Record<string, string> = {
  Head_Top: "headTop", Head_Mid: "headMid", Head_Low: "headLow",
  Armor: "armor", Both_Hand: "weapon", Right_Hand: "weapon",
  Left_Hand: "shield", Garment: "garment", Shoes: "shoes",
  Both_Accessory: "accessoryRight", Right_Accessory: "accessoryRight",
  Left_Accessory: "accessoryLeft",
};
const items = allIds.map((id) => {
  const i = itemsEn.find((i) => i.itemId === id) as any;
  if (i) {
    i.id = i.itemId;
    const locs = i.locations ? Object.keys(i.locations) : [];
    i.slots = locs.map((l: string) => locationToSlot[l]).filter(Boolean);
    // Heroic Token → accessoryLeft (per Outrigger.json)
    if (i.itemId === 490152) i.slots = ["accessoryLeft"];
    i.rawScript = i.rawScript || "";
    if (itemContexts[i.itemId]) {
      i.refine = itemContexts[i.itemId].refine;
    } else {
      i.refine = 0;
    }
  }
  return i;
}).filter(Boolean);

// 2. Setup Context
const factory = new CalculatorModifierEffectsFactory();
const contextByItemId = new Map();
for (const item of items) {
  if (itemContexts[item.itemId]) {
    contextByItemId.set(item.itemId, itemContexts[item.itemId]);
  }
}
const baseContext = {
  classId: "Arch_Mage",
  baseLevel: 229,
  jobLevel: 46,
  stats: {
    str: 20, agi: 103, vit: 100, int: 125, dex: 120, luk: 83,
    pow: 0, sta: 0, wis: 0, spl: 100, con: 14, crt: 0
  },
};
const effects = factory.fromItems(items, contextByItemId, baseContext);

// Injetando os encantamentos e bônus não parseados manualmente!
effects.flatMatk = (effects.flatMatk || 0) + 12; // Pedra Encantamento 3
effects.flatMatk = (effects.flatMatk || 0) + 20; // Visual Arquimago
effects.flatMatk = (effects.flatMatk || 0) + 75; // Script do Báculo (15 atkm a cada 2 refinos)

effects.variableCastRate = (effects.variableCastRate || 0) - 8; // Pedra Encantamento 3
effects.variableCastRate = (effects.variableCastRate || 0) - 4; // Selo de Loki enchant

effects.afterCastDelayRate = (effects.afterCastDelayRate || 0) - 4; // Selo de Loki enchant

effects.statBonuses = effects.statBonuses || {};
effects.statBonuses.agi = (effects.statBonuses.agi || 0) + 2; // Selo de Espadas enchant

effects.magicElementAttackRate = effects.magicElementAttackRate || {};
effects.magicElementAttackRate['all'] = (effects.magicElementAttackRate['all'] || 0) + 6; // Selo de Espadas enchant
effects.magicElementAttackRate['ghost'] = 75; // Cravando o 75% fantasma do combo da carta Ancião

// 3. Setup Character
const character = new EffectiveCharacterBuilder().build({
  baseLevel: 229,
  jobLevel: 46,
  classId: "Arch_Mage",
  stats: {
    str: 20, agi: 103, vit: 100, int: 125, dex: 120, luk: 83,
    pow: 0, sta: 0, wis: 0, spl: 100, con: 14, crt: 0
  },
  learnedSkills: {
    AG_TWOHANDSTAFF: 10,
  },
  weaponType: "twoHandRod",
  weaponLevel: 4,
  weaponRefine: 11,
}, effects.statBonuses);

  const dummy = {
    id: 1002,
    name: "Poring",
    level: 1,
    race: "plant",
    size: "medium",
    element: "water",
    elementLevel: 1,
    defense: 2,
    magicDefense: 5,
    hp: 50,
    source: "manual"
  } as RoMonster;

  const skill = {
    id: "AG_SOUL_VC_STRIKE",
    name: "Soul Vulcan Strike",
    damageType: "magical",
    element: "ghost",
    maxLevel: 5,
    hitCount: 7,
    baseMultiplierByLevel: { "1": 550, "2": 800, "3": 1050, "4": 1300, "5": 1550 },
    source: "manual"
  } as RoSkill;

  const registry = new SkillFormulaRegistry();

  const pipeline = new DamageFormulaPipeline(
    registry,
    new CastTimingEngine(),
    new CriticalEngine()
  );
  
  const result = pipeline.calculate({ 
    character, 
    items: items as any[], 
    modifierEffects: effects, 
    monster: dummy, 
    skill, 
    skillLevel: 5 
  });
  console.log("=========================================");
  console.log("Dano Médio Total (todas as hits):", result.damage.average);
  console.log("Dano Final Por Hit (Mínimo):", result.damage.minimum / 7);
  console.log("Dano Final Por Hit (Médio):", result.damage.damagePerHit);
  console.log("Dano Final Por Hit (Máximo):", result.damage.maximum / 7);
  console.log("=========================================");
  console.log("DAMAGE BREAKDOWN:");
  result.breakdown.forEach(b => console.log(`${b.label}: ${b.value} ${b.unit || ''}`));

  fs.writeFileSync("Outrigger-Bonus.json", JSON.stringify(effects, null, 2));
  console.log("Salvo em Outrigger-Bonus.json!");
})();
