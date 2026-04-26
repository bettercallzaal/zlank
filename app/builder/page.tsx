'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { sdk } from '@farcaster/miniapp-sdk';
import {
  DEFAULT_SNAP,
  clampBlock,
  ICONS,
  type SnapDoc,
  type Block,
  type BlockType,
  type IconName,
} from '@/lib/blocks';
import { encodeSnap } from '@/lib/encode';
import { saveMySnap } from '@/lib/my-snaps';
import { getTemplateById } from '@/lib/templates';

const BLOCK_OPTIONS: { type: BlockType; label: string; icon: string }[] = [
  { type: 'header', label: 'Header', icon: 'H' },
  { type: 'text', label: 'Text', icon: 'T' },
  { type: 'link', label: 'Link', icon: 'L' },
  { type: 'navigate', label: 'Navigate', icon: 'N' },
  { type: 'share', label: 'Share', icon: 'S' },
  { type: 'image', label: 'Image', icon: 'I' },
  { type: 'music', label: 'Music', icon: 'M' },
  { type: 'artist', label: 'Artist', icon: 'A' },
  { type: 'poll', label: 'Poll', icon: 'P' },
  { type: 'chart', label: 'Bar chart', icon: 'C' },
  { type: 'toggle', label: 'Toggle', icon: 'G' },
  { type: 'progress', label: 'Progress', icon: '%' },
  { type: 'slider', label: 'Slider', icon: '~' },
  { type: 'switch', label: 'Switch', icon: 'O' },
  { type: 'feedback', label: 'Feedback', icon: '@' },
  { type: 'chatbot', label: 'Chatbot', icon: 'C' },
  { type: 'leaderboard', label: 'Leaderboard', icon: 'L' },
  { type: 'divider', label: 'Divider', icon: '-' },
];

function newBlock(type: BlockType, availablePageIds: string[] = []): Block {
  switch (type) {
    case 'header':
      return { type: 'header', title: 'New header', subtitle: '' };
    case 'text':
      return { type: 'text', content: 'New text block. Edit me.' };
    case 'link':
      return {
        type: 'link',
        label: 'Open link',
        url: 'https://farcaster.xyz',
        icon: 'external-link',
        variant: 'primary',
      };
    case 'navigate':
      return {
        type: 'navigate',
        label: 'Go to page',
        pageId: availablePageIds[1] || 'page-2',
        icon: 'chevron-right',
        variant: 'primary',
      };
    case 'share':
      return { type: 'share', label: 'Share', text: 'Check out this Snap', icon: 'share' };
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
      return { type: 'music', url: 'https://open.spotify.com/track/', label: 'Listen', icon: 'play' };
    case 'artist':
      return { type: 'artist', fid: 19640, displayName: 'New artist', label: 'View profile' };
    case 'poll':
      return { type: 'poll', question: 'What should we do next?', options: ['Option A', 'Option B'] };
    case 'chart':
      return {
        type: 'chart',
        title: 'Top 3',
        bars: [
          { label: 'Alice', value: 12 },
          { label: 'Bob', value: 8 },
          { label: 'Carol', value: 4 },
        ],
      };
    case 'toggle':
      return {
        type: 'toggle',
        label: 'Pick one',
        options: ['Yes', 'No', 'Maybe'],
        orientation: 'horizontal',
      };
    case 'progress':
      return { type: 'progress', label: 'Progress to goal', value: 65, max: 100 };
    case 'slider':
      return { type: 'slider', label: 'Rate it', min: 0, max: 10, defaultValue: 7 };
    case 'switch':
      return { type: 'switch', label: 'Subscribe to updates', defaultChecked: false };
    case 'feedback':
      return {
        type: 'feedback',
        label: 'Send feedback',
        prompt: 'What should we add?',
        mention: 'zaal',
        prefix: 'feedback for zlank:',
      };
    case 'chatbot':
      return {
        type: 'chatbot',
        title: 'What are you building?',
        prompt: 'Share your idea. Reply comes back inline.',
        systemPrompt:
          'You are a friendly builder coach. Reply briefly (max 2 sentences) and ask one curious follow-up about what they are making.',
        label: 'Send',
        placeholder: 'Type here...',
      };
    case 'leaderboard':
      return {
        type: 'leaderboard',
        title: 'Live results',
        source: 'votes',
        pollBlockIdx: 0,
        topN: 5,
      };
  }
}

export default function Builder() {
  const [doc, setDoc] = useState<SnapDoc>(DEFAULT_SNAP);
  const [deployed, setDeployed] = useState<string | null>(null);
  const [isMiniApp, setIsMiniApp] = useState(false);
  const [currentPageId, setCurrentPageId] = useState<string>('home');
  const [pageCounter, setPageCounter] = useState(2);
  const [editingId, setEditingId] = useState<string | null>(null);

  useEffect(() => {
    (async () => {
      try {
        const inMiniApp = await sdk.isInMiniApp();
        setIsMiniApp(inMiniApp);
        if (inMiniApp) await sdk.actions.ready();
      } catch {
        // Browser context, no-op
      }

      // Load from query params (id= for editing existing, template= for template)
      if (typeof window !== 'undefined') {
        const params = new URLSearchParams(window.location.search);
        const snapId = params.get('id');
        const templateId = params.get('template');

        if (snapId) {
          // Load existing snap for editing
          try {
            const res = await fetch(`/api/snaps/${snapId}/doc`);
            if (res.ok) {
              const loaded = (await res.json()) as SnapDoc;
              setDoc(loaded);
              setEditingId(snapId);
            }
          } catch {
            // silently fail, stay with default
          }
        } else if (templateId) {
          // Load template
          const template = getTemplateById(templateId);
          if (template) {
            setDoc(template.doc);
          }
        }
      }
    })();
  }, []);

  function updateBlock(idx: number, patch: Partial<Block>) {
    setDoc((d) => {
      const pageIdx = d.pages.findIndex((p) => p.id === currentPageId);
      if (pageIdx === -1) return d;
      const newPages = [...d.pages];
      const nextBlocks = [...newPages[pageIdx].blocks];
      nextBlocks[idx] = clampBlock({ ...nextBlocks[idx], ...patch } as Block);
      newPages[pageIdx] = { ...newPages[pageIdx], blocks: nextBlocks };
      return { ...d, pages: newPages };
    });
  }

  function removeBlock(idx: number) {
    setDoc((d) => {
      const pageIdx = d.pages.findIndex((p) => p.id === currentPageId);
      if (pageIdx === -1) return d;
      const newPages = [...d.pages];
      newPages[pageIdx] = {
        ...newPages[pageIdx],
        blocks: newPages[pageIdx].blocks.filter((_, i) => i !== idx),
      };
      return { ...d, pages: newPages };
    });
  }

  function addBlock(type: BlockType) {
    setDoc((d) => {
      const pageIdx = d.pages.findIndex((p) => p.id === currentPageId);
      if (pageIdx === -1) return d;
      const newPages = [...d.pages];
      const otherPageIds = d.pages.filter((p) => p.id !== currentPageId).map((p) => p.id);
      newPages[pageIdx] = {
        ...newPages[pageIdx],
        blocks: [...newPages[pageIdx].blocks, newBlock(type, otherPageIds)],
      };
      return { ...d, pages: newPages };
    });
  }

  function moveBlock(idx: number, dir: -1 | 1) {
    setDoc((d) => {
      const pageIdx = d.pages.findIndex((p) => p.id === currentPageId);
      if (pageIdx === -1) return d;
      const newPages = [...d.pages];
      const nextBlocks = [...newPages[pageIdx].blocks];
      const target = idx + dir;
      if (target < 0 || target >= nextBlocks.length) return d;
      [nextBlocks[idx], nextBlocks[target]] = [nextBlocks[target], nextBlocks[idx]];
      newPages[pageIdx] = { ...newPages[pageIdx], blocks: nextBlocks };
      return { ...d, pages: newPages };
    });
  }

  function addPage() {
    const newPageId = `page-${pageCounter}`;
    setPageCounter((c) => c + 1);
    setDoc((d) => ({
      ...d,
      pages: [...d.pages, { id: newPageId, blocks: [] }],
    }));
    setCurrentPageId(newPageId);
  }

  function deletePage(pageId: string) {
    if (doc.pages.length === 1) return;
    const newPages = doc.pages.filter((p) => p.id !== pageId);
    setDoc((d) => ({ ...d, pages: newPages }));
    if (currentPageId === pageId) {
      setCurrentPageId(newPages[0].id);
    }
  }

  const currentPage = doc.pages.find((p) => p.id === currentPageId);

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
        const data = (await res.json().catch(() => ({}))) as {
          error?: string;
          issues?: string[];
        };
        // Validation errors (400 w/ issues): surface them, do NOT silently
        // fall back to URL-encode - that would hide an invalid Snap.
        if (res.status === 400 && Array.isArray(data.issues) && data.issues.length > 0) {
          setDeployErr(`Snap won't render. Fix:\n- ${data.issues.join('\n- ')}`);
          return;
        }
        throw new Error(data.error ?? `HTTP ${res.status}`);
      }
      const data = (await res.json()) as { id: string; short: boolean };
      setDeployed(data.id);

      // Save to localStorage for My Snaps history
      const totalBlockCount = doc.pages.reduce((sum, page) => sum + page.blocks.length, 0);
      saveMySnap({
        id: data.id,
        title: doc.title,
        theme: doc.theme,
        blockCount: totalBlockCount,
        createdAt: editingId ? Date.now() : Date.now(),
        updatedAt: Date.now(),
      });
    } catch (err: unknown) {
      // Network / server error - fall back to URL-encode locally
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
        <div className="flex items-center gap-4">
          <Link href="/" className="text-[#f5a623] font-bold text-lg">
            Zlank
          </Link>
          <nav className="hidden sm:flex gap-3 text-sm">
            <Link href="/templates" className="text-[#8aa0bd] hover:text-[#f5a623] transition">
              Templates
            </Link>
            <Link href="/dashboard" className="text-[#8aa0bd] hover:text-[#f5a623] transition">
              My Snaps
            </Link>
          </nav>
        </div>
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

          <label className="flex items-center gap-2 text-sm text-[#e8eef7] cursor-pointer">
            <input
              type="checkbox"
              checked={doc.confetti ?? false}
              onChange={(e) => setDoc((d) => ({ ...d, confetti: e.target.checked }))}
            />
            Confetti effect on render
          </label>

          <div className="border-t border-[#1f3252] pt-3 space-y-2">
            <div className="flex items-center justify-between">
              <h3 className="text-xs text-[#8aa0bd] uppercase tracking-wide">Pages</h3>
              <button
                onClick={addPage}
                className="text-xs text-[#f5a623] hover:underline"
              >
                + add page
              </button>
            </div>
            <div className="flex flex-wrap gap-2">
              {doc.pages.map((page) => (
                <div key={page.id} className="flex items-center gap-1">
                  <button
                    onClick={() => setCurrentPageId(page.id)}
                    className={`px-3 py-1 text-xs rounded transition ${
                      currentPageId === page.id
                        ? 'bg-[#f5a623] text-[#0a1628]'
                        : 'bg-[#122440] border border-[#1f3252] text-[#e8eef7] hover:border-[#f5a623]'
                    }`}
                  >
                    {page.id}
                  </button>
                  {doc.pages.length > 1 && (
                    <button
                      onClick={() => deletePage(page.id)}
                      className="px-1 text-xs text-red-400 hover:bg-red-900 rounded"
                    >
                      x
                    </button>
                  )}
                </div>
              ))}
            </div>
          </div>

          <div className="border-t border-[#1f3252] pt-3 space-y-2">
            <h3 className="text-xs text-[#8aa0bd] uppercase tracking-wide">Blocks</h3>
            {currentPage?.blocks.map((block, idx) => (
              <BlockEditor
                key={idx}
                block={block}
                idx={idx}
                total={currentPage.blocks.length}
                onChange={(patch) => updateBlock(idx, patch)}
                onRemove={() => removeBlock(idx)}
                onMove={(dir) => moveBlock(idx, dir)}
                allPageIds={doc.pages.map((p) => p.id)}
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
          <h3 className="text-xs text-[#8aa0bd] uppercase tracking-wide mb-3">Live preview - {currentPageId}</h3>
          <div className="bg-[#122440] border border-[#1f3252] rounded-lg p-4 space-y-3">
            {currentPage?.blocks.map((b, i) => (
              <BlockPreview key={i} block={b} theme={doc.theme} allPageIds={doc.pages.map((p) => p.id)} />
            ))}
            {!currentPage?.blocks || currentPage.blocks.length === 0 && (
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
  allPageIds = [],
}: {
  block: Block;
  idx: number;
  total: number;
  onChange: (patch: Partial<Block>) => void;
  onRemove: () => void;
  onMove: (dir: -1 | 1) => void;
  allPageIds?: string[];
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
          <div className="flex gap-2">
            <select
              value={block.icon ?? 'external-link'}
              onChange={(e) => onChange({ icon: e.target.value as IconName } as Partial<Block>)}
              className="flex-1 bg-[#0a1628] border border-[#1f3252] rounded px-2 py-1 text-sm"
            >
              {ICONS.map((i) => (
                <option key={i} value={i}>{i}</option>
              ))}
            </select>
            <select
              value={block.variant ?? 'primary'}
              onChange={(e) => onChange({ variant: e.target.value as 'primary' | 'secondary' } as Partial<Block>)}
              className="bg-[#0a1628] border border-[#1f3252] rounded px-2 py-1 text-sm"
            >
              <option value="primary">primary</option>
              <option value="secondary">secondary</option>
            </select>
          </div>
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
          <select
            value={block.icon ?? 'share'}
            onChange={(e) => onChange({ icon: e.target.value as IconName } as Partial<Block>)}
            className="w-full bg-[#0a1628] border border-[#1f3252] rounded px-2 py-1 text-sm"
          >
            {ICONS.map((i) => (
              <option key={i} value={i}>{i}</option>
            ))}
          </select>
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
          <select
            value={block.icon ?? 'play'}
            onChange={(e) => onChange({ icon: e.target.value as IconName } as Partial<Block>)}
            className="w-full bg-[#0a1628] border border-[#1f3252] rounded px-2 py-1 text-sm"
          >
            {ICONS.map((i) => (
              <option key={i} value={i}>{i}</option>
            ))}
          </select>
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

      {block.type === 'chart' && (
        <ChartEditor block={block} onChange={onChange} />
      )}

      {block.type === 'toggle' && (
        <ToggleEditor block={block} onChange={onChange} />
      )}

      {block.type === 'navigate' && (
        <>
          <input
            value={block.label}
            onChange={(e) => onChange({ label: e.target.value } as Partial<Block>)}
            placeholder="Button label"
            className="w-full bg-[#0a1628] border border-[#1f3252] rounded px-2 py-1 text-sm"
          />
          <select
            value={block.pageId}
            onChange={(e) => onChange({ pageId: e.target.value } as Partial<Block>)}
            className="w-full bg-[#0a1628] border border-[#1f3252] rounded px-2 py-1 text-sm"
          >
            {allPageIds
              .filter((pid) => pid !== 'home') // Can't navigate to current page from this simple impl
              .map((pid) => (
                <option key={pid} value={pid}>
                  {pid}
                </option>
              ))}
          </select>
          <div className="flex gap-2">
            <select
              value={block.icon ?? 'chevron-right'}
              onChange={(e) => onChange({ icon: e.target.value as IconName } as Partial<Block>)}
              className="flex-1 bg-[#0a1628] border border-[#1f3252] rounded px-2 py-1 text-sm"
            >
              {ICONS.map((i) => (
                <option key={i} value={i}>{i}</option>
              ))}
            </select>
            <select
              value={block.variant ?? 'primary'}
              onChange={(e) => onChange({ variant: e.target.value as 'primary' | 'secondary' } as Partial<Block>)}
              className="bg-[#0a1628] border border-[#1f3252] rounded px-2 py-1 text-sm"
            >
              <option value="primary">primary</option>
              <option value="secondary">secondary</option>
            </select>
          </div>
        </>
      )}

      {block.type === 'progress' && (
        <>
          <input
            value={block.label}
            onChange={(e) => onChange({ label: e.target.value } as Partial<Block>)}
            placeholder="Label (e.g. Funded)"
            className="w-full bg-[#0a1628] border border-[#1f3252] rounded px-2 py-1 text-sm"
          />
          <div className="flex gap-2">
            <input type="number" value={block.value} onChange={(e) => onChange({ value: Number(e.target.value) } as Partial<Block>)} placeholder="value" className="flex-1 bg-[#0a1628] border border-[#1f3252] rounded px-2 py-1 text-sm" />
            <input type="number" value={block.max} onChange={(e) => onChange({ max: Number(e.target.value) } as Partial<Block>)} placeholder="max" className="flex-1 bg-[#0a1628] border border-[#1f3252] rounded px-2 py-1 text-sm" />
          </div>
        </>
      )}
      {block.type === 'slider' && (
        <>
          <input value={block.label} onChange={(e) => onChange({ label: e.target.value } as Partial<Block>)} placeholder="Label (e.g. Rate)" className="w-full bg-[#0a1628] border border-[#1f3252] rounded px-2 py-1 text-sm" />
          <div className="flex gap-2">
            <input type="number" value={block.min} onChange={(e) => onChange({ min: Number(e.target.value) } as Partial<Block>)} placeholder="min" className="flex-1 bg-[#0a1628] border border-[#1f3252] rounded px-2 py-1 text-sm" />
            <input type="number" value={block.max} onChange={(e) => onChange({ max: Number(e.target.value) } as Partial<Block>)} placeholder="max" className="flex-1 bg-[#0a1628] border border-[#1f3252] rounded px-2 py-1 text-sm" />
            <input type="number" value={block.defaultValue} onChange={(e) => onChange({ defaultValue: Number(e.target.value) } as Partial<Block>)} placeholder="default" className="flex-1 bg-[#0a1628] border border-[#1f3252] rounded px-2 py-1 text-sm" />
          </div>
        </>
      )}
      {block.type === 'switch' && (
        <>
          <input value={block.label} onChange={(e) => onChange({ label: e.target.value } as Partial<Block>)} placeholder="Label" className="w-full bg-[#0a1628] border border-[#1f3252] rounded px-2 py-1 text-sm" />
          <label className="flex items-center gap-2 text-sm">
            <input type="checkbox" checked={block.defaultChecked} onChange={(e) => onChange({ defaultChecked: e.target.checked } as Partial<Block>)} />
            Default checked
          </label>
        </>
      )}
      {block.type === 'header' && (
        <>
          <input
            value={block.badgeText ?? ''}
            onChange={(e) => onChange({ badgeText: e.target.value } as Partial<Block>)}
            placeholder="Badge text (optional)"
            className="w-full bg-[#0a1628] border border-[#1f3252] rounded px-2 py-1 text-sm"
          />
          <select
            value={block.badgeColor ?? 'gray'}
            onChange={(e) => onChange({ badgeColor: e.target.value as 'green' | 'red' | 'amber' | 'gray' | 'purple' | 'blue' | 'pink' | 'teal' } as Partial<Block>)}
            className="w-full bg-[#0a1628] border border-[#1f3252] rounded px-2 py-1 text-sm"
          >
            {['gray', 'green', 'amber', 'red', 'purple', 'blue', 'pink', 'teal'].map((c) => (
              <option key={c} value={c}>badge: {c}</option>
            ))}
          </select>
        </>
      )}
      {block.type === 'feedback' && (
        <>
          <input
            value={block.label}
            onChange={(e) => onChange({ label: e.target.value } as Partial<Block>)}
            placeholder="Button label (e.g. Send feedback)"
            className="w-full bg-[#0a1628] border border-[#1f3252] rounded px-2 py-1 text-sm"
          />
          <input
            value={block.prompt}
            onChange={(e) => onChange({ prompt: e.target.value } as Partial<Block>)}
            placeholder="Prompt (e.g. What should we add?)"
            className="w-full bg-[#0a1628] border border-[#1f3252] rounded px-2 py-1 text-sm"
          />
          <div className="flex gap-2">
            <span className="text-sm text-[#8aa0bd] self-center">@</span>
            <input
              value={block.mention}
              onChange={(e) => onChange({ mention: e.target.value.replace(/^@/, '') } as Partial<Block>)}
              placeholder="zaal"
              className="flex-1 bg-[#0a1628] border border-[#1f3252] rounded px-2 py-1 text-sm"
            />
          </div>
          <input
            value={block.prefix ?? ''}
            onChange={(e) => onChange({ prefix: e.target.value } as Partial<Block>)}
            placeholder="Prefix (e.g. feedback for zlank:)"
            className="w-full bg-[#0a1628] border border-[#1f3252] rounded px-2 py-1 text-sm"
          />
          <input
            value={block.channelKey ?? ''}
            onChange={(e) => onChange({ channelKey: e.target.value.replace(/^\//, '') } as Partial<Block>)}
            placeholder="Channel key (optional, no leading /)"
            className="w-full bg-[#0a1628] border border-[#1f3252] rounded px-2 py-1 text-sm"
          />
        </>
      )}
      {block.type === 'chatbot' && (
        <>
          <input
            value={block.title}
            onChange={(e) => onChange({ title: e.target.value } as Partial<Block>)}
            placeholder="Title (e.g. What are you building?)"
            className="w-full bg-[#0a1628] border border-[#1f3252] rounded px-2 py-1 text-sm"
          />
          <input
            value={block.prompt}
            onChange={(e) => onChange({ prompt: e.target.value } as Partial<Block>)}
            placeholder="Subtitle / prompt"
            className="w-full bg-[#0a1628] border border-[#1f3252] rounded px-2 py-1 text-sm"
          />
          <textarea
            value={block.systemPrompt}
            onChange={(e) => onChange({ systemPrompt: e.target.value } as Partial<Block>)}
            placeholder="System prompt - frames the LLM"
            rows={3}
            className="w-full bg-[#0a1628] border border-[#1f3252] rounded px-2 py-1 text-sm"
          />
          <div className="flex gap-2">
            <input
              value={block.label}
              onChange={(e) => onChange({ label: e.target.value } as Partial<Block>)}
              placeholder="Button label"
              className="flex-1 bg-[#0a1628] border border-[#1f3252] rounded px-2 py-1 text-sm"
            />
            <input
              value={block.placeholder ?? ''}
              onChange={(e) => onChange({ placeholder: e.target.value } as Partial<Block>)}
              placeholder="Input placeholder"
              className="flex-1 bg-[#0a1628] border border-[#1f3252] rounded px-2 py-1 text-sm"
            />
          </div>
        </>
      )}
      {block.type === 'leaderboard' && (
        <>
          <input
            value={block.title}
            onChange={(e) => onChange({ title: e.target.value } as Partial<Block>)}
            placeholder="Title (e.g. Live results)"
            className="w-full bg-[#0a1628] border border-[#1f3252] rounded px-2 py-1 text-sm"
          />
          <div className="flex gap-2">
            <span className="self-center text-xs text-[#8aa0bd]">Poll block #</span>
            <input
              type="number"
              value={block.pollBlockIdx}
              onChange={(e) => onChange({ pollBlockIdx: Number(e.target.value) } as Partial<Block>)}
              placeholder="0"
              className="w-20 bg-[#0a1628] border border-[#1f3252] rounded px-2 py-1 text-sm"
            />
            <span className="self-center text-xs text-[#8aa0bd]">Top N:</span>
            <input
              type="number"
              value={block.topN ?? 5}
              onChange={(e) => onChange({ topN: Number(e.target.value) } as Partial<Block>)}
              placeholder="5"
              className="w-20 bg-[#0a1628] border border-[#1f3252] rounded px-2 py-1 text-sm"
            />
          </div>
          <p className="text-[11px] text-[#5e7290]">
            Pulls live tallies from a poll block on the same page. Index = position of the poll (0 = first block).
          </p>
        </>
      )}
      {block.type === 'divider' && <p className="text-xs text-[#8aa0bd]">Visual separator. No fields.</p>}

      <GateEditor block={block} onChange={onChange} />
    </div>
  );
}

const GATE_PRESETS: { id: string; symbol: string; address: string; decimals: number }[] = [
  { id: 'zabal', symbol: 'ZABAL', address: '0xbB48f19B0494Ff7C1fE5Dc2032aeEE14312f0b07', decimals: 18 },
];

function GateEditor({ block, onChange }: { block: Block; onChange: (patch: Partial<Block>) => void }) {
  const gate = block.gate;
  const presetMatch = gate
    ? GATE_PRESETS.find((p) => p.address.toLowerCase() === gate.token.toLowerCase())
    : null;
  const mode: 'none' | 'preset' | 'custom' = !gate ? 'none' : presetMatch ? 'preset' : 'custom';

  function clearGate() {
    onChange({ gate: undefined } as Partial<Block>);
  }
  function applyPreset(preset: typeof GATE_PRESETS[number]) {
    onChange({
      gate: {
        type: 'token-balance',
        token: preset.address,
        symbol: preset.symbol,
        minBalance: gate?.minBalance || '1',
        decimals: preset.decimals,
        upsellUrl: gate?.upsellUrl,
      },
    } as Partial<Block>);
  }
  function setCustom() {
    onChange({
      gate: {
        type: 'token-balance',
        token: gate?.token || '',
        symbol: gate?.symbol || '',
        minBalance: gate?.minBalance || '1',
        decimals: gate?.decimals ?? 18,
        upsellUrl: gate?.upsellUrl,
      },
    } as Partial<Block>);
  }
  function patchGate(patch: Partial<NonNullable<Block['gate']>>) {
    if (!gate) return;
    onChange({ gate: { ...gate, ...patch } } as Partial<Block>);
  }

  return (
    <details className="border border-[#1f3252] rounded">
      <summary className="cursor-pointer px-2 py-1 text-xs text-[#8aa0bd] hover:text-[#f5a623]">
        Gate {gate ? `(holders only - ${gate.symbol || 'token'} >= ${gate.minBalance})` : '(public)'}
      </summary>
      <div className="p-2 space-y-2 text-xs">
        <div className="flex gap-2">
          <button
            onClick={clearGate}
            className={`px-2 py-1 rounded ${mode === 'none' ? 'bg-[#f5a623] text-[#0a1628]' : 'bg-[#0a1628] border border-[#1f3252]'}`}
          >
            Public
          </button>
          {GATE_PRESETS.map((p) => (
            <button
              key={p.id}
              onClick={() => applyPreset(p)}
              className={`px-2 py-1 rounded ${mode === 'preset' && presetMatch?.id === p.id ? 'bg-[#f5a623] text-[#0a1628]' : 'bg-[#0a1628] border border-[#1f3252]'}`}
            >
              {p.symbol}
            </button>
          ))}
          <button
            onClick={setCustom}
            className={`px-2 py-1 rounded ${mode === 'custom' ? 'bg-[#f5a623] text-[#0a1628]' : 'bg-[#0a1628] border border-[#1f3252]'}`}
          >
            Custom
          </button>
        </div>

        {gate && (
          <div className="space-y-1">
            {mode === 'custom' && (
              <>
                <input
                  value={gate.token}
                  onChange={(e) => patchGate({ token: e.target.value.trim() })}
                  placeholder="Token contract address (0x...)"
                  className="w-full bg-[#0a1628] border border-[#1f3252] rounded px-2 py-1"
                />
                <div className="flex gap-2">
                  <input
                    value={gate.symbol ?? ''}
                    onChange={(e) => patchGate({ symbol: e.target.value })}
                    placeholder="Symbol (e.g. MYTOKEN)"
                    className="flex-1 bg-[#0a1628] border border-[#1f3252] rounded px-2 py-1"
                  />
                  <input
                    type="number"
                    value={gate.decimals ?? 18}
                    onChange={(e) => patchGate({ decimals: Number(e.target.value) || 18 })}
                    placeholder="decimals"
                    className="w-20 bg-[#0a1628] border border-[#1f3252] rounded px-2 py-1"
                  />
                </div>
              </>
            )}
            <div className="flex gap-2">
              <span className="self-center text-[#8aa0bd]">Min balance:</span>
              <input
                value={gate.minBalance}
                onChange={(e) => patchGate({ minBalance: e.target.value.trim() })}
                placeholder="1"
                className="flex-1 bg-[#0a1628] border border-[#1f3252] rounded px-2 py-1"
              />
            </div>
            <input
              value={gate.upsellUrl ?? ''}
              onChange={(e) => patchGate({ upsellUrl: e.target.value })}
              placeholder="Upsell URL (optional, e.g. swap link)"
              className="w-full bg-[#0a1628] border border-[#1f3252] rounded px-2 py-1"
            />
            <p className="text-[#5e7290] text-[11px]">
              Non-holders see {gate.upsellUrl ? 'a button opening the upsell URL' : 'a "holders only" message'}.
            </p>
          </div>
        )}
      </div>
    </details>
  );
}

function ChartEditor({
  block,
  onChange,
}: {
  block: import('@/lib/blocks').ChartBlock;
  onChange: (patch: Partial<Block>) => void;
}) {
  function setBar(i: number, patch: Partial<{ label: string; value: number }>) {
    const next = block.bars.map((b, j) => (j === i ? { ...b, ...patch } : b));
    onChange({ bars: next } as Partial<Block>);
  }
  function addBar() {
    if (block.bars.length >= 6) return;
    onChange({ bars: [...block.bars, { label: 'New', value: 1 }] } as Partial<Block>);
  }
  function removeBar(i: number) {
    if (block.bars.length <= 1) return;
    onChange({ bars: block.bars.filter((_, j) => j !== i) } as Partial<Block>);
  }
  return (
    <>
      <input
        value={block.title}
        onChange={(e) => onChange({ title: e.target.value } as Partial<Block>)}
        placeholder="Chart title"
        className="w-full bg-[#0a1628] border border-[#1f3252] rounded px-2 py-1 text-sm"
      />
      <div className="space-y-1">
        {block.bars.map((bar, i) => (
          <div key={i} className="flex gap-1">
            <input
              value={bar.label}
              onChange={(e) => setBar(i, { label: e.target.value })}
              placeholder="Label"
              className="flex-1 bg-[#0a1628] border border-[#1f3252] rounded px-2 py-1 text-sm"
            />
            <input
              type="number"
              value={bar.value}
              onChange={(e) => setBar(i, { value: Number(e.target.value) })}
              placeholder="Value"
              className="w-20 bg-[#0a1628] border border-[#1f3252] rounded px-2 py-1 text-sm"
            />
            {block.bars.length > 1 && (
              <button onClick={() => removeBar(i)} className="px-2 text-xs text-red-400 hover:bg-red-900 rounded">x</button>
            )}
          </div>
        ))}
      </div>
      {block.bars.length < 6 && (
        <button onClick={addBar} className="text-xs text-[#f5a623] hover:underline">+ add bar</button>
      )}
    </>
  );
}

function ToggleEditor({
  block,
  onChange,
}: {
  block: import('@/lib/blocks').ToggleBlock;
  onChange: (patch: Partial<Block>) => void;
}) {
  function setOption(i: number, value: string) {
    const next = [...block.options];
    next[i] = value;
    onChange({ options: next } as Partial<Block>);
  }
  function addOption() {
    if (block.options.length >= 6) return;
    onChange({ options: [...block.options, `Option ${block.options.length + 1}`] } as Partial<Block>);
  }
  function removeOption(i: number) {
    if (block.options.length <= 2) return;
    onChange({ options: block.options.filter((_, j) => j !== i) } as Partial<Block>);
  }
  return (
    <>
      <input
        value={block.label}
        onChange={(e) => onChange({ label: e.target.value } as Partial<Block>)}
        placeholder="Toggle label"
        className="w-full bg-[#0a1628] border border-[#1f3252] rounded px-2 py-1 text-sm"
      />
      <select
        value={block.orientation ?? 'horizontal'}
        onChange={(e) => onChange({ orientation: e.target.value as 'horizontal' | 'vertical' } as Partial<Block>)}
        className="w-full bg-[#0a1628] border border-[#1f3252] rounded px-2 py-1 text-sm"
      >
        <option value="horizontal">horizontal</option>
        <option value="vertical">vertical</option>
      </select>
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
              <button onClick={() => removeOption(i)} className="px-2 text-xs text-red-400 hover:bg-red-900 rounded">x</button>
            )}
          </div>
        ))}
      </div>
      {block.options.length < 6 && (
        <button onClick={addOption} className="text-xs text-[#f5a623] hover:underline">+ add option</button>
      )}
    </>
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

function BlockPreview({ block, theme, allPageIds = [] }: { block: Block; theme: SnapDoc['theme']; allPageIds?: string[] }) {
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
  if (block.type === 'navigate') {
    return (
      <div className="block bg-[#0a1628] border border-[#1f3252] rounded px-3 py-2 text-center font-medium" style={{ color: accent }}>
        {block.label}
      </div>
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
  if (block.type === 'chart') {
    const max = Math.max(...block.bars.map((b) => b.value), 1);
    return (
      <div className="bg-[#0a1628] border border-[#1f3252] rounded px-3 py-2 space-y-2">
        <div className="font-bold text-sm">{block.title}</div>
        <div className="space-y-1">
          {block.bars.map((bar, i) => (
            <div key={i} className="flex items-center gap-2 text-xs">
              <span className="w-20 truncate text-[#8aa0bd] text-right">{bar.label}</span>
              <div className="flex-1 h-2 bg-[#1f3252] rounded">
                <div
                  className="h-full rounded"
                  style={{ width: `${(bar.value / max) * 100}%`, background: accent }}
                />
              </div>
              <span className="w-8 text-[#8aa0bd] tabular-nums">{bar.value}</span>
            </div>
          ))}
        </div>
      </div>
    );
  }
  if (block.type === 'toggle') {
    return (
      <div className="bg-[#0a1628] border border-[#1f3252] rounded px-3 py-2 space-y-1">
        <div className="text-xs text-[#8aa0bd]">{block.label}</div>
        <div className={block.orientation === 'vertical' ? 'flex flex-col gap-1' : 'flex gap-1'}>
          {block.options.map((opt, i) => (
            <span
              key={i}
              className="px-2 py-1 bg-[#1f3252] rounded text-xs"
              style={i === 0 ? { background: accent, color: '#0a1628' } : {}}
            >
              {opt}
            </span>
          ))}
        </div>
      </div>
    );
  }
  if (block.type === 'progress') {
    const pct = Math.min(100, (block.value / Math.max(1, block.max)) * 100);
    return (
      <div className="space-y-1">
        <div className="text-xs text-[#8aa0bd]">{block.label}</div>
        <div className="h-2 bg-[#1f3252] rounded">
          <div className="h-full rounded" style={{ width: `${pct}%`, background: accent }} />
        </div>
      </div>
    );
  }
  if (block.type === 'slider') {
    return (
      <div className="space-y-1">
        <div className="text-xs text-[#8aa0bd]">{block.label} ({block.min}-{block.max}, default {block.defaultValue})</div>
        <input type="range" min={block.min} max={block.max} value={block.defaultValue} readOnly className="w-full" />
      </div>
    );
  }
  if (block.type === 'switch') {
    return (
      <div className="flex items-center justify-between bg-[#0a1628] border border-[#1f3252] rounded px-3 py-2">
        <span className="text-sm">{block.label}</span>
        <span className={`px-2 py-0.5 text-xs rounded ${block.defaultChecked ? 'text-[#0a1628]' : 'text-[#8aa0bd]'}`} style={block.defaultChecked ? { background: accent } : { background: '#1f3252' }}>
          {block.defaultChecked ? 'on' : 'off'}
        </span>
      </div>
    );
  }
  return null;
}
