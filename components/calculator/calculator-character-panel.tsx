"use client";

import { Activity } from "lucide-react";
import { Field, FieldValue, Input } from "@/components/ui/field";
import { NumberSelect } from "@/components/ui/number-select";
import { PanelHeader } from "@/components/ui/panel-header";
import { RichSelect } from "@/components/ui/rich-select";
import {
  evaluateStatusPointBudget,
  type CharacterStats,
  type RoSkill,
} from "@/packages/calculator-core/src";
import type { CalculatorDictionary } from "./calculator-i18n";

export type CalculatorPanelSkill = RoSkill & {
  numericId?: number;
};

type VisibleStat = {
  label: string;
  key: keyof Pick<
    CharacterStats,
    | "str"
    | "agi"
    | "vit"
    | "int"
    | "dex"
    | "luk"
    | "pow"
    | "sta"
    | "wis"
    | "spl"
    | "con"
    | "crt"
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
] satisfies VisibleStat[];

const traitStatRows = [
  { label: "POW", key: "pow", group: "trait" },
  { label: "STA", key: "sta", group: "trait" },
  { label: "WIS", key: "wis", group: "trait" },
  { label: "SPL", key: "spl", group: "trait" },
  { label: "CON", key: "con", group: "trait" },
  { label: "CRT", key: "crt", group: "trait" },
] satisfies VisibleStat[];

type CalculatorCharacterPanelProps = {
  availableSkills: CalculatorPanelSkill[];
  baseLevel: number;
  copy: CalculatorDictionary;
  isFourthJob: boolean;
  isTranscendent?: boolean;
  jobLevel: number;
  selectedClassId: string;
  selectedClassName: string;
  skillLevel: number;
  selectedSkill: CalculatorPanelSkill;
  stats: CharacterStats;
  onBaseLevelChange: (baseLevel: number) => void;
  onJobLevelChange: (jobLevel: number) => void;
  onSkillChange: (skill: CalculatorPanelSkill) => void;
  onSkillLevelChange: (skillLevel: number) => void;
  onStatsChange: (stats: CharacterStats) => void;
};

export function CalculatorCharacterPanel({
  availableSkills,
  baseLevel,
  copy,
  isFourthJob,
  isTranscendent,
  jobLevel,
  selectedClassId,
  selectedClassName,
  skillLevel,
  selectedSkill,
  stats,
  onBaseLevelChange,
  onJobLevelChange,
  onSkillChange,
  onSkillLevelChange,
  onStatsChange,
}: CalculatorCharacterPanelProps) {
  const statusBudget = evaluateStatusPointBudget({
    baseLevel,
    isFourthJob,
    isTranscendent,
    stats,
  });
  const skillOptions = [
    {
      label: selectedClassName,
      options: availableSkills.map((skill) => ({
        id: skill.id,
        label: skill.name,
        icon: <SkillOptionIcon name={skill.name} numericId={skill.numericId} />,
      })),
    },
  ];

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
      isFourthJob,
      stats: nextStats,
    });

    if (nextBudget.regular.isValid && nextBudget.trait.isValid) {
      onStatsChange(nextStats);
    }
  }

  return (
    <aside className="calc-panel calc-character">
      <PanelHeader
        icon={<Activity size={17} />}
        title={copy.character.title}
        meta={`Base ${baseLevel} / Job ${jobLevel}`}
      />

      <div className="calc-select-row">
        <Field label={copy.character.classLabel}>
          <FieldValue title={selectedClassId}>{selectedClassName}</FieldValue>
        </Field>
        <Field label="Base">
          <NumberSelect
            max={275}
            prefix="Base"
            value={baseLevel}
            onChange={onBaseLevelChange}
          />
        </Field>
        <Field label="Job">
          <NumberSelect
            max={isFourthJob ? 70 : 60}
            prefix="Job"
            value={jobLevel}
            onChange={onJobLevelChange}
          />
        </Field>
        <Field label={copy.character.skillLabel}>
          <RichSelect
            groups={skillOptions}
            menuSize="compact"
            searchPlaceholder="Filtrar skill"
            value={selectedSkill.id}
            onChange={(skillId) => {
              const nextSkill =
                availableSkills.find((skill) => skill.id === skillId) ??
                selectedSkill;

              onSkillChange(nextSkill);
              onSkillLevelChange(Math.min(skillLevel, nextSkill.maxLevel));
            }}
          />
        </Field>
        <Field label={copy.character.levelLabel}>
          <NumberSelect
            max={selectedSkill.maxLevel}
            prefix="Lv."
            value={skillLevel}
            onChange={onSkillLevelChange}
          />
        </Field>
      </div>

      <div className="stat-grid">
        {[...statRows, ...(isFourthJob ? traitStatRows : [])].map((stat) => (
          <Field label={stat.label} key={stat.key}>
            <Input
              type="number"
              min={stat.group === "regular" ? 1 : 0}
              max={stat.group === "regular" ? 130 : 110}
              value={stats[stat.key]}
              onChange={(event) =>
                handleStatChange(stat, Number(event.target.value))
              }
            />
          </Field>
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
        {isFourthJob ? (
          <span>
            {copy.character.traitPoints}:{" "}
            <strong>
              {statusBudget.trait.spent}/{statusBudget.trait.available}
            </strong>
            <small>
              {copy.character.remainingPoints}: {statusBudget.trait.remaining}
            </small>
          </span>
        ) : null}
      </div>
    </aside>
  );
}

function SkillOptionIcon({
  name,
  numericId,
}: {
  name: string;
  numericId?: number;
}) {
  const initials = name
    .split(" ")
    .map((part) => part[0])
    .join("")
    .slice(0, 2);

  if (typeof numericId !== "number" || !Number.isFinite(numericId) || numericId <= 0) {
    return <span className="skill-tree-icon-fallback">{initials}</span>;
  }

  return (
    // eslint-disable-next-line @next/next/no-img-element
    <img
      className="skill-select-icon"
      src={`https://static.divine-pride.net/images/skill/${numericId}.png`}
      alt=""
      width={24}
      height={24}
      loading="lazy"
    />
  );
}
