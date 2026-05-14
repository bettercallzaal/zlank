import { describe, it, expect } from 'vitest';
import type { SnapDoc } from './blocks';

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
