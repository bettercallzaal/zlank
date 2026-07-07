import { describe, it, expect } from 'vitest';
import { encodeSnap, decodeSnap } from './encode';
import type { SnapDoc } from './blocks';

describe('encode/decode v2', () => {
  it('round-trips a v2 doc with all new fields', () => {
    const doc: SnapDoc = {
      version: 2,
      title: 'World Cup',
      theme: 'blue',
      parentId: 'src-snap',
      partner: { id: 'footy', name: 'Footy App', attribution: true },
      forkable: true,
      embedMode: 'iframe',
      dataSource: [{ id: 'score', kind: 'rest', url: 'https://api.x.com/s', refreshSec: 30 }],
      pages: [{ id: 'home', blocks: [] }],
    };
    const encoded = encodeSnap(doc);
    const decoded = decodeSnap(encoded);
    expect(decoded).not.toBeNull();
    expect(decoded?.version).toBe(2);
    expect(decoded?.parentId).toBe('src-snap');
    expect(decoded?.partner?.id).toBe('footy');
    expect(decoded?.forkable).toBe(true);
    expect(decoded?.embedMode).toBe('iframe');
    expect(decoded?.dataSource?.[0].refreshSec).toBe(30);
  });

  it('keeps a v1 doc as v1 on decode with new fields undefined', () => {
    const v1Doc: SnapDoc = {
      version: 1,
      title: 'Legacy',
      theme: 'amber',
      pages: [{ id: 'home', blocks: [{ type: 'text', content: 'hi' }] }],
    };
    const encoded = encodeSnap(v1Doc);
    const decoded = decodeSnap(encoded);
    expect(decoded?.version).toBe(1);
    expect(decoded?.parentId).toBeUndefined();
    expect(decoded?.forkable).toBeUndefined();
    expect(decoded?.partner).toBeUndefined();
  });

  it('migrates the legacy single-page (blocks array) format', () => {
    const legacy = { version: 1, title: 'Old', theme: 'purple', blocks: [{ type: 'text', content: 'x' }] };
    const encoded = encodeSnap(legacy as unknown as SnapDoc);
    const decoded = decodeSnap(encoded);
    expect(decoded?.pages).toHaveLength(1);
    expect(decoded?.pages[0].id).toBe('home');
    expect(decoded?.pages[0].blocks).toHaveLength(1);
  });

  it('preserves coin on decode of a new-format doc', () => {
    const doc: SnapDoc = {
      version: 1,
      title: 'Coin Snap',
      theme: 'green',
      coin: { caip19: 'eip155:8453/erc20:0xabc', symbol: 'TEST' },
      pages: [{ id: 'home', blocks: [] }],
    };
    const decoded = decodeSnap(encodeSnap(doc));
    expect(decoded?.coin?.caip19).toBe('eip155:8453/erc20:0xabc');
    expect(decoded?.coin?.symbol).toBe('TEST');
  });

  it('returns null for an unparseable payload', () => {
    expect(decodeSnap('!!!not-base64!!!')).toBeNull();
  });
});
