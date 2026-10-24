"use client";

import type { NewsItem } from "@/app/api/news/route";

interface Props {
  items: NewsItem[];
}

export default function NewsTicker({ items }: Props) {
  const headlines = items.length
    ? items.map((n) => `${n.title}`)
    : ["GDELT NEWS WIRE SYNCING — HEADLINES WILL APPEAR HERE"];
  const track = [...headlines, ...headlines];

  return (
    <div className="hud-panel relative z-20 flex h-10 items-center overflow-hidden border-x-0 border-b-0">
      <div className="z-10 flex h-full shrink-0 items-center gap-2 border-r border-amber-400/20 bg-black/80 px-3">
        <span className="h-1.5 w-1.5 rounded-full bg-red-500 led-blink" />
        <span className="font-mono text-[9px] tracking-[0.25em] text-red-300">GDELT WIRE</span>
      </div>
      <div className="relative min-w-0 flex-1 overflow-hidden">
        <div className="ticker-track flex w-max items-center gap-10 whitespace-nowrap px-4">
          {track.map((h, i) => (
            <span
              key={i}
              className="font-mono text-[10.5px] tracking-[0.06em] text-amber-100/70"
            >
              <span className="mr-2 text-amber-500/60">◆</span>
              {h}
            </span>
          ))}
        </div>
      </div>
    </div>
  );
}
