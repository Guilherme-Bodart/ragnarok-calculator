"use client";

import { useEffect, useMemo, useState } from "react";
import {
  ArrowDownToLine,
  Boxes,
  CopyPlus,
  Flame,
  FolderHeart,
  Save,
  Sparkles,
  Swords,
  Trash2,
} from "lucide-react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Modal } from "@/components/ui/modal";
import archMagePreset from "@/packages/calculator-core/src/reference-scenarios/guilh-arch-mage-build.json";
import {
  calculatorBuildPayloadVersion,
  type CalculatorBuildPayload,
} from "./calculator-build-payload";
import type { CalculatorDictionary } from "./calculator-i18n";
import {
  deleteCalculatorAccountBuild,
  listCalculatorAccountBuilds,
  saveCalculatorAccountBuild,
  updateCalculatorAccountBuild,
  type CalculatorAccountBuild,
} from "./calculator-build-api";
import { CalculatorItemIcon } from "./calculator-item-icon";
import { calculatorSkillTreeClassGroups } from "./calculator-skill-tree-data";

type CalculatorBuildsModalProps = {
  copy: CalculatorDictionary;
  currentBuild: CalculatorBuildPayload;
  onClose: () => void;
  onLoadBuild: (build: CalculatorBuildPayload) => void;
  onMarkAsSaved: () => void;
  onRenameBuild: (name: string) => void;
};

type GalleryBuildEntry = {
  id: string;
  name: string;
  classId: string;
  source: "preset" | "account" | "local";
  updatedAt: string;
  description?: string;
  payload: CalculatorBuildPayload;
};

const LOCAL_GALLERY_STORAGE_KEY = "nightmare-calculator-saved-builds-v1";

const PRESET_BUILDS: GalleryBuildEntry[] = [
  {
    id: "preset-arch-mage-svs",
    name: "Arch Mage — Soul Vulcan Strike",
    classId: "Arch_Mage",
    source: "preset",
    updatedAt: "Build de Referência • Endgame",
    description:
      "Build mágica focada em Fantasma (Soul Vulcan Strike) com conjunto Celine, Temporal e Shadow Gear mágico.",
    payload: {
      ...(archMagePreset as unknown as CalculatorBuildPayload),
      name: "Arch Mage — Soul Vulcan Strike",
      target: { selectedMonsterId: 21065 },
    },
  },
  {
    id: "preset-dragon-knight-breath",
    name: "Dragon Knight — Hack & Slasher",
    classId: "Dragon_Knight",
    source: "preset",
    updatedAt: "Build de Referência • Físico Crit/POW",
    description:
      "Distribuição ofensiva de 4ª classe com foco em POW/CRT máximo para testar armas de duas mãos e dano físico.",
    payload: {
      version: calculatorBuildPayloadVersion,
      name: "Dragon Knight — Hack & Slasher",
      character: {
        selectedClassId: "Dragon_Knight",
        baseLevel: 250,
        jobLevel: 50,
        stats: {
          str: 130,
          agi: 100,
          vit: 105,
          int: 40,
          dex: 100,
          luk: 120,
          pow: 110,
          sta: 0,
          wis: 0,
          spl: 0,
          con: 53,
          crt: 100,
        },
      },
      attack: {
        selectedSkillId: "DK_HACKANDSLASHER",
        skillLevel: 10,
      },
      tree: {
        learnedSkills: {
          DK_DRAGONIC_AURA: 10,
          RK_ENCHANTBLADE: 10,
          LK_AURABLADE: 5,
        },
      },
      equipment: {
        itemContexts: { "21047": { refine: 12, grade: 4 } },
        selectedCardsBySlot: {},
        selectedItemsBySlot: {
          weapon: 21047,
          headTop: 19300,
        },
      },
      buffs: {
        activeBuffs: {},
        selectedBuffId: "",
      },
      target: {
        selectedMonsterId: 21065,
      },
    },
  },
  {
    id: "preset-shadow-cross-crit",
    name: "Shadow Cross — Savage Impact",
    classId: "Shadow_Cross",
    source: "preset",
    updatedAt: "Build de Referência • Crítico / Katar",
    description:
      "Assassino de 4ª classe otimizado para multiplicador crítico (CRT/POW) com encantamento de veneno mortal.",
    payload: {
      version: calculatorBuildPayloadVersion,
      name: "Shadow Cross — Savage Impact",
      character: {
        selectedClassId: "Shadow_Cross",
        baseLevel: 250,
        jobLevel: 50,
        stats: {
          str: 130,
          agi: 120,
          vit: 95,
          int: 20,
          dex: 90,
          luk: 125,
          pow: 110,
          sta: 0,
          wis: 0,
          spl: 0,
          con: 53,
          crt: 100,
        },
      },
      attack: {
        selectedSkillId: "SHC_SAVAGE_IMPACT",
        skillLevel: 10,
      },
      tree: {
        learnedSkills: {
          ASC_EDP: 5,
          SHC_POTENT_VENOM: 10,
          SHC_SHADOW_EXCEED: 10,
        },
      },
      equipment: {
        itemContexts: {},
        selectedCardsBySlot: {},
        selectedItemsBySlot: {},
      },
      buffs: {
        activeBuffs: { ASC_EDP: 5 },
        selectedBuffId: "",
      },
      target: {
        selectedMonsterId: 21065,
      },
    },
  },
];

function readLocalGalleryBuilds(): GalleryBuildEntry[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = window.localStorage.getItem(LOCAL_GALLERY_STORAGE_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

function writeLocalGalleryBuilds(entries: GalleryBuildEntry[]) {
  if (typeof window === "undefined") return;
  try {
    window.localStorage.setItem(
      LOCAL_GALLERY_STORAGE_KEY,
      JSON.stringify(entries),
    );
  } catch {
    // Ignore storage quota errors
  }
}

function getCanonicalSpriteId(classId: string): string {
  return classId.replace(/_T2$/, "").replace(/_T$/, "").replace(/2$/, "");
}

function formatSkillName(skillId: string): string {
  return skillId
    .replace(/^(AG|DK|IG|SHC|ABC|EM|CD|IQ|WH|TR|MT|BO|HN|SH|SKE|SOA|SKR|SRN|NW|RK|WL|RA|AB|NC|GC|RG|SO|MI|WA|SR|GN|SC)_/, "")
    .replace(/_/g, " ");
}

export function CalculatorBuildsModal({
  copy,
  currentBuild,
  onClose,
  onLoadBuild,
  onMarkAsSaved,
  onRenameBuild,
}: CalculatorBuildsModalProps) {
  const t = copy.builds;
  const queryClient = useQueryClient();
  const [activeTab, setActiveTab] = useState<"all" | "saved" | "presets">("all");
  const [message, setMessage] = useState("");
  const [selectedBuildId, setSelectedBuildId] = useState<string | null>(null);
  const [localBuilds, setLocalBuilds] = useState<GalleryBuildEntry[]>([]);

  useEffect(() => {
    setLocalBuilds(readLocalGalleryBuilds());
  }, []);

  const classDisplayNames = useMemo(() => {
    const map = new Map<string, string>();
    for (const group of calculatorSkillTreeClassGroups) {
      for (const opt of group.options) {
        map.set(opt.id, opt.name);
      }
    }
    return map;
  }, []);

  const { data: accountBuildsData, isLoading, error } = useQuery({
    queryKey: ["calculator-builds"],
    queryFn: async () => {
      const result = await listCalculatorAccountBuilds();
      if (result.status === "unauthenticated") {
        throw new CalculatorBuildsUnauthenticatedError();
      }
      return result.builds;
    },
    retry: false,
  });

  const isAuthenticated = !(error instanceof CalculatorBuildsUnauthenticatedError);

  const accountGalleryEntries: GalleryBuildEntry[] = useMemo(
    () =>
      (accountBuildsData ?? []).map((b) => ({
        id: b.id,
        name: b.name,
        classId: b.classId,
        source: "account" as const,
        updatedAt: formatBuildDate(b.updatedAt),
        payload: b.payload,
      })),
    [accountBuildsData],
  );

  const visibleEntries = useMemo(() => {
    if (activeTab === "presets") return PRESET_BUILDS;
    if (activeTab === "saved") return [...accountGalleryEntries, ...localBuilds];
    return [...accountGalleryEntries, ...localBuilds, ...PRESET_BUILDS];
  }, [activeTab, accountGalleryEntries, localBuilds]);

  const createMutation = useMutation({
    mutationFn: (payload: CalculatorBuildPayload) =>
      saveCalculatorAccountBuild(payload),
    onSuccess: (savedBuild) => {
      queryClient.setQueryData<CalculatorAccountBuild[]>(
        ["calculator-builds"],
        (old) => (old ? [savedBuild, ...old] : [savedBuild]),
      );
      setSelectedBuildId(savedBuild.id);
      setMessage("Build salva na sua conta com sucesso!");
      onMarkAsSaved();
    },
    onError: () => {
      // Fallback to local gallery if unauthenticated or offline
      saveToLocalGallery(currentBuild);
    },
  });

  const updateMutation = useMutation({
    mutationFn: ({
      id,
      payload,
    }: {
      id: string;
      payload: CalculatorBuildPayload;
    }) => updateCalculatorAccountBuild(id, payload),
    onSuccess: (updatedBuild) => {
      queryClient.setQueryData<CalculatorAccountBuild[]>(
        ["calculator-builds"],
        (old) =>
          old
            ? old.map((b) => (b.id === updatedBuild.id ? updatedBuild : b))
            : [updatedBuild],
      );
      setMessage(t.updatedMessage);
      onMarkAsSaved();
    },
    onError: (err: Error) => setMessage(err.message || t.updateError),
  });

  const deleteMutation = useMutation({
    mutationFn: (id: string) => deleteCalculatorAccountBuild(id),
    onSuccess: (_, deletedId) => {
      queryClient.setQueryData<CalculatorAccountBuild[]>(
        ["calculator-builds"],
        (old) => (old ? old.filter((b) => b.id !== deletedId) : []),
      );
      if (selectedBuildId === deletedId) {
        setSelectedBuildId(null);
      }
      setMessage(t.deletedMessage);
    },
    onError: () => setMessage(t.deleteError),
  });

  function saveToLocalGallery(payload: CalculatorBuildPayload) {
    const cloned = cloneBuildPayload(payload);
    const entry: GalleryBuildEntry = {
      id: `local-${Date.now()}`,
      name: cloned.name || "Nova Build",
      classId: cloned.character.selectedClassId,
      source: "local",
      updatedAt: formatBuildDate(new Date().toISOString()),
      payload: cloned,
    };
    const next = [entry, ...localBuilds];
    setLocalBuilds(next);
    writeLocalGalleryBuilds(next);
    setSelectedBuildId(entry.id);
    setMessage("Build salva na sua galeria local!");
    onMarkAsSaved();
  }

  function handleSaveNewBuild() {
    setMessage("");
    if (isAuthenticated && !error) {
      createMutation.mutate(currentBuild);
    } else {
      saveToLocalGallery(currentBuild);
    }
  }

  function handleImportBuild(entry: GalleryBuildEntry) {
    const cloned = cloneBuildPayload(entry.payload);
    onLoadBuild(cloned);
    setSelectedBuildId(entry.id);
    onClose();
  }

  function handleDuplicateBuild(entry: GalleryBuildEntry) {
    const cloned = cloneBuildPayload(entry.payload);
    cloned.name = `${entry.name} (Cópia)`;
    if (isAuthenticated && !error) {
      createMutation.mutate(cloned);
    } else {
      saveToLocalGallery(cloned);
    }
  }

  function handleDeleteEntry(entry: GalleryBuildEntry) {
    if (entry.source === "account") {
      deleteMutation.mutate(entry.id);
      return;
    }
    if (entry.source === "local") {
      const next = localBuilds.filter((b) => b.id !== entry.id);
      setLocalBuilds(next);
      writeLocalGalleryBuilds(next);
      setMessage("Build removida da galeria local.");
    }
  }

  return (
    <Modal
      ariaLabel={t.aria}
      size="xl"
      closeLabel={t.closeAction}
      icon={<Boxes size={17} className="text-sky-400" />}
      title="Galeria & Importação de Builds"
      meta="Escolha um card para importar na calculadora e testar o dano em tempo real, ou salve sua build atual"
      onClose={onClose}
      className="bg-[#0c0f17]/98 border-white/10 backdrop-blur-2xl shadow-2xl"
    >
      <div className="flex flex-col gap-4">
        {/* Top Bar: Save Current Build as a Card */}
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-3 p-3.5 rounded-xl bg-[#121621] border border-white/8">
          <div className="flex-1 min-w-0">
            <label className="block text-[10px] font-black uppercase tracking-widest text-slate-400 mb-1.5">
              Build Ativa na Calculadora ({classDisplayNames.get(currentBuild.character.selectedClassId) ?? currentBuild.character.selectedClassId.replace(/_/g, " ")}{" "}
              Lv.{currentBuild.character.baseLevel}/{currentBuild.character.jobLevel})
            </label>
            <input
              type="text"
              maxLength={80}
              value={currentBuild.name}
              onChange={(event) => onRenameBuild(event.target.value)}
              placeholder="Nome da sua build..."
              className="w-full h-9 px-3 rounded-lg bg-[#090b10] border border-white/10 text-xs font-bold text-slate-100 focus:outline-none focus:border-sky-400/50"
            />
          </div>

          <div className="flex items-center gap-2 shrink-0">
            {selectedBuildId &&
              accountGalleryEntries.some((b) => b.id === selectedBuildId) && (
                <button
                  type="button"
                  onClick={() =>
                    updateMutation.mutate({
                      id: selectedBuildId,
                      payload: currentBuild,
                    })
                  }
                  className="inline-flex items-center gap-1.5 h-9 px-3 rounded-lg bg-slate-800/90 hover:bg-slate-700 border border-white/10 text-xs font-bold text-slate-200 transition-colors cursor-pointer"
                >
                  <Save size={14} />
                  Atualizar Selecionada
                </button>
              )}

            <button
              type="button"
              onClick={handleSaveNewBuild}
              className="inline-flex items-center gap-1.5 h-9 px-3.5 rounded-lg bg-sky-500/20 hover:bg-sky-500/30 border border-sky-400/40 text-xs font-bold text-sky-100 transition-colors cursor-pointer"
            >
              <CopyPlus size={14} className="text-sky-300" />
              Salvar Build Atual como Card
            </button>
          </div>
        </div>

        {/* Filter Tabs + Status Message */}
        <div className="flex flex-wrap items-center justify-between gap-2 border-b border-white/8 pb-2.5">
          <div className="inline-flex items-center gap-1 p-1 rounded-lg bg-[#080a0f] border border-white/8">
            {(
              [
                {
                  id: "all",
                  label: `Todas (${accountGalleryEntries.length + localBuilds.length + PRESET_BUILDS.length})`,
                },
                {
                  id: "saved",
                  label: `Minhas Builds (${accountGalleryEntries.length + localBuilds.length})`,
                },
                {
                  id: "presets",
                  label: `Presets & Comunidade (${PRESET_BUILDS.length})`,
                },
              ] as const
            ).map((tab) => (
              <button
                key={tab.id}
                type="button"
                onClick={() => setActiveTab(tab.id)}
                className={`px-3 py-1.5 rounded-md text-xs font-bold uppercase tracking-wider transition-colors cursor-pointer border ${
                  activeTab === tab.id
                    ? "bg-sky-500/18 text-sky-100 border-sky-400/35"
                    : "bg-transparent text-slate-400 border-transparent hover:text-slate-200 hover:bg-white/5"
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>

          {message && (
            <span className="text-xs font-semibold text-emerald-400">
              {message}
            </span>
          )}
        </div>

        {/* PoE2 / Mobalytics Style Build Cards Grid */}
        <div
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3.5 max-h-[58vh] overflow-y-auto custom-scrollbar pr-1"
          aria-live="polite"
        >
          {isLoading && activeTab === "saved" ? (
            <div className="col-span-full py-12 text-center text-xs text-slate-400">
              {t.loading}
            </div>
          ) : visibleEntries.length > 0 ? (
            visibleEntries.map((entry) => {
              const { payload } = entry;
              const classId = payload.character.selectedClassId || entry.classId;
              const spriteId = getCanonicalSpriteId(classId);
              const className =
                classDisplayNames.get(classId) ?? classId.replace(/_/g, " ");
              const equippedIds = Object.values(
                payload.equipment?.selectedItemsBySlot ?? {},
              ).filter((id): id is number => typeof id === "number" && id > 0);
              const skillName = formatSkillName(
                payload.attack?.selectedSkillId || "Skill",
              );

              return (
                <article
                  key={entry.id}
                  onClick={() => handleImportBuild(entry)}
                  className="group relative flex flex-col justify-between rounded-xl bg-gradient-to-b from-[#151a26] via-[#111520] to-[#0d1018] border border-white/10 hover:border-sky-400/45 p-4 transition-all duration-150 cursor-pointer shadow-lg hover:shadow-[0_8px_28px_rgba(0,0,0,0.55)] overflow-hidden"
                >
                  {/* Top Banner: Class Sprite + Title + Badges */}
                  <div>
                    <div className="flex items-start gap-3">
                      {/* Class Portrait Frame */}
                      <div className="relative w-14 h-16 shrink-0 rounded-xl bg-[#090b10] border border-white/10 flex items-center justify-center overflow-hidden">
                        <div className="absolute inset-0 bg-radial from-sky-500/20 via-transparent to-transparent" />
                        {/* eslint-disable-next-line @next/next/no-img-element */}
                        <img
                          src={`/sprites/classes/${spriteId}.png`}
                          alt={className}
                          className="h-14 w-auto object-contain [image-rendering:pixelated] drop-shadow-[0_4px_8px_rgba(0,0,0,0.75)] group-hover:scale-105 transition-transform"
                          loading="lazy"
                          onError={(e) => {
                            (e.target as HTMLImageElement).style.display =
                              "none";
                          }}
                        />
                      </div>

                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-1.5 flex-wrap mb-1">
                          <span
                            className={`px-1.5 py-0.5 rounded text-[9px] font-bold uppercase tracking-wider border ${
                              entry.source === "preset"
                                ? "bg-amber-500/15 border-amber-400/30 text-amber-300"
                                : entry.source === "account"
                                  ? "bg-sky-500/15 border-sky-400/30 text-sky-300"
                                  : "bg-emerald-500/15 border-emerald-400/30 text-emerald-300"
                            }`}
                          >
                            {entry.source === "preset"
                              ? "Preset"
                              : entry.source === "account"
                                ? "Conta"
                                : "Local"}
                          </span>
                          <span className="text-[10px] font-mono font-bold text-slate-400">
                            {className} • Lv.{payload.character.baseLevel}/
                            {payload.character.jobLevel}
                          </span>
                        </div>

                        <h3 className="text-sm font-black text-slate-100 group-hover:text-sky-200 truncate transition-colors">
                          {entry.name}
                        </h3>

                        {entry.description ? (
                          <p className="text-[11px] text-slate-400 line-clamp-2 mt-1 leading-snug">
                            {entry.description}
                          </p>
                        ) : (
                          <p className="text-[10.5px] font-mono text-slate-500 mt-1">
                            Atualizada em {entry.updatedAt}
                          </p>
                        )}
                      </div>
                    </div>

                    {/* Skill & Core Stats Summary Strip */}
                    <div className="mt-3 pt-2.5 border-t border-white/6 flex items-center justify-between gap-2 text-[10.5px]">
                      <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-md bg-sky-950/45 border border-sky-500/25 text-sky-200 font-mono font-bold truncate">
                        <Swords size={11} className="text-sky-400 shrink-0" />
                        <span className="truncate">
                          {skillName} Lv.{payload.attack?.skillLevel ?? 1}
                        </span>
                      </span>

                      <span className="text-[10px] font-mono text-slate-400 shrink-0">
                        {equippedIds.length} equips
                      </span>
                    </div>

                    {/* Mini Equipment Icons Strip */}
                    <div className="mt-2.5 flex items-center gap-1.5 min-h-[32px]">
                      {equippedIds.length > 0 ? (
                        <>
                          {equippedIds.slice(0, 7).map((itemId, idx) => (
                            <div
                              key={`${entry.id}-item-${itemId}-${idx}`}
                              className="w-7 h-7 rounded-md bg-[#090b10] border border-white/10 flex items-center justify-center shrink-0"
                            >
                              <CalculatorItemIcon itemId={itemId} size={20} />
                            </div>
                          ))}
                          {equippedIds.length > 7 && (
                            <span className="px-1.5 py-1 rounded-md bg-[#090b10] border border-white/10 text-[10px] font-mono font-bold text-slate-400">
                              +{equippedIds.length - 7}
                            </span>
                          )}
                        </>
                      ) : (
                        <span className="text-[10.5px] text-slate-500 italic">
                          Atributos & Árvore de Skills (Sem equipamentos fixos)
                        </span>
                      )}
                    </div>
                  </div>

                  {/* Card Footer: 1-Click Import + Duplicate / Delete */}
                  <div className="mt-3.5 pt-2.5 border-t border-white/8 flex items-center justify-between gap-2">
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        handleImportBuild(entry);
                      }}
                      className="flex-1 inline-flex items-center justify-center gap-1.5 h-8 px-3 rounded-lg bg-sky-500/18 group-hover:bg-sky-500/30 border border-sky-400/35 text-xs font-extrabold text-sky-100 transition-colors cursor-pointer"
                    >
                      <ArrowDownToLine size={13} className="text-sky-300" />
                      Importar / Testar Build
                    </button>

                    <div className="flex items-center gap-1 shrink-0">
                      <button
                        type="button"
                        title="Duplicar Build"
                        onClick={(e) => {
                          e.stopPropagation();
                          handleDuplicateBuild(entry);
                        }}
                        className="w-8 h-8 rounded-lg bg-[#090b10] hover:bg-slate-800 border border-white/10 flex items-center justify-center text-slate-400 hover:text-slate-100 transition-colors cursor-pointer"
                      >
                        <CopyPlus size={13} />
                      </button>

                      {entry.source !== "preset" && (
                        <button
                          type="button"
                          title="Excluir Build"
                          onClick={(e) => {
                            e.stopPropagation();
                            handleDeleteEntry(entry);
                          }}
                          className="w-8 h-8 rounded-lg bg-[#090b10] hover:bg-rose-950/70 border border-white/10 hover:border-rose-500/40 flex items-center justify-center text-slate-400 hover:text-rose-300 transition-colors cursor-pointer"
                        >
                          <Trash2 size={13} />
                        </button>
                      )}
                    </div>
                  </div>
                </article>
              );
            })
          ) : (
            <div className="col-span-full flex flex-col items-center justify-center py-12 px-4 rounded-xl border border-dashed border-white/10 text-center">
              <FolderHeart size={28} className="text-slate-500 mb-2" />
              <p className="text-xs font-bold text-slate-300">
                Nenhuma build salva nesta aba ainda.
              </p>
              <p className="text-[11px] text-slate-500 mt-1">
                Clique em &ldquo;Salvar Build Atual como Card&rdquo; acima ou explore a aba de Presets!
              </p>
            </div>
          )}
        </div>
      </div>
    </Modal>
  );
}

function formatBuildDate(value: string) {
  return new Intl.DateTimeFormat(undefined, {
    dateStyle: "short",
    timeStyle: "short",
  }).format(new Date(value));
}

function cloneBuildPayload(
  payload: CalculatorBuildPayload,
): CalculatorBuildPayload {
  return JSON.parse(JSON.stringify(payload)) as CalculatorBuildPayload;
}

class CalculatorBuildsUnauthenticatedError extends Error {
  constructor() {
    super("Unauthenticated");
  }
}
