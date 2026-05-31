import { describe, expect, it } from "vitest";
import type { SkillTreeSkill } from "@/packages/calculator-core/src";
import {
  createCompactSkillGroups,
  layoutSkillTreeSkills,
} from "./calculator-skill-tree-layout";

function skill(
  id: string,
  sourceJobId: string,
  requirements: SkillTreeSkill["requirements"] = [],
): SkillTreeSkill {
  return {
    id,
    name: id,
    maxLevel: 10,
    baseLevel: 1,
    jobLevel: 1,
    sourceJobId,
    sourceJobName: sourceJobId,
    requirements,
  };
}

describe("calculator skill tree layout", () => {
  it("keeps every generated board column at six rows or less when possible", () => {
    const skills = Array.from({ length: 12 }, (_, index) =>
      skill(`SKILL_${index}`, "Wizard"),
    );
    const layout = layoutSkillTreeSkills(skills);

    expect(layout.columnCount).toBe(7);
    expect(layout.cells.length / layout.columnCount).toBeLessThanOrEqual(6);
  });

  it("groups merged job labels and applies point limits by progression", () => {
    const groups = createCompactSkillGroups(
      [
        { id: "Novice", name: "Novice" },
        { id: "Mage", name: "Mage" },
        { id: "Wizard", name: "Wizard" },
        { id: "High_Wizard", name: "High Wizard" },
      ],
      [skill("NV_BASIC", "Novice"), skill("MG_FIREBOLT", "Mage")],
    );

    expect(groups[0]).toMatchObject({
      label: "Mage",
      pointLimit: 50,
    });
    expect(groups.map((group) => group.pointLimit)).toEqual([50]);
  });
});
