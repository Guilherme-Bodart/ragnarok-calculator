"use client";

import { Swords } from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import { Field } from "@/components/ui/field";
import { PanelHeader } from "@/components/ui/panel-header";
import { RichSelect } from "@/components/ui/rich-select";
import type { CalculateDamageResult } from "@/packages/calculator-core/src";
import type { CalculatorDictionary } from "./calculator-i18n";
import {
  searchCalculatorMonsters,
  type CalculatorMonsterDetail,
  type CalculatorMonsterIndexOption,
} from "./calculator-monster-data";
import { getBreakdownValue } from "./calculator-utils";

type CalculatorTargetPanelProps = {
  copy: CalculatorDictionary;
  result: CalculateDamageResult;
  selectedMonster: CalculatorMonsterDetail | null;
  selectedMonsterId: number;
  onMonsterChange: (monsterId: number) => void;
};

export function CalculatorTargetPanel({
  copy,
  result,
  selectedMonster,
  selectedMonsterId,
  onMonsterChange,
}: CalculatorTargetPanelProps) {
  const [monsterQuery, setMonsterQuery] = useState("");
  const [monsterOptions, setMonsterOptions] = useState<
    CalculatorMonsterIndexOption[]
  >([]);
  const totalDamage = result.damage.total.toLocaleString();
  const averageDamage = result.damage.average.toLocaleString();
  const hitCount = getBreakdownValue(result.breakdown, "hits") || result.skill.hitCount;
  const basePower = getBreakdownValue(result.breakdown, "basePower");
  const skillMultiplier = getBreakdownValue(result.breakdown, "skillMultiplier");
  const defenseMultiplier = getBreakdownValue(
    result.breakdown,
    "defenseMultiplier",
  );
  const elementMultiplier = getBreakdownValue(result.breakdown, "elementMultiplier");
  const weaponSizeMultiplier = getBreakdownValue(
    result.breakdown,
    "weaponSizeMultiplier",
  );
  const unsupportedModifierStatements = getBreakdownValue(
    result.breakdown,
    "unsupportedModifierStatements",
  );
  const activeBuffItems = getBreakdownValue(result.breakdown, "activeBuffItems");
  const cycleTimeMs = getBreakdownValue(result.breakdown, "cycleTimeMs");
  const dps = getBreakdownValue(result.breakdown, "dps");
  const options = useMemo(() => {
    const optionById = new Map(
      monsterOptions.map((monster) => [monster.id, monster]),
    );

    if (selectedMonster && !optionById.has(selectedMonster.id)) {
      optionById.set(selectedMonster.id, {
        id: selectedMonster.id,
        name: selectedMonster.name,
        level: selectedMonster.level,
        race: selectedMonster.race,
        size: selectedMonster.size,
        element: selectedMonster.element,
        elementLevel: selectedMonster.elementLevel,
        hp: selectedMonster.hp,
        defense: selectedMonster.defense,
        magicDefense: selectedMonster.magicDefense,
      });
    }

    return Array.from(optionById.values());
  }, [monsterOptions, selectedMonster]);

  useEffect(() => {
    let isCurrent = true;

    searchCalculatorMonsters({ limit: 80, query: monsterQuery })
      .then((monsters) => {
        if (isCurrent) {
          setMonsterOptions(monsters);
        }
      })
      .catch(() => undefined);

    return () => {
      isCurrent = false;
    };
  }, [monsterQuery]);

  return (
    <aside className="calc-panel calc-target">
      <PanelHeader
        icon={<Swords size={17} />}
        title={copy.target.title}
        meta={copy.target.meta}
      />

      <Field className="monster-picker" label={copy.target.monsterLabel}>
        <RichSelect
          value={String(selectedMonsterId)}
          onChange={(monsterId) => onMonsterChange(Number(monsterId))}
          searchValue={monsterQuery}
          onSearchChange={setMonsterQuery}
          searchPlaceholder={copy.target.searchPlaceholder}
          groups={[
            {
              label: copy.target.monsterLabel,
              options: options.map((monster) => ({
                id: String(monster.id),
                label: `${monster.name}${monster.level ? ` Lv. ${monster.level}` : ""}`,
              })),
            },
          ]}
        />
      </Field>

      {selectedMonster ? (
        <div className="target-monster-summary">
          <span>Lv. {selectedMonster.level}</span>
          <span>{selectedMonster.race}</span>
          <span>{selectedMonster.size}</span>
          <span>
            {selectedMonster.element} {selectedMonster.elementLevel}
          </span>
          <span>HP {selectedMonster.hp.toLocaleString()}</span>
          <span>DEF {selectedMonster.defense}</span>
          <span>MDEF {selectedMonster.magicDefense}</span>
        </div>
      ) : null}

      <div className="damage-card">
        <span>{copy.target.totalDamage}</span>
        <strong>{totalDamage}</strong>
        <small>
          {averageDamage} {copy.target.averageHit} / {hitCount}{" "}
          {copy.target.hit} / {result.skill.damageType}
        </small>
      </div>

      <div className="breakdown-list">
        <div>
          <span>{copy.target.precision}</span>
          <strong>{result.meta.precision}</strong>
        </div>
        <div>
          <span>{copy.target.formula}</span>
          <strong>{result.meta.formulaId}</strong>
        </div>
        <div>
          <span>{copy.target.basePower}</span>
          <strong>{basePower}</strong>
        </div>
        <div>
          <span>{copy.target.skillMultiplier}</span>
          <strong>{skillMultiplier.toFixed(2)}x</strong>
        </div>
        <div>
          <span>{copy.target.defenseMitigation}</span>
          <strong>{defenseMultiplier.toFixed(3)}x</strong>
        </div>
        <div>
          <span>{copy.target.elementMultiplier}</span>
          <strong>{elementMultiplier.toFixed(3)}x</strong>
        </div>
        <div>
          <span>{copy.target.sizeMultiplier}</span>
          <strong>{weaponSizeMultiplier.toFixed(3)}x</strong>
        </div>
        <div>
          <span>{copy.target.unsupportedModifiers}</span>
          <strong>{unsupportedModifierStatements}</strong>
        </div>
        <div>
          <span>{copy.target.activeBuffs}</span>
          <strong>{activeBuffItems}</strong>
        </div>
        <div>
          <span>{copy.target.cycleTime}</span>
          <strong>{(cycleTimeMs / 1000).toFixed(2)}s</strong>
        </div>
        <div>
          <span>{copy.target.dps}</span>
          <strong>{dps.toLocaleString()}</strong>
        </div>
        <div>
          <span>{copy.target.source}</span>
          <strong>{copy.target.sourceValue}</strong>
        </div>
      </div>

      {result.meta.warnings.length > 0 ? (
        <div className="target-warning-list">
          {result.meta.warnings.map((warning) => (
            <span key={warning}>{warning}</span>
          ))}
        </div>
      ) : null}
    </aside>
  );
}
