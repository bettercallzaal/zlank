import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: 'Zlank - Build Farcaster Snaps',
  description: 'No-code builder for Farcaster Snaps. Make + share interactive Snaps in feed.',
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
