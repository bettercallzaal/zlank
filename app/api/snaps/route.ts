import { NextRequest, NextResponse } from 'next/server';
import { isKvAvailable, saveSnap, claimSnapOwner } from '@/lib/kv';
import { encodeSnap } from '@/lib/encode';
import { validateDoc } from '@/lib/validate-snap';
import { rateLimit, rateLimitResponse, ipOf } from '@/lib/rate-limit';
import { extractFid } from '@/lib/auth';
import type { SnapDoc } from '@/lib/blocks';

const SNAPS_BURST_MAX = Number(process.env.ZLANK_SNAPS_BURST_MAX ?? 5);
const SNAPS_HOUR_MAX = Number(process.env.ZLANK_SNAPS_HOUR_MAX ?? 30);

export const runtime = 'nodejs';

// POST /api/snaps - takes a SnapDoc, persists it, returns a short ID.
// If KV is not configured, falls back to URL-encoding (returns the long ID).

interface CreateBody {
  doc: SnapDoc;
}

function isSnapDoc(input: unknown): input is SnapDoc {
  if (!input || typeof input !== 'object') return false;
  const d = input as Partial<SnapDoc>;
  return d.version === 1 && Array.isArray(d.pages) && typeof d.title === 'string';
}

export async function POST(req: NextRequest) {
  const ip = ipOf(req);
  const rl = await rateLimit([
    { key: `snaps:burst:${ip}`, windowSec: 60, max: SNAPS_BURST_MAX },
    { key: `snaps:hour:${ip}`, windowSec: 60 * 60, max: SNAPS_HOUR_MAX },
  ]);
  if (!rl.ok) return rateLimitResponse(rl);

  let body: CreateBody;
  try {
    body = (await req.json()) as CreateBody;
  } catch {
    return NextResponse.json({ error: 'Invalid JSON' }, { status: 400 });
  }

  if (!body || !isSnapDoc(body.doc)) {
    return NextResponse.json({ error: 'doc field missing or invalid' }, { status: 400 });
  }

  // Preflight: validate the rendered Snap UI for every page against the
  // @farcaster/snap envelope schema + json-render catalog. If the doc would
  // produce an invalid Snap (bad icon name, button label too long, etc.),
  // reject before storing so the user fixes it now instead of after a cast.
  const validation = validateDoc(body.doc);
  if (!validation.ok) {
    return NextResponse.json(
      {
        error: 'Snap validation failed',
        issues: validation.errors,
        pages: validation.pages,
      },
      { status: 400 },
    );
  }

  if (!isKvAvailable()) {
    // No DB - return the URL-encoded form as the "id".
    const encoded = encodeSnap(body.doc);
    return NextResponse.json({ id: encoded, short: false });
  }

  try {
    const id = await saveSnap(body.doc);
    // Capture owner FID at save time when caller presents a valid Quick Auth
    // JWT (Mini App context). Browser-only callers (no token) leave the snap
    // unowned; first authenticated caller to /coin can claim it.
    const fid = await extractFid(req);
    if (fid) {
      await claimSnapOwner(id, fid).catch((err) =>
        console.error('claimSnapOwner failed', id, err),
      );
    }
    return NextResponse.json({ id, short: true, owner: fid ?? null });
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : 'Unknown error';
    return NextResponse.json({ error: 'Failed to save snap', detail: msg }, { status: 500 });
  }
}
