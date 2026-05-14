import { describe, it, expect, vi, beforeEach } from 'vitest';
import type { SnapDoc } from '@/lib/blocks';

const { loadSnapDoc, incrementPartnerStat } = vi.hoisted(() => ({
  loadSnapDoc: vi.fn<(id: string) => Promise<SnapDoc | null>>(),
  incrementPartnerStat: vi.fn(async () => {}),
}));

vi.mock('@/lib/kv', () => ({ loadSnapDoc, incrementPartnerStat }));

import { POST } from './route';

function ctx(id: string) {
  return { params: Promise.resolve({ id }) };
}

const baseDoc: SnapDoc = {
  version: 2,
  title: 'Source',
  theme: 'purple',
  partner: { id: 'footy', name: 'Footy App', attribution: true },
  pages: [{ id: 'home', blocks: [{ type: 'text', content: 'hi' }] }],
};

beforeEach(() => {
  loadSnapDoc.mockReset();
});

describe('POST /api/snaps/[id]/fork', () => {
  it('returns the source doc with parentId set to the source id', async () => {
    loadSnapDoc.mockResolvedValue(baseDoc);
    const res = await POST(new Request('http://x'), ctx('parent-id'));
    expect(res.status).toBe(200);
    const json = (await res.json()) as { doc: SnapDoc };
    expect(json.doc.parentId).toBe('parent-id');
    expect(json.doc.title).toBe('Source');
    expect(json.doc.partner?.id).toBe('footy');
    expect(json.doc.pages).toHaveLength(1);
  });

  it('returns 404 when the source snap does not exist', async () => {
    loadSnapDoc.mockResolvedValue(null);
    const res = await POST(new Request('http://x'), ctx('missing'));
    expect(res.status).toBe(404);
  });

  it('returns 403 when the source doc has forkable === false', async () => {
    loadSnapDoc.mockResolvedValue({ ...baseDoc, forkable: false });
    const res = await POST(new Request('http://x'), ctx('locked'));
    expect(res.status).toBe(403);
  });

  it('allows forking when forkable is true or undefined', async () => {
    loadSnapDoc.mockResolvedValue({ ...baseDoc, forkable: undefined });
    const a = await POST(new Request('http://x'), ctx('a'));
    expect(a.status).toBe(200);
    loadSnapDoc.mockResolvedValue({ ...baseDoc, forkable: true });
    const b = await POST(new Request('http://x'), ctx('b'));
    expect(b.status).toBe(200);
  });
});
