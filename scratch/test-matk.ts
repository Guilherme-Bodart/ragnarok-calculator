import {
  CalculatorModifierEffectsFactory,
  DamageFormulaPipeline,
  EffectiveCharacter,
  RoMonster,
  RoSkill,
  SkillFormulaRegistry,
  CastTimingEngine,
  CriticalEngine,
} from "../packages/calculator-core/src";
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

// AQUI ADICIONAMOS OS 200 DE MATK
effects.flatMatk += 200;

// 3. Setup Character
const character = new EffectiveCharacter(
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

// 4. Setup Target and Skill
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

const skill = skillsEn.find(s => s.id === "AG_SOUL_VC_STRIKE") as any;

// 5. Calculate Damage
const pipeline = new DamageFormulaPipeline(
  new SkillFormulaRegistry(),
  new CastTimingEngine(),
  new CriticalEngine()
);

const result = pipeline.calculate({
  character,
  items: items as any,
  modifierEffects: effects,
  monster: dummy,
  skill,
  skillLevel: 5
});

console.log("DAMAGE COM +200 MATK:", result.damage.average);
