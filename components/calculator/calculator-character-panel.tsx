"use client";

import { Activity, Sparkles } from "lucide-react";
import {
  evaluateStatusPointBudget,
  type CharacterStats,
  type RoSkill,
} from "@/packages/calculator-core/src";
import { calculatorDemoDataset } from "./calculator-demo-data";
import type { CalculatorDictionary } from "./calculator-i18n";

type VisibleStat = {
  label: string;
  key: keyof Pick<
    CharacterStats,
    "str" | "agi" | "vit" | "int" | "dex" | "luk" | "pow" | "con"
  >;
  group: "regular" | "trait";
};

const statRows = [
  { label: "STR", key: "str", group: "regular" },
  { label: "AGI", key: "agi", group: "regular" },
  { label: "VIT", key: "vit", group: "regular" },
  { label: "INT", key: "int", group: "regular" },
  { label: "DEX", key: "dex", group: "regular" },
  { label: "LUK", key: "luk", group: "regular" },
  { label: "POW", key: "pow", group: "trait" },
  { label: "CON", key: "con", group: "trait" },
] satisfies VisibleStat[];

const buffs = [
  "blessing",
  "increaseAgi",
  "endow",
  "food",
  "guildAura",
  "elementalScroll",
] as const;

type CalculatorCharacterPanelProps = {
  baseLevel: number;
  copy: CalculatorDictionary;
  isTranscendent?: boolean;
  skillLevel: number;
  selectedSkill: RoSkill;
  stats: CharacterStats;
  onSkillChange: (skill: RoSkill) => void;
  onSkillLevelChange: (skillLevel: number) => void;
  onStatsChange: (stats: CharacterStats) => void;
};

export function CalculatorCharacterPanel({
  baseLevel,
  copy,
  isTranscendent,
  skillLevel,
  selectedSkill,
  stats,
  onSkillChange,
  onSkillLevelChange,
  onStatsChange,
}: CalculatorCharacterPanelProps) {
  const statusBudget = evaluateStatusPointBudget({
    baseLevel,
    isTranscendent,
    stats,
  });

  function handleStatChange(stat: VisibleStat, rawValue: number) {
    const min = stat.group === "regular" ? 1 : 0;
    const max = stat.group === "regular" ? 130 : 110;
    const nextValue = Math.max(min, Math.min(max, Math.floor(rawValue || min)));
    const nextStats = {
      ...stats,
      [stat.key]: nextValue,
    };
    const nextBudget = evaluateStatusPointBudget({
      baseLevel,
      isTranscendent,
      stats: nextStats,
    });

    if (nextBudget.regular.isValid && nextBudget.trait.isValid) {
      onStatsChange(nextStats);
    }
  }

  return (
    <aside className="calc-panel calc-character">
      <div className="calc-panel-header">
        <span>
          <Activity size={17} />
          {copy.character.title}
        </span>
        <small>{copy.character.meta}</small>
      </div>

      <div className="calc-select-row">
        <label>
          {copy.character.classLabel}
          <select defaultValue="dragon-knight">
            <option value="dragon-knight">Dragon Knight</option>
            <option value="arch-mage">Arch Mage</option>
            <option value="windhawk">Windhawk</option>
            <option value="cardinal">Cardinal</option>
          </select>
        </label>
        <label>
          {copy.character.skillLabel}
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
          {copy.character.levelLabel}
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
              min={stat.group === "regular" ? 1 : 0}
              max={stat.group === "regular" ? 130 : 110}
              value={stats[stat.key]}
              onChange={(event) =>
                handleStatChange(stat, Number(event.target.value))
              }
            />
          </label>
        ))}
      </div>

      <div className="stat-budget" aria-live="polite">
        <span>
          {copy.character.statusPoints}:{" "}
          <strong>
            {statusBudget.regular.spent}/{statusBudget.regular.available}
          </strong>
          <small>
            {copy.character.remainingPoints}: {statusBudget.regular.remaining}
          </small>
        </span>
        <span>
          {copy.character.traitPoints}:{" "}
          <strong>
            {statusBudget.trait.spent}/{statusBudget.trait.available}
          </strong>
          <small>
            {copy.character.remainingPoints}: {statusBudget.trait.remaining}
          </small>
        </span>
      </div>

      <div className="buff-list">
        {buffs.map((buff) => (
          <button type="button" key={buff}>
            <Sparkles size={14} />
            {copy.buffs[buff]}
          </button>
        ))}
      </div>
    </aside>
  );
}
