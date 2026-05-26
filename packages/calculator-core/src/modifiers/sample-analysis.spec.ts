import { join } from "node:path";
import { describe, expect, it } from "vitest";
import {
  analyzeSamples,
  classifyUnsupportedCommand,
  extractUnsupportedCommand,
  readJsonSampleFile,
  type ItemScriptSample,
} from "./sample-analysis";

const sampleRoot = join(process.cwd(), "..", "nightmare-data");

describe("sample modifier analysis", () => {
  it("smoke tests item scripts from the real sample files", () => {
    const items = readJsonSampleFile<ItemScriptSample[]>(
      join(sampleRoot, "items-sample.json"),
    );
    const skills = readJsonSampleFile<unknown[]>(
      join(sampleRoot, "skills-sample.json"),
    );
    const monsters = readJsonSampleFile<unknown[]>(
      join(sampleRoot, "monsters-sample.json"),
    );

    const report = analyzeSamples({ items, skills, monsters });

    expect(report.samples).toEqual({
      items: 25,
      itemRawScripts: 25,
      skills: 10,
      monsters: 25,
    });
    expect(report.itemScripts).toBe(25);
    expect(report.itemScriptsWithModifiers).toBeGreaterThan(0);
    expect(report.totalModifiers).toBeGreaterThan(0);
    expect(report.unsupportedCommands.length).toBeGreaterThan(0);
    expect(report.unsupportedCommands[0]).toMatchObject({
      command: expect.any(String),
      reason: expect.any(String),
      count: expect.any(Number),
      examples: expect.any(Array),
    });
  });

  it("extracts unsupported command names from raw unsupported statements", () => {
    expect(extractUnsupportedCommand("bonus bMdef,10;")).toBe("bonus bMdef");
    expect(extractUnsupportedCommand("bonus2 bSubRace,RC_DemiHuman,5;")).toBe(
      "bonus2 bSubRace",
    );
    expect(extractUnsupportedCommand("bonus3 bAddEff,Eff_Stun,100,1000;")).toBe(
      "bonus3 bAddEff",
    );
    expect(extractUnsupportedCommand("autobonus \"{ bonus bAtk,1; }\";")).toBe(
      "autobonus",
    );
    expect(extractUnsupportedCommand('}",10,5000;')).toBe("<script-fragment>");
  });

  it("classifies unsupported commands by actionability", () => {
    expect(classifyUnsupportedCommand("if")).toBe("unsupported-condition");
    expect(classifyUnsupportedCommand("autobonus3")).toBe(
      "ignored-runtime-effect",
    );
    expect(classifyUnsupportedCommand("bonus2 bAddMonsterDropItem")).toBe(
      "ignored-drop-effect",
    );
    expect(classifyUnsupportedCommand("bonus2 bSkillCooldown")).toBe(
      "unsupported-non-damage-effect",
    );
    expect(classifyUnsupportedCommand("bonus bAllStats")).toBe(
      "unsupported-stat-effect",
    );
    expect(classifyUnsupportedCommand("bonus2 bSubRace")).toBe(
      "unsupported-bonus-code",
    );
  });
});
