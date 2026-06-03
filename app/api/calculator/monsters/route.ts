import { NextResponse } from "next/server";
import { searchMonsterIndex } from "./monster-server-data";

export function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const query = searchParams.get("q") ?? undefined;
  const limit = clampLimit(Number(searchParams.get("limit") ?? 80));

  return NextResponse.json(searchMonsterIndex({ limit, query }));
}

function clampLimit(value: number) {
  if (!Number.isFinite(value)) {
    return 80;
  }

  return Math.min(120, Math.max(10, Math.floor(value)));
}
