import Link from 'next/link';
import { getChatLog, type ChatLogEntry } from '@/lib/kv';
import { resolveSnap } from '@/lib/resolve-snap';

export const runtime = 'nodejs';
export const revalidate = 0;

interface Props {
  params: Promise<{ id: string }>;
  searchParams: Promise<{ limit?: string }>;
}

function formatTime(ts: number): string {
  const d = new Date(ts);
  const date = d.toISOString().slice(0, 10);
  const time = d.toISOString().slice(11, 16);
  return `${date} ${time}`;
}

function relative(ts: number): string {
  const diff = Date.now() - ts;
  const m = Math.floor(diff / 60000);
  if (m < 1) return 'just now';
  if (m < 60) return `${m}m ago`;
  const h = Math.floor(m / 60);
  if (h < 24) return `${h}h ago`;
  const d = Math.floor(h / 24);
  return `${d}d ago`;
}

export default async function ChatLogPage({ params, searchParams }: Props) {
  const { id } = await params;
  const sp = await searchParams;
  const limit = Math.min(Math.max(Number(sp.limit) || 100, 1), 500);
  const [entries, doc] = await Promise.all([
    getChatLog(id, limit),
    resolveSnap(id),
  ]);
  const title = doc?.title ?? id;

  return (
    <main className="min-h-screen bg-[#0a1628] text-[#e8eef7] px-4 py-8">
      <div className="max-w-3xl mx-auto">
        <div className="mb-6">
          <Link href="/" className="text-[#8aa0bd] hover:text-[#f5a623] text-sm">
            &larr; Zlank
          </Link>
          <h1 className="text-2xl font-bold text-[#f5a623] mt-2">Chat log</h1>
          <p className="text-sm text-[#8aa0bd] mt-1">
            {title} <span className="text-[#1f3252]">|</span> snap{' '}
            <code className="text-[#f5a623]">{id}</code>
          </p>
          <p className="text-xs text-[#5e7290] mt-2">
            {entries.length} {entries.length === 1 ? 'entry' : 'entries'}
            {entries.length === limit && ` (showing latest ${limit})`}
            {' | '}
            <Link
              href={`/api/chat-log/${id}?limit=${limit}`}
              className="hover:text-[#f5a623] underline"
            >
              JSON
            </Link>
            {' | '}
            <Link
              href={`/api/snap/${id}`}
              className="hover:text-[#f5a623] underline"
            >
              Snap
            </Link>
          </p>
        </div>

        {entries.length === 0 ? (
          <EmptyState id={id} />
        ) : (
          <ul className="space-y-3">
            {entries.map((e, i) => (
              <ChatRow key={i} entry={e} />
            ))}
          </ul>
        )}
      </div>
    </main>
  );
}

function ChatRow({ entry }: { entry: ChatLogEntry }) {
  const fidLink = entry.fid
    ? `https://farcaster.xyz/~/profiles/${entry.fid}`
    : null;
  return (
    <li className="bg-[#122440] border border-[#1f3252] rounded-lg p-4">
      <div className="flex items-center justify-between gap-3 mb-2 text-xs text-[#8aa0bd]">
        <div>
          {fidLink ? (
            <a
              href={fidLink}
              target="_blank"
              rel="noreferrer"
              className="text-[#f5a623] hover:underline"
            >
              fid {entry.fid}
            </a>
          ) : (
            <span>anonymous</span>
          )}
          <span className="ml-2">{relative(entry.ts)}</span>
        </div>
        <time className="text-[#5e7290]" title={formatTime(entry.ts)}>
          {formatTime(entry.ts)}
        </time>
      </div>
      <p className="text-sm text-[#e8eef7] whitespace-pre-wrap">{entry.text}</p>
      {entry.reply && (
        <div className="mt-3 pt-3 border-t border-[#1f3252]">
          <p className="text-xs text-[#8aa0bd] mb-1">reply</p>
          <p className="text-sm text-[#c9d4e3] whitespace-pre-wrap">
            {entry.reply}
          </p>
        </div>
      )}
    </li>
  );
}

function EmptyState({ id }: { id: string }) {
  return (
    <div className="bg-[#122440] border border-[#1f3252] rounded-lg p-8 text-center">
      <p className="text-[#e8eef7] mb-2">No entries yet.</p>
      <p className="text-sm text-[#8aa0bd]">
        Cast{' '}
        <code className="text-[#f5a623]">
          https://zlank.online/api/snap/{id}
        </code>{' '}
        on Farcaster. Each chatbot submission lands here.
      </p>
    </div>
  );
}
