import { describe, expect, it } from "vitest";
import { getSkillTooltipFormulaData } from "./calculator-skill-tooltip-formula";

describe("getSkillTooltipFormulaData", () => {
  it("extracts physical ATK multipliers by level", () => {
    expect(
      getSkillTooltipFormulaData([
        "[Lv 1] : ATK 120%",
        "[Lv10] : ATK 300%",
      ]),
    ).toEqual({
      baseMultiplierByLevel: {
        "1": 120,
        "10": 300,
      },
      hitCount: undefined,
      hitCountByLevel: undefined,
    });
  });

  it("extracts magical MATK multipliers and hit counts", () => {
    expect(
      getSkillTooltipFormulaData([
        "[Lv 1] : MATK 900% X 2times",
        "[Lv 5] : MATK 1500% X 3times",
      ]),
    ).toEqual({
      baseMultiplierByLevel: {
        "1": 900,
        "5": 1500,
      },
      hitCount: 3,
      hitCountByLevel: {
        "1": 2,
        "5": 3,
      },
    });
  });

  it("returns null when the tooltip has no damage formula lines", () => {
    expect(
      getSkillTooltipFormulaData([
        "Skill Form : Active",
        "Description: Move faster for a short time.",
      ]),
    ).toBeNull();
  });
});
