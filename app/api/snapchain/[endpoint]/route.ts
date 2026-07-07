import { NextRequest, NextResponse } from 'next/server';
import { rateLimit, rateLimitResponse, ipOf } from '@/lib/rate-limit';

export const runtime = 'nodejs';

// HTTPS proxy in front of a Snapchain/Hypersnap hub HTTP endpoint. zlank's
// dataSource path is HTTPS-only + SSRF-guarded, so user-authored SnapDocs
// cannot point at a hub IP+port directly. This proxy gives them a stable
// HTTPS URL on our origin that forwards a whitelisted set of read-only
// Snapchain HTTP API calls.
//
// Configure via ZLANK_SNAPCHAIN_HUB (no trailing slash). Falls back to a
// known-public Hypersnap node so dev + deploy can demo without setup.

const DEFAULT_HUB = 'http://154.16.171.247:3381';

// Read-only protocol endpoints we expose. Add new entries explicitly - this
// is the SSRF boundary, do not turn it into a generic open proxy.
const ALLOWED_ENDPOINTS = new Set([
  'info',
  'castsByFid',
  'castsByMention',
  'castsByParent',
  'castById',
  'userDataByFid',
  'storageLimitsByFid',
  'verificationsByFid',
  'linksByFid',
]);

const FETCH_TIMEOUT_MS = 5000;

export async function GET(
  req: NextRequest,
  ctx: { params: Promise<{ endpoint: string }> },
) {
  const { endpoint } = await ctx.params;

  if (!ALLOWED_ENDPOINTS.has(endpoint)) {
    return NextResponse.json({ error: 'unknown snapchain endpoint' }, { status: 404 });
  }

  // Hub reads are public + cheap but still budgetable. Cap per-IP so one
  // caller cannot drain budget on the shared node.
  const ip = ipOf(req);
  const rl = await rateLimit([{ key: `snapchain:${ip}`, windowSec: 60, max: 60 }]);
  if (!rl.ok) return rateLimitResponse(rl);

  const hub = (process.env.ZLANK_SNAPCHAIN_HUB ?? DEFAULT_HUB).replace(/\/+$/, '');
  const target = `${hub}/v1/${endpoint}${new URL(req.url).search}`;

  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), FETCH_TIMEOUT_MS);
  try {
    const res = await fetch(target, { signal: controller.signal });
    const text = await res.text();
    return new NextResponse(text, {
      status: res.status,
      headers: {
        'content-type': res.headers.get('content-type') ?? 'application/json',
        'cache-control': 'public, max-age=30, s-maxage=60',
        'access-control-allow-origin': '*',
      },
    });
  } catch (err) {
    console.error('snapchain proxy: upstream fetch failed', endpoint, err);
    return NextResponse.json({ error: 'snapchain hub unreachable' }, { status: 502 });
  } finally {
    clearTimeout(timeout);
  }
}
