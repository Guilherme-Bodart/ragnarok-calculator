"use client";

import { Sparkles, X } from "lucide-react";
import { useMemo } from "react";
import { Button } from "@/components/ui/button";
import { Field } from "@/components/ui/field";
import { IconButton } from "@/components/ui/icon-button";
import { NumberSelect } from "@/components/ui/number-select";
import { PanelHeader } from "@/components/ui/panel-header";
import { RichSelect } from "@/components/ui/rich-select";
import type { CalculatorDictionary } from "./calculator-i18n";
import type { CalculatorPanelSkill } from "./calculator-character-panel";
import { CalculatorSkillIcon } from "./calculator-skill-icon";

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
  const selectedBuff = buffSkills.find((skill) => skill.id === selectedBuffId);
  const activeBuffEntries = useMemo(
    () =>
      Object.entries(activeBuffs)
        .map(([buffId, level]) => {
          const skill = buffSkills.find((buffSkill) => buffSkill.id === buffId);

          return skill ? { level, skill } : null;
        })
        .filter((entry): entry is { level: number; skill: CalculatorPanelSkill } =>
          Boolean(entry),
        ),
    [activeBuffs, buffSkills],
  );

  function addBuff() {
    if (!selectedBuff) {
      return;
    }

    onActiveBuffsChange({
      ...activeBuffs,
      [selectedBuff.id]: activeBuffs[selectedBuff.id] ?? selectedBuff.maxLevel,
    });
  }

  function setBuffLevel(buffId: string, level: number) {
    onActiveBuffsChange({
      ...activeBuffs,
      [buffId]: level,
    });
  }

  function removeBuff(buffId: string) {
    const nextBuffs = { ...activeBuffs };
    delete nextBuffs[buffId];
    onActiveBuffsChange(nextBuffs);
  }

  return (
    <section className="calc-panel calc-buffs">
      <PanelHeader
        icon={<Sparkles size={17} />}
        title={copy.buffs.title}
        meta={`${activeBuffEntries.length} ${copy.buffs.activeMeta}`}
      />

      <div className="calc-buff-picker">
        <Field label={copy.buffs.skillLabel}>
          <RichSelect
            groups={[
              {
                label: copy.buffs.classGroup,
                options: buffSkills.map((skill) => ({
                  id: skill.id,
                  label: skill.name,
                  icon: (
                    <CalculatorSkillIcon
                      name={skill.name}
                      numericId={skill.numericId}
                    />
                  ),
                })),
              },
            ]}
            menuSize="compact"
            searchPlaceholder={copy.buffs.searchPlaceholder}
            value={selectedBuff?.id ?? buffSkills[0]?.id ?? ""}
            onChange={onSelectedBuffChange}
          />
        </Field>
        <Button
          disabled={!selectedBuff}
          type="button"
          variant="secondary"
          onClick={addBuff}
        >
          {copy.buffs.addAction}
        </Button>
      </div>

      {activeBuffEntries.length > 0 ? (
        <div className="calc-buff-list">
          {activeBuffEntries.map(({ level, skill }) => (
            <div className="calc-buff-row" key={skill.id}>
              <CalculatorSkillIcon name={skill.name} numericId={skill.numericId} />
              <strong>{skill.name}</strong>
              <NumberSelect
                max={skill.maxLevel}
                prefix="Lv."
                value={level}
                onChange={(nextLevel) => setBuffLevel(skill.id, nextLevel)}
              />
              <IconButton
                label={copy.buffs.removeAction}
                type="button"
                onClick={() => removeBuff(skill.id)}
              >
                <X size={15} />
              </IconButton>
            </div>
          ))}
        </div>
      ) : (
        <p className="calc-empty-state">{copy.buffs.emptyState}</p>
      )}
    </section>
  );
}
