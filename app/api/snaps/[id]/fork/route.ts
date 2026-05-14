import { NextResponse } from 'next/server';
import { loadSnapDoc, incrementPartnerStat } from '@/lib/kv';
import type { SnapDoc } from '@/lib/blocks';

export const runtime = 'nodejs';

// POST /api/snaps/{id}/fork
// Returns the source SnapDoc with parentId set to the source id, ready to load
// into the builder as a new draft. Refuses if the source opted out of forking
// (doc.forkable === false). The fork itself is persisted later via POST
// /api/snaps, which records the lineage in the fork-tree index.

export async function POST(
  _req: Request,
  ctx: { params: Promise<{ id: string }> },
) {
  const { id } = await ctx.params;
  const source = await loadSnapDoc(id);
  if (!source) {
    return NextResponse.json({ error: 'snap not found' }, { status: 404 });
  }
  if (source.forkable === false) {
    return NextResponse.json({ error: 'source snap is not forkable' }, { status: 403 });
  }
  // Count the fork against the source's partner. Failures must not fail the fork.
  if (source.partner?.id) {
    incrementPartnerStat(source.partner.id, 'forks').catch((err) =>
      console.error('incrementPartnerStat forks', err),
    );
  }
  const forked: SnapDoc = { ...source, parentId: id };
  return NextResponse.json({ doc: forked });
}
