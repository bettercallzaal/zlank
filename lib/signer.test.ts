import { describe, it, expect } from 'vitest';
import { canDelegate, delegateAction, isAction, V1_ALLOWED_ACTIONS } from './signer';

describe('canDelegate', () => {
  it('allows the v1 low-risk actions', () => {
    expect(canDelegate('like')).toBe(true);
    expect(canDelegate('follow')).toBe(true);
  });

  it('blocks higher-risk actions in v1', () => {
    expect(canDelegate('recast')).toBe(false);
    expect(canDelegate('compose-cast')).toBe(false);
    expect(canDelegate('subscribe')).toBe(false);
  });

  it('v1 allowlist is exactly like + follow', () => {
    expect([...V1_ALLOWED_ACTIONS].sort()).toEqual(['follow', 'like']);
  });
});

describe('isAction', () => {
  it('accepts known actions and rejects everything else', () => {
    expect(isAction('like')).toBe(true);
    expect(isAction('follow')).toBe(true);
    expect(isAction('delete-account')).toBe(false);
    expect(isAction(42)).toBe(false);
    expect(isAction(undefined)).toBe(false);
  });
});

describe('delegateAction', () => {
  it('rejects an action that is not in the allowlist', async () => {
    const result = await delegateAction('compose-cast', { fid: 1, snapId: 's' });
    expect(result.ok).toBe(false);
    expect(result.status).toBe('rejected');
  });

  it('reports unavailable - not success - for an allowed action (no signer infra in v1)', async () => {
    const result = await delegateAction('like', { fid: 1, snapId: 's' });
    expect(result.ok).toBe(false);
    expect(result.status).toBe('unavailable');
    expect(result.error).toMatch(/not yet configured/);
  });
});
