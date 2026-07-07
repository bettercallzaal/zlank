// Run: npx tsx scripts/audit-templates-prod.ts
// Saves every template to prod via /api/snaps + GETs each back as Snap JSON.
// Reports pass/fail per template and prints the live snap URLs.

import { TEMPLATES } from '../lib/templates';

const BASE = process.env.ZLANK_BASE || 'https://www.zlank.online';

interface SaveRes { id?: string; short?: boolean; error?: string; issues?: string[] }
interface SnapRes { version?: string; ui?: { elements?: Record<string, unknown> } }

async function audit(t: (typeof TEMPLATES)[number]): Promise<{ ok: boolean; id?: string; reason?: string }> {
  const save = await fetch(`${BASE}/api/snaps`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ doc: t.doc }),
  });
  if (!save.ok) {
    const data = (await save.json().catch(() => ({}))) as SaveRes;
    return {
      ok: false,
      reason: `save ${save.status}: ${data.error ?? ''} ${(data.issues ?? []).join(' | ')}`.trim(),
    };
  }
  const { id } = (await save.json()) as SaveRes;
  if (!id) return { ok: false, reason: 'save returned no id' };

  const get = await fetch(`${BASE}/api/snap/${id}`, {
    headers: { Accept: 'application/vnd.farcaster.snap+json' },
  });
  if (!get.ok) return { ok: false, id, reason: `get ${get.status}` };
  const snap = (await get.json()) as SnapRes;
  if (snap.version !== '2.0') return { ok: false, id, reason: `version ${snap.version}` };
  const elementCount = Object.keys(snap.ui?.elements ?? {}).length;
  if (elementCount === 0) return { ok: false, id, reason: 'no elements' };
  return { ok: true, id };
}

async function sleep(ms: number) {
  return new Promise<void>((resolve) => setTimeout(resolve, ms));
}

(async () => {
  let pass = 0;
  let fail = 0;
  // Rate limit on /api/snaps is 5/min + 30/hr per IP. Space saves at ~13s
  // to respect the burst cap. Skip the wait if RUN_FAST is set + retry on 429.
  const SPACING_MS = process.env.RUN_FAST ? 200 : 13_000;
  for (let i = 0; i < TEMPLATES.length; i++) {
    const t = TEMPLATES[i]!;
    let r = await audit(t);
    if (!r.ok && r.reason?.startsWith('save 429')) {
      console.log(`       ${t.id.padEnd(20)} - 429 backoff, retrying in 60s`);
      await sleep(60_000);
      r = await audit(t);
    }
    if (r.ok) {
      console.log(`[OK]   ${t.id.padEnd(20)} -> ${BASE}/api/snap/${r.id}`);
      pass += 1;
    } else {
      console.log(`[FAIL] ${t.id.padEnd(20)} ${r.id ? `(saved as ${r.id})` : ''}: ${r.reason}`);
      fail += 1;
    }
    if (i < TEMPLATES.length - 1) await sleep(SPACING_MS);
  }
  console.log(`\n${pass}/${pass + fail} templates pass end-to-end on prod.`);
  process.exit(fail > 0 ? 1 : 0);
})();
