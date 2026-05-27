import { describe, expect, it } from "vitest";
import { JobBasepointsFactory } from "./job-basepoints";

describe("JobBasepointsFactory", () => {
  const factory = new JobBasepointsFactory();

  it("combines HP and SP groups for the same class", () => {
    expect(factory.fromClassAndBaseLevel("Swordman", 99)).toEqual({
      baseHp: 3999,
      baseSp: 208,
      baseAp: 0,
    });
  });

  it("supports grouped class aliases", () => {
    expect(factory.fromClassAndBaseLevel("Knight2", 99)).toEqual({
      baseHp: 7978,
      baseSp: 307,
      baseAp: 0,
    });
  });

  it("uses the nearest lower known level when a class has no exact entry", () => {
    expect(factory.fromClassAndBaseLevel("Swordman", 120)).toEqual({
      baseHp: 3999,
      baseSp: 208,
      baseAp: 0,
    });
  });

  it("supports fourth job AP basepoints", () => {
    expect(factory.fromClassAndBaseLevel("Dragon_Knight", 200)).toEqual({
      baseHp: 0,
      baseSp: 0,
      baseAp: 200,
    });
  });

  it("returns zero basepoints for unknown classes", () => {
    expect(factory.fromClassAndBaseLevel("Unknown", 200)).toEqual({
      baseHp: 0,
      baseSp: 0,
      baseAp: 0,
    });
  });
});
