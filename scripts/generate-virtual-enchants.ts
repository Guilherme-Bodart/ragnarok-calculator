import { RathenaNormalizedItem } from "../packages/calculator-core/src/datasets/rathena-normalized";

export function generateVirtualEnchants(): RathenaNormalizedItem[] {
  const items: RathenaNormalizedItem[] = [];
  let nextId = -10000;

  function pushItem(name: string, rawScript: string) {
    items.push({
      itemId: nextId--,
      name,
      type: "Card",
      subType: "Enchant",
      source: "rathena",
      rawScript,
    });
  }

  // 1. ATK / MATK
  for (let i = 1; i <= 65; i++) {
    pushItem(`ATK +${i}`, `bonus bBaseAtk, ${i};`);
    pushItem(`MATK +${i}`, `bonus bMatk, ${i};`);
  }
  for (let i = 1; i <= 30; i++) {
    pushItem(`ATK +${i}%`, `bonus bAtkRate, ${i};`);
    pushItem(`MATK +${i}%`, `bonus bMatkRate, ${i};`);
    pushItem(`Dano Físico à Distância +${i}%`, `bonus bLongAtkRate, ${i};`);
    pushItem(`Dano Físico Corpo a Corpo +${i}%`, `bonus bShortAtkRate, ${i};`);
  }

  // 2. HP / SP
  for (let i = 1; i <= 50; i++) {
    pushItem(`HP +${i}%`, `bonus bMaxHPrate, ${i};`);
    pushItem(`SP +${i}%`, `bonus bMaxSPrate, ${i};`);
  }
  for (let i = 50; i <= 2000; i += 50) pushItem(`HP +${i}`, `bonus bMaxHP, ${i};`);
  for (let i = 20; i <= 1000; i += 20) pushItem(`SP +${i}`, `bonus bMaxSP, ${i};`);

  // 3. Status, Talento, Def, Mdef, Flee, Hit, Crit, Delay, Cast, ASPD
  for (let i = 1; i <= 50; i++) {
    pushItem(`FOR +${i}`, `bonus bStr, ${i};`);
    pushItem(`AGI +${i}`, `bonus bAgi, ${i};`);
    pushItem(`VIT +${i}`, `bonus bVit, ${i};`);
    pushItem(`INT +${i}`, `bonus bInt, ${i};`);
    pushItem(`DES +${i}`, `bonus bDex, ${i};`);
    pushItem(`SOR +${i}`, `bonus bLuk, ${i};`);
    pushItem(`Todos Atributos +${i}`, `bonus bAllStats, ${i};`);

    pushItem(`DEF +${i}`, `bonus bDef, ${i};`);
    pushItem(`MDEF +${i}`, `bonus bMdef, ${i};`);
    pushItem(`Precisão +${i}`, `bonus bHit, ${i};`);
    pushItem(`Esquiva +${i}`, `bonus bFlee, ${i};`);
    
    pushItem(`Velocidade de Ataque +${i}%`, `bonus bAspdRate, ${i};`);
    pushItem(`Pós-conjuração -${i}%`, `bonus bDelayrate, ${i};`);
    pushItem(`Conjuração Variável -${i}%`, `bonus bVariableCastrate, ${i};`);
  }
  for (let i = 1; i <= 30; i++) {
    pushItem(`CRIT +${i}`, `bonus bCritical, ${i};`);
    pushItem(`Dano Crítico +${i}%`, `bonus bCritAtkRate, ${i};`);
    
    pushItem(`POD +${i}`, `bonus bPow, ${i};`);
    pushItem(`FEI +${i}`, `bonus bSpl, ${i};`);
    pushItem(`STA +${i}`, `bonus bSta, ${i};`);
    pushItem(`SAB +${i}`, `bonus bWis, ${i};`);
    pushItem(`CON +${i}`, `bonus bCon, ${i};`);
    pushItem(`CRV +${i}`, `bonus bCrt, ${i};`);
    pushItem(`T.CRIT +${i}`, `bonus bTraitCrt, ${i};`);
    pushItem(`P.ATK +${i}`, `bonus bPatk, ${i};`);
    pushItem(`S.MATK +${i}`, `bonus bSmatk, ${i};`);
  }
  for (let i = 1; i <= 5; i++) pushItem(`Velocidade de Ataque +${i}`, `bonus bAspd, ${i};`);

  // Ignorar penalidade de tamanho
  pushItem(`Ignorar Penalidade de Tamanho`, `bonus bIgnoreSizeWeapon, 1;`);

  const races = {
    Todos: "All", Amorfo: "Formless", "Morto-Vivo": "Undead", Bruto: "Brute", Planta: "Plant",
    Inseto: "Insect", Peixe: "Fish", Demônio: "Demon", "Demi-Humano": "DemiHuman",
    Anjo: "Angel", Dragão: "Dragon"
  };
  const sizes = { Todos: "All", Pequeno: "Small", Médio: "Medium", Grande: "Large" };
  const classes = { Normal: "Normal", Chefe: "Boss", Todos: "All" };
  const elements = {
    Todos: "All", Neutro: "Neutral", Água: "Water", Terra: "Earth", Fogo: "Fire", Vento: "Wind",
    Veneno: "Poison", Sagrado: "Holy", Sombrio: "Dark", Fantasma: "Ghost", "Maldito": "Undead"
  };

  for (let i = 1; i <= 25; i++) {
    for (const [pt, en] of Object.entries(races)) {
      pushItem(`Físico vs Raça ${pt} +${i}%`, `bonus2 bAddRace, RC_${en}, ${i};`);
      pushItem(`Mágico vs Raça ${pt} +${i}%`, `bonus2 bMagicAddRace, RC_${en}, ${i};`);
    }
    for (const [pt, en] of Object.entries(sizes)) {
      pushItem(`Físico vs Tamanho ${pt} +${i}%`, `bonus2 bAddSize, Size_${en}, ${i};`);
      pushItem(`Mágico vs Tamanho ${pt} +${i}%`, `bonus2 bMagicAddSize, Size_${en}, ${i};`);
    }
    for (const [pt, en] of Object.entries(classes)) {
      pushItem(`Físico vs Classe ${pt} +${i}%`, `bonus2 bAddClass, Class_${en}, ${i};`);
      pushItem(`Mágico vs Classe ${pt} +${i}%`, `bonus2 bMagicAddClass, Class_${en}, ${i};`);
    }
    for (const [pt, en] of Object.entries(elements)) {
      pushItem(`Físico vs Elemento ${pt} +${i}%`, `bonus2 bAddEle, Ele_${en}, ${i};`);
      pushItem(`Mágico vs Elemento ${pt} +${i}%`, `bonus2 bMagicAddEle, Ele_${en}, ${i};`);
      pushItem(`Dano Mágico Elemento ${pt} +${i}%`, `bonus2 bMagicAtkEle, Ele_${en}, ${i};`);
    }
  }

  for (let i = 1; i <= 100; i++) {
    for (const [pt, en] of Object.entries(races)) {
      pushItem(`Ignorar Defesa Raça ${pt} ${i}%`, `bonus2 bIgnoreDefRaceRate, RC_${en}, ${i};`);
      pushItem(`Ignorar MDEF Raça ${pt} ${i}%`, `bonus2 bIgnoreMdefRaceRate, RC_${en}, ${i};`);
    }
    for (const [pt, en] of Object.entries(classes)) {
      pushItem(`Ignorar Defesa Classe ${pt} ${i}%`, `bonus2 bIgnoreDefClassRate, Class_${en}, ${i};`);
      pushItem(`Ignorar MDEF Classe ${pt} ${i}%`, `bonus2 bIgnoreMdefClassRate, Class_${en}, ${i};`);
    }
  }

  return items;
}
