"use client";

import {
  Footprints,
  Gem,
  Palette,
  Sparkles,
  X,
} from "lucide-react";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import {
  CalculatorCharacterCustomizerModal,
  type CharacterAppearanceConfig,
} from "./calculator-character-customizer-modal";
import { fetchItemCategory } from "./calculator-item-data";
import { animateSlotPop } from "@/components/ui/use-motion-effects";
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
  itemContexts?: Record<
    number,
    { refine?: number; grade?: number; options?: number[] }
  >;
  slots: readonly CalculatorEquipmentSlotDefinition[];
  onEditSlot: (slotId: EquipmentSlot) => void;
  onEditCardsAndEnchants: (slotId: EquipmentSlot) => void;
  onUnequipSlot?: (slotId: EquipmentSlot) => void;
};

type ItemViewMap = {
  headgear: Record<string, number>;
  garment: Record<string, number>;
};

let cachedItemViewMapPromise: Promise<ItemViewMap> | null = null;

function fetchItemViewMap(): Promise<ItemViewMap> {
  if (cachedItemViewMapPromise) return cachedItemViewMapPromise;
  cachedItemViewMapPromise = fetch("/sprites/item-view-map.json")
    .then(async (res) => {
      if (!res.ok) return { headgear: {}, garment: {} };
      return (await res.json()) as ItemViewMap;
    })
    .catch(() => ({ headgear: {}, garment: {} }));
  return cachedItemViewMapPromise;
}

const CLASS_RENDER_SPECS: Record<
  string,
  { jobId: string; gender: 0 | 1; head: number }
> = {
  Dragon_Knight: { jobId: "4252", gender: 1, head: 15 },
  Meister: { jobId: "4253", gender: 1, head: 12 },
  Shadow_Cross: { jobId: "4254", gender: 1, head: 16 },
  Arch_Mage: { jobId: "4255", gender: 1, head: 14 },
  Cardinal: { jobId: "4256", gender: 0, head: 14 },
  Windhawk: { jobId: "4257", gender: 1, head: 17 },
  Imperial_Guard: { jobId: "4258", gender: 1, head: 19 },
  Biolo: { jobId: "4259", gender: 0, head: 17 },
  Abyss_Chaser: { jobId: "4260", gender: 1, head: 20 },
  Elemental_Master: { jobId: "4261", gender: 0, head: 15 },
  Inquisitor: { jobId: "4262", gender: 1, head: 15 },
  Troubadour: { jobId: "4263", gender: 1, head: 18 },
  Trouvere: { jobId: "4264", gender: 0, head: 16 },
  Sky_Emperor: { jobId: "4302", gender: 1, head: 15 },
  Soul_Ascetic: { jobId: "4303", gender: 0, head: 15 },
  Shinkiro: { jobId: "4304", gender: 1, head: 16 },
  Shiranui: { jobId: "4305", gender: 0, head: 16 },
  Night_Watch: { jobId: "4306", gender: 1, head: 18 },
  Hyper_Novice: { jobId: "4307", gender: 1, head: 14 },
  Spirit_Handler: { jobId: "4308", gender: 1, head: 1 },
  Rune_Knight: { jobId: "4054", gender: 1, head: 15 },
  Warlock: { jobId: "4055", gender: 1, head: 16 },
  Ranger: { jobId: "4056", gender: 1, head: 17 },
  Arch_Bishop: { jobId: "4057", gender: 0, head: 14 },
  Mechanic: { jobId: "4058", gender: 1, head: 12 },
  Guillotine_Cross: { jobId: "4059", gender: 1, head: 19 },
  Royal_Guard: { jobId: "4066", gender: 1, head: 14 },
  Sorcerer: { jobId: "4067", gender: 0, head: 15 },
  Minstrel: { jobId: "4068", gender: 1, head: 18 },
  Wanderer: { jobId: "4069", gender: 0, head: 16 },
  Sura: { jobId: "4070", gender: 1, head: 15 },
  Genetic: { jobId: "4071", gender: 0, head: 17 },
  Shadow_Chaser: { jobId: "4072", gender: 1, head: 20 },
  Star_Emperor: { jobId: "4239", gender: 1, head: 15 },
  Soul_Reaper: { jobId: "4240", gender: 0, head: 15 },
  Rebellion: { jobId: "4215", gender: 1, head: 18 },
  Kagerou: { jobId: "4211", gender: 1, head: 16 },
  Oboro: { jobId: "4212", gender: 0, head: 16 },
  Death_Knight: { jobId: "4044", gender: 1, head: 1 },
  Dark_Collector: { jobId: "4045", gender: 1, head: 1 },
};

const APPEARANCE_STORAGE_KEY = "nightmare-character-appearance-v1";

const DEFAULT_APPEARANCE: CharacterAppearanceConfig = {
  gender: null,
  head: null,
  headPalette: 1,
  bodyPalette: -1,
  outfit: 0,
  headdir: 0,
  bodyDirection: 0,
  isWalking: false,
  visualTopItemId: null,
  visualMidItemId: null,
  visualLowItemId: null,
  visualGarmentItemId: null,
};

// Appearance is saved per class so switching class keeps each look independent.
function readAppearanceMap(): Record<string, CharacterAppearanceConfig> {
  if (typeof window === "undefined") return {};
  try {
    const raw = window.localStorage.getItem(APPEARANCE_STORAGE_KEY);
    return raw ? (JSON.parse(raw) as Record<string, CharacterAppearanceConfig>) : {};
  } catch {
    return {};
  }
}

function writeAppearanceMap(map: Record<string, CharacterAppearanceConfig>) {
  try {
    window.localStorage.setItem(APPEARANCE_STORAGE_KEY, JSON.stringify(map));
  } catch {
    // Ignore quota errors
  }
}

// Picks the dressing-room override when set (0 = explicitly empty), otherwise the equipped item.
function resolveVisualItemId(override: number | null, equipped: number): number {
  return override !== null ? override : equipped;
}

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

function formatSocketTagName(rawName: string): string {
  const short = getShortItemName(rawName)
    .replace(/^Carta\s+/i, "")
    .replace(/\s+Card$/i, "")
    .trim();
  return short.length > 14 ? `${short.slice(0, 13)}…` : short;
}

function EquippedSlotIconBox({
  itemId,
  refine,
}: {
  itemId: number;
  refine: number;
}) {
  const iconBoxRef = useRef<HTMLDivElement | null>(null);
  const isFirstMountRef = useRef(true);

  useEffect(() => {
    if (isFirstMountRef.current) {
      isFirstMountRef.current = false;
      return;
    }
    animateSlotPop(iconBoxRef.current);
  }, [itemId, refine]);

  return (
    <div
      ref={iconBoxRef}
      className={`shrink-0 p-1.5 bg-[#090b10] rounded-lg border ${
        refine >= 10
          ? "border-amber-400/50 shadow-[0_0_10px_rgba(245,158,11,0.2)]"
          : "border-white/10"
      }`}
    >
      <CalculatorItemIcon itemId={itemId} size={28} />
    </div>
  );
}

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

  const canonicalSpriteClassId = useMemo(
    () =>
      selectedClassId
        .replace(/_T2$/, "")
        .replace(/_T$/, "")
        .replace(/2$/, ""),
    [selectedClassId],
  );

  const defaultSpec = CLASS_RENDER_SPECS[canonicalSpriteClassId] ?? {
    jobId: "4255",
    gender: 1 as const,
    head: 15,
  };

  // Saved appearance (per class). Only changes when the user clicks "Salvar" in the dressing-room modal.
  const [viewMap, setViewMap] = useState<ItemViewMap>({
    headgear: {},
    garment: {},
  });
  const [isCustomizerOpen, setIsCustomizerOpen] = useState(false);
  const [appearance, setAppearance] =
    useState<CharacterAppearanceConfig>(DEFAULT_APPEARANCE);
  const setSelectedItemsBySlot = useCalculatorBuildStore(
    (s) => s.setSelectedItemsBySlot,
  );

  useEffect(() => {
    let mounted = true;
    fetchItemViewMap().then((map) => {
      if (mounted) setViewMap(map);
    });
    return () => {
      mounted = false;
    };
  }, []);

  // Load the saved look for the current class
  useEffect(() => {
    const saved = readAppearanceMap()[canonicalSpriteClassId];
    setAppearance(saved ? { ...DEFAULT_APPEARANCE, ...saved } : DEFAULT_APPEARANCE);
  }, [canonicalSpriteClassId]);

  const persistAppearance = useCallback(
    (next: CharacterAppearanceConfig) => {
      setAppearance(next);
      const map = readAppearanceMap();
      map[canonicalSpriteClassId] = next;
      writeAppearanceMap(map);
    },
    [canonicalSpriteClassId],
  );

  const effectiveGender = appearance.gender ?? defaultSpec.gender;
  const effectiveHead =
    canonicalSpriteClassId === "Spirit_Handler"
      ? 1
      : (appearance.head ?? defaultSpec.head);
  const isWalking = appearance.isWalking;

  // Equipped visual items (Costumes take visual priority over regular gear, like in RO)
  const equippedVisualItemIds = useMemo(
    () => ({
      top: selectedItemsBySlot.costumeHeadTop || selectedItemsBySlot.headTop || 0,
      mid: selectedItemsBySlot.costumeHeadMid || selectedItemsBySlot.headMid || 0,
      low: selectedItemsBySlot.costumeHeadLow || selectedItemsBySlot.headLow || 0,
      garment:
        selectedItemsBySlot.costumeGarment || selectedItemsBySlot.garment || 0,
    }),
    [selectedItemsBySlot],
  );

  const visualEquip = useMemo(() => {
    const top = resolveVisualItemId(appearance.visualTopItemId, equippedVisualItemIds.top);
    const mid = resolveVisualItemId(appearance.visualMidItemId, equippedVisualItemIds.mid);
    const low = resolveVisualItemId(appearance.visualLowItemId, equippedVisualItemIds.low);
    const garment = resolveVisualItemId(
      appearance.visualGarmentItemId,
      equippedVisualItemIds.garment,
    );

    return {
      top: top ? (viewMap.headgear[String(top)] ?? 0) : 0,
      mid: mid ? (viewMap.headgear[String(mid)] ?? 0) : 0,
      low: low ? (viewMap.headgear[String(low)] ?? 0) : 0,
      garment: garment ? (viewMap.garment[String(garment)] ?? 0) : 0,
    };
  }, [appearance, equippedVisualItemIds, viewMap]);

  const hasDynamicCustomization =
    visualEquip.top > 0 ||
    visualEquip.mid > 0 ||
    visualEquip.low > 0 ||
    visualEquip.garment > 0 ||
    isWalking ||
    (appearance.bodyDirection ?? 0) !== 0 ||
    appearance.gender !== null ||
    appearance.head !== null ||
    appearance.headPalette !== 1 ||
    appearance.bodyPalette !== -1 ||
    appearance.outfit !== 0 ||
    appearance.headdir !== 0;

  const characterSpriteSrc = useMemo(() => {
    if (!hasDynamicCustomization) {
      return `/sprites/classes/${canonicalSpriteClassId}.png`;
    }

    const baseAction = isWalking ? 8 : 0;
    const bodyDir = appearance.bodyDirection ?? 0;

    const params = new URLSearchParams({
      job: defaultSpec.jobId,
      gender: String(effectiveGender),
      head: String(effectiveHead),
      headPalette: String(appearance.headPalette),
      bodyPalette: String(appearance.bodyPalette),
      headdir: String(appearance.headdir),
      action: String(baseAction + bodyDir),
      outfit: String(appearance.outfit),
      top: String(visualEquip.top),
      mid: String(visualEquip.mid),
      low: String(visualEquip.low),
      garment: String(visualEquip.garment),
    });

    return `/api/character-render?${params.toString()}`;
  }, [
    hasDynamicCustomization,
    canonicalSpriteClassId,
    defaultSpec.jobId,
    effectiveGender,
    effectiveHead,
    appearance,
    isWalking,
    visualEquip,
  ]);

  // Smooth image swap: keeps previous sprite on screen until the new sprite finishes loading in background
  const [displayedSpriteSrc, setDisplayedSpriteSrc] = useState(characterSpriteSrc);

  useEffect(() => {
    let active = true;
    const img = new Image();
    img.src = characterSpriteSrc;
    img.onload = () => {
      if (active) setDisplayedSpriteSrc(characterSpriteSrc);
    };
    img.onerror = () => {
      if (active) setDisplayedSpriteSrc(characterSpriteSrc);
    };
    return () => {
      active = false;
    };
  }, [characterSpriteSrc]);

  // Applies the dressing-room draft. Optionally equips chosen Costume items in the Special tab slots.
  async function handleSaveAppearance(
    next: CharacterAppearanceConfig,
    equipInCostumeSlots: boolean,
  ) {
    if (equipInCostumeSlots) {
      const slotPairs: Array<{
        slot: EquipmentSlot;
        category: string;
        itemId: number | null;
      }> = [
        { slot: "costumeHeadTop" as EquipmentSlot, category: "costumeHeadTop", itemId: next.visualTopItemId },
        { slot: "costumeHeadMid" as EquipmentSlot, category: "costumeHeadMid", itemId: next.visualMidItemId },
        { slot: "costumeHeadLow" as EquipmentSlot, category: "costumeHeadLow", itemId: next.visualLowItemId },
        { slot: "costumeGarment" as EquipmentSlot, category: "costumeGarment", itemId: next.visualGarmentItemId },
      ];

      const updates: Partial<Record<EquipmentSlot, number>> = {};
      for (const pair of slotPairs) {
        if (!pair.itemId) continue;
        const costumeList = await fetchItemCategory(pair.category);
        if (costumeList.some((item) => item.id === pair.itemId)) {
          updates[pair.slot] = pair.itemId;
        }
      }

      if (Object.keys(updates).length > 0) {
        setSelectedItemsBySlot((prev) => ({ ...prev, ...updates }));
      }
    }

    // Slots left equal to the equipped item stay "linked" (null) so future gear changes still show up.
    const linkOrOverride = (draftId: number | null, equipped: number) =>
      draftId === null || draftId === equipped ? null : draftId;

    persistAppearance({
      ...next,
      visualTopItemId: linkOrOverride(next.visualTopItemId, equippedVisualItemIds.top),
      visualMidItemId: linkOrOverride(next.visualMidItemId, equippedVisualItemIds.mid),
      visualLowItemId: linkOrOverride(next.visualLowItemId, equippedVisualItemIds.low),
      visualGarmentItemId: linkOrOverride(
        next.visualGarmentItemId,
        equippedVisualItemIds.garment,
      ),
    });
    setIsCustomizerOpen(false);
  }

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
      {/* CENTER CHARACTER AVATAR SHOWCASE (LIVE EQUIPPED, CUSTOMIZED VIA MODAL) */}
      <div className="equipment-avatar bg-gradient-to-b from-[#131822] via-[#0d1017] to-[#090b10] border border-white/10 rounded-xl overflow-hidden relative flex flex-col items-center justify-between p-3">
        {/* Top Class Badge */}
        <div className="z-10 flex items-center justify-between gap-1.5 w-full px-2 py-1 rounded-lg bg-[#090b10]/90 border border-white/10 text-[9.5px] font-mono text-slate-200">
          <span className="font-bold uppercase tracking-wider text-sky-300 truncate">
            {currentClassName}
          </span>
          <span className="text-slate-400 shrink-0">
            Lv.{baseLevel}/{jobLevel}
          </span>
        </div>

        {/* Large Character Sprite — click opens the dressing room */}
        <button
          type="button"
          onClick={() => setIsCustomizerOpen(true)}
          title="Abrir Provador Visual"
          className={`relative z-10 flex-1 flex items-center justify-center w-full my-1 bg-transparent border-0 p-0 cursor-pointer ${
            isWalking ? "" : "calc-idle-float"
          }`}
        >
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={displayedSpriteSrc}
            alt={currentClassName}
            className="h-[230px] w-auto object-contain scale-[1.35] origin-center [image-rendering:pixelated] drop-shadow-[0_14px_24px_rgba(0,0,0,0.75)] select-none pointer-events-none transition-opacity duration-150"
            onError={(e) => {
              const img = e.target as HTMLImageElement;
              const fallback = `/sprites/classes/${canonicalSpriteClassId}.png`;
              if (!img.src.endsWith(fallback)) {
                img.src = fallback;
              }
            }}
          />
        </button>

        {/* Bottom Controls: quick walk toggle + open dressing room */}
        <div className="z-20 flex items-center justify-between gap-1 w-full pt-1">
          <button
            type="button"
            onClick={() =>
              persistAppearance({ ...appearance, isWalking: !appearance.isWalking })
            }
            title={isWalking ? "Pausar caminhada" : "Animar caminhada"}
            className={`inline-flex items-center justify-center gap-1 py-1 px-2 rounded-md border text-[9.5px] font-mono font-bold transition-colors cursor-pointer ${
              isWalking
                ? "bg-sky-500/20 border-sky-400/40 text-sky-200"
                : "bg-[#090b10]/85 border-white/10 text-slate-400 hover:text-slate-200"
            }`}
          >
            <Footprints size={10} />
          </button>

          <button
            type="button"
            onClick={() => setIsCustomizerOpen(true)}
            className="flex-1 inline-flex items-center justify-center gap-1.5 py-1 px-2 rounded-md bg-sky-500/15 hover:bg-sky-500/25 border border-sky-400/35 text-[10px] font-bold text-sky-200 transition-colors cursor-pointer"
          >
            <Palette size={11} />
            <span>Provador Visual</span>
          </button>
        </div>

        <div className="absolute inset-0 bg-gradient-to-b from-transparent via-transparent to-sky-950/20 pointer-events-none" />
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

        const equippedCardTags = Array.from({ length: cardSlotCount })
          .map((_, i) => slotCards[i])
          .filter((id): id is number => Boolean(id))
          .map((id) => ({
            id,
            label: selectedItemDetails[id]
              ? formatSocketTagName(selectedItemDetails[id].name)
              : `#${id}`,
          }));

        const equippedEnchantTags = Array.from({ length: enchantSlotCount })
          .map((_, i) => slotCards[cardSlotCount + i])
          .filter((id): id is number => Boolean(id))
          .map((id) => ({
            id,
            label: selectedItemDetails[id]
              ? formatSocketTagName(selectedItemDetails[id].name)
              : `#${id}`,
          }));

        const equippedCardCount = equippedCardTags.length;
        const equippedEnchantCount = equippedEnchantTags.length;

        return (
          <div
            data-slot-area={slot.area}
            key={slot.id}
            className={`equipment-slot group relative flex flex-col justify-between overflow-hidden min-w-0 transition-colors duration-150 rounded-xl p-2.5 border ${
              item
                ? "bg-[#121620]/95 border-white/15 hover:border-sky-400/50 hover:bg-[#161b26]"
                : "bg-[#0b0e14]/70 border-white/[0.06] hover:bg-[#11151f] hover:border-white/15"
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
                className="absolute top-1.5 right-1.5 z-20 opacity-0 group-hover:opacity-100 p-1 rounded-md bg-[#090b10]/95 text-slate-400 hover:text-rose-300 hover:bg-rose-950/70 border border-white/10 transition-opacity cursor-pointer"
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
                <EquippedSlotIconBox itemId={item.id} refine={refine} />
              ) : (
                <div className="shrink-0 p-2 rounded-lg bg-[#090b10]/60 border border-white/[0.06] opacity-45 text-slate-400 group-hover:opacity-80 transition-opacity">
                  <Icon size={20} />
                </div>
              )}

              <div className="flex flex-col items-start w-full min-w-0 overflow-hidden pr-3">
                <div className="flex items-center gap-1.5 w-full">
                  <span
                    className={`text-[9px] uppercase tracking-wider font-extrabold truncate ${
                      item ? "text-slate-400" : "text-slate-500"
                    }`}
                  >
                    {label}
                  </span>
                  {isVisualTwoHandedOccupied && (
                    <span className="text-[8.5px] font-mono uppercase px-1 py-0.5 rounded bg-slate-800 text-slate-300">
                      2 Mãos
                    </span>
                  )}
                </div>

                <div className="flex items-center gap-1 w-full min-w-0 mt-0.5">
                  {refine > 0 && !isVisualTwoHandedOccupied && (
                    <span
                      className={`shrink-0 px-1.5 py-0.5 rounded border text-[10px] font-mono font-black leading-none tabular-nums ${
                        refine >= 10
                          ? "bg-amber-500/25 border-amber-300/60 text-amber-200 shadow-[0_0_8px_rgba(245,158,11,0.25)]"
                          : "bg-amber-500/15 border-amber-400/35 text-amber-300"
                      }`}
                    >
                      +{refine}
                    </span>
                  )}
                  {gradeBadge && !isVisualTwoHandedOccupied && (
                    <span
                      className={`shrink-0 px-1.5 py-0.5 rounded border text-[9.5px] font-mono font-black leading-none ${gradeBadge.className}`}
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

            {/* Enka.Network Style Socket & Enchant Bar */}
            {canSocketOrEnchant && item && (
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  onEditCardsAndEnchants(slot.id);
                }}
                className="mt-2 pt-1.5 border-t border-white/[0.07] flex items-center justify-between gap-1.5 w-full text-left hover:bg-white/[0.04] rounded px-1 py-0.5 transition-colors cursor-pointer min-w-0"
                title="Configurar Cartas e Encantamentos"
              >
                {equippedCardCount > 0 || equippedEnchantCount > 0 ? (
                  <div className="flex items-center gap-1 flex-wrap min-w-0 overflow-hidden">
                    {equippedCardTags.map((tag, idx) => (
                      <span
                        key={`c-${tag.id}-${idx}`}
                        className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded bg-sky-500/15 border border-sky-400/30 text-[9px] font-mono font-semibold text-sky-200 truncate max-w-[105px]"
                      >
                        <Gem size={8} className="text-sky-400 shrink-0" />
                        <span className="truncate">{tag.label}</span>
                      </span>
                    ))}
                    {equippedEnchantTags.map((tag, idx) => (
                      <span
                        key={`e-${tag.id}-${idx}`}
                        className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded bg-amber-500/15 border border-amber-400/30 text-[9px] font-mono font-semibold text-amber-200 truncate max-w-[105px]"
                      >
                        <Sparkles size={8} className="text-amber-400 shrink-0" />
                        <span className="truncate">{tag.label}</span>
                      </span>
                    ))}
                  </div>
                ) : (
                  <>
                    <div className="flex items-center gap-1.5">
                      {cardSlotCount > 0 && (
                        <div className="flex items-center gap-1 mr-1">
                          <Gem size={10} className="text-sky-400/70 shrink-0" />
                          {Array.from({ length: cardSlotCount }).map((_, i) => (
                            <span
                              key={`card-empty-${i}`}
                              className="w-1.5 h-1.5 rounded-full border border-slate-600 bg-[#090b10]"
                            />
                          ))}
                        </div>
                      )}
                      <div className="flex items-center gap-1">
                        <Sparkles
                          size={10}
                          className="text-amber-400/70 shrink-0"
                        />
                        {Array.from({ length: enchantSlotCount }).map((_, i) => (
                          <span
                            key={`enchant-empty-${i}`}
                            className="w-1.5 h-1.5 rounded-sm border border-slate-600 bg-[#090b10]"
                          />
                        ))}
                      </div>
                    </div>
                    <span className="text-[9.5px] font-mono text-slate-500 group-hover:text-slate-300 transition-colors truncate">
                      Cartas / Enc.
                    </span>
                  </>
                )}
              </button>
            )}
          </div>
        );
      })}

      {isCustomizerOpen && (
        <CalculatorCharacterCustomizerModal
          classNameLabel={currentClassName}
          canonicalSpriteClassId={canonicalSpriteClassId}
          defaultSpec={defaultSpec}
          initialConfig={appearance}
          equippedVisualItemIds={equippedVisualItemIds}
          viewMap={viewMap}
          onClose={() => setIsCustomizerOpen(false)}
          onSave={handleSaveAppearance}
        />
      )}
    </div>
  );
}
