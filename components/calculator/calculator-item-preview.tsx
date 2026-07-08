"use client";

import { useState } from "react";
import type { CalculatorDictionary } from "./calculator-i18n";
import type {
  CalculatorItemDetail,
  CalculatorItemIndexOption,
} from "./calculator-item-data";
import { CalculatorItemIcon } from "./calculator-item-icon";
import { useItemPreviewEffects } from "./use-item-preview-effects";

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
  cardOptions?: CalculatorItemIndexOption[];
  copy: CalculatorDictionary;
  item: CalculatorItemIndexOption | CalculatorItemDetail | undefined;
  itemContexts: Record<number, { refine?: number; grade?: number }>;
  selectedCards?: number[];
  selectedItemDetails?: Record<number, CalculatorItemDetail>;
  selectedItemsBySlot?: Partial<Record<string, number>>; // Optional, to check combo active states
  learnedSkills?: Record<string, number>;
};



export function CalculatorItemPreview({
  copy,
  item,
  itemContexts,
  selectedItemsBySlot = {},
  learnedSkills,
}: CalculatorItemPreviewProps) {
  const [collectionImageError, setCollectionImageError] = useState(false);
  const [tab, setTab] = useState(0); // 0: Propriedades, 1: Efeitos, 2: Conjuntos
  const t = copy.equipment.preview;

  // Calcular modificadores e combos através do hook extraído
  const { individualEffects, comboEffects } = useItemPreviewEffects({
    item,
    itemContexts,
    selectedItemsBySlot,
    learnedSkills,
  });

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
            {formatGameDescription((item as never).description) ?? (
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
