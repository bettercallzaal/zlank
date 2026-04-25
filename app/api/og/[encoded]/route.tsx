import { ImageResponse } from 'next/og';
import { NextRequest } from 'next/server';
import { decodeSnap } from '@/lib/encode';
import type { SnapDoc } from '@/lib/blocks';

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

export async function GET(
  _req: NextRequest,
  ctx: { params: Promise<{ encoded: string }> },
) {
  const { encoded } = await ctx.params;
  const doc = decodeSnap(encoded);
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
    },
  );
}
