import type { SnapDoc } from './blocks.js';

// base64url encode a Snap doc into the URL slug.
// No DB v0 - the snap config IS the URL.

export function encodeSnap(doc: SnapDoc): string {
  const json = JSON.stringify(doc);
  const b64 = Buffer.from(json, 'utf8').toString('base64');
  return b64.replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '');
}

export function decodeSnap(encoded: string): SnapDoc | null {
  try {
    const padded = encoded.replace(/-/g, '+').replace(/_/g, '/');
    const padding = padded.length % 4 === 0 ? '' : '='.repeat(4 - (padded.length % 4));
    const json = Buffer.from(padded + padding, 'base64').toString('utf8');
    const doc = JSON.parse(json);
    if (doc?.version !== 1 || !Array.isArray(doc.blocks)) return null;
    return doc as SnapDoc;
  } catch {
    return null;
  }
}
