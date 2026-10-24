"use client";

import { useEffect, useState } from "react";

export interface LayerState {
  cameras: boolean;
  aircraft: boolean;
  quakes: boolean;
  iss: boolean;
  radar: boolean;
  satellite: boolean;
  cities: boolean;
}

interface Props {
  layers: LayerState;
  onToggle: (key: keyof LayerState) => void;
  regions: { id: string; label: string }[];
  activeRegion: string;
  onFocusRegion: (id: string) => void;
  watchMode: boolean;
  onToggleWatch: () => void;
  counts: { aircraft: number; quakes: number; cams: number };
  open: boolean;
  onClose: () => void;
}

const LAYER_DEFS: { key: keyof LayerState; label: string; hint: string }[] = [
  { key: "cameras", label: "CAMERA GRID", hint: "UAE + ME public cams" },
  { key: "aircraft", label: "AIR TRAFFIC", hint: "ADS-B transponders" },
  { key: "quakes", label: "SEISMIC 24H", hint: "USGS Middle East" },
  { key: "iss", label: "ISS TRACK", hint: "Station + footprint" },
  { key: "radar", label: "RAIN RADAR", hint: "Precipitation mesh" },
  { key: "satellite", label: "SAT IMAGERY", hint: "NASA MODIS true color" },
  { key: "cities", label: "CITY NODES", hint: "Gulf metro labels" },
];

function LayerToggle({
  label,
  hint,
  active,
  onClick,
  badge,
}: {
  label: string;
  hint: string;
  active: boolean;
  onClick: () => void;
  badge?: string;
}) {
  return (
    <button
      onClick={onClick}
      className={`group w-full border px-3 py-2.5 text-left transition-colors ${
        active
          ? "border-amber-400/60 bg-amber-400/10"
          : "border-amber-400/15 bg-black/30 hover:border-amber-400/40"
      }`}
      aria-pressed={active}
    >
      <div className="flex items-center justify-between gap-2">
        <span
          className={`font-mono text-[11px] tracking-[0.14em] ${
            active ? "text-amber-200 hud-glow" : "text-amber-200/50"
          }`}
        >
          {label}
        </span>
        <span className="flex items-center gap-2">
          {badge && (
            <span className="font-mono text-[10px] text-emerald-300/80">{badge}</span>
          )}
          <span
            className={`inline-block h-2 w-2 rounded-full ${
              active ? "bg-emerald-400 led-blink" : "bg-zinc-600"
            }`}
          />
        </span>
      </div>
      <div className="mt-0.5 font-mono text-[9px] tracking-[0.1em] text-zinc-500">
        {hint}
      </div>
    </button>
  );
}

export default function LayerRail(props: Props) {
  const [gst, setGst] = useState("");
  useEffect(() => {
    const tick = () => {
      const now = new Date();
      const gulf = new Date(now.getTime() + (4 * 60 + now.getTimezoneOffset()) * 60000);
      setGst(gulf.toTimeString().slice(0, 8));
    };
    tick();
    const iv = setInterval(tick, 1000);
    return () => clearInterval(iv);
  }, []);

  return (
    <aside
      className={`${
        props.open ? "translate-x-0" : "-translate-x-full"
      } md:translate-x-0 fixed md:static inset-y-0 left-0 z-40 w-64 shrink-0 overflow-y-auto ge-scrollbar hud-panel border-t-0 border-b-0 border-l-0 p-3 transition-transform duration-300 md:block`}
      aria-label="Layer controls"
    >
      <div className="mb-3 flex items-center justify-between">
        <div>
          <div className="font-mono text-[10px] tracking-[0.25em] text-amber-200/60">
            LAYERS
          </div>
          <div className="font-mono text-[9px] tracking-[0.18em] text-zinc-500">
            LOCAL {gst} GST
          </div>
        </div>
        <button
          onClick={props.onClose}
          className="md:hidden border border-amber-400/30 px-2 py-1 font-mono text-[10px] text-amber-200/70"
          aria-label="Close layer rail"
        >
          ✕
        </button>
      </div>

      <div className="space-y-1.5">
        {LAYER_DEFS.map((def) => (
          <LayerToggle
            key={def.key}
            label={def.label}
            hint={def.hint}
            active={props.layers[def.key]}
            badge={
              def.key === "aircraft" && props.counts.aircraft
                ? String(props.counts.aircraft)
                : def.key === "quakes" && props.counts.quakes
                  ? String(props.counts.quakes)
                  : def.key === "cameras" && props.counts.cams
                    ? String(props.counts.cams)
                    : undefined
            }
            onClick={() => props.onToggle(def.key)}
          />
        ))}
      </div>

      <div className="mt-5">
        <div className="mb-2 font-mono text-[10px] tracking-[0.25em] text-amber-200/60">
          FOCUS REGION
        </div>
        <div className="grid grid-cols-2 gap-1.5">
          {props.regions.map((r) => (
            <button
              key={r.id}
              onClick={() => props.onFocusRegion(r.id)}
              className={`border px-2 py-2 font-mono text-[10px] tracking-[0.1em] transition-colors ${
                props.activeRegion === r.id
                  ? "border-emerald-400/60 bg-emerald-400/10 text-emerald-200 hud-glow-green"
                  : "border-amber-400/15 bg-black/30 text-amber-100/60 hover:border-amber-400/40"
              }`}
            >
              {r.label}
            </button>
          ))}
        </div>
      </div>

      <div className="mt-5">
        <button
          onClick={props.onToggleWatch}
          className={`w-full border px-3 py-3 font-mono text-[11px] tracking-[0.18em] transition-colors ${
            props.watchMode
              ? "border-red-400/60 bg-red-500/15 text-red-200 hud-glow"
              : "border-amber-400/25 bg-black/30 text-amber-200/70 hover:border-amber-400/50"
          }`}
          aria-pressed={props.watchMode}
        >
          {props.watchMode ? "◉ WATCH MODE ACTIVE" : "▷ START WATCH MODE"}
        </button>
        <div className="mt-1 font-mono text-[9px] leading-4 text-zinc-500">
          Auto-hops between UAE cameras every 12s with cinematic focus.
        </div>
      </div>
    </aside>
  );
}
