"use client";

import { useMemo, useState } from "react";
import { Check, ChevronDown, Search, Sparkles } from "lucide-react";
import { Modal } from "@/components/ui/modal";
import { calculatorSkillTreeClassGroups } from "./calculator-skill-tree-data";
import { isFourthJobClassId } from "./calculator-class-rules";
import { CalculatorClassOptionPortrait } from "./calculator-class-option-portrait";
import { cn } from "@/lib/utils";

type CalculatorClassSelectorProps = {
  selectedClassId: string;
  onClassChange: (classId: string) => void;
};

type ClassTierFilter = "all" | "4th" | "3rd";

function getClassTierGroup(classId: string): "4th" | "3rd" {
  return isFourthJobClassId(classId) ? "4th" : "3rd";
}

function getCanonicalSpriteId(classId: string): string {
  return classId.replace(/_T2$/, "").replace(/_T$/, "").replace(/2$/, "");
}

export function CalculatorClassSelector({
  selectedClassId,
  onClassChange,
}: CalculatorClassSelectorProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [activeTier, setActiveTier] = useState<ClassTierFilter>("4th");
  const [searchQuery, setSearchQuery] = useState("");

  const allClasses = useMemo(
    () =>
      calculatorSkillTreeClassGroups.flatMap((group) =>
        group.options.map((opt) => ({
          ...opt,
          branchLabel: group.label,
          tier: getClassTierGroup(opt.id),
        })),
      ),
    [],
  );

  const currentClass = allClasses.find((c) => c.id === selectedClassId);

  const displayedClasses = useMemo(() => {
    const normalizedSearch = searchQuery.trim().toLowerCase();
    return allClasses.filter((job) => {
      if (normalizedSearch) {
        return (
          job.name.toLowerCase().includes(normalizedSearch) ||
          job.branchLabel.toLowerCase().includes(normalizedSearch) ||
          job.id.toLowerCase().includes(normalizedSearch)
        );
      }
      if (activeTier === "all") return true;
      return job.tier === activeTier;
    });
  }, [allClasses, activeTier, searchQuery]);

  return (
    <>
      <button
        type="button"
        className="flex items-center justify-between w-full h-10 px-3 py-2 bg-[#131722] border border-white/10 rounded-lg text-sm font-bold text-slate-100 hover:bg-[#191f2e] hover:border-sky-400/35 transition-colors cursor-pointer focus:outline-none focus:ring-1 focus:ring-sky-500/50"
        onClick={() => setIsOpen(true)}
      >
        <div className="flex items-center gap-2.5 min-w-0">
          {currentClass ? (
            <CalculatorClassOptionPortrait
              classId={currentClass.id}
              name={currentClass.name}
            />
          ) : null}
          <span className="truncate">
            {currentClass?.name ?? "Selecionar Classe"}
          </span>
        </div>
        <ChevronDown size={15} className="text-slate-400 shrink-0" />
      </button>

      {isOpen && (
        <Modal
          ariaLabel="Selecionar Classe"
          closeLabel="Fechar"
          title="Escolher Classe"
          meta="Clique em uma classe para carregá-la imediatamente no planner"
          size="xl"
          onClose={() => setIsOpen(false)}
          className="bg-[#0d1017]/98 border-white/10 backdrop-blur-2xl shadow-2xl"
        >
          <div className="flex flex-col gap-4">
            {/* Filter & Search Toolbar */}
            <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 pb-3 border-b border-white/8">
              <div className="inline-flex items-center gap-1 p-1 rounded-lg bg-[#080a0f] border border-white/8">
                {(
                  [
                    { id: "4th", label: "4ª Classes" },
                    { id: "3rd", label: "3ª & Expandidas" },
                    { id: "all", label: "Todas" },
                  ] as const
                ).map((tab) => (
                  <button
                    key={tab.id}
                    type="button"
                    onClick={() => {
                      setActiveTier(tab.id);
                      setSearchQuery("");
                    }}
                    className={cn(
                      "px-3 py-1.5 rounded-md text-xs font-bold uppercase tracking-wider transition-colors cursor-pointer border",
                      activeTier === tab.id && !searchQuery
                        ? "bg-sky-500/18 text-sky-100 border-sky-400/35"
                        : "bg-transparent text-slate-400 border-transparent hover:text-slate-200 hover:bg-white/5",
                    )}
                  >
                    {tab.label}
                  </button>
                ))}
              </div>

              <div className="relative flex-1 sm:max-w-[260px]">
                <Search
                  size={14}
                  className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500 pointer-events-none"
                />
                <input
                  type="search"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Buscar classe (ex: Arch Mage, Sura)..."
                  className="w-full h-9 pl-8 pr-3 rounded-lg bg-[#080a0f] border border-white/10 text-xs text-slate-100 placeholder:text-slate-500 focus:outline-none focus:border-sky-400/50"
                />
              </div>
            </div>

            {/* Compact PoE2 / Maxroll Style Class Grid */}
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3 max-h-[62vh] overflow-y-auto custom-scrollbar pr-1">
              {displayedClasses.map((job) => {
                const isSelected = job.id === selectedClassId;
                const spriteId = getCanonicalSpriteId(job.id);

                return (
                  <button
                    key={job.id}
                    type="button"
                    onClick={() => {
                      onClassChange(job.id);
                      setIsOpen(false);
                    }}
                    className={cn(
                      "group relative flex flex-col items-center justify-between p-3 rounded-xl border transition-all duration-150 cursor-pointer overflow-hidden text-left",
                      isSelected
                        ? "bg-gradient-to-b from-sky-950/55 via-[#131824] to-[#0e121b] border-sky-400/55 shadow-[0_0_20px_rgba(56,189,248,0.18)]"
                        : "bg-[#121620]/90 border-white/8 hover:bg-[#171c29] hover:border-sky-400/35",
                    )}
                  >
                    {/* Top Branch + Tier Pill */}
                    <div className="w-full flex items-center justify-between gap-1 z-10">
                      <span className="text-[9.5px] font-bold uppercase tracking-wider text-slate-400 truncate">
                        {job.branchLabel}
                      </span>
                      {isSelected ? (
                        <span className="inline-flex items-center gap-0.5 px-1.5 py-0.5 rounded bg-sky-500/20 border border-sky-400/40 text-[9px] font-bold text-sky-200">
                          <Check size={10} /> Ativa
                        </span>
                      ) : (
                        <span
                          className={cn(
                            "px-1.5 py-0.5 rounded text-[9px] font-mono font-bold border",
                            job.tier === "4th"
                              ? "bg-amber-500/12 border-amber-400/25 text-amber-300"
                              : "bg-slate-800/80 border-white/10 text-slate-400",
                          )}
                        >
                          {job.tier === "4th" ? "4th" : "3rd"}
                        </span>
                      )}
                    </div>

                    {/* Sprite Showcase */}
                    <div className="relative flex items-center justify-center w-full h-28 my-1 z-10">
                      <div className="absolute w-16 h-16 rounded-full bg-sky-500/10 blur-xl opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none" />
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img
                        src={`/sprites/classes/${spriteId}.png`}
                        alt={job.name}
                        className="h-24 w-auto object-contain [image-rendering:pixelated] drop-shadow-[0_6px_12px_rgba(0,0,0,0.65)] group-hover:scale-105 transition-transform duration-150"
                        loading="lazy"
                        onError={(e) => {
                          (e.target as HTMLImageElement).style.display = "none";
                        }}
                      />
                    </div>

                    {/* Class Name Footer */}
                    <div className="w-full pt-2 border-t border-white/6 flex items-center justify-between gap-1 z-10">
                      <strong
                        className={cn(
                          "text-xs font-extrabold truncate",
                          isSelected
                            ? "text-sky-200"
                            : "text-slate-100 group-hover:text-white",
                        )}
                      >
                        {job.name}
                      </strong>
                      <Sparkles
                        size={11}
                        className={cn(
                          "shrink-0 transition-opacity",
                          isSelected
                            ? "text-sky-400 opacity-100"
                            : "text-slate-500 opacity-0 group-hover:opacity-100",
                        )}
                      />
                    </div>
                  </button>
                );
              })}
            </div>
          </div>
        </Modal>
      )}
    </>
  );
}
