import { NextRequest, NextResponse } from 'next/server';
import { parseRequest } from '@farcaster/snap/server';
import { resolveSnap } from '@/lib/resolve-snap';
import { docToSnap } from '@/lib/snap-spec';
import { recordVote } from '@/lib/kv';
import type { SnapDoc, Block, ChartBar } from '@/lib/blocks';

export const runtime = 'nodejs';

// Content negotiation: Snap-aware Farcaster clients request this URL with
// Accept: application/vnd.farcaster.snap+json -> we return Snap JSON inline.
// Other clients (browsers, older FC) get HTML with fc:miniapp meta tag for
// Mini App embed fallback (image + Open button -> webview viewer).

const SNAP_MEDIA_TYPE = 'application/vnd.farcaster.snap+json';

const FALLBACK_DOC: SnapDoc = {
  version: 1,
  title: 'Snap not found',
  theme: 'gray',
  pages: [
    {
      id: 'home',
      blocks: [
        { type: 'header', title: 'Snap not found', subtitle: 'Invalid or expired link' },
        { type: 'text', content: 'Build your own at zlank.online' },
        { type: 'link', label: 'Open Zlank', url: 'https://zlank.online' },
      ],
    },
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

const CORS_HEADERS = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type, Accept',
  'Access-Control-Expose-Headers': 'Link, Vary, Content-Type',
};

function snapJsonResponse(doc: SnapDoc, origin: string, encoded: string, pageId?: string): NextResponse {
  const snap = docToSnap(doc, `${origin}/api/snap/${encoded}`, pageId);
  const linkHeader =
    `</api/snap/${encoded}>; rel="alternate"; type="${SNAP_MEDIA_TYPE}", ` +
    `</api/snap/${encoded}>; rel="alternate"; type="text/html"`;
  return new NextResponse(JSON.stringify(snap), {
    status: 200,
    headers: {
      'Content-Type': `${SNAP_MEDIA_TYPE}; charset=utf-8`,
      Vary: 'Accept',
      Link: linkHeader,
      'cache-control': 'public, max-age=60, s-maxage=300',
      ...CORS_HEADERS,
    },
  });
}

function htmlResponse(doc: SnapDoc, origin: string, encoded: string): NextResponse {
  const viewerUrl = `${origin}/s/${encoded}`;
  const titleSlug = encodeURIComponent(doc.title.slice(0, 40) || 'Zlank Snap');
  const imageUrl = `https://placehold.co/1200x800/0a1628/f5a623/png?text=${titleSlug}&font=Roboto`;
  const snapUrl = `${origin}/api/snap/${encoded}`;

  // CRITICAL: NO fc:miniapp or fc:frame meta tags. Their presence forces
  // Farcaster client to render as Mini App embed (image+button) instead of
  // inline Snap. The Link header alternate is the canonical Snap discovery
  // mechanism (matches duodo-snap working pattern).
  const linkHeader =
    `<${snapUrl}>; rel="alternate"; type="${SNAP_MEDIA_TYPE}", ` +
    `<${snapUrl}>; rel="alternate"; type="text/html"`;

  const html = `<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8" />
<meta name="viewport" content="width=device-width, initial-scale=1" />
<title>${escapeHtml(doc.title)}</title>
<meta name="description" content="A Farcaster Snap built with Zlank" />
<meta property="og:title" content="${escapeHtml(doc.title)}" />
<meta property="og:description" content="A Farcaster Snap built with Zlank" />
<meta property="og:url" content="${snapUrl}" />
<meta property="og:type" content="website" />
<meta property="og:locale" content="en_US" />
<meta property="og:image" content="${imageUrl}" />
<meta property="og:image:alt" content="${escapeHtml(doc.title)}" />
<meta name="twitter:card" content="summary_large_image" />
<meta name="twitter:title" content="${escapeHtml(doc.title)}" />
<meta name="twitter:description" content="A Farcaster Snap built with Zlank" />
<meta name="twitter:image" content="${imageUrl}" />
<link rel="alternate" type="${SNAP_MEDIA_TYPE}" href="${snapUrl}" />
</head>
<body style="background:#0a1628;color:#e8eef7;font-family:-apple-system,sans-serif;padding:40px;text-align:center;">
<h1 style="color:#f5a623;">${escapeHtml(doc.title)}</h1>
<p>This is a Farcaster Snap. <a href="${viewerUrl}" style="color:#f5a623;">Open in browser</a> or share in a Farcaster cast to render inline.</p>
<p><a href="${origin}" style="color:#8aa0bd;">Build your own at Zlank</a></p>
</body>
</html>`;

  return new NextResponse(html, {
    status: 200,
    headers: {
      'Content-Type': 'text/html; charset=utf-8',
      Vary: 'Accept',
      Link: linkHeader,
      'cache-control': 'public, max-age=60, s-maxage=300',
      ...CORS_HEADERS,
    },
  });
}

export async function OPTIONS() {
  return new NextResponse(null, {
    status: 204,
    headers: CORS_HEADERS,
  });
}

export async function GET(
  req: NextRequest,
  ctx: { params: Promise<{ encoded: string }> },
) {
  const encoded = await getEncoded(ctx);
  const doc = (await resolveSnap(encoded)) ?? FALLBACK_DOC;
  const origin = getOrigin(req);
  const pageId = new URL(req.url).searchParams.get('page') ?? undefined;

  // Content negotiation: Snap-aware clients ask for the snap media type.
  const accept = req.headers.get('accept') ?? '';
  if (accept.includes(SNAP_MEDIA_TYPE) || accept.includes('vnd.farcaster.snap')) {
    return snapJsonResponse(doc, origin, encoded, pageId);
  }

  return htmlResponse(doc, origin, encoded);
}

export async function POST(
  req: NextRequest,
  ctx: { params: Promise<{ encoded: string }> },
) {
  const encoded = await getEncoded(ctx);
  const doc = (await resolveSnap(encoded)) ?? FALLBACK_DOC;
  const origin = getOrigin(req);
  const pageId = new URL(req.url).searchParams.get('page') ?? undefined;

  // Parse the JFS POST body to extract user inputs (poll vote, slider value,
  // switch state, toggle selection). On any vote_X input, record + return a
  // results Snap with bar chart of tallies + confetti.
  let inputs: Record<string, unknown> = {};
  try {
    const parsed = await parseRequest(req.clone(), { skipJFSVerification: true });
    if (parsed.success && parsed.action.type === 'post') {
      inputs = parsed.action.inputs ?? {};
    }
  } catch {
    // ignore - return same Snap if body parse fails
  }

  const voteEntry = Object.entries(inputs).find(([k]) => k.startsWith('vote_'));
  if (voteEntry) {
    const [voteKey, voteValue] = voteEntry;
    const blockIdx = Number(voteKey.replace('vote_', ''));
    const optionRaw = String(voteValue ?? '').trim();
    if (optionRaw) {
      const tallies = await recordVote(encoded, blockIdx, optionRaw);
      return snapJsonResponse(buildResultsDoc(doc, blockIdx, tallies, optionRaw), origin, encoded, pageId);
    }
  }

  // Other inputs (slider, switch, toggle) - acknowledge with thank-you Snap
  if (Object.keys(inputs).length > 0) {
    return snapJsonResponse(buildAckDoc(doc, inputs), origin, encoded, pageId);
  }

  return snapJsonResponse(doc, origin, encoded, pageId);
}

function buildResultsDoc(
  doc: SnapDoc,
  blockIdx: number,
  tallies: Record<string, number>,
  votedFor: string,
): SnapDoc {
  const bars: ChartBar[] = Object.entries(tallies)
    .sort(([, a], [, b]) => b - a)
    .map(([label, value]) => ({ label, value }));
  const total = bars.reduce((s, b) => s + b.value, 0);
  const newBlocks: Block[] = [
    { type: 'header', title: 'Vote recorded', subtitle: `You picked: ${votedFor}` },
    { type: 'chart', title: `Live results (${total} votes)`, bars },
    { type: 'divider' },
    { type: 'text', content: 'Tap the original cast to vote again or share.' },
  ];
  return {
    ...doc,
    pages: [{ id: 'results', blocks: newBlocks }],
    confetti: true,
  };
}

function buildAckDoc(doc: SnapDoc, inputs: Record<string, unknown>): SnapDoc {
  const summary = Object.entries(inputs)
    .map(([k, v]) => `${k.replace(/_\d+$/, '')} = ${String(v)}`)
    .join('\n');
  const newBlocks: Block[] = [
    { type: 'header', title: 'Got it', subtitle: 'Your input was received' },
    { type: 'text', content: summary || 'Input recorded' },
  ];
  return {
    ...doc,
    pages: [{ id: 'ack', blocks: newBlocks }],
    confetti: true,
  };
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
