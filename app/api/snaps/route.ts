import { NextRequest, NextResponse } from 'next/server';
import { isKvAvailable, saveSnap } from '@/lib/kv';
import { encodeSnap } from '@/lib/encode';
import type { SnapDoc } from '@/lib/blocks';

export const runtime = 'nodejs';

// POST /api/snaps - takes a SnapDoc, persists it, returns a short ID.
// If KV is not configured, falls back to URL-encoding (returns the long ID).

interface CreateBody {
  doc: SnapDoc;
}

function isSnapDoc(input: unknown): input is SnapDoc {
  if (!input || typeof input !== 'object') return false;
  const d = input as Partial<SnapDoc>;
  return d.version === 1 && Array.isArray(d.blocks) && typeof d.title === 'string';
}

export async function POST(req: NextRequest) {
  let body: CreateBody;
  try {
    body = (await req.json()) as CreateBody;
  } catch {
    return NextResponse.json({ error: 'Invalid JSON' }, { status: 400 });
  }

  if (!body || !isSnapDoc(body.doc)) {
    return NextResponse.json({ error: 'doc field missing or invalid' }, { status: 400 });
  }

  if (!isKvAvailable()) {
    // No DB - return the URL-encoded form as the "id".
    const encoded = encodeSnap(body.doc);
    return NextResponse.json({ id: encoded, short: false });
  }

  try {
    const id = await saveSnap(body.doc);
    return NextResponse.json({ id, short: true });
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : 'Unknown error';
    return NextResponse.json({ error: 'Failed to save snap', detail: msg }, { status: 500 });
  }
}
