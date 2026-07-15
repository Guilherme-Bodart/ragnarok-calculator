import { useMemo } from "react";
import type { CharacterStatus, CalculatorModifierEffects, CharacterStat } from "@/packages/calculator-core/src";
import skillsEn from "@/nightmare-data/normalized/skills/skills.en.json";

function translateSize(size: string): string {
  if (size.toLowerCase() === "all") return "Todos os Tamanhos";
  const map: Record<string, string> = { small: "Pequeno", medium: "Médio", large: "Grande" };
  return map[size.toLowerCase()] || size;
}

function translateRace(race: string): string {
  if (race.toLowerCase() === "all") return "Todas as Raças";
  const map: Record<string, string> = {
    formless: "Amorfo", undead: "Morto-Vivo", brute: "Bruto", plant: "Planta",
    insect: "Inseto", fish: "Peixe", demon: "Demônio", demihuman: "Humanoide",
    angel: "Anjo", dragon: "Dragão", player: "Jogador",
  };
  return map[race.toLowerCase()] || race;
}

function translateElement(element: string): string {
  if (element.toLowerCase() === "all") return "Todas as Propriedades";
  const map: Record<string, string> = {
    neutral: "Neutro", water: "Água", earth: "Terra", fire: "Fogo", wind: "Vento",
    poison: "Veneno", holy: "Sagrado", shadow: "Sombrio", ghost: "Fantasma", undead: "Maldito",
  };
  return map[element.toLowerCase()] || element;
}

function translateClass(cls: string): string {
  if (cls.toLowerCase() === "all") return "Todas as Classes";
  const map: Record<string, string> = { normal: "Normal", boss: "Chefe", guardian: "Guardião" };
  return map[cls.toLowerCase()] || cls;
}

export function useDerivedStatsBonuses(
  modifierEffects: CalculatorModifierEffects,
  characterStatus?: CharacterStatus
) {
  return useMemo(() => {
    const bonuses: string[] = [];

    // 1. Atributos Básicos
    const statOrder = ["str", "agi", "vit", "int", "dex", "luk", "pow", "sta", "wis", "spl", "con", "crt"];
    statOrder.forEach((stat) => {
      const val = modifierEffects.statBonuses?.[stat as CharacterStat];
      if (val && val > 0) bonuses.push(`+${val} ${stat.toUpperCase()}`);
    });
    
    if (modifierEffects.pAtk && modifierEffects.pAtk > 0) bonuses.push(`+${modifierEffects.pAtk} P.Atk`);
    if (modifierEffects.smatk && modifierEffects.smatk > 0) bonuses.push(`+${modifierEffects.smatk} S.Matk`);

    // 2. HP / SP / AP
    if (modifierEffects.maxHp && modifierEffects.maxHp > 0) bonuses.push(`+${modifierEffects.maxHp} HP máximo`);
    if (modifierEffects.maxHpRate && modifierEffects.maxHpRate > 0) bonuses.push(`+${modifierEffects.maxHpRate}% HP máximo`);
    if (modifierEffects.maxSp && modifierEffects.maxSp > 0) bonuses.push(`+${modifierEffects.maxSp} SP máximo`);
    if (modifierEffects.maxSpRate && modifierEffects.maxSpRate > 0) bonuses.push(`+${modifierEffects.maxSpRate}% SP máximo`);
    if (modifierEffects.maxAp && modifierEffects.maxAp > 0) bonuses.push(`+${modifierEffects.maxAp} AP máximo`);
    if (modifierEffects.maxApRate && modifierEffects.maxApRate > 0) bonuses.push(`+${modifierEffects.maxApRate}% AP máximo`);

    // 3. ATK / MATK / DEF / MDEF
    const weaponAtk = characterStatus?.atk ? characterStatus.atk - (characterStatus.statusAtk ?? 0) : modifierEffects.flatAtk;
    const weaponMatk = characterStatus?.matk ? characterStatus.matk - (characterStatus.statusMatk ?? 0) : modifierEffects.flatMatk;
    
    if (weaponAtk && weaponAtk > 0) bonuses.push(`+${weaponAtk} ATQ (Arma + Equips)`);
    if (modifierEffects.atkRate && modifierEffects.atkRate > 0) bonuses.push(`+${modifierEffects.atkRate}% ATQ da arma`);
    if (weaponMatk && weaponMatk > 0) bonuses.push(`+${weaponMatk} ATQM (Arma + Equips)`);
    if (modifierEffects.matkRate && modifierEffects.matkRate > 0) bonuses.push(`+${modifierEffects.matkRate}% Dano mágico`);
    if (modifierEffects.flatDefense && modifierEffects.flatDefense > 0) bonuses.push(`+${modifierEffects.flatDefense} DEF`);
    if (modifierEffects.flatMagicDefense && modifierEffects.flatMagicDefense > 0) bonuses.push(`+${modifierEffects.flatMagicDefense} DEFM`);
    if (modifierEffects.flatRes && modifierEffects.flatRes > 0) bonuses.push(`+${modifierEffects.flatRes} RES`);
    if (modifierEffects.flatMres && modifierEffects.flatMres > 0) bonuses.push(`+${modifierEffects.flatMres} MRES`);

    // 4. ASPD / Hit / Crit / Combat
    if (modifierEffects.aspd && modifierEffects.aspd > 0) bonuses.push(`+${modifierEffects.aspd} ASPD`);
    if (modifierEffects.aspdRate && modifierEffects.aspdRate > 0) bonuses.push(`+${modifierEffects.aspdRate}% ASPD`);
    if (modifierEffects.hit && modifierEffects.hit > 0) bonuses.push(`+${modifierEffects.hit} Precisão`);
    if (modifierEffects.perfectHitRate && modifierEffects.perfectHitRate > 0) bonuses.push(`+${modifierEffects.perfectHitRate}% Precisão Perfeita`);
    if (modifierEffects.flee && modifierEffects.flee > 0) bonuses.push(`+${modifierEffects.flee} Esquiva`);
    if (modifierEffects.crit && modifierEffects.crit > 0) bonuses.push(`+${modifierEffects.crit} Crítico`);
    if (modifierEffects.criticalDamageRate && modifierEffects.criticalDamageRate > 0) bonuses.push(`+${modifierEffects.criticalDamageRate}% Dano Crítico`);
    if (modifierEffects.healPlus && modifierEffects.healPlus > 0) bonuses.push(`+${modifierEffects.healPlus}% Efetividade de Cura`);
    if (modifierEffects.healPower && modifierEffects.healPower > 0) bonuses.push(`+${modifierEffects.healPower}% Poder de Cura`);
    if (modifierEffects.shortAttackRate && modifierEffects.shortAttackRate > 0) bonuses.push(`+${modifierEffects.shortAttackRate}% Dano físico corpo a corpo`);
    if (modifierEffects.longAttackRate && modifierEffects.longAttackRate > 0) bonuses.push(`+${modifierEffects.longAttackRate}% Dano físico a distância`);

    // 5. Cast times
    if (modifierEffects.variableCastRate && modifierEffects.variableCastRate !== 0) {
      bonuses.push(`${Math.abs(modifierEffects.variableCastRate)}% Conjuração variável menor`);
    }
    if (modifierEffects.afterCastDelayRate && modifierEffects.afterCastDelayRate !== 0) {
      bonuses.push(`${Math.abs(modifierEffects.afterCastDelayRate)}% Pós-conjuração menor`);
    }
    if (modifierEffects.fixedCast && modifierEffects.fixedCast !== 0) {
      bonuses.push(`${Math.abs(modifierEffects.fixedCast / 1000).toFixed(1)}s Conjuração fixa menor`);
    }

    // 6. Sizes
    Object.entries(modifierEffects.sizeDamageRate || {}).forEach(([size, val]) => {
      if (val) bonuses.push(`+${val}% Dano físico contra ${translateSize(size)}`);
    });
    Object.entries(modifierEffects.magicSizeDamageRate || {}).forEach(([size, val]) => {
      if (val) bonuses.push(`+${val}% Dano mágico contra ${translateSize(size)}`);
    });

    // 7. Elements
    Object.entries(modifierEffects.elementDamageRate || {}).forEach(([ele, val]) => {
      if (val) bonuses.push(`+${val}% Dano físico contra prop. ${translateElement(ele)}`);
    });
    Object.entries(modifierEffects.magicElementDamageRate || {}).forEach(([ele, val]) => {
      if (val) bonuses.push(`+${val}% Dano mágico contra prop. ${translateElement(ele)}`);
    });
    Object.entries(modifierEffects.magicElementAttackRate || {}).forEach(([ele, val]) => {
      if (val) bonuses.push(`+${val}% Dano mágico de prop. ${translateElement(ele)}`);
    });

    // 8. Races
    Object.entries(modifierEffects.raceDamageRate || {}).forEach(([race, val]) => {
      if (val) bonuses.push(`+${val}% Dano físico contra raça ${translateRace(race)}`);
    });
    Object.entries(modifierEffects.magicRaceDamageRate || {}).forEach(([race, val]) => {
      if (val) bonuses.push(`+${val}% Dano mágico contra raça ${translateRace(race)}`);
    });

    // 9. Class
    Object.entries(modifierEffects.classDamageRate || {}).forEach(([cls, val]) => {
      if (val) bonuses.push(`+${val}% Dano físico contra classe ${translateClass(cls)}`);
    });
    Object.entries(modifierEffects.magicClassDamageRate || {}).forEach(([cls, val]) => {
      if (val) bonuses.push(`+${val}% Dano mágico contra classe ${translateClass(cls)}`);
    });
    Object.entries(modifierEffects.criticalRaceDamageRate || {}).forEach(([race, val]) => {
      if (val) bonuses.push(`+${val}% Dano Crítico contra raça ${translateRace(race)}`);
    });

    // 10. Ignored Defenses
    Object.entries(modifierEffects.ignoreDefenseRate || {}).forEach(([race, val]) => {
      if (val) bonuses.push(`${val}% Ignora DEF (${translateRace(race)})`);
    });
    Object.entries(modifierEffects.ignoreDefenseClassRate || {}).forEach(([cls, val]) => {
      if (val) bonuses.push(`${val}% Ignora DEF (${translateClass(cls)})`);
    });
    Object.entries(modifierEffects.ignoreDefenseSizeRate || {}).forEach(([sz, val]) => {
      if (val) bonuses.push(`${val}% Ignora DEF (${translateSize(sz)})`);
    });

    Object.entries(modifierEffects.ignoreMagicDefenseRate || {}).forEach(([race, val]) => {
      if (val) bonuses.push(`${val}% Ignora DEFM (${translateRace(race)})`);
    });
    Object.entries(modifierEffects.ignoreMagicDefenseClassRate || {}).forEach(([cls, val]) => {
      if (val) bonuses.push(`${val}% Ignora DEFM (${translateClass(cls)})`);
    });
    Object.entries(modifierEffects.ignoreMagicDefenseSizeRate || {}).forEach(([sz, val]) => {
      if (val) bonuses.push(`${val}% Ignora DEFM (${translateSize(sz)})`);
    });

    // 10.5 Resistências
    Object.entries(modifierEffects.incomingRaceDamageReductionRate || {}).forEach(([race, val]) => {
      if (val) bonuses.push(`+${val}% Resistência a ataques de ${translateRace(race)}`);
    });
    Object.entries(modifierEffects.incomingElementDamageReductionRate || {}).forEach(([ele, val]) => {
      if (val) bonuses.push(`+${val}% Resistência a ataques da prop. ${translateElement(ele)}`);
    });
    Object.entries(modifierEffects.incomingSizeDamageReductionRate || {}).forEach(([sz, val]) => {
      if (val) bonuses.push(`+${val}% Resistência a ataques de tamanho ${translateSize(sz)}`);
    });
    Object.entries(modifierEffects.incomingClassDamageReductionRate || {}).forEach(([cls, val]) => {
      if (val) bonuses.push(`+${val}% Resistência a ataques de classe ${translateClass(cls)}`);
    });

    // 11. Skill damages
    Object.entries(modifierEffects.skillDamageRate || {}).forEach(([skillCode, val]) => {
      if (val) {
        const skill = skillsEn.find((s) => s.name === skillCode);
        const skillName = skill ? skill.description || skill.name : skillCode;
        bonuses.push(`+${val}% Dano de [${skillName}]`);
      }
    });

    return bonuses;
  }, [modifierEffects]);
}
