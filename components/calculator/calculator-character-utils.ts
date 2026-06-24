import type { CharacterStats } from "@/packages/calculator-core/src";

export type VisibleCalculatorStat = {
  label: string;
  key: keyof Pick<
    CharacterStats,
    | "str"
    | "agi"
    | "vit"
    | "int"
    | "dex"
    | "luk"
    | "pow"
    | "sta"
    | "wis"
    | "spl"
    | "con"
    | "crt"
  >;
  group: "regular" | "trait";
};

export const calculatorStatRows = [
  { label: "STR", key: "str", group: "regular" },
  { label: "AGI", key: "agi", group: "regular" },
  { label: "VIT", key: "vit", group: "regular" },
  { label: "INT", key: "int", group: "regular" },
  { label: "DEX", key: "dex", group: "regular" },
  { label: "LUK", key: "luk", group: "regular" },
] satisfies VisibleCalculatorStat[];

export const calculatorTraitStatRows = [
  { label: "POW", key: "pow", group: "trait" },
  { label: "STA", key: "sta", group: "trait" },
  { label: "WIS", key: "wis", group: "trait" },
  { label: "SPL", key: "spl", group: "trait" },
  { label: "CON", key: "con", group: "trait" },
  { label: "CRT", key: "crt", group: "trait" },
] satisfies VisibleCalculatorStat[];

export function getCalculatorPresetStats(
  preset: "third" | "fourth" | "max",
  isFourthJob: boolean,
): { baseLevel: number; jobLevel: number; stats: CharacterStats } {
  if (preset === "third") {
    return {
      baseLevel: 200,
      jobLevel: 70,
      stats: {
        str: 100,
        agi: 90,
        vit: 100,
        int: 1,
        dex: 100,
        luk: 60,
        pow: 0,
        sta: 0,
        wis: 0,
        spl: 0,
        con: 0,
        crt: 0,
      },
    };
  }

  if (preset === "fourth") {
    return {
      baseLevel: 250,
      jobLevel: 50,
      stats: {
        str: 120,
        agi: 90,
        vit: 100,
        int: 1,
        dex: 100,
        luk: 60,
        pow: 70,
        sta: 0,
        wis: 0,
        spl: 0,
        con: 45,
        crt: 0,
      },
    };
  }

  return {
    baseLevel: 260,
    jobLevel: isFourthJob ? 55 : 70,
    stats: {
      str: 120,
      agi: 90,
      vit: 100,
      int: 1,
      dex: 100,
      luk: 60,
      pow: isFourthJob ? 80 : 0,
      sta: 0,
      wis: 0,
      spl: 0,
      con: isFourthJob ? 45 : 0,
      crt: 0,
    },
  };
}

export function resolveNextCalculatorStats({
  rawValue,
  stat,
  stats,
}: {
  baseLevel: number;
  isFourthJob: boolean;
  isTranscendent?: boolean;
  rawValue: number;
  stat: VisibleCalculatorStat;
  stats: CharacterStats;
}) {
  const min = stat.group === "regular" ? 1 : 0;
  const max = stat.group === "regular" ? 130 : 110;
  const nextValue = Math.max(min, Math.min(max, Math.floor(rawValue || min)));
  const nextStats = {
    ...stats,
    [stat.key]: nextValue,
  };

  return nextStats;
}
