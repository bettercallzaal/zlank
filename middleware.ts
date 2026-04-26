import { NextRequest, NextResponse } from 'next/server';

const SNAP_MEDIA_TYPE = 'application/vnd.farcaster.snap+json';

// Make the homepage self-demonstrating: when a Snap-aware Farcaster client
// fetches zlank.vercel.app with Accept: application/vnd.farcaster.snap+json,
// rewrite to /api/snap/zlank which returns the Zlank promo Snap. Browsers
// (Accept: text/html) continue to the React landing page.

export function middleware(req: NextRequest) {
  if (req.nextUrl.pathname !== '/') return NextResponse.next();
  const accept = req.headers.get('accept') ?? '';
  if (accept.includes(SNAP_MEDIA_TYPE) || accept.includes('vnd.farcaster.snap')) {
    return NextResponse.rewrite(new URL('/api/snap/zlank', req.url));
  }
  // Browser path - inject Link header so Snap-aware crawlers can discover
  // the Snap alternate representation.
  const res = NextResponse.next();
  res.headers.set(
    'Link',
    `</api/snap/zlank>; rel="alternate"; type="${SNAP_MEDIA_TYPE}"`,
  );
  res.headers.set('Vary', 'Accept');
  return res;
}

export const config = {
  matcher: '/',
};
