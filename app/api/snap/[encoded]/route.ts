import { NextRequest, NextResponse } from 'next/server';
import { decodeSnap } from '@/lib/encode';
import { docToSnap } from '@/lib/snap-spec';
import type { SnapDoc } from '@/lib/blocks';

export const runtime = 'nodejs';

const FALLBACK_DOC: SnapDoc = {
  version: 1,
  title: 'Snap not found',
  theme: 'gray',
  blocks: [
    { type: 'header', title: 'Snap not found', subtitle: 'Invalid or expired link' },
    { type: 'text', content: 'Build your own at zlank.online' },
    { type: 'link', label: 'Open Zlank', url: 'https://zlank.online' },
  ],
};

function getOrigin(req: NextRequest): string {
  if (process.env.NEXT_PUBLIC_BASE_URL) return process.env.NEXT_PUBLIC_BASE_URL.replace(/\/$/, '');
  const proto = req.headers.get('x-forwarded-proto') ?? 'https';
  const host = req.headers.get('x-forwarded-host') ?? req.headers.get('host') ?? 'zlank.online';
  return `${proto}://${host}`;
}

async function getEncoded(ctx: { params: Promise<{ encoded: string }> }): Promise<string> {
  const { encoded } = await ctx.params;
  return encoded;
}

export async function GET(
  req: NextRequest,
  ctx: { params: Promise<{ encoded: string }> },
) {
  const encoded = await getEncoded(ctx);
  const doc = decodeSnap(encoded) ?? FALLBACK_DOC;
  const origin = getOrigin(req);

  // Farcaster clients (Warpcast / Farcaster.xyz / Base) detect the cast embed
  // via the fc:miniapp meta tag. The action.url points to /s/[encoded] which
  // is the visual viewer page that opens in the Mini App webview.
  const viewerUrl = `${origin}/s/${encoded}`;
  const imageUrl = `${origin}/api/og/${encoded}`;
  const splashUrl = `${origin}/splash.png`;

  const embed = {
    version: '1',
    imageUrl,
    button: {
      title: doc.title.slice(0, 32) || 'Open Snap',
      action: {
        type: 'launch_miniapp',
        name: 'Zlank',
        url: viewerUrl,
        splashImageUrl: splashUrl,
        splashBackgroundColor: '#0a1628',
      },
    },
  };

  const html = `<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8" />
<meta name="viewport" content="width=device-width, initial-scale=1" />
<title>${escapeHtml(doc.title)} - Zlank</title>
<meta name="description" content="A Farcaster Snap built with Zlank" />
<meta name="fc:miniapp" content='${JSON.stringify(embed)}' />
<meta name="fc:frame" content='${JSON.stringify(embed)}' />
<meta property="og:title" content="${escapeHtml(doc.title)}" />
<meta property="og:description" content="A Farcaster Snap built with Zlank" />
<meta property="og:image" content="${imageUrl}" />
<meta property="og:type" content="website" />
<meta name="twitter:card" content="summary_large_image" />
<meta name="twitter:image" content="${imageUrl}" />
</head>
<body style="background:#0a1628;color:#e8eef7;font-family:-apple-system,sans-serif;padding:40px;text-align:center;">
<h1 style="color:#f5a623;">${escapeHtml(doc.title)}</h1>
<p>This is a Farcaster Snap. <a href="${viewerUrl}" style="color:#f5a623;">Open in browser</a> or share in a Farcaster cast to render in feed.</p>
<p><a href="${origin}" style="color:#8aa0bd;">Build your own at Zlank</a></p>
</body>
</html>`;

  return new NextResponse(html, {
    status: 200,
    headers: {
      'Content-Type': 'text/html; charset=utf-8',
      'cache-control': 'public, max-age=60, s-maxage=300',
    },
  });
}

export async function POST(
  req: NextRequest,
  ctx: { params: Promise<{ encoded: string }> },
) {
  const encoded = await getEncoded(ctx);
  const doc = decodeSnap(encoded) ?? FALLBACK_DOC;
  const origin = getOrigin(req);
  const viewerUrl = `${origin}/api/snap/${encoded}`;
  const snap = docToSnap(doc, viewerUrl);
  return NextResponse.json(snap, {
    headers: {
      'Content-Type': 'application/json',
      'cache-control': 'public, max-age=60, s-maxage=300',
    },
  });
}

function escapeHtml(s: string): string {
  return s.replace(/[&<>"']/g, (c) => {
    if (c === '&') return '&amp;';
    if (c === '<') return '&lt;';
    if (c === '>') return '&gt;';
    if (c === '"') return '&quot;';
    return '&#39;';
  });
}
