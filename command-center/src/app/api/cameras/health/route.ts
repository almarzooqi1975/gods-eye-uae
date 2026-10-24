import { NextResponse } from "next/server";
import { cacheGet, cacheSet, fetchWithTimeout } from "@/lib/cache";
import { CAMERAS } from "@/data/cameras";

export const dynamic = "force-dynamic";

export type HealthStatus = "OK" | "GUARDED" | "OFFLINE";

export interface CameraHealth {
  id: string;
  status: HealthStatus;
  httpCode: number;
  latencyMs: number;
  checkedAt: number;
}

async function probe(pageUrl: string): Promise<Omit<CameraHealth, "id">> {
  const started = Date.now();
  try {
    const res = await fetchWithTimeout(pageUrl, 7000, {
      headers: {
        "User-Agent":
          "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/126 Safari/537.36",
        Accept: "text/html,application/xhtml+xml",
      },
    });
    const latencyMs = Date.now() - started;
    const status: HealthStatus =
      res.status >= 200 && res.status < 300
        ? "OK"
        : res.status === 403 || res.status === 429 || res.status === 503
          ? "GUARDED"
          : "OFFLINE";
    return { status, httpCode: res.status, latencyMs, checkedAt: Date.now() };
  } catch {
    return {
      status: "OFFLINE",
      httpCode: 0,
      latencyMs: Date.now() - started,
      checkedAt: Date.now(),
    };
  }
}

export async function GET() {
  const cached = cacheGet<CameraHealth[]>("cameras:health");
  if (cached) {
    return NextResponse.json({ health: cached, source: "cache" });
  }

  // Probe sequentially with a small concurrency cap to stay polite.
  const health: CameraHealth[] = [];
  const batch = 4;
  for (let i = 0; i < CAMERAS.length; i += batch) {
    const slice = CAMERAS.slice(i, i + batch);
    const results = await Promise.all(
      slice.map(async (cam) => ({
        id: cam.id,
        ...(await probe(cam.pageUrl)),
      })),
    );
    health.push(...results);
  }

  cacheSet("cameras:health", health, 300000);
  return NextResponse.json({ health, source: "probe" });
}
