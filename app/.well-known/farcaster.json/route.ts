import { NextResponse } from 'next/server';

// Mini App manifest for Zlank. Account association left as placeholder
// until app wallet signs the domain. See README for sign instructions.

const BASE_URL = process.env.NEXT_PUBLIC_BASE_URL ?? 'https://zlank.online';

export function GET() {
  return NextResponse.json({
    accountAssociation: {
      header: process.env.FARCASTER_MANIFEST_HEADER ?? '',
      payload: process.env.FARCASTER_MANIFEST_PAYLOAD ?? '',
      signature: process.env.FARCASTER_MANIFEST_SIGNATURE ?? '',
    },
    miniapp: {
      version: '1',
      name: 'Zlank',
      homeUrl: BASE_URL,
      iconUrl: `${BASE_URL}/icon.png`,
      splashImageUrl: `${BASE_URL}/splash.png`,
      splashBackgroundColor: '#0a1628',
      description: 'No-code Farcaster Snap builder. Make and share interactive Snaps in feed.',
      primaryCategory: 'developer-tools',
      tags: ['snaps', 'builder', 'no-code', 'farcaster'],
    },
  });
}
