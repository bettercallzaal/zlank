import { NextRequest, NextResponse } from 'next/server';
import { decodeSnap } from '@/lib/encode';
import { resolveSnap } from '@/lib/resolve-snap';
import { docToEmbedHtml } from '@/lib/embed-spec';

export const runtime = 'nodejs';

// GET /api/snap/{encoded}/embed
// Returns a self-contained, iframe-safe HTML document so a Snap can render as
// an ad unit on any publisher webpage. Accepts either a base64url-encoded
// SnapDoc or a short id (resolveSnap handles both). frame-ancestors * lets any
// publisher embed it; publishers control their own page CSP.

export async function GET(
  req: NextRequest,
  ctx: { params: Promise<{ encoded: string }> },
) {
  const { encoded } = await ctx.params;
  const requestedPage = new URL(req.url).searchParams.get('page') ?? undefined;

  // Prefer resolveSnap (handles short ids + encoded payloads); fall back to a
  // direct decode so a bare encoded string still works if KV is unavailable.
  const doc = (await resolveSnap(encoded)) ?? decodeSnap(encoded);
  if (!doc) {
    return new NextResponse('invalid or expired snap', {
      status: 400,
      headers: { 'content-type': 'text/plain; charset=utf-8' },
    });
  }

  const html = await docToEmbedHtml(doc, { pageId: requestedPage });

  return new NextResponse(html, {
    status: 200,
    headers: {
      'content-type': 'text/html; charset=utf-8',
      'content-security-policy':
        "frame-ancestors *; default-src 'self'; img-src https: data:; style-src 'unsafe-inline'; script-src 'none'",
      'cache-control': 'public, max-age=30, s-maxage=30',
      'access-control-allow-origin': '*',
    },
  });
}
