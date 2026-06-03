"use client";

import { useEffect, useRef, useState, type ReactNode } from "react";
import { createPortal } from "react-dom";
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
  const triggerRef = useRef<HTMLSpanElement>(null);
  const [isOpen, setIsOpen] = useState(false);
  const [position, setPosition] = useState({ left: 0, top: 0 });
  const tooltip = getCalculatorSkillTooltip(skill.id);
  const lines = tooltip ? getVisibleDescriptionLines(tooltip) : [];
  const levelLines = lines.filter(isLevelLine);
  const detailLines = lines.filter((line) => !isLevelLine(line));
  const popover = (
    <aside
      className="skill-info-popover"
      data-open={isOpen}
      role="tooltip"
      style={{
        left: position.left,
        top: position.top,
      }}
    >
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
  );

  useEffect(() => {
    if (!isOpen) {
      return;
    }

    function updatePosition() {
      const rect = triggerRef.current?.getBoundingClientRect();

      if (!rect) {
        return;
      }

      setPosition({
        left: Math.min(window.innerWidth - 180, Math.max(180, rect.left + rect.width / 2)),
        top: Math.max(12, rect.top - 12),
      });
    }

    updatePosition();
    window.addEventListener("scroll", updatePosition, true);
    window.addEventListener("resize", updatePosition);

    return () => {
      window.removeEventListener("scroll", updatePosition, true);
      window.removeEventListener("resize", updatePosition);
    };
  }, [isOpen]);

  return (
    <span
      className="skill-info-tooltip"
      ref={triggerRef}
      onBlur={() => setIsOpen(false)}
      onFocus={() => setIsOpen(true)}
      onMouseEnter={() => setIsOpen(true)}
      onMouseLeave={() => setIsOpen(false)}
    >
      {children}
      {isOpen && typeof document !== "undefined"
        ? createPortal(popover, document.body)
        : null}
    </span>
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
