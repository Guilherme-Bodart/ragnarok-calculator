"use client";

import { Search } from "lucide-react";
import type { CalculatorDictionary } from "./calculator-i18n";

type CalculatorSkillTreeToolbarProps = {
  copy: CalculatorDictionary;
  search: string;
  onSearchChange: (search: string) => void;
};

export function CalculatorSkillTreeToolbar({
  copy,
  search,
  onSearchChange,
}: CalculatorSkillTreeToolbarProps) {
  return (
    <div className="skill-tree-toolbar">
      <label>
        {copy.skillTree.searchLabel}
        <span className="skill-tree-search">
          <Search size={15} />
          <input
            type="search"
            value={search}
            placeholder={copy.skillTree.searchPlaceholder}
            onChange={(event) => onSearchChange(event.target.value)}
          />
        </span>
      </label>
    </div>
  );
}
