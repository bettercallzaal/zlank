import { describe, it, expect, vi, beforeEach } from 'vitest';
import type { NextRequest } from 'next/server';

const { extractFid } = vi.hoisted(() => ({
  extractFid: vi.fn<(req: Request) => Promise<number | undefined>>(),
}));
vi.mock('@/lib/auth', () => ({ extractFid }));

import { POST } from './route';

function ctx(id: string) {
  return { params: Promise.resolve({ id }) };
}
function jsonReq(body: unknown): NextRequest {
  return new Request('http://x/api/snaps/s/action', {
    method: 'POST',
    headers: { 'content-type': 'application/json' },
    body: JSON.stringify(body),
  }) as unknown as NextRequest;
}

beforeEach(() => {
  extractFid.mockReset();
});

describe('POST /api/snaps/[id]/action', () => {
  it('returns 401 without a valid Quick Auth token', async () => {
    extractFid.mockResolvedValue(undefined);
    const res = await POST(jsonReq({ action: 'like' }), ctx('s'));
    expect(res.status).toBe(401);
  });

  it('returns 400 for an unknown action', async () => {
    extractFid.mockResolvedValue(123);
    const res = await POST(jsonReq({ action: 'delete-everything' }), ctx('s'));
    expect(res.status).toBe(400);
  });

  it('returns 400 for an invalid JSON body', async () => {
    extractFid.mockResolvedValue(123);
    const bad = new Request('http://x/api/snaps/s/action', {
      method: 'POST',
      body: 'not json',
    }) as unknown as NextRequest;
    const res = await POST(bad, ctx('s'));
    expect(res.status).toBe(400);
  });

  it('returns 403 for an action outside the v1 allowlist', async () => {
    extractFid.mockResolvedValue(123);
    const res = await POST(jsonReq({ action: 'compose-cast' }), ctx('s'));
    expect(res.status).toBe(403);
  });

  it('returns 503 for an allowed action - signer not configured in v1', async () => {
    extractFid.mockResolvedValue(123);
    const res = await POST(jsonReq({ action: 'like' }), ctx('s'));
    expect(res.status).toBe(503);
    const json = (await res.json()) as { status: string };
    expect(json.status).toBe('unavailable');
  });
});
