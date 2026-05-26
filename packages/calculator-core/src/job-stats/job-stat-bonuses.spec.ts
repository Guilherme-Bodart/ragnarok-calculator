import { describe, expect, it } from "vitest";
import { JobStatBonusFactory } from "./job-stat-bonuses";

describe("JobStatBonusFactory", () => {
  const factory = new JobStatBonusFactory();

  it("sums base stat bonuses up to the given job level", () => {
    expect(factory.fromClassAndJobLevel("Swordman", 10)).toMatchObject({
      str: 1,
      vit: 1,
      dex: 1,
    });
  });

  it("supports grouped class aliases", () => {
    expect(factory.fromClassAndJobLevel("Knight2", 5)).toMatchObject({
      str: 1,
      vit: 2,
      luk: 1,
    });
  });

  it("sums fourth job trait bonuses", () => {
    expect(factory.fromClassAndJobLevel("Dragon_Knight", 5)).toMatchObject({
      str: 1,
      agi: 2,
      vit: 1,
      dex: 2,
      pow: 1,
      spl: 1,
      con: 1,
      crt: 1,
    });
  });

  it("returns zero bonuses for unknown classes", () => {
    expect(factory.fromClassAndJobLevel("Unknown", 50)).toMatchObject({
      str: 0,
      pow: 0,
      con: 0,
    });
  });
});
