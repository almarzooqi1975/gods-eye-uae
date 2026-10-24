import { NextResponse } from "next/server";
import { cacheGet, cacheSet, fetchWithTimeout } from "@/lib/cache";

export const dynamic = "force-dynamic";

export interface NewsItem {
  title: string;
  url: string;
  domain: string;
  seendate: string;
}

interface GdeltArticle {
  title?: string;
  url?: string;
  domain?: string;
  seendate?: string;
}

export async function GET() {
  const cached = cacheGet<NewsItem[]>("news:me");
  if (cached) {
    return NextResponse.json({ items: cached, source: "cache", count: cached.length });
  }

  const query = encodeURIComponent(
    '("United Arab Emirates" OR Dubai OR "Abu Dhabi" OR "Saudi Arabia" OR Qatar OR "Middle East") sourcelang:english',
  );
  const url = `https://api.gdeltproject.org/api/v2/doc/doc?query=${query}&mode=artlist&maxrecords=25&sort=datedesc&format=json`;

  try {
    const res = await fetchWithTimeout(url, 12000);
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    const text = await res.text();
    let items: NewsItem[] = [];
    try {
      const json = JSON.parse(text) as { articles?: GdeltArticle[] };
      items = (json.articles ?? [])
        .filter((a) => a.title && a.url)
        .slice(0, 25)
        .map((a) => ({
          title: (a.title ?? "").slice(0, 220),
          url: a.url ?? "",
          domain: a.domain ?? "",
          seendate: a.seendate ?? "",
        }));
    } catch {
      // GDELT occasionally returns a rate-limit notice string — treat as empty.
      items = [];
    }

    if (items.length === 0) throw new Error("empty or rate-limited");
    cacheSet("news:me", items, 300000);
    return NextResponse.json({ items, source: "GDELT", count: items.length });
  } catch {
    return NextResponse.json(
      { items: [], source: "unreachable", count: 0, error: "GDELT feed unavailable" },
      { status: 200 },
    );
  }
}
