import { describe, expect, it } from "vitest";
import {
  canDecreaseSkill,
  canIncreaseSkill,
  createSkillTreeCatalog,
  resolveSkillTreeJob,
} from "./skill-tree";

const catalog = createSkillTreeCatalog(
  {
    jobs: {
      Novice: {
        skills: {
          NV_BASIC: { id: "NV_BASIC", maxLevel: 9, requires: [] },
          NV_TRICKDEAD: {
            id: "NV_TRICKDEAD",
            maxLevel: 1,
            exclude: true,
            requires: [],
          },
        },
      },
      Swordman: {
        inherit: { Novice: true },
        skills: {
          SM_BASH: { id: "SM_BASH", maxLevel: 10, requires: [] },
          SM_MAGNUM: {
            id: "SM_MAGNUM",
            maxLevel: 10,
            requires: [{ id: "SM_BASH", level: 5 }],
          },
        },
      },
    },
  },
  [
    { skillId: 1, name: "NV_BASIC", description: "Basic Skill", maxLevel: 9 },
    { skillId: 5, name: "SM_BASH", description: "Bash", maxLevel: 10 },
    { skillId: 7, name: "SM_MAGNUM", description: "Magnum Break", maxLevel: 10 },
  ],
);

describe("skill tree", () => {
  it("resolves inherited skills while skipping inherited excluded skills", () => {
    const resolved = resolveSkillTreeJob(catalog, "Swordman");

    expect(resolved.jobPath.map((job) => job.id)).toEqual([
      "Novice",
      "Swordman",
    ]);
    expect(resolved.skills.map((skill) => skill.id)).toEqual([
      "NV_BASIC",
      "SM_BASH",
      "SM_MAGNUM",
    ]);
  });

  it("validates requirements before increasing skill levels", () => {
    const resolved = resolveSkillTreeJob(catalog, "Swordman");
    const magnumBreak = resolved.skills.find((skill) => skill.id === "SM_MAGNUM");

    expect(magnumBreak).toBeDefined();
    expect(canIncreaseSkill(magnumBreak!, {})).toBe(false);
    expect(canIncreaseSkill(magnumBreak!, { SM_BASH: 5 })).toBe(true);
  });

  it("blocks decreasing a skill that is required by a learned child skill", () => {
    const resolved = resolveSkillTreeJob(catalog, "Swordman");

    expect(canDecreaseSkill(resolved, "SM_BASH", { SM_BASH: 5, SM_MAGNUM: 1 }))
      .toBe(false);
    expect(canDecreaseSkill(resolved, "SM_BASH", { SM_BASH: 6, SM_MAGNUM: 1 }))
      .toBe(true);
  });
});
