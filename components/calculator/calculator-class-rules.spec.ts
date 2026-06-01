import { describe, expect, it } from "vitest";
import {
  isFourthJobClassId,
  isTranscendentEquivalentClassId,
} from "./calculator-class-rules";

describe("calculator class rules", () => {
  it("treats merged regular third/fourth jobs as transcendent equivalents", () => {
    expect(isTranscendentEquivalentClassId("Dragon_Knight")).toBe(true);
    expect(isTranscendentEquivalentClassId("Arch_Mage")).toBe(true);
    expect(isTranscendentEquivalentClassId("Warlock")).toBe(true);
    expect(isTranscendentEquivalentClassId("Night_Watch")).toBe(false);
  });

  it("identifies fourth jobs independently from transcendent equivalence", () => {
    expect(isFourthJobClassId("Dragon_Knight")).toBe(true);
    expect(isFourthJobClassId("Rune_Knight")).toBe(false);
    expect(isFourthJobClassId("Night_Watch")).toBe(true);
  });
});
