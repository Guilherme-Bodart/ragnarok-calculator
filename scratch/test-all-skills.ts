import {
  CalculatorModifierEffectsFactory,
  DamageFormulaPipeline,
  EffectiveCharacterBuilder,
  RoMonster,
  SkillFormulaRegistry,
  CastTimingEngine,
  CriticalEngine,
} from "../packages/calculator-core/src/index.ts";
import itemsEn from "../nightmare-data/normalized/items/items.en.json";
import skillsEn from "../nightmare-data/normalized/skills/skills.en.json";
import monstersEn from "../nightmare-data/normalized/monsters/monsters.en.json";

// 1. Setup Build
const build = {
  weapon: 640012,
  headTop: 18849,
  headMid: 410233,
  headLow: 420213,
  armor: 450179,
  garment: 480019,
  shoes: 470021,
  accessoryLeft: 490370,
  accessoryRight: 490020,
};
const itemContexts = {
  "18849": { refine: 9 },
  "450179": { refine: 11 },
  "470021": { refine: 9 },
  "480019": { refine: 9 },
  "640012": { refine: 11 },
};

const items = Object.values(build).map((id) => {
  const item = itemsEn.find((i) => i.itemId === id);
  if (item) {
    if (item.rawScript === null) (item as any).rawScript = "";
    (item as any).id = item.itemId;
  }
  return item;
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
};
const effects = factory.fromItems(items as any, contextByItemId, baseContext);

// 3. Setup Character
const builder = new EffectiveCharacterBuilder();
const character = builder.build(
  {
    classId: "Arch_Mage",
    baseJob: "Mage",
    isTranscendent: true,
    weaponType: "twoHandRod",
    baseLevel: 229,
    jobLevel: 46,
    stats: {
      str: 20, agi: 103, vit: 100, int: 125, dex: 120, luk: 83,
      pow: 0, sta: 0, wis: 0, spl: 100, con: 14, crt: 0
    }
  },
  effects
);

// 4. Setup Target
const dummy = {
  id: 22576,
  name: "Lv.100 Dummy (Medium)",
  level: 100,
  race: "formless",
  size: "medium",
  element: "neutral",
  elementLevel: 1,
  defense: 0,
  magicDefense: 0,
  hp: 2000000000,
  source: "manual"
} as RoMonster;

// 5. Calculate Damage Pipeline
const pipeline = new DamageFormulaPipeline(
  new SkillFormulaRegistry(),
  new CastTimingEngine(),
  new CriticalEngine()
);

const skillsToTest = [
  { name: "AG_MYSTERY_ILLUSION", level: 10 },
  { name: "AG_SOUL_VC_STRIKE", level: 5 },
  { name: "AG_TORNADO_STORM", level: 5 },
  { name: "AG_RAIN_OF_CRYSTAL", level: 5 },
  { name: "AG_FLORAL_FLARE_ROAD", level: 5 },
  { name: "HW_COMET", level: 5 } // 3rd class Comet
];

for (const s of skillsToTest) {
  const skill = skillsEn.find(x => x.name === s.name) as any;
  if (!skill) {
    console.log(`Skill not found: ${s.name}`);
    continue;
  }
  
  const result = pipeline.calculate({
    character,
    items: items as any,
    modifierEffects: effects,
    monster: dummy,
    skill,
    skillLevel: s.level
  });

  console.log(`--- ${s.name} (Lv ${s.level}) ---`);
  console.log(`Damage per hit: ${Math.floor(result.damage.damagePerHit)}`);
  console.log(`Total Damage (Hit x${result.damage.total / result.damage.damagePerHit}): ${Math.floor(result.damage.total)}\n`);
}
