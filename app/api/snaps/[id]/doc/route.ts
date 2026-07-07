import { NextRequest, NextResponse } from 'next/server';
import { loadSnapDoc } from '@/lib/kv';

export const runtime = 'nodejs';

export async function GET(
  _req: NextRequest,
  ctx: { params: Promise<{ id: string }> },
) {
  const { id } = await ctx.params;

  try {
    const doc = await loadSnapDoc(id);
    if (!doc) {
      return NextResponse.json({ error: 'Snap document not found' }, { status: 404 });
    }
    return NextResponse.json(doc);
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : 'Unknown error';
    return NextResponse.json({ error: 'Failed to load snap document', detail: msg }, { status: 500 });
  }
}
