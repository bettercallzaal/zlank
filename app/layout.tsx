import type { Metadata } from 'next';
import './globals.css';

const FC_MINIAPP_EMBED = JSON.stringify({
  version: '1',
  imageUrl: 'https://zlank.online/icon.png',
  button: {
    title: 'Build a Snap',
    action: {
      type: 'launch_miniapp',
      name: 'Zlank',
      url: 'https://zlank.online/builder',
      splashImageUrl: 'https://zlank.online/icon.png',
      splashBackgroundColor: '#0a1628',
    },
  },
});

export const metadata: Metadata = {
  title: 'Zlank - Build Farcaster Snaps',
  description: 'No-code builder for Farcaster Snaps. Make + share interactive Snaps in feed.',
  icons: {
    icon: '/icon.png',
    apple: '/apple-touch-icon.png',
  },
  openGraph: {
    title: 'Zlank',
    description: 'No-code builder for Farcaster Snaps. Stack blocks. Hit Deploy. Share to feed.',
    images: [{ url: 'https://zlank.online/icon.png', width: 1024, height: 1024, alt: 'Zlank' }],
    type: 'website',
    url: 'https://zlank.online',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Zlank',
    description: 'No-code builder for Farcaster Snaps',
    images: ['https://zlank.online/icon.png'],
  },
  other: {
    'fc:miniapp': FC_MINIAPP_EMBED,
    'fc:frame': FC_MINIAPP_EMBED,
  },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className="h-full antialiased">
      <body className="min-h-full bg-[#0a1628] text-[#e8eef7] flex flex-col">
        {children}
      </body>
    </html>
  );
}
