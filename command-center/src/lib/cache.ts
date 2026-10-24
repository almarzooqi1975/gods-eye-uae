// Simple in-memory TTL cache for API route responses.

interface CacheEntry<T> {
  data: T;
  expires: number;
}

const store = new Map<string, CacheEntry<unknown>>();

export function cacheGet<T>(key: string): T | null {
  const hit = store.get(key);
  if (!hit) return null;
  if (Date.now() > hit.expires) {
    store.delete(key);
    return null;
  }
  return hit.data as T;
}

export function cacheSet<T>(key: string, data: T, ttlMs: number): void {
  store.set(key, { data, expires: Date.now() + ttlMs });
}

export async function fetchWithTimeout(
  url: string,
  timeoutMs = 9000,
  init?: RequestInit,
): Promise<Response> {
  const controller = new AbortController();
  const t = setTimeout(() => controller.abort(), timeoutMs);
  try {
    return await fetch(url, {
      ...init,
      signal: controller.signal,
      headers: {
        "User-Agent": "GodsEye-UAE-OSINT/1.0 (open-data console)",
        ...(init?.headers ?? {}),
      },
      cache: "no-store",
    });
  } finally {
    clearTimeout(t);
  }
}
