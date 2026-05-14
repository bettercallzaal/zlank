import { describe, it, expect, vi } from 'vitest';

const { listSnapsByPartner } = vi.hoisted(() => ({
  listSnapsByPartner: vi.fn(async () => ['snap-1', 'snap-2']),
}));
vi.mock('@/lib/kv', () => ({ listSnapsByPartner }));

import { GET } from './route';

describe('GET /api/snaps/search', () => {
  it('returns snaps for a partner query', async () => {
    const res = await GET(new Request('http://x/api/snaps/search?partner=footy'));
    expect(res.status).toBe(200);
    const json = (await res.json()) as { partner: string; snaps: string[]; count: number };
    expect(json.partner).toBe('footy');
    expect(json.snaps).toEqual(['snap-1', 'snap-2']);
    expect(json.count).toBe(2);
    expect(listSnapsByPartner).toHaveBeenCalledWith('footy', 100);
  });

  it('returns 400 when the partner param is missing', async () => {
    const res = await GET(new Request('http://x/api/snaps/search'));
    expect(res.status).toBe(400);
  });
});
