import { NextResponse } from "next/server";
import { cacheGet, cacheSet, fetchWithTimeout } from "@/lib/cache";
import { CITY_NODES } from "@/data/geo";

export const dynamic = "force-dynamic";

export interface CityWeather {
  name: string;
  country: string;
  lat: number;
  lon: number;
  tempC: number;
  feelsLikeC: number;
  windKph: number;
  humidity: number;
  code: number;
  isDay: boolean;
}

interface MeteoBlock {
  latitude: number;
  longitude: number;
  current?: {
    temperature_2m: number;
    apparent_temperature: number;
    wind_speed_10m: number;
    relative_humidity_2m: number;
    weather_code: number;
    is_day: number;
  };
}

const WX_CODES: Record<number, string> = {
  0: "CLEAR", 1: "MAINLY CLEAR", 2: "PARTLY CLOUDY", 3: "OVERCAST",
  45: "FOG", 48: "RIME FOG", 51: "LIGHT DRIZZLE", 53: "DRIZZLE",
  55: "DENSE DRIZZLE", 61: "LIGHT RAIN", 63: "RAIN", 65: "HEAVY RAIN",
  71: "LIGHT SNOW", 80: "RAIN SHOWERS", 81: "SHOWERS", 82: "VIOLENT SHOWERS",
  95: "THUNDERSTORM", 96: "T-STORM + HAIL", 99: "SEVERE T-STORM",
};

function metNoSymbolToCode(symbol: string): number {
  if (symbol.includes("thunder")) return 95;
  if (symbol.includes("snow") || symbol.includes("sleet")) return 71;
  if (symbol.includes("rain") || symbol.includes("showers")) return symbol.includes("heavy") ? 65 : 61;
  if (symbol.includes("fog")) return 45;
  if (symbol.includes("partlycloudy")) return 2;
  if (symbol.includes("cloudy")) return 3;
  if (symbol.includes("fair")) return 1;
  return 0; // clearsky
}

async function fetchOpenMeteo(): Promise<CityWeather[] | null> {
  const lats = CITY_NODES.map((c) => c.lat).join(",");
  const lons = CITY_NODES.map((c) => c.lon).join(",");
  const url =
    `https://api.open-meteo.com/v1/forecast?latitude=${lats}&longitude=${lons}` +
    "&current=temperature_2m,apparent_temperature,wind_speed_10m,relative_humidity_2m,weather_code,is_day";
  const res = await fetchWithTimeout(url, 9000);
  if (!res.ok) throw new Error(`HTTP ${res.status}`);
  const json = (await res.json()) as MeteoBlock[] | MeteoBlock;
  const blocks = Array.isArray(json) ? json : [json];
  return CITY_NODES.map((c, i) => {
    const b = blocks[i]?.current;
    return {
      name: c.name,
      country: c.country,
      lat: c.lat,
      lon: c.lon,
      tempC: b ? Math.round(b.temperature_2m) : 0,
      feelsLikeC: b ? Math.round(b.apparent_temperature) : 0,
      windKph: b ? Math.round(b.wind_speed_10m) : 0,
      humidity: b ? Math.round(b.relative_humidity_2m) : 0,
      code: b?.weather_code ?? 0,
      isDay: b?.is_day === 1,
    };
  });
}

// met.no locationforecast fallback — free, no key (requires identifying UA).
async function fetchMetNo(): Promise<CityWeather[]> {
  const results = await Promise.all(
    CITY_NODES.map(async (c) => {
      try {
        const url = `https://api.met.no/weatherapi/locationforecast/2.0/compact?lat=${c.lat.toFixed(4)}&lon=${c.lon.toFixed(4)}`;
        const res = await fetchWithTimeout(url, 9000, {
          headers: {
            "User-Agent": "GodsEye-UAE-OSINT-console/1.0 github.com/gods-eye-uae (contact: operator@localhost)",
            Accept: "application/json",
          },
        });
        if (!res.ok) throw new Error(`HTTP ${res.status}`);
        const j = (await res.json()) as {
          properties: {
            timeseries: {
              time: string;
              data: {
                instant: { details: { air_temperature: number; wind_speed: number; relative_humidity: { value: number } | number } };
                next_1_hours?: { summary: { symbol_code: string } };
              };
            }[];
          };
        };
        const ts = j.properties.timeseries[0];
        const d = ts.data.instant.details;
        const rhRaw = d.relative_humidity as unknown;
        const rh = typeof rhRaw === "number" ? rhRaw : (rhRaw as { value: number })?.value ?? 0;
        const hour = new Date().getUTCHours();
        return {
          name: c.name,
          country: c.country,
          lat: c.lat,
          lon: c.lon,
          tempC: Math.round(d.air_temperature),
          feelsLikeC: Math.round(d.air_temperature),
          windKph: Math.round((d.wind_speed ?? 0) * 3.6),
          humidity: Math.round(rh),
          code: metNoSymbolToCode(ts.data.next_1_hours?.summary?.symbol_code ?? "clearsky"),
          isDay: hour >= 4 && hour < 16,
        };
      } catch {
        return {
          name: c.name,
          country: c.country,
          lat: c.lat,
          lon: c.lon,
          tempC: 0,
          feelsLikeC: 0,
          windKph: 0,
          humidity: 0,
          code: 0,
          isDay: true,
        };
      }
    }),
  );
  return results;
}

export async function GET() {
  const cached = cacheGet<CityWeather[]>("weather:cities");
  if (cached) {
    return NextResponse.json({ cities: cached, source: "cache", count: cached.length });
  }

  let cities: CityWeather[] | null = null;
  let source = "Open-Meteo";
  try {
    cities = await fetchOpenMeteo();
  } catch {
    try {
      cities = await fetchMetNo();
      source = "met.no";
    } catch {
      cities = null;
    }
  }

  if (!cities || cities.every((c) => c.tempC === 0 && c.windKph === 0)) {
    return NextResponse.json(
      { cities: [], source: "unreachable", count: 0, error: "Weather feeds unreachable" },
      { status: 200 },
    );
  }

  cacheSet("weather:cities", cities, 600000);
  return NextResponse.json({ cities, source, count: cities.length });
}
