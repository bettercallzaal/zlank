import { describe, it, expect } from 'vitest';
import { isPrivateIPv4, isPrivateIPv6, isPublicHttpsUrl } from './url-guard';

describe('isPrivateIPv4', () => {
  it('flags private, loopback, link-local, and reserved ranges', () => {
    expect(isPrivateIPv4('10.0.0.5')).toBe(true);
    expect(isPrivateIPv4('127.0.0.1')).toBe(true);
    expect(isPrivateIPv4('169.254.169.254')).toBe(true); // cloud metadata
    expect(isPrivateIPv4('172.16.0.1')).toBe(true);
    expect(isPrivateIPv4('172.31.255.255')).toBe(true);
    expect(isPrivateIPv4('192.168.1.1')).toBe(true);
    expect(isPrivateIPv4('0.0.0.0')).toBe(true);
    expect(isPrivateIPv4('224.0.0.1')).toBe(true);
  });
  it('allows public addresses', () => {
    expect(isPrivateIPv4('8.8.8.8')).toBe(false);
    expect(isPrivateIPv4('1.1.1.1')).toBe(false);
    expect(isPrivateIPv4('172.32.0.1')).toBe(false); // just outside private block
    expect(isPrivateIPv4('93.184.216.34')).toBe(false);
  });
  it('treats malformed input as unsafe', () => {
    expect(isPrivateIPv4('not-an-ip')).toBe(true);
    expect(isPrivateIPv4('999.999.999.999')).toBe(true);
    expect(isPrivateIPv4('10.0.0')).toBe(true);
  });
});

describe('isPrivateIPv6', () => {
  it('flags loopback, unique-local, link-local', () => {
    expect(isPrivateIPv6('::1')).toBe(true);
    expect(isPrivateIPv6('::')).toBe(true);
    expect(isPrivateIPv6('fc00::1')).toBe(true);
    expect(isPrivateIPv6('fd12:3456::1')).toBe(true);
    expect(isPrivateIPv6('fe80::1')).toBe(true);
  });
  it('checks the embedded v4 of IPv4-mapped addresses', () => {
    expect(isPrivateIPv6('::ffff:10.0.0.1')).toBe(true);
    expect(isPrivateIPv6('::ffff:8.8.8.8')).toBe(false);
  });
  it('allows public IPv6', () => {
    expect(isPrivateIPv6('2606:4700:4700::1111')).toBe(false);
  });
});

describe('isPublicHttpsUrl', () => {
  it('rejects non-HTTPS urls', async () => {
    expect(await isPublicHttpsUrl('http://example.com')).toBe(false);
    expect(await isPublicHttpsUrl(undefined)).toBe(false);
    expect(await isPublicHttpsUrl('not a url')).toBe(false);
  });
  it('rejects localhost and internal-suffix hostnames without touching DNS', async () => {
    expect(await isPublicHttpsUrl('https://localhost/x')).toBe(false);
    expect(await isPublicHttpsUrl('https://db.internal/x')).toBe(false);
    expect(await isPublicHttpsUrl('https://api.local/x')).toBe(false);
  });
  it('rejects literal private and metadata IPs', async () => {
    expect(await isPublicHttpsUrl('https://169.254.169.254/latest/meta-data')).toBe(false);
    expect(await isPublicHttpsUrl('https://10.0.0.5/internal')).toBe(false);
    expect(await isPublicHttpsUrl('https://127.0.0.1:9200/')).toBe(false);
    expect(await isPublicHttpsUrl('https://[::1]/')).toBe(false);
  });
  it('allows a literal public IP', async () => {
    expect(await isPublicHttpsUrl('https://8.8.8.8/')).toBe(true);
  });
});
