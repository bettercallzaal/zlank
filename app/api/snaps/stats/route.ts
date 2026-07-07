import { NextRequest, NextResponse } from 'next/server';
import { getStats, type SnapStats } from '@/lib/kv';

export const runtime = 'nodejs';

// GET /api/snaps/stats?ids=a,b,c
// Batch fetches stats for multiple snaps in parallel. Used by the dashboard
// to avoid N+1 client-side fetches when a user has 50+ saved snaps.
// Caps at 100 ids per request.

const MAX_IDS = 100;

export async function GET(req: NextRequest) {
  const idsParam = new URL(req.url).searchParams.get('ids') ?? '';
  const ids = idsParam
    .split(',')
    .map((s) => s.trim())
    .filter((s) => s.length > 0)
    .slice(0, MAX_IDS);

  if (ids.length === 0) {
    return NextResponse.json(
      { error: 'ids query param required (comma-separated snap ids)' },
      { status: 400 },
    );
  }

  const entries = await Promise.all(
    ids.map(async (id) => [id, await getStats(id)] as const),
  );
  const stats: Record<string, SnapStats> = {};
  for (const [id, s] of entries) stats[id] = s;

  return NextResponse.json(
    { stats, count: entries.length },
    {
      headers: {
        'cache-control': 'no-store',
        'access-control-allow-origin': '*',
      },
    },
  );
}
