import { lookup } from 'node:dns/promises';
import net from 'node:net';
import { isHttpsUrl } from './blocks';

// SSRF guard for server-side fetches of user-authored URLs (live data sources).
// isHttpsUrl alone is not enough: an attacker can point a dataSource at
// https://169.254.169.254/ (cloud metadata) or https://10.0.0.5/ (internal
// service). This resolves the hostname and rejects any URL whose literal or
// resolved address falls in a private, loopback, link-local, or reserved range.

/** True for IPv4 addresses that must not be fetched server-side. */
export function isPrivateIPv4(ip: string): boolean {
  const parts = ip.split('.').map((p) => Number(p));
  if (parts.length !== 4 || parts.some((p) => !Number.isInteger(p) || p < 0 || p > 255)) {
    return true; // malformed - treat as unsafe
  }
  const [a, b] = parts;
  return (
    a === 0 || // "this" network
    a === 10 || // private
    a === 127 || // loopback
    (a === 169 && b === 254) || // link-local (incl. cloud metadata)
    (a === 172 && b >= 16 && b <= 31) || // private
    (a === 192 && b === 168) || // private
    a >= 224 // multicast + reserved
  );
}

/** True for IPv6 addresses that must not be fetched server-side. */
export function isPrivateIPv6(ip: string): boolean {
  const lower = ip.toLowerCase();
  if (lower === '::1' || lower === '::') return true; // loopback / unspecified
  if (lower.startsWith('::ffff:')) {
    // IPv4-mapped IPv6 - check the embedded v4 address.
    const v4 = lower.slice('::ffff:'.length);
    return net.isIP(v4) === 4 ? isPrivateIPv4(v4) : true;
  }
  // fc00::/7 unique-local, fe80::/10 link-local.
  return lower.startsWith('fc') || lower.startsWith('fd') || lower.startsWith('fe8') ||
    lower.startsWith('fe9') || lower.startsWith('fea') || lower.startsWith('feb');
}

const BLOCKED_HOST_SUFFIXES = ['.localhost', '.local', '.internal', '.lan'];

/**
 * True only if url is HTTPS and its host resolves entirely to public,
 * routable addresses. Resolution failures and any private/reserved address
 * resolve to false - callers must not fetch when this returns false.
 */
export async function isPublicHttpsUrl(url: string | undefined): Promise<boolean> {
  if (!isHttpsUrl(url)) return false;
  let host: string;
  try {
    host = new URL(url as string).hostname;
  } catch {
    return false;
  }
  if (!host) return false;
  const lower = host.toLowerCase();
  if (lower === 'localhost' || BLOCKED_HOST_SUFFIXES.some((s) => lower.endsWith(s))) {
    return false;
  }

  // Literal IP - check directly, no DNS.
  const ipKind = net.isIP(host);
  if (ipKind === 4) return !isPrivateIPv4(host);
  if (ipKind === 6) return !isPrivateIPv6(host);

  // Hostname - resolve and reject if ANY address is private.
  try {
    const addrs = await lookup(host, { all: true });
    if (addrs.length === 0) return false;
    for (const { address, family } of addrs) {
      if (family === 4 && isPrivateIPv4(address)) return false;
      if (family === 6 && isPrivateIPv6(address)) return false;
    }
    return true;
  } catch {
    return false;
  }
}
