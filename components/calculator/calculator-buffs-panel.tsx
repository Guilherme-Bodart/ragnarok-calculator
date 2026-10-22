"use client";

import { Plus, Sparkles, Trash2, X } from "lucide-react";
import { useMemo, useState } from "react";
import { Button } from "@/components/ui/button";
import { PanelHeader } from "@/components/ui/panel-header";
import type { CalculatorDictionary } from "./calculator-i18n";
import type { CalculatorPanelSkill } from "./calculator-character-panel";
import { CalculatorBuffsModal } from "./calculator-buffs-modal";
import { useCalculatorBuildStore } from "./calculator-build-store";
import { CalculatorSkillIcon } from "./calculator-skill-icon";
import { getCalculatorBuffPreview } from "./calculator-buff-data";

type CalculatorBuffsPanelProps = {
  buffSkills: CalculatorPanelSkill[];
  copy: CalculatorDictionary;
};

export function CalculatorBuffsPanel({
  buffSkills,
  copy,
}: CalculatorBuffsPanelProps) {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const activeBuffs = useCalculatorBuildStore((s) => s.activeBuffs);
  const setActiveBuffs = useCalculatorBuildStore((s) => s.setActiveBuffs);

  const activeBuffEntries = useMemo(() => {
    const skillById = new Map(buffSkills.map((s) => [s.id, s]));
    return Object.entries(activeBuffs)
      .filter(([, level]) => level > 0)
      .map(([id, level]) => {
        const skill = skillById.get(id);
        return {
          id,
          level,
          name: skill?.name ?? id,
          numericId: skill?.numericId,
          maxLevel: skill?.maxLevel ?? 1,
          preview: getCalculatorBuffPreview(id),
        };
      });
  }, [activeBuffs, buffSkills]);

  function removeBuff(skillId: string) {
    const next = { ...activeBuffs };
    delete next[skillId];
    setActiveBuffs(next);
  }

  function clearAllBuffs() {
    setActiveBuffs({});
  }

  return (
    <section className="flex flex-col gap-4 p-5 rounded-2xl border border-sky-500/15 bg-[#020612]/75 shadow-[0_12px_36px_rgb(0,0,0,0.45)] backdrop-blur-xl">
      <div className="flex items-center justify-between gap-2">
        <PanelHeader
          icon={<Sparkles size={17} className="text-amber-400" />}
          title={copy.buffs.title}
          meta={`${activeBuffEntries.length} ${copy.buffs.activeMeta}`}
        />

        {activeBuffEntries.length > 0 && (
          <button
            type="button"
            onClick={clearAllBuffs}
            className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-[11px] font-bold text-rose-300/90 hover:text-rose-200 bg-rose-950/30 hover:bg-rose-950/60 border border-rose-500/25 transition-colors cursor-pointer"
            title="Desativar todos os buffs"
          >
            <Trash2 size={12} />
            Limpar
          </button>
        )}
      </div>

      {activeBuffEntries.length > 0 ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
          {activeBuffEntries.map((buff) => (
            <div
              key={buff.id}
              className="group flex items-center justify-between gap-2.5 px-3 py-2 rounded-xl bg-slate-900/75 border border-sky-500/20 hover:border-sky-400/40 transition-all"
            >
              <div className="flex items-center gap-2.5 min-w-0">
                <div className="shrink-0 p-1 rounded-lg bg-slate-950/80 border border-slate-800">
                  <CalculatorSkillIcon
                    name={buff.name}
                    numericId={buff.numericId}
                  />
                </div>
                <div className="flex flex-col min-w-0">
                  <div className="flex items-center gap-1.5 min-w-0">
                    <strong className="text-xs font-bold text-slate-100 truncate">
                      {buff.name}
                    </strong>
                    {buff.maxLevel > 1 && (
                      <span className="shrink-0 px-1.5 py-0.5 rounded bg-sky-500/15 border border-sky-400/30 text-[10px] font-mono font-bold text-sky-300">
                        Lv.{buff.level}
                      </span>
                    )}
                  </div>
                  {buff.preview && (
                    <span className="text-[10px] text-slate-400 truncate">
                      {buff.preview}
                    </span>
                  )}
                </div>
              </div>

              <button
                type="button"
                onClick={() => removeBuff(buff.id)}
                className="shrink-0 p-1 rounded-md text-slate-500 hover:text-rose-300 hover:bg-rose-950/40 transition-colors cursor-pointer"
                aria-label={`Remover ${buff.name}`}
              >
                <X size={14} />
              </button>
            </div>
          ))}
        </div>
      ) : (
        <div className="flex items-center justify-center py-4 px-3 rounded-xl border border-dashed border-slate-800 bg-slate-950/30 text-xs text-slate-400">
          Nenhum buff ou consumível ativo no momento.
        </div>
      )}

      <div className="flex flex-col gap-3 w-full">
        <Button
          icon={<Plus size={15} />}
          className="bg-sky-600/90 hover:bg-sky-500 text-white shadow-[0_0_20px_rgba(2,132,199,0.35)] border-sky-400/40 h-10 w-full font-bold uppercase tracking-wider text-xs"
          type="button"
          onClick={() => setIsModalOpen(true)}
        >
          Gerenciar {copy.buffs.title}
        </Button>
      </div>

      {isModalOpen && (
        <CalculatorBuffsModal
          buffSkills={buffSkills}
          copy={copy}
          onClose={() => setIsModalOpen(false)}
        />
      )}
    </section>
  );
}
