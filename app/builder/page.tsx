'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { sdk } from '@farcaster/miniapp-sdk';
import { DEFAULT_SNAP, clampBlock, type SnapDoc, type Block, type BlockType } from '@/lib/blocks';
import { encodeSnap } from '@/lib/encode';

const BLOCK_OPTIONS: { type: BlockType; label: string; icon: string }[] = [
  { type: 'header', label: 'Header', icon: 'H' },
  { type: 'text', label: 'Text', icon: 'T' },
  { type: 'link', label: 'Link button', icon: 'L' },
  { type: 'share', label: 'Share to feed', icon: 'S' },
  { type: 'image', label: 'Image', icon: 'I' },
  { type: 'music', label: 'Music', icon: 'M' },
  { type: 'artist', label: 'Artist', icon: 'A' },
  { type: 'poll', label: 'Poll', icon: 'P' },
  { type: 'divider', label: 'Divider', icon: '-' },
];

function newBlock(type: BlockType): Block {
  switch (type) {
    case 'header':
      return { type: 'header', title: 'New header', subtitle: '' };
    case 'text':
      return { type: 'text', content: 'New text block. Edit me.' };
    case 'link':
      return { type: 'link', label: 'Open link', url: 'https://farcaster.xyz' };
    case 'share':
      return { type: 'share', label: 'Share', text: 'Check out this Snap' };
    case 'image':
      return {
        type: 'image',
        url: 'https://placehold.co/600x600/0a1628/f5a623.png',
        alt: 'image',
        aspect: '1:1',
      };
    case 'divider':
      return { type: 'divider' };
    case 'music':
      return { type: 'music', url: 'https://open.spotify.com/track/', label: 'Listen' };
    case 'artist':
      return { type: 'artist', fid: 19640, displayName: 'New artist', label: 'View profile' };
    case 'poll':
      return { type: 'poll', question: 'What should we do next?', options: ['Option A', 'Option B'] };
  }
}

export default function Builder() {
  const [doc, setDoc] = useState<SnapDoc>(DEFAULT_SNAP);
  const [deployed, setDeployed] = useState<string | null>(null);
  const [isMiniApp, setIsMiniApp] = useState(false);

  useEffect(() => {
    (async () => {
      try {
        const inMiniApp = await sdk.isInMiniApp();
        setIsMiniApp(inMiniApp);
        if (inMiniApp) await sdk.actions.ready();
      } catch {
        // Browser context, no-op
      }
    })();
  }, []);

  function updateBlock(idx: number, patch: Partial<Block>) {
    setDoc((d) => {
      const next = [...d.blocks];
      next[idx] = clampBlock({ ...next[idx], ...patch } as Block);
      return { ...d, blocks: next };
    });
  }

  function removeBlock(idx: number) {
    setDoc((d) => ({ ...d, blocks: d.blocks.filter((_, i) => i !== idx) }));
  }

  function addBlock(type: BlockType) {
    setDoc((d) => ({ ...d, blocks: [...d.blocks, newBlock(type)] }));
  }

  function moveBlock(idx: number, dir: -1 | 1) {
    setDoc((d) => {
      const next = [...d.blocks];
      const target = idx + dir;
      if (target < 0 || target >= next.length) return d;
      [next[idx], next[target]] = [next[target], next[idx]];
      return { ...d, blocks: next };
    });
  }

  const [deploying, setDeploying] = useState(false);
  const [deployErr, setDeployErr] = useState<string | null>(null);

  async function deploy() {
    setDeploying(true);
    setDeployErr(null);
    try {
      const res = await fetch('/api/snaps', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ doc }),
      });
      if (!res.ok) {
        const data = (await res.json().catch(() => ({}))) as { error?: string };
        throw new Error(data.error ?? `HTTP ${res.status}`);
      }
      const data = (await res.json()) as { id: string; short: boolean };
      setDeployed(data.id);
    } catch (err: unknown) {
      // Fall back to URL-encode locally if API call fails
      try {
        const encoded = encodeSnap(doc);
        setDeployed(encoded);
        setDeployErr(err instanceof Error ? err.message : 'Saved locally only');
      } catch (fallbackErr: unknown) {
        setDeployErr(fallbackErr instanceof Error ? fallbackErr.message : 'Deploy failed');
      }
    } finally {
      setDeploying(false);
    }
  }

  async function shareToFeed() {
    if (!deployed) return;
    const url = `${window.location.origin}/api/snap/${deployed}`;
    if (isMiniApp) {
      try {
        await sdk.actions.composeCast({
          text: doc.title,
          embeds: [url],
        });
      } catch (err) {
        console.error('compose_cast failed', err);
      }
    } else {
      const composeUrl = `https://farcaster.xyz/~/compose?embeds[]=${encodeURIComponent(url)}`;
      window.open(composeUrl, '_blank');
    }
  }

  async function copyUrl() {
    if (!deployed) return;
    const url = `${window.location.origin}/api/snap/${deployed}`;
    await navigator.clipboard.writeText(url);
  }

  return (
    <main className="min-h-screen flex flex-col">
      <header className="border-b border-[#1f3252] px-4 py-3 flex items-center justify-between">
        <Link href="/" className="text-[#f5a623] font-bold text-lg">
          Zlank
        </Link>
        <div className="flex items-center gap-3">
          {!deployed ? (
            <button
              onClick={deploy}
              disabled={deploying}
              className="bg-[#f5a623] text-[#0a1628] font-bold px-5 py-2 rounded-md hover:bg-[#ffc14d] transition disabled:opacity-60"
            >
              {deploying ? 'Deploying...' : 'Deploy'}
            </button>
          ) : (
            <>
              <button
                onClick={copyUrl}
                className="border border-[#1f3252] text-[#e8eef7] font-medium px-4 py-2 rounded-md hover:bg-[#122440] transition text-sm"
              >
                Copy URL
              </button>
              <button
                onClick={shareToFeed}
                className="bg-[#f5a623] text-[#0a1628] font-bold px-5 py-2 rounded-md hover:bg-[#ffc14d] transition"
              >
                Share to feed
              </button>
            </>
          )}
        </div>
      </header>

      <div className="flex-1 grid md:grid-cols-2">
        <section className="border-r border-[#1f3252] p-4 space-y-3 overflow-y-auto">
          <div className="space-y-2">
            <label className="text-xs text-[#8aa0bd] uppercase tracking-wide">Snap title</label>
            <input
              value={doc.title}
              onChange={(e) => setDoc((d) => ({ ...d, title: e.target.value.slice(0, 60) }))}
              className="w-full bg-[#122440] border border-[#1f3252] rounded px-3 py-2 text-sm"
            />
          </div>

          <div className="space-y-2">
            <label className="text-xs text-[#8aa0bd] uppercase tracking-wide">Theme</label>
            <select
              value={doc.theme}
              onChange={(e) => setDoc((d) => ({ ...d, theme: e.target.value as SnapDoc['theme'] }))}
              className="w-full bg-[#122440] border border-[#1f3252] rounded px-3 py-2 text-sm"
            >
              {['purple', 'amber', 'blue', 'green', 'red', 'pink', 'teal', 'gray'].map((c) => (
                <option key={c} value={c}>
                  {c}
                </option>
              ))}
            </select>
          </div>

          <div className="border-t border-[#1f3252] pt-3 space-y-2">
            <h3 className="text-xs text-[#8aa0bd] uppercase tracking-wide">Blocks</h3>
            {doc.blocks.map((block, idx) => (
              <BlockEditor
                key={idx}
                block={block}
                idx={idx}
                total={doc.blocks.length}
                onChange={(patch) => updateBlock(idx, patch)}
                onRemove={() => removeBlock(idx)}
                onMove={(dir) => moveBlock(idx, dir)}
              />
            ))}
          </div>

          <div className="border-t border-[#1f3252] pt-3 space-y-2">
            <h3 className="text-xs text-[#8aa0bd] uppercase tracking-wide">Add block</h3>
            <div className="grid grid-cols-3 gap-2">
              {BLOCK_OPTIONS.map((opt) => (
                <button
                  key={opt.type}
                  onClick={() => addBlock(opt.type)}
                  className="bg-[#122440] border border-[#1f3252] rounded px-2 py-3 text-xs hover:border-[#f5a623] transition"
                >
                  <div className="font-bold text-[#f5a623]">{opt.icon}</div>
                  <div className="mt-1">{opt.label}</div>
                </button>
              ))}
            </div>
          </div>
        </section>

        <section className="p-4 overflow-y-auto">
          <h3 className="text-xs text-[#8aa0bd] uppercase tracking-wide mb-3">Live preview</h3>
          <div className="bg-[#122440] border border-[#1f3252] rounded-lg p-4 space-y-3">
            {doc.blocks.map((b, i) => (
              <BlockPreview key={i} block={b} theme={doc.theme} />
            ))}
            {doc.blocks.length === 0 && (
              <p className="text-[#8aa0bd] text-center py-8">No blocks yet. Add one from the left.</p>
            )}
          </div>

          {deployed && (
            <div className="mt-6 p-4 bg-[#122440] border border-[#f5a623] rounded-lg space-y-2">
              <p className="text-sm text-[#8aa0bd]">Deployed. Snap is live at:</p>
              <code className="block text-xs bg-[#0a1628] p-2 rounded break-all">
                /api/snap/{deployed.length <= 20 ? deployed : `${deployed.slice(0, 60)}...`}
              </code>
              <p className="text-xs text-[#8aa0bd]">
                Hit Share to feed (top right) to drop it in a cast.
              </p>
              {deployErr && (
                <p className="text-xs text-amber-400">Note: {deployErr}</p>
              )}
            </div>
          )}
        </section>
      </div>
    </main>
  );
}

function BlockEditor({
  block,
  idx,
  total,
  onChange,
  onRemove,
  onMove,
}: {
  block: Block;
  idx: number;
  total: number;
  onChange: (patch: Partial<Block>) => void;
  onRemove: () => void;
  onMove: (dir: -1 | 1) => void;
}) {
  return (
    <div className="bg-[#122440] border border-[#1f3252] rounded p-3 space-y-2">
      <div className="flex items-center justify-between gap-2">
        <span className="text-xs text-[#f5a623] uppercase">{block.type}</span>
        <div className="flex gap-1 text-xs">
          <button onClick={() => onMove(-1)} disabled={idx === 0} className="px-2 py-0.5 hover:bg-[#1f3252] rounded disabled:opacity-30">
            up
          </button>
          <button onClick={() => onMove(1)} disabled={idx === total - 1} className="px-2 py-0.5 hover:bg-[#1f3252] rounded disabled:opacity-30">
            dn
          </button>
          <button onClick={onRemove} className="px-2 py-0.5 hover:bg-red-900 rounded text-red-400">
            del
          </button>
        </div>
      </div>

      {block.type === 'header' && (
        <>
          <input
            value={block.title}
            onChange={(e) => onChange({ title: e.target.value } as Partial<Block>)}
            placeholder="Title"
            className="w-full bg-[#0a1628] border border-[#1f3252] rounded px-2 py-1 text-sm"
          />
          <input
            value={block.subtitle ?? ''}
            onChange={(e) => onChange({ subtitle: e.target.value } as Partial<Block>)}
            placeholder="Subtitle (optional)"
            className="w-full bg-[#0a1628] border border-[#1f3252] rounded px-2 py-1 text-sm"
          />
        </>
      )}

      {block.type === 'text' && (
        <textarea
          value={block.content}
          onChange={(e) => onChange({ content: e.target.value } as Partial<Block>)}
          rows={3}
          className="w-full bg-[#0a1628] border border-[#1f3252] rounded px-2 py-1 text-sm"
        />
      )}

      {block.type === 'link' && (
        <>
          <input
            value={block.label}
            onChange={(e) => onChange({ label: e.target.value } as Partial<Block>)}
            placeholder="Button label"
            className="w-full bg-[#0a1628] border border-[#1f3252] rounded px-2 py-1 text-sm"
          />
          <input
            value={block.url}
            onChange={(e) => onChange({ url: e.target.value } as Partial<Block>)}
            placeholder="https://"
            className="w-full bg-[#0a1628] border border-[#1f3252] rounded px-2 py-1 text-sm"
          />
        </>
      )}

      {block.type === 'share' && (
        <>
          <input
            value={block.label}
            onChange={(e) => onChange({ label: e.target.value } as Partial<Block>)}
            placeholder="Button label"
            className="w-full bg-[#0a1628] border border-[#1f3252] rounded px-2 py-1 text-sm"
          />
          <textarea
            value={block.text}
            onChange={(e) => onChange({ text: e.target.value } as Partial<Block>)}
            placeholder="Cast text"
            rows={2}
            className="w-full bg-[#0a1628] border border-[#1f3252] rounded px-2 py-1 text-sm"
          />
        </>
      )}

      {block.type === 'image' && (
        <>
          <input
            value={block.url}
            onChange={(e) => onChange({ url: e.target.value } as Partial<Block>)}
            placeholder="https://image.url"
            className="w-full bg-[#0a1628] border border-[#1f3252] rounded px-2 py-1 text-sm"
          />
          <input
            value={block.alt}
            onChange={(e) => onChange({ alt: e.target.value } as Partial<Block>)}
            placeholder="Alt text"
            className="w-full bg-[#0a1628] border border-[#1f3252] rounded px-2 py-1 text-sm"
          />
          <select
            value={block.aspect}
            onChange={(e) => onChange({ aspect: e.target.value as 'image' extends Block['type'] ? '1:1' : never } as Partial<Block>)}
            className="w-full bg-[#0a1628] border border-[#1f3252] rounded px-2 py-1 text-sm"
          >
            <option value="1:1">1:1</option>
            <option value="16:9">16:9</option>
            <option value="4:3">4:3</option>
            <option value="9:16">9:16</option>
          </select>
        </>
      )}

      {block.type === 'music' && (
        <>
          <input
            value={block.url}
            onChange={(e) => onChange({ url: e.target.value } as Partial<Block>)}
            placeholder="Spotify / Tortoise / SoundCloud / YouTube URL"
            className="w-full bg-[#0a1628] border border-[#1f3252] rounded px-2 py-1 text-sm"
          />
          <input
            value={block.label}
            onChange={(e) => onChange({ label: e.target.value } as Partial<Block>)}
            placeholder="Button label (e.g. Listen)"
            className="w-full bg-[#0a1628] border border-[#1f3252] rounded px-2 py-1 text-sm"
          />
        </>
      )}

      {block.type === 'artist' && (
        <>
          <input
            value={block.displayName}
            onChange={(e) => onChange({ displayName: e.target.value } as Partial<Block>)}
            placeholder="Display name"
            className="w-full bg-[#0a1628] border border-[#1f3252] rounded px-2 py-1 text-sm"
          />
          <input
            type="number"
            value={block.fid}
            onChange={(e) => onChange({ fid: Number(e.target.value) } as Partial<Block>)}
            placeholder="Farcaster FID"
            className="w-full bg-[#0a1628] border border-[#1f3252] rounded px-2 py-1 text-sm"
          />
          <input
            value={block.label}
            onChange={(e) => onChange({ label: e.target.value } as Partial<Block>)}
            placeholder="Button label (e.g. View profile)"
            className="w-full bg-[#0a1628] border border-[#1f3252] rounded px-2 py-1 text-sm"
          />
        </>
      )}

      {block.type === 'poll' && (
        <PollEditor block={block} onChange={onChange} />
      )}

      {block.type === 'divider' && <p className="text-xs text-[#8aa0bd]">Visual separator. No fields.</p>}
    </div>
  );
}

function PollEditor({
  block,
  onChange,
}: {
  block: import('@/lib/blocks').PollBlock;
  onChange: (patch: Partial<Block>) => void;
}) {
  function setOption(i: number, value: string) {
    const next = [...block.options];
    next[i] = value;
    onChange({ options: next } as Partial<Block>);
  }

  function addOption() {
    if (block.options.length >= 4) return;
    onChange({ options: [...block.options, `Option ${block.options.length + 1}`] } as Partial<Block>);
  }

  function removeOption(i: number) {
    if (block.options.length <= 2) return;
    onChange({ options: block.options.filter((_, j) => j !== i) } as Partial<Block>);
  }

  return (
    <>
      <input
        value={block.question}
        onChange={(e) => onChange({ question: e.target.value } as Partial<Block>)}
        placeholder="Poll question"
        className="w-full bg-[#0a1628] border border-[#1f3252] rounded px-2 py-1 text-sm"
      />
      <div className="space-y-1">
        {block.options.map((opt, i) => (
          <div key={i} className="flex gap-1">
            <input
              value={opt}
              onChange={(e) => setOption(i, e.target.value)}
              placeholder={`Option ${i + 1}`}
              className="flex-1 bg-[#0a1628] border border-[#1f3252] rounded px-2 py-1 text-sm"
            />
            {block.options.length > 2 && (
              <button
                onClick={() => removeOption(i)}
                className="px-2 text-xs text-red-400 hover:bg-red-900 rounded"
              >
                x
              </button>
            )}
          </div>
        ))}
      </div>
      {block.options.length < 4 && (
        <button
          onClick={addOption}
          className="text-xs text-[#f5a623] hover:underline"
        >
          + add option
        </button>
      )}
      <p className="text-xs text-[#8aa0bd]">v1: vote tallying ships in v0.5 with DB.</p>
    </>
  );
}

function BlockPreview({ block, theme }: { block: Block; theme: SnapDoc['theme'] }) {
  const accent = `var(--color-zao${theme === 'purple' ? 'purple' : theme === 'amber' ? 'gold' : 'gold'})`;

  if (block.type === 'header') {
    return (
      <div className="border-l-4 pl-3" style={{ borderColor: accent }}>
        <div className="font-bold">{block.title}</div>
        {block.subtitle && <div className="text-sm text-[#8aa0bd] mt-1">{block.subtitle}</div>}
      </div>
    );
  }
  if (block.type === 'text') {
    return <p className="text-sm whitespace-pre-wrap">{block.content}</p>;
  }
  if (block.type === 'link') {
    return (
      <a className="block bg-[#0a1628] border border-[#1f3252] rounded px-3 py-2 text-center font-medium hover:border-[#f5a623] transition" style={{ color: accent }}>
        {block.label}
      </a>
    );
  }
  if (block.type === 'share') {
    return (
      <div className="bg-[#0a1628] border border-[#1f3252] rounded px-3 py-2 text-center text-sm" style={{ color: accent }}>
        {block.label} (compose cast)
      </div>
    );
  }
  if (block.type === 'image') {
    const aspectClass = block.aspect === '1:1' ? 'aspect-square' : block.aspect === '16:9' ? 'aspect-video' : block.aspect === '4:3' ? 'aspect-4/3' : 'aspect-[9/16]';
    return (
      <div className={`bg-[#0a1628] border border-[#1f3252] rounded ${aspectClass} flex items-center justify-center text-xs text-[#8aa0bd]`}>
        Image: {block.alt}
      </div>
    );
  }
  if (block.type === 'divider') {
    return <hr className="border-[#1f3252]" />;
  }
  if (block.type === 'music') {
    return (
      <div className="bg-[#0a1628] border border-[#1f3252] rounded px-3 py-2 flex items-center gap-2" style={{ color: accent }}>
        <span className="font-bold">[MUSIC]</span>
        <span className="text-sm">{block.label}</span>
      </div>
    );
  }
  if (block.type === 'artist') {
    return (
      <div className="bg-[#0a1628] border border-[#1f3252] rounded px-3 py-2 space-y-1">
        <div className="font-medium" style={{ color: accent }}>{block.displayName}</div>
        <div className="text-xs text-[#8aa0bd]">FID {block.fid} - {block.label}</div>
      </div>
    );
  }
  if (block.type === 'poll') {
    return (
      <div className="bg-[#0a1628] border border-[#1f3252] rounded px-3 py-2 space-y-2">
        <div className="font-bold text-sm">{block.question}</div>
        <ul className="text-xs text-[#8aa0bd] space-y-1">
          {block.options.map((opt, i) => (
            <li key={i}>- {opt}</li>
          ))}
        </ul>
      </div>
    );
  }
  return null;
}
