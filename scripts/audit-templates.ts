// Run with: npx tsx scripts/audit-templates.ts
// Two passes:
//  1. Hard validation - validateDoc() (envelope + catalog + source lint)
//  2. UX heuristics - placeholder URLs, generic option labels, broken links,
//     missing CTAs, demo FIDs in non-demo contexts, theme distribution.

import { TEMPLATES } from '../lib/templates';
import { validateDoc } from '../lib/validate-snap';
import { docToSnap } from '../lib/snap-spec';
import type { Block } from '../lib/blocks';

type WarnRule = (block: Block, idx: number) => string | null;

const PLACEHOLDER_URL_HOSTS = ['example.com', 'example.org'];
const GENERIC_LABEL_RE = /^(Option [A-Z0-9]+|Statement \d+|Artist \d+|Choice \d+)$/i;
const TRUNCATED_URL_RE = /\/(track|playlist|album|user)\/$/;

// Detect unsubstituted template-var residue like "{snap-id}" or "{userFid}".
const TEMPLATE_VAR_RE = /\{[a-zA-Z][\w-]*\}/;

const UX_RULES: WarnRule[] = [
  (b) => {
    // Scan every string-valued field on the block for template-var residue.
    const fields: string[] = [];
    if ('content' in b && typeof b.content === 'string') fields.push(b.content);
    if ('title' in b && typeof b.title === 'string') fields.push(b.title);
    if ('subtitle' in b && typeof b.subtitle === 'string') fields.push(b.subtitle);
    if ('label' in b && typeof b.label === 'string') fields.push(b.label);
    if ('prompt' in b && typeof b.prompt === 'string') fields.push(b.prompt);
    if ('text' in b && typeof b.text === 'string') fields.push(b.text);
    if ('placeholder' in b && typeof b.placeholder === 'string') fields.push(b.placeholder);
    for (const f of fields) {
      const m = TEMPLATE_VAR_RE.exec(f);
      if (m) return `unsubstituted template var "${m[0]}" in: ${f.slice(0, 60)}`;
    }
    return null;
  },
  (b) => {
    if ('url' in b && typeof b.url === 'string') {
      try {
        const u = new URL(b.url);
        if (PLACEHOLDER_URL_HOSTS.includes(u.hostname.replace(/^www\./, ''))) {
          return `placeholder URL host: ${u.hostname}`;
        }
        if (TRUNCATED_URL_RE.test(b.url)) {
          return `URL looks truncated: ${b.url}`;
        }
      } catch {
        return `invalid URL: ${b.url}`;
      }
    }
    return null;
  },
  (b) => {
    if ('options' in b && Array.isArray(b.options)) {
      const generic = b.options.filter((o) => typeof o === 'string' && GENERIC_LABEL_RE.test(o));
      if (generic.length > 0) return `generic option labels: ${generic.join(', ')}`;
    }
    return null;
  },
  (b) => {
    if (b.type === 'chart' && Array.isArray(b.bars)) {
      const generic = b.bars.filter((br) => GENERIC_LABEL_RE.test(br.label));
      if (generic.length > 0) return `generic chart labels: ${generic.map((br) => br.label).join(', ')}`;
    }
    return null;
  },
  (b) => {
    if (b.type === 'artist') {
      // 19640 is Zaal - flag if a non-zaal-themed template uses it as 'Artist Name'.
      if (b.fid === 19640 && /artist name|new artist|placeholder/i.test(b.displayName)) {
        return `demo FID 19640 paired with placeholder displayName "${b.displayName}"`;
      }
    }
    return null;
  },
];

let hardFail = 0;
let warn = 0;
let pass = 0;
const themeCount = new Map<string, number>();

for (const t of TEMPLATES) {
  themeCount.set(t.doc.theme, (themeCount.get(t.doc.theme) ?? 0) + 1);

  const result = validateDoc(t.doc);
  if (!result.ok) {
    console.log(`[FAIL] ${t.id}:`);
    for (const issue of result.errors) console.log(`         - ${issue}`);
    hardFail += 1;
    continue;
  }

  // Render every page once to catch runtime exceptions.
  let renderOk = true;
  for (const p of t.doc.pages) {
    try {
      const snap = docToSnap(t.doc, 'https://zlank.online/api/snap/test', { pageId: p.id });
      const elementCount = Object.keys(
        (snap as { ui: { elements: Record<string, unknown> } }).ui.elements,
      ).length;
      if (elementCount === 0) {
        console.log(`[FAIL] ${t.id} - page ${p.id} rendered 0 elements`);
        renderOk = false;
      }
    } catch (err) {
      console.log(`[FAIL] ${t.id} - page ${p.id} threw:`, err instanceof Error ? err.message : err);
      renderOk = false;
    }
  }
  if (!renderOk) {
    hardFail += 1;
    continue;
  }

  // UX warnings (don't fail the audit, but flag).
  const warnings: string[] = [];
  for (const page of t.doc.pages) {
    page.blocks.forEach((block, idx) => {
      for (const rule of UX_RULES) {
        const w = rule(block, idx);
        if (w) warnings.push(`page ${page.id} block ${idx} (${block.type}): ${w}`);
      }
    });
  }

  const blockTotal = t.doc.pages.reduce((s, p) => s + p.blocks.length, 0);
  if (warnings.length > 0) {
    console.log(`[WARN] ${t.id} (${t.doc.pages.length}p, ${blockTotal}b)`);
    for (const w of warnings) console.log(`         - ${w}`);
    warn += 1;
  } else {
    console.log(`[OK]   ${t.id} (${t.doc.pages.length}p, ${blockTotal}b)`);
    pass += 1;
  }
}

console.log(
  `\n${pass} clean / ${warn} warnings / ${hardFail} fail (${pass + warn + hardFail} total)`,
);
console.log(
  `Theme distribution: ${[...themeCount.entries()].map(([k, v]) => `${k}=${v}`).join(', ')}`,
);
process.exit(hardFail > 0 ? 1 : 0);
