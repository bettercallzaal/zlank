import Link from 'next/link';

export default function Home() {
  return (
    <main className="max-w-2xl mx-auto px-6 py-16">
      <div className="flex items-center gap-3 mb-4">
        <h1 className="text-5xl font-bold text-[#f5a623]">Zlank</h1>
        <span className="text-xs px-2 py-0.5 bg-green-500/20 text-green-400 border border-green-500/40 rounded-full font-bold">
          live
        </span>
      </div>
      <p className="text-xl text-[#8aa0bd] mb-2">
        No-code builder for Farcaster Snaps. Stack blocks. Hit Deploy. Share to feed.
      </p>
      <p className="text-sm text-[#8aa0bd] mb-8 italic">
        This page is itself a Snap. Cast{' '}
        <code className="text-[#f5a623] not-italic">zlank.vercel.app</code>{' '}
        in Farcaster - it renders inline.
      </p>

      <div className="flex flex-wrap gap-3">
        <Link
          href="/builder"
          className="inline-block bg-[#f5a623] text-[#0a1628] font-bold px-6 py-3 rounded-lg hover:bg-[#ffc14d] transition"
        >
          Build a Snap
        </Link>
        <Link
          href="/templates"
          className="inline-block border border-[#f5a623] text-[#f5a623] font-bold px-6 py-3 rounded-lg hover:bg-[#f5a623] hover:text-[#0a1628] transition"
        >
          Browse Templates
        </Link>
        <Link
          href="/dashboard"
          className="inline-block border border-[#1f3252] text-[#8aa0bd] font-bold px-6 py-3 rounded-lg hover:border-[#f5a623] hover:text-[#f5a623] transition"
        >
          My Snaps
        </Link>
      </div>

      <section className="mt-16 grid gap-4">
        <h2 className="text-2xl font-bold">14 block types</h2>
        <p className="text-[#8aa0bd]">
          header, text, link, share, image, music, artist, poll, bar chart, toggle, slider, switch, progress, divider. Plus navigate (multi-page Snaps), confetti effects, theme accents.
        </p>
      </section>

      <section className="mt-12 grid gap-4">
        <h2 className="text-2xl font-bold">8 starter templates</h2>
        <p className="text-[#8aa0bd]">
          Fan Vote, Music Drop, Fundraiser, Event RSVP, Top of Week, Two Truths and a Lie, Member Welcome, Quick Poll. Fork in one click, edit, deploy.
        </p>
      </section>

      <section className="mt-12">
        <h2 className="text-2xl font-bold mb-4">How it works</h2>
        <ol className="space-y-2 text-[#8aa0bd] list-decimal list-inside">
          <li>Open the builder, pick blocks (slider / poll / music / chart)</li>
          <li>Edit fields inline, watch the live preview</li>
          <li>Hit Deploy - your Snap is live at a short URL</li>
          <li>Share to feed - cast renders as inline UI in Snap-aware clients</li>
          <li>Same URL also serves a Mini App embed for older clients</li>
        </ol>
      </section>

      <section className="mt-12 p-4 bg-[#122440] border border-[#1f3252] rounded-lg">
        <p className="text-sm text-[#8aa0bd]">
          Built for{' '}
          <a href="https://farhack.xyz/hackathons/farhack-online-2026" className="text-[#f5a623] hover:underline">
            FarHack Online 2026
          </a>{' '}
          - Snaps track. Open source MIT. Any FID, free, no auth.
        </p>
      </section>

      <footer className="mt-16 text-sm text-[#8aa0bd] border-t border-[#1f3252] pt-6">
        Built by{' '}
        <a href="https://farcaster.xyz/zaal" className="text-[#f5a623] hover:underline">
          @zaal
        </a>
        . Source on{' '}
        <a
          href="https://github.com/bettercallzaal/zlank"
          className="text-[#f5a623] hover:underline"
        >
          GitHub
        </a>
        .
      </footer>
    </main>
  );
}
