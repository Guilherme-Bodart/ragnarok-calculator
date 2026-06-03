import { NextResponse } from "next/server";
import { getMonsterDetail } from "../monster-server-data";

type MonsterDetailRouteContext = {
  params: Promise<{
    monsterId: string;
  }>;
};

export async function GET(_: Request, context: MonsterDetailRouteContext) {
  const { monsterId } = await context.params;
  const monster = getMonsterDetail(Number(monsterId));

  if (!monster) {
    return NextResponse.json({ message: "Monster not found." }, { status: 404 });
  }

  return NextResponse.json(monster);
}
