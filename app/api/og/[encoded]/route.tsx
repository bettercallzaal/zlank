import { ImageResponse } from 'next/og';
import { NextRequest } from 'next/server';
import { decodeSnap } from '@/lib/encode';

export const runtime = 'edge';

export async function GET(
  req: NextRequest,
  ctx: { params: Promise<{ encoded: string }> },
) {
  const { encoded } = await ctx.params;

  // Try base64 decode (no network). For short IDs (KV-stored), fetch the
  // snap JSON from our same-origin nodejs endpoint that DOES use Redis.
  let title = 'Snap';
  let accent = '#f5a623';
  let blockCount = 0;

  try {
    const direct = decodeSnap(encoded);
    if (direct) {
      title = direct.title;
      // Get block count from first page (or requested page if ?page= is present)
      const pageParam = new URL(req.url).searchParams.get('page');
      const pageToShow = pageParam ? direct.pages.find((p) => p.id === pageParam) : direct.pages[0];
      blockCount = pageToShow?.blocks.length ?? 0;
      accent = themeHex(direct.theme);
    } else if (encoded.length <= 20 && /^[A-Za-z0-9_-]+$/.test(encoded)) {
      const url = new URL(req.url);
      const pageParam = url.searchParams.get('page');
      const snapUrl = `${url.protocol}//${url.host}/api/snap/${encoded}${pageParam ? `?page=${encodeURIComponent(pageParam)}` : ''}`;
      const r = await fetch(snapUrl, {
        headers: { Accept: 'application/vnd.farcaster.snap+json' },
      });
      if (r.ok) {
        const snap = (await r.json()) as {
          theme?: { accent?: string };
          ui?: { elements?: Record<string, { type?: string; props?: { title?: string } }> };
        };
        const elements = snap.ui?.elements ?? {};
        for (const el of Object.values(elements)) {
          if (el.type === 'item' && el.props?.title && title === 'Snap') {
            title = el.props.title;
          }
          if (el.type !== 'stack') blockCount++;
        }
        if (snap.theme?.accent) accent = themeHex(snap.theme.accent);
      }
    }
  } catch {
    // fall through to defaults
  }

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
          <div style={{ fontSize: 32, color: accent, fontWeight: 700 }}>ZLANK</div>
          <div
            style={{
              fontSize: 64,
              color: '#e8eef7',
              fontWeight: 700,
              lineHeight: 1.15,
              maxWidth: 900,
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
            fontSize: 24,
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
}

function themeHex(theme: string): string {
  const map: Record<string, string> = {
    purple: '#a855f7',
    amber: '#f5a623',
    blue: '#3b82f6',
    green: '#22c55e',
    red: '#ef4444',
    pink: '#ec4899',
    teal: '#14b8a6',
    gray: '#94a3b8',
  };
  return map[theme] ?? '#f5a623';
}
