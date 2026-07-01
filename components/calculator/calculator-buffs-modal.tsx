"use client";

import { useState } from "react";
import { Sparkles, FlaskConical } from "lucide-react";
import { Modal } from "@/components/ui/modal";
import { TabButton, Tabs } from "@/components/ui/tabs";
import { NumberSelect } from "@/components/ui/number-select";
import type { CalculatorDictionary } from "./calculator-i18n";
import type { CalculatorPanelSkill } from "./calculator-character-panel";
import { CalculatorSkillIcon } from "./calculator-skill-icon";
import { getCalculatorBuffGroup, getCalculatorBuffPreview } from "./calculator-buff-data";

type CalculatorBuffsModalProps = {
  activeBuffs: Record<string, number>;
  buffSkills: CalculatorPanelSkill[];
  copy: CalculatorDictionary;
  onActiveBuffsChange: (buffs: Record<string, number>) => void;
  onClose: () => void;
};

export function CalculatorBuffsModal({
  activeBuffs,
  buffSkills,
  copy,
  onActiveBuffsChange,
  onClose,
}: CalculatorBuffsModalProps) {
  const [activeTab, setActiveTab] = useState<"buffs" | "consumables">("buffs");

  const classSkills = buffSkills.filter(
    (skill) => getCalculatorBuffGroup(skill.id) === "class-skill",
  );
  const manualSkills = buffSkills.filter(
    (skill) => getCalculatorBuffGroup(skill.id) === "manual",
  );
  const consumableSkills = buffSkills.filter(
    (skill) => getCalculatorBuffGroup(skill.id) === "consumable",
  );

  function toggleBuff(skillId: string, maxLevel: number) {
    const nextBuffs = { ...activeBuffs };
    if (nextBuffs[skillId]) {
      delete nextBuffs[skillId];
    } else {
      nextBuffs[skillId] = maxLevel;
    }
    onActiveBuffsChange(nextBuffs);
  }

  function setBuffLevel(skillId: string, level: number) {
    if (!activeBuffs[skillId]) return;
    onActiveBuffsChange({
      ...activeBuffs,
      [skillId]: level,
    });
  }

  const renderBuffRow = (skill: CalculatorPanelSkill) => {
    const isActive = Boolean(activeBuffs[skill.id]);
    const level = activeBuffs[skill.id] || skill.maxLevel;

    return (
      <div
        key={skill.id}
        className={`flex items-center gap-3 p-3 rounded-lg border transition-all duration-300 ${
          isActive
            ? "bg-sky-900/40 border-sky-500/50 shadow-[inset_0_0_20px_rgba(2,132,199,0.2)]"
            : "bg-slate-900/60 border-slate-700/50 hover:bg-slate-800/80 hover:border-slate-600/60"
        }`}
      >
        <button
          type="button"
          onClick={() => toggleBuff(skill.id, skill.maxLevel)}
          className="shrink-0 p-1 bg-slate-950/50 rounded-md border border-slate-700/50 shadow-sm cursor-pointer hover:ring-2 hover:ring-sky-500/50 transition-all"
        >
          <CalculatorSkillIcon name={skill.name} numericId={skill.numericId} />
        </button>
        <div className="flex flex-col flex-grow min-w-0">
          <strong className="text-sm text-slate-100 font-medium truncate">
            {skill.name}
          </strong>
          <small className="text-[10px] text-slate-500 truncate">
            {getCalculatorBuffPreview(skill.id)}
          </small>
        </div>

        {skill.maxLevel > 1 && isActive && (
          <NumberSelect
            max={skill.maxLevel}
            prefix="Lv."
            value={level}
            onChange={(nextLevel) => setBuffLevel(skill.id, nextLevel)}
          />
        )}

        <button
          type="button"
          role="switch"
          aria-checked={isActive}
          onClick={() => toggleBuff(skill.id, skill.maxLevel)}
          className={`shrink-0 relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-sky-500 focus-visible:ring-offset-2 focus-visible:ring-offset-slate-900 ${
            isActive ? "bg-sky-500" : "bg-slate-700"
          }`}
        >
          <span
            className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
              isActive ? "translate-x-6" : "translate-x-1"
            }`}
          />
        </button>
      </div>
    );
  };

  return (
    <Modal
      icon={<Sparkles size={18} className="text-amber-400" />}
      title={copy.buffs.title}
      onClose={onClose}
    >
      <div className="flex flex-col gap-4 p-4 w-[600px] max-w-full">
        <Tabs label="Buff Categories">
          <TabButton
            active={activeTab === "buffs"}
            onClick={() => setActiveTab("buffs")}
          >
            <Sparkles size={14} className="mr-2" /> Skills & Buffs
          </TabButton>
          <TabButton
            active={activeTab === "consumables"}
            onClick={() => setActiveTab("consumables")}
          >
            <FlaskConical size={14} className="mr-2" /> Consumíveis
          </TabButton>
        </Tabs>

        <div className="flex flex-col gap-6 overflow-y-auto max-h-[60vh] pr-2 custom-scrollbar">
          {activeTab === "buffs" && (
            <>
              {classSkills.length > 0 && (
                <section className="flex flex-col gap-2">
                  <h3 className="text-xs font-bold text-slate-400 uppercase tracking-widest pl-1 border-l-2 border-sky-500">
                    Buffs da Classe
                  </h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                    {classSkills.map(renderBuffRow)}
                  </div>
                </section>
              )}

              {manualSkills.length > 0 && (
                <section className="flex flex-col gap-2 mt-2">
                  <h3 className="text-xs font-bold text-slate-400 uppercase tracking-widest pl-1 border-l-2 border-emerald-500">
                    Buffs Gerais
                  </h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                    {manualSkills.map(renderBuffRow)}
                  </div>
                </section>
              )}
            </>
          )}

          {activeTab === "consumables" && (
            <section className="flex flex-col gap-2">
              <h3 className="text-xs font-bold text-slate-400 uppercase tracking-widest pl-1 border-l-2 border-amber-500">
                Itens Consumíveis
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                {consumableSkills.map(renderBuffRow)}
              </div>
            </section>
          )}
        </div>
      </div>
    </Modal>
  );
}
