import { useMemo } from "react";
import { ItemModifierPipeline } from "@/packages/calculator-core/src";
import type { CalculatorItemDetail, CalculatorItemIndexOption } from "./calculator-item-data";
import skillsEn from "@/nightmare-data/normalized/skills/skills.en.json";
import itemsEn from "@/nightmare-data/normalized/items/items.en.json";
import comboIndexMap from "@/public/data/calculator/items/combos.json";

function translateSize(size: string): string {
  const map: Record<string, string> = { small: "Pequeno", medium: "Médio", large: "Grande", all: "Todos" };
  return map[size.toLowerCase()] || size;
}

function translateRace(race: string): string {
  const map: Record<string, string> = {
    formless: "Amorfo", undead: "Morto-Vivo", brute: "Bruto", plant: "Planta",
    insect: "Inseto", fish: "Peixe", demon: "Demônio", demihuman: "Humanoide",
    angel: "Anjo", dragon: "Dragão", player: "Jogador", playerdoram: "Doram", all: "Todos",
  };
  return map[race.toLowerCase()] || race;
}

function translateElement(element: string): string {
  const map: Record<string, string> = {
    neutral: "Neutro", water: "Água", earth: "Terra", fire: "Fogo", wind: "Vento",
    poison: "Veneno", holy: "Sagrado", shadow: "Sombrio", dark: "Sombrio",
    ghost: "Fantasma", undead: "Maldito", all: "Todos",
  };
  return map[element.toLowerCase()] || element;
}

function translateClass(cls: string): string {
  const map: Record<string, string> = { normal: "Normal", boss: "Chefe", guardian: "Guardião", all: "Todos" };
  return map[cls.toLowerCase()] || cls;
}

function formatModifierName(stat: string): string {
  const statNames: Record<string, string> = {
    str: "FOR", agi: "AGI", vit: "VIT", int: "INT", dex: "DES", luk: "SOR",
    pow: "POW", sta: "STA", wis: "WIS", spl: "SPL", con: "CON", crt: "CRT",
    allStats: "Todos os Atributos",
    atk: "ATQ", matk: "ATQM", defense: "DEF", magicDefense: "DEFM",
    res: "RES", mres: "MRES",
    maxHp: "HP", maxSp: "SP", maxAp: "AP",
    maxHpRate: "HP", maxSpRate: "SP", maxApRate: "AP",
    atkRate: "ATQ da arma", matkRate: "Dano mágico",
    shortAttackRate: "Dano físico corpo a corpo", longAttackRate: "Dano físico a distância",
    criticalDamageRate: "Dano Crítico", perfectHitRate: "Precisão Perfeita",
    aspd: "ASPD", aspdRate: "ASPD", hit: "Precisão", flee: "Esquiva", crit: "Crítico",
    variableCastRate: "Conjuração variável", afterCastDelayRate: "Pós-conjuração",
    fixedCast: "Conjuração fixa", spCostRate: "Custo de SP",
    unbreakableArmor: "Armadura Indestrutível",
    unbreakableWeapon: "Arma Indestrutível",
    unbreakableShield: "Escudo Indestrutível",
    unbreakableHelm: "Capacete Indestrutível",
    unbreakableShoes: "Sapatos Indestrutíveis",
    unbreakableGarment: "Capa Indestrutível"
  };
  return statNames[stat] || stat.toUpperCase();
}

type UseItemPreviewEffectsProps = {
  item: CalculatorItemIndexOption | CalculatorItemDetail | undefined;
  itemContexts: Record<number, { refine?: number; grade?: number }>;
  selectedItemsBySlot: Partial<Record<string, number>>;
  learnedSkills?: Record<string, number>;
};

export function useItemPreviewEffects({
  item,
  itemContexts,
  selectedItemsBySlot,
  learnedSkills,
}: UseItemPreviewEffectsProps) {
  const pipeline = useMemo(() => new ItemModifierPipeline(), []);

  return useMemo(() => {
    if (!item) return { individualEffects: [], comboEffects: [] };

    const refine = itemContexts[item.id]?.refine ?? 0;
    const grade = itemContexts[item.id]?.grade ?? 0;

    const refinesBySlot: Record<string, number> = {};
    const equippedItemIds: number[] = [];
    for (const [slot, itemId] of Object.entries(selectedItemsBySlot)) {
      if (itemId) {
        equippedItemIds.push(itemId as number);
        if (itemContexts[itemId as number]) {
          refinesBySlot[slot] = itemContexts[itemId as number].refine ?? 0;
        }
      }
    }

    const baseEffects = pipeline.getEffects(
      { rawScript: item.rawScript, modifiers: item.modifiers },
      { refine: 0, grade: 0 }
    );
    const refineOnlyEffects = pipeline.getEffects(
      { rawScript: item.rawScript, modifiers: item.modifiers },
      { refine, grade: 0 }
    );
    const finalEffects = pipeline.getEffects(
      { rawScript: item.rawScript, modifiers: item.modifiers },
      { refine, grade, refinesBySlot, equippedItemIds, learnedSkills }
    );

    const indEffects: { text: string; active: boolean }[] = [];
    const setsList: { title: string; text: string; equipped: boolean; active: boolean }[] = [];

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const formatMod = (mod: any) => {
      const name = formatModifierName(mod.stat);
      const isPercent = mod.stat.endsWith("Rate") || [
        "atkRate", "matkRate", "shortAttackRate", "longAttackRate",
        "criticalDamageRate", "perfectHitRate", "aspdRate", "variableCastRate",
        "afterCastDelayRate", "spCostRate"
      ].includes(mod.stat);
      const unit = isPercent ? "%" : "";

      let targetStr = "";
      if (mod.target && mod.target.type !== "self") {
        if (mod.target.type === "race") targetStr = ` vs ${translateRace(mod.target.raceId)}`;
        else if (mod.target.type === "element") targetStr = ` vs ${translateElement(mod.target.elementId)}`;
        else if (mod.target.type === "size") targetStr = ` vs ${translateSize(mod.target.sizeId)}`;
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        else if (mod.target.type === "class") targetStr = ` vs ${translateClass((mod.target as any).classId)}`;
        else if (mod.target.type === "skill") {
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          const targetSkillId = (mod.target as any).skillId;
          const sk = skillsEn.find((s) => s.name === targetSkillId);
          targetStr = ` de [${sk?.description || sk?.name || targetSkillId}]`;
        }
      }
      if (mod.stat.startsWith("unbreakable")) {
        return { name, unit: "", targetStr: "" };
      }
      return { name, unit, targetStr };
    };

    finalEffects.inputModifiers.forEach((mod, index) => {
      const isCombo = mod.conditions.some((c) => c.type === "equipped");
      const nonComboConds = mod.conditions.filter((c) => c.type !== "equipped");
      const condsText = nonComboConds
        .map((c) => {
          if (c.type === "refine") return `Refino ${c.operator} ${c.value}`;
          if (c.type === "grade") {
            const grades = ["Nenhum", "D", "C", "B", "A"];
            return `Grau ${c.operator} ${grades[c.value] ?? c.value}`;
          }
          if (c.type === "equip_refine") {
            const slotMap: Record<number, string> = {
              1: "Topo", 2: "Armadura", 3: "Escudo", 4: "Arma", 5: "Capa", 6: "Sapatos", 7: "Acessório Esq.", 8: "Acessório Dir.", 9: "Meio", 10: "Baixo"
            };
            return `Refino (${slotMap[c.locationId] || "Item"}) ${c.operator} ${c.value}`;
          }
          return "";
        })
        .filter(Boolean)
        .join(" & ");

      const condSuffix = condsText ? ` (Requer ${condsText})` : "";
      const isActive = finalEffects.applicableModifiers.some(
        (am) =>
          am.stat === mod.stat &&
          am.operator === mod.operator &&
          JSON.stringify(am.target) === JSON.stringify(mod.target) &&
          JSON.stringify(am.conditions) === JSON.stringify(mod.conditions)
      );

      const currentVal = isActive
        ? finalEffects.applicableModifiers.find((am) => am === mod)?.value ?? mod.value
        : mod.value;

      const baseMod = baseEffects.inputModifiers[index];
      const baseVal = baseMod ? baseMod.value : 0;
      const refineOnlyMod = refineOnlyEffects.inputModifiers[index];
      const refineOnlyVal = refineOnlyMod ? refineOnlyMod.value : 0;
      const refineBonus = refineOnlyVal - baseVal;
      const gradeBonus = currentVal - refineOnlyVal;

      const { name, unit, targetStr } = formatMod(mod);
      const parts: string[] = [];
      const isUnbreakable = mod.stat.startsWith("unbreakable");

      if (isUnbreakable) {
        parts.push(name + condSuffix);
      } else if (isActive) {
        if (baseVal !== 0) parts.push(`${name} +${baseVal}${unit}${targetStr}`);
        if (refineBonus !== 0 && refine > 0) {
          const perRefine = refineBonus / refine;
          parts.push(`+${perRefine.toFixed(0)}${unit} p/ refino (+${refineBonus}${unit})`);
        }
        if (gradeBonus !== 0 && grade > 0) {
          parts.push(`+${gradeBonus}${unit} bônus de Grau`);
        }
        if (parts.length === 0) {
          parts.push(`${name} +${currentVal}${unit}${targetStr}`);
        }
      } else {
        parts.push(`${name} +${mod.value}${unit}${targetStr}${condSuffix}`);
      }

      const descText = parts.join(" | ");

      if (isCombo) {
        const equippedCond = mod.conditions.find((c) => c.type === "equipped");
        const requiredItemIds = equippedCond ? equippedCond.itemIds.filter((id) => id !== item.id) : [];
        const requiredNames = requiredItemIds.map((id) => {
          const dbItem = itemsEn.find((i) => i.itemId === id);
          return dbItem ? dbItem.name : `Item #${id}`;
        });
        const isComboActive = requiredItemIds.every((id) =>
          Object.values(selectedItemsBySlot).includes(id)
        );

        setsList.push({
          title: `[${item.name}] + [${requiredNames.join(" + ")}]`,
          text: descText,
          equipped: isComboActive,
          active: isActive,
        });
      } else {
        indEffects.push({ text: descText, active: isActive });
      }
    });

    const externalComboItemIds = (comboIndexMap as Record<string, number[]>)[String(item.id)] || [];
    for (const extId of externalComboItemIds) {
      const extDbItem = itemsEn.find((i) => i.itemId === extId);
      if (!extDbItem || !extDbItem.rawScript) continue;

      try {
        const extEffects = pipeline.getEffects(
          { rawScript: extDbItem.rawScript, modifiers: [] },
          { refine: 0, grade: 0, refinesBySlot, equippedItemIds }
        );

        extEffects.inputModifiers.forEach((mod) => {
          const equippedCond = mod.conditions.find((c) => c.type === "equipped");
          if (!equippedCond || !equippedCond.itemIds.includes(item.id)) return;

          const { name, unit, targetStr } = formatMod(mod);
          const descText = `${name} +${mod.value}${unit}${targetStr}`;

          const isExtEquipped = Object.values(selectedItemsBySlot).includes(extId);
          const requiredItemIds = equippedCond.itemIds.filter((id) => id !== extId);
          const isComboActive = isExtEquipped && requiredItemIds.every((id) =>
            Object.values(selectedItemsBySlot).includes(id)
          );

          const requiredNames = equippedCond.itemIds.map((id) => {
            const dbItem = itemsEn.find((i) => i.itemId === id);
            return dbItem ? dbItem.name : `Item #${id}`;
          });

          const isActive = extEffects.applicableModifiers.some(
            (am) =>
              am.stat === mod.stat &&
              am.operator === mod.operator &&
              JSON.stringify(am.target) === JSON.stringify(mod.target) &&
              JSON.stringify(am.conditions) === JSON.stringify(mod.conditions)
          );

          setsList.push({
            title: `[${extDbItem.name}] + [${requiredNames.filter(n => n !== extDbItem.name).join(" + ")}]`,
            text: descText,
            equipped: isComboActive,
            active: isActive,
          });
        });
      } catch {
        // Ignorar erros de parse para combos não implementados no dataset
      }
    }

    const sortedSetsList = [...setsList].sort((a, b) => {
      if (a.equipped === b.equipped) {
        if (a.active === b.active) return 0;
        return a.active ? -1 : 1;
      }
      return a.equipped ? -1 : 1;
    });

    return { individualEffects: indEffects, comboEffects: sortedSetsList };
  }, [item, itemContexts, selectedItemsBySlot, pipeline, learnedSkills]);
}
