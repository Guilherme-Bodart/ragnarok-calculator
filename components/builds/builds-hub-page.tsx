"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import {
  ArrowRight,
  Boxes,
  Check,
  CopyPlus,
  Flame,
  FolderHeart,
  Save,
  Search,
  Sparkles,
  Swords,
  Trash2,
} from "lucide-react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { AppNavbar } from "@/components/site/app-navbar";
import archMagePreset from "@/packages/calculator-core/src/reference-scenarios/guilh-arch-mage-build.json";
import {
  calculatorBuildPayloadVersion,
  type CalculatorBuildPayload,
} from "@/components/calculator/calculator-build-payload";
import {
  deleteCalculatorAccountBuild,
  listCalculatorAccountBuilds,
  saveCalculatorAccountBuild,
  updateCalculatorAccountBuild,
  type CalculatorAccountBuild,
} from "@/components/calculator/calculator-build-api";
import { CalculatorItemIcon } from "@/components/calculator/calculator-item-icon";
import { calculatorSkillTreeClassGroups } from "@/components/calculator/calculator-skill-tree-data";
import { useCalculatorBuildStore } from "@/components/calculator/calculator-build-store";

export type GalleryBuildEntry = {
  id: string;
  name: string;
  classId: string;
  source: "preset" | "account" | "local";
  updatedAt: string;
  tags?: string[];
  description?: string;
  payload: CalculatorBuildPayload;
};

export const LOCAL_GALLERY_STORAGE_KEY = "nightmare-calculator-saved-builds-v1";

export const PRESET_BUILDS: GalleryBuildEntry[] = [
  {
    id: "preset-arch-mage-svs",
    name: "Arch Mage — Soul Vulcan Strike",
    classId: "Arch_Mage",
    source: "preset",
    updatedAt: "Meta Preset • Dano Mágico",
    tags: ["Mágico", "Fantasma", "Endgame"],
    description:
      "Build mágica de 4ª classe focada em Soul Vulcan Strike com combo Laço/Vestido da Celine, Botas Temporais e Shadow Gear mágico.",
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
    updatedAt: "Meta Preset • Físico Crit / POW",
    tags: ["Físico", "Crítico", "Duas Mãos"],
    description:
      "Distribuição ofensiva de Dragon Knight com foco em POW e CRT máximos, Aura Dracônica e Lâmina de Aura para explosão física.",
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
        itemContexts: {
          "21047": { refine: 12, grade: 4 },
          "19300": { refine: 11, grade: 3 },
        },
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
    updatedAt: "Meta Preset • Crítico / EDP",
    tags: ["Crítico", "Katar", "Veneno Mortal"],
    description:
      "Assassino de 4ª classe otimizado para multiplicador crítico (CRT/POW) com Encantar com Veneno Mortal (EDP) e Potent Venom.",
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
        itemContexts: { "19300": { refine: 12, grade: 4 } },
        selectedCardsBySlot: {},
        selectedItemsBySlot: {
          headTop: 19300,
        },
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
  {
    id: "preset-windhawk-crescive",
    name: "Windhawk — Crescive Bolt",
    classId: "Windhawk",
    source: "preset",
    updatedAt: "Meta Preset • Distância / Crit",
    tags: ["Distância", "Arco", "Crítico"],
    description:
      "Atirador de elite focado em Crescive Bolt e Calamity Gale com alta concentração (CON), poder físico (POW) e taxa crítica.",
    payload: {
      version: calculatorBuildPayloadVersion,
      name: "Windhawk — Crescive Bolt",
      character: {
        selectedClassId: "Windhawk",
        baseLevel: 250,
        jobLevel: 50,
        stats: {
          str: 60,
          agi: 120,
          vit: 90,
          int: 40,
          dex: 130,
          luk: 125,
          pow: 105,
          sta: 0,
          wis: 0,
          spl: 0,
          con: 95,
          crt: 65,
        },
      },
      attack: {
        selectedSkillId: "WH_CRESCIVE_BOLT",
        skillLevel: 10,
      },
      tree: {
        learnedSkills: {
          WH_CALAMITYGALE: 10,
          RA_FEARBREEZE: 5,
          SN_SHARPSHOOTING: 5,
        },
      },
      equipment: {
        itemContexts: { "19300": { refine: 12, grade: 4 } },
        selectedCardsBySlot: {},
        selectedItemsBySlot: {
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
    id: "preset-inquisitor-flame",
    name: "Inquisitor — Third Flame Bomb",
    classId: "Inquisitor",
    source: "preset",
    updatedAt: "Meta Preset • Combo / HP & POW",
    tags: ["Físico", "Combo", "Explosão"],
    description:
      "Monge de 4ª classe focado em explosão física corpo a corpo com Third Flame Bomb, alta VIT/STR e escalonamento de POW.",
    payload: {
      version: calculatorBuildPayloadVersion,
      name: "Inquisitor — Third Flame Bomb",
      character: {
        selectedClassId: "Inquisitor",
        baseLevel: 250,
        jobLevel: 50,
        stats: {
          str: 130,
          agi: 95,
          vit: 125,
          int: 60,
          dex: 110,
          luk: 80,
          pow: 110,
          sta: 50,
          wis: 0,
          spl: 0,
          con: 80,
          crt: 25,
        },
      },
      attack: {
        selectedSkillId: "IQ_THIRD_FLAME_BOMB",
        skillLevel: 5,
      },
      tree: {
        learnedSkills: {
          IQ_SINCERE_FAITH: 5,
          SR_RAISINGDRAGON: 10,
        },
      },
      equipment: {
        itemContexts: {},
        selectedCardsBySlot: {},
        selectedItemsBySlot: {},
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
    id: "preset-cardinal-framen",
    name: "Cardinal — Framen & Arbitrium",
    classId: "Cardinal",
    source: "preset",
    updatedAt: "Meta Preset • Mágico Sagrado",
    tags: ["Mágico", "Sagrado", "SPL"],
    description:
      "Arcebispo exorcista de 4ª classe com foco total em SPL e INT para maximizar o dano sagrado contra alvos Sombrios e Malditos.",
    payload: {
      version: calculatorBuildPayloadVersion,
      name: "Cardinal — Framen & Arbitrium",
      character: {
        selectedClassId: "Cardinal",
        baseLevel: 250,
        jobLevel: 50,
        stats: {
          str: 20,
          agi: 90,
          vit: 100,
          int: 130,
          dex: 125,
          luk: 100,
          pow: 0,
          sta: 0,
          wis: 55,
          spl: 110,
          con: 80,
          crt: 0,
        },
      },
      attack: {
        selectedSkillId: "CD_FRAMEN",
        skillLevel: 5,
      },
      tree: {
        learnedSkills: {
          CD_FIDUS_ANIMUS: 10,
          AB_JUDEX: 10,
        },
      },
      equipment: {
        itemContexts: { "19389": { refine: 11 } },
        selectedCardsBySlot: {},
        selectedItemsBySlot: {
          headTop: 19389,
          armor: 15198,
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
];

export function readLocalGalleryBuilds(): GalleryBuildEntry[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = window.localStorage.getItem(LOCAL_GALLERY_STORAGE_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw) as GalleryBuildEntry[];
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

export function writeLocalGalleryBuilds(entries: GalleryBuildEntry[]) {
  if (typeof window === "undefined") return;
  try {
    window.localStorage.setItem(
      LOCAL_GALLERY_STORAGE_KEY,
      JSON.stringify(entries),
    );
  } catch {
    // Ignore quota errors
  }
}

function getCanonicalSpriteId(classId: string): string {
  return classId.replace(/_T2$/, "").replace(/_T$/, "").replace(/2$/, "");
}

function getClassDisplayName(classId: string): string {
  const all = calculatorSkillTreeClassGroups.flatMap((g) => g.options);
  return (
    all.find((c) => c.id === classId)?.name ?? classId.replace(/_/g, " ")
  );
}

function getTopStatPills(payload: CalculatorBuildPayload): string[] {
  const s = payload.character.stats;
  const entries: Array<[string, number]> = [
    ["STR", s.str],
    ["AGI", s.agi],
    ["VIT", s.vit],
    ["INT", s.int],
    ["DEX", s.dex],
    ["LUK", s.luk],
    ["POW", s.pow],
    ["SPL", s.spl],
    ["CON", s.con],
    ["CRT", s.crt],
  ];
  return entries
    .filter(([, val]) => val >= 80)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 4)
    .map(([label, val]) => `${label} ${val}`);
}

export function BuildsHubPage() {
  const router = useRouter();
  const queryClient = useQueryClient();

  // Current active build from global store
  const store = useCalculatorBuildStore();
  const currentBuildPayload = useMemo<CalculatorBuildPayload>(
    () => ({
      version: calculatorBuildPayloadVersion,
      name: store.buildName,
      character: {
        selectedClassId: store.selectedClassId,
        baseLevel: store.baseLevel,
        jobLevel: store.jobLevel,
        stats: store.stats,
      },
      attack: {
        selectedSkillId: store.selectedSkillId,
        skillLevel: store.skillLevel,
      },
      tree: {
        learnedSkills: store.learnedSkills,
      },
      equipment: {
        itemContexts: store.itemContexts,
        selectedCardsBySlot: store.selectedCardsBySlot,
        selectedItemsBySlot: store.selectedItemsBySlot,
      },
      buffs: {
        activeBuffs: store.activeBuffs,
        selectedBuffId: store.selectedBuffId,
      },
      target: {
        selectedMonsterId: store.selectedMonsterId,
      },
    }),
    [store],
  );

  const [buildName, setBuildName] = useState(
    store.buildName || "Minha Build",
  );
  const [selectedBuildId, setSelectedBuildId] = useState<string | null>(null);
  const [message, setMessage] = useState("");
  const [activeCategory, setActiveCategory] = useState<
    "all" | "preset" | "saved"
  >("all");
  const [selectedClassFilter, setSelectedClassFilter] =
    useState<string>("ALL");
  const [searchQuery, setSearchQuery] = useState("");
  const [localBuilds, setLocalBuilds] = useState<GalleryBuildEntry[]>([]);

  useEffect(() => {
    setLocalBuilds(readLocalGalleryBuilds());
  }, []);

  useEffect(() => {
    if (store.buildName) {
      setBuildName(store.buildName);
    }
  }, [store.buildName]);

  const { data: queryData } = useQuery({
    queryKey: ["calculator-builds"],
    queryFn: listCalculatorAccountBuilds,
    retry: false,
  });

  const isAuthenticated = queryData?.status === "authenticated";

  const accountEntries: GalleryBuildEntry[] = useMemo(() => {
    const raw: CalculatorAccountBuild[] = queryData?.builds ?? [];
    return raw.map((b) => ({
      id: b.id,
      name: b.name,
      classId: b.classId,
      source: "account" as const,
      updatedAt: new Date(b.updatedAt).toLocaleDateString("pt-BR"),
      payload: b.payload,
    }));
  }, [queryData?.builds]);

  const allEntries = useMemo(() => {
    return [...accountEntries, ...localBuilds, ...PRESET_BUILDS];
  }, [accountEntries, localBuilds]);

  const classFilterOptions = useMemo(() => {
    const uniqueClassIds = Array.from(
      new Set(allEntries.map((e) => e.classId)),
    );
    return uniqueClassIds.map((classId) => ({
      id: classId,
      name: getClassDisplayName(classId),
      spriteId: getCanonicalSpriteId(classId),
    }));
  }, [allEntries]);

  const filteredEntries = useMemo(() => {
    return allEntries.filter((entry) => {
      if (activeCategory === "preset" && entry.source !== "preset") {
        return false;
      }
      if (activeCategory === "saved" && entry.source === "preset") {
        return false;
      }
      if (
        selectedClassFilter !== "ALL" &&
        entry.classId !== selectedClassFilter
      ) {
        return false;
      }
      const q = searchQuery.trim().toLowerCase();
      if (!q) return true;
      const className = getClassDisplayName(entry.classId).toLowerCase();
      const skillId = entry.payload.attack.selectedSkillId.toLowerCase();
      return (
        entry.name.toLowerCase().includes(q) ||
        className.includes(q) ||
        skillId.includes(q) ||
        (entry.description?.toLowerCase().includes(q) ?? false)
      );
    });
  }, [allEntries, activeCategory, selectedClassFilter, searchQuery]);

  const saveAccountMutation = useMutation({
    mutationFn: async (name: string) => {
      return await saveCalculatorAccountBuild({
        ...currentBuildPayload,
        name,
      });
    },
    onSuccess: (savedBuild) => {
      queryClient.setQueryData(
        ["calculator-builds"],
        (old: typeof queryData) => {
          if (!old)
            return {
              status: "authenticated" as const,
              builds: [savedBuild],
            };
          return {
            ...old,
            builds: [
              savedBuild,
              ...old.builds.filter((item) => item.id !== savedBuild.id),
            ],
          };
        },
      );
      setSelectedBuildId(savedBuild.id);
      store.renameBuild(savedBuild.name);
      store.markAsSaved();
      setMessage(`Build "${savedBuild.name}" salva na sua conta!`);
    },
  });

  const updateAccountMutation = useMutation({
    mutationFn: async ({ id, name }: { id: string; name: string }) => {
      return await updateCalculatorAccountBuild(id, {
        ...currentBuildPayload,
        name,
      });
    },
    onSuccess: (savedBuild) => {
      queryClient.setQueryData(
        ["calculator-builds"],
        (old: typeof queryData) => {
          if (!old)
            return {
              status: "authenticated" as const,
              builds: [savedBuild],
            };
          return {
            ...old,
            builds: [
              savedBuild,
              ...old.builds.filter((item) => item.id !== savedBuild.id),
            ],
          };
        },
      );
      store.renameBuild(savedBuild.name);
      store.markAsSaved();
      setMessage(`Build "${savedBuild.name}" atualizada na conta!`);
    },
  });

  const deleteAccountMutation = useMutation({
    mutationFn: async (buildId: string) => {
      await deleteCalculatorAccountBuild(buildId);
      return buildId;
    },
    onSuccess: (deletedId) => {
      queryClient.setQueryData(
        ["calculator-builds"],
        (old: typeof queryData) => {
          if (!old) return old;
          return {
            ...old,
            builds: old.builds.filter((item) => item.id !== deletedId),
          };
        },
      );
      if (selectedBuildId === deletedId) {
        setSelectedBuildId(null);
      }
      setMessage("Build removida da conta.");
    },
  });

  function handleSaveCurrentBuild() {
    const trimmed = buildName.trim() || "Minha Build";
    if (isAuthenticated) {
      saveAccountMutation.mutate(trimmed);
      return;
    }

    const newEntry: GalleryBuildEntry = {
      id: `local-${Date.now()}`,
      name: trimmed,
      classId: currentBuildPayload.character.selectedClassId,
      source: "local",
      updatedAt: new Date().toLocaleDateString("pt-BR"),
      payload: {
        ...currentBuildPayload,
        name: trimmed,
      },
    };
    const next = [newEntry, ...localBuilds];
    setLocalBuilds(next);
    writeLocalGalleryBuilds(next);
    setSelectedBuildId(newEntry.id);
    store.renameBuild(trimmed);
    store.markAsSaved();
    setMessage(`Build "${trimmed}" salva na sua galeria!`);
  }

  function handleUpdateSelected() {
    if (!selectedBuildId) return;
    const trimmed = buildName.trim() || "Minha Build";

    if (selectedBuildId.startsWith("local-")) {
      const next = localBuilds.map((entry) =>
        entry.id === selectedBuildId
          ? {
              ...entry,
              name: trimmed,
              classId: currentBuildPayload.character.selectedClassId,
              updatedAt: new Date().toLocaleDateString("pt-BR"),
              payload: { ...currentBuildPayload, name: trimmed },
            }
          : entry,
      );
      setLocalBuilds(next);
      writeLocalGalleryBuilds(next);
      store.renameBuild(trimmed);
      store.markAsSaved();
      setMessage(`Build "${trimmed}" atualizada com os dados atuais da calculadora!`);
      return;
    }

    if (isAuthenticated && !selectedBuildId.startsWith("preset-")) {
      updateAccountMutation.mutate({ id: selectedBuildId, name: trimmed });
    }
  }

  function handleDeleteEntry(entry: GalleryBuildEntry) {
    if (entry.source === "local") {
      const next = localBuilds.filter((b) => b.id !== entry.id);
      setLocalBuilds(next);
      writeLocalGalleryBuilds(next);
      if (selectedBuildId === entry.id) setSelectedBuildId(null);
      setMessage(`Build "${entry.name}" removida.`);
      return;
    }
    if (entry.source === "account") {
      deleteAccountMutation.mutate(entry.id);
    }
  }

  function handleDuplicateEntry(entry: GalleryBuildEntry) {
    const copyName = `${entry.name} (Cópia)`;
    const dup: GalleryBuildEntry = {
      id: `local-${Date.now()}`,
      name: copyName,
      classId: entry.classId,
      source: "local",
      updatedAt: new Date().toLocaleDateString("pt-BR"),
      payload: {
        ...entry.payload,
        name: copyName,
      },
    };
    const next = [dup, ...localBuilds];
    setLocalBuilds(next);
    writeLocalGalleryBuilds(next);
    setMessage(`Build duplicada como "${copyName}".`);
  }

  function handleImportToCalculator(entry: GalleryBuildEntry) {
    store.loadBuild(entry.payload);
    store.renameBuild(entry.name);
    router.push("/calculator");
  }

  const activeSpriteId = getCanonicalSpriteId(store.selectedClassId);
  const activeClassName = getClassDisplayName(store.selectedClassId);
  const savedCount = accountEntries.length + localBuilds.length;

  return (
    <div className="min-h-screen bg-[#090b10] text-slate-100 flex flex-col">
      <AppNavbar />

      <main className="mx-auto w-full max-w-[1600px] flex-1 px-4 py-8 sm:px-6 flex flex-col gap-6">
        {/* HERO BANNER & ACTIVE CALCULATOR BUILD SAVER */}
        <section className="relative overflow-hidden rounded-2xl border border-white/10 bg-gradient-to-br from-[#121722] via-[#0d1017] to-[#090b10] p-6 shadow-2xl">
          <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
            <div className="flex flex-col gap-2 max-w-2xl">
              <div className="inline-flex items-center gap-2 text-[11px] font-mono uppercase tracking-widest text-sky-400">
                <Boxes size={14} />
                <span>PoE2 / Maxroll Style • Ragnarok Builds Hub</span>
              </div>
              <h1 className="text-2xl sm:text-3xl font-black tracking-tight text-white">
                Galeria de Builds & Presets
              </h1>
              <p className="text-xs sm:text-sm text-slate-400 leading-relaxed">
                Explore builds de referência de 4ª classe ou gerencie suas builds salvas. Clique em qualquer card para{" "}
                <strong className="text-sky-300">importar instantaneamente na calculadora</strong>, testar equipamentos e simular o dano real.
              </p>
            </div>

            {/* Active Calculator Build Quick-Save Card */}
            <div className="flex flex-col gap-3 rounded-xl border border-white/10 bg-[#090b10]/90 p-4 lg:min-w-[440px]">
              <div className="flex items-center justify-between gap-3">
                <div className="flex items-center gap-2.5 min-w-0">
                  <div className="h-10 w-10 shrink-0 rounded-lg border border-white/10 bg-[#121620] flex items-center justify-center overflow-hidden">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      src={`/sprites/classes/${activeSpriteId}.png`}
                      alt={activeClassName}
                      className="h-9 w-auto object-contain [image-rendering:pixelated]"
                    />
                  </div>
                  <div className="flex flex-col min-w-0">
                    <span className="text-[10px] font-mono uppercase tracking-wider text-emerald-400 font-bold">
                      Ativa na Calculadora Agora
                    </span>
                    <strong className="text-xs font-bold text-slate-100 truncate">
                      {activeClassName} • Lv.{store.baseLevel}/{store.jobLevel}
                    </strong>
                  </div>
                </div>

                <span className="px-2 py-0.5 rounded-md bg-white/[0.04] border border-white/10 text-[10px] font-mono text-slate-400 shrink-0">
                  {isAuthenticated ? "Sincronizado na Conta" : "Salvo no Navegador"}
                </span>
              </div>

              <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2">
                <input
                  type="text"
                  value={buildName}
                  onChange={(e) => setBuildName(e.target.value)}
                  placeholder="Nome para salvar a build atual..."
                  maxLength={80}
                  className="flex-1 h-9 px-3 rounded-lg bg-[#121620] border border-white/10 text-xs text-slate-100 placeholder:text-slate-500 focus:outline-none focus:border-sky-400/50"
                />
                <button
                  type="button"
                  onClick={handleSaveCurrentBuild}
                  className="inline-flex items-center justify-center gap-1.5 h-9 px-3.5 rounded-lg bg-sky-500/20 hover:bg-sky-500/30 border border-sky-400/40 text-xs font-bold text-sky-100 transition-colors cursor-pointer shrink-0"
                >
                  <Save size={13} />
                  <span>Salvar Build Atual</span>
                </button>
                {selectedBuildId && !selectedBuildId.startsWith("preset-") && (
                  <button
                    type="button"
                    onClick={handleUpdateSelected}
                    className="inline-flex items-center justify-center gap-1.5 h-9 px-3 rounded-lg bg-amber-500/20 hover:bg-amber-500/30 border border-amber-400/40 text-xs font-bold text-amber-200 transition-colors cursor-pointer shrink-0"
                    title="Sobrescrever a build selecionada com o estado atual da calculadora"
                  >
                    <span>Atualizar</span>
                  </button>
                )}
              </div>

              {message && (
                <div className="flex items-center gap-1.5 text-[11px] font-medium text-emerald-300 bg-emerald-950/40 border border-emerald-500/30 rounded-lg px-2.5 py-1.5">
                  <Check size={13} className="shrink-0" />
                  <span>{message}</span>
                </div>
              )}
            </div>
          </div>
        </section>

        {/* FILTER & SEARCH BAR (PoE2 / Mobalytics Style) */}
        <section className="flex flex-col gap-3 rounded-xl border border-white/10 bg-[#0d1017] p-4">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-3">
            {/* Category Switcher */}
            <div className="inline-flex items-center gap-1 p-1 rounded-xl bg-[#090b10] border border-white/[0.08] self-start">
              <button
                type="button"
                onClick={() => setActiveCategory("all")}
                className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-colors cursor-pointer ${
                  activeCategory === "all"
                    ? "bg-sky-500/20 text-sky-200 border border-sky-400/35"
                    : "text-slate-400 hover:text-slate-200 border border-transparent"
                }`}
              >
                Todas ({allEntries.length})
              </button>
              <button
                type="button"
                onClick={() => setActiveCategory("preset")}
                className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition-colors cursor-pointer ${
                  activeCategory === "preset"
                    ? "bg-amber-500/20 text-amber-200 border border-amber-400/35"
                    : "text-slate-400 hover:text-slate-200 border border-transparent"
                }`}
              >
                <Flame size={13} className="text-amber-400" />
                <span>Meta / Referência ({PRESET_BUILDS.length})</span>
              </button>
              <button
                type="button"
                onClick={() => setActiveCategory("saved")}
                className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition-colors cursor-pointer ${
                  activeCategory === "saved"
                    ? "bg-sky-500/20 text-sky-200 border border-sky-400/35"
                    : "text-slate-400 hover:text-slate-200 border border-transparent"
                }`}
              >
                <FolderHeart size={13} className="text-sky-400" />
                <span>Minhas Salvas ({savedCount})</span>
              </button>
            </div>

            {/* Search Input */}
            <div className="relative flex-1 max-w-md">
              <Search
                size={14}
                className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500 pointer-events-none"
              />
              <input
                type="search"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Buscar por nome da build, classe ou skill..."
                className="w-full h-9 pl-9 pr-3 rounded-lg bg-[#090b10] border border-white/10 text-xs text-slate-100 placeholder:text-slate-500 focus:outline-none focus:border-sky-400/50"
              />
            </div>
          </div>

          {/* Class Sprite Filter Strip */}
          <div className="flex items-center gap-2 overflow-x-auto pb-1 pt-1 custom-scrollbar">
            <button
              type="button"
              onClick={() => setSelectedClassFilter("ALL")}
              className={`shrink-0 px-3 py-1.5 rounded-lg text-xs font-bold border transition-colors cursor-pointer ${
                selectedClassFilter === "ALL"
                  ? "bg-white/10 text-white border-white/25"
                  : "bg-[#090b10] text-slate-400 border-white/[0.06] hover:text-slate-200 hover:border-white/15"
              }`}
            >
              Todas as Classes
            </button>

            {classFilterOptions.map((cls) => {
              const isSelected = selectedClassFilter === cls.id;
              return (
                <button
                  key={cls.id}
                  type="button"
                  onClick={() =>
                    setSelectedClassFilter(isSelected ? "ALL" : cls.id)
                  }
                  className={`shrink-0 inline-flex items-center gap-2 px-2.5 py-1 rounded-lg text-xs font-bold border transition-all cursor-pointer ${
                    isSelected
                      ? "bg-sky-500/20 text-sky-100 border-sky-400/45 shadow-[0_0_12px_rgba(14,165,233,0.18)]"
                      : "bg-[#090b10] text-slate-300 border-white/[0.06] hover:bg-[#121620] hover:border-white/15"
                  }`}
                >
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={`/sprites/classes/${cls.spriteId}.png`}
                    alt=""
                    className="h-6 w-6 object-contain [image-rendering:pixelated]"
                  />
                  <span>{cls.name}</span>
                </button>
              );
            })}
          </div>
        </section>

        {/* BUILD CARDS GALLERY GRID */}
        {filteredEntries.length === 0 ? (
          <div className="flex flex-col items-center justify-center gap-3 py-16 px-4 rounded-2xl border border-dashed border-white/10 bg-[#0d1017]/60 text-center">
            <Boxes size={32} className="text-slate-500" />
            <div className="flex flex-col gap-1">
              <strong className="text-sm font-bold text-slate-200">
                Nenhuma build encontrada para este filtro
              </strong>
              <p className="text-xs text-slate-400 max-w-md">
                Experimente limpar a busca ou salve sua build atual da calculadora usando o painel acima.
              </p>
            </div>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
            {filteredEntries.map((entry) => {
              const spriteId = getCanonicalSpriteId(entry.classId);
              const className = getClassDisplayName(entry.classId);
              const equippedIds = Object.values(
                entry.payload.equipment.selectedItemsBySlot ?? {},
              ).filter((id): id is number => typeof id === "number" && id > 0);
              const skillId = entry.payload.attack.selectedSkillId;
              const skillLvl = entry.payload.attack.skillLevel;
              const topStats = getTopStatPills(entry.payload);
              const isSelected = selectedBuildId === entry.id;

              return (
                <article
                  key={entry.id}
                  onClick={() => {
                    setSelectedBuildId(entry.id);
                    setBuildName(entry.name);
                  }}
                  className={`group relative flex flex-col justify-between gap-4 rounded-2xl p-5 border transition-all cursor-pointer ${
                    isSelected
                      ? "bg-[#151b28] border-sky-400/50 shadow-[0_0_25px_rgba(14,165,233,0.14)]"
                      : "bg-[#0d1017] border-white/10 hover:border-white/25 hover:bg-[#121722]"
                  }`}
                >
                  {/* Top Section: Class Avatar + Metadata */}
                  <div className="flex flex-col gap-3">
                    <div className="flex items-start gap-3.5">
                      {/* Class Sprite Pedestal */}
                      <div className="relative shrink-0 w-16 h-20 rounded-xl bg-gradient-to-b from-sky-500/15 via-[#090b10] to-[#090b10] border border-white/10 flex items-center justify-center overflow-hidden">
                        {/* eslint-disable-next-line @next/next/no-img-element */}
                        <img
                          src={`/sprites/classes/${spriteId}.png`}
                          alt={className}
                          className="h-16 w-auto object-contain [image-rendering:pixelated] drop-shadow-[0_4px_10px_rgba(0,0,0,0.65)] group-hover:scale-105 transition-transform"
                        />
                      </div>

                      <div className="flex-1 min-w-0 flex flex-col gap-1">
                        <div className="flex items-center justify-between gap-2">
                          <span className="text-[10px] font-mono font-extrabold uppercase tracking-wider text-sky-400 truncate">
                            {className} • Lv.{entry.payload.character.baseLevel}/
                            {entry.payload.character.jobLevel}
                          </span>
                          <span
                            className={`shrink-0 px-2 py-0.5 rounded-md text-[9.5px] font-mono font-bold uppercase border ${
                              entry.source === "preset"
                                ? "bg-amber-500/15 text-amber-300 border-amber-400/30"
                                : entry.source === "account"
                                  ? "bg-sky-500/15 text-sky-300 border-sky-400/30"
                                  : "bg-emerald-500/15 text-emerald-300 border-emerald-400/30"
                            }`}
                          >
                            {entry.source === "preset"
                              ? "Meta Preset"
                              : entry.source === "account"
                                ? "Conta"
                                : "Salva"}
                          </span>
                        </div>

                        <h2 className="text-base font-black text-slate-100 truncate group-hover:text-sky-200 transition-colors">
                          {entry.name}
                        </h2>

                        {entry.description ? (
                          <p className="text-xs text-slate-400 line-clamp-2 leading-relaxed">
                            {entry.description}
                          </p>
                        ) : (
                          <span className="text-[11px] text-slate-500 font-mono">
                            Atualizada em {entry.updatedAt}
                          </span>
                        )}
                      </div>
                    </div>

                    {/* Skill & Stat Distribution Pills */}
                    <div className="flex flex-wrap items-center gap-1.5 pt-1">
                      <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-sky-500/15 border border-sky-400/30 text-[10.5px] font-mono font-bold text-sky-200">
                        <Swords size={11} className="text-sky-400" />
                        <span>
                          {skillId} Lv.{skillLvl}
                        </span>
                      </span>

                      {topStats.map((statPill) => (
                        <span
                          key={statPill}
                          className="px-2 py-0.5 rounded-md bg-[#121620] border border-white/[0.08] text-[10px] font-mono font-semibold text-slate-300"
                        >
                          {statPill}
                        </span>
                      ))}
                    </div>

                    {/* Equipped Items Strip */}
                    <div className="flex items-center justify-between gap-2 rounded-xl bg-[#090b10]/90 border border-white/[0.07] px-3 py-2">
                      <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar">
                        {equippedIds.length > 0 ? (
                          equippedIds.slice(0, 8).map((itemId, idx) => {
                            const ctx =
                              entry.payload.equipment.itemContexts?.[itemId];
                            const refine = ctx?.refine ?? 0;
                            return (
                              <div
                                key={`${itemId}-${idx}`}
                                className="relative shrink-0 p-1 rounded-lg bg-[#121620] border border-white/10"
                                title={`Item #${itemId}${refine > 0 ? ` (+${refine})` : ""}`}
                              >
                                <CalculatorItemIcon itemId={itemId} size={22} />
                                {refine > 0 && (
                                  <span className="absolute -top-1 -right-1 px-1 rounded bg-amber-500 text-[#090b10] font-mono font-black text-[8px] leading-tight">
                                    +{refine}
                                  </span>
                                )}
                              </div>
                            );
                          })
                        ) : (
                          <span className="text-[11px] text-slate-500 italic">
                            Template de Atributos & Árvore de Skills
                          </span>
                        )}
                        {equippedIds.length > 8 && (
                          <span className="text-[10px] font-mono text-slate-400 px-1">
                            +{equippedIds.length - 8}
                          </span>
                        )}
                      </div>

                      <span className="text-[10px] font-mono text-slate-400 shrink-0">
                        {equippedIds.length} equips
                      </span>
                    </div>
                  </div>

                  {/* Card Footer: 1-Click Import to Calculator + Actions */}
                  <div className="flex items-center justify-between gap-2 pt-3 border-t border-white/[0.08]">
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        handleImportToCalculator(entry);
                      }}
                      className="flex-1 inline-flex items-center justify-center gap-2 h-9 px-4 rounded-xl bg-sky-500/20 hover:bg-sky-500/35 text-sky-100 border border-sky-400/40 text-xs font-bold transition-all cursor-pointer shadow-[0_0_16px_rgba(14,165,233,0.15)]"
                    >
                      <Sparkles size={13} className="text-sky-300" />
                      <span>Importar / Testar na Calculadora</span>
                      <ArrowRight size={13} />
                    </button>

                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        handleDuplicateEntry(entry);
                      }}
                      title="Clonar para Minhas Builds"
                      className="p-2 rounded-xl bg-[#121620] hover:bg-white/10 text-slate-300 border border-white/10 transition-colors cursor-pointer"
                    >
                      <CopyPlus size={14} />
                    </button>

                    {entry.source !== "preset" && (
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          handleDeleteEntry(entry);
                        }}
                        title="Excluir Build"
                        className="p-2 rounded-xl bg-[#121620] hover:bg-rose-950/70 text-slate-400 hover:text-rose-300 border border-white/10 transition-colors cursor-pointer"
                      >
                        <Trash2 size={14} />
                      </button>
                    )}
                  </div>
                </article>
              );
            })}
          </div>
        )}
      </main>
    </div>
  );
}
