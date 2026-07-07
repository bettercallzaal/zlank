import { NextResponse } from 'next/server';
import { getStats } from '@/lib/kv';

export const runtime = 'nodejs';

// GET /api/snaps/{snapId}/stats -> { views, interactions, lastViewAt, lastInteractionAt }
// Public read. No FID-level breakdown for v1.

export async function GET(_req: Request, ctx: { params: Promise<{ id: string }> }) {
  const { id } = await ctx.params;
  const stats = await getStats(id);
  return NextResponse.json(
    { snapId: id, ...stats },
    {
      headers: {
        'cache-control': 'no-store',
        'access-control-allow-origin': '*',
      },
    },
  );
}
