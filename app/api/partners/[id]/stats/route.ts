import { NextResponse } from 'next/server';
import { getPartnerStats } from '@/lib/kv';

export const runtime = 'nodejs';

// GET /api/partners/{id}/stats -> { views, forks, actions }
// Public read. Aggregate counters across every snap co-branded with the
// partner. No per-snap or per-FID breakdown for v1.

export async function GET(_req: Request, ctx: { params: Promise<{ id: string }> }) {
  const { id } = await ctx.params;
  const stats = await getPartnerStats(id);
  return NextResponse.json(
    { partnerId: id, ...stats },
    {
      headers: {
        'cache-control': 'no-store',
        'access-control-allow-origin': '*',
      },
    },
  );
}
