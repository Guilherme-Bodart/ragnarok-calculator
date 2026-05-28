import type { DamageBreakdownLine } from "@/packages/calculator-core/src";

export function getBreakdownValue(
  breakdown: Array<Pick<DamageBreakdownLine, "key" | "value">>,
  key: string,
) {
  return breakdown.find((line) => line.key === key)?.value ?? 0;
}
