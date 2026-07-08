import fs from 'node:fs';
import yaml from 'yaml';

const RATHENA_URL = 'https://raw.githubusercontent.com/rathena/rathena/master/db/re/job_stats.yml';
const OUT_FILE = 'packages/calculator-core/src/job-stats/job-stat-bonuses.seed.ts';

const customMapping: Record<string, string[]> = {
    'DragonKnight': ['Dragon_Knight', 'Dragon_Knight2'],
    'Meister': ['Meister', 'Meister2'],
    'ShadowCross': ['Shadow_Cross'],
    'ArchMage': ['Arch_Mage'],
    'Cardinal': ['Cardinal'],
    'Windhawk': ['Windhawk', 'Windhawk2'],
    'ImperialGuard': ['Imperial_Guard', 'Imperial_Guard2'],
    'Biolo': ['Biolo'],
    'AbyssChaser': ['Abyss_Chaser'],
    'ElementalMaster': ['Elemental_Master'],
    'Inquisitor': ['Inquisitor'],
    'Troubadour': ['Troubadour'],
    'Trouvere': ['Trouvere'],
    'Novice': ['Novice'],
    'Baby': ['Baby'],
    'SuperNovice': ['Super_Novice'],
    'SuperBaby': ['Super_Baby'],
    'NoviceHigh': ['Novice_High'],
    'SuperNoviceE': ['Super_Novice_E'],
    'SuperBabyE': ['Super_Baby_E'],
    'Swordman': ['Swordman'],
    'Mage': ['Mage'],
    'Archer': ['Archer'],
    'Acolyte': ['Acolyte'],
    'Merchant': ['Merchant'],
    'Thief': ['Thief'],
    'SwordmanHigh': ['Swordman_High'],
    'MageHigh': ['Mage_High'],
    'ArcherHigh': ['Archer_High'],
    'AcolyteHigh': ['Acolyte_High'],
    'MerchantHigh': ['Merchant_High'],
    'ThiefHigh': ['Thief_High'],
    'BabySwordman': ['Baby_Swordman'],
    'BabyMage': ['Baby_Mage'],
    'BabyArcher': ['Baby_Archer'],
    'BabyAcolyte': ['Baby_Acolyte'],
    'BabyMerchant': ['Baby_Merchant'],
    'BabyThief': ['Baby_Thief'],
    'Knight': ['Knight', 'Knight2'],
    'LordKnight': ['Lord_Knight', 'Lord_Knight2'],
    'BabyKnight': ['Baby_Knight', 'Baby_Knight2'],
    'RuneKnight': ['Rune_Knight', 'Rune_Knight_T', 'Rune_Knight2', 'Rune_Knight_T2'],
    'BabyRuneKnight': ['Baby_Rune_Knight', 'Baby_Rune_Knight2'],
    'Priest': ['Priest'],
    'HighPriest': ['High_Priest'],
    'BabyPriest': ['Baby_Priest'],
    'ArchBishop': ['Arch_Bishop', 'Arch_Bishop_T'],
    'BabyArchBishop': ['Baby_Arch_Bishop'],
    'Wizard': ['Wizard'],
    'HighWizard': ['High_Wizard'],
    'BabyWizard': ['Baby_Wizard'],
    'Warlock': ['Warlock', 'Warlock_T'],
    'BabyWarlock': ['Baby_Warlock'],
    'Blacksmith': ['Blacksmith'],
    'Whitesmith': ['Whitesmith'],
    'BabyBlacksmith': ['Baby_Blacksmith'],
    'Mechanic': ['Mechanic', 'Mechanic_T', 'Mechanic2', 'Mechanic_T2'],
    'BabyMechanic': ['Baby_Mechanic', 'Baby_Mechanic2'],
    'Hunter': ['Hunter'],
    'Sniper': ['Sniper'],
    'BabyHunter': ['Baby_Hunter'],
    'Ranger': ['Ranger', 'Ranger_T', 'Ranger2', 'Ranger_T2'],
    'BabyRanger': ['Baby_Ranger', 'Baby_Ranger2'],
    'Assassin': ['Assassin'],
    'AssassinCross': ['Assassin_Cross'],
    'BabyAssassin': ['Baby_Assassin'],
    'GuillotineCross': ['Guillotine_Cross', 'Guillotine_Cross_T'],
    'BabyGuillotineCross': ['Baby_Guillotine_Cross'],
    'Crusader': ['Crusader', 'Crusader2'],
    'Paladin': ['Paladin', 'Paladin2'],
    'BabyCrusader': ['Baby_Crusader', 'Baby_Crusader2'],
    'RoyalGuard': ['Royal_Guard', 'Royal_Guard_T', 'Royal_Guard2', 'Royal_Guard_T2'],
    'BabyRoyalGuard': ['Baby_Royal_Guard', 'Baby_Royal_Guard2'],
    'Monk': ['Monk'],
    'Champion': ['Champion'],
    'BabyMonk': ['Baby_Monk'],
    'Sura': ['Sura', 'Sura_T'],
    'BabySura': ['Baby_Sura'],
    'Sage': ['Sage'],
    'Professor': ['Professor'],
    'BabySage': ['Baby_Sage'],
    'Sorcerer': ['Sorcerer', 'Sorcerer_T'],
    'BabySorcerer': ['Baby_Sorcerer'],
    'Rogue': ['Rogue'],
    'Stalker': ['Stalker'],
    'BabyRogue': ['Baby_Rogue'],
    'ShadowChaser': ['Shadow_Chaser', 'Shadow_Chaser_T'],
    'BabyShadowChaser': ['Baby_Shadow_Chaser'],
    'Alchemist': ['Alchemist'],
    'Creator': ['Creator'],
    'BabyAlchemist': ['Baby_Alchemist'],
    'Genetic': ['Genetic', 'Genetic_T'],
    'BabyGenetic': ['Baby_Genetic'],
    'Bard': ['Bard'],
    'Clown': ['Clown'],
    'BabyBard': ['Baby_Bard'],
    'Minstrel': ['Minstrel', 'Minstrel_T'],
    'BabyMinstrel': ['Baby_Minstrel'],
    'Dance': ['Dancer'],
    'Dancer': ['Dancer'],
    'Gypsy': ['Gypsy'],
    'BabyDancer': ['Baby_Dancer'],
    'Wanderer': ['Wanderer', 'Wanderer_T'],
    'BabyWanderer': ['Baby_Wanderer'],
    'Gunslinger': ['Gunslinger'],
    'BabyGunslinger': ['Baby_Gunslinger'],
    'Rebellion': ['Rebellion'],
    'BabyRebellion': ['Baby_Rebellion'],
    'Ninja': ['Ninja'],
    'BabyNinja': ['Baby_Ninja'],
    'Kagerou': ['Kagerou'],
    'BabyKagerou': ['Baby_Kagerou'],
    'Oboro': ['Oboro'],
    'BabyOboro': ['Baby_Oboro'],
    'Taekwondo': ['Taekwon'],
    'Taekwon': ['Taekwon'],
    'BabyTaekwon': ['Baby_Taekwon'],
    'StarGladiator': ['Star_Gladiator', 'Star_Gladiator2'],
    'BabyStarGladiator': ['Baby_Star_Gladiator', 'Baby_Star_Gladiator2'],
    'SoulLinker': ['Soul_Linker'],
    'BabySoulLinker': ['Baby_Soul_Linker'],
    'Doram': ['Summoner'],
    'Summoner': ['Summoner'],
    'BabySummoner': ['Baby_Summoner'],
    'StarEmperor': ['Star_Emperor', 'Star_Emperor2'],
    'BabyStarEmperor': ['Baby_Star_Emperor', 'Baby_Star_Emperor2'],
    'SoulReaper': ['Soul_Reaper'],
    'BabySoulReaper': ['Baby_Soul_Reaper'],
    'SkyEmperor': ['Sky_Emperor', 'Sky_Emperor2'],
    'SoulAscetic': ['Soul_Ascetic'],
    'Shinkiro': ['Shinkiro'],
    'Shiranui': ['Shiranui'],
    'NightWatch': ['Night_Watch'],
    'HyperNovice': ['Hyper_Novice'],
    'SpiritHandler': ['Spirit_Handler'],
};

async function run() {
  console.log('Downloading rAthena Job Stats table...');
  const res = await fetch(RATHENA_URL);
  if (!res.ok) throw new Error(`Failed to fetch: ${res.statusText}`);
  const text = await res.text();
  
  console.log('Parsing YAML...');
  const doc = yaml.parse(text);
  
  const entries = doc.Body || [];
  
  const finalGroups = [];
  
  for (const entry of entries) {
    if (!entry.Jobs) continue;
    if (!entry.BonusStats) continue;

    const jobs = Object.keys(entry.Jobs);
    let mappedClassIds: string[] = [];
    
    for (const job of jobs) {
        if (customMapping[job]) {
            mappedClassIds = mappedClassIds.concat(customMapping[job]);
        } else {
            mappedClassIds.push(job);
        }
    }
    mappedClassIds = [...new Set(mappedClassIds)];
    
    const bonuses = entry.BonusStats.map((b: any) => {
        const out: any = { level: b.Level };
        if (b.Str) out.str = b.Str;
        if (b.Agi) out.agi = b.Agi;
        if (b.Vit) out.vit = b.Vit;
        if (b.Int) out.int = b.Int;
        if (b.Dex) out.dex = b.Dex;
        if (b.Luk) out.luk = b.Luk;
        if (b.Pow) out.pow = b.Pow;
        if (b.Sta) out.sta = b.Sta;
        if (b.Wis) out.wis = b.Wis;
        if (b.Spl) out.spl = b.Spl;
        if (b.Con) out.con = b.Con;
        if (b.Crt) out.crt = b.Crt;
        return out;
    });

    finalGroups.push({
        classIds: mappedClassIds,
        bonuses
    });
  }
  
  let finalOutput = `import type { JobStatBonusGroup } from "./job-stat-bonuses.types";\n\nexport const jobStatBonusGroups: JobStatBonusGroup[] = [\n`;
  for (const group of finalGroups) {
      finalOutput += `  {\n`;
      finalOutput += `    classIds: ${JSON.stringify(group.classIds)},\n`;
      finalOutput += `    bonuses: [\n`;
      for (const b of group.bonuses) {
          const keys = Object.keys(b).filter(k => k !== 'level');
          const parts = [`level: ${b.level}`];
          for (const k of keys) parts.push(`${k}: ${b[k]}`);
          finalOutput += `      { ${parts.join(', ')} },\n`;
      }
      finalOutput += `    ],\n`;
      finalOutput += `  },\n`;
  }
  finalOutput += `];\n`;
  
  fs.writeFileSync(OUT_FILE, finalOutput, 'utf8');
  console.log('Successfully generated new job-stat-bonuses.seed.ts!');
}

run().catch(console.error);
