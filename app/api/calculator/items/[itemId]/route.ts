import { NextResponse } from "next/server";
import { getItemDetail } from "../item-server-data";

type ItemDetailRouteContext = {
  params: Promise<{
    itemId: string;
  }>;
};

export async function GET(_: Request, context: ItemDetailRouteContext) {
  const { itemId } = await context.params;
  const item = getItemDetail(Number(itemId));

  if (!item) {
    return NextResponse.json({ message: "Item not found." }, { status: 404 });
  }

  return NextResponse.json(item);
}
