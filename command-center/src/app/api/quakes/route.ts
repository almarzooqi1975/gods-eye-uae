import { NextResponse } from "next/server";
import { cacheGet, cacheSet, fetchWithTimeout } from "@/lib/cache";
import { ME_BBOX } from "@/data/geo";

export const dynamic = "force-dynamic";

export interface QuakeDot {
  id: string;
  mag: number;
  place: string;
  lat: number;
  lon: number;
  depthKm: number;
  time: number;
  url: string;
}

interface UsgsFeature {
  id: string;
  properties: {
    mag: number | null;
    place: string | null;
    time: number;
    url: string;
  };
  geometry: {
    coordinates: [number, number, number];
  };
}

export async function GET() {
  const cached = cacheGet<QuakeDot[]>("quakes:me:24h");
  if (cached) {
    return NextResponse.json({ quakes: cached, source: "cache", count: cached.length });
  }

  try {
    const res = await fetchWithTimeout(
      "https://earthquake.usgs.gov/earthquakes/feed/v1.0/summary/all_day.geojson",
      12000,
    );
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    const json = (await res.json()) as { features: UsgsFeature[] };

    const quakes: QuakeDot[] = json.features
      .filter((f) => {
        const [lon, lat] = f.geometry.coordinates;
        return (
          lat >= ME_BBOX.minLat &&
          lat <= ME_BBOX.maxLat &&
          lon >= ME_BBOX.minLon &&
          lon <= ME_BBOX.maxLon
        );
      })
      .map((f) => ({
        id: f.id,
        mag: f.properties.mag ?? 0,
        place: f.properties.place ?? "Unknown",
        lat: f.geometry.coordinates[1],
        lon: f.geometry.coordinates[0],
        depthKm: Math.round(f.geometry.coordinates[2]),
        time: f.properties.time,
        url: f.properties.url,
      }))
      .sort((a, b) => b.time - a.time)
      .slice(0, 120);

    cacheSet("quakes:me:24h", quakes, 180000);
    return NextResponse.json({ quakes, source: "USGS", count: quakes.length });
  } catch {
    return NextResponse.json(
      { quakes: [], source: "unreachable", count: 0, error: "USGS feed unreachable" },
      { status: 200 },
    );
  }
}
