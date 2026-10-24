"use client";

import type { AircraftDot } from "@/app/api/aircraft/route";
import { nearestAirfield } from "@/data/geo";

interface Props {
  aircraft: AircraftDot[];
  selected: AircraftDot | null;
  onSelect: (a: AircraftDot) => void;
  lastUpdate: number | null;
  source: string;
}

function fmtAlt(a: AircraftDot): string {
  if (a.onGround) return "GND";
  if (a.altFt == null) return "—";
  return `${(a.altFt / 100).toFixed(0)}00 ft`;
}

function phase(a: AircraftDot): string {
  if (a.onGround) return "ON GROUND";
  if (a.vsFpm != null && a.vsFpm > 400) return "CLIMBING";
  if (a.vsFpm != null && a.vsFpm < -400) return "DESCENDING";
  return "LEVEL CRUISE";
}

export default function AircraftPanel({ aircraft, selected, onSelect, lastUpdate, source }: Props) {
  const nearest = selected && !selected.onGround ? nearestAirfield(selected.lat, selected.lon) : null;

  return (
    <div className="flex h-full flex-col">
      {selected ? (
        <div className="border-b border-amber-400/15 p-4">
          <div className="flex items-baseline justify-between">
            <div className="font-mono text-xl tracking-[0.14em] text-emerald-200 hud-glow-green">
              {selected.callsign}
            </div>
            <div
              className={`font-mono text-[9px] tracking-[0.2em] ${
                selected.emergency ? "text-red-400 led-blink" : "text-zinc-500"
              }`}
            >
              {selected.emergency ? "◉ SQUAWK EMERGENCY" : selected.squawk || "MODE-S"}
            </div>
          </div>
          <div className="mt-0.5 font-mono text-[10px] tracking-[0.14em] text-zinc-500">
            {selected.type} {selected.desc ? `· ${selected.desc.toUpperCase()}` : ""} · {selected.reg}
          </div>

          <div className="mt-3 grid grid-cols-2 gap-2 font-mono text-[9px]">
            <div className="hud-inset p-2">
              <div className="text-zinc-500">ALTITUDE</div>
              <div className="text-amber-100/90">{fmtAlt(selected)}</div>
            </div>
            <div className="hud-inset p-2">
              <div className="text-zinc-500">GND SPEED</div>
              <div className="text-amber-100/90">
                {selected.gsKt != null ? `${selected.gsKt} kt` : "—"}
              </div>
            </div>
            <div className="hud-inset p-2">
              <div className="text-zinc-500">TRACK</div>
              <div className="text-amber-100/90">
                {selected.trackDeg != null ? `${selected.trackDeg}°` : "—"}
              </div>
            </div>
            <div className="hud-inset p-2">
              <div className="text-zinc-500">V/S</div>
              <div className="text-amber-100/90">
                {selected.vsFpm != null ? `${selected.vsFpm} fpm` : "—"}
              </div>
            </div>
          </div>

          <div className="mt-2 hud-inset p-2 font-mono text-[9px]">
            <div className="text-zinc-500">PHASE ASSESSMENT</div>
            <div className="text-emerald-300">
              {phase(selected)}
              {nearest && nearest.distanceKm < 180
                ? ` — ${nearest.distanceKm < 60 ? "FINAL APPROACH" : "TERMINAL AREA"} ${nearest.field.iata} (${Math.round(nearest.distanceKm)} km)`
                : ""}
            </div>
          </div>
        </div>
      ) : (
        <div className="border-b border-amber-400/15 p-4 text-center font-mono text-[11px] tracking-[0.22em] text-amber-200/60">
          CLICK AN AIRCRAFT ICON ON THE GLOBE
        </div>
      )}

      <div className="min-h-0 flex-1 overflow-y-auto ge-scrollbar p-3">
        <div className="mb-2 flex items-center justify-between font-mono text-[10px] tracking-[0.2em] text-amber-200/60">
          <span>CONTACTS — {aircraft.length}</span>
          <span className="text-zinc-600">
            {source.toUpperCase()} ·{" "}
            {lastUpdate ? new Date(lastUpdate).toTimeString().slice(0, 8) : "—"}
          </span>
        </div>
        <div className="space-y-1">
          {aircraft
            .filter((a) => !a.onGround)
            .sort((a, b) => (b.altFt ?? 0) - (a.altFt ?? 0))
            .slice(0, 60)
            .map((a) => (
              <button
                key={a.id}
                onClick={() => onSelect(a)}
                className={`flex w-full items-center justify-between gap-2 border px-2.5 py-1.5 text-left transition-colors ${
                  selected?.id === a.id
                    ? "border-emerald-400/60 bg-emerald-400/10"
                    : "border-amber-400/10 bg-black/30 hover:border-amber-400/40"
                }`}
              >
                <span className="flex items-center gap-2">
                  <span
                    className={`inline-block h-1.5 w-1.5 rounded-full ${
                      a.emergency ? "bg-red-500 led-blink" : "bg-emerald-400/70"
                    }`}
                  />
                  <span className="font-mono text-[10px] text-emerald-200/90">{a.callsign}</span>
                </span>
                <span className="font-mono text-[9px] tabular-nums text-zinc-500">
                  {a.type} · {fmtAlt(a)} · {a.gsKt ?? "—"}kt
                </span>
              </button>
            ))}
        </div>
      </div>
    </div>
  );
}
