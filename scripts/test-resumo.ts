import { readFileSync } from "node:fs";
import { DamageEngine } from "../packages/calculator-core/src/damage-engine";
import { CalculatorModifierEffectsFactory } from "../packages/calculator-core/src/calculator-modifier-effects";
import type { RoMonster, RoSkill, CharacterStatus } from "../packages/calculator-core/src/ro-types";

async function main() {
  const resumoJson = readFileSync("resumo.json", "utf-8");
  const dataArray = JSON.parse(resumoJson);
  const data = dataArray[1]; // A 2a parte tem os totais (hp, def, matk, etc)

  // O monstro
  const dummyMonster: RoMonster = {
    id: 1,
    name: "Cecil Damon",
    level: 179,
    race: "demihuman",
    size: "medium",
    element: "wind",
    elementLevel: 4,
    defense: 100, // Voltando para a Cecil de 100 MDEF/DEF 
    magicDefense: 100, 
    softDef: 0, 
    softMdef: 44, // Soft MDEF base
    hp: 2142000,
    classType: "normal",
    source: "manual"
  };

  // A skill
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

  // O Modifier
  const modifierEffectsFactory = new CalculatorModifierEffectsFactory();
  const baseModifiers = modifierEffectsFactory.fromItems([], {}, {
    classId: "Arch_Mage",
    baseLevel: 229,
    learnedSkills: {},
    ruleset: { server: "latam", mechanics: "renewal" }
  });
  
  // Injetando os modificadores após analisar manualmente todo o resumo.json
  baseModifiers.matkRate = 43; // Mantendo o MATK% anterior (acessórios/sombrios base)
  baseModifiers.smatk = 0; // Mantendo o S.MATK do old json (vai puxar 60 do traitEffects)
  baseModifiers.flatMatk = 683; // Báculo(+75) + Laço(+101) + Loki(+12) + Vestido(+50) + Galactor(+200) + Bota(+20) + BraceleteComboLaço(+70) + BraceleteComboVest(+110) + Sombrios(+25) + ArquimagoTopo(+20)
  
  // Dano Elemental: 56% All + 18% Fantasma
  // All = 6(Espadas) + 10(ComboEspadas) + 10(Vestido) + 10(Capa) + 10(Bota) + 10(ComboSombrio) = 56
  // Fantasma = 18 (Combo Vestido+Laço)
  baseModifiers.magicElementAttackRate.ghost = 56 + 18; // 74%
  
  // Dano de Tamanho: 15% (Báculo)
  baseModifiers.magicSizeDamageRate.all = 15; // 15%
  
  // Dano de Raça (Humanoide): 10% (Bracelete + Laço +7)
  baseModifiers.magicRaceDamageRate.demihuman = 10;
  
  // Penetração de MDEF: 70% (Combo Sombrio Apoio Arcano)
  baseModifiers.ignoreMagicDefenseRate = { all: 70 };

  const characterStatus: CharacterStatus = {
    baseLevel: 229,
    jobLevel: 46,
    classId: "Arch_Mage",
    weaponType: "twoHandRod",
    weaponLevel: 4,
    stats: {
      str: 20, agi: 103, vit: 100, int: 125, dex: 120, luk: 83,
      pow: 0, sta: 0, wis: 0, spl: 100, con: 14, crt: 0
    },
    effectiveStats: {
      str: 21, agi: 110, vit: 108, int: 140, dex: 128, luk: 87,
      pow: 0, sta: 5, wis: 4, spl: 110, con: 21, crt: 1
    },
    statusAtk: 133,
    statusMatk: 872, 
    atk: 0,
    matk: 872 + 671, // Status MATK + MATK extra (dos equips/cards etc)
    patk: 0,
    smatk: 60,
    hit: 606,
    flee: 520,
    crit: 30,
    softDef: 190,
    softMdef: 245,
    traitEffects: {
      patk: 0,
      smatk: 60,
      res: 10,
      mres: 9,
      hplus: 0,
      crate: 0
    }
  };

  const fakeWeapon: any = {
    id: 640012,
    name: "Patent Blue Crystal Staff",
    kind: "equipment",
    equipSlot: "weapon",
    subType: "twoHandRod",
    magicAttack: 312, // Base 235 + refine bonus 77
    baseWeaponLevel: 4,
    bonuses: [],
    __mockRefine: 11, 
  };
  // Modificar temporary_mock_refine para a classe não importa pois é feito por fora normalmente
  // Mas no engine precisa que o item tenha WeaponMatk

  const engine = new DamageEngine();
  const result = engine.calculate({
    character: characterStatus,
    items: [fakeWeapon],
    modifierEffects: baseModifiers,
    monster: dummyMonster,
    skill: mockSkill,
    skillLevel: 5, // assumindo nv 5
  });

  console.log("-----------------------------------------");
  console.log("Target:", dummyMonster.name);
  console.log("Status MATK:", characterStatus.statusMatk);
  console.log("Equip MATK:", 671);
  console.log("Total MATK:", characterStatus.matk);
  console.log("Modifiers Extraídos:");
  console.log(" - MATK %:", baseModifiers.matkRate);
  console.log(" - S.MATK:", baseModifiers.smatk);
  console.log(" - Magic Element (Ghost) %:", baseModifiers.magicElementDamageRate.ghost);
  console.log(" - Magic Size (Medium) %:", baseModifiers.magicSizeDamageRate.medium);
  console.log("-----------------------------------------");
  console.log("Damage Breakdown:");
  for (const line of result.breakdown) {
    if (line.value !== 0 && line.group !== "result") {
        console.log(`  - ${line.label} [${line.group}]: ${line.value}`);
    }
  }
  console.log("-----------------------------------------");
  console.log(`Dano da Habilidade Completa: ${result.damage.minimum} ~ ${result.damage.maximum} (Avg: ${result.damage.average})`);
  console.log(`Dano Visual por Hit (1/${result.breakdown.find(b => b.key === "hits")?.value}): ${result.damage.damagePerHit}`);
}

main().catch(console.error);
