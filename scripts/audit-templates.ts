// Run with: npx tsx scripts/audit-templates.ts
// Validates every template via the same validateDoc() the save endpoint uses,
// then renders + checks output for every page.

import { TEMPLATES } from '../lib/templates';
import { validateDoc } from '../lib/validate-snap';
import { docToSnap } from '../lib/snap-spec';

let pass = 0;
let fail = 0;

for (const t of TEMPLATES) {
  const result = validateDoc(t.doc);
  if (result.ok) {
    // Also verify each page renders without throwing.
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
    if (renderOk) {
      console.log(`[OK]   ${t.id} (${t.doc.pages.length} page${t.doc.pages.length > 1 ? 's' : ''}, ${t.doc.pages.reduce((s, p) => s + p.blocks.length, 0)} blocks)`);
      pass += 1;
    } else {
      fail += 1;
    }
  } else {
    console.log(`[FAIL] ${t.id}:`);
    for (const issue of result.errors) console.log(`         - ${issue}`);
    fail += 1;
  }
}

console.log(`\n${pass}/${pass + fail} templates pass.`);
process.exit(fail > 0 ? 1 : 0);
