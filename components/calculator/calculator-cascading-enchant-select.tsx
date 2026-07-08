"use client";

import * as React from "react";
import { ChevronRight, ChevronDown } from "lucide-react";
import { cn } from "@/lib/utils";
import * as DropdownMenu from "@radix-ui/react-dropdown-menu";
import type { CalculatorItemIndexOption } from "./calculator-item-data";
import { CalculatorItemIcon } from "./calculator-item-icon";

export type EnchantCategoryNode = {
  id: string;
  label: string;
  options?: CalculatorItemIndexOption[];
  subCategories?: EnchantCategoryNode[];
};

export function categorizeEnchants(options: CalculatorItemIndexOption[]): EnchantCategoryNode[] {
  // Otimização: Criar um Map dos options para acesso O(1) ao invés de usar find O(N) dentro do loop!
  const optionsMap = new Map<string, CalculatorItemIndexOption>();
  for (const opt of options) {
    optionsMap.set(opt.name, opt);
  }

  // Helper for generating option lists
  const genOptions = (nameFn: (i: number) => string, max = 100, step = 1, start = 1): CalculatorItemIndexOption[] => {
    const arr: CalculatorItemIndexOption[] = [];
    for (let i = start; i <= max; i += step) {
      const opt = optionsMap.get(nameFn(i));
      if (opt) arr.push(opt);
    }
    return arr;
  };

  const genChunked = (
    nameFn: (i: number) => string,
    labelFn: (start: number, end: number) => string,
    max = 100, step = 1, start = 1
  ): EnchantCategoryNode[] => {
    const nodes: EnchantCategoryNode[] = [];
    const chunkSize = 10;
    for (let i = start; i <= max; i += chunkSize * step) {
      const chunkStart = i;
      const chunkEnd = Math.min(i + (chunkSize - 1) * step, max);
      const options = genOptions(nameFn, chunkEnd, step, chunkStart);
      if (options.length > 0) {
        nodes.push({
          id: `chunk-${chunkStart}-${chunkEnd}`,
          label: labelFn(chunkStart, chunkEnd),
          options: options
        });
      }
    }
    return nodes;
  };

  const genCategories = (dict: Record<string, string>, nameFn: (pt: string, i: number) => string): EnchantCategoryNode[] => {
    return Object.keys(dict).map(pt => ({
      id: pt,
      label: pt,
      subCategories: genChunked(
        i => nameFn(pt, i),
        (s, e) => `${s}% a ${e}%`,
        100
      )
    }));
  };

  const races = {
    Amorfo: "Formless", "Morto-Vivo": "Undead", Bruto: "Brute", Planta: "Plant",
    Inseto: "Insect", Peixe: "Fish", Demônio: "Demon", "Demi-Humano": "DemiHuman",
    Anjo: "Angel", Dragão: "Dragon"
  };
  const sizes = { Pequeno: "Small", Médio: "Medium", Grande: "Large" };
  const classes = { Normal: "Normal", Chefe: "Boss", Todos: "All" };
  const elements = {
    Neutro: "Neutral", Água: "Water", Terra: "Earth", Fogo: "Fire", Vento: "Wind",
    Veneno: "Poison", Sagrado: "Holy", Sombrio: "Dark", Fantasma: "Ghost", "Maldito": "Undead"
  };

  const root: Record<string, EnchantCategoryNode> = {
    fisico: { id: "fisico", label: "Físico", subCategories: [
      { id: "fis-raca", label: "Raça", subCategories: genCategories(races, (pt, i) => `Físico vs Raça ${pt} +${i}%`) },
      { id: "fis-elemento", label: "Elemento", subCategories: genCategories(elements, (pt, i) => `Físico vs Elemento ${pt} +${i}%`) },
      { id: "fis-tamanho", label: "Tamanho", subCategories: genCategories(sizes, (pt, i) => `Físico vs Tamanho ${pt} +${i}%`) },
      { id: "fis-classe", label: "Classe", subCategories: genCategories(classes, (pt, i) => `Físico vs Classe ${pt} +${i}%`) },
      { id: "fis-ignorar", label: "Ignorar penalidade de Tamanho", options: options.filter(o => o.name === "Ignorar Penalidade de Tamanho") },
      { id: "fis-atk", label: "ATK", subCategories: genChunked(i => `ATK +${i}`, (s, e) => `${s} a ${e}`, 100) },
      { id: "fis-atkperc", label: "ATK %", subCategories: genChunked(i => `ATK +${i}%`, (s, e) => `${s}% a ${e}%`, 100) },
      { id: "fis-dist", label: "À Distância", subCategories: genChunked(i => `Dano Físico à Distância +${i}%`, (s, e) => `${s}% a ${e}%`, 100) },
      { id: "fis-corpo", label: "Corpo a Corpo", subCategories: genChunked(i => `Dano Físico Corpo a Corpo +${i}%`, (s, e) => `${s}% a ${e}%`, 100) },
    ]},
    magico: { id: "magico", label: "Mágico", subCategories: [
      { id: "mag-raca", label: "Raça", subCategories: genCategories(races, (pt, i) => `Mágico vs Raça ${pt} +${i}%`) },
      { id: "mag-elemento", label: "Elemento", subCategories: genCategories(elements, (pt, i) => `Mágico vs Elemento ${pt} +${i}%`) },
      { id: "mag-tamanho", label: "Tamanho", subCategories: genCategories(sizes, (pt, i) => `Mágico vs Tamanho ${pt} +${i}%`) },
      { id: "mag-classe", label: "Classe", subCategories: genCategories(classes, (pt, i) => `Mágico vs Classe ${pt} +${i}%`) },
      { id: "mag-meu-elemento", label: "Meu Elemento Mágico", subCategories: genCategories(elements, (pt, i) => `Dano Mágico Elemento ${pt} +${i}%`) },
      { id: "mag-matk", label: "MATK", subCategories: genChunked(i => `MATK +${i}`, (s, e) => `${s} a ${e}`, 100) },
      { id: "mag-matkperc", label: "MATK %", subCategories: genChunked(i => `MATK +${i}%`, (s, e) => `${s}% a ${e}%`, 100) },
    ]},
    hpSp: { id: "hpSp", label: "HP e SP", subCategories: [
      { id: "hp", label: "HP", subCategories: genChunked(i => `HP +${i}`, (s, e) => `${s} a ${e}`, 5000, 50, 50) },
      { id: "hpPerc", label: "HP %", subCategories: genChunked(i => `HP +${i}%`, (s, e) => `${s}% a ${e}%`, 100) },
      { id: "sp", label: "SP", subCategories: genChunked(i => `SP +${i}`, (s, e) => `${s} a ${e}`, 2000, 20, 20) },
      { id: "spPerc", label: "SP %", subCategories: genChunked(i => `SP +${i}%`, (s, e) => `${s}% a ${e}%`, 100) },
    ]},
    penetFisRaca: { id: "penetFisRaca", label: "Penet. Física Raça", subCategories: genCategories(races, (pt, i) => `Ignorar Defesa Raça ${pt} ${i}%`) },
    penetFisClasse: { id: "penetFisClasse", label: "Penet. Física Classe", subCategories: genCategories(classes, (pt, i) => `Ignorar Defesa Classe ${pt} ${i}%`) },
    penetMagRaca: { id: "penetMagRaca", label: "Penet. Mágica Raça", subCategories: genCategories(races, (pt, i) => `Ignorar MDEF Raça ${pt} ${i}%`) },
    penetMagClasse: { id: "penetMagClasse", label: "Penet. Mágica Classe", subCategories: genCategories(classes, (pt, i) => `Ignorar MDEF Classe ${pt} ${i}%`) },
    stat: { id: "stat", label: "Stat", subCategories: [
      { id: "stat-todos", label: "Todos Atributos", subCategories: genChunked(i => `Todos Atributos +${i}`, (s, e) => `${s} a ${e}`, 100) },
      { id: "stat-for", label: "FOR", subCategories: genChunked(i => `FOR +${i}`, (s, e) => `${s} a ${e}`, 100) },
      { id: "stat-agi", label: "AGI", subCategories: genChunked(i => `AGI +${i}`, (s, e) => `${s} a ${e}`, 100) },
      { id: "stat-vit", label: "VIT", subCategories: genChunked(i => `VIT +${i}`, (s, e) => `${s} a ${e}`, 100) },
      { id: "stat-int", label: "INT", subCategories: genChunked(i => `INT +${i}`, (s, e) => `${s} a ${e}`, 100) },
      { id: "stat-des", label: "DES", subCategories: genChunked(i => `DES +${i}`, (s, e) => `${s} a ${e}`, 100) },
      { id: "stat-sor", label: "SOR", subCategories: genChunked(i => `SOR +${i}`, (s, e) => `${s} a ${e}`, 100) },
    ]},
    outros: { id: "outros", label: "Outros", subCategories: [
      { id: "crit", label: "CRIT", subCategories: genChunked(i => `CRIT +${i}`, (s, e) => `${s} a ${e}`, 100) },
      { id: "danoCrit", label: "Dano Crítico", subCategories: genChunked(i => `Dano Crítico +${i}%`, (s, e) => `${s}% a ${e}%`, 100) },
      { id: "def", label: "DEF", subCategories: genChunked(i => `DEF +${i}`, (s, e) => `${s} a ${e}`, 50) },
      { id: "mdef", label: "MDEF", subCategories: genChunked(i => `MDEF +${i}`, (s, e) => `${s} a ${e}`, 50) },
      { id: "precisao", label: "Precisão", subCategories: genChunked(i => `Precisão +${i}`, (s, e) => `${s} a ${e}`, 50) },
      { id: "esquiva", label: "Esquiva", subCategories: genChunked(i => `Esquiva +${i}`, (s, e) => `${s} a ${e}`, 50) },
      { id: "aspd-rate", label: "Velocidade de Ataque %", subCategories: genChunked(i => `Velocidade de Ataque +${i}%`, (s, e) => `${s}% a ${e}%`, 50) },
      { id: "aspd-flat", label: "Velocidade de Ataque", options: genOptions(i => `Velocidade de Ataque +${i}`, 5) },
      { id: "delay", label: "Pós-conjuração", subCategories: genChunked(i => `Pós-conjuração -${i}%`, (s, e) => `${s}% a ${e}%`, 50) },
      { id: "cast", label: "Conjuração Variável", subCategories: genChunked(i => `Conjuração Variável -${i}%`, (s, e) => `${s}% a ${e}%`, 50) },
    ]},
    talento: { id: "talento", label: "Talento", subCategories: [
      { id: "talento-pod", label: "POD", subCategories: genChunked(i => `POD +${i}`, (s, e) => `${s} a ${e}`, 100) },
      { id: "talento-fei", label: "FEI", subCategories: genChunked(i => `FEI +${i}`, (s, e) => `${s} a ${e}`, 100) },
      { id: "talento-sta", label: "STA", subCategories: genChunked(i => `STA +${i}`, (s, e) => `${s} a ${e}`, 100) },
      { id: "talento-sab", label: "SAB", subCategories: genChunked(i => `SAB +${i}`, (s, e) => `${s} a ${e}`, 100) },
      { id: "talento-con", label: "CON", subCategories: genChunked(i => `CON +${i}`, (s, e) => `${s} a ${e}`, 100) },
      { id: "talento-crv", label: "CRV", subCategories: genChunked(i => `CRV +${i}`, (s, e) => `${s} a ${e}`, 100) },
      { id: "talento-tcrit", label: "T.CRIT", subCategories: genChunked(i => `T.CRIT +${i}`, (s, e) => `${s} a ${e}`, 100) },
      { id: "talento-patk", label: "P.ATK", subCategories: genChunked(i => `P.ATK +${i}`, (s, e) => `${s} a ${e}`, 100) },
      { id: "talento-smatk", label: "S.MATK", subCategories: genChunked(i => `S.MATK +${i}`, (s, e) => `${s} a ${e}`, 100) },
    ]},
  };

  const filterEmpty = (node: EnchantCategoryNode): boolean => {
    let hasChildren = false;
    if (node.options && node.options.length > 0) hasChildren = true;
    if (node.subCategories) {
      node.subCategories = node.subCategories.filter(filterEmpty);
      if (node.subCategories.length > 0) hasChildren = true;
    }
    return hasChildren;
  };

  return Object.values(root).filter(filterEmpty);
}

type CalculatorCascadingEnchantSelectProps = {
  options: CalculatorItemIndexOption[];
  value: string;
  onChange: (value: string) => void;
  disabled?: boolean;
};

// Recursive component for Radix SubMenus
function RecursiveCascadingMenu({
  node,
  value,
  onChange,
}: {
  node: EnchantCategoryNode;
  value: string;
  onChange: (val: string) => void;
}) {
  return (
    <>
      {node.options?.map((opt) => (
        <DropdownMenu.Item
          key={opt.id}
          onSelect={() => onChange(String(opt.id))}
          className="relative flex items-center justify-between rounded-sm px-3 py-2 text-[11px] text-slate-200 hover:bg-sky-600/40 focus:bg-sky-600/40 focus:outline-none cursor-pointer select-none data-[disabled]:pointer-events-none data-[disabled]:opacity-50"
        >
          <div className="flex items-center gap-2">
            <CalculatorItemIcon itemId={opt.id} size={16} />
            <span className="whitespace-nowrap truncate">{opt.name}</span>
          </div>
          {String(opt.id) === value && <span className="text-sky-400 ml-3">✓</span>}
        </DropdownMenu.Item>
      ))}
      {node.subCategories?.map((sub) => (
        <DropdownMenu.Sub key={sub.id}>
          <DropdownMenu.SubTrigger className="relative flex items-center justify-between rounded-sm px-3 py-2 text-[11px] text-slate-200 hover:bg-slate-800 focus:bg-slate-800 focus:outline-none cursor-pointer select-none data-[state=open]:bg-slate-800">
            <span className="whitespace-nowrap">{sub.label}</span>
            <ChevronRight className="ml-2 h-3 w-3 text-slate-400" />
          </DropdownMenu.SubTrigger>
          <DropdownMenu.Portal>
            <DropdownMenu.SubContent
              sideOffset={2}
              alignOffset={-4}
              className="z-[10000] min-w-[160px] overflow-hidden rounded-md border border-slate-700 bg-[#1a2133] p-1 shadow-2xl animate-in slide-in-from-left-1"
            >
              <RecursiveCascadingMenu node={sub} value={value} onChange={onChange} />
            </DropdownMenu.SubContent>
          </DropdownMenu.Portal>
        </DropdownMenu.Sub>
      ))}
    </>
  );
}

export function CalculatorCascadingEnchantSelect({
  options,
  value,
  onChange,
  disabled = false,
}: CalculatorCascadingEnchantSelectProps) {
  const categories = React.useMemo(() => categorizeEnchants(options), [options]);
  const selectedItem = options.find((o) => String(o.id) === value);

  return (
    <DropdownMenu.Root>
      <DropdownMenu.Trigger asChild>
        <button
          disabled={disabled}
          type="button"
          className={cn(
            "w-full flex items-center justify-between gap-2 rounded-md border border-slate-700 bg-[#111827] px-3 py-2 text-xs font-medium text-slate-300 hover:bg-slate-800 hover:text-white transition-colors focus:outline-none focus:ring-2 focus:ring-sky-500",
            disabled && "opacity-50 cursor-not-allowed"
          )}
        >
          {selectedItem ? (
            <div className="flex items-center gap-2 overflow-hidden">
              <CalculatorItemIcon itemId={selectedItem.id} size={18} />
              <span className="truncate max-w-[120px]">{selectedItem.name}</span>
            </div>
          ) : (
            <span className="font-medium">{value === "empty" ? "Vazio" : "Selecionar..."}</span>
          )}
          <ChevronDown className="h-4 w-4 shrink-0 text-slate-500 transition-transform" />
        </button>
      </DropdownMenu.Trigger>

      <DropdownMenu.Portal>
        <DropdownMenu.Content
          sideOffset={4}
          className="z-[10000] min-w-[200px] overflow-hidden rounded-md border border-slate-700 bg-[#1a2133] p-1 shadow-2xl animate-in fade-in-80"
        >
          <DropdownMenu.Item
            onSelect={() => onChange("empty")}
            className="relative flex items-center justify-between rounded-sm px-3 py-2 text-[11px] text-slate-200 hover:bg-slate-800 focus:bg-slate-800 focus:outline-none cursor-pointer select-none"
          >
            Vazio
          </DropdownMenu.Item>
          {categories.length > 0 && <DropdownMenu.Separator className="my-1 h-px bg-slate-700" />}
          {categories.map((cat) => (
            <DropdownMenu.Sub key={cat.id}>
              <DropdownMenu.SubTrigger className="relative flex items-center justify-between rounded-sm px-3 py-2 text-[11px] text-slate-200 hover:bg-slate-800 focus:bg-slate-800 focus:outline-none cursor-pointer select-none data-[state=open]:bg-slate-800">
                <span className="whitespace-nowrap">{cat.label}</span>
                <ChevronRight className="ml-2 h-3 w-3 text-slate-400" />
              </DropdownMenu.SubTrigger>
              <DropdownMenu.Portal>
                <DropdownMenu.SubContent
                  sideOffset={2}
                  alignOffset={-4}
                  className="z-[10000] min-w-[180px] overflow-hidden rounded-md border border-slate-700 bg-[#1a2133] p-1 shadow-2xl animate-in slide-in-from-left-1"
                >
                  <RecursiveCascadingMenu node={cat} value={value} onChange={onChange} />
                </DropdownMenu.SubContent>
              </DropdownMenu.Portal>
            </DropdownMenu.Sub>
          ))}
        </DropdownMenu.Content>
      </DropdownMenu.Portal>
    </DropdownMenu.Root>
  );
}
