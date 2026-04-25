import Link from 'next/link';
import { decodeSnap } from '@/lib/encode';
import type { Block, SnapDoc } from '@/lib/blocks';
import type { Metadata } from 'next';

interface PageProps {
  params: Promise<{ encoded: string }>;
}

const FALLBACK: SnapDoc = {
  version: 1,
  title: 'Snap not found',
  theme: 'gray',
  blocks: [
    { type: 'header', title: 'Snap not found', subtitle: 'Invalid or expired link' },
    { type: 'text', content: 'Build your own at zlank.online' },
    { type: 'link', label: 'Open Zlank', url: 'https://zlank.online' },
  ],
};

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { encoded } = await params;
  const doc = decodeSnap(encoded) ?? FALLBACK;
  return {
    title: `${doc.title} - Zlank`,
    description: 'A Farcaster Snap built with Zlank',
  };
}

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

export default async function SnapViewer({ params }: PageProps) {
  const { encoded } = await params;
  const doc = decodeSnap(encoded) ?? FALLBACK;
  const accent = ACCENT_HEX[doc.theme];

  return (
    <main className="max-w-md mx-auto px-4 py-8 min-h-screen flex flex-col">
      <div className="space-y-3 flex-1">
        {doc.blocks.map((block, i) => (
          <BlockView key={i} block={block} accent={accent} />
        ))}
      </div>
      <footer className="mt-8 pt-4 border-t border-[#1f3252] text-xs text-[#8aa0bd] text-center">
        Built with{' '}
        <Link href="/" className="text-[#f5a623] hover:underline">
          Zlank
        </Link>
      </footer>
    </main>
  );
}

function BlockView({ block, accent }: { block: Block; accent: string }) {
  switch (block.type) {
    case 'header':
      return (
        <div className="border-l-4 pl-3 py-1" style={{ borderColor: accent }}>
          <div className="text-xl font-bold">{block.title}</div>
          {block.subtitle && (
            <div className="text-sm text-[#8aa0bd] mt-1">{block.subtitle}</div>
          )}
        </div>
      );
    case 'text':
      return <p className="text-base whitespace-pre-wrap leading-relaxed">{block.content}</p>;
    case 'link':
      return (
        <a
          href={block.url}
          target="_blank"
          rel="noopener noreferrer"
          className="block bg-[#122440] border rounded-lg px-4 py-3 text-center font-bold hover:bg-[#1a2f4f] transition"
          style={{ color: accent, borderColor: accent }}
        >
          {block.label}
        </a>
      );
    case 'share': {
      const params = new URLSearchParams();
      params.set('text', block.text);
      const composeUrl = `https://farcaster.xyz/~/compose?${params.toString()}`;
      return (
        <a
          href={composeUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="block bg-[#122440] border border-[#1f3252] rounded-lg px-4 py-3 text-center font-medium text-[#e8eef7] hover:border-[#f5a623] transition"
        >
          {block.label}
        </a>
      );
    }
    case 'image': {
      const aspectClass =
        block.aspect === '1:1'
          ? 'aspect-square'
          : block.aspect === '16:9'
            ? 'aspect-video'
            : block.aspect === '4:3'
              ? 'aspect-[4/3]'
              : 'aspect-[9/16]';
      return (
        // eslint-disable-next-line @next/next/no-img-element
        <img
          src={block.url}
          alt={block.alt}
          className={`w-full ${aspectClass} object-cover rounded-lg border border-[#1f3252]`}
        />
      );
    }
    case 'divider':
      return <hr className="border-[#1f3252] my-2" />;
    case 'music':
      return (
        <a
          href={block.url}
          target="_blank"
          rel="noopener noreferrer"
          className="flex items-center justify-center gap-2 bg-[#122440] border rounded-lg px-4 py-3 font-bold hover:bg-[#1a2f4f] transition"
          style={{ color: accent, borderColor: accent }}
        >
          <span>[MUSIC]</span>
          <span>{block.label || 'Listen'}</span>
        </a>
      );
    case 'artist':
      return (
        <a
          href={`https://farcaster.xyz/~/profiles/${block.fid}`}
          target="_blank"
          rel="noopener noreferrer"
          className="block bg-[#122440] border border-[#1f3252] rounded-lg px-4 py-3 hover:border-[#f5a623] transition"
        >
          <div className="font-bold" style={{ color: accent }}>
            {block.displayName}
          </div>
          <div className="text-xs text-[#8aa0bd] mt-1">
            FID {block.fid} - {block.label || 'View profile'}
          </div>
        </a>
      );
    case 'poll':
      return (
        <div className="bg-[#122440] border border-[#1f3252] rounded-lg px-4 py-3 space-y-3">
          <div className="font-bold">{block.question}</div>
          <div className="space-y-2">
            {block.options.map((opt, i) => (
              <button
                key={i}
                className="w-full text-left bg-[#0a1628] border border-[#1f3252] rounded px-3 py-2 text-sm hover:border-[#f5a623] transition"
              >
                {i + 1}. {opt}
              </button>
            ))}
          </div>
          <p className="text-xs text-[#8aa0bd]">Vote tallying ships in v0.5 with DB.</p>
        </div>
      );
  }
}
