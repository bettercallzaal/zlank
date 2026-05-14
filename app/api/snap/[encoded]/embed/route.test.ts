import { describe, it, expect, vi } from 'vitest';
import type { NextRequest } from 'next/server';

// Force resolveSnap to miss so the route falls back to the real decodeSnap -
// keeps the test off Redis and exercises the encoded-payload path.
vi.mock('@/lib/resolve-snap', () => ({ resolveSnap: async () => null }));

import { GET } from './route';
import { encodeSnap } from '@/lib/encode';
import type { SnapDoc } from '@/lib/blocks';

function req(): NextRequest {
  return new Request('http://x/api/snap/abc/embed') as unknown as NextRequest;
}
function ctx(encoded: string) {
  return { params: Promise.resolve({ encoded }) };
}

describe('GET /api/snap/[encoded]/embed', () => {
  it('returns iframe-safe HTML with frame-ancestors *', async () => {
    const encoded = encodeSnap({
      version: 2,
      title: 'Embed Me',
      theme: 'purple',
      pages: [{ id: 'home', blocks: [{ type: 'header', title: 'Embed Me' }] }],
    } satisfies SnapDoc);
    const res = await GET(req(), ctx(encoded));
    expect(res.status).toBe(200);
    expect(res.headers.get('content-type')).toContain('text/html');
    expect(res.headers.get('content-security-policy')).toContain('frame-ancestors *');
    const body = await res.text();
    expect(body).toContain('<html');
    expect(body).toContain('Embed Me');
  });

  it('returns 400 for an invalid encoded payload', async () => {
    const res = await GET(req(), ctx('!!!not-valid!!!'));
    expect(res.status).toBe(400);
  });
});
