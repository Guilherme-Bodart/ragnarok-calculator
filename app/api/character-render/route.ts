import { NextRequest, NextResponse } from "next/server";

const COSTUME_ENDPOINT =
  "https://api.costume.irowiki.org/render?downloadimage&accesstoken=3iznpprsozjn3nh6rvdvqn2fl89mo1jd";

// Simple in-memory cache so repeated renders of the same outfit are instant
const renderCache = new Map<string, ArrayBuffer>();
const MAX_CACHE_ENTRIES = 150;

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);

  const jobId = searchParams.get("job") || "4255";
  const gender = Number(searchParams.get("gender") ?? 1);
  const head = Number(searchParams.get("head") ?? 15);
  const headPalette = Number(searchParams.get("headPalette") ?? 1);
  const bodyPalette = Number(searchParams.get("bodyPalette") ?? -1);
  const headdir = Number(searchParams.get("headdir") ?? 0);
  const action = Number(searchParams.get("action") ?? 0);
  const outfit = Number(searchParams.get("outfit") ?? 0);
  const top = Number(searchParams.get("top") ?? 0);
  const mid = Number(searchParams.get("mid") ?? 0);
  const low = Number(searchParams.get("low") ?? 0);
  const garment = Number(searchParams.get("garment") ?? 0);

  const payload = {
    gender: gender === 0 ? 0 : 1,
    job: [String(jobId)],
    head: Math.max(1, Math.min(42, head)),
    headPalette: Math.max(0, Math.min(8, headPalette)),
    headdir: Math.max(0, Math.min(2, headdir)),
    headgear: [top, mid, low],
    garment,
    bodyPalette: Math.max(-1, Math.min(7, bodyPalette)),
    madogearType: 0,
    action,
    canvas: "180x190+90+152",
    outfit: outfit === 1 ? 1 : 0,
  };

  const cacheKey = JSON.stringify(payload);
  const cached = renderCache.get(cacheKey);

  if (cached) {
    return new NextResponse(cached, {
      status: 200,
      headers: {
        "Content-Type": "image/png",
        "Cache-Control": "public, max-age=86400, s-maxage=86400",
      },
    });
  }

  try {
    const upstream = await fetch(COSTUME_ENDPOINT, {
      method: "POST",
      headers: {
        "Content-Type": "application/vnd.api+json",
      },
      body: JSON.stringify(payload),
    });

    if (!upstream.ok) {
      return NextResponse.json(
        { error: `Upstream render failed with ${upstream.status}` },
        { status: 502 },
      );
    }

    const buffer = await upstream.arrayBuffer();

    if (renderCache.size >= MAX_CACHE_ENTRIES) {
      const oldestKey = renderCache.keys().next().value;
      if (oldestKey) renderCache.delete(oldestKey);
    }
    renderCache.set(cacheKey, buffer);

    return new NextResponse(buffer, {
      status: 200,
      headers: {
        "Content-Type": "image/png",
        "Cache-Control": "public, max-age=86400, s-maxage=86400",
      },
    });
  } catch {
    return NextResponse.json(
      { error: "Failed to contact character render service" },
      { status: 502 },
    );
  }
}
