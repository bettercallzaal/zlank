import { decodeSnap } from './encode';
import { isKvAvailable, isShortId, loadSnap } from './kv';
import type { SnapDoc } from './blocks';

// Resolve a URL identifier to a SnapDoc. Tries short-ID lookup in KV first
// (if available), then falls back to base64 decoding. This way old URLs
// (long base64) and new URLs (short ID) both work from the same path.

export async function resolveSnap(idOrEncoded: string): Promise<SnapDoc | null> {
  if (isKvAvailable() && isShortId(idOrEncoded)) {
    const doc = await loadSnap(idOrEncoded);
    if (doc) return doc;
  }
  return decodeSnap(idOrEncoded);
}
