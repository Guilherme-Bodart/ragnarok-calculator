"use client";

import { Gem, Sparkles, X } from "lucide-react";
import { useMemo } from "react";
import type { EquipmentSlot } from "@/packages/calculator-core/src";
import type { CalculatorDictionary } from "./calculator-i18n";
import type { CalculatorItemDetail } from "./calculator-item-data";
import type { CalculatorEquipmentSlotDefinition } from "./calculator-equipment-slots";
import { getShortItemName } from "./calculator-item-picker-utils";
import { CalculatorItemIcon } from "./calculator-item-icon";
import { useCalculatorBuildStore } from "./calculator-build-store";
import { calculatorSkillTreeClassGroups } from "./calculator-skill-tree-data";

type CalculatorEquipmentPaperdollProps = {
  activeTab: "equip" | "special";
  copy: CalculatorDictionary;
  selectedItemDetails: Record<number, CalculatorItemDetail>;
  selectedCardsBySlot: Partial<Record<EquipmentSlot, number[]>>;
  selectedItemsBySlot: Partial<Record<EquipmentSlot, number>>;
  itemContexts?: Record<number, { refine?: number; grade?: number; options?: number[] }>;
  slots: readonly CalculatorEquipmentSlotDefinition[];
  onEditSlot: (slotId: EquipmentSlot) => void;
  onEditCardsAndEnchants: (slotId: EquipmentSlot) => void;
  onUnequipSlot?: (slotId: EquipmentSlot) => void;
};

const GRADE_LABELS: Record<number, { label: string; className: string }> = {
  1: {
    label: "D",
    className: "bg-emerald-950/80 text-emerald-300 border-emerald-500/40",
  },
  2: {
    label: "C",
    className: "bg-sky-950/80 text-sky-300 border-sky-500/40",
  },
  3: {
    label: "B",
    className: "bg-purple-950/80 text-purple-300 border-purple-500/40",
  },
  4: {
    label: "A",
    className: "bg-amber-950/80 text-amber-300 border-amber-400/50",
  },
};

export function CalculatorEquipmentPaperdoll({
  activeTab,
  copy,
  selectedItemDetails,
  selectedCardsBySlot,
  selectedItemsBySlot,
  itemContexts = {},
  slots,
  onEditSlot,
  onEditCardsAndEnchants,
  onUnequipSlot,
}: CalculatorEquipmentPaperdollProps) {
  const selectedClassId = useCalculatorBuildStore((s) => s.selectedClassId);
  const baseLevel = useCalculatorBuildStore((s) => s.baseLevel);
  const jobLevel = useCalculatorBuildStore((s) => s.jobLevel);

  const currentClassName = useMemo(() => {
    const allClasses = calculatorSkillTreeClassGroups.flatMap((g) => g.options);
    return (
      allClasses.find((c) => c.id === selectedClassId)?.name ?? selectedClassId
    );
  }, [selectedClassId]);

  return (
    <div
      className="equipment-paperdoll"
      data-equipment-tab={activeTab}
      aria-label={copy.equipment.aria}
    >
      {/* CENTER CHARACTER AVATAR SHOWCASE */}
      <div
        className="equipment-avatar bg-gradient-to-b from-sky-950/20 via-slate-950/60 to-slate-950/90 border border-sky-500/20 shadow-[inset_0_0_60px_rgba(14,165,233,0.12)] rounded-2xl overflow-hidden relative flex flex-col items-center justify-between p-4"
        aria-hidden="true"
      >
        <div className="equipment-avatar-ring animate-pulse opacity-60 shadow-[0_0_60px_rgba(56,189,248,0.3)] border-sky-400/30" />

        {/* Top Class Badge */}
        <div className="z-10 flex items-center gap-2 px-3 py-1 rounded-full bg-slate-950/80 border border-sky-500/25 text-[10px] font-mono text-sky-200 shadow-md">
          <span className="font-bold uppercase tracking-wider text-sky-300">
            {currentClassName}
          </span>
          <span className="text-slate-500">•</span>
          <span>
            Lv.{baseLevel}/{jobLevel}
          </span>
        </div>

        {/* Official Class Sprite / Artwork */}
        <div className="relative z-10 flex-1 flex items-center justify-center w-full my-2">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={`/sprites/classes/${selectedClassId}.png`}
            alt={currentClassName}
            className="max-h-[220px] w-auto object-contain drop-shadow-[0_12px_24px_rgba(2,132,199,0.45)] transition-transform duration-500 hover:scale-105 select-none"
            onError={(e) => {
              (e.target as HTMLImageElement).style.display = "none";
            }}
          />
        </div>

        {/* Bottom Arcane Pedestal Glow */}
        <div className="z-10 w-3/4 h-2 rounded-full bg-sky-400/25 blur-sm" />
        <div className="absolute inset-0 bg-gradient-to-b from-transparent via-transparent to-sky-950/40 pointer-events-none" />
      </div>

      {slots.map((slot) => {
        const Icon = slot.icon;
        const label = copy.equipment.slots[slot.id];
        let itemId = selectedItemsBySlot[slot.id];
        let item = itemId ? selectedItemDetails[itemId] : null;

        const weaponId = selectedItemsBySlot["weapon" as EquipmentSlot];
        const weaponItem = weaponId ? selectedItemDetails[weaponId] : null;
        const isTwoHandedWeapon =
          weaponItem &&
          [
            "twoHandSword",
            "twoHandSpear",
            "twoHandStaff",
            "twoHandAxe",
            "bow",
            "katar",
            "rifle",
            "shotgun",
            "gatlingGun",
            "grenadeLauncher",
            "musicalInstrument",
            "whip",
          ].includes(weaponItem.weaponType ?? "");

        const isVisualTwoHandedOccupied = Boolean(
          slot.id === "shield" && isTwoHandedWeapon,
        );
        if (isVisualTwoHandedOccupied) {
          itemId = weaponId;
          item = weaponItem;
        }

        const itemContext = item ? itemContexts[item.id] : undefined;
        const refine = itemContext?.refine ?? 0;
        const grade = itemContext?.grade ?? 0;
        const gradeBadge = grade > 0 ? GRADE_LABELS[grade] : null;

        const isCostume = slot.id.startsWith("costume");
        const isShadow = slot.id.startsWith("shadow");
        const canSocketOrEnchant = Boolean(
          item && !isVisualTwoHandedOccupied && !isShadow,
        );

        const cardSlotCount = !isCostume ? (item?.cardSlots ?? 0) : 0;
        const enchantSlotCount = isCostume ? 1 : 3;
        const slotCards = selectedCardsBySlot[slot.id] ?? [];

        const equippedCardCount = Array.from({ length: cardSlotCount }).filter(
          (_, i) => Boolean(slotCards[i]),
        ).length;
        const equippedEnchantCount = Array.from({
          length: enchantSlotCount,
        }).filter((_, i) => Boolean(slotCards[cardSlotCount + i])).length;

        return (
          <div
            data-slot-area={slot.area}
            key={slot.id}
            className={`equipment-slot group relative flex flex-col justify-between overflow-hidden min-w-0 transition-all duration-200 rounded-xl p-2.5 border ${
              item
                ? "bg-gradient-to-br from-sky-950/55 via-slate-900/85 to-slate-950/90 border-sky-500/35 shadow-[inset_0_0_18px_rgba(14,165,233,0.1)] hover:border-sky-400/60 hover:shadow-[0_4px_20px_rgba(56,189,248,0.18)]"
                : "bg-slate-900/45 border-slate-800/80 hover:bg-slate-900/75 hover:border-slate-600/60"
            } ${isVisualTwoHandedOccupied ? "opacity-55 saturate-50" : ""}`}
          >
            {/* Quick Unequip Button on Hover */}
            {item && !isVisualTwoHandedOccupied && onUnequipSlot && (
              <button
                type="button"
                title={`Desequipar ${item.name}`}
                aria-label={`Desequipar ${item.name}`}
                onClick={(e) => {
                  e.stopPropagation();
                  onUnequipSlot(slot.id);
                }}
                className="absolute top-1.5 right-1.5 z-20 opacity-0 group-hover:opacity-100 p-1 rounded-md bg-slate-950/85 text-slate-400 hover:text-rose-300 hover:bg-rose-950/70 border border-slate-700/60 transition-all cursor-pointer"
              >
                <X size={12} />
              </button>
            )}

            {/* Main Slot Trigger (Opens Item Picker Modal) */}
            <button
              type="button"
              className="flex items-center justify-start gap-2.5 w-full text-left min-w-0 cursor-pointer bg-transparent border-0 p-0 focus:outline-none"
              aria-label={`${label}: ${item?.name ?? copy.equipment.empty}`}
              onClick={() => {
                if (isVisualTwoHandedOccupied) return;
                onEditSlot(slot.id);
              }}
              disabled={isVisualTwoHandedOccupied}
            >
              {item ? (
                <div className="shrink-0 p-1.5 bg-slate-950/75 rounded-lg border border-sky-500/25 shadow-sm">
                  <CalculatorItemIcon itemId={item.id} size={30} />
                </div>
              ) : (
                <div className="shrink-0 p-2 rounded-lg bg-slate-950/40 border border-slate-800/70 opacity-45 text-slate-400 group-hover:opacity-75 transition-opacity">
                  <Icon size={22} />
                </div>
              )}

              <div className="flex flex-col items-start w-full min-w-0 overflow-hidden pr-3">
                <div className="flex items-center gap-1.5 w-full">
                  <span
                    className={`text-[9px] uppercase tracking-wider font-extrabold truncate ${
                      item ? "text-sky-300/85" : "text-slate-500"
                    }`}
                  >
                    {label}
                  </span>
                  {isVisualTwoHandedOccupied && (
                    <span className="text-[8.5px] font-mono uppercase px-1 py-0.2 rounded bg-slate-800 text-slate-300">
                      2 Mãos
                    </span>
                  )}
                </div>

                <div className="flex items-center gap-1 w-full min-w-0 mt-0.5">
                  {refine > 0 && !isVisualTwoHandedOccupied && (
                    <span className="shrink-0 px-1.5 py-0.2 rounded bg-amber-500/20 border border-amber-400/40 text-[10px] font-mono font-black text-amber-300">
                      +{refine}
                    </span>
                  )}
                  {gradeBadge && !isVisualTwoHandedOccupied && (
                    <span
                      className={`shrink-0 px-1.5 py-0.2 rounded border text-[9.5px] font-mono font-black ${gradeBadge.className}`}
                    >
                      [{gradeBadge.label}]
                    </span>
                  )}
                  <strong
                    className={`text-xs font-bold truncate block ${
                      item ? "text-slate-100" : "text-slate-500 font-medium"
                    }`}
                  >
                    {item ? getShortItemName(item.name) : copy.equipment.empty}
                  </strong>
                </div>
              </div>
            </button>

            {/* Interactive Cards & Enchantments Bar */}
            {canSocketOrEnchant && item && (
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  onEditCardsAndEnchants(slot.id);
                }}
                className="mt-2 pt-1.5 border-t border-sky-500/15 flex items-center justify-between gap-2 w-full text-left hover:bg-sky-500/10 rounded px-1 py-0.5 transition-colors cursor-pointer"
                title="Configurar Cartas e Encantamentos"
              >
                <div className="flex items-center gap-1.5">
                  {/* Card Indicators */}
                  {cardSlotCount > 0 && (
                    <div className="flex items-center gap-1 mr-1">
                      <Gem size={10} className="text-sky-400 shrink-0" />
                      {Array.from({ length: cardSlotCount }).map((_, i) => {
                        const hasCard = Boolean(slotCards[i]);
                        return (
                          <span
                            key={`card-${i}`}
                            className={`w-2 h-2 rounded-full border transition-all ${
                              hasCard
                                ? "bg-sky-400 border-sky-200 shadow-[0_0_6px_rgba(56,189,248,0.9)]"
                                : "bg-slate-900 border-slate-600"
                            }`}
                          />
                        );
                      })}
                    </div>
                  )}

                  {/* Enchant Indicators */}
                  <div className="flex items-center gap-1">
                    <Sparkles size={10} className="text-amber-400 shrink-0" />
                    {Array.from({ length: enchantSlotCount }).map((_, i) => {
                      const hasEnchant = Boolean(slotCards[cardSlotCount + i]);
                      return (
                        <span
                          key={`enchant-${i}`}
                          className={`w-2 h-2 rounded-sm border transition-all ${
                            hasEnchant
                              ? "bg-amber-400 border-amber-200 shadow-[0_0_6px_rgba(245,158,11,0.9)]"
                              : "bg-slate-900 border-slate-600"
                          }`}
                        />
                      );
                    })}
                  </div>
                </div>

                <span className="text-[9.5px] font-mono text-slate-400 group-hover:text-sky-300 transition-colors truncate">
                  {equippedCardCount > 0 || equippedEnchantCount > 0
                    ? `${equippedCardCount}/${cardSlotCount}C • ${equippedEnchantCount}E`
                    : "Cartas / Enc."}
                </span>
              </button>
            )}
          </div>
        );
      })}
    </div>
  );
}
