import { TavilySearchResponse } from "@/lib/tools/tavily";

interface CacheEntry {
  response: TavilySearchResponse;
  expiresAt: number;
}

const cache = new Map<string, CacheEntry>();
const DEFAULT_TTL_MS = 60 * 60 * 1000; // 1 hour

export function getCachedTavilySearch(query: string): TavilySearchResponse | null {
  const normalizedKey = query.toLowerCase().trim();
  const entry = cache.get(normalizedKey);
  if (!entry) return null;

  if (Date.now() > entry.expiresAt) {
    cache.delete(normalizedKey);
    return null;
  }

  return entry.response;
}

export function setCachedTavilySearch(query: string, response: TavilySearchResponse, ttlMs: number = DEFAULT_TTL_MS): void {
  const normalizedKey = query.toLowerCase().trim();
  cache.set(normalizedKey, {
    response,
    expiresAt: Date.now() + ttlMs,
  });
}
