import { NextResponse } from "next/server";
import ZAI from "z-ai-web-dev-sdk";

export const dynamic = "force-dynamic";
export const maxDuration = 60;

interface AnalystRequest {
  question: string;
  context?: {
    camerasOnline?: number;
    camerasTotal?: number;
    aircraftTracked?: number;
    notableAircraft?: { callsign: string; type: string; altFt: number | null; gsKt: number | null }[];
    quakes24h?: { mag: number; place: string }[];
    weather?: { name: string; tempC: number; windKph: number }[];
    iss?: { lat: number; lon: number; visibility: string } | null;
    newsHeadlines?: string[];
  };
}

const SYSTEM_PROMPT = `You are the AI ANALYST of "GODS EYE // UAE", a Middle East open-source intelligence (OSINT) console inspired by public signals fusion systems.
You synthesize LIVE open data: public aviation ADS-B transponders, public webcam networks, USGS seismic feeds, open weather, public news wires, and public ISS telemetry.
Rules:
- Be concise, tactical, and precise. Use short military-brief style paragraphs or bullet lists.
- Only reason over the live context snapshot provided in the user message. If data is missing, say "NO DATA ON THIS FEED".
- Never invent aircraft, quakes, or events not present in the context.
- Everything you see is PUBLIC, broadcast, open-source information — say so if asked.
- Focus region: United Arab Emirates, the Arabian Gulf, and the wider Middle East.
- Sign off answers under 120 words when possible.`;

export async function POST(request: Request) {
  try {
    const body = (await request.json()) as AnalystRequest;
    const question = (body.question ?? "").slice(0, 500);
    if (!question.trim()) {
      return NextResponse.json({ answer: "", error: "Empty question" }, { status: 400 });
    }

    const zai = await ZAI.create();
    const contextStr = body.context
      ? JSON.stringify(body.context, null, 1).slice(0, 6000)
      : "NO SNAPSHOT";

    const completion = await zai.chat.completions.create({
      messages: [
        { role: "system", content: SYSTEM_PROMPT },
        {
          role: "user",
          content: `LIVE CONTEXT SNAPSHOT (public feeds, captured now):\n${contextStr}\n\nANALYST QUESTION: ${question}`,
        },
      ],
    });

    const answer =
      completion.choices[0]?.message?.content ??
      "ANALYST LINK DOWN — TRY AGAIN.";
    return NextResponse.json({ answer });
  } catch (e) {
    return NextResponse.json(
      { answer: "", error: e instanceof Error ? e.message : "analyst failure" },
      { status: 200 },
    );
  }
}
