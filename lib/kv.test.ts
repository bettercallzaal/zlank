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
} from './kv';

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
