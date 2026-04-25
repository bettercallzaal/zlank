import { NextRequest, NextResponse } from 'next/server';
import { decodeSnap } from '@/lib/encode';
import { docToSnap } from '@/lib/snap-spec';

function getBaseUrl(req: NextRequest, encoded: string): string {
  if (process.env.NEXT_PUBLIC_BASE_URL) {
    return `${process.env.NEXT_PUBLIC_BASE_URL.replace(/\/$/, '')}/api/snap/${encoded}`;
  }
  const proto = req.headers.get('x-forwarded-proto') ?? 'https';
  const host = req.headers.get('x-forwarded-host') ?? req.headers.get('host') ?? 'zlank.online';
  return `${proto}://${host}/api/snap/${encoded}`;
}

async function handleSnap(req: NextRequest, encoded: string) {
  const doc = decodeSnap(encoded);
  if (!doc) {
    return NextResponse.json({ error: 'Invalid Snap config' }, { status: 400 });
  }
  const baseUrl = getBaseUrl(req, encoded);
  const snap = docToSnap(doc, baseUrl);
  return NextResponse.json(snap, {
    headers: {
      'cache-control': 'public, max-age=60, s-maxage=300',
    },
  });
}

export async function GET(
  req: NextRequest,
  ctx: { params: Promise<{ encoded: string }> },
) {
  const { encoded } = await ctx.params;
  return handleSnap(req, encoded);
}

export async function POST(
  req: NextRequest,
  ctx: { params: Promise<{ encoded: string }> },
) {
  const { encoded } = await ctx.params;
  return handleSnap(req, encoded);
}
