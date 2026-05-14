import { describe, it, expect } from 'vitest';
import { docToEmbedHtml, escapeHtml } from './embed-spec';
import type { SnapDoc } from './blocks';

describe('escapeHtml', () => {
  it('escapes angle brackets, quotes, and ampersands', () => {
    expect(escapeHtml('<script>"&\'')).toBe('&lt;script&gt;&quot;&amp;&#39;');
  });
});

describe('docToEmbedHtml', () => {
  it('renders a complete HTML document', async () => {
    const doc: SnapDoc = {
      version: 2,
      title: 'My Snap',
      theme: 'purple',
      pages: [{ id: 'home', blocks: [{ type: 'header', title: 'Hello' }] }],
    };
    const html = await docToEmbedHtml(doc);
    expect(html).toContain('<!doctype html>');
    expect(html).toContain('<html');
    expect(html).toContain('Hello');
  });

  it('escapes user content to prevent XSS', async () => {
    const doc: SnapDoc = {
      version: 2,
      title: 'x',
      theme: 'purple',
      pages: [{ id: 'home', blocks: [{ type: 'text', content: '<img src=x onerror=alert(1)>' }] }],
    };
    const html = await docToEmbedHtml(doc);
    expect(html).not.toContain('<img src=x onerror');
    expect(html).toContain('&lt;img');
  });

  it('substitutes ${data.X} placeholders from static data sources', async () => {
    const doc: SnapDoc = {
      version: 2,
      title: 'x',
      theme: 'purple',
      dataSource: [{ id: 's', kind: 'static', staticValue: 'LIVE' }],
      pages: [{ id: 'home', blocks: [{ type: 'text', content: 'Status: ${data.s}' }] }],
    };
    const html = await docToEmbedHtml(doc);
    expect(html).toContain('Status: LIVE');
  });

  it('renders link blocks as anchors and drops non-HTTPS urls', async () => {
    const doc: SnapDoc = {
      version: 2,
      title: 'x',
      theme: 'purple',
      pages: [
        {
          id: 'home',
          blocks: [
            { type: 'link', label: 'Go', url: 'https://example.com' },
            { type: 'link', label: 'Bad', url: 'http://insecure.com' },
          ],
        },
      ],
    };
    const html = await docToEmbedHtml(doc);
    expect(html).toContain('href="https://example.com"');
    expect(html).toContain('Go');
    expect(html).not.toContain('insecure.com');
  });

  it('renders a partner attribution badge when partner.attribution is set', async () => {
    const doc: SnapDoc = {
      version: 2,
      title: 'x',
      theme: 'green',
      partner: { id: 'footy', name: 'Footy App', attribution: true },
      pages: [{ id: 'home', blocks: [] }],
    };
    const html = await docToEmbedHtml(doc);
    expect(html).toContain('Powered by Footy App');
  });

  it('degrades interactive blocks to prompt text plus an open hint', async () => {
    const doc: SnapDoc = {
      version: 2,
      title: 'x',
      theme: 'purple',
      pages: [
        { id: 'home', blocks: [{ type: 'poll', question: 'Pick one', options: ['a', 'b'] }] },
      ],
    };
    const html = await docToEmbedHtml(doc);
    expect(html).toContain('Pick one');
    expect(html).toContain('Open in Farcaster');
  });
});
