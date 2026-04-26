import { NextRequest, NextResponse } from 'next/server';
import { getChatLog } from '@/lib/kv';

export const runtime = 'nodejs';

// GET /api/chat-log/{snapId}?limit=50
// Public read of what people have shared via chatbot blocks on a snap.
// Lets a creator see "what are people building" without an admin login.
// Capped at 100 entries per request.

export async function GET(
  req: NextRequest,
  ctx: { params: Promise<{ id: string }> },
) {
  const { id } = await ctx.params;
  const limitParam = new URL(req.url).searchParams.get('limit');
  const limit = Math.min(Math.max(Number(limitParam) || 50, 1), 100);
  const entries = await getChatLog(id, limit);
  return NextResponse.json(
    { snapId: id, count: entries.length, entries },
    {
      headers: {
        'cache-control': 'no-store',
        'access-control-allow-origin': '*',
      },
    },
  );
}
