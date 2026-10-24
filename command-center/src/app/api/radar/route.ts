import { NextResponse } from "next/server";
import { cacheGet, cacheSet, fetchWithTimeout } from "@/lib/cache";

export const dynamic = "force-dynamic";

export interface RadarFrame {
  host: string;
  path: string;
  time: number;
}

export async function GET() {
  const cached = cacheGet<RadarFrame>("radar:latest");
  if (cached) {
    return NextResponse.json({ radar: cached, source: "cache" });
  }

  try {
    const res = await fetchWithTimeout(
      "https://api.rainviewer.com/public/weather-maps.json",
      9000,
    );
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    const j = (await res.json()) as {
      host: string;
      radar: { past?: { time: number; path: string }[] };
    };
    const past = j.radar?.past ?? [];
    const latest = past[past.length - 1];
    if (!latest) throw new Error("no frames");

    const radar: RadarFrame = {
      host: j.host,
      path: latest.path,
      time: latest.time,
    };
    cacheSet("radar:latest", radar, 300000);
    return NextResponse.json({ radar, source: "RainViewer" });
  } catch {
    return NextResponse.json(
      { radar: null, source: "unreachable", error: "RainViewer unreachable" },
      { status: 200 },
    );
  }
}
