import { NextRequest, NextResponse } from 'next/server';
import { buildPromoSnap, ZLANK_SNAP_MEDIA_TYPE } from '@/lib/promo-snap';

// Canonical Zlank promo Snap. Cast zlank.vercel.app and FC clients that fetch
// /api/snap/zlank get this self-demonstrating Snap.

export const runtime = 'nodejs';

const CORS_HEADERS = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type, Accept',
  'Access-Control-Expose-Headers': 'Link, Vary, Content-Type',
};

function getOrigin(req: NextRequest): string {
  if (process.env.NEXT_PUBLIC_BASE_URL) return process.env.NEXT_PUBLIC_BASE_URL.replace(/\/$/, '');
  const proto = req.headers.get('x-forwarded-proto') ?? 'https';
  const host = req.headers.get('x-forwarded-host') ?? req.headers.get('host') ?? 'zlank.vercel.app';
  return `${proto}://${host}`;
}

function snapResponse(req: NextRequest): NextResponse {
  const origin = getOrigin(req);
  const snap = buildPromoSnap(origin);
  return new NextResponse(JSON.stringify(snap), {
    status: 200,
    headers: {
      'Content-Type': `${ZLANK_SNAP_MEDIA_TYPE}; charset=utf-8`,
      Vary: 'Accept',
      Link: `</api/snap/zlank>; rel="alternate"; type="${ZLANK_SNAP_MEDIA_TYPE}", </>; rel="alternate"; type="text/html"`,
      'cache-control': 'public, max-age=300, s-maxage=600',
      ...CORS_HEADERS,
    },
  });
}

export function GET(req: NextRequest) {
  return snapResponse(req);
}

export function POST(req: NextRequest) {
  return snapResponse(req);
}

export function OPTIONS() {
  return new NextResponse(null, { status: 204, headers: CORS_HEADERS });
}
