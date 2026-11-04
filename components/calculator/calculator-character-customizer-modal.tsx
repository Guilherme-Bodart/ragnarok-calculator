"use client";

import { useEffect, useMemo, useState } from "react";
import {
  Check,
  ChevronLeft,
  ChevronRight,
  Palette,
  RotateCcw,
  Search,
  Sparkles,
  Shirt,
  X,
} from "lucide-react";
import { Modal } from "@/components/ui/modal";
import { useNightmareLocale } from "@/components/site/use-nightmare-locale";
import { fetchItemCategory, type CalculatorItemIndexOption } from "./calculator-item-data";
import { CalculatorItemIcon } from "./calculator-item-icon";
import { getShortItemName } from "./calculator-item-picker-utils";

export type CharacterAppearanceConfig = {
  gender: 0 | 1 | null;
  head: number | null;
  headPalette: number;
  bodyPalette: number;
  outfit: 0 | 1;
  headdir: 0 | 1 | 2;
  bodyDirection?: number;
  isWalking: boolean;
  // Optional visual item IDs chosen in the dressing room (override or preview)
  visualTopItemId: number | null;
  visualMidItemId: number | null;
  visualLowItemId: number | null;
  visualGarmentItemId: number | null;
};

export type ItemViewMap = {
  headgear: Record<string, number>;
  garment: Record<string, number>;
};

type CalculatorCharacterCustomizerModalProps = {
  classNameLabel: string;
  canonicalSpriteClassId: string;
  defaultSpec: { jobId: string; gender: 0 | 1; head: number };
  initialConfig: CharacterAppearanceConfig;
  equippedVisualItemIds: {
    top: number;
    mid: number;
    low: number;
    garment: number;
  };
  viewMap: ItemViewMap;
  onClose: () => void;
  onSave: (
    nextConfig: CharacterAppearanceConfig,
    equipInCostumeSlots: boolean,
  ) => void;
};

type VisualSlotTab = "top" | "mid" | "low" | "garment";

const HAIR_COLOR_SWATCHES: Array<{ id: number; label: string; hex: string }> = [
  { id: 0, label: "Padrão", hex: "#e2c08d" },
  { id: 1, label: "Loiro", hex: "#facc15" },
  { id: 2, label: "Lavanda", hex: "#c084fc" },
  { id: 3, label: "Castanho", hex: "#a16207" },
  { id: 4, label: "Verde", hex: "#4ade80" },
  { id: 5, label: "Azul", hex: "#60a5fa" },
  { id: 6, label: "Branco", hex: "#f8fafc" },
  { id: 7, label: "Preto/Cinza", hex: "#475569" },
  { id: 8, label: "Ruivo", hex: "#f87171" },
];

const CLOTHES_PALETTES: Array<{ id: number; label: string }> = [
  { id: -1, label: "Padrão" },
  { id: 0, label: "Cor 1" },
  { id: 1, label: "Cor 2" },
  { id: 2, label: "Cor 3" },
  { id: 3, label: "Cor 4" },
  { id: 4, label: "Cor 5" },
  { id: 5, label: "Cor 6" },
  { id: 6, label: "Cor 7" },
  { id: 7, label: "Cor 8" },
];

const I18N_CUSTOMIZER = {
  pt: {
    modalTitle: "Provador Visual",
    cancel: "Cancelar",
    save: "Salvar",
    reset: "Restaurar Padrão",
    alsoEquipCostume: "Equipar na aba Especial (Costumes)",
    genderMasc: "♂ Masc",
    genderFem: "♀ Fem",
    outfitAlt: "Traje: Alternativo (jRO)",
    outfitDefault: "Traje: Padrão (kRO)",
    rotateLeft: "Girar para esquerda",
    rotateRight: "Girar para direita",
    dirFront: "Frente",
    dirLeft: "Esq.",
    dirBack: "Costas",
    dirRight: "Dir.",
    headLookLeft: "Olhar para esquerda",
    headLookFront: "Olhar para frente",
    headLookRight: "Olhar para direita",
    poseIdle: "Parado",
    poseWalk: "Andando",
    poseSit: "Sentado",
    poseCombat: "Combate",
    tabCostumes: "Visuais & Costumes",
    tabHairAndColors: "Cabelo & Cores",
    searchPlaceholder: "Buscar visual por nome ou ID...",
    hairStyle: "Estilo de Cabelo",
    hairColor: "Cor do Cabelo",
    clothesColor: "Cor da Roupa (Paleta do Corpo)",
    slotTop: "Topo",
    slotMid: "Meio",
    slotLow: "Baixo",
    slotGarment: "Capa",
    equippedSlotsHeader: "Visuais Equipados",
    noItemFound: "Nenhum visual encontrado com este termo.",
  },
  en: {
    modalTitle: "Dressing Room",
    cancel: "Cancel",
    save: "Save",
    reset: "Reset to Default",
    alsoEquipCostume: "Equip in Special (Costume) tab",
    genderMasc: "♂ Male",
    genderFem: "♀ Female",
    outfitAlt: "Outfit: Alternate (jRO)",
    outfitDefault: "Outfit: Default (kRO)",
    rotateLeft: "Rotate left",
    rotateRight: "Rotate right",
    dirFront: "Front",
    dirLeft: "Left",
    dirBack: "Back",
    dirRight: "Right",
    headLookLeft: "Look left",
    headLookFront: "Look forward",
    headLookRight: "Look right",
    poseIdle: "Idle",
    poseWalk: "Walking",
    poseSit: "Sitting",
    poseCombat: "Combat",
    tabCostumes: "Costume Items",
    tabHairAndColors: "Hair & Colors",
    searchPlaceholder: "Search costume by name or ID...",
    hairStyle: "Hair Style",
    hairColor: "Hair Color",
    clothesColor: "Outfit Color (Body Palette)",
    slotTop: "Top",
    slotMid: "Mid",
    slotLow: "Low",
    slotGarment: "Garment",
    equippedSlotsHeader: "Equipped Costumes",
    noItemFound: "No costume item found.",
  },
  es: {
    modalTitle: "Probador Visual",
    cancel: "Cancelar",
    save: "Guardar",
    reset: "Restaurar por Defecto",
    alsoEquipCostume: "Equipar en pestaña Especial (Costumes)",
    genderMasc: "♂ Masc",
    genderFem: "♀ Fem",
    outfitAlt: "Traje: Alternativo (jRO)",
    outfitDefault: "Traje: Estándar (kRO)",
    rotateLeft: "Girar a la izquierda",
    rotateRight: "Girar a la derecha",
    dirFront: "Frente",
    dirLeft: "Izq.",
    dirBack: "Espalda",
    dirRight: "Der.",
    headLookLeft: "Mirar a la izquierda",
    headLookFront: "Mirar al frente",
    headLookRight: "Mirar a la derecha",
    poseIdle: "Parado",
    poseWalk: "Caminando",
    poseSit: "Sentado",
    poseCombat: "Combate",
    tabCostumes: "Visuales & Costumes",
    tabHairAndColors: "Cabello & Colores",
    searchPlaceholder: "Buscar visual por nombre o ID...",
    hairStyle: "Estilo de Cabello",
    hairColor: "Color del Cabello",
    clothesColor: "Color de la Ropa (Paleta del Cuerpo)",
    slotTop: "Cabeza Arriba",
    slotMid: "Cabeza Medio",
    slotLow: "Cabeza Abajo",
    slotGarment: "Capa",
    equippedSlotsHeader: "Visuales en el Maniquí",
    noItemFound: "No se encontraron visuales.",
  },
} as const;

export function CalculatorCharacterCustomizerModal({
  classNameLabel,
  canonicalSpriteClassId,
  defaultSpec,
  initialConfig,
  equippedVisualItemIds,
  viewMap,
  onClose,
  onSave,
}: CalculatorCharacterCustomizerModalProps) {
  const { locale } = useNightmareLocale();
  const t = I18N_CUSTOMIZER[locale] ?? I18N_CUSTOMIZER.pt;

  // Draft state — isolated until the user clicks "Salvar"
  const [draft, setDraft] = useState<CharacterAppearanceConfig>(() => ({
    ...initialConfig,
    bodyDirection: initialConfig.bodyDirection ?? 0,
    visualTopItemId:
      initialConfig.visualTopItemId ?? (equippedVisualItemIds.top || null),
    visualMidItemId:
      initialConfig.visualMidItemId ?? (equippedVisualItemIds.mid || null),
    visualLowItemId:
      initialConfig.visualLowItemId ?? (equippedVisualItemIds.low || null),
    visualGarmentItemId:
      initialConfig.visualGarmentItemId ??
      (equippedVisualItemIds.garment || null),
  }));

  const [mainTab, setMainTab] = useState<"items" | "style">("items");
  const [activeSlotTab, setActiveSlotTab] = useState<VisualSlotTab>("top");
  const [searchQuery, setSearchQuery] = useState("");
  const [slotItems, setSlotItems] = useState<CalculatorItemIndexOption[]>([]);
  const [isLoadingItems, setIsLoadingItems] = useState(false);
  const [alsoEquipCostumeSlots, setAlsoEquipCostumeSlots] = useState(true);
  const [previewAction, setPreviewAction] = useState<number>(
    initialConfig.isWalking ? 8 : 0,
  );

  // Load items with valid visual sprites for the selected slot tab
  useEffect(() => {
    let active = true;
    setIsLoadingItems(true);

    const categoriesToFetch =
      activeSlotTab === "top"
        ? ["costumeHeadTop", "headTop"]
        : activeSlotTab === "mid"
          ? ["costumeHeadMid", "headMid"]
          : activeSlotTab === "low"
            ? ["costumeHeadLow", "headLow"]
            : ["costumeGarment", "garment"];

    Promise.all(categoriesToFetch.map((cat) => fetchItemCategory(cat)))
      .then((lists) => {
        if (!active) return;
        const mergedMap = new Map<number, CalculatorItemIndexOption>();
        for (const list of lists) {
          for (const item of list) {
            const hasView =
              activeSlotTab === "garment"
                ? Boolean(viewMap.garment[String(item.id)])
                : Boolean(viewMap.headgear[String(item.id)]);
            if (hasView && !mergedMap.has(item.id)) {
              mergedMap.set(item.id, item);
            }
          }
        }
        setSlotItems(Array.from(mergedMap.values()));
        setIsLoadingItems(false);
      })
      .catch(() => {
        if (active) setIsLoadingItems(false);
      });

    return () => {
      active = false;
    };
  }, [activeSlotTab, viewMap]);

  const filteredItems = useMemo(() => {
    const q = searchQuery.trim().toLowerCase();
    if (!q) return slotItems.slice(0, 120);
    return slotItems
      .filter(
        (item) =>
          item.name.toLowerCase().includes(q) ||
          (item.sourceName?.toLowerCase().includes(q) ?? false) ||
          String(item.id).includes(q),
      )
      .slice(0, 120);
  }, [slotItems, searchQuery]);

  const effectiveGender = draft.gender ?? defaultSpec.gender;
  const effectiveHead =
    canonicalSpriteClassId === "Spirit_Handler"
      ? 1
      : (draft.head ?? defaultSpec.head);

  const previewViewIds = useMemo(() => {
    const topId = draft.visualTopItemId ?? 0;
    const midId = draft.visualMidItemId ?? 0;
    const lowId = draft.visualLowItemId ?? 0;
    const garmentId = draft.visualGarmentItemId ?? 0;

    return {
      top: topId ? (viewMap.headgear[String(topId)] ?? 0) : 0,
      mid: midId ? (viewMap.headgear[String(midId)] ?? 0) : 0,
      low: lowId ? (viewMap.headgear[String(lowId)] ?? 0) : 0,
      garment: garmentId ? (viewMap.garment[String(garmentId)] ?? 0) : 0,
    };
  }, [
    draft.visualTopItemId,
    draft.visualMidItemId,
    draft.visualLowItemId,
    draft.visualGarmentItemId,
    viewMap,
  ]);

  const previewSpriteUrl = useMemo(() => {
    const baseAction = previewAction;
    const bodyDir = draft.bodyDirection ?? 0;

    const params = new URLSearchParams({
      job: defaultSpec.jobId,
      gender: String(effectiveGender),
      head: String(effectiveHead),
      headPalette: String(draft.headPalette),
      bodyPalette: String(draft.bodyPalette),
      headdir: String(draft.headdir),
      action: String(baseAction + bodyDir),
      outfit: String(draft.outfit),
      top: String(previewViewIds.top),
      mid: String(previewViewIds.mid),
      low: String(previewViewIds.low),
      garment: String(previewViewIds.garment),
    });
    return `/api/character-render?${params.toString()}`;
  }, [
    defaultSpec.jobId,
    effectiveGender,
    effectiveHead,
    draft.headPalette,
    draft.bodyPalette,
    draft.headdir,
    draft.bodyDirection,
    previewAction,
    draft.outfit,
    previewViewIds,
  ]);
    effectiveHead,
    draft.headPalette,
    draft.bodyPalette,
    draft.headdir,
    previewAction,
    draft.outfit,
    previewViewIds,
  ]);

  function handleSelectVisualItem(itemId: number) {
    setDraft((prev) => {
      if (activeSlotTab === "top") {
        return {
          ...prev,
          visualTopItemId: prev.visualTopItemId === itemId ? 0 : itemId,
        };
      }
      if (activeSlotTab === "mid") {
        return {
          ...prev,
          visualMidItemId: prev.visualMidItemId === itemId ? 0 : itemId,
        };
      }
      if (activeSlotTab === "low") {
        return {
          ...prev,
          visualLowItemId: prev.visualLowItemId === itemId ? 0 : itemId,
        };
      }
      return {
        ...prev,
        visualGarmentItemId: prev.visualGarmentItemId === itemId ? 0 : itemId,
      };
    });
  }

  function handleResetDraft() {
    setDraft({
      gender: null,
      head: null,
      headPalette: 1,
      bodyPalette: -1,
      outfit: 0,
      headdir: 0,
      bodyDirection: 0,
      isWalking: false,
      visualTopItemId: equippedVisualItemIds.top || null,
      visualMidItemId: equippedVisualItemIds.mid || null,
      visualLowItemId: equippedVisualItemIds.low || null,
      visualGarmentItemId: equippedVisualItemIds.garment || null,
    });
    setPreviewAction(0);
  }

  const activeDraftItemIdForTab =
    activeSlotTab === "top"
      ? draft.visualTopItemId
      : activeSlotTab === "mid"
        ? draft.visualMidItemId
        : activeSlotTab === "low"
          ? draft.visualLowItemId
          : draft.visualGarmentItemId;

  return (
    <Modal
      ariaLabel={t.modalTitle}
      icon={<Palette size={17} className="text-sky-400" />}
      title={t.modalTitle}
      meta={
        <span className="text-xs font-mono text-sky-300 font-bold">
          {classNameLabel}
        </span>
      }
      size="lg"
      onClose={onClose}
    >
      <div className="flex flex-col gap-5 pt-2">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 items-stretch">
          {/* LEFT COLUMN (5 COLS): LARGE LIVE MANNEQUIN PREVIEW STAGE */}
          <div className="lg:col-span-5 flex flex-col justify-between gap-4 rounded-2xl border border-white/10 bg-gradient-to-b from-[#141926] via-[#0d1017] to-[#090b10] p-4 relative overflow-hidden">
            {/* Top Stage Bar: Gender & Outfit */}
            <div className="flex items-center justify-between gap-2 z-10">
              <div className="inline-flex items-center gap-1 rounded-lg bg-[#090b10] border border-white/10 p-1">
                <button
                  type="button"
                  onClick={() => setDraft((d) => ({ ...d, gender: 1 }))}
                  className={`px-2.5 py-1 rounded-md text-xs font-bold transition-colors cursor-pointer ${
                    effectiveGender === 1
                      ? "bg-sky-500/20 text-sky-200 border border-sky-400/35"
                      : "text-slate-400 hover:text-slate-200"
                  }`}
                >
                  {t.genderMasc}
                </button>
                <button
                  type="button"
                  onClick={() => setDraft((d) => ({ ...d, gender: 0 }))}
                  className={`px-2.5 py-1 rounded-md text-xs font-bold transition-colors cursor-pointer ${
                    effectiveGender === 0
                      ? "bg-sky-500/20 text-sky-200 border border-sky-400/35"
                      : "text-slate-400 hover:text-slate-200"
                  }`}
                >
                  {t.genderFem}
                </button>
              </div>

              <button
                type="button"
                onClick={() =>
                  setDraft((d) => ({ ...d, outfit: d.outfit === 0 ? 1 : 0 }))
                }
                className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg border text-xs font-bold transition-colors cursor-pointer ${
                  draft.outfit === 1
                    ? "bg-amber-500/20 text-amber-200 border-amber-400/40"
                    : "bg-[#090b10] text-slate-300 border-white/10 hover:border-white/25"
                }`}
              >
                <Shirt size={13} />
                <span>
                  {draft.outfit === 1 ? t.outfitAlt : t.outfitDefault}
                </span>
              </button>
            </div>

            {/* Big Character Render Stage with 360° Body Rotation & Head Controls */}
            <div className="relative flex-1 min-h-[270px] flex items-center justify-center rounded-xl border border-white/[0.06] bg-[#090b10]/60 overflow-hidden">
              {/* Floating Full Body Rotation Arrows (360°) */}
              <button
                type="button"
                onClick={() =>
                  setDraft((d) => ({
                    ...d,
                    bodyDirection: (((d.bodyDirection ?? 0) + 1) % 8),
                  }))
                }
                title={t.rotateLeft}
                className="absolute left-2.5 top-1/2 -translate-y-1/2 z-20 w-8 h-8 rounded-full bg-[#090b10]/85 hover:bg-[#090b10] border border-white/20 hover:border-sky-400 text-slate-300 hover:text-sky-200 flex items-center justify-center transition-all cursor-pointer shadow-lg backdrop-blur-sm"
              >
                <ChevronLeft size={17} />
              </button>

              <button
                type="button"
                onClick={() =>
                  setDraft((d) => ({
                    ...d,
                    bodyDirection: (((d.bodyDirection ?? 0) - 1 + 8) % 8),
                  }))
                }
                title={t.rotateRight}
                className="absolute right-2.5 top-1/2 -translate-y-1/2 z-20 w-8 h-8 rounded-full bg-[#090b10]/85 hover:bg-[#090b10] border border-white/20 hover:border-sky-400 text-slate-300 hover:text-sky-200 flex items-center justify-center transition-all cursor-pointer shadow-lg backdrop-blur-sm"
              >
                <ChevronRight size={17} />
              </button>

              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                key={previewSpriteUrl}
                src={previewSpriteUrl}
                alt={classNameLabel}
                className="h-[220px] w-auto object-contain scale-[1.55] -translate-y-4 [image-rendering:pixelated] drop-shadow-[0_16px_28px_rgba(0,0,0,0.85)] select-none"
                onError={(e) => {
                  const img = e.target as HTMLImageElement;
                  const fallback = `/sprites/classes/${canonicalSpriteClassId}.png`;
                  if (!img.src.endsWith(fallback)) {
                    img.src = fallback;
                  }
                }}
              />

              {/* Bottom Controls Overlay: Poses & Direction Shortcuts */}
              <div className="absolute bottom-2 inset-x-2 flex flex-col gap-1.5 z-20">
                {/* Pose Selector Row */}
                <div className="flex items-center justify-center gap-1 rounded-lg bg-[#0d1017]/95 border border-white/10 p-1">
                  {(
                    [
                      { action: 0, label: t.poseIdle },
                      { action: 8, label: t.poseWalk },
                      { action: 16, label: t.poseSit },
                      { action: 40, label: t.poseCombat },
                    ] as const
                  ).map((pose) => {
                    const active = previewAction === pose.action;
                    return (
                      <button
                        key={pose.action}
                        type="button"
                        onClick={() => {
                          setPreviewAction(pose.action);
                          setDraft((d) => ({
                            ...d,
                            isWalking: pose.action === 8,
                          }));
                        }}
                        className={`flex-1 py-1 rounded text-[10px] font-mono font-bold transition-colors cursor-pointer ${
                          active
                            ? "bg-sky-500/20 text-sky-200 border border-sky-400/35"
                            : "text-slate-400 hover:text-slate-200"
                        }`}
                      >
                        {pose.label}
                      </button>
                    );
                  })}
                </div>

                {/* Body Direction Shortcuts + Head Turn Controls */}
                <div className="flex items-center justify-between gap-1.5">
                  {/* Body Directions */}
                  <div className="inline-flex items-center gap-1 rounded-lg bg-[#0d1017]/95 border border-white/10 p-1 flex-1">
                    {(
                      [
                        { dir: 0, label: t.dirFront },
                        { dir: 2, label: t.dirLeft },
                        { dir: 4, label: t.dirBack },
                        { dir: 6, label: t.dirRight },
                      ] as const
                    ).map((bd) => {
                      const isSelected = (draft.bodyDirection ?? 0) === bd.dir;
                      return (
                        <button
                          key={bd.dir}
                          type="button"
                          onClick={() =>
                            setDraft((d) => ({ ...d, bodyDirection: bd.dir }))
                          }
                          className={`flex-1 py-1 rounded text-[9.5px] font-mono font-bold transition-colors cursor-pointer ${
                            isSelected
                              ? "bg-sky-500/20 text-sky-200 border border-sky-400/35"
                              : "text-slate-400 hover:text-slate-200"
                          }`}
                        >
                          {bd.label}
                        </button>
                      );
                    })}
                  </div>

                  {/* Head Direction: Left = 2, Center = 0, Right = 1 */}
                  <div className="inline-flex items-center gap-1 rounded-lg bg-[#0d1017]/95 border border-white/10 p-1 shrink-0">
                    {(
                      [
                        { dir: 2, label: "↰", title: t.headLookLeft },
                        { dir: 0, label: "↓", title: t.headLookFront },
                        { dir: 1, label: "↱", title: t.headLookRight },
                      ] as const
                    ).map((d) => (
                      <button
                        key={d.dir}
                        type="button"
                        onClick={() =>
                          setDraft((prev) => ({ ...prev, headdir: d.dir }))
                        }
                        title={d.title}
                        className={`w-6 h-6 rounded text-[11px] font-mono font-bold transition-colors cursor-pointer ${
                          draft.headdir === d.dir
                            ? "bg-sky-500/20 text-sky-200 border border-sky-400/35"
                            : "text-slate-400 hover:text-slate-200"
                        }`}
                      >
                        {d.label}
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            </div>

            {/* Currently Previewed Visual Slots Strip */}
            <div className="flex flex-col gap-1.5">
              <span className="text-[10px] font-mono uppercase tracking-wider text-slate-400 font-bold">
                {t.equippedSlotsHeader}
              </span>
              <div className="grid grid-cols-4 gap-2">
                {(
                  [
                    {
                      key: "top" as const,
                      label: t.slotTop,
                      itemId: draft.visualTopItemId,
                      clear: () =>
                        setDraft((d) => ({ ...d, visualTopItemId: 0 })),
                    },
                    {
                      key: "mid" as const,
                      label: t.slotMid,
                      itemId: draft.visualMidItemId,
                      clear: () =>
                        setDraft((d) => ({ ...d, visualMidItemId: 0 })),
                    },
                    {
                      key: "low" as const,
                      label: t.slotLow,
                      itemId: draft.visualLowItemId,
                      clear: () =>
                        setDraft((d) => ({ ...d, visualLowItemId: 0 })),
                    },
                    {
                      key: "garment" as const,
                      label: t.slotGarment,
                      itemId: draft.visualGarmentItemId,
                      clear: () =>
                        setDraft((d) => ({ ...d, visualGarmentItemId: 0 })),
                    },
                  ] as const
                      itemId: draft.visualTopItemId,
                      clear: () =>
                        setDraft((d) => ({ ...d, visualTopItemId: 0 })),
                    },
                    {
                      key: "mid" as const,
                      label: "Meio",
                      itemId: draft.visualMidItemId,
                      clear: () =>
                        setDraft((d) => ({ ...d, visualMidItemId: 0 })),
                    },
                    {
                      key: "low" as const,
                      label: "Baixo",
                      itemId: draft.visualLowItemId,
                      clear: () =>
                        setDraft((d) => ({ ...d, visualLowItemId: 0 })),
                    },
                    {
                      key: "garment" as const,
                      label: "Capa",
                      itemId: draft.visualGarmentItemId,
                      clear: () =>
                        setDraft((d) => ({ ...d, visualGarmentItemId: 0 })),
                    },
                  ] as const
                ).map((slot) => {
                  const isActiveSlot =
                    mainTab === "items" && activeSlotTab === slot.key;
                  return (
                    <div
                      key={slot.key}
                      onClick={() => {
                        setMainTab("items");
                        setActiveSlotTab(slot.key);
                      }}
                      className={`relative flex flex-col items-center justify-center gap-1 rounded-xl p-2 border transition-all cursor-pointer ${
                        isActiveSlot
                          ? "bg-sky-500/15 border-sky-400/50"
                          : "bg-[#090b10] border-white/10 hover:border-white/25"
                      }`}
                    >
                      {slot.itemId && slot.itemId > 0 ? (
                        <>
                          <button
                            type="button"
                            onClick={(e) => {
                              e.stopPropagation();
                              slot.clear();
                            }}
                            title="Remover visual deste slot"
                            className="absolute top-1 right-1 p-0.5 rounded bg-[#121620] text-slate-400 hover:text-rose-300 cursor-pointer"
                          >
                            <X size={10} />
                          </button>
                          <CalculatorItemIcon itemId={slot.itemId} size={24} />
                          <span className="text-[9px] font-mono text-sky-200 font-bold">
                            {slot.label}
                          </span>
                        </>
                      ) : (
                        <>
                          <div className="h-6 w-6 rounded-md border border-dashed border-white/15 flex items-center justify-center text-[9px] text-slate-500 font-mono">
                            —
                          </div>
                          <span className="text-[9px] font-mono text-slate-500">
                            {slot.label}
                          </span>
                        </>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          </div>

          {/* RIGHT COLUMN (7 COLS): CATALOG OF VISUAL ITEMS & HAIR/COLOR CUSTOMIZER */}
          <div className="lg:col-span-7 flex flex-col justify-between gap-4 rounded-2xl border border-white/10 bg-[#0d1017] p-4 min-h-[430px]">
            {/* Top Mode Tabs */}
            <div className="flex flex-col gap-3">
              <div className="grid grid-cols-2 gap-1.5 rounded-xl bg-[#090b10] border border-white/10 p-1">
                <button
                  type="button"
                  onClick={() => setMainTab("items")}
                  className={`inline-flex items-center justify-center gap-2 py-2 px-3 rounded-lg text-xs font-bold transition-colors cursor-pointer ${
                    mainTab === "items"
                      ? "bg-sky-500/20 text-sky-100 border border-sky-400/35"
                      : "text-slate-400 hover:text-slate-200 border border-transparent"
                  }`}
                >
                  <Sparkles size={14} className="text-amber-400" />
                  <span>{t.tabCostumes}</span>
                </button>
                <button
                  type="button"
                  onClick={() => setMainTab("style")}
                  className={`inline-flex items-center justify-center gap-2 py-2 px-3 rounded-lg text-xs font-bold transition-colors cursor-pointer ${
                    mainTab === "style"
                      ? "bg-sky-500/20 text-sky-100 border border-sky-400/35"
                      : "text-slate-400 hover:text-slate-200 border border-transparent"
                  }`}
                >
                  <Palette size={14} className="text-sky-400" />
                  <span>
                    {t.tabHairAndColors} (#{effectiveHead})
                  </span>
                </button>
              </div>

              {mainTab === "items" ? (
                <div className="flex flex-col gap-3">
                  {/* Slot Switcher + Search Input */}
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                    <div className="inline-flex items-center gap-1 rounded-lg bg-[#090b10] border border-white/[0.08] p-1">
                      {(
                        [
                          { id: "top" as const, label: t.slotTop },
                          { id: "mid" as const, label: t.slotMid },
                          { id: "low" as const, label: t.slotLow },
                          { id: "garment" as const, label: t.slotGarment },
                        ] as const
                      ).map((tab) => (
                        <button
                          key={tab.id}
                          type="button"
                          onClick={() => setActiveSlotTab(tab.id)}
                          className={`px-3 py-1 rounded-md text-xs font-bold transition-colors cursor-pointer ${
                            activeSlotTab === tab.id
                              ? "bg-sky-500/20 text-sky-200 border border-sky-400/35"
                              : "text-slate-400 hover:text-slate-200"
                          }`}
                        >
                          {tab.label}
                        </button>
                      ))}
                    </div>

                    <div className="relative flex-1">
                      <Search
                        size={13}
                        className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500 pointer-events-none"
                      />
                      <input
                        type="search"
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        placeholder={t.searchPlaceholder}
                        className="w-full h-8 pl-8 pr-3 rounded-lg bg-[#090b10] border border-white/10 text-xs text-slate-100 placeholder:text-slate-500 focus:outline-none focus:border-sky-400/50"
                      />
                    </div>
                  </div>

                  {/* Items Visual Grid */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 max-h-[300px] overflow-y-auto custom-scrollbar pr-1">
                    {isLoadingItems ? (
                      <div className="col-span-2 py-12 text-center text-xs text-slate-400 font-mono">
                        ...
                      </div>
                    ) : filteredItems.length === 0 ? (
                      <div className="col-span-2 py-12 text-center text-xs text-slate-500">
                        {t.noItemFound}
                      </div>
                    ) : (
                      filteredItems.map((item) => {
                        const isSelected = activeDraftItemIdForTab === item.id;
                        return (
                          <button
                            key={item.id}
                            type="button"
                            onClick={() => handleSelectVisualItem(item.id)}
                            className={`flex items-center gap-2.5 p-2 rounded-xl border text-left transition-all cursor-pointer min-w-0 ${
                              isSelected
                                ? "bg-sky-500/20 border-sky-400/50 text-sky-100 shadow-[0_0_14px_rgba(14,165,233,0.18)]"
                                : "bg-[#121620] border-white/[0.08] hover:border-white/20 hover:bg-[#171c28] text-slate-200"
                            }`}
                          >
                            <div className="shrink-0 p-1 rounded-lg bg-[#090b10] border border-white/10">
                              <CalculatorItemIcon itemId={item.id} size={26} />
                            </div>
                            <div className="flex flex-col min-w-0 flex-1">
                              <strong className="text-xs font-bold truncate">
                                {getShortItemName(item.name)}
                              </strong>
                              <span className="text-[10px] font-mono text-slate-400 truncate">
                                ID #{item.id}
                              </span>
                            </div>
                            {isSelected && (
                              <Check
                                size={14}
                                className="text-sky-300 shrink-0"
                              />
                            )}
                          </button>
                        );
                      })
                    )}
                  </div>
                </div>
              ) : (
                /* STYLE TAB: HAIR STYLE, HAIR COLOR & CLOTHES COLOR */
                <div className="flex flex-col gap-4 max-h-[340px] overflow-y-auto custom-scrollbar pr-1">
                  {/* Hair Styles Grid (#1..#32) */}
                  <div className="flex flex-col gap-2">
                    <span className="text-xs font-bold text-slate-300">
                      {t.hairStyle} (#1 a #32)
                    </span>
                    <div className="grid grid-cols-8 gap-1.5">
                      {Array.from({ length: 32 }, (_, i) => i + 1).map(
                        (hairId) => {
                          const isSelected = effectiveHead === hairId;
                          return (
                            <button
                              key={hairId}
                              type="button"
                              onClick={() =>
                                setDraft((d) => ({ ...d, head: hairId }))
                              }
                              className={`h-8 rounded-lg font-mono text-xs font-bold border transition-colors cursor-pointer ${
                                isSelected
                                  ? "bg-sky-500/25 text-sky-100 border-sky-400/50"
                                  : "bg-[#121620] text-slate-300 border-white/10 hover:border-white/25"
                              }`}
                            >
                              #{hairId}
                            </button>
                          );
                        },
                      )}
                    </div>
                  </div>

                  {/* Hair Color Swatches */}
                  <div className="flex flex-col gap-2">
                    <span className="text-xs font-bold text-slate-300">
                      {t.hairColor}
                    </span>
                    <div className="grid grid-cols-3 sm:grid-cols-5 gap-2">
                      {HAIR_COLOR_SWATCHES.map((swatch) => {
                        const isSelected = draft.headPalette === swatch.id;
                        return (
                          <button
                            key={swatch.id}
                            type="button"
                            onClick={() =>
                              setDraft((d) => ({
                                ...d,
                                headPalette: swatch.id,
                              }))
                            }
                            className={`flex items-center gap-2 px-2.5 py-1.5 rounded-lg border text-xs font-bold transition-colors cursor-pointer ${
                              isSelected
                                ? "bg-sky-500/20 text-sky-100 border-sky-400/50"
                                : "bg-[#121620] text-slate-300 border-white/10 hover:border-white/25"
                            }`}
                          >
                            <span
                              className="w-3.5 h-3.5 rounded-full border border-black/40 shrink-0"
                              style={{ backgroundColor: swatch.hex }}
                            />
                            <span className="truncate">{swatch.label}</span>
                          </button>
                        );
                      })}
                    </div>
                  </div>

                  {/* Body Clothes Palette */}
                  <div className="flex flex-col gap-2">
                    <span className="text-xs font-bold text-slate-300">
                      {t.clothesColor}
                    </span>
                    <div className="grid grid-cols-3 sm:grid-cols-5 gap-2">
                      {CLOTHES_PALETTES.map((pal) => {
                        const isSelected = draft.bodyPalette === pal.id;
                        return (
                          <button
                            key={pal.id}
                            type="button"
                            onClick={() =>
                              setDraft((d) => ({ ...d, bodyPalette: pal.id }))
                            }
                            className={`px-2.5 py-1.5 rounded-lg border text-xs font-mono font-bold transition-colors cursor-pointer ${
                              isSelected
                                ? "bg-sky-500/20 text-sky-100 border-sky-400/50"
                                : "bg-[#121620] text-slate-300 border-white/10 hover:border-white/25"
                            }`}
                          >
                            {pal.label}
                          </button>
                        );
                      })}
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Option to also equip chosen Costumes in Special tab */}
            <label className="flex items-center gap-2 text-xs text-slate-300 cursor-pointer select-none pt-2 border-t border-white/10">
              <input
                type="checkbox"
                checked={alsoEquipCostumeSlots}
                onChange={(e) => setAlsoEquipCostumeSlots(e.target.checked)}
                className="rounded border-white/20 bg-[#090b10] text-sky-500 focus:ring-0"
              />
              <span>
                {t.alsoEquipCostume}
              </span>
            </label>
          </div>
        </div>

        {/* MODAL FOOTER: RESET, CANCEL & SAVE */}
        <div className="flex flex-wrap items-center justify-between gap-3 pt-3 border-t border-white/10">
          <button
            type="button"
            onClick={handleResetDraft}
            className="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl border border-white/10 bg-[#121620] hover:bg-white/10 text-xs font-bold text-slate-300 transition-colors cursor-pointer"
          >
            <RotateCcw size={13} />
            <span>{t.reset}</span>
          </button>

          <div className="flex items-center gap-2.5">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-xl border border-white/10 bg-[#121620] hover:bg-white/10 text-xs font-bold text-slate-300 transition-colors cursor-pointer"
            >
              {t.cancel}
            </button>

            <button
              type="button"
              onClick={() => onSave(draft, alsoEquipCostumeSlots)}
              className="inline-flex items-center gap-2 px-5 py-2 rounded-xl bg-sky-500 hover:bg-sky-400 text-[#090b10] text-xs font-black shadow-[0_0_20px_rgba(14,165,233,0.3)] transition-all cursor-pointer"
            >
              <Check size={15} />
              <span>{t.save}</span>
            </button>
          </div>
        </div>
      </div>
    </Modal>
  );
}
