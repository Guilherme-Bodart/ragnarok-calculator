"use client";

import { Sparkles } from "lucide-react";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { PanelHeader } from "@/components/ui/panel-header";
import type { CalculatorDictionary } from "./calculator-i18n";
import type { CalculatorPanelSkill } from "./calculator-character-panel";
import { CalculatorBuffsModal } from "./calculator-buffs-modal";
import { useCalculatorBuildStore } from "./calculator-build-store";

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
          buffSkills={buffSkills}
          copy={copy}
          onClose={() => setIsModalOpen(false)}
        />
      )}
    </section>
  );
}
