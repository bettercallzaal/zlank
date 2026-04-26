import type { Metadata } from 'next';
import './globals.css';

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
