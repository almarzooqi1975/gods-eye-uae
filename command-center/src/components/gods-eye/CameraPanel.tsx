"use client";

import type { CameraEntry } from "@/data/cameras";
import type { CameraHealth } from "@/app/api/cameras/health/route";

interface Props {
  cameras: CameraEntry[];
  selected: CameraEntry | null;
  health: Record<string, CameraHealth>;
  onSelect: (cam: CameraEntry) => void;
  watchMode: boolean;
}

function HealthDot({ status }: { status?: CameraHealth["status"] }) {
  if (!status) return <span className="h-1.5 w-1.5 rounded-full bg-zinc-600" />;
  const cls =
    status === "OK"
      ? "bg-emerald-400"
      : status === "GUARDED"
        ? "bg-amber-400"
        : "bg-red-500";
  return <span className={`h-1.5 w-1.5 rounded-full ${cls}`} />;
}

const STATUS_LABEL: Record<string, string> = {
  OK: "SOURCE REACHABLE",
  GUARDED: "ANTI-BOT GUARD",
  OFFLINE: "UNREACHABLE",
};

export default function CameraPanel({ cameras, selected, health, onSelect, watchMode }: Props) {
  return (
    <div className="flex h-full flex-col">
      {selected ? (
        <div className="border-b border-amber-400/15 p-4">
          <div className="cam-sweep hud-inset scanlines relative mb-3 flex h-40 items-center justify-center overflow-hidden">
            <div className="text-center">
              <div className="font-mono text-[10px] tracking-[0.3em] text-emerald-300/80 led-blink">
                ● LIVE OPTICAL NODE
              </div>
              <div className="mt-2 font-mono text-2xl tracking-[0.2em] text-amber-200/90 hud-glow">
                {selected.code}
              </div>
              <div className="mt-1 font-mono text-[9px] tracking-[0.18em] text-zinc-500">
                ENCRYPTED PUBLIC DISTRIBUTION — OPEN FEED BELOW
              </div>
            </div>
            <div className="absolute left-2 top-2 font-mono text-[8px] tracking-[0.2em] text-emerald-300/60">
              REC {new Date().toISOString().slice(11, 19)}Z
            </div>
            <div className="absolute bottom-2 right-2 font-mono text-[8px] tracking-[0.2em] text-zinc-500">
              {selected.provider.toUpperCase()}
            </div>
          </div>

          <div className="font-mono text-sm text-amber-100">{selected.name}</div>
          <div className="mt-0.5 font-mono text-[10px] tracking-[0.14em] text-zinc-500">
            {selected.city.toUpperCase()} · {selected.country.toUpperCase()} · {selected.domain}
          </div>

          <div className="mt-3 grid grid-cols-3 gap-2 font-mono text-[9px]">
            <div className="hud-inset p-2">
              <div className="text-zinc-500">LAT</div>
              <div className="text-amber-100/90">{selected.lat.toFixed(4)}</div>
            </div>
            <div className="hud-inset p-2">
              <div className="text-zinc-500">LON</div>
              <div className="text-amber-100/90">{selected.lon.toFixed(4)}</div>
            </div>
            <div className="hud-inset p-2">
              <div className="text-zinc-500">LINK</div>
              <div className="flex items-center gap-1.5 text-amber-100/90">
                <HealthDot status={health[selected.id]?.status} />
                {(health[selected.id]?.latencyMs ?? 0) + "ms" || "—"}
              </div>
            </div>
          </div>

          <p className="mt-3 font-mono text-[10px] leading-4 text-zinc-400">{selected.note}</p>

          <a
            href={selected.pageUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="mt-3 block w-full border border-emerald-400/50 bg-emerald-400/10 px-3 py-2.5 text-center font-mono text-[11px] tracking-[0.18em] text-emerald-200 transition-colors hover:bg-emerald-400/20"
          >
            ▶ OPEN LIVE FEED ↗
          </a>
          <div className="mt-1.5 text-center font-mono text-[8.5px] leading-4 tracking-[0.12em] text-zinc-600">
            STREAM HOST: {selected.provider.toUpperCase()} — PROVIDERS BLOCK 3RD-PARTY EMBEDS.
            <br />
            FEED OPENS IN A NEW TAB · {STATUS_LABEL[health[selected.id]?.status ?? ""] ?? "PROBING…"}
          </div>
        </div>
      ) : (
        <div className="border-b border-amber-400/15 p-4 text-center">
          <div className="font-mono text-[11px] tracking-[0.25em] text-amber-200/60">
            SELECT A CAMERA NODE
          </div>
          <div className="mt-1 font-mono text-[9px] leading-4 text-zinc-600">
            {watchMode ? "WATCH MODE IS HOPPING THE GRID…" : "CLICK AN AMBER MARKER ON THE GLOBE"}
          </div>
        </div>
      )}

      <div className="min-h-0 flex-1 overflow-y-auto ge-scrollbar p-3">
        <div className="mb-2 font-mono text-[10px] tracking-[0.25em] text-amber-200/60">
          CAMERA GRID — {cameras.length} NODES
        </div>
        <div className="space-y-1">
          {cameras.map((cam) => (
            <button
              key={cam.id}
              onClick={() => onSelect(cam)}
              className={`w-full border px-2.5 py-2 text-left transition-colors ${
                selected?.id === cam.id
                  ? "border-amber-400/60 bg-amber-400/10"
                  : "border-amber-400/10 bg-black/30 hover:border-amber-400/40"
              }`}
            >
              <div className="flex items-center gap-2">
                <HealthDot status={health[cam.id]?.status} />
                <span className="font-mono text-[10px] tracking-[0.14em] text-amber-200/80">
                  {cam.code}
                </span>
                <span className="truncate font-mono text-[10px] text-zinc-400">{cam.name}</span>
              </div>
              <div className="pl-5 font-mono text-[8.5px] tracking-[0.14em] text-zinc-600">
                {cam.city.toUpperCase()} · {cam.provider.toUpperCase()}
                {cam.country !== "United Arab Emirates" ? " · ME NODE" : ""}
              </div>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
