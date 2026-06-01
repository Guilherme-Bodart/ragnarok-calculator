"use client";

import type { ReactNode } from "react";
import type { SkillTreeSkill } from "@/packages/calculator-core/src";
import {
  getCalculatorSkillTooltip,
  type CalculatorSkillTooltipInfo,
} from "./calculator-skill-tooltip-data";

type CalculatorSkillTooltipProps = {
  children: ReactNode;
  skill: SkillTreeSkill;
};

export function CalculatorSkillTooltip({
  children,
  skill,
}: CalculatorSkillTooltipProps) {
  const tooltip = getCalculatorSkillTooltip(skill.id);
  const lines = tooltip ? getVisibleDescriptionLines(tooltip) : [];
  const levelLines = lines.filter(isLevelLine);
  const detailLines = lines.filter((line) => !isLevelLine(line));

  return (
    <div className="skill-info-tooltip">
      <div className="skill-info-trigger">{children}</div>
      <aside className="skill-info-popover" role="tooltip">
        <header>
          <strong>{tooltip?.name ?? skill.name}</strong>
          <span>Max Lv : {tooltip?.maxLevel ?? skill.maxLevel}</span>
        </header>

        {detailLines.length > 0 ? (
          <div className="skill-info-section">
            {detailLines.map((line, index) => (
              <p data-requirement={isRequirementLine(line)} key={`${line}-${index}`}>
                {line}
              </p>
            ))}
          </div>
        ) : (
          <p className="skill-info-empty">Skill info not available yet.</p>
        )}

        {levelLines.length > 0 ? (
          <div className="skill-info-levels">
            {levelLines.map((line, index) => (
              <p key={`${line}-${index}`}>{line}</p>
            ))}
          </div>
        ) : null}
      </aside>
    </div>
  );
}

function getVisibleDescriptionLines(tooltip: CalculatorSkillTooltipInfo) {
  return tooltip.descriptionLines.filter((line) => {
    if (line === tooltip.name) {
      return false;
    }

    return !line.toLowerCase().startsWith("max lv");
  });
}

function isLevelLine(line: string) {
  return /^\[Lv\s*\d+\]/i.test(line);
}

function isRequirementLine(line: string) {
  return line.toLowerCase().startsWith("skill requirement");
}
