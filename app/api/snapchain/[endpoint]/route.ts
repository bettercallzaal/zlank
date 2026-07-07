import { NextRequest, NextResponse } from 'next/server';
import { rateLimit, rateLimitResponse, ipOf } from '@/lib/rate-limit';

export const runtime = 'nodejs';

// HTTPS proxy in front of a Snapchain/Hypersnap hub endpoint. zlank's
// dataSource path is HTTPS-only + SSRF-guarded, so user-authored SnapDocs
// cannot point at a hub IP+port directly. This proxy gives them a stable
// HTTPS URL on our origin that forwards a whitelisted set of read-only
// Snapchain HTTP API calls.
//
// Configure via ZLANK_SNAPCHAIN_HUB env var (must use HTTPS, no trailing slash).
// No default - if not configured, the endpoint returns 500 with clear error.

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

/**
 * Validate that a hub URL is HTTPS to prevent credential leakage over HTTP.
 * Throws if the URL is not HTTPS or is malformed.
 */
function validateHubUrl(url: string): void {
  const lower = url.toLowerCase();
  if (!lower.startsWith('https://')) {
    throw new Error('Hub URL must use HTTPS, not HTTP');
  }
  try {
    new URL(url);
  } catch {
    throw new Error('Hub URL is malformed');
  }
}

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

  const hubUrl = process.env.ZLANK_SNAPCHAIN_HUB;
  if (!hubUrl) {
    console.error('snapchain proxy: ZLANK_SNAPCHAIN_HUB not configured');
    return NextResponse.json({ error: 'snapchain hub not configured' }, { status: 503 });
  }
  try {
    validateHubUrl(hubUrl);
  } catch (err) {
    console.error('snapchain proxy: invalid hub URL', hubUrl, err);
    return NextResponse.json({ error: 'invalid hub configuration' }, { status: 500 });
  }
  const hub = hubUrl.replace(/\/+$/, '');
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
