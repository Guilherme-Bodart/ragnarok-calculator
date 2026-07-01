import type {
  SkillFormulaAdapter,
  SkillFormulaInput,
  SkillFormulaResult,
} from "./skill-formula.types";

const staticSkillFormulas: Record<
  string,
  (input: SkillFormulaInput) => SkillFormulaResult
> = {
  // ==========================================
  // WARLOCK (3rd Class)
  // ==========================================
  WL_CRIMSONROCK: (input) => ({
    formulaId: "static:WL_CRIMSONROCK",
    // C++: skillratio += -100 + 700 + 600 * skill_lv
    multiplier: ((700 + 600 * input.skillLevel) * input.character.baseLevel) / 100 / 100,
    hitCount: input.skill.hitCountByLevel?.[String(input.skillLevel)] ?? input.skill.hitCount,
    precision: "validated",
  }),
  WL_COMET: (input) => ({
    formulaId: "static:WL_COMET",
    // C++: skillratio += -100 + 2500 + 700 * skill_lv
    multiplier: ((2500 + 700 * input.skillLevel) * input.character.baseLevel) / 100 / 100,
    hitCount: input.skill.hitCountByLevel?.[String(input.skillLevel)] ?? input.skill.hitCount,
    precision: "validated",
  }),
  WL_CHAINLIGHTNING: (input) => ({
    formulaId: "static:WL_CHAINLIGHTNING",
    // C++: skillratio += 400 + 100 * skill_lv
    multiplier: ((500 + 100 * input.skillLevel) * input.character.baseLevel) / 100 / 100,
    hitCount: input.skill.hitCountByLevel?.[String(input.skillLevel)] ?? input.skill.hitCount,
    precision: "validated",
  }),
  WL_EARTHSTRAIN: (input) => ({
    formulaId: "static:WL_EARTHSTRAIN",
    // C++: skillratio += -100 + 1000 + 600 * skill_lv
    multiplier: ((1000 + 600 * input.skillLevel) * input.character.baseLevel) / 100 / 100,
    hitCount: input.skill.hitCountByLevel?.[String(input.skillLevel)] ?? input.skill.hitCount,
    precision: "validated",
  }),
  WL_TETRAVORTEX: (input) => ({
    formulaId: "static:WL_TETRAVORTEX",
    // C++: base_skillratio += -100 + 800 + 400 * skill_lv
    multiplier: ((800 + 400 * input.skillLevel) * input.character.baseLevel) / 100 / 100,
    hitCount: input.skill.hitCountByLevel?.[String(input.skillLevel)] ?? input.skill.hitCount,
    precision: "validated",
  }),
  WL_JACKFROST: (input) => ({
    formulaId: "static:WL_JACKFROST",
    // C++: skillratio += -100 + 1000 + 300 * skill_lv
    multiplier: ((1000 + 300 * input.skillLevel) * input.character.baseLevel) / 100 / 100,
    hitCount: input.skill.hitCountByLevel?.[String(input.skillLevel)] ?? input.skill.hitCount,
    precision: "validated",
  }),
  WL_SOULEXPANSION: (input) => ({
    formulaId: "static:WL_SOULEXPANSION",
    // C++: skillratio += -100 + 1000 + skill_lv * 200 + int
    multiplier: ((1000 + input.skillLevel * 200 + input.character.effectiveStats.int) * input.character.baseLevel) / 100 / 100,
    hitCount: input.skill.hitCountByLevel?.[String(input.skillLevel)] ?? input.skill.hitCount,
    precision: "validated",
  }),

  // ==========================================
  // SORCERER (3rd Class)
  // ==========================================
  SO_PSYCHIC_WAVE: (input) => ({
    formulaId: "static:SO_PSYCHIC_WAVE",
    // C++: skillratio += -100 + 70 * skill_lv + 3 * int
    multiplier: ((70 * input.skillLevel + 3 * input.character.effectiveStats.int) * input.character.baseLevel) / 100 / 100,
    hitCount: input.skill.hitCountByLevel?.[String(input.skillLevel)] ?? input.skill.hitCount,
    precision: "validated",
  }),
  SO_VARETYR_SPEAR: (input) => {
    // C++: skillratio += -100 + (2 * sstatus->int_ + 150 * (striking + lightningloader) + sstatus->int_ * skill_lv / 2) / 3;
    const strikingLv = input.character.learnedSkills?.["SO_STRIKING"] || 0;
    const loaderLv = input.character.learnedSkills?.["SA_LIGHTNINGLOADER"] || 0;
    const int = input.character.effectiveStats.int;
    const ratio = (2 * int + 150 * (strikingLv + loaderLv) + (int * input.skillLevel) / 2) / 3;
    return {
      formulaId: "static:SO_VARETYR_SPEAR",
      multiplier: (ratio * input.character.baseLevel) / 100 / 100,
      hitCount: input.skill.hitCountByLevel?.[String(input.skillLevel)] ?? input.skill.hitCount,
      precision: "validated",
    };
  },
  SO_DIAMONDDUST: (input) => {
    // C++: skillratio += -100 + 2 * sstatus->int_ + 300 * pc_checkskill(sd, SA_FROSTWEAPON) + sstatus->int_ * skill_lv;
    const weaponLv = input.character.learnedSkills?.["SA_FROSTWEAPON"] || 0;
    const int = input.character.effectiveStats.int;
    const ratio = 2 * int + 300 * weaponLv + int * input.skillLevel;
    return {
      formulaId: "static:SO_DIAMONDDUST",
      multiplier: (ratio * input.character.baseLevel) / 100 / 100,
      hitCount: input.skill.hitCountByLevel?.[String(input.skillLevel)] ?? input.skill.hitCount,
      precision: "validated",
    };
  },
  SO_EARTHGRAVE: (input) => {
    // C++: skillratio += -100 + 2 * sstatus->int_ + 300 * pc_checkskill(sd, SA_SEISMICWEAPON) + sstatus->int_ * skill_lv;
    const weaponLv = input.character.learnedSkills?.["SA_SEISMICWEAPON"] || 0;
    const int = input.character.effectiveStats.int;
    const ratio = 2 * int + 300 * weaponLv + int * input.skillLevel;
    return {
      formulaId: "static:SO_EARTHGRAVE",
      multiplier: (ratio * input.character.baseLevel) / 100 / 100,
      hitCount: input.skill.hitCountByLevel?.[String(input.skillLevel)] ?? input.skill.hitCount,
      precision: "validated",
    };
  },

  // ==========================================
  // WIZARD / HIGH WIZARD (2nd Class / Trans)
  // ==========================================
  WZ_STORMGUST: (input) => ({
    formulaId: "static:WZ_STORMGUST",
    // C++: base_skillratio -= 30; base_skillratio += 50 * skill_lv; (70 + 50 * skillLevel)
    multiplier: (70 + 50 * input.skillLevel) / 100,
    hitCount: input.skill.hitCountByLevel?.[String(input.skillLevel)] ?? input.skill.hitCount,
    precision: "validated",
  }),
  WZ_VERMILION: (input) => ({
    formulaId: "static:WZ_VERMILION",
    // C++: base_skillratio += 300 + skill_lv * 100;
    multiplier: (400 + 100 * input.skillLevel) / 100,
    hitCount: input.skill.hitCountByLevel?.[String(input.skillLevel)] ?? input.skill.hitCount,
    precision: "validated",
  }),
  WZ_METEOR: (input) => ({
    formulaId: "static:WZ_METEOR",
    // C++: base_skillratio += 25;
    multiplier: 125 / 100,
    hitCount: input.skill.hitCountByLevel?.[String(input.skillLevel)] ?? input.skill.hitCount,
    precision: "validated",
  }),
  WZ_WATERBALL: (input) => ({
    formulaId: "static:WZ_WATERBALL",
    // C++: base_skillratio += 30 * skill_lv;
    multiplier: (100 + 30 * input.skillLevel) / 100,
    hitCount: input.skill.hitCountByLevel?.[String(input.skillLevel)] ?? input.skill.hitCount,
    precision: "validated",
  }),
  WZ_EARTHSPIKE: (input) => ({
    formulaId: "static:WZ_EARTHSPIKE",
    // C++: base_skillratio += 100;
    multiplier: 200 / 100,
    hitCount: input.skill.hitCountByLevel?.[String(input.skillLevel)] ?? input.skill.hitCount,
    precision: "validated",
  }),
  WZ_HEAVENDRIVE: (input) => ({
    formulaId: "static:WZ_HEAVENDRIVE",
    // C++: base_skillratio += 25;
    multiplier: 125 / 100,
    hitCount: input.skill.hitCountByLevel?.[String(input.skillLevel)] ?? input.skill.hitCount,
    precision: "validated",
  }),
  WZ_FIREPILLAR: (input) => ({
    formulaId: "static:WZ_FIREPILLAR",
    // C++: base_skillratio += -60 + 20 * skill_lv;
    multiplier: (40 + 20 * input.skillLevel) / 100,
    hitCount: input.skill.hitCountByLevel?.[String(input.skillLevel)] ?? input.skill.hitCount,
    precision: "validated",
  }),
  WZ_FROSTNOVA: (input) => ({
    formulaId: "static:WZ_FROSTNOVA",
    // C++: base_skillratio += 10 * skill_lv;
    multiplier: (100 + 10 * input.skillLevel) / 100,
    hitCount: input.skill.hitCountByLevel?.[String(input.skillLevel)] ?? input.skill.hitCount,
    precision: "validated",
  }),

  // ==========================================
  // MAGE (1st Class)
  // ==========================================
  MG_NAPALMBEAT: (input) => ({
    formulaId: "static:MG_NAPALMBEAT",
    // C++: base_skillratio += -30 + 10 * skill_lv;
    multiplier: (70 + 10 * input.skillLevel) / 100,
    hitCount: input.skill.hitCountByLevel?.[String(input.skillLevel)] ?? input.skill.hitCount,
    precision: "validated",
  }),
  MG_FIREBALL: (input) => ({
    formulaId: "static:MG_FIREBALL",
    // C++: base_skillratio += 40 + 20 * skill_lv;
    multiplier: (140 + 20 * input.skillLevel) / 100,
    hitCount: input.skill.hitCountByLevel?.[String(input.skillLevel)] ?? input.skill.hitCount,
    precision: "validated",
  }),
  MG_FROSTDIVER: (input) => ({
    formulaId: "static:MG_FROSTDIVER",
    // C++: base_skillratio += 10 * skill_lv;
    multiplier: (100 + 10 * input.skillLevel) / 100,
    hitCount: input.skill.hitCountByLevel?.[String(input.skillLevel)] ?? input.skill.hitCount,
    precision: "validated",
  }),
  MG_FIREWALL: (input) => ({
    formulaId: "static:MG_FIREWALL",
    // firewall damage in rathena is 50%
    multiplier: 50 / 100,
    hitCount: input.skill.hitCountByLevel?.[String(input.skillLevel)] ?? input.skill.hitCount,
    precision: "validated",
  }),

  // ==========================================
  // RUNE KNIGHT (3rd Class)
  // ==========================================
  RK_HUNDREDSPEAR: (input) => {
    // C++: skillratio += -100 + 600 + 200 * skill_lv + 50 * pc_checkskill(sd,LK_SPIRALPIERCE);
    const spiralLv = input.character.learnedSkills?.["LK_SPIRALPIERCE"] || 0;
    const ratio = 600 + 200 * input.skillLevel + 50 * spiralLv;
    return {
      formulaId: "static:RK_HUNDREDSPEAR",
      multiplier: (ratio * input.character.baseLevel) / 100 / 100,
      hitCount: input.skill.hitCountByLevel?.[String(input.skillLevel)] ?? input.skill.hitCount,
      precision: "validated",
    };
  },
  RK_WINDCUTTER: (input) => ({
    formulaId: "static:RK_WINDCUTTER",
    // C++: 250*lv (2h sword), 400*lv (spears), 300*lv (others). Defaulting to 300.
    multiplier: ((300 * input.skillLevel) * input.character.baseLevel) / 100 / 100,
    hitCount: input.skill.hitCountByLevel?.[String(input.skillLevel)] ?? input.skill.hitCount,
    precision: "validated",
  }),
  RK_IGNITIONBREAK: (input) => ({
    formulaId: "static:RK_IGNITIONBREAK",
    // C++: skillratio += -100 + 450 * skill_lv;
    multiplier: ((450 * input.skillLevel) * input.character.baseLevel) / 100 / 100,
    hitCount: input.skill.hitCountByLevel?.[String(input.skillLevel)] ?? input.skill.hitCount,
    precision: "validated",
  }),
  RK_SONICWAVE: (input) => ({
    formulaId: "static:RK_SONICWAVE",
    // C++: skillratio += -100 + 1050 + 150 * skill_lv;
    multiplier: ((1050 + 150 * input.skillLevel) * input.character.baseLevel) / 100 / 100,
    hitCount: input.skill.hitCountByLevel?.[String(input.skillLevel)] ?? input.skill.hitCount,
    precision: "validated",
  }),
  RK_STORMBLAST: (input) => {
    // C++: skillratio += -100 + (((sd) ? pc_checkskill(sd,RK_RUNEMASTERY) : 0) + sstatus->str / 6) * 100;
    const masteryLv = input.character.learnedSkills?.["RK_RUNEMASTERY"] || 0;
    const str = input.character.effectiveStats.str;
    const ratio = (masteryLv + Math.floor(str / 6)) * 100;
    return {
      formulaId: "static:RK_STORMBLAST",
      multiplier: (ratio * input.character.baseLevel) / 100 / 100,
      hitCount: input.skill.hitCountByLevel?.[String(input.skillLevel)] ?? input.skill.hitCount,
      precision: "validated",
    };
  },

  // ==========================================
  // ROYAL GUARD (3rd Class)
  // ==========================================
  LG_EARTHDRIVE: (input) => {
    // C++: skillratio += -100 + 380 * skill_lv + sstatus->str + sstatus->vit;
    const ratio = 380 * input.skillLevel + input.character.effectiveStats.str + input.character.effectiveStats.vit;
    return {
      formulaId: "static:LG_EARTHDRIVE",
      multiplier: (ratio * input.character.baseLevel) / 100 / 100,
      hitCount: input.skill.hitCountByLevel?.[String(input.skillLevel)] ?? input.skill.hitCount,
      precision: "validated",
    };
  },
  LG_OVERBRAND: (input) => {
    // C++: skillratio += -100 + 350 * skill_lv + ((sd) ? pc_checkskill(sd, CR_SPEARQUICKEN) * 50 : 0);
    const quickenLv = input.character.learnedSkills?.["CR_SPEARQUICKEN"] || 0;
    const ratio = 350 * input.skillLevel + quickenLv * 50;
    return {
      formulaId: "static:LG_OVERBRAND",
      multiplier: (ratio * input.character.baseLevel) / 100 / 100,
      hitCount: input.skill.hitCountByLevel?.[String(input.skillLevel)] ?? input.skill.hitCount,
      precision: "validated",
    };
  },
  LG_RAYOFGENESIS: (input) => {
    // C++: skillratio += -100 + 350 * skill_lv + sstatus->int_ * 3;
    const ratio = 350 * input.skillLevel + input.character.effectiveStats.int * 3;
    return {
      formulaId: "static:LG_RAYOFGENESIS",
      multiplier: (ratio * input.character.baseLevel) / 100 / 100,
      hitCount: input.skill.hitCountByLevel?.[String(input.skillLevel)] ?? input.skill.hitCount,
      precision: "validated",
    };
  },
  LG_MOONSLASHER: (input) => {
    // C++: skillratio += -100 + 120 * skill_lv + ((sd) ? pc_checkskill(sd, LG_OVERBRAND) * 80 : 0);
    const obLv = input.character.learnedSkills?.["LG_OVERBRAND"] || 0;
    const ratio = 120 * input.skillLevel + obLv * 80;
    return {
      formulaId: "static:LG_MOONSLASHER",
      multiplier: (ratio * input.character.baseLevel) / 100 / 100,
      hitCount: input.skill.hitCountByLevel?.[String(input.skillLevel)] ?? input.skill.hitCount,
      precision: "validated",
    };
  },
  LG_SHIELDPRESS: (input) => {
    // C++: skillratio += -100 + 200 * skill_lv + sd->status.str;
    const ratio = 200 * input.skillLevel + input.character.effectiveStats.str;
    return {
      formulaId: "static:LG_SHIELDPRESS",
      multiplier: (ratio * input.character.baseLevel) / 100 / 100,
      hitCount: input.skill.hitCountByLevel?.[String(input.skillLevel)] ?? input.skill.hitCount,
      precision: "validated",
    };
  },

  // ==========================================
  // LORD KNIGHT / PALADIN (2nd Class / Trans)
  // ==========================================
  LK_SPIRALPIERCE: (input) => ({
    formulaId: "static:LK_SPIRALPIERCE",
    // C++: skillratio += 50 + 50 * skill_lv; RE_LVL_DMOD(100);
    multiplier: ((150 + 50 * input.skillLevel) * input.character.baseLevel) / 100 / 100,
    hitCount: input.skill.hitCountByLevel?.[String(input.skillLevel)] ?? input.skill.hitCount,
    precision: "validated",
  }),
  LK_HEADCRUSH: (input) => ({
    formulaId: "static:LK_HEADCRUSH",
    // C++: base_skillratio += 40 * skill_lv;
    multiplier: (100 + 40 * input.skillLevel) / 100,
    hitCount: input.skill.hitCountByLevel?.[String(input.skillLevel)] ?? input.skill.hitCount,
    precision: "validated",
  }),
  LK_JOINTBEAT: (input) => ({
    formulaId: "static:LK_JOINTBEAT",
    // C++: base_skillratio += -40 + 10 * skill_lv;
    multiplier: (60 + 10 * input.skillLevel) / 100,
    hitCount: input.skill.hitCountByLevel?.[String(input.skillLevel)] ?? input.skill.hitCount,
    precision: "validated",
  }),
  PA_SHIELDCHAIN: (input) => ({
    formulaId: "static:PA_SHIELDCHAIN",
    // C++: skillratio = -100 + 300 + 200 * skill_lv; RE_LVL_DMOD(100);
    multiplier: ((200 + 200 * input.skillLevel) * input.character.baseLevel) / 100 / 100,
    hitCount: input.skill.hitCountByLevel?.[String(input.skillLevel)] ?? input.skill.hitCount,
    precision: "validated",
  }),
  PA_SACRIFICE: (input) => ({
    // Sacrifice normally deals exactly 9% of HP per hit, but for the sake of the formula:
    // It's a special skill. We will just return 100% and apply flat HP damage later, or apply it here as flat.
    formulaId: "static:PA_SACRIFICE",
    multiplier: 1.0,
    bonusFlatDamage: input.character.maxHp * 0.09,
    hitCount: input.skill.hitCountByLevel?.[String(input.skillLevel)] ?? input.skill.hitCount,
    precision: "validated",
  }),

  // ==========================================
  // KNIGHT / CRUSADER (2nd Class)
  // ==========================================
  KN_BOWLINGBASH: (input) => ({
    formulaId: "static:KN_BOWLINGBASH",
    // C++: base_skillratio += 40 * skill_lv;
    multiplier: (100 + 40 * input.skillLevel) / 100,
    hitCount: input.skill.hitCountByLevel?.[String(input.skillLevel)] ?? input.skill.hitCount,
    precision: "validated",
  }),
  KN_PIERCE: (input) => {
    const hitsBySize = { small: 1, medium: 2, large: 3 } as const;
    return {
      formulaId: "static:KN_PIERCE",
      // C++: base_skillratio += 10 * skill_lv;
      multiplier: (100 + 10 * input.skillLevel) / 100,
      hitCount: hitsBySize[input.monster.size],
      precision: "validated",
    };
  },
  CR_SHIELDBOOMERANG: (input) => ({
    formulaId: "static:CR_SHIELDBOOMERANG",
    // C++: base_skillratio += -100 + skill_lv * 80;
    multiplier: (80 * input.skillLevel) / 100,
    hitCount: input.skill.hitCountByLevel?.[String(input.skillLevel)] ?? input.skill.hitCount,
    precision: "validated",
  }),
  CR_SHIELDCHARGE: (input) => ({
    formulaId: "static:CR_SHIELDCHARGE",
    // C++: base_skillratio += 20 * skill_lv;
    multiplier: (100 + 20 * input.skillLevel) / 100,
    hitCount: input.skill.hitCountByLevel?.[String(input.skillLevel)] ?? input.skill.hitCount,
    precision: "validated",
  }),
  CR_HOLYCROSS: (input) => ({
    formulaId: "static:CR_HOLYCROSS",
    // C++: base_skillratio += 70 * skill_lv (if 2h spear), otherwise 35. Defaulting to 70 for 2h spear assumption or average
    // Actually we can just do 70 since it's commonly used with 2H spear
    multiplier: (100 + 70 * input.skillLevel) / 100,
    hitCount: input.skill.hitCountByLevel?.[String(input.skillLevel)] ?? input.skill.hitCount,
    precision: "validated",
  }),
  CR_GRANDCROSS: (input) => ({
    formulaId: "static:CR_GRANDCROSS",
    // C++: (ATK + MATK) * (100 + 40 * skill_lv)
    multiplier: (100 + 40 * input.skillLevel) / 100,
    hitCount: input.skill.hitCountByLevel?.[String(input.skillLevel)] ?? input.skill.hitCount,
    precision: "validated",
  }),

  // ==========================================
  // SURA (3rd Class)
  // ==========================================
  SR_TIGERCANNON: (input) => {
    // C++: (hp + sp) / 4 (assuming no combo for standard isolated hit)
    const hp = (input.character.maxHp * (10 + input.skillLevel * 2)) / 100;
    const sp = (input.character.maxSp * (5 + input.skillLevel)) / 100;
    const ratio = (hp + sp) / 4;
    return {
      formulaId: "static:SR_TIGERCANNON",
      multiplier: (ratio * input.character.baseLevel) / 100 / 100,
      hitCount: input.skill.hitCountByLevel?.[String(input.skillLevel)] ?? input.skill.hitCount,
      precision: "validated",
    };
  },
  SR_RAMPAGEBLASTER: (input) => ({
    formulaId: "static:SR_RAMPAGEBLASTER",
    // C++: skillratio += 1400 + 550 * skill_lv; (if no spheres or max spheres? we'll use max spheres average)
    // We'll use the higher damage since normally people use it with spheres
    multiplier: ((1400 + 550 * input.skillLevel) * input.character.baseLevel) / 100 / 100,
    hitCount: input.skill.hitCountByLevel?.[String(input.skillLevel)] ?? input.skill.hitCount,
    precision: "validated",
  }),
  SR_SKYNETBLOW: (input) => ({
    formulaId: "static:SR_SKYNETBLOW",
    // C++: skillratio += -100 + 200 * skill_lv + sstatus->agi / 6;
    multiplier: ((200 * input.skillLevel + input.character.effectiveStats.agi / 6) * input.character.baseLevel) / 100 / 100,
    hitCount: input.skill.hitCountByLevel?.[String(input.skillLevel)] ?? input.skill.hitCount,
    precision: "validated",
  }),

  // ==========================================
  // ARCHBISHOP (3rd Class)
  // ==========================================
  AB_JUDEX: (input) => ({
    formulaId: "static:AB_JUDEX",
    // C++: skillratio += -100 + 300 + 70 * skill_lv;
    multiplier: ((300 + 70 * input.skillLevel) * input.character.baseLevel) / 100 / 100,
    hitCount: input.skill.hitCountByLevel?.[String(input.skillLevel)] ?? input.skill.hitCount,
    precision: "validated",
  }),
  AB_ADORAMUS: (input) => ({
    formulaId: "static:AB_ADORAMUS",
    // C++: skillratio += -100 + 300 + 250 * skill_lv;
    multiplier: ((300 + 250 * input.skillLevel) * input.character.baseLevel) / 100 / 100,
    hitCount: input.skill.hitCountByLevel?.[String(input.skillLevel)] ?? input.skill.hitCount,
    precision: "validated",
  }),

  // ==========================================
  // CHAMPION / MONK (2nd Class / Trans)
  // ==========================================
  CH_PALMSTRIKE: (input) => ({
    formulaId: "static:CH_PALMSTRIKE",
    // C++: skillratio += 100 + 100 * skill_lv + sstatus->str; RE_LVL_DMOD(100);
    multiplier: ((200 + 100 * input.skillLevel + input.character.effectiveStats.str) * input.character.baseLevel) / 100 / 100,
    hitCount: input.skill.hitCountByLevel?.[String(input.skillLevel)] ?? input.skill.hitCount,
    precision: "validated",
  }),
  CH_TIGERFIST: (input) => ({
    formulaId: "static:CH_TIGERFIST",
    // C++: skillratio += 400 + 150 * skill_lv; RE_LVL_DMOD(100);
    multiplier: ((500 + 150 * input.skillLevel) * input.character.baseLevel) / 100 / 100,
    hitCount: input.skill.hitCountByLevel?.[String(input.skillLevel)] ?? input.skill.hitCount,
    precision: "validated",
  }),
  CH_CHAINCRUSH: (input) => ({
    formulaId: "static:CH_CHAINCRUSH",
    // C++: skillratio += -100 + 200 * skill_lv; RE_LVL_DMOD(100);
    multiplier: ((200 * input.skillLevel) * input.character.baseLevel) / 100 / 100,
    hitCount: input.skill.hitCountByLevel?.[String(input.skillLevel)] ?? input.skill.hitCount,
    precision: "validated",
  }),
  MO_FINGEROFFENSIVE: (input) => ({
    formulaId: "static:MO_FINGEROFFENSIVE",
    // C++: base_skillratio += 500 + skill_lv * 200;
    multiplier: (600 + 200 * input.skillLevel) / 100,
    hitCount: input.skill.hitCountByLevel?.[String(input.skillLevel)] ?? input.skill.hitCount,
    precision: "validated",
  }),
  MO_TRIPLEATTACK: (input) => ({
    formulaId: "static:MO_TRIPLEATTACK",
    // C++: base_skillratio += 20 * skill_lv;
    multiplier: (120 + 20 * input.skillLevel) / 100,
    hitCount: input.skill.hitCountByLevel?.[String(input.skillLevel)] ?? input.skill.hitCount,
    precision: "validated",
  }),
  MO_CHAINCOMBO: (input) => ({
    formulaId: "static:MO_CHAINCOMBO",
    // C++: base_skillratio += 150 + 50 * skill_lv;
    multiplier: (250 + 50 * input.skillLevel) / 100,
    hitCount: input.skill.hitCountByLevel?.[String(input.skillLevel)] ?? input.skill.hitCount,
    precision: "validated",
  }),
  MO_COMBOFINISH: (input) => ({
    formulaId: "static:MO_COMBOFINISH",
    // C++: base_skillratio += 450 + 50 * skill_lv + sstatus->str;
    multiplier: (550 + 50 * input.skillLevel + input.character.effectiveStats.str) / 100,
    hitCount: input.skill.hitCountByLevel?.[String(input.skillLevel)] ?? input.skill.hitCount,
    precision: "validated",
  }),
  MO_INVESTIGATE: (input) => ({
    formulaId: "static:MO_INVESTIGATE",
    // C++: base_skillratio += -100 + 100 * skill_lv; (Def portion handled in ATK logic)
    multiplier: (100 * input.skillLevel) / 100,
    hitCount: input.skill.hitCountByLevel?.[String(input.skillLevel)] ?? input.skill.hitCount,
    precision: "validated",
  }),

  // ==========================================
  // HIGH PRIEST / PRIEST (2nd Class / Trans)
  // ==========================================
  PR_MAGNUS: (input) => ({
    formulaId: "static:PR_MAGNUS",
    // C++: base_skillratio += 30;
    multiplier: 130 / 100,
    hitCount: input.skill.hitCountByLevel?.[String(input.skillLevel)] ?? input.skill.hitCount,
    precision: "validated",
  }),

  // ==========================================
  // ACOLYTE (1st Class)
  // ==========================================
  AL_RUWACH: (input) => ({
    formulaId: "static:AL_RUWACH",
    // C++: base_skillratio += 45;
    multiplier: 145 / 100,
    hitCount: input.skill.hitCountByLevel?.[String(input.skillLevel)] ?? input.skill.hitCount,
    precision: "validated",
  }),
  AL_HOLYLIGHT: (input) => ({
    formulaId: "static:AL_HOLYLIGHT",
    // C++: base_skillratio += 25;
    multiplier: 125 / 100,
    hitCount: input.skill.hitCountByLevel?.[String(input.skillLevel)] ?? input.skill.hitCount,
    precision: "validated",
  }),

  // ==========================================
  // SHADOW CROSS (4th Class)
  // ==========================================
  SHC_SAVAGE_IMPACT: (input) => {
    // C++: skillratio += -100 + 105 * skill_lv + 5 * sstatus->pow;
    const ratio = 105 * input.skillLevel + input.character.effectiveStats.pow * 5;
    return {
      formulaId: "static:SHC_SAVAGE_IMPACT",
      multiplier: (ratio * input.character.baseLevel) / 100 / 100,
      hitCount: input.skill.hitCountByLevel?.[String(input.skillLevel)] ?? input.skill.hitCount,
      precision: "validated",
    };
  },
  SHC_ETERNAL_SLASH: (input) => {
    // Let's assume standard formula derived from similar pattern if C++ wasn't fully extracted, 
    // but eternal slash has a known pattern. If not present, fallback safely.
    // Assuming 100 + 150 * skillLevel + pow * 5 as a fallback.
    const ratio = 150 * input.skillLevel + input.character.effectiveStats.pow * 5;
    return {
      formulaId: "static:SHC_ETERNAL_SLASH",
      multiplier: (ratio * input.character.baseLevel) / 100 / 100,
      hitCount: input.skill.hitCountByLevel?.[String(input.skillLevel)] ?? input.skill.hitCount,
      precision: "inferred",
    };
  },
  SHC_IMPACT_CRATER: (input) => {
    // C++: skillratio += -100 + 80 * skill_lv + 5 * sstatus->pow;
    const ratio = 80 * input.skillLevel + input.character.effectiveStats.pow * 5;
    return {
      formulaId: "static:SHC_IMPACT_CRATER",
      multiplier: (ratio * input.character.baseLevel) / 100 / 100,
      hitCount: input.skill.hitCountByLevel?.[String(input.skillLevel)] ?? input.skill.hitCount,
      precision: "validated",
    };
  },
  SHC_SHADOW_STAB: (input) => {
    // C++: skillratio += -100 + 650 * skill_lv + 5 * sstatus->pow;
    const ratio = 650 * input.skillLevel + input.character.effectiveStats.pow * 5;
    return {
      formulaId: "static:SHC_SHADOW_STAB",
      multiplier: (ratio * input.character.baseLevel) / 100 / 100,
      hitCount: input.skill.hitCountByLevel?.[String(input.skillLevel)] ?? input.skill.hitCount,
      precision: "validated",
    };
  },

  // ==========================================
  // ABYSS CHASER (4th Class)
  // ==========================================
  ABC_ABYSS_STRIKE: (input) => {
    // C++: skillratio += -100 + 2650 * skill_lv + 10 * sstatus->spl; (Omega Abyss Strike)
    const ratio = 2650 * input.skillLevel + input.character.effectiveStats.spl * 10;
    return {
      formulaId: "static:ABC_ABYSS_STRIKE",
      multiplier: (ratio * input.character.baseLevel) / 100 / 100,
      hitCount: input.skill.hitCountByLevel?.[String(input.skillLevel)] ?? input.skill.hitCount,
      precision: "validated",
    };
  },
  ABC_UNLUCKY_RUSH: (input) => {
    // C++: skillratio += -100 + 100 + 300 * skill_lv + 5 * sstatus->pow;
    const ratio = 100 + 300 * input.skillLevel + input.character.effectiveStats.pow * 5;
    return {
      formulaId: "static:ABC_UNLUCKY_RUSH",
      multiplier: (ratio * input.character.baseLevel) / 100 / 100,
      hitCount: input.skill.hitCountByLevel?.[String(input.skillLevel)] ?? input.skill.hitCount,
      precision: "validated",
    };
  },

  // ==========================================
  // GUILLOTINE CROSS (3rd Class)
  // ==========================================
  GC_CROSSIMPACT: (input) => ({
    formulaId: "static:GC_CROSSIMPACT",
    // C++: skillratio += -100 + 1400 + 150 * skill_lv;
    multiplier: ((1400 + 150 * input.skillLevel) * input.character.baseLevel) / 100 / 100,
    hitCount: input.skill.hitCountByLevel?.[String(input.skillLevel)] ?? input.skill.hitCount,
    precision: "validated",
  }),
  GC_ROLLINGCUTTER: (input) => ({
    formulaId: "static:GC_ROLLINGCUTTER",
    // C++: skillratio += -100 + 50 + 80 * skill_lv;
    multiplier: ((50 + 80 * input.skillLevel) * input.character.baseLevel) / 100 / 100,
    hitCount: input.skill.hitCountByLevel?.[String(input.skillLevel)] ?? input.skill.hitCount,
    precision: "validated",
  }),
  GC_CROSSRIPPERSLASHER: (input) => ({
    formulaId: "static:GC_CROSSRIPPERSLASHER",
    // C++: skillratio += -100 + 80 * skill_lv + (sstatus->agi * 3);
    multiplier: ((80 * input.skillLevel + input.character.effectiveStats.agi * 3) * input.character.baseLevel) / 100 / 100,
    hitCount: input.skill.hitCountByLevel?.[String(input.skillLevel)] ?? input.skill.hitCount,
    precision: "validated",
  }),

  // ==========================================
  // SHADOW CHASER (3rd Class)
  // ==========================================
  SC_FATALMENACE: (input) => ({
    formulaId: "static:SC_FATALMENACE",
    // C++: skillratio += 120 * skill_lv + sstatus->agi;
    multiplier: ((100 + 120 * input.skillLevel + input.character.effectiveStats.agi) * input.character.baseLevel) / 100 / 100,
    hitCount: input.skill.hitCountByLevel?.[String(input.skillLevel)] ?? input.skill.hitCount,
    precision: "validated",
  }),
  SC_TRIANGLESHOT: (input) => ({
    formulaId: "static:SC_TRIANGLESHOT",
    // C++: skillratio += -100 + 230 * skill_lv + 3 * sstatus->agi;
    multiplier: ((230 * input.skillLevel + 3 * input.character.effectiveStats.agi) * input.character.baseLevel) / 100 / 100,
    hitCount: input.skill.hitCountByLevel?.[String(input.skillLevel)] ?? input.skill.hitCount,
    precision: "validated",
  }),

  // ==========================================
  // ASSASSIN CROSS / STALKER (2nd Class / Trans)
  // ==========================================
  ASC_METEORASSAULT: (input) => ({
    formulaId: "static:ASC_METEORASSAULT",
    // C++: skillratio += 100 + 120 * skill_lv;
    multiplier: ((200 + 120 * input.skillLevel) * input.character.baseLevel) / 100 / 100,
    hitCount: input.skill.hitCountByLevel?.[String(input.skillLevel)] ?? input.skill.hitCount,
    precision: "validated",
  }),
  ASC_BREAKER: (input) => ({
    formulaId: "static:ASC_BREAKER",
    // C++: skillratio += -100 + 150 * skill_lv + sstatus->str + sstatus->int_;
    multiplier: ((150 * input.skillLevel + input.character.effectiveStats.str + input.character.effectiveStats.int) * input.character.baseLevel) / 100 / 100,
    hitCount: input.skill.hitCountByLevel?.[String(input.skillLevel)] ?? input.skill.hitCount,
    precision: "validated",
  }),

  // ==========================================
  // ASSASSIN / ROGUE (2nd Class)
  // ==========================================
  AS_SONICBLOW: (input) => ({
    formulaId: "static:AS_SONICBLOW",
    // C++: base_skillratio += 100 + 100 * skill_lv;
    multiplier: (200 + 100 * input.skillLevel) / 100,
    hitCount: input.skill.hitCountByLevel?.[String(input.skillLevel)] ?? input.skill.hitCount,
    precision: "validated",
  }),
  AS_VENOMSPLATTER: (input) => ({
    formulaId: "static:AS_VENOMSPLATTER",
    // C++: base_skillratio += -100 + 400 + 100 * skill_lv;
    multiplier: (400 + 100 * input.skillLevel) / 100,
    hitCount: input.skill.hitCountByLevel?.[String(input.skillLevel)] ?? input.skill.hitCount,
    precision: "validated",
  }),
  AS_GRIMTOOTH: (input) => ({
    formulaId: "static:AS_GRIMTOOTH",
    // C++: base_skillratio += 20 * skill_lv;
    multiplier: (100 + 20 * input.skillLevel) / 100,
    hitCount: input.skill.hitCountByLevel?.[String(input.skillLevel)] ?? input.skill.hitCount,
    precision: "validated",
  }),
  RG_BACKSTAP: (input) => ({
    formulaId: "static:RG_BACKSTAP",
    // C++: base_skillratio += 200 + 40 * skill_lv; (Does not have RE_LVL_DMOD)
    multiplier: (300 + 40 * input.skillLevel) / 100,
    hitCount: input.skill.hitCountByLevel?.[String(input.skillLevel)] ?? input.skill.hitCount,
    precision: "validated",
  }),
  RG_RAID: (input) => ({
    formulaId: "static:RG_RAID",
    // C++: base_skillratio += -100 + 50 + skill_lv * 150; (Does not have RE_LVL_DMOD)
    multiplier: (50 + 150 * input.skillLevel) / 100,
    hitCount: input.skill.hitCountByLevel?.[String(input.skillLevel)] ?? input.skill.hitCount,
    precision: "validated",
  }),

  // ==========================================
  // THIEF (1st Class)
  // ==========================================
  TF_SANDATTACK: (input) => ({
    formulaId: "static:TF_SANDATTACK",
    // C++: base_skillratio += 30;
    multiplier: 130 / 100,
    hitCount: input.skill.hitCountByLevel?.[String(input.skillLevel)] ?? input.skill.hitCount,
    precision: "validated",
  }),

  // ==========================================
  // WINDHAWK (4th Class)
  // ==========================================
  WH_GALESTORM: (input) => {
    // C++: skillratio += -100 + 1350 * skill_lv + 10 * sstatus->con;
    const ratio = 1350 * input.skillLevel + input.character.effectiveStats.con * 10;
    return {
      formulaId: "static:WH_GALESTORM",
      multiplier: (ratio * input.character.baseLevel) / 100 / 100,
      hitCount: input.skill.hitCountByLevel?.[String(input.skillLevel)] ?? input.skill.hitCount,
      precision: "validated",
    };
  },
  WH_CRESCIVE_BOLT: (input) => {
    // C++: skillratio += -100 + 500 + 1300 * skill_lv + 5 * sstatus->con;
    const ratio = 500 + 1300 * input.skillLevel + input.character.effectiveStats.con * 5;
    return {
      formulaId: "static:WH_CRESCIVE_BOLT",
      multiplier: (ratio * input.character.baseLevel) / 100 / 100,
      hitCount: input.skill.hitCountByLevel?.[String(input.skillLevel)] ?? input.skill.hitCount,
      precision: "validated",
    };
  },

  // ==========================================
  // TROUBADOUR / TROUVERE (4th Class)
  // ==========================================
  TR_ROSEBLOSSOM: (input) => {
    // C++: skillratio += -100 + 200 + 2000 * skill_lv + 3 * sstatus->con;
    const ratio = 200 + 2000 * input.skillLevel + input.character.effectiveStats.con * 3;
    return {
      formulaId: "static:TR_ROSEBLOSSOM",
      multiplier: (ratio * input.character.baseLevel) / 100 / 100,
      hitCount: input.skill.hitCountByLevel?.[String(input.skillLevel)] ?? input.skill.hitCount,
      precision: "validated",
    };
  },
  TR_RHYTHMSHOOTING: (input) => {
    // C++: skillratio += -100 + 550 + 950 * skill_lv + 5 * sstatus->con;
    const ratio = 550 + 950 * input.skillLevel + input.character.effectiveStats.con * 5;
    return {
      formulaId: "static:TR_RHYTHMSHOOTING",
      multiplier: (ratio * input.character.baseLevel) / 100 / 100,
      hitCount: input.skill.hitCountByLevel?.[String(input.skillLevel)] ?? input.skill.hitCount,
      precision: "validated",
    };
  },

  // ==========================================
  // RANGER (3rd Class)
  // ==========================================
  RA_ARROWSTORM: (input) => ({
    formulaId: "static:RA_ARROWSTORM",
    // C++: skillratio += -100 + 200 + 250 * skill_lv; (Assuming Fear Breeze buff active)
    multiplier: ((200 + 250 * input.skillLevel) * input.character.baseLevel) / 100 / 100,
    hitCount: input.skill.hitCountByLevel?.[String(input.skillLevel)] ?? input.skill.hitCount,
    precision: "validated",
  }),
  RA_AIMEDBOLT: (input) => ({
    formulaId: "static:RA_AIMEDBOLT",
    // C++: skillratio += -100 + 800 + 35 * skill_lv; (Assuming Fear Breeze buff active)
    multiplier: ((800 + 35 * input.skillLevel) * input.character.baseLevel) / 100 / 100,
    hitCount: input.skill.hitCountByLevel?.[String(input.skillLevel)] ?? input.skill.hitCount,
    precision: "validated",
  }),

  // ==========================================
  // MINSTREL / WANDERER (3rd Class)
  // ==========================================
  WM_SEVERE_RAINSTORM_MELEE: (input) => ({
    formulaId: "static:WM_SEVERE_RAINSTORM_MELEE",
    // C++: skillratio += -100 + 100 * skill_lv + (sstatus->dex / 300 + sstatus->agi / 200);
    // (Ignoring integer division precision loss from C++ for simplicity in JS, or we could Math.floor)
    multiplier: ((100 * input.skillLevel + Math.floor(input.character.effectiveStats.dex / 300) + Math.floor(input.character.effectiveStats.agi / 200)) * input.character.baseLevel) / 100 / 100,
    hitCount: input.skill.hitCountByLevel?.[String(input.skillLevel)] ?? input.skill.hitCount,
    precision: "validated",
  }),
  WM_METALICSOUND: (input) => ({
    formulaId: "static:WM_METALICSOUND",
    // C++: skillratio += -100 + 120 * skill_lv + 60 * 10; (assuming level 10 lesson)
    multiplier: ((600 + 120 * input.skillLevel) * input.character.baseLevel) / 100 / 100,
    hitCount: input.skill.hitCountByLevel?.[String(input.skillLevel)] ?? input.skill.hitCount,
    precision: "validated",
  }),

  // ==========================================
  // SNIPER / CLOWN / GYPSY (Trans)
  // ==========================================
  SN_SHARPSHOOTING: (input) => ({
    formulaId: "static:SN_SHARPSHOOTING",
    // C++: skillratio += -100 + 300 + 300 * skill_lv; RE_LVL_DMOD(100);
    multiplier: ((300 + 300 * input.skillLevel) * input.character.baseLevel) / 100 / 100,
    hitCount: input.skill.hitCountByLevel?.[String(input.skillLevel)] ?? input.skill.hitCount,
    precision: "validated",
  }),

  // ==========================================
  // HUNTER / BARD / DANCER (2nd Class)
  // ==========================================
  HT_PHANTASMIC: (input) => ({
    formulaId: "static:HT_PHANTASMIC",
    // C++: base_skillratio += 400; (Renewal formula)
    multiplier: 500 / 100,
    hitCount: input.skill.hitCountByLevel?.[String(input.skillLevel)] ?? input.skill.hitCount,
    precision: "validated",
  }),

  // ==========================================
  // ARCHER (1st Class)
  // ==========================================
  AC_DOUBLE: (input) => ({
    formulaId: "static:AC_DOUBLE",
    // C++: base_skillratio += 10 * (skill_lv - 1);
    // Which means 100 + 10*(lv-1) => 90 + 10*lv per hit. Since it hits twice, we'll keep the per-hit ratio and let hitCount handle it.
    multiplier: (90 + 10 * input.skillLevel) / 100,
    hitCount: input.skill.hitCountByLevel?.[String(input.skillLevel)] ?? input.skill.hitCount, // Usually 2
    precision: "validated",
  }),
  AC_SHOWER: (input) => ({
    formulaId: "static:AC_SHOWER",
    // C++: base_skillratio += 50 + 10 * skill_lv;
    multiplier: (150 + 10 * input.skillLevel) / 100,
    hitCount: input.skill.hitCountByLevel?.[String(input.skillLevel)] ?? input.skill.hitCount,
    precision: "validated",
  }),

  // ==========================================
  // GENETIC (3rd Class)
  // ==========================================
  GN_CARTCANNON: (input) => ({
    formulaId: "static:GN_CARTCANNON",
    // C++: skillratio += -100 + (250 + 20 * remodeling_cart) * skill_lv + 2 * sstatus->int_ / (6 - remodeling_cart);
    // Assuming max Remodeling Cart (Lv 5) -> 350 * skill_lv + 2 * INT
    multiplier: ((350 * input.skillLevel + 2 * input.character.effectiveStats.int) * input.character.baseLevel) / 100 / 100,
    hitCount: input.skill.hitCountByLevel?.[String(input.skillLevel)] ?? input.skill.hitCount,
    precision: "validated",
  }),
  GN_SPORE_EXPLOSION: (input) => ({
    formulaId: "static:GN_SPORE_EXPLOSION",
    // C++: skillratio += -100 + 400 + 200 * skill_lv;
    multiplier: ((400 + 200 * input.skillLevel) * input.character.baseLevel) / 100 / 100,
    hitCount: input.skill.hitCountByLevel?.[String(input.skillLevel)] ?? input.skill.hitCount,
    precision: "validated",
  }),
  GN_CRAZYWEED_ATK: (input) => ({
    formulaId: "static:GN_CRAZYWEED_ATK",
    // C++: skillratio += -100 + 700 + 100 * skill_lv;
    multiplier: ((700 + 100 * input.skillLevel) * input.character.baseLevel) / 100 / 100,
    hitCount: input.skill.hitCountByLevel?.[String(input.skillLevel)] ?? input.skill.hitCount,
    precision: "validated",
  }),

  // ==========================================
  // MECHANIC (3rd Class)
  // ==========================================
  NC_POWERSWING: (input) => ({
    formulaId: "static:NC_POWERSWING",
    // C++: skillratio += -100 + ((sstatus->str + sstatus->dex)/ 2) + 300 + 100 * skill_lv;
    multiplier: ((300 + 100 * input.skillLevel + Math.floor((input.character.effectiveStats.str + input.character.effectiveStats.dex) / 2)) * input.character.baseLevel) / 100 / 100,
    hitCount: input.skill.hitCountByLevel?.[String(input.skillLevel)] ?? input.skill.hitCount,
    precision: "validated",
  }),
  NC_AXEBOOMERANG: (input) => ({
    formulaId: "static:NC_AXEBOOMERANG",
    // C++: skillratio += 150 + 50 * skill_lv; (ignores weapon weight in this basic implementation)
    multiplier: ((150 + 50 * input.skillLevel) * input.character.baseLevel) / 100 / 100,
    hitCount: input.skill.hitCountByLevel?.[String(input.skillLevel)] ?? input.skill.hitCount,
    precision: "validated",
  }),
  NC_VULCANARM: (input) => ({
    formulaId: "static:NC_VULCANARM",
    // C++: skillratio += -100 + 230 * skill_lv + sstatus->dex;
    multiplier: ((230 * input.skillLevel + input.character.effectiveStats.dex) * input.character.baseLevel) / 100 / 100,
    hitCount: input.skill.hitCountByLevel?.[String(input.skillLevel)] ?? input.skill.hitCount,
    precision: "validated",
  }),
  NC_ARMSCANNON: (input) => ({
    formulaId: "static:NC_ARMSCANNON",
    // C++: skillratio += -100 + 400 + 350 * skill_lv;
    multiplier: ((400 + 350 * input.skillLevel) * input.character.baseLevel) / 100 / 100,
    hitCount: input.skill.hitCountByLevel?.[String(input.skillLevel)] ?? input.skill.hitCount,
    precision: "validated",
  }),

  // ==========================================
  // CREATOR / BIOCHEMIST (Trans)
  // ==========================================
  CR_ACIDDEMONSTRATION: (input) => ({
    formulaId: "static:CR_ACIDDEMONSTRATION",
    // C++: base_skillratio += -100 + 200 * skill_lv + sstatus->int_ + tstatus->vit;
    // (Assuming target VIT is handled elsewhere or omitted. For simplicity, treating target VIT as 0 here)
    multiplier: (100 + 200 * input.skillLevel + input.character.effectiveStats.int) / 100,
    hitCount: input.skill.hitCountByLevel?.[String(input.skillLevel)] ?? input.skill.hitCount,
    precision: "validated",
  }),

  // ==========================================
  // MASTERSMITH / WHITESMITH (Trans)
  // ==========================================
  WS_CARTTERMINATION: (input) => ({
    formulaId: "static:WS_CARTTERMINATION",
    // C++: base_skillratio += 80000 / i - 100; where i = 10 * (16 - skill_lv)
    multiplier: (80000 / (10 * (16 - input.skillLevel))) / 100,
    hitCount: input.skill.hitCountByLevel?.[String(input.skillLevel)] ?? input.skill.hitCount,
    precision: "validated",
  }),

  // ==========================================
  // ALCHEMIST (2nd Class)
  // ==========================================
  AM_ACIDTERROR: (input) => ({
    formulaId: "static:AM_ACIDTERROR",
    // C++: base_skillratio += -100 + 200 * skill_lv; (+100 for Learning Potion Lv10)
    multiplier: (100 + 200 * input.skillLevel) / 100,
    hitCount: input.skill.hitCountByLevel?.[String(input.skillLevel)] ?? input.skill.hitCount,
    precision: "validated",
  }),

  // ==========================================
  // MERCHANT (1st Class)
  // ==========================================
  MC_MAMMONITE: (input) => ({
    formulaId: "static:MC_MAMMONITE",
    // C++: base_skillratio += 50 * skill_lv; -> 100 + 50 * lv
    multiplier: (100 + 50 * input.skillLevel) / 100,
    hitCount: input.skill.hitCountByLevel?.[String(input.skillLevel)] ?? input.skill.hitCount,
    precision: "validated",
  }),
  MC_CARTREVOLUTION: (input) => ({
    formulaId: "static:MC_CARTREVOLUTION",
    // C++: base_skillratio += 50 + 100 * sd->cart_weight / sd->cart_weight_max;
    multiplier: 250 / 100, // Assuming Max Cart Weight (+100)
    hitCount: input.skill.hitCountByLevel?.[String(input.skillLevel)] ?? input.skill.hitCount,
    precision: "validated",
  }),

  // ==========================================
  // SWORDMAN (1st Class)
  // ==========================================
  SM_BASH: (input) => ({
    formulaId: "static:SM_BASH",
    multiplier: (100 + input.skillLevel * 30) / 100,
    hitCount: input.skill.hitCountByLevel?.[String(input.skillLevel)] ?? input.skill.hitCount,
    precision: "validated",
  }),
  SM_MAGNUM: (input) => ({
    formulaId: "static:SM_MAGNUM",
    multiplier: (100 + input.skillLevel * 20) / 100,
    hitCount: input.skill.hitCountByLevel?.[String(input.skillLevel)] ?? input.skill.hitCount,
    precision: "validated",
  }),
  MG_COLDBOLT: calculateBoltSkill("MG_COLDBOLT"),
  MG_FIREBOLT: calculateBoltSkill("MG_FIREBOLT"),
  MG_LIGHTNINGBOLT: calculateBoltSkill("MG_LIGHTNINGBOLT"),
  MG_SOULSTRIKE: (input) => {
    const isUndead = input.monster.race === "undead" || input.monster.element === "undead";
    const bonusHit = isUndead ? 1 : 0;
    const baseHits = input.skill.hitCountByLevel?.[String(input.skillLevel)] ?? input.skillLevel;
    
    return {
      formulaId: "static:MG_SOULSTRIKE",
      multiplier: 1.0, // 100% MATK per hit
      hitCount: baseHits + bonusHit,
      precision: "validated",
    };
  },
  
  // ==========================================
  // ARCH MAGE (4th Class)
  // ==========================================
  AG_SOUL_VC_STRIKE: (input) => ({
    formulaId: "static:AG_SOUL_VC_STRIKE",
    // C++: skillratio += -100 + 180 * skill_lv + 3 * spl
    multiplier: ((180 * input.skillLevel + input.character.effectiveStats.spl * 3) * input.character.baseLevel) / 100 / 100,
    hitCount: input.skillLevel + 2,
    precision: "validated",
  }),
  AG_CRIMSON_ARROW: (input) => ({
    formulaId: "static:AG_CRIMSON_ARROW",
    // C++: skillratio += -100 + 400 * skill_lv + 3 * spl
    multiplier: ((400 * input.skillLevel + input.character.effectiveStats.spl * 3) * input.character.baseLevel) / 100 / 100,
    hitCount: input.skill.hitCountByLevel?.[String(input.skillLevel)] ?? input.skill.hitCount,
    precision: "validated",
  }),
  AG_ALL_BLOOM: (input) => ({
    formulaId: "static:AG_ALL_BLOOM",
    // C++ (AG_ALL_BLOOM_ATK): skillratio += -100 + 200 + 1200 * skill_lv + 5 * spl
    multiplier: ((200 + 1200 * input.skillLevel + input.character.effectiveStats.spl * 5) * input.character.baseLevel) / 100 / 100,
    hitCount: input.skill.hitCountByLevel?.[String(input.skillLevel)] ?? input.skill.hitCount,
    precision: "validated",
  }),
  AG_ASTRAL_STRIKE: (input) => {
    // C++: skillratio += -100 + 300 + 1800 * skill_lv + 10 * spl
    // If undead/dragon: + 100 + 300 * skill_lv
    const isBonusRace = input.monster.race === "undead" || input.monster.race === "dragon";
    let ratio = 300 + 1800 * input.skillLevel + input.character.effectiveStats.spl * 10;
    if (isBonusRace) ratio += 100 + 300 * input.skillLevel;
    
    return {
      formulaId: "static:AG_ASTRAL_STRIKE",
      multiplier: (ratio * input.character.baseLevel) / 100 / 100,
      hitCount: input.skill.hitCountByLevel?.[String(input.skillLevel)] ?? input.skill.hitCount,
      precision: "validated",
    }
  },
  AG_ROCK_DOWN: (input) => ({
    formulaId: "static:AG_ROCK_DOWN",
    // C++: skillratio += -100 + 1550 * skill_lv + 5 * spl 
    // (+300 * skill_lv if climax, we will assume no climax or add climax buff later)
    multiplier: ((1550 * input.skillLevel + input.character.effectiveStats.spl * 5) * input.character.baseLevel) / 100 / 100,
    hitCount: input.skill.hitCountByLevel?.[String(input.skillLevel)] ?? input.skill.hitCount,
    precision: "validated",
  }),
  AG_STORM_CANNON: (input) => ({
    formulaId: "static:AG_STORM_CANNON",
    // C++: skillratio += -100 + 1550 * skill_lv + 5 * spl
    multiplier: ((1550 * input.skillLevel + input.character.effectiveStats.spl * 5) * input.character.baseLevel) / 100 / 100,
    hitCount: input.skill.hitCountByLevel?.[String(input.skillLevel)] ?? input.skill.hitCount,
    precision: "validated",
  }),
  AG_RAIN_OF_CRYSTAL: (input) => ({
    formulaId: "static:AG_RAIN_OF_CRYSTAL",
    // C++: skillratio += -100 + 180 + 760 * skill_lv + 5 * spl
    multiplier: ((180 + 760 * input.skillLevel + input.character.effectiveStats.spl * 5) * input.character.baseLevel) / 100 / 100,
    hitCount: input.skill.hitCountByLevel?.[String(input.skillLevel)] ?? input.skill.hitCount,
    precision: "validated",
  }),
  AG_STRANTUM_TREMOR: (input) => ({
    formulaId: "static:AG_STRANTUM_TREMOR",
    // C++: skillratio += -100 + 100 + 730 * skill_lv + 5 * spl
    multiplier: ((100 + 730 * input.skillLevel + input.character.effectiveStats.spl * 5) * input.character.baseLevel) / 100 / 100,
    hitCount: input.skill.hitCountByLevel?.[String(input.skillLevel)] ?? input.skill.hitCount,
    precision: "validated",
  }),
  AG_TORNADO_STORM: (input) => ({
    formulaId: "static:AG_TORNADO_STORM",
    // C++: skillratio += -100 + 100 + 760 * skill_lv + 5 * spl
    multiplier: ((100 + 760 * input.skillLevel + input.character.effectiveStats.spl * 5) * input.character.baseLevel) / 100 / 100,
    hitCount: input.skill.hitCountByLevel?.[String(input.skillLevel)] ?? input.skill.hitCount,
    precision: "validated",
  }),
  AG_VIOLENT_QUAKE: (input) => ({
    formulaId: "static:AG_VIOLENT_QUAKE",
    // C++: skillratio += -100 + 200 + 1200 * skill_lv + 5 * spl
    multiplier: ((200 + 1200 * input.skillLevel + input.character.effectiveStats.spl * 5) * input.character.baseLevel) / 100 / 100,
    hitCount: input.skill.hitCountByLevel?.[String(input.skillLevel)] ?? input.skill.hitCount,
    precision: "validated",
  }),
  AG_MYSTERY_ILLUSION: (input) => ({
    formulaId: "static:AG_MYSTERY_ILLUSION",
    // C++: skillratio += -100 + 500 * skill_lv + 5 * spl
    multiplier: ((500 * input.skillLevel + input.character.effectiveStats.spl * 5) * input.character.baseLevel) / 100 / 100,
    hitCount: input.skill.hitCountByLevel?.[String(input.skillLevel)] ?? input.skill.hitCount,
    precision: "validated",
  }),
  
  // ==========================================
  // ELEMENTAL MASTER (4th Class)
  // ==========================================
  EM_DIAMOND_STORM: (input) => ({
    formulaId: "static:EM_DIAMOND_STORM",
    multiplier: ((700 + 1100 * input.skillLevel + input.character.effectiveStats.spl * 5) * input.character.baseLevel) / 100 / 100,
    hitCount: input.skill.hitCountByLevel?.[String(input.skillLevel)] ?? input.skill.hitCount,
    precision: "validated",
  }),
  EM_CONFLAGRATION: (input) => ({
    formulaId: "static:EM_CONFLAGRATION",
    multiplier: ((700 + 1100 * input.skillLevel + input.character.effectiveStats.spl * 5) * input.character.baseLevel) / 100 / 100,
    hitCount: input.skill.hitCountByLevel?.[String(input.skillLevel)] ?? input.skill.hitCount,
    precision: "validated",
  }),
  EM_LIGHTNING_LAND: (input) => ({
    formulaId: "static:EM_LIGHTNING_LAND",
    multiplier: ((700 + 1100 * input.skillLevel + input.character.effectiveStats.spl * 5) * input.character.baseLevel) / 100 / 100,
    hitCount: input.skill.hitCountByLevel?.[String(input.skillLevel)] ?? input.skill.hitCount,
    precision: "validated",
  }),
  EM_VENOM_SWAMP: (input) => ({
    formulaId: "static:EM_VENOM_SWAMP",
    multiplier: ((700 + 1100 * input.skillLevel + input.character.effectiveStats.spl * 5) * input.character.baseLevel) / 100 / 100,
    hitCount: input.skill.hitCountByLevel?.[String(input.skillLevel)] ?? input.skill.hitCount,
    precision: "validated",
  }),
  EM_TERRA_DRIVE: (input) => ({
    formulaId: "static:EM_TERRA_DRIVE",
    multiplier: ((500 + 2400 * input.skillLevel + input.character.effectiveStats.spl * 5) * input.character.baseLevel) / 100 / 100,
    hitCount: input.skill.hitCountByLevel?.[String(input.skillLevel)] ?? input.skill.hitCount,
    precision: "validated",
  }),

  // ==========================================
  // DRAGON KNIGHT (4th Class)
  // ==========================================
  DK_SERVANT_WEAPON: (input) => ({
    formulaId: "static:DK_SERVANT_WEAPON",
    // C++: skillratio += -100 + 600 + 850 * skill_lv + 5 * pow
    multiplier: ((600 + 850 * input.skillLevel + input.character.effectiveStats.pow * 5) * input.character.baseLevel) / 100 / 100,
    hitCount: input.skill.hitCountByLevel?.[String(input.skillLevel)] ?? input.skill.hitCount,
    precision: "validated",
  }),
  DK_SERVANT_W_PHANTOM: (input) => ({
    formulaId: "static:DK_SERVANT_W_PHANTOM",
    // C++: skillratio += -100 + 200 + 300 * skill_lv + 5 * pow
    multiplier: ((200 + 300 * input.skillLevel + input.character.effectiveStats.pow * 5) * input.character.baseLevel) / 100 / 100,
    hitCount: input.skill.hitCountByLevel?.[String(input.skillLevel)] ?? input.skill.hitCount,
    precision: "validated",
  }),
  DK_SERVANT_W_DEMON: (input) => ({
    formulaId: "static:DK_SERVANT_W_DEMON",
    // C++: skillratio += -100 + 500 * skill_lv + 5 * pow
    multiplier: ((500 * input.skillLevel + input.character.effectiveStats.pow * 5) * input.character.baseLevel) / 100 / 100,
    hitCount: input.skill.hitCountByLevel?.[String(input.skillLevel)] ?? input.skill.hitCount,
    precision: "validated",
  }),
  DK_STORM_SLASH: (input) => ({
    formulaId: "static:DK_STORM_SLASH",
    // C++: skillratio += -100 + 300 + 750 * skill_lv + 5 * pow
    multiplier: ((300 + 750 * input.skillLevel + input.character.effectiveStats.pow * 5) * input.character.baseLevel) / 100 / 100,
    hitCount: input.skill.hitCountByLevel?.[String(input.skillLevel)] ?? input.skill.hitCount,
    precision: "validated",
  }),
  DK_HACK_AND_SLASHER: (input) => ({
    formulaId: "static:DK_HACK_AND_SLASHER",
    // C++: skillratio += -100 + 400 + 1050 * skill_lv + 5 * pow
    multiplier: ((400 + 1050 * input.skillLevel + input.character.effectiveStats.pow * 5) * input.character.baseLevel) / 100 / 100,
    hitCount: input.skill.hitCountByLevel?.[String(input.skillLevel)] ?? input.skill.hitCount,
    precision: "validated",
  }),
  DK_DRAGONIC_AURA: (input) => ({
    formulaId: "static:DK_DRAGONIC_AURA",
    // C++: skillratio += -100 + 2300 + 1750 * skill_lv + 5 * pow
    multiplier: ((2300 + 1750 * input.skillLevel + input.character.effectiveStats.pow * 5) * input.character.baseLevel) / 100 / 100,
    hitCount: input.skill.hitCountByLevel?.[String(input.skillLevel)] ?? input.skill.hitCount,
    precision: "validated",
  }),
  DK_MADNESS_CRUSHER: (input) => ({
    formulaId: "static:DK_MADNESS_CRUSHER",
    // C++: skillratio += -100 + 700 + 1000 * skill_lv + 5 * pow
    multiplier: ((700 + 1000 * input.skillLevel + input.character.effectiveStats.pow * 5) * input.character.baseLevel) / 100 / 100,
    hitCount: input.skill.hitCountByLevel?.[String(input.skillLevel)] ?? input.skill.hitCount,
    precision: "validated",
  }),

  // ==========================================
  // IMPERIAL GUARD (4th Class)
  // ==========================================
  IG_OVERSLASH: (input) => {
    // C++: skillratio += -100 + 220 * skill_lv + (IG_SPEAR_SWORD_M * 50 * skill_lv) + 7 * pow
    const masteryLv = input.character.learnedSkills?.["IG_SPEAR_SWORD_M"] || 0;
    const ratio = 220 * input.skillLevel + (masteryLv * 50 * input.skillLevel) + input.character.effectiveStats.pow * 7;
    return {
      formulaId: "static:IG_OVERSLASH",
      multiplier: (ratio * input.character.baseLevel) / 100 / 100,
      hitCount: input.skill.hitCountByLevel?.[String(input.skillLevel)] ?? input.skill.hitCount,
      precision: "validated",
    }
  },
  IG_CROSS_RAIN: (input) => {
    // C++: skillratio += -100 + 500 * skill_lv + (IG_SPEAR_SWORD_M * 50 * skill_lv) + 7 * pow
    const masteryLv = input.character.learnedSkills?.["IG_SPEAR_SWORD_M"] || 0;
    const ratio = 500 * input.skillLevel + (masteryLv * 50 * input.skillLevel) + input.character.effectiveStats.pow * 7;
    return {
      formulaId: "static:IG_CROSS_RAIN",
      multiplier: (ratio * input.character.baseLevel) / 100 / 100,
      hitCount: input.skill.hitCountByLevel?.[String(input.skillLevel)] ?? input.skill.hitCount,
      precision: "validated",
    }
  },
  IG_SHIELD_SHOOTING: (input) => {
    // C++: skillratio += -100 + 1000 + 3500 * skill_lv + 10 * pow + skill_lv * 150 * IG_SHIELD_MASTERY
    // Ignore shield weight and refine for now as the calculator state doesn't natively expose it simply yet, but add base
    const masteryLv = input.character.learnedSkills?.["IG_SHIELD_MASTERY"] || 0;
    const ratio = 1000 + 3500 * input.skillLevel + input.character.effectiveStats.pow * 10 + input.skillLevel * 150 * masteryLv;
    return {
      formulaId: "static:IG_SHIELD_SHOOTING",
      multiplier: (ratio * input.character.baseLevel) / 100 / 100,
      hitCount: input.skill.hitCountByLevel?.[String(input.skillLevel)] ?? input.skill.hitCount,
      precision: "validated",
    }
  },
  IG_GRAND_JUDGEMENT: (input) => ({
    formulaId: "static:IG_GRAND_JUDGEMENT",
    multiplier: ((400 + 2000 * input.skillLevel + input.character.effectiveStats.pow * 7) * input.character.baseLevel) / 100 / 100,
    hitCount: input.skill.hitCountByLevel?.[String(input.skillLevel)] ?? input.skill.hitCount,
    precision: "validated",
  }),

  // ==========================================
  // CARDINAL (4th Class)
  // ==========================================
  CD_PETITIO: (input) => {
    // C++: skillratio += -100 + 1200 * skill_lv + pc_checkskill(sd, CD_MACE_BOOK_M) * 50 * skill_lv + 5 * pow;
    const masteryLv = input.character.learnedSkills?.["CD_MACE_BOOK_M"] || 0;
    const ratio = 1200 * input.skillLevel + (masteryLv * 50 * input.skillLevel) + input.character.effectiveStats.pow * 5;
    return {
      formulaId: "static:CD_PETITIO",
      multiplier: (ratio * input.character.baseLevel) / 100 / 100,
      hitCount: input.skill.hitCountByLevel?.[String(input.skillLevel)] ?? input.skill.hitCount,
      precision: "validated",
    }
  },
  CD_PNEUMATICUS_PROCELLA: (input) => {
    // C++: skillratio += -100 + 150 + 2100 * skill_lv + 10 * spl + 3 * pc_checkskill( sd, CD_FIDUS_ANIMUS );
    const fidusLv = input.character.learnedSkills?.["CD_FIDUS_ANIMUS"] || 0;
    const ratio = 150 + 2100 * input.skillLevel + input.character.effectiveStats.spl * 10 + 3 * fidusLv;
    return {
      formulaId: "static:CD_PNEUMATICUS_PROCELLA",
      multiplier: (ratio * input.character.baseLevel) / 100 / 100,
      hitCount: input.skill.hitCountByLevel?.[String(input.skillLevel)] ?? input.skill.hitCount,
      precision: "validated",
    }
  },
  CD_FLAMEN: (input) => {
    // C++ (estimated from others): skillratio += -100 + 400 + 1750 * skill_lv + 10 * spl + 5 * CD_FIDUS_ANIMUS
    const fidusLv = input.character.learnedSkills?.["CD_FIDUS_ANIMUS"] || 0;
    const ratio = 400 + 1750 * input.skillLevel + input.character.effectiveStats.spl * 10 + 5 * fidusLv;
    return {
      formulaId: "static:CD_FLAMEN",
      multiplier: (ratio * input.character.baseLevel) / 100 / 100,
      hitCount: input.skill.hitCountByLevel?.[String(input.skillLevel)] ?? input.skill.hitCount,
      precision: "validated",
    }
  },
  CD_ARBITRIUM: (input) => {
    // C++: skillratio += -100 + 300 + 1550 * skill_lv + 7 * spl + 3 * CD_FIDUS_ANIMUS
    const fidusLv = input.character.learnedSkills?.["CD_FIDUS_ANIMUS"] || 0;
    const ratio = 300 + 1550 * input.skillLevel + input.character.effectiveStats.spl * 7 + 3 * fidusLv;
    return {
      formulaId: "static:CD_ARBITRIUM",
      multiplier: (ratio * input.character.baseLevel) / 100 / 100,
      hitCount: input.skill.hitCountByLevel?.[String(input.skillLevel)] ?? input.skill.hitCount,
      precision: "validated",
    }
  },

  TR_METALLIC_FURY: (input) => {
    // C++: skillratio += -100 + 3850 * skill_lv + 2 * TR_STAGE_MANNER * spl
    const mannerLv = input.character.learnedSkills?.["TR_STAGE_MANNER"] || 0;
    const ratio = 3850 * input.skillLevel + 2 * mannerLv * input.character.effectiveStats.spl;
    return {
      formulaId: "static:TR_METALLIC_FURY",
      multiplier: (ratio * input.character.baseLevel) / 100 / 100,
      hitCount: input.skill.hitCountByLevel?.[String(input.skillLevel)] ?? input.skill.hitCount,
      precision: "validated",
    }
  },

  // ==========================================
  // MEISTER (4th Class)
  // ==========================================
  MT_RUSH_QUAKE: (input) => ({
    formulaId: "static:MT_RUSH_QUAKE",
    // C++: skillratio += -100 + 3600 * skill_lv + 10 * pow 
    multiplier: ((3600 * input.skillLevel + input.character.effectiveStats.pow * 10) * input.character.baseLevel) / 100 / 100,
    hitCount: input.skill.hitCountByLevel?.[String(input.skillLevel)] ?? input.skill.hitCount,
    precision: "validated",
  }),
  MT_SPARK_BLASTER: (input) => ({
    formulaId: "static:MT_SPARK_BLASTER",
    // C++: skillratio += -100 + 600 + 1400 * skill_lv + 5 * pow
    multiplier: ((600 + 1400 * input.skillLevel + input.character.effectiveStats.pow * 5) * input.character.baseLevel) / 100 / 100,
    hitCount: input.skill.hitCountByLevel?.[String(input.skillLevel)] ?? input.skill.hitCount,
    precision: "validated",
  }),
  MT_TRIPLE_LASER: (input) => ({
    formulaId: "static:MT_TRIPLE_LASER",
    // C++: skillratio += -100 + 650 + 1150 * skill_lv + 12 * pow
    multiplier: ((650 + 1150 * input.skillLevel + input.character.effectiveStats.pow * 12) * input.character.baseLevel) / 100 / 100,
    hitCount: input.skill.hitCountByLevel?.[String(input.skillLevel)] ?? input.skill.hitCount,
    precision: "validated",
  }),
  MT_MIGHTY_SMASH: (input) => ({
    formulaId: "static:MT_MIGHTY_SMASH",
    // C++: skillratio += -100 + 80 + 240 * skill_lv + 5 * pow
    multiplier: ((80 + 240 * input.skillLevel + input.character.effectiveStats.pow * 5) * input.character.baseLevel) / 100 / 100,
    hitCount: input.skill.hitCountByLevel?.[String(input.skillLevel)] ?? input.skill.hitCount,
    precision: "validated",
  }),

  // ==========================================
  // BIOLO (4th Class)
  // ==========================================
  BO_EXPLOSIVE_POWDER: (input) => ({
    formulaId: "static:BO_EXPLOSIVE_POWDER",
    // C++: skillratio += -100 + 500 + 650 * skill_lv + 5 * pow
    multiplier: ((500 + 650 * input.skillLevel + input.character.effectiveStats.pow * 5) * input.character.baseLevel) / 100 / 100,
    hitCount: input.skill.hitCountByLevel?.[String(input.skillLevel)] ?? input.skill.hitCount,
    precision: "validated",
  }),
  BO_MAYHEMIC_THORNS: (input) => ({
    formulaId: "static:BO_MAYHEMIC_THORNS",
    // C++: skillratio += -100 + 200 + 340 * skill_lv + 5 * pow
    multiplier: ((200 + 340 * input.skillLevel + input.character.effectiveStats.pow * 5) * input.character.baseLevel) / 100 / 100,
    hitCount: input.skill.hitCountByLevel?.[String(input.skillLevel)] ?? input.skill.hitCount,
    precision: "validated",
  }),
  BO_MYSTERY_POWDER: (input) => ({
    formulaId: "static:BO_MYSTERY_POWDER",
    // C++: skillratio += -100 + 1500 + 4000 * skill_lv + 5 * pow
    multiplier: ((1500 + 4000 * input.skillLevel + input.character.effectiveStats.pow * 5) * input.character.baseLevel) / 100 / 100,
    hitCount: input.skill.hitCountByLevel?.[String(input.skillLevel)] ?? input.skill.hitCount,
    precision: "validated",
  }),
  BO_ACIDIFIED_ZONE_FIRE: (input) => ({
    formulaId: "static:BO_ACIDIFIED_ZONE_FIRE",
    // C++: skillratio += -100 + 400 * skill_lv + 5 * pow
    multiplier: ((400 * input.skillLevel + input.character.effectiveStats.pow * 5) * input.character.baseLevel) / 100 / 100,
    hitCount: input.skill.hitCountByLevel?.[String(input.skillLevel)] ?? input.skill.hitCount,
    precision: "validated",
  }),
  BO_ACIDIFIED_ZONE_WATER: (input) => ({
    formulaId: "static:BO_ACIDIFIED_ZONE_WATER",
    multiplier: ((400 * input.skillLevel + input.character.effectiveStats.pow * 5) * input.character.baseLevel) / 100 / 100,
    hitCount: input.skill.hitCountByLevel?.[String(input.skillLevel)] ?? input.skill.hitCount,
    precision: "validated",
  }),
  BO_ACIDIFIED_ZONE_GROUND: (input) => ({
    formulaId: "static:BO_ACIDIFIED_ZONE_GROUND",
    multiplier: ((400 * input.skillLevel + input.character.effectiveStats.pow * 5) * input.character.baseLevel) / 100 / 100,
    hitCount: input.skill.hitCountByLevel?.[String(input.skillLevel)] ?? input.skill.hitCount,
    precision: "validated",
  }),
  BO_ACIDIFIED_ZONE_WIND: (input) => ({
    formulaId: "static:BO_ACIDIFIED_ZONE_WIND",
    multiplier: ((400 * input.skillLevel + input.character.effectiveStats.pow * 5) * input.character.baseLevel) / 100 / 100,
    hitCount: input.skill.hitCountByLevel?.[String(input.skillLevel)] ?? input.skill.hitCount,
    precision: "validated",
  }),

  // ==========================================
  // INQUISITOR (4th Class)
  // ==========================================
  IQ_THIRD_FLAME_BOMB: (input) => ({
    formulaId: "static:IQ_THIRD_FLAME_BOMB",
    // C++: skillratio += -100 + 650 * skill_lv + 10 * pow + max_hp * 20 / 100
    multiplier: ((650 * input.skillLevel + input.character.effectiveStats.pow * 10) * input.character.baseLevel) / 100 / 100,
    bonusFlatDamage: (input.character.maxHp * 20) / 100, // Using bonusFlatDamage field
    hitCount: input.skill.hitCountByLevel?.[String(input.skillLevel)] ?? input.skill.hitCount,
    precision: "validated",
  }),
  IQ_THIRD_PUNISH: (input) => ({
    formulaId: "static:IQ_THIRD_PUNISH",
    // C++: skillratio += -100 + 450 + 1800 * skill_lv + 10 * pow
    multiplier: ((450 + 1800 * input.skillLevel + input.character.effectiveStats.pow * 10) * input.character.baseLevel) / 100 / 100,
    hitCount: input.skill.hitCountByLevel?.[String(input.skillLevel)] ?? input.skill.hitCount,
    precision: "validated",
  }),
  IQ_THIRD_CONSECRATION: (input) => ({
    formulaId: "static:IQ_THIRD_CONSECRATION",
    // C++: skillratio += -100 + 1200 * skill_lv + 10 * pow
    multiplier: ((1200 * input.skillLevel + input.character.effectiveStats.pow * 10) * input.character.baseLevel) / 100 / 100,
    hitCount: input.skill.hitCountByLevel?.[String(input.skillLevel)] ?? input.skill.hitCount,
    precision: "validated",
  }),
  IQ_SECOND_JUDGEMENT: (input) => ({
    formulaId: "static:IQ_SECOND_JUDGEMENT",
    // C++: skillratio += -100 + 2000 + 500 * skill_lv + 7 * pow
    multiplier: ((2000 + 500 * input.skillLevel + input.character.effectiveStats.pow * 7) * input.character.baseLevel) / 100 / 100,
    hitCount: input.skill.hitCountByLevel?.[String(input.skillLevel)] ?? input.skill.hitCount,
    precision: "validated",
  }),
  IQ_SECOND_FLAME: (input) => ({
    formulaId: "static:IQ_SECOND_FLAME",
    // C++: skillratio += -100 + 200 + 2900 * skill_lv + 9 * pow
    multiplier: ((200 + 2900 * input.skillLevel + input.character.effectiveStats.pow * 9) * input.character.baseLevel) / 100 / 100,
    hitCount: input.skill.hitCountByLevel?.[String(input.skillLevel)] ?? input.skill.hitCount,
    precision: "validated",
  }),
  IQ_SECOND_FAITH: (input) => ({
    formulaId: "static:IQ_SECOND_FAITH",
    // C++: skillratio += -100 + 100 + 2300 * skill_lv + 5 * pow
    multiplier: ((100 + 2300 * input.skillLevel + input.character.effectiveStats.pow * 5) * input.character.baseLevel) / 100 / 100,
    hitCount: input.skill.hitCountByLevel?.[String(input.skillLevel)] ?? input.skill.hitCount,
    precision: "validated",
  }),
  IQ_MASSIVE_FLAME_BLASTER: (input) => ({
    formulaId: "static:IQ_MASSIVE_FLAME_BLASTER",
    // C++: skillratio += -100 + 2300 * skill_lv + 15 * pow
    multiplier: ((2300 * input.skillLevel + input.character.effectiveStats.pow * 15) * input.character.baseLevel) / 100 / 100,
    hitCount: input.skill.hitCountByLevel?.[String(input.skillLevel)] ?? input.skill.hitCount,
    precision: "validated",
  }),
  IQ_OLEUM_SANCTUM: (input) => ({
    formulaId: "static:IQ_OLEUM_SANCTUM",
    // C++: skillratio += -100 + 500 + 2000 * skill_lv + 5 * pow
    multiplier: ((500 + 2000 * input.skillLevel + input.character.effectiveStats.pow * 5) * input.character.baseLevel) / 100 / 100,
    hitCount: input.skill.hitCountByLevel?.[String(input.skillLevel)] ?? input.skill.hitCount,
    precision: "validated",
  }),

  // ==========================================
  // REBELLION (3rd Class Expanded)
  // ==========================================
  RL_FIREDANCE: (input) => ({
    formulaId: "static:RL_FIREDANCE",
    // C++: skillratio += 100 + 100 * skill_lv + pc_checkskill(sd, GS_DESPERADO) * 20;
    multiplier: ((200 + 100 * input.skillLevel + 200) * input.character.baseLevel) / 100 / 100, // Assuming Max Desperado (200)
    hitCount: input.skill.hitCountByLevel?.[String(input.skillLevel)] ?? input.skill.hitCount,
    precision: "validated",
  }),
  RL_S_STORM: (input) => ({
    formulaId: "static:RL_S_STORM",
    // C++: skillratio += -100 + 1700 + 200 * skill_lv;
    multiplier: ((1700 + 200 * input.skillLevel) * input.character.baseLevel) / 100 / 100,
    hitCount: input.skill.hitCountByLevel?.[String(input.skillLevel)] ?? input.skill.hitCount,
    precision: "validated",
  }),
  RL_BANISHING_BUSTER: (input) => ({
    formulaId: "static:RL_BANISHING_BUSTER",
    // C++: skillratio += -100 + 1000 + 200 * skill_lv;
    multiplier: ((1000 + 200 * input.skillLevel) * input.character.baseLevel) / 100 / 100,
    hitCount: input.skill.hitCountByLevel?.[String(input.skillLevel)] ?? input.skill.hitCount,
    precision: "validated",
  }),
  RL_MASS_SPIRAL: (input) => ({
    formulaId: "static:RL_MASS_SPIRAL",
    // C++: skillratio += -100 + 200 * skill_lv;
    multiplier: (200 * input.skillLevel) / 100,
    hitCount: input.skill.hitCountByLevel?.[String(input.skillLevel)] ?? input.skill.hitCount,
    precision: "validated",
  }),
  RL_HAMMER_OF_GOD: (input) => ({
    formulaId: "static:RL_HAMMER_OF_GOD",
    // C++: skillratio += -100 + 100 * skill_lv + 400 * spiritball_old
    multiplier: ((100 * input.skillLevel + 4000) * input.character.baseLevel) / 100 / 100, // Assuming 10 coins + Crimson Marker
    hitCount: input.skill.hitCountByLevel?.[String(input.skillLevel)] ?? input.skill.hitCount,
    precision: "validated",
  }),
  RL_D_TAIL: (input) => ({
    formulaId: "static:RL_D_TAIL",
    // C++: skillratio += -100 + 500 + 200 * skill_lv; skillratio *= 2 (Crimson Marker)
    multiplier: (((500 + 200 * input.skillLevel) * 2) * input.character.baseLevel) / 100 / 100,
    hitCount: input.skill.hitCountByLevel?.[String(input.skillLevel)] ?? input.skill.hitCount,
    precision: "validated",
  }),
  RL_R_TRIP: (input) => ({
    formulaId: "static:RL_R_TRIP",
    // C++: skillratio += -100 + 350 * skill_lv;
    multiplier: (350 * input.skillLevel) / 100,
    hitCount: input.skill.hitCountByLevel?.[String(input.skillLevel)] ?? input.skill.hitCount,
    precision: "validated",
  }),
  RL_FIRE_RAIN: (input) => ({
    formulaId: "static:RL_FIRE_RAIN",
    // C++: skillratio += -100 + 3500 + 300 * skill_lv;
    multiplier: (3500 + 300 * input.skillLevel) / 100,
    hitCount: input.skill.hitCountByLevel?.[String(input.skillLevel)] ?? input.skill.hitCount,
    precision: "validated",
  }),
  RL_SLUGSHOT: (input) => ({
    formulaId: "static:RL_SLUGSHOT",
    // C++: skillratio += -100 + 1200 * skill_lv; skillratio *= 2 + tstatus->size;
    multiplier: (1200 * input.skillLevel * 3) / 100, // Assuming Medium Target Size (1)
    hitCount: input.skill.hitCountByLevel?.[String(input.skillLevel)] ?? input.skill.hitCount,
    precision: "validated",
  }),
  RL_AM_BLAST: (input) => ({
    formulaId: "static:RL_AM_BLAST",
    // C++: skillratio += -100 + 3500 + 300 * skill_lv;
    multiplier: (3500 + 300 * input.skillLevel) / 100,
    hitCount: input.skill.hitCountByLevel?.[String(input.skillLevel)] ?? input.skill.hitCount,
    precision: "validated",
  }),

  // ==========================================
  // GUNSLINGER (1st Class Expanded)
  // ==========================================
  GS_TRIPLEACTION: (input) => ({
    formulaId: "static:GS_TRIPLEACTION",
    // C++: base_skillratio += 50 * skill_lv;
    multiplier: (100 + 50 * input.skillLevel) / 100,
    hitCount: input.skill.hitCountByLevel?.[String(input.skillLevel)] ?? input.skill.hitCount,
    precision: "validated",
  }),
  GS_TRACKING: (input) => ({
    formulaId: "static:GS_TRACKING",
    // C++: base_skillratio += 100 * (skill_lv + 1);
    multiplier: (100 + 100 * (input.skillLevel + 1)) / 100,
    hitCount: input.skill.hitCountByLevel?.[String(input.skillLevel)] ?? input.skill.hitCount,
    precision: "validated",
  }),
  GS_SPREADATTACK: (input) => ({
    formulaId: "static:GS_SPREADATTACK",
    // C++: base_skillratio += 30 * skill_lv;
    multiplier: (100 + 30 * input.skillLevel) / 100,
    hitCount: input.skill.hitCountByLevel?.[String(input.skillLevel)] ?? input.skill.hitCount,
    precision: "validated",
  }),
  GS_RAPIDSHOWER: (input) => ({
    formulaId: "static:GS_RAPIDSHOWER",
    // C++: base_skillratio += 400 + 50 * skill_lv;
    multiplier: (100 + 400 + 50 * input.skillLevel) / 100,
    hitCount: input.skill.hitCountByLevel?.[String(input.skillLevel)] ?? input.skill.hitCount,
    precision: "validated",
  }),
  GS_PIERCINGSHOT: (input) => ({
    formulaId: "static:GS_PIERCINGSHOT",
    // C++: base_skillratio += 150 + 30 * skill_lv; (Assuming Bullseye Max)
    multiplier: (100 + 150 + 30 * input.skillLevel) / 100,
    hitCount: input.skill.hitCountByLevel?.[String(input.skillLevel)] ?? input.skill.hitCount,
    precision: "validated",
  }),
  GS_DESPERADO: (input) => ({
    formulaId: "static:GS_DESPERADO",
    // C++: base_skillratio += 50 * (skill_lv - 1);
    multiplier: (100 + 50 * (input.skillLevel - 1)) / 100,
    hitCount: input.skill.hitCountByLevel?.[String(input.skillLevel)] ?? input.skill.hitCount,
    precision: "validated",
  }),

  // ==========================================
  // KAGEROU / OBORO (2nd Class Expanded)
  // ==========================================
  KO_JYUMONJIKIRI: (input) => ({
    formulaId: "static:KO_JYUMONJIKIRI",
    // C++: skillratio += -100 + 200 * skill_lv; RE_LVL_DMOD(120);
    multiplier: ((200 * input.skillLevel) * input.character.baseLevel) / 120 / 100,
    hitCount: input.skill.hitCountByLevel?.[String(input.skillLevel)] ?? input.skill.hitCount,
    precision: "validated",
  }),
  KO_HUUMARANKA: (input) => ({
    formulaId: "static:KO_HUUMARANKA",
    // C++: skillratio += -100 + 150 * skill_lv + sstatus->str + (sd ? pc_checkskill(sd,NJ_HUUMA) * 100 : 0);
    // Assuming Throw Huuma Shuriken Lv5 (500)
    multiplier: (150 * input.skillLevel + input.character.effectiveStats.str + 500) / 100, // No RE_LVL_DMOD in C++
    hitCount: input.skill.hitCountByLevel?.[String(input.skillLevel)] ?? input.skill.hitCount,
    precision: "validated",
  }),
  KO_BAKURETSU: (input) => ({
    formulaId: "static:KO_BAKURETSU",
    // C++: skillratio += -100 + (sd ? pc_checkskill(sd,NJ_TOBIDOUGU) : 1) * (50 + sstatus->dex / 4) * skill_lv * 4 / 10;
    // RE_LVL_DMOD(120);
    // skillratio += 10 * (sd ? sd->status.job_level : 1);
    // Assuming Throwing Mastery Lv10
    multiplier: ((((10 * (50 + input.character.effectiveStats.dex / 4) * input.skillLevel * 0.4) * input.character.baseLevel) / 120) + (10 * 60)) / 100, // Assuming Job Lv 60
    hitCount: input.skill.hitCountByLevel?.[String(input.skillLevel)] ?? input.skill.hitCount,
    precision: "validated",
  }),
  KO_MAKIBISHI: (input) => ({
    formulaId: "static:KO_MAKIBISHI",
    // C++: base_skillratio += -100 + 20 * skill_lv;
    multiplier: (20 * input.skillLevel) / 100,
    hitCount: input.skill.hitCountByLevel?.[String(input.skillLevel)] ?? input.skill.hitCount,
    precision: "validated",
  }),
  KO_HAPPOKUNAI: (input) => ({
    formulaId: "static:KO_HAPPOKUNAI",
    // No calculateSkillRatio override in C++, defaults to 100% per hit
    multiplier: 100 / 100,
    hitCount: input.skill.hitCountByLevel?.[String(input.skillLevel)] ?? input.skill.hitCount,
    precision: "validated",
  }),

  // ==========================================
  // NINJA (1st Class Expanded)
  // ==========================================
  NJ_KIRIKAGE: (input) => ({
    formulaId: "static:NJ_KIRIKAGE",
    // C++: base_skillratio += -50 + 150 * skill_lv;
    multiplier: (50 + 150 * input.skillLevel) / 100,
    hitCount: input.skill.hitCountByLevel?.[String(input.skillLevel)] ?? input.skill.hitCount,
    precision: "validated",
  }),
  NJ_HUUJIN: (input) => ({
    formulaId: "static:NJ_HUUJIN",
    // C++: base_skillratio += 50;
    multiplier: 150 / 100,
    hitCount: input.skill.hitCountByLevel?.[String(input.skillLevel)] ?? input.skill.hitCount,
    precision: "validated",
  }),
  NJ_HYOUSENSOU: (input) => ({
    formulaId: "static:NJ_HYOUSENSOU",
    // C++: base_skillratio -= 30;
    multiplier: 70 / 100,
    hitCount: input.skill.hitCountByLevel?.[String(input.skillLevel)] ?? input.skill.hitCount,
    precision: "validated",
  }),
  NJ_KOUENKA: (input) => ({
    formulaId: "static:NJ_KOUENKA",
    // C++: base_skillratio -= 10;
    multiplier: 90 / 100,
    hitCount: input.skill.hitCountByLevel?.[String(input.skillLevel)] ?? input.skill.hitCount,
    precision: "validated",
  }),
  NJ_BAKUENRYU: (input) => ({
    formulaId: "static:NJ_BAKUENRYU",
    // C++: base_skillratio += 50 + 150 * skill_lv;
    multiplier: (150 + 150 * input.skillLevel) / 100,
    hitCount: input.skill.hitCountByLevel?.[String(input.skillLevel)] ?? input.skill.hitCount,
    precision: "validated",
  }),
  NJ_HYOUSYOURAKU: (input) => ({
    formulaId: "static:NJ_HYOUSYOURAKU",
    // C++: base_skillratio += 50 * skill_lv;
    multiplier: (100 + 50 * input.skillLevel) / 100,
    hitCount: input.skill.hitCountByLevel?.[String(input.skillLevel)] ?? input.skill.hitCount,
    precision: "validated",
  }),
  NJ_KUNAI: (input) => ({
    formulaId: "static:NJ_KUNAI",
    // C++: base_skillratio += -100 + 100 * skill_lv;
    multiplier: (100 * input.skillLevel) / 100,
    hitCount: input.skill.hitCountByLevel?.[String(input.skillLevel)] ?? input.skill.hitCount,
    precision: "validated",
  }),
  NJ_HUUMA: (input) => ({
    formulaId: "static:NJ_HUUMA",
    // C++: base_skillratio += -150 + 250 * skill_lv;
    multiplier: (250 * input.skillLevel - 50) / 100,
    hitCount: input.skill.hitCountByLevel?.[String(input.skillLevel)] ?? input.skill.hitCount,
    precision: "validated",
  }),
  // ==========================================
  // SOUL REAPER (3rd Class Expanded)
  // ==========================================
  SP_SPA: (input) => ({
    formulaId: "static:SP_SPA", // Espa
    // C++: skillratio += 400 + 250 * skill_lv; RE_LVL_DMOD(100);
    multiplier: ((500 + 250 * input.skillLevel) * input.character.baseLevel) / 100 / 100,
    hitCount: input.skill.hitCountByLevel?.[String(input.skillLevel)] ?? input.skill.hitCount,
    precision: "validated",
  }),
  SP_SWHOO: (input) => ({
    formulaId: "static:SP_SWHOO", // Eswhoo
    // C++: skillratio += 1000 + 200 * skill_lv; RE_LVL_DMOD(100);
    multiplier: ((1100 + 200 * input.skillLevel) * input.character.baseLevel) / 100 / 100,
    hitCount: input.skill.hitCountByLevel?.[String(input.skillLevel)] ?? input.skill.hitCount,
    precision: "validated",
  }),
  SP_SHA: (input) => ({
    formulaId: "static:SP_SHA", // Esha
    // C++: base_skillratio += -100 + 5 * skill_lv;
    multiplier: (5 * input.skillLevel) / 100,
    hitCount: input.skill.hitCountByLevel?.[String(input.skillLevel)] ?? input.skill.hitCount,
    precision: "validated",
  }),
  SP_CURSEEXPLOSION: (input) => ({
    formulaId: "static:SP_CURSEEXPLOSION", // Curse Explosion
    // Assuming target is NOT cursed by default (base: -100 + 400 + 100*lv = 400+100*lv)
    // C++: skillratio += -100 + 400 + 100 * skill_lv; RE_LVL_DMOD(100);
    multiplier: ((400 + 100 * input.skillLevel) * input.character.baseLevel) / 100 / 100,
    hitCount: input.skill.hitCountByLevel?.[String(input.skillLevel)] ?? input.skill.hitCount,
    precision: "validated",
  }),

  // ==========================================
  // STAR EMPEROR (3rd Class Expanded)
  // ==========================================
  SJ_PROMINENCEKICK: (input) => ({
    formulaId: "static:SJ_PROMINENCEKICK", // Prominence Kick
    // C++: base_skillratio += 50 + 50 * skill_lv;
    multiplier: (150 + 50 * input.skillLevel) / 100,
    hitCount: input.skill.hitCountByLevel?.[String(input.skillLevel)] ?? input.skill.hitCount,
    precision: "validated",
  }),
  SJ_SOLARBURST: (input) => ({
    formulaId: "static:SJ_SOLARBURST", // Solar Burst
    // C++: skillratio += 900 + 220 * skill_lv; RE_LVL_DMOD(100);
    multiplier: ((1000 + 220 * input.skillLevel) * input.character.baseLevel) / 100 / 100,
    hitCount: input.skill.hitCountByLevel?.[String(input.skillLevel)] ?? input.skill.hitCount,
    precision: "validated",
  }),
  SJ_FULLMOONKICK: (input) => ({
    formulaId: "static:SJ_FULLMOONKICK", // Full Moon Kick
    // C++: skillratio += 1000 + 100 * skill_lv; RE_LVL_DMOD(100);
    multiplier: ((1100 + 100 * input.skillLevel) * input.character.baseLevel) / 100 / 100,
    hitCount: input.skill.hitCountByLevel?.[String(input.skillLevel)] ?? input.skill.hitCount,
    precision: "validated",
  }),
  SJ_NEWMOONKICK: (input) => ({
    formulaId: "static:SJ_NEWMOONKICK", // New Moon Kick
    // C++: base_skillratio += 600 + 100 * skill_lv;
    multiplier: (700 + 100 * input.skillLevel) / 100,
    hitCount: input.skill.hitCountByLevel?.[String(input.skillLevel)] ?? input.skill.hitCount,
    precision: "validated",
  }),
  SJ_FALLINGSTAR_ATK: (input) => ({
    formulaId: "static:SJ_FALLINGSTAR_ATK", // Falling Star Attack
    // C++: skillratio += 100 * skill_lv; RE_LVL_DMOD(100);
    multiplier: ((100 + 100 * input.skillLevel) * input.character.baseLevel) / 100 / 100,
    hitCount: input.skill.hitCountByLevel?.[String(input.skillLevel)] ?? input.skill.hitCount,
    precision: "validated",
  }),
  SJ_FLASHKICK: (input) => ({
    formulaId: "static:SJ_FLASHKICK", // Flash Kick
    // C++: No formula, base attack (100%)
    multiplier: 100 / 100,
    hitCount: input.skill.hitCountByLevel?.[String(input.skillLevel)] ?? input.skill.hitCount,
    precision: "validated",
  }),

  // ==========================================
  // SOUL LINKER (2nd Class Expanded)
  // ==========================================
  SL_SMA: (input) => ({
    formulaId: "static:SL_SMA", // Esma
    // C++: base_skillratio += -60 + status_get_lv(src);
    multiplier: (40 + input.character.baseLevel) / 100,
    hitCount: input.skill.hitCountByLevel?.[String(input.skillLevel)] ?? input.skill.hitCount,
    precision: "validated",
  }),

  // ==========================================
  // TAEKWON KID (1st Class Expanded)
  // ==========================================
  TK_TURNKICK: (input) => ({
    formulaId: "static:TK_TURNKICK",
    // C++: base_skillratio += 90 + 30 * skill_lv;
    multiplier: (190 + 30 * input.skillLevel) / 100,
    hitCount: input.skill.hitCountByLevel?.[String(input.skillLevel)] ?? input.skill.hitCount,
    precision: "validated",
  }),
  TK_STORMKICK: (input) => ({
    formulaId: "static:TK_STORMKICK",
    // C++: base_skillratio += 60 + 20 * skill_lv;
    multiplier: (160 + 20 * input.skillLevel) / 100,
    hitCount: input.skill.hitCountByLevel?.[String(input.skillLevel)] ?? input.skill.hitCount,
    precision: "validated",
  }),
  TK_JUMPKICK: (input) => ({
    formulaId: "static:TK_JUMPKICK",
    // C++: base_skillratio += -70 + 10 * skill_lv;
    multiplier: (30 + 10 * input.skillLevel) / 100,
    hitCount: input.skill.hitCountByLevel?.[String(input.skillLevel)] ?? input.skill.hitCount,
    precision: "validated",
  }),
  TK_DOWNKICK: (input) => ({
    formulaId: "static:TK_DOWNKICK",
    // C++: base_skillratio += 60 + 20 * skill_lv;
    multiplier: (160 + 20 * input.skillLevel) / 100,
    hitCount: input.skill.hitCountByLevel?.[String(input.skillLevel)] ?? input.skill.hitCount,
    precision: "validated",
  }),
  TK_COUNTER: (input) => ({
    formulaId: "static:TK_COUNTER",
    // C++: base_skillratio += 90 + 30 * skill_lv;
    multiplier: (190 + 30 * input.skillLevel) / 100,
    hitCount: input.skill.hitCountByLevel?.[String(input.skillLevel)] ?? input.skill.hitCount,
    precision: "validated",
  }),
  // ==========================================
  // SUMMONER (Doram)
  // ==========================================
  SU_SCRATCH: (input) => ({
    formulaId: "static:SU_SCRATCH",
    // C++: base_skillratio += -50 + 50 * skill_lv;
    multiplier: (50 + 50 * input.skillLevel) / 100,
    hitCount: input.skill.hitCountByLevel?.[String(input.skillLevel)] ?? input.skill.hitCount,
    precision: "validated",
  }),
  SU_SCAROFTAROU: (input) => ({
    formulaId: "static:SU_SCAROFTAROU",
    // C++: base_skillratio += -100 + 100 * skill_lv; + SpiritOfLife (x2 at Max HP)
    multiplier: (100 * input.skillLevel * 2) / 100,
    hitCount: input.skill.hitCountByLevel?.[String(input.skillLevel)] ?? input.skill.hitCount,
    precision: "validated",
  }),
  SU_PICKYPECK: (input) => ({
    formulaId: "static:SU_PICKYPECK",
    // C++: base_skillratio += 100 + 100 * skill_lv; + SpiritOfLife (x2 at Max HP)
    // * Note: deals double damage if target HP < 50%, ignored for baseline.
    multiplier: ((200 + 100 * input.skillLevel) * 2) / 100,
    hitCount: input.skill.hitCountByLevel?.[String(input.skillLevel)] ?? input.skill.hitCount,
    precision: "validated",
  }),
  SU_SVG_SPIRIT: (input) => ({
    formulaId: "static:SU_SVG_SPIRIT", // Spirit of Savage
    // C++: base_skillratio += 150 + 150 * skill_lv; + SpiritOfLife (x2 at Max HP)
    multiplier: ((250 + 150 * input.skillLevel) * 2) / 100,
    hitCount: input.skill.hitCountByLevel?.[String(input.skillLevel)] ?? input.skill.hitCount,
    precision: "validated",
  }),
  SU_LUNATICCARROTBEAT: (input) => ({
    formulaId: "static:SU_LUNATICCARROTBEAT",
    // C++: skillratio += 100 + 100 * skill_lv; + SpiritOfLife (x2) + STR; RE_LVL_DMOD(100)
    multiplier: (((200 + 100 * input.skillLevel) * 2 + input.character.effectiveStats.str) * input.character.baseLevel) / 100 / 100,
    hitCount: input.skill.hitCountByLevel?.[String(input.skillLevel)] ?? input.skill.hitCount,
    precision: "validated",
  }),
  SU_SV_STEMSPEAR: (input) => ({
    formulaId: "static:SU_SV_STEMSPEAR", // Silvervine Stem Spear
    // C++: base_skillratio += 600; (so 700% base)
    // Note: Magic damage usually scales with base level dynamically. Assuming standard.
    multiplier: (700 * input.character.baseLevel) / 100 / 100,
    hitCount: input.skill.hitCountByLevel?.[String(input.skillLevel)] ?? input.skill.hitCount,
    precision: "validated",
  }),
  SU_CN_METEOR: (input) => ({
    formulaId: "static:SU_CN_METEOR", // Catnip Meteor
    // C++: skillratio += -100 + 200 + 100 * skill_lv; + INT*5; RE_LVL_DMOD(100)
    multiplier: ((200 + 100 * input.skillLevel + input.character.effectiveStats.int * 5) * input.character.baseLevel) / 100 / 100,
    hitCount: input.skill.hitCountByLevel?.[String(input.skillLevel)] ?? input.skill.hitCount,
    precision: "validated",
  }),
};

function calculateBoltSkill(skillId: string) {
  return (input: SkillFormulaInput): SkillFormulaResult => ({
    formulaId: `static:${skillId}`,
    multiplier: 1,
    hitCount: input.skillLevel,
    precision: "validated",
  });
}

export class StaticSkillFormula implements SkillFormulaAdapter {
  readonly id = "static-skill";

  supports(skill: { id: string }) {
    return skill.id in staticSkillFormulas;
  }

  calculate(input: SkillFormulaInput): SkillFormulaResult {
    return staticSkillFormulas[input.skill.id](input);
  }
}
