"use client";

import { Activity, Sparkles } from "lucide-react";
import type { CharacterStats, RoSkill } from "@/packages/calculator-core/src";
import { calculatorDemoDataset } from "./calculator-demo-data";

type VisibleStat = {
  label: string;
  key: keyof Pick<
    CharacterStats,
    "str" | "agi" | "vit" | "int" | "dex" | "luk" | "pow" | "con"
  >;
};

const statRows = [
  { label: "STR", key: "str" },
  { label: "AGI", key: "agi" },
  { label: "VIT", key: "vit" },
  { label: "INT", key: "int" },
  { label: "DEX", key: "dex" },
  { label: "LUK", key: "luk" },
  { label: "POW", key: "pow" },
  { label: "CON", key: "con" },
] satisfies VisibleStat[];

const buffs = [
  "Blessing",
  "Increase AGI",
  "Endow",
  "Food +10",
  "Guild Aura",
  "Elemental Scroll",
];

type CalculatorCharacterPanelProps = {
  skillLevel: number;
  selectedSkill: RoSkill;
  stats: CharacterStats;
  onSkillChange: (skill: RoSkill) => void;
  onSkillLevelChange: (skillLevel: number) => void;
  onStatsChange: (stats: CharacterStats) => void;
};

export function CalculatorCharacterPanel({
  skillLevel,
  selectedSkill,
  stats,
  onSkillChange,
  onSkillLevelChange,
  onStatsChange,
}: CalculatorCharacterPanelProps) {
  return (
    <aside className="calc-panel calc-character">
      <div className="calc-panel-header">
        <span>
          <Activity size={17} />
          Character
        </span>
        <small>Base 260 / Job 55</small>
      </div>

      <div className="calc-select-row">
        <label>
          Class
          <select defaultValue="dragon-knight">
            <option value="dragon-knight">Dragon Knight</option>
            <option value="arch-mage">Arch Mage</option>
            <option value="windhawk">Windhawk</option>
            <option value="cardinal">Cardinal</option>
          </select>
        </label>
        <label>
          Skill
          <select
            value={selectedSkill.id}
            onChange={(event) => {
              const nextSkill =
                calculatorDemoDataset.skills.find(
                  (skill) => skill.id === event.target.value,
                ) ?? calculatorDemoDataset.skills[0];

              onSkillChange(nextSkill);
              onSkillLevelChange(Math.min(skillLevel, nextSkill.maxLevel));
            }}
          >
            {calculatorDemoDataset.skills.map((skill) => (
              <option value={skill.id} key={skill.id}>
                {skill.name}
              </option>
            ))}
          </select>
        </label>
        <label>
          Level
          <select
            value={skillLevel}
            onChange={(event) => onSkillLevelChange(Number(event.target.value))}
          >
            {Array.from({ length: selectedSkill.maxLevel }, (_, index) => {
              const level = index + 1;

              return (
                <option value={level} key={level}>
                  Lv.{level}
                </option>
              );
            })}
          </select>
        </label>
      </div>

      <div className="stat-grid">
        {statRows.map((stat) => (
          <label key={stat.key}>
            <span>{stat.label}</span>
            <input
              type="number"
              value={stats[stat.key]}
              onChange={(event) =>
                onStatsChange({
                  ...stats,
                  [stat.key]: Number(event.target.value),
                })
              }
            />
          </label>
        ))}
      </div>

      <div className="buff-list">
        {buffs.map((buff) => (
          <button type="button" key={buff}>
            <Sparkles size={14} />
            {buff}
          </button>
        ))}
      </div>
    </aside>
  );
}
