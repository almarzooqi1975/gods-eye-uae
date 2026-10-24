import { NextResponse } from "next/server";
import { cacheGet, cacheSet, fetchWithTimeout } from "@/lib/cache";

export const dynamic = "force-dynamic";

export interface IssState {
  lat: number;
  lon: number;
  altitudeKm: number;
  velocityKmh: number;
  visibility: string;
  footprintKm: number;
  timestamp: number;
}

export async function GET() {
  const cached = cacheGet<IssState>("iss:state");
  if (cached) {
    return NextResponse.json({ iss: cached, source: "cache" });
  }

  try {
    const res = await fetchWithTimeout(
      "https://api.wheretheiss.at/v1/satellites/25544",
      9000,
    );
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    const j = (await res.json()) as {
      latitude: number;
      longitude: number;
      altitude: number;
      velocity: number;
      visibility: string;
      footprint: number;
      timestamp: number;
    };

    const iss: IssState = {
      lat: j.latitude,
      lon: j.longitude,
      altitudeKm: Math.round(j.altitude),
      velocityKmh: Math.round(j.velocity),
      visibility: j.visibility,
      footprintKm: Math.round(j.footprint),
      timestamp: j.timestamp,
    };

    cacheSet("iss:state", iss, 5000);
    return NextResponse.json({ iss, source: "wheretheiss.at" });
  } catch {
    return NextResponse.json(
      { iss: null, source: "unreachable", error: "ISS telemetry unreachable" },
      { status: 200 },
    );
  }
}
