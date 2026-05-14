import { describe, it, expect, vi, beforeEach } from 'vitest';
import { resolveDataSources, __clearDataSourceCache } from './live-data';

beforeEach(() => {
  vi.unstubAllGlobals();
  __clearDataSourceCache();
});

describe('resolveDataSources', () => {
  it('fetches a REST datasource and returns parsed JSON', async () => {
    vi.stubGlobal(
      'fetch',
      vi.fn(async () => ({ ok: true, text: async () => '{"score":"2-1"}' })),
    );
    const result = await resolveDataSources([
      { id: 'a', kind: 'rest', url: 'https://api.x/score', refreshSec: 30 },
    ]);
    expect(result.a).toEqual({ score: '2-1' });
  });

  it('returns the raw string when the REST body is not JSON', async () => {
    vi.stubGlobal('fetch', vi.fn(async () => ({ ok: true, text: async () => 'plain text' })));
    const result = await resolveDataSources([{ id: 'a', kind: 'rest', url: 'https://api.x/t' }]);
    expect(result.a).toBe('plain text');
  });

  it('returns the static value for kind=static', async () => {
    const result = await resolveDataSources([
      { id: 'a', kind: 'static', staticValue: { foo: 'bar' } },
    ]);
    expect(result.a).toEqual({ foo: 'bar' });
  });

  it('returns null on fetch error without throwing', async () => {
    vi.stubGlobal('fetch', vi.fn(async () => { throw new Error('network'); }));
    const result = await resolveDataSources([{ id: 'a', kind: 'rest', url: 'https://api.x/fail' }]);
    expect(result.a).toBeNull();
  });

  it('returns null when the response is not ok', async () => {
    vi.stubGlobal('fetch', vi.fn(async () => ({ ok: false, text: async () => '' })));
    const result = await resolveDataSources([{ id: 'a', kind: 'rest', url: 'https://api.x/500' }]);
    expect(result.a).toBeNull();
  });

  it('refuses non-HTTPS URLs', async () => {
    const result = await resolveDataSources([
      { id: 'a', kind: 'rest', url: 'http://insecure.com' },
    ]);
    expect(result.a).toBeNull();
  });

  it('refuses a rest source with no url', async () => {
    const result = await resolveDataSources([{ id: 'a', kind: 'rest' }]);
    expect(result.a).toBeNull();
  });

  it('resolves multiple sources, keyed by id', async () => {
    vi.stubGlobal('fetch', vi.fn(async () => ({ ok: true, text: async () => '{"v":1}' })));
    const result = await resolveDataSources([
      { id: 'first', kind: 'rest', url: 'https://api.x/1' },
      { id: 'second', kind: 'static', staticValue: 42 },
    ]);
    expect(result.first).toEqual({ v: 1 });
    expect(result.second).toBe(42);
  });
});

describe('resolveDataSources caching', () => {
  it('caches a REST response within the refreshSec window', async () => {
    const fetchSpy = vi.fn(async () => ({ ok: true, text: async () => '{"v":1}' }));
    vi.stubGlobal('fetch', fetchSpy);
    await resolveDataSources([{ id: 'a', kind: 'rest', url: 'https://x/cached', refreshSec: 30 }]);
    await resolveDataSources([{ id: 'a', kind: 'rest', url: 'https://x/cached', refreshSec: 30 }]);
    expect(fetchSpy).toHaveBeenCalledTimes(1);
  });

  it('does not cache a failed resolution', async () => {
    const fetchSpy = vi.fn(async () => { throw new Error('down'); });
    vi.stubGlobal('fetch', fetchSpy);
    await resolveDataSources([{ id: 'a', kind: 'rest', url: 'https://x/down', refreshSec: 30 }]);
    await resolveDataSources([{ id: 'a', kind: 'rest', url: 'https://x/down', refreshSec: 30 }]);
    expect(fetchSpy).toHaveBeenCalledTimes(2);
  });

  it('keys the cache by url and refreshSec separately', async () => {
    const fetchSpy = vi.fn(async () => ({ ok: true, text: async () => '{"v":1}' }));
    vi.stubGlobal('fetch', fetchSpy);
    await resolveDataSources([{ id: 'a', kind: 'rest', url: 'https://x/k', refreshSec: 30 }]);
    await resolveDataSources([{ id: 'a', kind: 'rest', url: 'https://x/k', refreshSec: 60 }]);
    expect(fetchSpy).toHaveBeenCalledTimes(2);
  });
});
