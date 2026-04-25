import { ImageResponse } from 'next/og';
import { NextRequest } from 'next/server';
import { decodeSnap } from '@/lib/encode';
import type { SnapDoc } from '@/lib/blocks';

// Edge runtime required by next/og's ImageResponse + satori.
// For short IDs (KV-stored), fetch the Snap JSON from our same-origin
// /api/snap/[id] endpoint which DOES use Redis (nodejs runtime). Edge runtime
// can't import node-redis directly, so this internal fetch is the bridge.

export const runtime = 'edge';

const ACCENT_HEX: Record<SnapDoc['theme'], string> = {
  purple: '#a855f7',
  amber: '#f5a623',
  blue: '#3b82f6',
  green: '#22c55e',
  red: '#ef4444',
  pink: '#ec4899',
  teal: '#14b8a6',
  gray: '#94a3b8',
};

const CORS_HEADERS = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'GET, OPTIONS',
};

interface SnapJsonShape {
  theme?: { accent?: SnapDoc['theme'] };
  ui?: { elements?: Record<string, unknown> };
}

function isShortId(s: string): boolean {
  return s.length <= 20 && /^[A-Za-z0-9_-]+$/.test(s);
}

async function loadDoc(req: NextRequest, encoded: string): Promise<SnapDoc | null> {
  // Try base64 decode first (no network).
  const direct = decodeSnap(encoded);
  if (direct) return direct;

  // Short ID - fetch from our own snap endpoint.
  if (!isShortId(encoded)) return null;
  try {
    const url = new URL(req.url);
    const snapUrl = `${url.protocol}//${url.host}/api/snap/${encoded}`;
    const r = await fetch(snapUrl, {
      headers: { Accept: 'application/vnd.farcaster.snap+json' },
    });
    if (!r.ok) return null;
    const snap = (await r.json()) as SnapJsonShape;
    // Reconstruct a minimal SnapDoc from the rendered Snap UI for OG purposes.
    const elements = snap.ui?.elements ?? {};
    let title = 'Snap';
    let theme: SnapDoc['theme'] = snap.theme?.accent ?? 'purple';
    let blockCount = 0;
    for (const el of Object.values(elements)) {
      const e = el as { type?: string; props?: { title?: string }; children?: string[] };
      if (e.type === 'item' && e.props?.title && title === 'Snap') {
        title = e.props.title;
      }
      if (e.type !== 'stack') blockCount++;
    }
    return {
      version: 1,
      title,
      theme,
      blocks: Array(blockCount).fill({ type: 'text', content: '' }) as SnapDoc['blocks'],
    };
  } catch {
    return null;
  }
}

export async function GET(
  req: NextRequest,
  ctx: { params: Promise<{ encoded: string }> },
) {
  const { encoded } = await ctx.params;
  const doc = await loadDoc(req, encoded);
  const title = doc?.title ?? 'Snap not found';
  const accent = doc ? ACCENT_HEX[doc.theme] : ACCENT_HEX.gray;
  const blockCount = doc?.blocks.length ?? 0;

  return new ImageResponse(
    (
      <div
        style={{
          background: '#0a1628',
          width: '100%',
          height: '100%',
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'space-between',
          padding: '60px 80px',
          fontFamily: 'system-ui, sans-serif',
        }}
      >
        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          <div
            style={{
              fontSize: '32px',
              color: accent,
              fontWeight: 700,
              letterSpacing: '-0.5px',
            }}
          >
            ZLANK
          </div>
          <div
            style={{
              fontSize: '64px',
              color: '#e8eef7',
              fontWeight: 700,
              lineHeight: 1.15,
              maxWidth: '900px',
            }}
          >
            {title}
          </div>
        </div>

        <div
          style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'flex-end',
            color: '#8aa0bd',
            fontSize: '24px',
          }}
        >
          <div>{blockCount} blocks - Farcaster Snap</div>
          <div style={{ color: accent }}>zlank.online</div>
        </div>
      </div>
    ),
    {
      width: 1200,
      height: 800,
      headers: CORS_HEADERS,
    },
  );
}

export async function OPTIONS() {
  return new Response(null, {
    status: 204,
    headers: CORS_HEADERS,
  });
}
