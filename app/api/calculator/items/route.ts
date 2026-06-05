import { NextResponse } from "next/server";
import { isCalculatorItemSearchReady } from "@/lib/calculator-item-search";
import { searchItemIndex } from "./item-server-data";

export function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const kind = searchParams.get("kind");
  const slot = searchParams.get("slot");
  const query = searchParams.get("q") ?? undefined;
  const limit = clampLimit(Number(searchParams.get("limit") ?? 80));

  if (!isCalculatorItemSearchReady(query)) {
    return NextResponse.json([]);
  }

  return NextResponse.json(
    searchItemIndex({
      kind: kind === "card" ? "card" : undefined,
      limit,
      query,
      slot: slot ?? undefined,
    }),
  );
}

function clampLimit(value: number) {
  if (!Number.isFinite(value)) {
    return 80;
  }

  return Math.min(120, Math.max(10, Math.floor(value)));
}
