"use client";

import { useEffect, useRef, useState } from "react";
import type { CameraEntry } from "@/data/cameras";
import type { AircraftDot } from "@/app/api/aircraft/route";
import type { QuakeDot } from "@/app/api/quakes/route";
import type { CityWeather } from "@/app/api/weather/route";
import type { IssState } from "@/app/api/iss/route";
import type { NewsItem } from "@/app/api/news/route";

export interface LiveContext {
  camerasOnline: number;
  camerasTotal: number;
  aircraftTracked: number;
  notableAircraft: { callsign: string; type: string; altFt: number | null; gsKt: number | null }[];
  quakes24h: { mag: number; place: string }[];
  weather: { name: string; tempC: number; windKph: number }[];
  iss: { lat: number; lon: number; visibility: string } | null;
  newsHeadlines: string[];
}

interface Props {
  context: LiveContext;
  selectedCam: CameraEntry | null;
}

interface Msg {
  role: "user" | "analyst";
  text: string;
}

const SUGGESTIONS = [
  "What is happening over the Gulf right now?",
  "Summarize the UAE weather picture.",
  "Any notable seismic activity near the Gulf?",
  "Brief me on today's regional headlines.",
];

export default function AnalystChat({ context, selectedCam }: Props) {
  const [messages, setMessages] = useState<Msg[]>([
    {
      role: "analyst",
      text: "ANALYST ONLINE. I reason over the live public feeds fused into this console — flights, cameras, seismic, weather, ISS and news wires. Ask for a situation brief.",
    },
  ]);
  const [input, setInput] = useState("");
  const [busy, setBusy] = useState(false);
  const scrollRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight, behavior: "smooth" });
  }, [messages, busy]);

  const send = async (q: string) => {
    const question = q.trim();
    if (!question || busy) return;
    setInput("");
    setMessages((m) => [...m, { role: "user", text: question }]);
    setBusy(true);
    try {
      const payloadContext: LiveContext & { focusedCamera?: string } = {
        ...context,
        focusedCamera: selectedCam ? `${selectedCam.code} ${selectedCam.name}` : undefined,
      };
      const res = await fetch("/api/analyst", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ question, context: payloadContext }),
      });
      const j = (await res.json()) as { answer?: string; error?: string };
      setMessages((m) => [
        ...m,
        { role: "analyst", text: j.answer || `LINK ERROR: ${j.error ?? "unknown"}` },
      ]);
    } catch {
      setMessages((m) => [...m, { role: "analyst", text: "LINK ERROR — network unreachable." }]);
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="flex h-full flex-col">
      <div ref={scrollRef} className="min-h-0 flex-1 space-y-3 overflow-y-auto ge-scrollbar p-4">
        {messages.map((m, i) => (
          <div
            key={i}
            className={`border p-2.5 font-mono text-[10.5px] leading-5 ${
              m.role === "user"
                ? "border-amber-400/25 bg-amber-400/5 text-amber-100"
                : "border-emerald-400/25 bg-emerald-400/5 text-emerald-100/90"
            }`}
          >
            <div
              className={`mb-1 font-mono text-[8.5px] tracking-[0.25em] ${
                m.role === "user" ? "text-amber-300/70" : "text-emerald-300/70"
              }`}
            >
              {m.role === "user" ? "OPERATOR" : "AI ANALYST"}
            </div>
            <div className="whitespace-pre-wrap">{m.text}</div>
          </div>
        ))}
        {busy && (
          <div className="border border-emerald-400/25 bg-emerald-400/5 p-2.5 font-mono text-[10px] text-emerald-300/80">
            ANALYST PROCESSING<span className="led-blink">…</span>
          </div>
        )}
      </div>

      <div className="border-t border-amber-400/15 p-3">
        <div className="mb-2 flex flex-wrap gap-1.5">
          {SUGGESTIONS.map((s) => (
            <button
              key={s}
              onClick={() => send(s)}
              disabled={busy}
              className="border border-amber-400/20 bg-black/30 px-2 py-1 font-mono text-[8.5px] tracking-[0.08em] text-amber-100/60 transition-colors hover:border-amber-400/50 hover:text-amber-100 disabled:opacity-40"
            >
              {s}
            </button>
          ))}
        </div>
        <form
          onSubmit={(e) => {
            e.preventDefault();
            send(input);
          }}
          className="flex gap-1.5"
        >
          <input
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Ask the eye…"
            className="min-w-0 flex-1 border border-amber-400/25 bg-black/50 px-2.5 py-2 font-mono text-[11px] text-amber-100 placeholder:text-zinc-600 focus:border-amber-400/60 focus:outline-none"
            aria-label="Ask the AI analyst"
          />
          <button
            type="submit"
            disabled={busy || !input.trim()}
            className="border border-emerald-400/40 bg-emerald-400/10 px-3 font-mono text-[10px] tracking-[0.15em] text-emerald-200 transition-colors hover:bg-emerald-400/20 disabled:opacity-40"
          >
            SEND
          </button>
        </form>
      </div>
    </div>
  );
}
