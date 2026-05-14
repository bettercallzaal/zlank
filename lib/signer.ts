// Delegated-action authorization gate.
//
// The Farcaster scoped-signer FIP is not ratified, and this codebase has no
// managed-signer infrastructure, so v1 cannot actually execute writes on a
// viewer's behalf. What v1 DOES ship is the authorization model: a strict
// allowlist of low-risk actions and an honest delegateAction that reports
// "unavailable" rather than faking success. When a signer is wired up, only
// delegateAction's body changes - the gate and the endpoint contract stay.

export type Action = 'like' | 'follow' | 'recast' | 'compose-cast' | 'subscribe';

// v1 permits only low-risk, read-cost actions. recast/compose-cast/subscribe
// stay blocked until scoped signers exist.
export const V1_ALLOWED_ACTIONS: readonly Action[] = ['like', 'follow'];

const ALL_ACTIONS: readonly Action[] = ['like', 'follow', 'recast', 'compose-cast', 'subscribe'];

export function isAction(value: unknown): value is Action {
  return typeof value === 'string' && (ALL_ACTIONS as readonly string[]).includes(value);
}

export interface DelegateContext {
  /** FID of the viewer the action would be performed on behalf of. */
  fid: number;
  /** Snap the action originated from (for logging / rate-limit scoping). */
  snapId: string;
}

/** True if the action is in the v1 allowlist. */
export function canDelegate(action: Action): boolean {
  return V1_ALLOWED_ACTIONS.includes(action);
}

export interface DelegateResult {
  ok: boolean;
  status: 'executed' | 'rejected' | 'unavailable';
  error?: string;
}

/**
 * Attempt a delegated action. v1 never executes - it gates the action against
 * the allowlist and otherwise reports "unavailable" honestly. Callers must not
 * treat a non-executed result as success.
 */
export async function delegateAction(
  action: Action,
  _ctx: DelegateContext,
): Promise<DelegateResult> {
  if (!canDelegate(action)) {
    return { ok: false, status: 'rejected', error: `action "${action}" is not permitted in v1` };
  }
  // No managed-signer infrastructure yet. Report unavailable rather than
  // pretending the like/follow happened.
  return {
    ok: false,
    status: 'unavailable',
    error: 'delegated action execution is not yet configured',
  };
}
