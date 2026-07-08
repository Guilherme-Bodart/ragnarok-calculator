"use client";

import * as React from "react";
import { ChevronRight, ChevronDown } from "lucide-react";
import { cn } from "@/lib/utils";
import * as DropdownMenu from "@radix-ui/react-dropdown-menu";
import type { CalculatorItemIndexOption } from "./calculator-item-data";
import { CalculatorItemIcon } from "./calculator-item-icon";
import { categorizeEnchants } from "./utils/categorize-enchants";
import { RecursiveCascadingMenu } from "./calculator-cascading-menu";

type CalculatorCascadingEnchantSelectProps = {
  options: CalculatorItemIndexOption[];
  value: string;
  onChange: (value: string) => void;
  disabled?: boolean;
};

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
            "w-full h-[40px] flex items-center justify-between gap-2 rounded-md border border-slate-700/50 bg-[#141b2a] px-4 py-2 text-[13px] font-medium text-slate-200 hover:bg-slate-800 transition-colors focus:outline-none focus:ring-1 focus:ring-slate-500",
            disabled && "opacity-50 cursor-not-allowed"
          )}
        >
          {selectedItem ? (
            <div className="flex items-center gap-2 overflow-hidden">
              <CalculatorItemIcon itemId={selectedItem.id} size={18} />
              <span className="truncate max-w-[120px]">{selectedItem.name}</span>
            </div>
          ) : (
            <span>{value === "empty" ? "Vazio" : "Selecionar..."}</span>
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
