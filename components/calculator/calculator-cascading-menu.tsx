"use client";

import * as React from "react";
import * as DropdownMenu from "@radix-ui/react-dropdown-menu";
import { ChevronRight } from "lucide-react";
import { CalculatorItemIcon } from "./calculator-item-icon";
import type { EnchantCategoryNode } from "./utils/categorize-enchants";

export function RecursiveCascadingMenu({
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
