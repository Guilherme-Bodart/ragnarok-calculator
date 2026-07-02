"use client";

import { useState, useMemo } from "react";
import { ChevronDown } from "lucide-react";
import { Modal } from "@/components/ui/modal";
import { calculatorSkillTreeClassGroups } from "./calculator-skill-tree-data";
import { isFourthJobClassId } from "./calculator-class-rules";
import { CalculatorClassOptionPortrait } from "./calculator-class-option-portrait";
import { cn } from "@/lib/utils";

type CalculatorClassSelectorProps = {
  selectedClassId: string;
  onClassChange: (classId: string) => void;
};

function getClassTier(classId: string): number {
  if (isFourthJobClassId(classId)) return 4;
  
  const idStr = classId.toLowerCase();
  
  // 3rd Class
  if (
    idStr.includes("rune_knight") || idStr.includes("royal_guard") ||
    idStr.includes("warlock") || idStr.includes("sorcerer") ||
    idStr.includes("ranger") || idStr.includes("minstrel") || idStr.includes("wanderer") || idStr.includes("maestro") ||
    idStr.includes("arch_bishop") || idStr.includes("sura") ||
    idStr.includes("mechanic") || idStr.includes("genetic") ||
    idStr.includes("guillotine_cross") || idStr.includes("shadow_chaser") ||
    idStr.includes("super_novice_e") || idStr.includes("kagerou") || idStr.includes("oboro") ||
    idStr.includes("rebellion") || idStr.includes("star_emperor") || idStr.includes("soul_reaper") ||
    idStr.includes("emperor") || idStr.includes("reaper")
  ) {
    return 3;
  }
  
  // 1st Class & Novice & Extended
  const firstClasses = [
    "novice", "novice_high", "supernovice", "super_novice", "baby",
    "swordman", "swordman_high", "baby_swordman",
    "mage", "mage_high", "magician", "baby_mage",
    "archer", "archer_high", "baby_archer",
    "acolyte", "acolyte_high", "baby_acolyte",
    "merchant", "merchant_high", "baby_merchant",
    "thief", "thief_high", "baby_thief",
    "ninja", "gunslinger", "taekwon", "taekwon_kid", "summoner", "doram"
  ];
  
  if (firstClasses.includes(idStr)) {
    return 1;
  }

  // Everything else is 2nd Class (Knight, Wizard, Hunter, etc.)
  return 2;
}

const tierLabels: Record<number, string> = {
  4: "4th Class",
  3: "3rd Class",
  2: "2nd Class",
  1: "1st Class",
};

export function CalculatorClassSelector({
  selectedClassId,
  onClassChange,
}: CalculatorClassSelectorProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [activeTier, setActiveTier] = useState<number>(4);

  const allClasses = useMemo(() => calculatorSkillTreeClassGroups.flatMap((g) => g.options), []);
  const currentClass = allClasses.find((c) => c.id === selectedClassId);

  const displayedClasses = useMemo(() => {
    return allClasses.filter((job) => getClassTier(job.id) === activeTier);
  }, [allClasses, activeTier]);

  return (
    <>
      <button
        type="button"
        className="flex items-center justify-between w-full h-10 px-3 py-2 bg-slate-950/60 border border-slate-700/50 rounded-lg text-sm font-medium text-slate-100 hover:bg-slate-900/80 transition-all focus:outline-none focus:ring-1 focus:ring-sky-500/50"
        onClick={() => setIsOpen(true)}
      >
        <div className="flex items-center gap-2">
          {currentClass ? (
            <CalculatorClassOptionPortrait
              classId={currentClass.id}
              name={currentClass.name}
            />
          ) : null}
          <span className="truncate">{currentClass?.name ?? "Selecione uma Classe"}</span>
        </div>
        <ChevronDown size={16} className="text-slate-500" />
      </button>

      {isOpen && (
        <Modal
          ariaLabel="Selecionar Classe"
          closeLabel="Fechar"
          title="Selecionar Classe"
          size="xl"
          onClose={() => setIsOpen(false)}
          className="bg-slate-900/95 border-sky-500/20 backdrop-blur-xl shadow-2xl"
        >
          <div className="flex flex-col p-4 gap-6 min-h-[60vh]">
            
            <div className="flex items-center justify-between border-b border-slate-700/50 pb-4">
              <div className="flex items-center gap-4">
                <span className="text-sm font-semibold text-slate-400 uppercase tracking-wider">Classes</span>
                <div className="relative">
                  <select
                    value={activeTier}
                    onChange={(e) => setActiveTier(Number(e.target.value))}
                    className="appearance-none bg-slate-950/80 border border-slate-700/50 text-slate-200 text-lg font-bold py-2 pl-4 pr-10 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-sky-500 focus:border-sky-500 cursor-pointer"
                  >
                    <option value={4}>4th Class</option>
                    <option value={3}>3rd Class</option>
                    <option value={2}>2nd Class</option>
                    <option value={1}>1st Class</option>
                  </select>
                  <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 text-sky-500 pointer-events-none" size={20} />
                </div>
              </div>
              <span className="text-sm text-slate-500 font-medium italic">Double click to select your class!</span>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-6">
              {displayedClasses.map((job) => {
                const isSelected = job.id === selectedClassId;
                return (
                  <button
                    key={job.id}
                    type="button"
                    onClick={() => {
                      onClassChange(job.id);
                      setIsOpen(false);
                    }}
                    onDoubleClick={() => {
                      onClassChange(job.id);
                      setIsOpen(false);
                    }}
                    className={cn(
                      "flex flex-col items-center justify-between p-2 rounded-md border-2 transition-all duration-300 relative overflow-hidden group aspect-[3/4] shadow-md hover:shadow-xl",
                      isSelected
                        ? "bg-gradient-to-b from-sky-900/40 to-slate-900 border-sky-400 shadow-[0_0_20px_rgba(56,189,248,0.4)]"
                        : "bg-slate-900/60 border-slate-700/50 hover:bg-slate-800 hover:border-sky-500/50 hover:-translate-y-1.5"
                    )}
                  >
                    {/* Background glow */}
                    <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-sky-500/10 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
                    
                    {/* Top right icon placeholder */}
                    <div className="absolute top-2 right-2 w-8 h-8 bg-slate-950/50 rounded flex items-center justify-center border border-slate-700/50 z-20 shadow-sm group-hover:border-sky-500/50 transition-colors">
                       <span className="text-[12px] opacity-70 group-hover:opacity-100 transition-opacity">⚔️</span>
                    </div>

                    <div className="flex-1 w-full flex items-center justify-center relative z-10 pt-6 pb-3">
                      <img
                        src={`/sprites/classes/${job.id}.png`}
                        alt={job.name}
                        className="object-contain w-auto h-[130%] max-h-[160px] drop-shadow-[0_6px_10px_rgba(0,0,0,0.5)] transform translate-y-1 group-hover:scale-110 transition-transform duration-300"
                        loading="lazy"
                        onError={(e) => {
                          (e.target as HTMLImageElement).style.display = 'none';
                        }}
                      />
                    </div>

                    <div className="w-full mt-auto z-20 bg-slate-950/80 py-2 px-2 border-t border-slate-800 shadow-lg group-hover:border-sky-500/30 transition-colors">
                      <span className={cn(
                        "block text-sm font-extrabold text-center drop-shadow-md leading-tight tracking-wide",
                        isSelected ? "text-sky-300" : "text-slate-300 group-hover:text-white"
                      )}>
                        {job.name}
                      </span>
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
