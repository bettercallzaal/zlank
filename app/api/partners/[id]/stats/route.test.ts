import { describe, it, expect, vi } from 'vitest';

const { getPartnerStats } = vi.hoisted(() => ({
  getPartnerStats: vi.fn(async () => ({ views: 12, forks: 3, actions: 0 })),
}));
vi.mock('@/lib/kv', () => ({ getPartnerStats }));

import { GET } from './route';

function ctx(id: string) {
  return { params: Promise.resolve({ id }) };
}

describe('GET /api/partners/[id]/stats', () => {
  it('returns the partner stats with the partner id', async () => {
    const res = await GET(new Request('http://x'), ctx('footy'));
    expect(res.status).toBe(200);
    const json = (await res.json()) as { partnerId: string; views: number; forks: number };
    expect(json.partnerId).toBe('footy');
    expect(json.views).toBe(12);
    expect(json.forks).toBe(3);
    expect(getPartnerStats).toHaveBeenCalledWith('footy');
  });
});
