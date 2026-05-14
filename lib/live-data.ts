import type { DataSource } from './blocks';
import { isHttpsUrl } from './blocks';

// Resolves a SnapDoc's dataSource bindings to concrete values at render time.
// Every failure mode (bad URL, network error, non-ok response, oversized body)
// degrades to null rather than throwing, so a broken feed never breaks a Snap.

const FETCH_TIMEOUT_MS = 5000;
const MAX_RESPONSE_BYTES = 64_000;
const DEFAULT_REFRESH_SEC = 30;

export type DataSourceValue = unknown | null;
export type ResolvedDataSources = Record<string, DataSourceValue>;

// Per-instance response cache. On Vercel this is per warm serverless instance,
// not global - acceptable for v1, where the goal is to avoid re-fetching the
// same feed on every render within a refresh window. Only successful (non-null)
// resolutions are cached so a transient failure is not stuck for the window.
interface CacheEntry {
  at: number;
  value: DataSourceValue;
}
const responseCache = new Map<string, CacheEntry>();

/** Test-only: clear the response cache between tests. */
export function __clearDataSourceCache(): void {
  responseCache.clear();
}

function cacheKey(ds: DataSource): string {
  return `${ds.url ?? ds.snapId ?? ds.id}|${ds.refreshSec ?? DEFAULT_REFRESH_SEC}`;
}

async function fetchSource(url: string): Promise<DataSourceValue> {
  if (!isHttpsUrl(url)) return null;
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), FETCH_TIMEOUT_MS);
  try {
    const res = await fetch(url, { signal: controller.signal });
    if (!res.ok) return null;
    const text = (await res.text()).slice(0, MAX_RESPONSE_BYTES);
    try {
      return JSON.parse(text);
    } catch {
      return text;
    }
  } catch {
    return null;
  } finally {
    clearTimeout(timeout);
  }
}

async function resolveOne(ds: DataSource): Promise<DataSourceValue> {
  try {
    switch (ds.kind) {
      case 'static':
        return ds.staticValue ?? null;
      case 'rest':
      case 'webhook': {
        if (!ds.url) return null;
        const key = cacheKey(ds);
        const ttlMs = (ds.refreshSec ?? DEFAULT_REFRESH_SEC) * 1000;
        const hit = responseCache.get(key);
        if (hit && Date.now() - hit.at < ttlMs) return hit.value;
        const value = await fetchSource(ds.url);
        if (value !== null) responseCache.set(key, { at: Date.now(), value });
        return value;
      }
      case 'snap':
        // Cross-snap aggregation is wired up in W10 (snap search); until then
        // a snap-kind source resolves to null rather than guessing an origin.
        return null;
      default:
        return null;
    }
  } catch {
    return null;
  }
}

/**
 * Resolve every data source to a value. Result is keyed by DataSource.id so
 * blocks can look up their bound source by dataSourceId.
 */
export async function resolveDataSources(sources: DataSource[]): Promise<ResolvedDataSources> {
  const entries = await Promise.all(
    sources.map(async (ds): Promise<[string, DataSourceValue]> => [ds.id, await resolveOne(ds)]),
  );
  return Object.fromEntries(entries);
}
