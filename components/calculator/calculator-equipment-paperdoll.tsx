"use client";

import type { EquipmentSlot } from "@/packages/calculator-core/src";
import type { CalculatorDictionary } from "./calculator-i18n";
import type { CalculatorItemDetail } from "./calculator-item-data";
import type { CalculatorEquipmentSlotDefinition } from "./calculator-equipment-slots";
import { getShortItemName } from "./calculator-item-picker-utils";
import { CalculatorItemIcon } from "./calculator-item-icon";

type CalculatorEquipmentPaperdollProps = {
  activeTab: "equip" | "special";
  copy: CalculatorDictionary;
  selectedItemDetails: Record<number, CalculatorItemDetail>;
  selectedCardsBySlot: Partial<Record<EquipmentSlot, number[]>>;
  selectedItemsBySlot: Partial<Record<EquipmentSlot, number>>;
  slots: readonly CalculatorEquipmentSlotDefinition[];
  onEditSlot: (slotId: EquipmentSlot) => void;
  onEditCardsAndEnchants: (slotId: EquipmentSlot) => void;
};

export function CalculatorEquipmentPaperdoll({
  activeTab,
  copy,
  selectedItemDetails,
  selectedCardsBySlot,
  selectedItemsBySlot,
  slots,
  onEditSlot,
  onEditCardsAndEnchants,
}: CalculatorEquipmentPaperdollProps) {
  return (
    <div
      className="equipment-paperdoll"
      data-equipment-tab={activeTab}
      aria-label={copy.equipment.aria}
    >
      <div className="equipment-avatar bg-gradient-to-t from-sky-900/10 to-transparent border border-sky-500/20 shadow-[inset_0_0_60px_rgba(14,165,233,0.15)] rounded-xl overflow-hidden relative" aria-hidden="true">
        <div className="equipment-avatar-ring animate-pulse opacity-70 shadow-[0_0_60px_rgba(56,189,248,0.4)] border-sky-400/40" />
        <div className="equipment-avatar-sprite drop-shadow-[0_0_20px_rgba(56,189,248,0.7)] hover:drop-shadow-[0_0_30px_rgba(56,189,248,0.9)] transition-all duration-500" suppressHydrationWarning>
          <span className="equipment-avatar-head bg-sky-200/40 border-sky-100/50" />
          <span className="equipment-avatar-body bg-gradient-to-b from-sky-300/40 to-sky-600/60 border-sky-200/50" />
          <span className="equipment-avatar-arm equipment-avatar-arm-left bg-sky-400/50 border-sky-200/40" />
          <span className="equipment-avatar-arm equipment-avatar-arm-right bg-sky-400/50 border-sky-200/40" />
          <span className="equipment-avatar-leg equipment-avatar-leg-left bg-sky-700/60 border-sky-400/40" />
          <span className="equipment-avatar-leg equipment-avatar-leg-right bg-sky-700/60 border-sky-400/40" />
        </div>
        <div className="absolute inset-0 bg-gradient-to-b from-transparent via-transparent to-sky-900/40 pointer-events-none" />
      </div>

      {slots.map((slot) => {
        const Icon = slot.icon;
        const label = copy.equipment.slots[slot.id];
        const itemId = selectedItemsBySlot[slot.id];
        const item = itemId ? selectedItemDetails[itemId] : null;

        return (
          <button
            type="button"
            className={`equipment-slot relative flex items-center justify-start gap-3 overflow-hidden min-w-0 transition-all duration-300 rounded-lg p-2.5 border 
              ${item ? 'bg-gradient-to-br from-sky-900/60 to-slate-900/80 border-sky-500/30 shadow-[inset_0_0_15px_rgba(14,165,233,0.1)] hover:border-sky-400/50 hover:shadow-[0_4px_20px_rgba(56,189,248,0.2)]' : 'bg-slate-900/40 border-slate-700/50 hover:bg-slate-800/60 hover:border-slate-500/50'}`}
            data-slot-area={slot.area}
            key={slot.id}
            aria-label={`${label}: ${item?.name ?? copy.equipment.empty}`}
            onClick={() => onEditSlot(slot.id)}
          >
            {item ? (
              <div className="shrink-0 p-1 bg-slate-950/50 rounded-md border border-slate-700/50 shadow-sm">
                <CalculatorItemIcon itemId={item.id} size={32} />
              </div>
            ) : (
              <div className="shrink-0 p-1.5 opacity-40 text-slate-400">
                <Icon size={24} />
              </div>
            )}
            
            <div className="flex flex-col items-start w-full text-left min-w-0 overflow-hidden">
              <span className={`text-[9px] uppercase tracking-wider font-bold mb-0.5 ${item ? 'text-sky-300/80' : 'text-slate-500'}`}>{label}</span>
              <strong className={`text-xs font-medium truncate w-full block ${item ? 'text-slate-100' : 'text-slate-500'}`}>
                {item ? getShortItemName(item.name) : copy.equipment.empty}
              </strong>

              {/* Indicators row for cards (circles) and enchantments (squares) */}
              {item && (
                <div 
                  className="flex items-center gap-1 mt-1.5 border-t border-slate-800/60 pt-1 w-full"
                  onClick={(e) => {
                    e.stopPropagation(); // Avoid triggering open item picker modal
                    onEditCardsAndEnchants(slot.id);
                  }}
                >
                  {/* Card Dot(s) */}
                  {item.cardSlots && item.cardSlots > 0 ? (
                    Array.from({ length: item.cardSlots }).map((_, i) => {
                      const hasCard = Boolean(selectedCardsBySlot[slot.id]?.[i]);
                      return (
                        <div 
                          key={`card-${i}`} 
                          title={hasCard ? "Carta Equipada" : "Carta Vazia"}
                          className={`w-1.5 h-1.5 rounded-full border transition-all ${
                            hasCard 
                              ? "bg-sky-400 border-sky-300 shadow-[0_0_4px_rgba(56,189,248,0.8)]" 
                              : "bg-transparent border-slate-700 hover:border-slate-500"
                          }`} 
                        />
                      );
                    })
                  ) : null}

                  {/* Enchant Squares */}
                  {Array.from({ length: 3 }).map((_, i) => {
                    const enchantIndex = (item.cardSlots ?? 0) + i;
                    const hasEnchant = Boolean(selectedCardsBySlot[slot.id]?.[enchantIndex]);
                    return (
                      <div 
                        key={`enchant-${i}`} 
                        title={hasEnchant ? "Encantamento Equipado" : "Encantamento Vazio"}
                        className={`w-1.5 h-1.5 rounded-sm border transition-all ${
                          hasEnchant 
                            ? "bg-amber-400 border-amber-300 shadow-[0_0_4px_rgba(245,158,11,0.8)]" 
                            : "bg-transparent border-slate-700 hover:border-slate-500"
                        }`} 
                      />
                    );
                  })}
                </div>
              )}
            </div>
          </button>
        );
      })}
    </div>
  );
}
