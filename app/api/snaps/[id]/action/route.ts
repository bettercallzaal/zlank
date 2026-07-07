import { NextRequest, NextResponse } from 'next/server';
import { extractFid } from '@/lib/auth';
import { delegateAction, isAction } from '@/lib/signer';

export const runtime = 'nodejs';

// POST /api/snaps/{id}/action
// Body: { action: "like" | "follow" | ... }
//
// Performs a delegated action on behalf of the authenticated viewer. Requires
// a Quick Auth JWT (Authorization: Bearer <jwt>). The action must be in the
// v1 allowlist (see lib/signer). v1 has no managed-signer infrastructure, so
// allowed actions return 503 "unavailable" honestly rather than faking
// success - the endpoint contract is stable for when a signer is wired up.

export async function POST(
  req: NextRequest,
  ctx: { params: Promise<{ id: string }> },
) {
  const fid = await extractFid(req);
  if (!fid) {
    return NextResponse.json({ error: 'authentication required' }, { status: 401 });
  }

  const { id } = await ctx.params;

  let body: { action?: unknown };
  try {
    body = (await req.json()) as { action?: unknown };
  } catch {
    return NextResponse.json({ error: 'invalid JSON' }, { status: 400 });
  }

  if (!isAction(body.action)) {
    return NextResponse.json({ error: 'unknown or missing action' }, { status: 400 });
  }

  const result = await delegateAction(body.action, { fid, snapId: id });
  const status =
    result.status === 'executed' ? 200 : result.status === 'rejected' ? 403 : 503;
  return NextResponse.json(result, { status });
}
