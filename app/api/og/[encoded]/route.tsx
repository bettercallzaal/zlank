import { ImageResponse } from 'next/og';
import { NextRequest } from 'next/server';
import { resolveSnap } from '@/lib/resolve-snap';
import type { SnapDoc } from '@/lib/blocks';

// nodejs runtime - resolveSnap imports node-redis which is not edge-compatible.
export const runtime = 'nodejs';

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

export async function GET(
  _req: NextRequest,
  ctx: { params: Promise<{ encoded: string }> },
) {
  const { encoded } = await ctx.params;
  const doc = await resolveSnap(encoded);
  const title = doc?.title ?? 'Snap not found';
  const accent = doc ? ACCENT_HEX[doc.theme] : ACCENT_HEX.gray;
  const blockCount = doc?.blocks.length ?? 0;

  const image = new ImageResponse(
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
    },
  );

  // Re-emit with CORS headers + better cache
  const buffer = await image.arrayBuffer();
  return new Response(buffer, {
    status: 200,
    headers: {
      'Content-Type': 'image/png',
      'cache-control': 'public, max-age=300, s-maxage=600',
      ...CORS_HEADERS,
    },
  });
}

export async function OPTIONS() {
  return new Response(null, {
    status: 204,
    headers: CORS_HEADERS,
  });
}
