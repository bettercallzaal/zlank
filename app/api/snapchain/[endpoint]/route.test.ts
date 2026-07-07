import { describe, it, expect, vi, beforeEach } from 'vitest';
import type { NextRequest } from 'next/server';

const { rateLimit } = vi.hoisted(() => ({
  rateLimit: vi.fn<(...args: unknown[]) => Promise<{ ok: boolean }>>(async () => ({ ok: true })),
}));
vi.mock('@/lib/rate-limit', () => ({
  rateLimit,
  rateLimitResponse: () => new Response('rate limited', { status: 429 }),
  ipOf: () => '1.2.3.4',
}));

import { GET } from './route';

function ctx(endpoint: string) {
  return { params: Promise.resolve({ endpoint }) };
}
function req(url = 'http://x/api/snapchain/info'): NextRequest {
  return new Request(url) as unknown as NextRequest;
}

beforeEach(() => {
  rateLimit.mockClear();
  rateLimit.mockResolvedValue({ ok: true });
  vi.unstubAllGlobals();
});

describe('GET /api/snapchain/[endpoint] proxy', () => {
  it('rejects unknown endpoints with 404 (SSRF boundary)', async () => {
    const res = await GET(req(), ctx('arbitrary-evil-endpoint'));
    expect(res.status).toBe(404);
  });

  it('returns 429 when the caller IP is rate-limited', async () => {
    rateLimit.mockResolvedValueOnce({ ok: false });
    const res = await GET(req(), ctx('info'));
    expect(res.status).toBe(429);
  });

  it('forwards the request to the configured hub for allowed endpoints', async () => {
    let calledUrl = '';
    const fetchSpy = vi.fn(async (input: unknown) => {
      calledUrl = String(input);
      return new Response('{"ok":true}', { status: 200, headers: { 'content-type': 'application/json' } });
    });
    vi.stubGlobal('fetch', fetchSpy);
    process.env.ZLANK_SNAPCHAIN_HUB = 'http://hub.test:9000';

    const res = await GET(req('http://x/api/snapchain/castsByFid?fid=4163'), ctx('castsByFid'));
    expect(res.status).toBe(200);
    expect(fetchSpy).toHaveBeenCalledTimes(1);
    expect(calledUrl).toBe('http://hub.test:9000/v1/castsByFid?fid=4163');
    expect(res.headers.get('cache-control')).toContain('max-age=30');
  });

  it('returns 502 when the hub fetch fails', async () => {
    vi.stubGlobal('fetch', vi.fn(async () => { throw new Error('boom'); }));
    const res = await GET(req(), ctx('info'));
    expect(res.status).toBe(502);
  });
});
