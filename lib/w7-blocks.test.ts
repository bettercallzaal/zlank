import { describe, it, expect } from 'vitest';
import { clampBlock } from './blocks';
import { docToSnap } from './snap-spec';
import { docToEmbedHtml } from './embed-spec';
import type { SnapDoc, Block } from './blocks';

function snapWith(block: Block, dataSource?: SnapDoc['dataSource']): SnapDoc {
  return {
    version: 2,
    title: 't',
    theme: 'purple',
    dataSource,
    pages: [{ id: 'home', blocks: [block] }],
  };
}

describe('liveScore block', () => {
  it('clamps home/away to 30 chars and strips non-HTTPS logos', () => {
    const clamped = clampBlock({
      type: 'liveScore',
      home: 'H'.repeat(50),
      away: 'A'.repeat(50),
      homeLogoUrl: 'http://insecure.com/logo.png',
      awayLogoUrl: 'https://cdn.example.com/a.png',
      dataSourceId: 'match',
    });
    if (clamped.type !== 'liveScore') throw new Error('wrong type');
    expect(clamped.home.length).toBe(30);
    expect(clamped.away.length).toBe(30);
    expect(clamped.homeLogoUrl).toBeUndefined();
    expect(clamped.awayLogoUrl).toBe('https://cdn.example.com/a.png');
  });

  it('renders the live score from a resolved data source in the Snap', () => {
    const doc = snapWith(
      { type: 'liveScore', home: 'Arsenal', away: 'Chelsea', dataSourceId: 'match', showMinute: true },
      [{ id: 'match', kind: 'static', staticValue: { home: 2, away: 1, minute: 67, status: 'LIVE' } }],
    );
    // docToSnap is sync; pass the static value through resolvedData directly.
    const snap = docToSnap(doc, 'https://zlank.online/api/snap/x', {
      resolvedData: { match: { home: 2, away: 1, minute: 67, status: 'LIVE' } },
    });
    const json = JSON.stringify(snap);
    expect(json).toContain('Arsenal 2 - 1 Chelsea');
    expect(json).toContain("67'");
    expect(json).toContain('LIVE');
  });

  it('falls back to "home vs away" when no score data is resolved', () => {
    const doc = snapWith({ type: 'liveScore', home: 'A', away: 'B', dataSourceId: 'match' });
    const snap = docToSnap(doc, 'https://zlank.online/api/snap/x');
    expect(JSON.stringify(snap)).toContain('A vs B');
  });

  it('renders in the embed HTML', async () => {
    const doc = snapWith(
      { type: 'liveScore', home: 'A', away: 'B', dataSourceId: 'm' },
      [{ id: 'm', kind: 'static', staticValue: { home: 3, away: 0 } }],
    );
    const html = await docToEmbedHtml(doc);
    expect(html).toContain('A 3 - 0 B');
  });
});

describe('oddsTicker block', () => {
  it('clamps legs to 6 and strips a non-HTTPS bookmakerUrl', () => {
    const clamped = clampBlock({
      type: 'oddsTicker',
      market: 'M',
      legs: Array.from({ length: 10 }, (_, i) => ({ label: `L${i}`, odds: '1.5' })),
      bookmakerUrl: 'http://book.example',
    });
    if (clamped.type !== 'oddsTicker') throw new Error('wrong type');
    expect(clamped.legs).toHaveLength(6);
    expect(clamped.bookmakerUrl).toBeUndefined();
  });

  it('renders the market and legs in the Snap', () => {
    const doc = snapWith({
      type: 'oddsTicker',
      market: 'Match Winner',
      legs: [
        { label: 'Home', odds: '2.10' },
        { label: 'Away', odds: '3.20' },
      ],
      bookmakerUrl: 'https://book.example/slip',
    });
    const json = JSON.stringify(docToSnap(doc, 'https://zlank.online/api/snap/x'));
    expect(json).toContain('Match Winner');
    expect(json).toContain('Home  2.10');
    expect(json).toContain('https://book.example/slip');
  });

  it('renders in the embed HTML', async () => {
    const doc = snapWith({
      type: 'oddsTicker',
      market: 'Winner',
      legs: [{ label: 'A', odds: '1.9' }],
    });
    const html = await docToEmbedHtml(doc);
    expect(html).toContain('Winner');
    expect(html).toContain('1.9');
  });
});
