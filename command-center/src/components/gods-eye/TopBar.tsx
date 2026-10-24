"use client";

import { useEffect, useState } from "react";

interface Props {
  aircraftCount: number;
  camCount: number;
  quakeCount: number;
  feedHealth: Record<string, string>;
  onOpenRail: () => void;
}

function useClocks() {
  const [utc, setUtc] = useState("--:--:--");
  const [gst, setGst] = useState("--:--:--");
  useEffect(() => {
    const tick = () => {
      const now = new Date();
      setUtc(now.toUTCString().slice(17, 25));
      const gulf = new Date(now.getTime() + (4 * 60 + now.getTimezoneOffset()) * 60000);
      setGst(gulf.toTimeString().slice(0, 8));
    };
    tick();
    const iv = setInterval(tick, 1000);
    return () => clearInterval(iv);
  }, []);
  return { utc, gst };
}

export default function TopBar({ aircraftCount, camCount, quakeCount, feedHealth, onOpenRail }: Props) {
  const { utc, gst } = useClocks();
  const allOk = Object.values(feedHealth).length > 0;

  return (
    <header className="hud-panel relative z-30 flex h-14 items-center gap-3 border-x-0 border-t-0 px-3">
      <button
        onClick={onOpenRail}
        className="md:hidden border border-amber-400/30 px-2 py-1.5 font-mono text-xs text-amber-200"
        aria-label="Open layers"
      >
        ☰
      </button>

      <div className="flex items-center gap-2.5">
        <div className="relative flex h-8 w-8 items-center justify-center border border-amber-400/50 bg-amber-400/10">
          <span className="absolute inset-0 m-1.5 rounded-full border border-amber-300/70" />
          <span className="h-1.5 w-1.5 rounded-full bg-amber-300 led-blink" />
        </div>
        <div className="leading-tight">
          <div className="font-mono text-[13px] font-semibold tracking-[0.22em] text-amber-200 hud-glow">
            GODS EYE <span className="text-amber-400/60">{"//"}</span> UAE
          </div>
          <div className="font-mono text-[8.5px] tracking-[0.3em] text-zinc-500">
            MIDDLE EAST SIGNALS COMMAND
          </div>
        </div>
      </div>

      <div className="mx-1 hidden h-8 w-px bg-amber-400/15 sm:block" />

      <div className="hidden gap-4 sm:flex">
        {[
          { label: "UTC", val: utc },
          { label: "GST", val: gst },
        ].map((c) => (
          <div key={c.label} className="leading-tight">
            <div className="font-mono text-[8.5px] tracking-[0.25em] text-zinc-500">{c.label}</div>
            <div className="font-mono text-[13px] tabular-nums text-amber-100/90">{c.val}</div>
          </div>
        ))}
      </div>

      <div className="mx-1 hidden h-8 w-px bg-amber-400/15 lg:block" />

      <div className="hidden gap-4 lg:flex">
        {[
          { label: "AIRCRAFT", val: aircraftCount, cls: "text-emerald-300" },
          { label: "CAMERAS", val: camCount, cls: "text-amber-200" },
          { label: "SEISMIC 24H", val: quakeCount, cls: "text-red-300" },
        ].map((c) => (
          <div key={c.label} className="leading-tight">
            <div className="font-mono text-[8.5px] tracking-[0.25em] text-zinc-500">{c.label}</div>
            <div className={`font-mono text-[13px] tabular-nums ${c.cls}`}>{c.val}</div>
          </div>
        ))}
      </div>

      <div className="ml-auto flex items-center gap-2">
        <div className="hidden items-center gap-2 xl:flex">
          {allOk &&
            Object.entries(feedHealth).map(([k, v]) => (
              <span
                key={k}
                className="border border-amber-400/15 bg-black/40 px-2 py-1 font-mono text-[9px] tracking-[0.12em] text-zinc-400"
              >
                {k}{" "}
                <span className={v === "OK" ? "text-emerald-400" : "text-red-400"}>{v}</span>
              </span>
            ))}
        </div>
        <span className="hidden border border-emerald-400/30 bg-emerald-400/10 px-2 py-1 font-mono text-[9px] tracking-[0.2em] text-emerald-300 sm:inline">
          ● OPEN SIGNALS ONLY
        </span>
      </div>
    </header>
  );
}
