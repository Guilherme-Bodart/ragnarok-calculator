import { NextResponse } from "next/server";
import { getCardIndex, getSlotItemIndex } from "./item-server-data";

export function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const kind = searchParams.get("kind");
  const slot = searchParams.get("slot");

  if (kind === "card") {
    return NextResponse.json(getCardIndex());
  }

  if (!slot) {
    return NextResponse.json([]);
  }

  return NextResponse.json(getSlotItemIndex(slot));
}
