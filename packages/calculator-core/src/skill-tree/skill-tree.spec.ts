import { describe, expect, it } from "vitest";
import {
  canDecreaseSkill,
  canIncreaseSkill,
  createSkillTreeCatalog,
  increaseSkillWithRequirements,
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
          SM_ENDURE: {
            id: "SM_ENDURE",
            maxLevel: 10,
            requires: [{ id: "SM_MAGNUM", level: 7 }],
          },
        },
      },
    },
  },
  [
    { skillId: 1, name: "NV_BASIC", description: "Basic Skill", maxLevel: 9 },
    { skillId: 5, name: "SM_BASH", description: "Bash", maxLevel: 10 },
    { skillId: 7, name: "SM_MAGNUM", description: "Magnum Break", maxLevel: 10 },
    { skillId: 8, name: "SM_ENDURE", description: "Endure", maxLevel: 10 },
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
      "SM_ENDURE",
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

  it("increases a locked skill while learning recursive requirements", () => {
    const resolved = resolveSkillTreeJob(catalog, "Swordman");

    expect(increaseSkillWithRequirements(resolved, "SM_MAGNUM", {})).toEqual({
      SM_BASH: 5,
      SM_MAGNUM: 1,
    });
    expect(increaseSkillWithRequirements(resolved, "SM_ENDURE", {})).toEqual({
      SM_BASH: 5,
      SM_MAGNUM: 7,
      SM_ENDURE: 1,
    });
  });

  it("uses pre-resolved jobs without moving duplicate skills to later classes", () => {
    const resolvedCatalog = createSkillTreeCatalog(
      {
        jobs: {
          Lord_Knight: {
            skills: {
              LK_BERSERK: { id: "LK_BERSERK", maxLevel: 1, requires: [] },
            },
          },
          Dragon_Knight: {
            inherit: { Lord_Knight: true },
            skills: {
              LK_BERSERK: { id: "LK_BERSERK", maxLevel: 1, requires: [] },
              DK_SERVANT: { id: "DK_SERVANT", maxLevel: 5, requires: [] },
            },
          },
        },
        resolvedJobs: {
          Dragon_Knight: {
            id: "Dragon_Knight",
            name: "Dragon Knight",
            jobPath: [
              { id: "Lord_Knight", name: "Lord Knight" },
              { id: "Dragon_Knight", name: "Dragon Knight" },
            ],
            skillOrder: ["LK_BERSERK", "DK_SERVANT"],
            skills: {
              LK_BERSERK: {
                id: "LK_BERSERK",
                maxLevel: 1,
                requires: [],
                sourceJobId: "Lord_Knight",
                sourceJobName: "Lord Knight",
                displaySourceJobId: "Lord_Knight",
              },
              DK_SERVANT: {
                id: "DK_SERVANT",
                maxLevel: 5,
                requires: [],
                sourceJobId: "Dragon_Knight",
                sourceJobName: "Dragon Knight",
                displaySourceJobId: "Dragon_Knight",
              },
            },
          },
        },
      },
      [
        {
          skillId: 100,
          name: "LK_BERSERK",
          description: "Frenzy",
          maxLevel: 1,
        },
        {
          skillId: 101,
          name: "DK_SERVANT",
          description: "Servant Weapon",
          maxLevel: 5,
        },
      ],
    );

    const resolved = resolveSkillTreeJob(resolvedCatalog, "Dragon_Knight");

    expect(resolved.skills.map((skill) => skill.id)).toEqual([
      "LK_BERSERK",
      "DK_SERVANT",
    ]);
    expect(resolved.skills[0]).toMatchObject({
      id: "LK_BERSERK",
      sourceJobId: "Lord_Knight",
      sourceJobName: "Lord Knight",
      displaySourceJobId: "Lord_Knight",
    });
  });
});
