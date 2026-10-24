"use client";

import type { CityWeather } from "@/app/api/weather/route";
import type { QuakeDot } from "@/app/api/quakes/route";
import type { IssState } from "@/app/api/iss/route";

interface Props {
  cities: CityWeather[];
  quakes: QuakeDot[];
  iss: IssState | null;
}

function wxIcon(code: number, isDay: boolean): string {
  if (code === 0) return isDay ? "☀" : "☾";
  if (code <= 2) return isDay ? "◐" : "☾";
  if (code === 3) return "☁";
  if (code <= 48) return "≈";
  if (code <= 65) return "☂";
  if (code <= 82) return "☔";
  return "⚡";
}

function timeAgo(ts: number): string {
  const m = Math.floor((Date.now() - ts) / 60000);
  if (m < 60) return `${m}m ago`;
  const h = Math.floor(m / 60);
  return `${h}h ${m % 60}m ago`;
}

export default function EnvironmentPanel({ cities, quakes, iss }: Props) {
  const uaeCities = cities.filter((c) => c.country === "UAE");
  const others = cities.filter((c) => c.country !== "UAE");

  return (
    <div className="h-full overflow-y-auto ge-scrollbar p-4">
      <div className="mb-2 font-mono text-[10px] tracking-[0.25em] text-amber-200/60">
        UAE METRO WEATHER
      </div>
      <div className="grid grid-cols-2 gap-1.5">
        {uaeCities.map((c) => (
          <div key={c.name} className="hud-inset p-2.5">
            <div className="flex items-center justify-between">
              <span className="font-mono text-[10px] tracking-[0.14em] text-amber-100/90">
                {c.name.toUpperCase()}
              </span>
              <span className="text-sm" title={String(c.code)}>{wxIcon(c.code, c.isDay)}</span>
            </div>
            <div className="font-mono text-lg tabular-nums text-amber-200 hud-glow">
              {c.tempC}°C
            </div>
            <div className="font-mono text-[8.5px] text-zinc-500">
              WIND {c.windKph} · RH {c.humidity}% · FEELS {c.feelsLikeC}°
            </div>
          </div>
        ))}
      </div>

      <div className="mb-2 mt-4 font-mono text-[10px] tracking-[0.25em] text-amber-200/60">
        GULF & REGION
      </div>
      <div className="space-y-1">
        {others.map((c) => (
          <div
            key={c.name}
            className="flex items-center justify-between border border-amber-400/10 bg-black/30 px-2.5 py-1.5 font-mono text-[10px]"
          >
            <span className="text-amber-100/80">{c.name.toUpperCase()}</span>
            <span className="tabular-nums text-zinc-400">
              {wxIcon(c.code, c.isDay)} {c.tempC}°C · {c.windKph}km/h
            </span>
          </div>
        ))}
      </div>

      <div className="mb-2 mt-4 font-mono text-[10px] tracking-[0.25em] text-amber-200/60">
        ISS — ZARYA TELEMETRY
      </div>
      {iss ? (
        <div className="hud-inset p-3 font-mono text-[10px] leading-5">
          <div className="flex justify-between">
            <span className="text-zinc-500">POSITION</span>
            <span className="text-amber-100/90 tabular-nums">
              {iss.lat.toFixed(2)}°, {iss.lon.toFixed(2)}°
            </span>
          </div>
          <div className="flex justify-between">
            <span className="text-zinc-500">ALTITUDE</span>
            <span className="text-amber-100/90">{iss.altitudeKm} km</span>
          </div>
          <div className="flex justify-between">
            <span className="text-zinc-500">VELOCITY</span>
            <span className="text-amber-100/90">
              {iss.velocityKmh.toLocaleString()} km/h
            </span>
          </div>
          <div className="flex justify-between">
            <span className="text-zinc-500">SUNLIGHT</span>
            <span className="text-emerald-300">{iss.visibility.toUpperCase()}</span>
          </div>
        </div>
      ) : (
        <div className="hud-inset p-3 font-mono text-[10px] text-zinc-600">
          NO TELEMETRY — LINK RETRYING…
        </div>
      )}

      <div className="mb-2 mt-4 font-mono text-[10px] tracking-[0.25em] text-amber-200/60">
        SEISMIC — MIDDLE EAST 24H
      </div>
      {quakes.length === 0 ? (
        <div className="hud-inset p-3 font-mono text-[10px] text-zinc-600">
          NO SEISMIC EVENTS DETECTED IN THE LAST 24H — GULF SECTOR QUIET.
        </div>
      ) : (
        <div className="space-y-1">
          {quakes.slice(0, 20).map((q) => (
            <a
              key={q.id}
              href={q.url}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-2 border border-amber-400/10 bg-black/30 px-2.5 py-1.5 transition-colors hover:border-red-400/40"
            >
              <span
                className={`font-mono text-xs tabular-nums ${
                  q.mag >= 5 ? "text-red-400" : q.mag >= 4 ? "text-orange-300" : "text-amber-300"
                }`}
              >
                M{q.mag.toFixed(1)}
              </span>
              <span className="min-w-0 flex-1 truncate font-mono text-[9.5px] text-zinc-400">
                {q.place}
              </span>
              <span className="font-mono text-[8.5px] text-zinc-600">{timeAgo(q.time)}</span>
            </a>
          ))}
        </div>
      )}
    </div>
  );
}
