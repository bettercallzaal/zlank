import { validateSnapResponse, snapResponseSchema } from '@farcaster/snap';
import { snapJsonRenderCatalog } from '@farcaster/snap/ui';
import { docToSnap } from './snap-spec';
import type { SnapDoc, Block } from './blocks';

// Source-doc lint - catches user input mistakes that snap-spec would silently
// paper over (e.g. empty text content gets padded with a space at render).
function lintBlock(block: Block, idx: number, pageBlocks: Block[]): string[] {
  const issues: string[] = [];
  const here = `block ${idx} (${block.type})`;
  switch (block.type) {
    case 'text':
      if (!block.content?.trim()) issues.push(`${here}: text content is empty`);
      break;
    case 'header':
      if (!block.title?.trim()) issues.push(`${here}: header title is empty`);
      break;
    case 'link':
      if (!block.label?.trim()) issues.push(`${here}: link label is empty`);
      if (!/^https:\/\//.test(block.url)) issues.push(`${here}: link url must start with https://`);
      break;
    case 'share':
      if (!block.label?.trim()) issues.push(`${here}: share label is empty`);
      if (!block.text?.trim()) issues.push(`${here}: share cast text is empty`);
      break;
    case 'image':
      if (!block.url?.trim()) issues.push(`${here}: image url is empty`);
      else if (!/^https:\/\//.test(block.url)) {
        issues.push(`${here}: image url must start with https:// (got ${block.url.slice(0, 20)}...)`);
      }
      break;
    case 'music':
      if (!block.url?.trim()) issues.push(`${here}: music url is empty`);
      else if (!/^https:\/\//.test(block.url)) issues.push(`${here}: music url must start with https://`);
      break;
    case 'artist':
      if (!Number.isFinite(block.fid) || block.fid <= 0) {
        issues.push(`${here}: artist fid must be a positive number`);
      }
      if (!block.displayName?.trim()) issues.push(`${here}: artist displayName is empty`);
      break;
    case 'poll':
      if (!block.question?.trim()) issues.push(`${here}: poll question is empty`);
      if (!Array.isArray(block.options) || block.options.length < 2) {
        issues.push(`${here}: poll needs at least 2 options`);
      }
      break;
    case 'toggle':
      if (!Array.isArray(block.options) || block.options.length < 2) {
        issues.push(`${here}: toggle needs at least 2 options`);
      }
      break;
    case 'feedback':
      if (!block.mention?.trim()) issues.push(`${here}: feedback mention is empty`);
      if (!block.prompt?.trim()) issues.push(`${here}: feedback prompt is empty`);
      break;
    case 'chatbot':
      if (!block.title?.trim()) issues.push(`${here}: chatbot title is empty`);
      if (!block.systemPrompt?.trim()) {
        issues.push(`${here}: chatbot systemPrompt is empty`);
      }
      break;
    case 'navigate':
      if (!block.pageId?.trim()) issues.push(`${here}: navigate pageId is empty`);
      break;
    case 'progress':
      if (!Number.isFinite(block.max) || block.max <= 0) {
        issues.push(`${here}: progress max must be > 0`);
      }
      break;
    case 'slider':
      if (block.min > block.max) {
        issues.push(`${here}: slider min (${block.min}) must be <= max (${block.max})`);
      }
      break;
    case 'chart':
      if (!Array.isArray(block.bars) || block.bars.length === 0) {
        issues.push(`${here}: chart needs at least 1 bar`);
      }
      break;
    case 'leaderboard': {
      if (!block.title?.trim()) issues.push(`${here}: leaderboard title is empty`);
      const pIdx = block.pollBlockIdx;
      if (!Number.isFinite(pIdx) || pIdx < 0) {
        issues.push(`${here}: leaderboard pollBlockIdx must be >= 0`);
      } else if (pIdx >= pageBlocks.length) {
        issues.push(
          `${here}: leaderboard pollBlockIdx ${pIdx} out of range (page has ${pageBlocks.length} blocks)`,
        );
      } else if (pageBlocks[pIdx]?.type !== 'poll') {
        issues.push(
          `${here}: leaderboard pollBlockIdx ${pIdx} points at a ${pageBlocks[pIdx]?.type ?? '?'} block, not a poll`,
        );
      }
      break;
    }
  }
  return issues;
}

export interface ValidatePageResult {
  pageId: string;
  ok: boolean;
  issues: string[];
}

export interface ValidateDocResult {
  ok: boolean;
  pages: ValidatePageResult[];
  /** Flat list of human-readable issues across all pages. */
  errors: string[];
}

function formatIssue(issue: { path?: unknown; message: string }): string {
  const path = Array.isArray(issue.path) ? issue.path.join('.') : '';
  return path ? `${path}: ${issue.message}` : issue.message;
}

/**
 * Run @farcaster/snap envelope validator + ui catalog validator against
 * every page of the doc. Returns a flat list of issues so the builder /
 * save endpoint can surface them before storing.
 */
export function validateDoc(doc: SnapDoc, baseUrl = 'https://zlank.online/api/snap/preview'): ValidateDocResult {
  const pages: ValidatePageResult[] = [];
  const errors: string[] = [];

  // Doc-level lint: theme enum, page IDs required + unique, navigate targets
  // must resolve to a real page on this doc.
  const VALID_THEMES = ['purple', 'amber', 'blue', 'green', 'red', 'pink', 'teal', 'gray'];
  if (!VALID_THEMES.includes(doc.theme)) {
    errors.push(`theme "${doc.theme}" is not one of ${VALID_THEMES.join(', ')}`);
  }
  const seenPageIds = new Set<string>();
  const knownPageIds = new Set(doc.pages.map((p) => p.id));
  for (const page of doc.pages) {
    if (!page.id?.trim()) errors.push(`page id is empty`);
    else if (seenPageIds.has(page.id)) errors.push(`page id "${page.id}" is duplicated`);
    seenPageIds.add(page.id);
  }

  for (const page of doc.pages) {
    const issues: string[] = [];

    // Source-doc lint first (catches user input mistakes regardless of how
    // snap-spec.ts handles them at render time).
    page.blocks.forEach((block, idx) => {
      issues.push(...lintBlock(block, idx, page.blocks));
      if (block.type === 'navigate' && block.pageId && !knownPageIds.has(block.pageId)) {
        issues.push(
          `block ${idx} (navigate): pageId "${block.pageId}" does not exist (known: ${[...knownPageIds].join(', ')})`,
        );
      }
    });

    let snap: unknown;
    try {
      snap = docToSnap(doc, baseUrl, { pageId: page.id });
    } catch (err) {
      const msg = err instanceof Error ? err.message : 'render failed';
      issues.push(`page ${page.id}: ${msg}`);
      pages.push({ pageId: page.id, ok: false, issues });
      errors.push(...issues);
      continue;
    }

    const envelope = validateSnapResponse(snap);
    if (!envelope.valid) {
      for (const i of envelope.issues) issues.push(`envelope: ${formatIssue(i)}`);
    }

    try {
      const parsed = snapResponseSchema.parse(snap);
      const cat = snapJsonRenderCatalog.validate(parsed.ui);
      if (!cat.success) {
        const catIssues = cat.error?.issues ?? [];
        for (const i of catIssues) issues.push(`ui: ${formatIssue(i)}`);
      }
    } catch (err) {
      const msg = err instanceof Error ? err.message : 'parse failed';
      issues.push(`schema: ${msg}`);
    }

    pages.push({ pageId: page.id, ok: issues.length === 0, issues });
    if (issues.length > 0) {
      errors.push(...issues.map((i) => `page ${page.id}: ${i}`));
    }
  }

  return { ok: errors.length === 0, pages, errors };
}
