'use client';

import Link from 'next/link';
import { useState } from 'react';
import type { SnapDoc } from '@/lib/blocks';

const MAX_LEN = 300;

// Every suggestion is tagged under this partner id so the whole set is
// queryable via the partner index: /partners/zlank-feedback and
// /api/snaps/search?partner=zlank-feedback. attribution:false keeps the
// "Powered by" badge off the rendered Snap.
const FEEDBACK_PARTNER = { id: 'zlank-feedback', name: 'zlank feedback', attribution: false };

function buildSuggestionDoc(text: string): SnapDoc {
  return {
    version: 2,
    title: 'Feature suggestion',
    theme: 'purple',
    partner: FEEDBACK_PARTNER,
    pages: [
      {
        id: 'home',
        blocks: [
          {
            type: 'header',
            title: 'Feature suggestion for Zlank',
            subtitle: 'Submitted via zlank.online/suggest',
            badgeText: 'IDEA',
            badgeColor: 'purple',
          },
          { type: 'text', content: text },
          {
            type: 'share',
            label: 'Share this idea',
            text: 'I suggested a feature for Zlank',
            icon: 'share',
          },
          {
            type: 'link',
            label: 'Suggest your own',
            url: 'https://zlank.online/suggest',
            icon: 'plus',
            variant: 'secondary',
          },
        ],
      },
    ],
  };
}

export default function SuggestPage() {
  const [text, setText] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [snapId, setSnapId] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const trimmed = text.trim();

  async function submit() {
    if (!trimmed || submitting) return;
    setSubmitting(true);
    setError(null);
    try {
      const res = await fetch('/api/snaps', {
        method: 'POST',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify({ doc: buildSuggestionDoc(trimmed) }),
      });
      const data = (await res.json()) as { id?: string; error?: string; issues?: string[] };
      if (!res.ok || !data.id) {
        throw new Error(data.issues?.join('; ') ?? data.error ?? `HTTP ${res.status}`);
      }
      setSnapId(data.id);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Could not submit. Try again.');
    } finally {
      setSubmitting(false);
    }
  }

  function reset() {
    setText('');
    setSnapId(null);
    setError(null);
  }

  return (
    <main className="min-h-screen bg-[#0a1628]">
      <div className="max-w-xl mx-auto px-6 py-12">
        <h1 className="text-4xl font-bold text-[#f5a623] mb-2">Suggest a feature</h1>
        <p className="text-[#b8c4d4] mb-8">
          Tell us what Zlank should do next. Your suggestion becomes a shareable Snap - cast it,
          and we can see every idea in one place.
        </p>

        {snapId ? (
          <div className="bg-[#122440] border border-[#1f3252] rounded-lg p-6">
            <p className="text-[#e8eef7] font-bold mb-1">Your suggestion is live as a Snap.</p>
            <p className="text-sm text-[#b8c4d4] mb-5">
              Share it to feed, or send the link to anyone.
            </p>
            <div className="flex flex-col sm:flex-row gap-3">
              <Link
                href={`/s/${snapId}`}
                className="flex-1 text-center bg-[#f5a623] text-[#0a1628] font-bold px-4 py-2 rounded hover:bg-[#ffc14d] transition"
              >
                View your Snap
              </Link>
              <button
                onClick={reset}
                className="flex-1 text-center border border-[#1f3252] text-[#e8eef7] font-medium px-4 py-2 rounded hover:border-[#f5a623] transition"
              >
                Suggest another
              </button>
            </div>
            <p className="text-xs text-[#64748b] mt-4 break-all">
              Snap URL: zlank.online/api/snap/{snapId}
            </p>
          </div>
        ) : (
          <div className="bg-[#122440] border border-[#1f3252] rounded-lg p-6">
            <label htmlFor="suggestion" className="block text-sm text-[#b8c4d4] mb-2">
              Your suggestion
            </label>
            <textarea
              id="suggestion"
              value={text}
              onChange={(e) => setText(e.target.value.slice(0, MAX_LEN))}
              placeholder="I wish Zlank could..."
              rows={5}
              className="w-full bg-[#0a1628] border border-[#1f3252] rounded px-3 py-2 text-sm text-[#e8eef7] resize-y focus:border-[#f5a623] focus:outline-none"
            />
            <div className="flex items-center justify-between mt-2 mb-4">
              <span className="text-xs text-[#64748b]">
                {text.length} / {MAX_LEN}
              </span>
              {error && <span className="text-xs text-red-400">{error}</span>}
            </div>
            <button
              onClick={submit}
              disabled={!trimmed || submitting}
              className="w-full bg-[#f5a623] text-[#0a1628] font-bold px-4 py-2 rounded hover:bg-[#ffc14d] transition disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {submitting ? 'Creating Snap...' : 'Submit suggestion'}
            </button>
          </div>
        )}
      </div>
    </main>
  );
}
