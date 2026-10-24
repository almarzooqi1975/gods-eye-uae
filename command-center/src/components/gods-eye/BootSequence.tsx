"use client";

import { useEffect, useState } from "react";

const LINES = [
  "> INITIALIZING GODS EYE KERNEL v2.1 ............ OK",
  "> LINKING PUBLIC ADS-B MESH (GULF SECTOR) ...... OK",
  "> ACQUIRING UAE CAMERA GRID .................... OK",
  "> USGS SEISMIC UPLINK .......................... OK",
  "> ISS TELEMETRY SYNC ........................... OK",
  "> GDELT NEWS WIRE TAP .......................... OK",
  "> MAPPING ENGINE: ARABIAN GULF THEATER ......... OK",
  "",
  "  ALL PUBLIC SIGNALS FUSED. THE EYE IS OPEN.",
];

export default function BootSequence({ onDone }: { onDone: () => void }) {
  const [shown, setShown] = useState(0);
  const [fading, setFading] = useState(false);

  useEffect(() => {
    if (shown >= LINES.length) {
      const t1 = setTimeout(() => setFading(true), 650);
      const t2 = setTimeout(onDone, 1150);
      return () => {
        clearTimeout(t1);
        clearTimeout(t2);
      };
    }
    const t = setTimeout(() => setShown((s) => s + 1), shown === 0 ? 260 : 240);
    return () => clearTimeout(t);
  }, [shown, onDone]);

  return (
    <div
      className={`fixed inset-0 z-[100] flex items-center justify-center bg-black transition-opacity duration-500 ${
        fading ? "opacity-0" : "opacity-100"
      }`}
      onClick={onDone}
      role="status"
      aria-label="System booting"
    >
      <div className="scanlines vignette relative w-full max-w-2xl px-8">
        <div className="font-mono text-sm md:text-base leading-7 text-amber-300/90 hud-glow">
          {LINES.slice(0, shown).map((line, i) => (
            <div key={i} className="whitespace-pre-wrap">{line || "\u00A0"}</div>
          ))}
          {shown < LINES.length && (
            <span className="boot-caret inline-block h-4 w-2.5 translate-y-0.5 bg-amber-300" />
          )}
        </div>
        <div className="mt-8 text-center font-mono text-[10px] tracking-[0.3em] text-amber-200/40">
          [ CLICK TO SKIP ]
        </div>
      </div>
    </div>
  );
}
