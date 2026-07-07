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

  it('degrades client-only interactive blocks to prompt text plus an open hint', async () => {
    const doc: SnapDoc = {
      version: 2,
      title: 'x',
      theme: 'purple',
      pages: [
        { id: 'home', blocks: [{ type: 'toggle', label: 'Pick some', options: ['a', 'b'] }] },
      ],
    };
    const html = await docToEmbedHtml(doc);
    expect(html).toContain('Pick some');
    expect(html).toContain('Open in Farcaster');
  });
});

describe('docToEmbedHtml - interactive poll', () => {
  const pollDoc: SnapDoc = {
    version: 2,
    title: 'x',
    theme: 'purple',
    pages: [{ id: 'home', blocks: [{ type: 'poll', question: 'Best chain?', options: ['Base', 'OP'] }] }],
  };

  it('renders a poll as a POST form with radio options', async () => {
    const html = await docToEmbedHtml(pollDoc, { encoded: 'snap123' });
    expect(html).toContain('Best chain?');
    expect(html).toContain('method="POST"');
    expect(html).toContain('action="/api/snap/snap123/embed"');
    expect(html).toContain('type="radio"');
    expect(html).toContain('name="vote_0"');
    expect(html).toContain('value="Base"');
    expect(html).toContain('value="OP"');
    expect(html).not.toContain('Open in Farcaster');
  });

  it('renders results with percentages when voteTallies are supplied', async () => {
    const voteTallies = new Map([[0, { Base: 3, OP: 1 }]]);
    const html = await docToEmbedHtml(pollDoc, { encoded: 'snap123', voteTallies });
    expect(html).toContain('Best chain?');
    expect(html).toContain('75%');
    expect(html).toContain('25%');
    expect(html).toContain('4 votes');
    expect(html).not.toContain('type="radio"');
  });

  it('escapes poll option values in the form', async () => {
    const xssDoc: SnapDoc = {
      version: 2,
      title: 'x',
      theme: 'purple',
      pages: [
        {
          id: 'home',
          blocks: [{ type: 'poll', question: 'q', options: ['"><script>alert(1)</script>', 'ok'] }],
        },
      ],
    };
    const html = await docToEmbedHtml(xssDoc, { encoded: 's' });
    expect(html).not.toContain('<script>alert(1)');
    expect(html).toContain('&lt;script&gt;');
  });

  it('carries ?page through into the form action for multi-page snaps', async () => {
    const html = await docToEmbedHtml(pollDoc, { encoded: 'snap123', pageId: 'home' });
    expect(html).toContain('action="/api/snap/snap123/embed?page=home"');
  });
});
