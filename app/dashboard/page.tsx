'use client';

import Link from 'next/link';
import { useEffect, useState } from 'react';
import { getMySnaps, removeMySnap, clearMySnaps, formatRelativeTime, getThemeColor, type MySnapEntry } from '@/lib/my-snaps';

export default function DashboardPage() {
  const [snaps, setSnaps] = useState<MySnapEntry[]>([]);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setSnaps(getMySnaps());
    setMounted(true);
  }, []);

  function handleDelete(id: string) {
    removeMySnap(id);
    setSnaps(getMySnaps());
  }

  function handleClearAll() {
    if (typeof window !== 'undefined' && window.confirm('Are you sure? This will clear all saved Snaps from your local storage (server copies remain).')) {
      clearMySnaps();
      setSnaps([]);
    }
  }

  if (!mounted) return null;

  return (
    <main className="min-h-screen bg-[#0a1628]">
      <header className="border-b border-[#1f3252] px-6 py-4">
        <div className="max-w-6xl mx-auto flex items-center justify-between">
          <Link href="/" className="text-[#f5a623] font-bold text-lg">
            Zlank
          </Link>
          <Link
            href="/builder"
            className="text-sm text-[#e8eef7] hover:text-[#f5a623] transition"
          >
            Back to builder
          </Link>
        </div>
      </header>

      <div className="max-w-6xl mx-auto px-6 py-12">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-4xl font-bold text-[#f5a623] mb-2">My Snaps</h1>
            <p className="text-[#8aa0bd]">{snaps.length} saved snap{snaps.length !== 1 ? 's' : ''}</p>
          </div>
          {snaps.length > 0 && (
            <button
              onClick={handleClearAll}
              className="text-sm text-[#8aa0bd] hover:text-red-400 border border-[#1f3252] px-3 py-2 rounded hover:border-red-400 transition"
            >
              Clear all
            </button>
          )}
        </div>

        {snaps.length === 0 ? (
          <div className="bg-[#122440] border border-[#1f3252] rounded-lg p-12 text-center">
            <p className="text-[#8aa0bd] mb-6">No saved Snaps yet. Build your first one!</p>
            <Link
              href="/builder"
              className="inline-block bg-[#f5a623] text-[#0a1628] font-bold px-6 py-3 rounded hover:bg-[#ffc14d] transition"
            >
              Start Building
            </Link>
          </div>
        ) : (
          <div className="grid gap-4">
            {snaps.map((snap) => (
              <SnapCard
                key={snap.id}
                snap={snap}
                onDelete={() => handleDelete(snap.id)}
              />
            ))}
          </div>
        )}
      </div>
    </main>
  );
}

interface SnapStats {
  views: number;
  interactions: number;
  lastViewAt: number | null;
}

function SnapCard({ snap, onDelete }: { snap: MySnapEntry; onDelete: () => void }) {
  const [stats, setStats] = useState<SnapStats | null>(null);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    let cancelled = false;
    fetch(`/api/snaps/${snap.id}/stats`)
      .then((r) => (r.ok ? r.json() : null))
      .then((s) => {
        if (cancelled || !s) return;
        setStats({ views: s.views ?? 0, interactions: s.interactions ?? 0, lastViewAt: s.lastViewAt ?? null });
      })
      .catch(() => {});
    return () => {
      cancelled = true;
    };
  }, [snap.id]);

  function copyShareUrl() {
    const url = `${window.location.origin}/api/snap/${snap.id}`;
    navigator.clipboard.writeText(url).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 1500);
    });
  }

  return (
    <div className="bg-[#122440] border border-[#1f3252] rounded-lg p-6 flex items-center justify-between hover:border-[#f5a623] transition">
      <div className="flex items-center gap-4 flex-1">
        <div
          className="w-4 h-4 rounded-full flex-shrink-0"
          style={{ backgroundColor: getThemeColor(snap.theme) }}
        />
        <div className="flex-1 min-w-0">
          <h3 className="text-lg font-bold text-[#e8eef7] truncate">{snap.title}</h3>
          <p className="text-sm text-[#8aa0bd]">
            {snap.blockCount} block{snap.blockCount !== 1 ? 's' : ''} - {formatRelativeTime(snap.updatedAt)}
            {stats && (
              <>
                {' '}- <span className="text-[#f5a623]">{stats.views.toLocaleString()}</span> view{stats.views !== 1 ? 's' : ''}
                {stats.interactions > 0 && (
                  <> - <span className="text-[#f5a623]">{stats.interactions.toLocaleString()}</span> interaction{stats.interactions !== 1 ? 's' : ''}</>
                )}
              </>
            )}
          </p>
        </div>
      </div>

      <div className="flex items-center gap-2 flex-shrink-0">
        <button
          onClick={copyShareUrl}
          className="px-3 py-2 text-sm bg-[#1f3252] text-[#e8eef7] rounded hover:bg-[#2a3f52] transition"
          title="Copy snap URL"
        >
          {copied ? 'Copied' : 'Copy'}
        </button>
        <a
          href={(() => {
            const url = typeof window !== 'undefined'
              ? `${window.location.origin}/api/snap/${snap.id}`
              : `https://zlank.online/api/snap/${snap.id}`;
            const params = new URLSearchParams();
            params.set('text', snap.title);
            params.append('embeds[]', url);
            return `https://farcaster.xyz/~/compose?${params.toString()}`;
          })()}
          target="_blank"
          rel="noopener noreferrer"
          className="px-3 py-2 text-sm bg-[#1f3252] text-[#f5a623] rounded hover:bg-[#2a3f52] transition"
          title="Open Farcaster composer"
        >
          Cast
        </a>
        <a
          href={`/api/snap/${snap.id}`}
          target="_blank"
          rel="noopener noreferrer"
          className="px-3 py-2 text-sm bg-[#1f3252] text-[#e8eef7] rounded hover:bg-[#2a3f52] transition"
        >
          View
        </a>
        <Link
          href={`/builder?id=${snap.id}`}
          className="px-3 py-2 text-sm bg-[#1f3252] text-[#e8eef7] rounded hover:bg-[#2a3f52] transition"
        >
          Edit
        </Link>
        <button
          onClick={onDelete}
          className="px-3 py-2 text-sm border border-[#1f3252] text-[#8aa0bd] rounded hover:border-red-400 hover:text-red-400 transition"
        >
          Delete
        </button>
      </div>
    </div>
  );
}
