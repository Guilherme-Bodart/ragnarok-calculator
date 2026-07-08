"use client";

import { useState, useMemo } from "react";
import type { CalculatorDictionary } from "./calculator-i18n";
import type {
  CalculatorItemDetail,
  CalculatorItemIndexOption,
} from "./calculator-item-data";
import { CalculatorItemIcon } from "./calculator-item-icon";
import { ItemModifierPipeline } from "@/packages/calculator-core/src";
import skillsEn from "@/nightmare-data/normalized/skills/skills.en.json";
import itemsEn from "@/nightmare-data/normalized/items/items.en.json";
import comboIndexMap from "@/public/data/calculator/items/combos.json";

function formatGameDescription(desc: string | undefined | null) {
  if (!desc) return null;
  let html = desc;
  
  html = html.replace(/\^([0-9a-fA-F]{6})([^^]*)(?:\^000000)?/g, (_, color, text) => {
    let cssColor = `#${color}`;
    if (color.toLowerCase() === "0000ff") cssColor = "#38bdf8"; // Sky blue
    if (color.toLowerCase() === "777777") cssColor = "#94a3b8"; // Slate gray
    return `<span style="color: ${cssColor}">${text}</span>`;
  });
  
  html = html.replace(/\^[0-9a-fA-F]{6}/g, "");
  
  return (
    <div 
      className="text-[11px] leading-relaxed whitespace-pre-line text-slate-350 select-all" 
      dangerouslySetInnerHTML={{ __html: html }} 
    />
  );
}

type CalculatorItemPreviewProps = {
  cardOptions: CalculatorItemIndexOption[];
  copy: CalculatorDictionary;
  item: CalculatorItemIndexOption | CalculatorItemDetail | undefined;
  itemContexts: Record<number, { refine?: number; grade?: number }>;
  selectedCards: number[];
  selectedItemDetails: Record<number, CalculatorItemDetail>;
  selectedItemsBySlot?: Partial<Record<string, number>>; // Optional, to check combo active states
  learnedSkills?: Record<string, number>;
};

function translateSize(size: string): string {
  const map: Record<string, string> = {
    small: "Pequeno",
    medium: "Médio",
    large: "Grande",
    all: "Todos",
  };
  return map[size.toLowerCase()] || size;
}

function translateRace(race: string): string {
  const map: Record<string, string> = {
    formless: "Amorfo",
    undead: "Morto-Vivo",
    brute: "Bruto",
    plant: "Planta",
    insect: "Inseto",
    fish: "Peixe",
    demon: "Demônio",
    demihuman: "Humanoide",
    angel: "Anjo",
    dragon: "Dragão",
    player: "Jogador",
    playerdoram: "Doram",
    all: "Todos",
  };
  return map[race.toLowerCase()] || race;
}

function translateElement(element: string): string {
  const map: Record<string, string> = {
    neutral: "Neutro",
    water: "Água",
    earth: "Terra",
    fire: "Fogo",
    wind: "Vento",
    poison: "Veneno",
    holy: "Sagrado",
    shadow: "Sombrio",
    dark: "Sombrio",
    ghost: "Fantasma",
    undead: "Maldito",
    all: "Todos",
  };
  return map[element.toLowerCase()] || element;
}

function translateClass(cls: string): string {
  const map: Record<string, string> = {
    normal: "Normal",
    boss: "Chefe",
    guardian: "Guardião",
    all: "Todos",
  };
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

export function CalculatorItemPreview({
  cardOptions,
  copy,
  item,
  itemContexts,
  selectedCards,
  selectedItemDetails,
  selectedItemsBySlot = {},
  learnedSkills,
}: CalculatorItemPreviewProps) {
  const [collectionImageError, setCollectionImageError] = useState(false);
  const [tab, setTab] = useState(0); // 0: Propriedades, 1: Efeitos, 2: Conjuntos
  const t = copy.equipment.preview;

  const pipeline = useMemo(() => new ItemModifierPipeline(), []);

  // Calcular modificadores e combos
  const { individualEffects, comboEffects } = useMemo(() => {
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

    // 1. Obter efeitos individuais
    // V(0,0) - Base
    const baseEffects = pipeline.getEffects(
      { rawScript: item.rawScript, modifiers: item.modifiers },
      { refine: 0, grade: 0 }
    );
    // V(current_r, 0) - Refine apenas
    const refineOnlyEffects = pipeline.getEffects(
      { rawScript: item.rawScript, modifiers: item.modifiers },
      { refine, grade: 0 }
    );
    // V(current_r, current_g) - Final com Grade
    const finalEffects = pipeline.getEffects(
      { rawScript: item.rawScript, modifiers: item.modifiers },
      { refine, grade, refinesBySlot, equippedItemIds, learnedSkills }
    );

    const indEffects: { text: string; active: boolean }[] = [];
    const setsList: { title: string; text: string; equipped: boolean; active: boolean }[] = [];

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
        else if (mod.target.type === "class") targetStr = ` vs ${translateClass((mod.target as any).classId)}`;
        else if (mod.target.type === "skill") {
          const targetSkillId = (mod.target as any).skillId;
          const sk = skillsEn.find((s) => s.name === targetSkillId);
          targetStr = ` de [${sk?.description || sk?.name || targetSkillId}]`;
        }
      }
      let prefix = "";
      if (mod.stat.startsWith("unbreakable")) {
        return { name, unit: "", targetStr: "" };
      }
      return { name, unit, targetStr };
    };

    // Mapear todos os modificadores do item
    finalEffects.inputModifiers.forEach((mod, index) => {
      const isCombo = mod.conditions.some((c) => c.type === "equipped");

      // Formatar as condições (ex: Refino >= 7)
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

      // Verificar se este modificador está ativo no refino/grau atual
      const isActive = finalEffects.applicableModifiers.some(
        (am) =>
          am.stat === mod.stat &&
          am.operator === mod.operator &&
          JSON.stringify(am.target) === JSON.stringify(mod.target) &&
          JSON.stringify(am.conditions) === JSON.stringify(mod.conditions)
      );

      // Calcular base, refino e grau dinamicamente
      const currentVal = isActive
        ? finalEffects.applicableModifiers.find(
            (am) => am === mod // since we use applicableModifiers which are references to the same objects if they passed resolver, wait, are they?
            // Resolver filters the inputModifiers directly: `return modifiers.filter(...)` so they are the EXACT SAME objects.
            // Let's just use mod.value! Wait, if it's active, the value in `mod` IS the current value! 
            // `finalEffects.inputModifiers` contains the fully evaluated modifiers for the CURRENT context.
          )?.value ?? mod.value
        : mod.value;

      // Buscar base correspondente
      const baseMod = baseEffects.inputModifiers[index];
      const baseVal = baseMod ? baseMod.value : 0;

      // Buscar refine correspondente
      const refineOnlyMod = refineOnlyEffects.inputModifiers[index];
      const refineOnlyVal = refineOnlyMod ? refineOnlyMod.value : 0;

      const refineBonus = refineOnlyVal - baseVal;
      const gradeBonus = currentVal - refineOnlyVal;

      // Formatar descrição
      const { name, unit, targetStr } = formatMod(mod);

      let parts: string[] = [];
      const isUnbreakable = mod.stat.startsWith("unbreakable");

      if (isUnbreakable) {
        parts.push(name + condSuffix);
      } else if (isActive) {
        if (baseVal !== 0) {
          parts.push(`${name} +${baseVal}${unit}${targetStr}`);
        }
        if (refineBonus !== 0 && refine > 0) {
          const perRefine = refineBonus / refine;
          parts.push(`+${perRefine.toFixed(0)}${unit} p/ refino (+${refineBonus}${unit})`);
        }
        if (gradeBonus !== 0 && grade > 0) {
          parts.push(`+${gradeBonus}${unit} bônus de Grau`);
        }
        // Se tudo for 0 (ex: EDP active, script custom)
        if (parts.length === 0) {
          parts.push(`${name} +${currentVal}${unit}${targetStr}`);
        }
      } else {
        parts.push(`${name} +${mod.value}${unit}${targetStr}${condSuffix}`);
      }

      const descText = parts.join(" | ");

      if (isCombo) {
        // Obter os itens requeridos no combo
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

    // Processar combos externos (itens que pedem o item atual no combo)
    const externalComboItemIds = (comboIndexMap as Record<string, number[]>)[String(item.id)] || [];
    for (const extId of externalComboItemIds) {
      const extDbItem = itemsEn.find((i) => i.itemId === extId);
      if (!extDbItem || !extDbItem.rawScript) continue;

      try {
        const extEffects = pipeline.getEffects(
          { rawScript: extDbItem.rawScript, modifiers: [] },
          { refine: 0, grade: 0, refinesBySlot, equippedItemIds } // Ignora refine e grade do item externo na preview
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
      } catch (e) {}
    }

    const sortedSetsList = [...setsList].sort((a, b) => {
      if (a.equipped === b.equipped) {
        if (a.active === b.active) return 0;
        return a.active ? -1 : 1;
      }
      return a.equipped ? -1 : 1;
    });

    return { individualEffects: indEffects, comboEffects: sortedSetsList };
  }, [item, itemContexts, selectedItemsBySlot, pipeline]);

  if (!item) {
    return (
      <div className="calc-item-preview min-h-[195px] flex flex-col justify-center items-center">
        <strong>{t.emptyTitle}</strong>
        <p className="text-slate-500 italic mt-1 text-center">{t.emptyDescription}</p>
      </div>
    );
  }

  const refine = itemContexts[item.id]?.refine ?? 0;
  const grade = itemContexts[item.id]?.grade ?? 0;
  const gradeNames = ["Nenhum", "D", "C", "B", "A"];

  return (
    <div className="calc-item-preview min-h-[195px] flex flex-col gap-2.5">
      {/* 1. Header (Compacto: ID + Nome + Refino na mesma linha) */}
      <div className="flex items-center gap-3 border-b border-slate-800 pb-2 select-none">
        {!collectionImageError ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img 
            src={`https://static.divine-pride.net/images/items/collection/${item.id}.png`}
            alt={item.name}
            className="w-10 h-12 object-contain shrink-0"
            onError={() => setCollectionImageError(true)}
          />
        ) : (
          <div className="w-10 h-12 shrink-0 flex items-center justify-center bg-slate-950 rounded">
            <CalculatorItemIcon itemId={item.id} size={32} />
          </div>
        )}
        <div className="flex flex-col justify-center min-w-0">
          <div className="flex items-center gap-2 flex-wrap">
            <strong className="text-sm leading-tight text-slate-100 truncate max-w-[200px]" title={item.name}>
              {item.name}
            </strong>
            {item.refineable && refine > 0 ? (
              <span className="text-sky-400 font-extrabold text-[12px] shrink-0">+{refine}</span>
            ) : null}
            {item.refineable && grade > 0 ? (
              <span className="text-amber-400 font-extrabold text-[10px] bg-amber-500/10 px-1 rounded border border-amber-500/20 shrink-0">
                {gradeNames[grade]}
              </span>
            ) : null}
            <span className="text-[9px] bg-slate-800 text-slate-400 px-1.5 py-0.5 rounded shrink-0">ID: {item.id}</span>
          </div>
        </div>
      </div>

      {/* 2. Tabs Carousel Header */}
      <div className="flex gap-2 border-b border-slate-850 pb-1 select-none">
        <button
          type="button"
          onClick={() => setTab(0)}
          className={`pb-1 text-[10.5px] transition-all border-b-2 px-1 ${
            tab === 0
              ? "border-sky-500 text-sky-400 font-bold"
              : "border-transparent text-slate-450 hover:text-slate-200"
          }`}
        >
          Descrição
        </button>
        <button
          type="button"
          onClick={() => setTab(1)}
          className={`pb-1 text-[10.5px] transition-all border-b-2 px-1 ${
            tab === 1
              ? "border-sky-500 text-sky-400 font-bold"
              : "border-transparent text-slate-450 hover:text-slate-200"
          }`}
        >
          Efeitos ({individualEffects.length})
        </button>
        <button
          type="button"
          onClick={() => setTab(2)}
          className={`pb-1 text-[10.5px] transition-all border-b-2 px-1 ${
            tab === 2
              ? "border-sky-500 text-sky-400 font-bold"
              : "border-transparent text-slate-450 hover:text-slate-200"
          }`}
        >
          Conjuntos ({comboEffects.length})
        </button>
      </div>

      {/* 3. Carousel Content */}
      <div className="flex-1 min-h-[90px] max-h-[140px] overflow-y-auto custom-scrollbar">
        {tab === 0 && (
          <div className="p-1">
            {formatGameDescription((item as any).description) ?? (
              <p className="text-slate-500 italic text-[11px]">Sem descrição disponível.</p>
            )}
          </div>
        )}

        {tab === 1 && (
          <div className="flex flex-wrap gap-1.5 p-1">
            {individualEffects.map((eff, index) => (
              <span
                key={index}
                className={`px-2 py-0.5 rounded text-[10px] border transition-all select-all ${
                  eff.active
                    ? "bg-sky-500/10 text-sky-300 border-sky-500/20 font-medium"
                    : "bg-slate-800/40 text-slate-500 border-slate-800/50 line-through"
                }`}
              >
                {eff.text}
              </span>
            ))}
            {individualEffects.length === 0 && (
              <div className="text-slate-500 italic text-[10.5px] p-2">Este item não possui bônus de atributos.</div>
            )}
          </div>
        )}

        {tab === 2 && (
          <div className="flex flex-col gap-2 p-1">
            {comboEffects.filter(c => c.equipped).map((combo, index) => (
              <div
                key={`combo-${index}`}
                className={`p-1.5 rounded border text-[10px] flex flex-col gap-1 transition-all ${
                  combo.active
                    ? "bg-emerald-500/5 border-emerald-500/20 text-emerald-300"
                    : "bg-slate-800/40 border-slate-800/50 text-slate-500"
                }`}
              >
                <div className="flex justify-between items-start font-bold gap-2">
                  <span className={`leading-tight ${!combo.active ? "line-through" : ""}`} title={combo.title}>
                    {combo.title}
                  </span>
                  {combo.active ? (
                    <span className="text-[9px] px-1 rounded uppercase tracking-wider bg-emerald-500/20 text-emerald-400 shrink-0 mt-0.5">
                      Ativo
                    </span>
                  ) : (
                    <span className="text-[9px] px-1 rounded uppercase tracking-wider bg-slate-800 text-slate-400 shrink-0 mt-0.5">
                      Inativo
                    </span>
                  )}
                </div>
                <span className={`text-[9.5px] italic pl-2 select-all ${!combo.active ? "line-through" : ""}`}>
                  {combo.text}
                </span>
              </div>
            ))}
            
            {comboEffects.filter(c => c.equipped).length === 0 && (
              <div className="text-slate-500 italic text-[10.5px] p-2">Este item não faz parte de nenhum conjunto/combo ativo nos seus equipamentos.</div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
