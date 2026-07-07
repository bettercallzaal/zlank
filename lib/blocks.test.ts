import { describe, it, expect } from 'vitest';
import type { SnapDoc } from './blocks';
import { clampSnap, isHttpsUrl } from './blocks';

describe('SnapDoc schema extensions', () => {
  it('accepts optional parentId, partner, forkable, embedMode, dataSource fields', () => {
    const doc: SnapDoc = {
      version: 2,
      title: 'Test',
      theme: 'purple',
      parentId: 'parent-abc',
      partner: { id: 'footy', name: 'Footy App', attribution: true },
      forkable: true,
      embedMode: 'iframe',
      dataSource: [
        { id: 'score-feed', kind: 'rest', url: 'https://api.example.com/score', refreshSec: 30 },
      ],
      pages: [{ id: 'home', blocks: [] }],
    };
    expect(doc.parentId).toBe('parent-abc');
    expect(doc.partner?.id).toBe('footy');
    expect(doc.forkable).toBe(true);
    expect(doc.embedMode).toBe('iframe');
    expect(doc.dataSource?.[0].kind).toBe('rest');
  });

  it('accepts a v1 doc without new fields (backwards compatibility)', () => {
    const doc: SnapDoc = {
      version: 1,
      title: 'Legacy',
      theme: 'amber',
      pages: [{ id: 'home', blocks: [] }],
    };
    expect(doc.parentId).toBeUndefined();
    expect(doc.partner).toBeUndefined();
  });
});

describe('isHttpsUrl', () => {
  it('accepts https URLs', () => {
    expect(isHttpsUrl('https://example.com')).toBe(true);
  });
  it('rejects http, empty, and undefined', () => {
    expect(isHttpsUrl('http://example.com')).toBe(false);
    expect(isHttpsUrl('')).toBe(false);
    expect(isHttpsUrl(undefined)).toBe(false);
  });
});

describe('clampSnap with v2 fields', () => {
  it('clamps refreshSec to [10, 3600]', () => {
    const doc = clampSnap({
      version: 2, title: 't', theme: 'purple', pages: [],
      dataSource: [{ id: 'a', kind: 'rest', url: 'https://x.com', refreshSec: 5 }],
    });
    expect(doc.dataSource?.[0].refreshSec).toBe(10);
  });

  it('strips non-HTTPS dataSource URLs', () => {
    const doc = clampSnap({
      version: 2, title: 't', theme: 'purple', pages: [],
      dataSource: [{ id: 'a', kind: 'rest', url: 'http://insecure.com' }],
    });
    expect(doc.dataSource?.[0].url).toBeUndefined();
  });

  it('truncates partner.name to 40 chars and partner.id to 32', () => {
    const doc = clampSnap({
      version: 2, title: 't', theme: 'purple', pages: [],
      partner: { id: 'x'.repeat(50), name: 'y'.repeat(100), attribution: true },
    });
    expect(doc.partner?.name.length).toBe(40);
    expect(doc.partner?.id.length).toBe(32);
  });

  it('defaults forkable to true when absent', () => {
    const doc = clampSnap({ version: 2, title: 't', theme: 'purple', pages: [] });
    expect(doc.forkable).toBe(true);
  });

  it('coerces an invalid embedMode to snap-native but leaves undefined alone', () => {
    const bad = clampSnap({ version: 2, title: 't', theme: 'purple', pages: [], embedMode: 'bogus' as never });
    expect(bad.embedMode).toBe('snap-native');
    const none = clampSnap({ version: 2, title: 't', theme: 'purple', pages: [] });
    expect(none.embedMode).toBeUndefined();
  });

  it('preserves version, title, theme, confetti, coin and runs blocks through clampBlock', () => {
    const doc = clampSnap({
      version: 1, title: 'Keep', theme: 'amber', confetti: true,
      pages: [{ id: 'home', blocks: [{ type: 'text', content: 'x'.repeat(500) }] }],
    });
    expect(doc.version).toBe(1);
    expect(doc.title).toBe('Keep');
    expect(doc.theme).toBe('amber');
    expect(doc.confetti).toBe(true);
    expect((doc.pages[0].blocks[0] as { type: 'text'; content: string }).content.length).toBe(320);
  });
});
