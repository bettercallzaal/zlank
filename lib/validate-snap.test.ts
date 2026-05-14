import { describe, it, expect } from 'vitest';
import { validateDoc } from './validate-snap';
import type { SnapDoc } from './blocks';

// Uses pages: [] so the per-page render/envelope checks do not run - this
// isolates the doc-level v2 field validation added by W1.4.
function v2(partial: Partial<SnapDoc>): SnapDoc {
  return { version: 2, title: 't', theme: 'purple', pages: [], ...partial };
}

describe('validateDoc v2 field checks', () => {
  it('rejects a non-HTTPS dataSource url', () => {
    const r = validateDoc(v2({ dataSource: [{ id: 'x', kind: 'rest', url: 'http://insecure.com' }] }));
    expect(r.ok).toBe(false);
    expect(r.errors.some((e) => e.includes('dataSource') && e.includes('HTTPS'))).toBe(true);
  });

  it('rejects dataSource kind=rest with no url', () => {
    const r = validateDoc(v2({ dataSource: [{ id: 'x', kind: 'rest' }] }));
    expect(r.ok).toBe(false);
    expect(r.errors.some((e) => e.includes('dataSource.url required'))).toBe(true);
  });

  it('rejects a dataSource with an empty id', () => {
    const r = validateDoc(v2({ dataSource: [{ id: '', kind: 'static', staticValue: 1 }] }));
    expect(r.ok).toBe(false);
    expect(r.errors.some((e) => e.includes('dataSource.id'))).toBe(true);
  });

  it('rejects refreshSec out of [10,3600] bounds', () => {
    const low = validateDoc(v2({ dataSource: [{ id: 'x', kind: 'rest', url: 'https://x.com', refreshSec: 5 }] }));
    expect(low.ok).toBe(false);
    const high = validateDoc(v2({ dataSource: [{ id: 'x', kind: 'rest', url: 'https://x.com', refreshSec: 9999 }] }));
    expect(high.ok).toBe(false);
  });

  it('rejects a partner missing id or name', () => {
    const r = validateDoc(v2({ partner: { id: '', name: '', attribution: true } }));
    expect(r.ok).toBe(false);
    expect(r.errors.some((e) => e.includes('partner.id'))).toBe(true);
  });

  it('rejects a non-HTTPS partner url', () => {
    const r = validateDoc(v2({ partner: { id: 'p', name: 'P', attribution: true, url: 'http://x.com' } }));
    expect(r.ok).toBe(false);
    expect(r.errors.some((e) => e.includes('partner.url'))).toBe(true);
  });

  it('rejects an invalid embedMode', () => {
    const r = validateDoc(v2({ embedMode: 'bogus' as never }));
    expect(r.ok).toBe(false);
    expect(r.errors.some((e) => e.includes('embedMode'))).toBe(true);
  });

  it('accepts a well-formed v2 doc', () => {
    const r = validateDoc(
      v2({
        partner: { id: 'footy', name: 'Footy App', attribution: true, url: 'https://fc-footy.vercel.app' },
        dataSource: [{ id: 'score', kind: 'rest', url: 'https://api.x.com/s', refreshSec: 30 }],
        embedMode: 'iframe',
        parentId: 'parent-abc',
      }),
    );
    expect(r.ok).toBe(true);
    expect(r.errors).toHaveLength(0);
  });

  it('accepts a plain v1 doc with no v2 fields', () => {
    const r = validateDoc({ version: 1, title: 't', theme: 'blue', pages: [] });
    expect(r.ok).toBe(true);
  });
});
