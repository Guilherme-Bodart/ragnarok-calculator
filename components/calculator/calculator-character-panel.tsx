"use client";

import { Activity } from "lucide-react";
import { Button } from "@/components/ui/button";
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
import { CalculatorSkillIcon } from "./calculator-skill-icon";

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
        icon: <CalculatorSkillIcon name={skill.name} numericId={skill.numericId} />,
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

  function applyPreset(preset: "third" | "fourth" | "max") {
    if (preset === "third") {
      onBaseLevelChange(200);
      onJobLevelChange(70);
      onStatsChange({
        ...stats,
        str: 100,
        agi: 90,
        vit: 100,
        int: 1,
        dex: 100,
        luk: 60,
        pow: 0,
        sta: 0,
        wis: 0,
        spl: 0,
        con: 0,
        crt: 0,
      });
      return;
    }

    if (preset === "fourth") {
      onBaseLevelChange(250);
      onJobLevelChange(50);
      onStatsChange({
        ...stats,
        str: 120,
        agi: 90,
        vit: 100,
        int: 1,
        dex: 100,
        luk: 60,
        pow: 70,
        sta: 0,
        wis: 0,
        spl: 0,
        con: 45,
        crt: 0,
      });
      return;
    }

    onBaseLevelChange(260);
    onJobLevelChange(isFourthJob ? 55 : 70);
    onStatsChange({
      ...stats,
      str: 120,
      agi: 90,
      vit: 100,
      int: 1,
      dex: 100,
      luk: 60,
      pow: isFourthJob ? 80 : 0,
      sta: 0,
      wis: 0,
      spl: 0,
      con: isFourthJob ? 45 : 0,
      crt: 0,
    });
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

      <div className="calc-preset-row">
        <Button type="button" variant="ghost" onClick={() => applyPreset("third")}>
          {copy.character.thirdPreset}
        </Button>
        <Button type="button" variant="ghost" onClick={() => applyPreset("fourth")}>
          {copy.character.fourthPreset}
        </Button>
        <Button type="button" variant="ghost" onClick={() => applyPreset("max")}>
          {copy.character.maxPreset}
        </Button>
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
