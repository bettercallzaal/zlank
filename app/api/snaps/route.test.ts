import { describe, it, expect, vi, beforeEach } from 'vitest';
import type { NextRequest } from 'next/server';

// vi.mock factories are hoisted above module scope, so the mock fns must be
// declared via vi.hoisted to be reachable inside the factory.
const { recordFork, recordPartnerSnap, saveSnap, claimSnapOwner } = vi.hoisted(() => ({
  recordFork: vi.fn(async () => {}),
  recordPartnerSnap: vi.fn(async () => {}),
  saveSnap: vi.fn(async () => 'new-snap-id'),
  claimSnapOwner: vi.fn(async () => true),
}));

vi.mock('@/lib/kv', () => ({
  isKvAvailable: () => true,
  saveSnap,
  claimSnapOwner,
  recordFork,
  recordPartnerSnap,
}));
vi.mock('@/lib/rate-limit', () => ({
  rateLimit: async () => ({ ok: true }),
  rateLimitResponse: () => new Response('rate limited', { status: 429 }),
  ipOf: () => '1.2.3.4',
}));
vi.mock('@/lib/auth', () => ({ extractFid: async () => undefined }));
vi.mock('@/lib/validate-snap', () => ({
  validateDoc: () => ({ ok: true, pages: [], errors: [] }),
}));

import { POST } from './route';

function makeReq(doc: unknown): NextRequest {
  return new Request('http://x/api/snaps', {
    method: 'POST',
    headers: { 'content-type': 'application/json' },
    body: JSON.stringify({ doc }),
  }) as unknown as NextRequest;
}

beforeEach(() => {
  recordFork.mockClear();
  recordPartnerSnap.mockClear();
});

describe('POST /api/snaps - fork + partner recording', () => {
  it('records fork lineage when the doc has a parentId', async () => {
    const res = await POST(
      makeReq({
        version: 2, title: 't', theme: 'purple', parentId: 'parent-abc',
        pages: [{ id: 'home', blocks: [] }],
      }),
    );
    expect(res.status).toBe(200);
    expect(recordFork).toHaveBeenCalledWith('parent-abc', 'new-snap-id');
  });

  it('records the partner index when the doc has a partner', async () => {
    await POST(
      makeReq({
        version: 2, title: 't', theme: 'purple',
        partner: { id: 'footy', name: 'Footy App', attribution: true },
        pages: [{ id: 'home', blocks: [] }],
      }),
    );
    expect(recordPartnerSnap).toHaveBeenCalledWith('footy', 'new-snap-id');
  });

  it('does not record fork or partner for a plain v1 doc', async () => {
    await POST(makeReq({ version: 1, title: 't', theme: 'purple', pages: [{ id: 'home', blocks: [] }] }));
    expect(recordFork).not.toHaveBeenCalled();
    expect(recordPartnerSnap).not.toHaveBeenCalled();
  });

  it('accepts a v2 doc (isSnapDoc allows version 2)', async () => {
    const res = await POST(
      makeReq({ version: 2, title: 't', theme: 'purple', pages: [{ id: 'home', blocks: [] }] }),
    );
    expect(res.status).toBe(200);
  });

  it('rejects a non-doc body', async () => {
    const res = await POST(makeReq({ not: 'a doc' }));
    expect(res.status).toBe(400);
  });
});
