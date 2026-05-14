import { NextRequest, NextResponse } from 'next/server';
import { decodeSnap } from '@/lib/encode';
import { resolveSnap } from '@/lib/resolve-snap';
import { docToEmbedHtml } from '@/lib/embed-spec';
import { recordVote } from '@/lib/kv';
import { rateLimit, rateLimitResponse, ipOf } from '@/lib/rate-limit';

export const runtime = 'nodejs';

// GET  /api/snap/{encoded}/embed - iframe-safe HTML render of a Snap.
// POST /api/snap/{encoded}/embed - records an anonymous poll vote from the
//   embedded form and returns the updated HTML with the tally.
//
// frame-ancestors * lets any publisher embed it. The poll form is plain HTML,
// so this stays interactive on the open web with no JavaScript and no CSP
// relaxation - script-src stays 'none'.

const EMBED_HEADERS = {
  'content-type': 'text/html; charset=utf-8',
  'content-security-policy':
    "frame-ancestors *; default-src 'self'; img-src https: data:; style-src 'unsafe-inline'; script-src 'none'; form-action 'self'",
  'access-control-allow-origin': '*',
} as const;

export async function GET(
  req: NextRequest,
  ctx: { params: Promise<{ encoded: string }> },
) {
  const { encoded } = await ctx.params;
  const requestedPage = new URL(req.url).searchParams.get('page') ?? undefined;

  const doc = (await resolveSnap(encoded)) ?? decodeSnap(encoded);
  if (!doc) {
    return new NextResponse('invalid or expired snap', {
      status: 400,
      headers: { 'content-type': 'text/plain; charset=utf-8' },
    });
  }

  const html = await docToEmbedHtml(doc, { pageId: requestedPage, encoded });
  return new NextResponse(html, {
    status: 200,
    headers: { ...EMBED_HEADERS, 'cache-control': 'public, max-age=30, s-maxage=30' },
  });
}

export async function POST(
  req: NextRequest,
  ctx: { params: Promise<{ encoded: string }> },
) {
  const { encoded } = await ctx.params;
  const requestedPage = new URL(req.url).searchParams.get('page') ?? undefined;

  // Anonymous web votes always count - rate-limit by IP so the open endpoint
  // cannot be trivially flooded.
  const ip = ipOf(req);
  const rl = await rateLimit([{ key: `embed-vote:${ip}`, windowSec: 60, max: 20 }]);
  if (!rl.ok) return rateLimitResponse(rl);

  const doc = (await resolveSnap(encoded)) ?? decodeSnap(encoded);
  if (!doc) {
    return new NextResponse('invalid or expired snap', {
      status: 400,
      headers: { 'content-type': 'text/plain; charset=utf-8' },
    });
  }

  // Parse the poll form: a single vote_<idx> field naming the chosen option.
  const voteTallies = new Map<number, Record<string, number>>();
  try {
    const form = await req.formData();
    for (const [key, value] of form.entries()) {
      if (!key.startsWith('vote_')) continue;
      const blockIdx = Number(key.slice('vote_'.length));
      const option = String(value).trim();
      if (Number.isInteger(blockIdx) && blockIdx >= 0 && option) {
        const tallies = await recordVote(encoded, blockIdx, option);
        voteTallies.set(blockIdx, tallies);
      }
      break;
    }
  } catch {
    // Malformed form body - fall through and re-render without a tally.
  }

  const html = await docToEmbedHtml(doc, { pageId: requestedPage, encoded, voteTallies });
  return new NextResponse(html, {
    status: 200,
    headers: { ...EMBED_HEADERS, 'cache-control': 'no-store' },
  });
}
