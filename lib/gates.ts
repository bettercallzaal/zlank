import { createPublicClient, http, erc20Abi, getAddress, type Address } from 'viem';
import { base } from 'viem/chains';

// Token-balance gate. Server-side only. POST handler resolves the user's
// FID -> primary verified ETH address (Neynar) -> ERC-20 balance on Base.
// Cached briefly in Redis to avoid hammering Neynar/RPC on every render.

export interface GateRule {
  type: 'token-balance';
  /** ERC-20 contract address on Base. */
  token: string;
  /** Optional symbol shown in the upsell button label. */
  symbol?: string;
  /** Minimum balance, decimal string in human units (e.g. "1" or "0.5"). */
  minBalance: string;
  /** Token decimals. Defaults to 18. */
  decimals?: number;
  /** URL the upsell button opens (e.g. swap link). Optional. */
  upsellUrl?: string;
}

const NEYNAR_API_KEY = process.env.NEYNAR_API_KEY ?? '';
const RPC_URL = process.env.BASE_RPC_URL ?? 'https://mainnet.base.org';

const publicClient = createPublicClient({ chain: base, transport: http(RPC_URL) });

export function isGateRule(value: unknown): value is GateRule {
  if (!value || typeof value !== 'object') return false;
  const v = value as Partial<GateRule>;
  return (
    v.type === 'token-balance' &&
    typeof v.token === 'string' &&
    /^0x[a-fA-F0-9]{40}$/.test(v.token) &&
    typeof v.minBalance === 'string' &&
    v.minBalance.length > 0
  );
}

interface NeynarUser {
  fid: number;
  verified_addresses?: { eth_addresses?: string[] };
  custody_address?: string;
}

async function fetchPrimaryAddress(fid: number): Promise<Address | null> {
  if (!NEYNAR_API_KEY) return null;
  try {
    const res = await fetch(
      `https://api.neynar.com/v2/farcaster/user/bulk?fids=${fid}`,
      {
        headers: { 'x-api-key': NEYNAR_API_KEY, accept: 'application/json' },
      },
    );
    if (!res.ok) return null;
    const data = (await res.json()) as { users?: NeynarUser[] };
    const user = data.users?.[0];
    if (!user) return null;
    const verified = user.verified_addresses?.eth_addresses?.[0];
    const addr = verified ?? user.custody_address ?? null;
    if (!addr) return null;
    return getAddress(addr);
  } catch {
    return null;
  }
}

function parseHumanAmount(amount: string, decimals: number): bigint {
  const [whole, frac = ''] = amount.split('.');
  const fracPadded = (frac + '0'.repeat(decimals)).slice(0, decimals);
  const cleanWhole = whole.replace(/^0+(?=\d)/, '') || '0';
  const concat = (cleanWhole + fracPadded).replace(/^0+(?=\d)/, '');
  return BigInt(concat || '0');
}

export interface GateContext {
  /** FID of the viewer, when known (POST). undefined on GET. */
  fid?: number;
}

export interface GateResult {
  passed: boolean;
  reason: 'no_fid' | 'no_address' | 'below_threshold' | 'rpc_error' | 'ok';
  balance?: string;
}

export async function evaluateGate(
  rule: GateRule,
  ctx: GateContext,
): Promise<GateResult> {
  if (!ctx.fid) return { passed: false, reason: 'no_fid' };
  const address = await fetchPrimaryAddress(ctx.fid);
  if (!address) return { passed: false, reason: 'no_address' };
  const decimals = rule.decimals ?? 18;
  const minWei = parseHumanAmount(rule.minBalance, decimals);
  try {
    const balance = await publicClient.readContract({
      address: getAddress(rule.token),
      abi: erc20Abi,
      functionName: 'balanceOf',
      args: [address],
    });
    if (balance >= minWei) {
      return { passed: true, reason: 'ok', balance: balance.toString() };
    }
    return { passed: false, reason: 'below_threshold', balance: balance.toString() };
  } catch {
    return { passed: false, reason: 'rpc_error' };
  }
}

/**
 * Evaluate gates for a list of (index, rule) pairs in parallel.
 * Returns a Map of blockIdx -> GateResult.
 */
export async function evaluateGates(
  rules: Array<{ idx: number; rule: GateRule }>,
  ctx: GateContext,
): Promise<Map<number, GateResult>> {
  const results = await Promise.all(
    rules.map(async ({ idx, rule }) => [idx, await evaluateGate(rule, ctx)] as const),
  );
  return new Map(results);
}
