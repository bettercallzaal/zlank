import Link from 'next/link';

export default function Home() {
  return (
    <main className="max-w-2xl mx-auto px-6 py-16">
      <h1 className="text-5xl font-bold text-[#f5a623] mb-4">Zlank</h1>
      <p className="text-xl text-[#8aa0bd] mb-8">
        No-code builder for Farcaster Snaps. Stack blocks. Hit Deploy. Share to feed.
      </p>

      <Link
        href="/builder"
        className="inline-block bg-[#f5a623] text-[#0a1628] font-bold px-8 py-4 rounded-lg hover:bg-[#ffc14d] transition"
      >
        Build a Snap
      </Link>

      <section className="mt-16 grid gap-4">
        <h2 className="text-2xl font-bold">Why Zlank</h2>
        <ul className="space-y-2 text-[#8aa0bd]">
          <li>- 9 block types (header, text, link, share, image, music, artist, poll, divider)</li>
          <li>- One-click deploy. Free hosted Snap URL.</li>
          <li>- Works as a Farcaster Mini App or standalone web</li>
          <li>- Open source. No whitelist. Any FID can build.</li>
        </ul>
      </section>

      <section className="mt-12">
        <h2 className="text-2xl font-bold mb-4">How it works</h2>
        <ol className="space-y-2 text-[#8aa0bd] list-decimal list-inside">
          <li>Open the builder, pick blocks (poll / music / artist / etc)</li>
          <li>Edit fields inline, see live preview</li>
          <li>Hit Deploy - your Snap goes live at a hosted URL</li>
          <li>Share to feed - drops the Snap as a cast embed in Farcaster</li>
        </ol>
      </section>

      <footer className="mt-16 text-sm text-[#8aa0bd] border-t border-[#1f3252] pt-6">
        Built by{' '}
        <a href="https://farcaster.xyz/zaal" className="text-[#f5a623] hover:underline">
          @zaal
        </a>{' '}
        for the ZAO ecosystem. Source on{' '}
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
