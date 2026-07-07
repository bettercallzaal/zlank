import { createClient } from '@farcaster/quick-auth';
import { getSnapOwner, claimSnapOwner } from './kv';

const client = createClient();

const QUICK_AUTH_DOMAIN = process.env.ZLANK_QUICK_AUTH_DOMAIN || 'zlank.online';

/**
 * Extract the caller's Farcaster FID from a request.
 *
 * Reads the `Authorization: Bearer <token>` header (Farcaster Quick Auth JWT
 * issued by the Mini App SDK). Verifies the token's signature against the
 * Farcaster auth server's JWKS. Returns the FID on success, undefined otherwise.
 *
 * Returns undefined silently for missing/invalid tokens so callers can decide
 * whether to fail open (read-only routes) or fail closed (write routes).
 */
export async function extractFid(req: Request): Promise<number | undefined> {
  const authHeader = req.headers.get('authorization') ?? '';
  const m = /^Bearer\s+(\S+)$/.exec(authHeader);
  if (!m) return undefined;
  const token = m[1];
  try {
    const result = await client.verifyJwt({ token, domain: QUICK_AUTH_DOMAIN });
    const fid = result.sub;
    if (typeof fid === 'number' && Number.isInteger(fid) && fid >= 1) {
      return fid;
    }
    return undefined;
  } catch {
    return undefined;
  }
}

/** True if the caller presented the admin shared secret. */
export function isAdmin(req: Request): boolean {
  const expected = process.env.ZLANK_ADMIN_SECRET;
  if (!expected) return false;
  const header = req.headers.get('authorization') ?? '';
  const m = /^Bearer\s+(\S+)$/.exec(header);
  return !!m && m[1] === expected;
}

export type AuthResult =
  | { ok: true; via: 'admin' | 'owner' | 'first-claim'; fid?: number }
  | { ok: false; reason: 'no_token' | 'invalid_token' | 'not_owner'; fid?: number };

/**
 * Authorize a caller to perform an owner-level action on a snap.
 *
 * Order of checks:
 *  1. Admin secret bypass (legacy snaps + ops use)
 *  2. Owner FID match (snap has stored owner = caller's FID)
 *  3. First-claim wins (snap has no owner, caller's FID becomes owner)
 *
 * Anonymous + non-owner callers get { ok: false, reason }.
 */
export async function authorizeOwner(snapId: string, req: Request): Promise<AuthResult> {
  if (isAdmin(req)) return { ok: true, via: 'admin' };

  const fid = await extractFid(req);
  if (!fid) {
    const header = req.headers.get('authorization') ?? '';
    return {
      ok: false,
      reason: header ? 'invalid_token' : 'no_token',
    };
  }

  const owner = await getSnapOwner(snapId);
  if (owner === null) {
    // Snap has no owner yet (legacy or just-created). First valid FID claims it.
    await claimSnapOwner(snapId, fid);
    return { ok: true, via: 'first-claim', fid };
  }
  if (owner === fid) return { ok: true, via: 'owner', fid };
  return { ok: false, reason: 'not_owner', fid };
}
