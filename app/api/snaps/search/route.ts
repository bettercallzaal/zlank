import { NextResponse } from 'next/server';
import { listSnapsByPartner } from '@/lib/kv';

export const runtime = 'nodejs';

const MAX_RESULTS = 100;

// GET /api/snaps/search?partner=<id>
// Returns the snap ids co-branded with a partner. v1 supports partner-scoped
// search only; full-text / author search can layer on later.

export async function GET(req: Request) {
  const url = new URL(req.url);
  const partner = url.searchParams.get('partner');
  if (!partner) {
    return NextResponse.json(
      { error: 'partner query param required', snaps: [] },
      { status: 400 },
    );
  }
  const snaps = await listSnapsByPartner(partner, MAX_RESULTS);
  return NextResponse.json(
    { partner, snaps, count: snaps.length },
    { headers: { 'cache-control': 'no-store', 'access-control-allow-origin': '*' } },
  );
}
