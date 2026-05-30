"use client";

import { Search } from "lucide-react";
import { RichSelect, type RichSelectGroup } from "@/components/ui/rich-select";
import type { CalculatorDictionary } from "./calculator-i18n";

type CalculatorSkillTreeToolbarProps = {
  classSelectGroups: RichSelectGroup[];
  copy: CalculatorDictionary;
  search: string;
  selectedClassId: string;
  onClassChange: (classId: string) => void;
  onSearchChange: (search: string) => void;
};

export function CalculatorSkillTreeToolbar({
  classSelectGroups,
  copy,
  search,
  selectedClassId,
  onClassChange,
  onSearchChange,
}: CalculatorSkillTreeToolbarProps) {
  return (
    <div className="skill-tree-toolbar">
      <label>
        {copy.skillTree.classLabel}
        <RichSelect
          groups={classSelectGroups}
          value={selectedClassId}
          searchPlaceholder="Filtrar classe"
          onChange={onClassChange}
        />
      </label>
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
