import { validateSnapResponse, snapResponseSchema } from '@farcaster/snap';
import { snapJsonRenderCatalog } from '@farcaster/snap/ui';
import { docToSnap } from './snap-spec';
import type { SnapDoc } from './blocks';

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

  for (const page of doc.pages) {
    const issues: string[] = [];
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
