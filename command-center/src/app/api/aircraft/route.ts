import { NextResponse } from "next/server";
import { cacheGet, cacheSet, fetchWithTimeout } from "@/lib/cache";

export const dynamic = "force-dynamic";

interface RawAircraft {
  hex: string;
  flight?: string;
  r?: string;
  t?: string;
  desc?: string;
  alt_baro?: number | "ground";
  gs?: number;
  track?: number;
  baro_rate?: number;
  squawk?: string;
  emergency?: string;
  category?: string;
  lat?: number;
  lon?: number;
}

export interface AircraftDot {
  id: string;
  callsign: string;
  reg: string;
  type: string;
  desc: string;
  lat: number;
  lon: number;
  altFt: number | null;
  onGround: boolean;
  gsKt: number | null;
  trackDeg: number | null;
  vsFpm: number | null;
  squawk: string;
  emergency: boolean;
}

function normalize(a: RawAircraft): AircraftDot | null {
  if (typeof a.lat !== "number" || typeof a.lon !== "number") return null;
  const alt =
    a.alt_baro === "ground" ? null : typeof a.alt_baro === "number" ? a.alt_baro : null;
  return {
    id: a.hex,
    callsign: (a.flight ?? "").trim() || "—",
    reg: (a.r ?? "").trim() || "—",
    type: (a.t ?? "").trim() || "—",
    desc: (a.desc ?? "").trim(),
    lat: a.lat,
    lon: a.lon,
    altFt: alt,
    onGround: a.alt_baro === "ground",
    gsKt: typeof a.gs === "number" ? Math.round(a.gs) : null,
    trackDeg: typeof a.track === "number" ? Math.round(a.track) : null,
    vsFpm: typeof a.baro_rate === "number" ? Math.round(a.baro_rate) : null,
    squawk: (a.squawk ?? "").trim(),
    emergency: Boolean(a.emergency && a.emergency !== "none"),
  };
}

async function trySource(url: string): Promise<RawAircraft[]> {
  const res = await fetchWithTimeout(url, 9000);
  if (!res.ok) throw new Error(`HTTP ${res.status}`);
  const json = (await res.json()) as { aircraft?: RawAircraft[] };
  return json.aircraft ?? [];
}

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const lat = Math.max(-90, Math.min(90, Number(searchParams.get("lat")) || 24.8));
  const lon = Math.max(-180, Math.min(180, Number(searchParams.get("lon")) || 54.8));
  const dist = Math.max(10, Math.min(250, Number(searchParams.get("dist")) || 160));

  const key = `aircraft:${lat.toFixed(1)}:${lon.toFixed(1)}:${dist}`;
  const cached = cacheGet<AircraftDot[]>(key);
  if (cached) {
    return NextResponse.json({ aircraft: cached, source: "cache", count: cached.length });
  }

  const sources = [
    `https://opendata.adsb.fi/api/v2/lat/${lat}/lon/${lon}/dist/${dist}`,
    `https://api.adsb.lol/v2/lat/${lat}/lon/${lon}/dist/${dist}`,
  ];

  let aircraft: AircraftDot[] = [];
  let source = "adsb.fi";
  for (let i = 0; i < sources.length; i++) {
    try {
      const raw = await trySource(sources[i]);
      aircraft = raw.map(normalize).filter((a): a is AircraftDot => a !== null);
      source = i === 0 ? "adsb.fi" : "adsb.lol";
      break;
    } catch {
      continue;
    }
  }

  if (aircraft.length === 0) {
    return NextResponse.json(
      { aircraft: [], source: "unreachable", count: 0, error: "ADS-B mesh unreachable" },
      { status: 200 },
    );
  }

  cacheSet(key, aircraft, 6000);
  return NextResponse.json({ aircraft, source, count: aircraft.length });
}
