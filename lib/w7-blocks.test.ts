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

describe('parlayBuilder block', () => {
  it('clamps candidates to 8 and maxLegs to [1,8]', () => {
    const clamped = clampBlock({
      type: 'parlayBuilder',
      title: 'T',
      candidates: Array.from({ length: 12 }, (_, i) => ({ id: `c${i}`, label: `L${i}`, odds: '1.5' })),
      maxLegs: 99,
    });
    if (clamped.type !== 'parlayBuilder') throw new Error('wrong type');
    expect(clamped.candidates).toHaveLength(8);
    expect(clamped.maxLegs).toBe(8);
  });

  it('renders the title and candidates in the Snap and embed', async () => {
    const doc = snapWith({
      type: 'parlayBuilder',
      title: 'Build it',
      candidates: [{ id: 'a', label: 'Pick A', odds: '2.0' }],
    });
    expect(JSON.stringify(docToSnap(doc, 'https://zlank.online/api/snap/x'))).toContain('Build it');
    expect(await docToEmbedHtml(doc)).toContain('Pick A');
  });
});

describe('agentChat block', () => {
  it('clamps systemPrompt to 1024 chars and drops invalid persona/tools', () => {
    const clamped = clampBlock({
      type: 'agentChat',
      title: 'T',
      systemPrompt: 'x'.repeat(2000),
      persona: 'wizard' as never,
      tools: ['fetch-score', 'hack-the-mainframe' as never],
    });
    if (clamped.type !== 'agentChat') throw new Error('wrong type');
    expect(clamped.systemPrompt.length).toBe(1024);
    expect(clamped.persona).toBeUndefined();
    expect(clamped.tools).toEqual(['fetch-score']);
  });

  it('renders a chat surface in the Snap', () => {
    const doc = snapWith({ type: 'agentChat', title: 'Ask me', systemPrompt: 'be helpful' });
    expect(JSON.stringify(docToSnap(doc, 'https://zlank.online/api/snap/x'))).toContain('Ask me');
  });
});

describe('mintButton + subscribeButton blocks', () => {
  it('clamps mintButton chainId to an integer and validates partnerId', () => {
    const clamped = clampBlock({
      type: 'mintButton',
      label: 'Mint',
      contractAddress: '0xabc',
      chainId: 8453.7,
      partnerId: 'bogus' as never,
    });
    if (clamped.type !== 'mintButton') throw new Error('wrong type');
    expect(clamped.chainId).toBe(8453);
    expect(clamped.partnerId).toBeUndefined();
  });

  it('clamps subscribeButton durationDays to [1,3650]', () => {
    const clamped = clampBlock({
      type: 'subscribeButton',
      label: 'Sub',
      subContractAddress: '0xabc',
      chainId: 8453,
      durationDays: 99999,
      priceCurrency: 'USDC',
    });
    if (clamped.type !== 'subscribeButton') throw new Error('wrong type');
    expect(clamped.durationDays).toBe(3650);
  });

  it('renders both as display items in the Snap', () => {
    const mint = snapWith({ type: 'mintButton', label: 'Mint Now', contractAddress: '0xabc', chainId: 8453 });
    const sub = snapWith({
      type: 'subscribeButton', label: 'Join', subContractAddress: '0xabc', chainId: 8453,
      durationDays: 30, priceCurrency: 'ETH',
    });
    expect(JSON.stringify(docToSnap(mint, 'https://zlank.online/api/snap/x'))).toContain('Mint Now');
    expect(JSON.stringify(docToSnap(sub, 'https://zlank.online/api/snap/x'))).toContain('Join');
  });
});

describe('bountyEscrow block', () => {
  it('clamps amountUsd to [0,100000]', () => {
    const clamped = clampBlock({
      type: 'bountyEscrow',
      title: 'T',
      description: 'D',
      amountUsd: 999999,
    });
    if (clamped.type !== 'bountyEscrow') throw new Error('wrong type');
    expect(clamped.amountUsd).toBe(100000);
  });

  it('renders title, amount, and a bountycaster link in the embed', async () => {
    const doc = snapWith({
      type: 'bountyEscrow',
      title: 'Fix the bug',
      description: 'Details here',
      amountUsd: 250,
      bountycasterUrl: 'https://bountycaster.xyz/bounty/1',
    });
    const html = await docToEmbedHtml(doc);
    expect(html).toContain('Fix the bug');
    expect(html).toContain('$250');
    expect(html).toContain('bountycaster.xyz');
  });
});

describe('marketEmbed block', () => {
  it('defaults an invalid source to polymarket', () => {
    const clamped = clampBlock({ type: 'marketEmbed', marketSlug: 's', source: 'fake' as never });
    if (clamped.type !== 'marketEmbed') throw new Error('wrong type');
    expect(clamped.source).toBe('polymarket');
  });

  it('renders a market link in the Snap', () => {
    const doc = snapWith({ type: 'marketEmbed', marketSlug: 'big-game', source: 'polymarket' });
    expect(JSON.stringify(docToSnap(doc, 'https://zlank.online/api/snap/x'))).toContain(
      'polymarket.com/event/big-game',
    );
  });
});

describe('tokenDeploy block', () => {
  it('uppercases and caps the symbol at 8 chars', () => {
    const clamped = clampBlock({
      type: 'tokenDeploy',
      name: 'My Token',
      symbol: 'verylongsymbol',
    });
    if (clamped.type !== 'tokenDeploy') throw new Error('wrong type');
    expect(clamped.symbol).toBe('VERYLONG');
  });

  it('renders the token name and a deploy link', async () => {
    const doc = snapWith({ type: 'tokenDeploy', name: 'CoolCoin', symbol: 'COOL' });
    expect(JSON.stringify(docToSnap(doc, 'https://zlank.online/api/snap/x'))).toContain('CoolCoin');
    expect(await docToEmbedHtml(doc)).toContain('clanker.world/deploy');
  });
});

describe('coinPost block', () => {
  it('strips a non-HTTPS zoraUrl', () => {
    const clamped = clampBlock({ type: 'coinPost', postId: 'p1', zoraUrl: 'http://zora.co/x' });
    if (clamped.type !== 'coinPost') throw new Error('wrong type');
    expect(clamped.zoraUrl).toBeUndefined();
  });

  it('renders a buy link when zoraUrl is set', () => {
    const doc = snapWith({
      type: 'coinPost',
      postId: 'p1',
      buyButton: true,
      zoraUrl: 'https://zora.co/coin/p1',
    });
    expect(JSON.stringify(docToSnap(doc, 'https://zlank.online/api/snap/x'))).toContain(
      'zora.co/coin/p1',
    );
  });
});
