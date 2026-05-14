import type { SnapDoc, Block } from './blocks.js';

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
    const raw = JSON.parse(json);
    if (raw?.version !== 1 && raw?.version !== 2) return null;

    // Migrate old single-page format (blocks array) to new multi-page format
    const doc = migrateSnapDoc(raw);
    return doc;
  } catch {
    return null;
  }
}

function migrateSnapDoc(raw: unknown): SnapDoc | null {
  if (typeof raw !== 'object' || raw === null) return null;

  const doc = raw as Record<string, unknown>;
  const version = doc.version;

  if ((version !== 1 && version !== 2) || !doc.title || !doc.theme) return null;

  // v2 fields are carried through verbatim; they are clamped at save time, not
  // here. decodeSnap is a structural migration only.
  const v2 = {
    parentId: doc.parentId as string | undefined,
    partner: doc.partner as SnapDoc['partner'],
    forkable: doc.forkable as boolean | undefined,
    embedMode: doc.embedMode as SnapDoc['embedMode'],
    dataSource: doc.dataSource as SnapDoc['dataSource'],
  };

  // Old format has doc.blocks (array)
  if (Array.isArray(doc.blocks)) {
    return {
      version: version as SnapDoc['version'],
      title: String(doc.title),
      theme: doc.theme as SnapDoc['theme'],
      pages: [
        {
          id: 'home',
          blocks: doc.blocks as Block[],
        },
      ],
      confetti: doc.confetti as boolean | undefined,
      coin: doc.coin as SnapDoc['coin'],
      ...v2,
    };
  }

  // New format has doc.pages (array of SnapPage)
  if (Array.isArray(doc.pages)) {
    return {
      version: version as SnapDoc['version'],
      title: String(doc.title),
      theme: doc.theme as SnapDoc['theme'],
      pages: doc.pages as SnapDoc['pages'],
      confetti: doc.confetti as boolean | undefined,
      coin: doc.coin as SnapDoc['coin'],
      ...v2,
    };
  }

  return null;
}
