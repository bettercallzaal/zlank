import { describe, it, expect, vi, beforeEach } from 'vitest';
import type { NextRequest } from 'next/server';

// Force resolveSnap to miss so the route falls back to the real decodeSnap -
// keeps the test off Redis and exercises the encoded-payload path.
vi.mock('@/lib/resolve-snap', () => ({ resolveSnap: async () => null }));

const { recordVote, rateLimit } = vi.hoisted(() => ({
  recordVote: vi.fn(async (): Promise<Record<string, number>> => ({ Base: 1 })),
  rateLimit: vi.fn(async (): Promise<{ ok: boolean }> => ({ ok: true })),
}));
vi.mock('@/lib/kv', () => ({ recordVote }));
vi.mock('@/lib/rate-limit', () => ({
  rateLimit,
  rateLimitResponse: () => new Response('rate limited', { status: 429 }),
  ipOf: () => '1.2.3.4',
}));

import { GET, POST } from './route';
import { encodeSnap } from '@/lib/encode';
import type { SnapDoc } from '@/lib/blocks';

function getReq(): NextRequest {
  return new Request('http://x/api/snap/abc/embed') as unknown as NextRequest;
}
function postReq(body: string): NextRequest {
  return new Request('http://x/api/snap/abc/embed', {
    method: 'POST',
    headers: { 'content-type': 'application/x-www-form-urlencoded' },
    body,
  }) as unknown as NextRequest;
}
function ctx(encoded: string) {
  return { params: Promise.resolve({ encoded }) };
}

const pollSnap = (): string =>
  encodeSnap({
    version: 2,
    title: 'Poll Snap',
    theme: 'purple',
    pages: [{ id: 'home', blocks: [{ type: 'poll', question: 'Best chain?', options: ['Base', 'OP'] }] }],
  } satisfies SnapDoc);

beforeEach(() => {
  recordVote.mockClear();
  rateLimit.mockClear();
  rateLimit.mockResolvedValue({ ok: true });
});

describe('GET /api/snap/[encoded]/embed', () => {
  it('returns iframe-safe HTML and renders a poll as a form', async () => {
    const res = await GET(getReq(), ctx(pollSnap()));
    expect(res.status).toBe(200);
    expect(res.headers.get('content-security-policy')).toContain('frame-ancestors *');
    const body = await res.text();
    expect(body).toContain('method="POST"');
    expect(body).toContain('name="vote_0"');
  });

  it('returns 400 for an invalid encoded payload', async () => {
    const res = await GET(getReq(), ctx('!!!not-valid!!!'));
    expect(res.status).toBe(400);
  });
});

describe('POST /api/snap/[encoded]/embed', () => {
  it('records an anonymous vote and returns HTML with the tally', async () => {
    recordVote.mockResolvedValueOnce({ Base: 3, OP: 1 });
    const res = await POST(postReq('vote_0=Base'), ctx(pollSnap()));
    expect(res.status).toBe(200);
    expect(recordVote).toHaveBeenCalledWith(expect.any(String), 0, 'Base');
    const body = await res.text();
    expect(body).toContain('75%');
    expect(body).toContain('4 votes');
    expect(res.headers.get('cache-control')).toBe('no-store');
  });

  it('returns 429 when the IP is rate-limited', async () => {
    rateLimit.mockResolvedValueOnce({ ok: false });
    const res = await POST(postReq('vote_0=Base'), ctx(pollSnap()));
    expect(res.status).toBe(429);
    expect(recordVote).not.toHaveBeenCalled();
  });

  it('returns 400 for an invalid encoded payload', async () => {
    const res = await POST(postReq('vote_0=Base'), ctx('!!!not-valid!!!'));
    expect(res.status).toBe(400);
  });

  it('re-renders without a tally when the form has no vote field', async () => {
    const res = await POST(postReq('junk=1'), ctx(pollSnap()));
    expect(res.status).toBe(200);
    expect(recordVote).not.toHaveBeenCalled();
    const body = await res.text();
    expect(body).toContain('name="vote_0"');
  });
});
