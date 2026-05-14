import { describe, it, expect, vi } from 'vitest';

// Replace node-redis with the in-memory fake. createClient must return the
// SAME instance every call so kv.ts's module-level singleton stays consistent
// across the functions under test.
vi.mock('redis', async () => {
  const { makeFakeRedis } = await import('./test-utils/fake-redis');
  const shared = makeFakeRedis();
  return { createClient: () => shared };
});

import {
  recordFork,
  getForkChildren,
  getForkParent,
  getForkAncestors,
  recordPartnerSnap,
  listSnapsByPartner,
  saveSnap,
  loadSnapDoc,
  loadSnap,
  incrementPartnerStat,
  getPartnerStats,
} from './kv';
import type { SnapDoc } from './blocks';

describe('fork-tree KV indexes', () => {
  it('records and retrieves fork children', async () => {
    await recordFork('parent-a', 'child-1');
    await recordFork('parent-a', 'child-2');
    const kids = await getForkChildren('parent-a');
    expect(kids).toEqual(expect.arrayContaining(['child-1', 'child-2']));
    expect(kids).toHaveLength(2);
  });

  it('records the parent pointer for a child', async () => {
    await recordFork('parent-b', 'child-b');
    expect(await getForkParent('child-b')).toBe('parent-b');
    expect(await getForkParent('orphan')).toBeNull();
  });

  it('traces fork ancestors oldest-last', async () => {
    await recordFork('gp', 'p');
    await recordFork('p', 'c');
    expect(await getForkAncestors('c')).toEqual(['p', 'gp']);
    expect(await getForkAncestors('gp')).toEqual([]);
  });

  it('stops tracing at maxDepth to avoid cycles', async () => {
    await recordFork('loop', 'loop'); // self-parent
    const ancestors = await getForkAncestors('loop', 3);
    expect(ancestors).toHaveLength(3);
  });
});

describe('partner-scope KV index', () => {
  it('indexes snaps by partner', async () => {
    await recordPartnerSnap('footy', 'snap-1');
    await recordPartnerSnap('footy', 'snap-2');
    const snaps = await listSnapsByPartner('footy');
    expect(snaps).toEqual(expect.arrayContaining(['snap-1', 'snap-2']));
  });

  it('returns an empty list for an unknown partner', async () => {
    expect(await listSnapsByPartner('nobody')).toEqual([]);
  });

  it('caps the result list at the requested limit', async () => {
    for (let i = 0; i < 10; i++) await recordPartnerSnap('big', `s-${i}`);
    expect(await listSnapsByPartner('big', 4)).toHaveLength(4);
  });
});

describe('saveSnap / loadSnapDoc v2 round-trip', () => {
  it('persists and loads a v2 doc with all v2 fields intact', async () => {
    const doc: SnapDoc = {
      version: 2,
      title: 'V2 Snap',
      theme: 'green',
      partner: { id: 'footy', name: 'Footy App', attribution: true },
      parentId: 'origin-snap',
      forkable: false,
      embedMode: 'iframe',
      dataSource: [{ id: 'score', kind: 'rest', url: 'https://api.x.com/s', refreshSec: 30 }],
      pages: [{ id: 'home', blocks: [{ type: 'text', content: 'hi' }] }],
    };
    const id = await saveSnap(doc);
    const loadedDoc = await loadSnapDoc(id);
    expect(loadedDoc?.version).toBe(2);
    expect(loadedDoc?.partner?.id).toBe('footy');
    expect(loadedDoc?.parentId).toBe('origin-snap');
    expect(loadedDoc?.forkable).toBe(false);
    expect(loadedDoc?.embedMode).toBe('iframe');
    expect(loadedDoc?.dataSource?.[0].id).toBe('score');

    const loadedRender = await loadSnap(id);
    expect(loadedRender?.version).toBe(2);
    expect(loadedRender?.partner?.id).toBe('footy');
  });
});

describe('partner-scoped stats', () => {
  it('increments and reads views/forks/actions counters per partner', async () => {
    await incrementPartnerStat('clanker', 'views');
    await incrementPartnerStat('clanker', 'views');
    await incrementPartnerStat('clanker', 'forks');
    const stats = await getPartnerStats('clanker');
    expect(stats.views).toBe(2);
    expect(stats.forks).toBe(1);
    expect(stats.actions).toBe(0);
  });

  it('returns zeroed stats for an unknown partner', async () => {
    expect(await getPartnerStats('never-seen')).toEqual({ views: 0, forks: 0, actions: 0 });
  });

  it('keeps counters isolated between partners', async () => {
    await incrementPartnerStat('zora', 'actions');
    const zora = await getPartnerStats('zora');
    const footy = await getPartnerStats('footy-stats-iso');
    expect(zora.actions).toBe(1);
    expect(footy.actions).toBe(0);
  });
});
