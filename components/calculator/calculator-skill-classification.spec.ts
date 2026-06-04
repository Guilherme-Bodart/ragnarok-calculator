import { describe, expect, it } from "vitest";
import { getCalculatorClassSkills } from "./calculator-skill-classification";
import { calculatorSkillTreeCatalog } from "./calculator-skill-tree-data";

describe("calculator skill classification", () => {
  it("uses tooltip level multipliers when available", () => {
    const skills = getCalculatorClassSkills(
      calculatorSkillTreeCatalog,
      "Dragon_Knight",
    );
    const bowlingBash = skills.find((skill) => skill.id === "KN_BOWLINGBASH");

    expect(bowlingBash?.baseMultiplierByLevel["1"]).toBe(140);
    expect(bowlingBash?.baseMultiplierByLevel["10"]).toBe(500);
  });

  it("uses tooltip hit counts for bolt skills", () => {
    const skills = getCalculatorClassSkills(calculatorSkillTreeCatalog, "Arch_Mage");
    const coldBolt = skills.find((skill) => skill.id === "MG_COLDBOLT");

    expect(coldBolt?.baseMultiplierByLevel["10"]).toBe(100);
    expect(coldBolt?.hitCountByLevel?.["10"]).toBe(10);
    expect(coldBolt?.hitCount).toBe(10);
  });
});
