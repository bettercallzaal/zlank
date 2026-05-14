import { describe, it, expect } from 'vitest';
import { docToSnap, applyPlaceholders } from './snap-spec';
import { resolveDataSources } from './live-data';
import type { SnapDoc } from './blocks';

describe('applyPlaceholders', () => {
  it('substitutes ${data.X} with the resolved value', () => {
    expect(applyPlaceholders('Score: ${data.s}', { s: '2-1' })).toBe('Score: 2-1');
  });

  it('stringifies non-string values', () => {
    expect(applyPlaceholders('${data.o}', { o: { a: 1 } })).toBe('{"a":1}');
    expect(applyPlaceholders('${data.n}', { n: 42 })).toBe('42');
  });

  it('replaces missing or null values with empty string', () => {
    expect(applyPlaceholders('x${data.missing}y', {})).toBe('xy');
    expect(applyPlaceholders('x${data.z}y', { z: null })).toBe('xy');
  });

  it('leaves strings without placeholders untouched', () => {
    expect(applyPlaceholders('plain text', { s: '1' })).toBe('plain text');
  });
});

describe('docToSnap with resolvedData', () => {
  it('substitutes placeholders in text and header blocks', async () => {
    const doc: SnapDoc = {
      version: 2,
      title: 't',
      theme: 'purple',
      dataSource: [{ id: 'score', kind: 'static', staticValue: '2-1' }],
      pages: [
        {
          id: 'home',
          blocks: [
            { type: 'header', title: 'Match: ${data.score}', subtitle: 'now ${data.score}' },
            { type: 'text', content: 'Live score is ${data.score}' },
          ],
        },
      ],
    };
    const resolvedData = await resolveDataSources(doc.dataSource ?? []);
    const snap = docToSnap(doc, 'https://zlank.online/api/snap/abc', { resolvedData });
    const json = JSON.stringify(snap);
    expect(json).toContain('Match: 2-1');
    expect(json).toContain('now 2-1');
    expect(json).toContain('Live score is 2-1');
    expect(json).not.toContain('${data.score}');
  });

  it('leaves placeholders intact when no resolvedData is provided', () => {
    const doc: SnapDoc = {
      version: 2,
      title: 't',
      theme: 'purple',
      pages: [{ id: 'home', blocks: [{ type: 'text', content: 'no ${data.x} here' }] }],
    };
    const snap = docToSnap(doc, 'https://zlank.online/api/snap/abc');
    expect(JSON.stringify(snap)).toContain('no ${data.x} here');
  });
});
