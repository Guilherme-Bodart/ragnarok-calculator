"use client";

import { Sparkles } from "lucide-react";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { PanelHeader } from "@/components/ui/panel-header";
import type { CalculatorDictionary } from "./calculator-i18n";
import type { CalculatorPanelSkill } from "./calculator-character-panel";
import { CalculatorBuffsModal } from "./calculator-buffs-modal";

type ActiveBuffLevels = Record<string, number>;

type CalculatorBuffsPanelProps = {
  activeBuffs: ActiveBuffLevels;
  buffSkills: CalculatorPanelSkill[];
  copy: CalculatorDictionary;
  selectedBuffId: string;
  onActiveBuffsChange: (buffs: ActiveBuffLevels) => void;
  onSelectedBuffChange: (buffId: string) => void;
};

export function CalculatorBuffsPanel({
  activeBuffs,
  buffSkills,
  copy,
  selectedBuffId,
  onActiveBuffsChange,
  onSelectedBuffChange,
}: CalculatorBuffsPanelProps) {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const activeBuffCount = Object.keys(activeBuffs).length;

  return (
    <section className="flex flex-col gap-4 p-5 rounded-xl border border-sky-500/10 bg-slate-900/40 shadow-[0_8px_30px_rgb(0,0,0,0.3)] backdrop-blur-md">
      <PanelHeader
        icon={<Sparkles size={17} className="text-amber-400" />}
        title={copy.buffs.title}
        meta={`${activeBuffCount} ${copy.buffs.activeMeta}`}
      />

      <div className="flex flex-col gap-3 w-full">
        <Button
          className="bg-sky-600 hover:bg-sky-500 text-white shadow-[0_0_15px_rgba(2,132,199,0.5)] border-sky-400/50 h-11 w-full font-bold uppercase tracking-widest"
          type="button"
          onClick={() => setIsModalOpen(true)}
        >
          {copy.buffs.title}
        </Button>
      </div>

      {isModalOpen && (
        <CalculatorBuffsModal
          activeBuffs={activeBuffs}
          buffSkills={buffSkills}
          copy={copy}
          onActiveBuffsChange={onActiveBuffsChange}
          onClose={() => setIsModalOpen(false)}
        />
      )}
    </section>
  );
}
