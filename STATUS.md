# Zlank — Session State

> Living doc. Last updated end of 2026-04-27 session. When you (Zaal) come back and say "continue", read this first.

## TL;DR

- v1 ready for public, all known security gaps closed.
- 12 PRs merged today (#44-55).
- 28-test manual pass sheet at `/tmp/clipboard.html` (boxes save in localStorage).
- One env var still needs to be set on Vercel: `ZLANK_ADMIN_SECRET`.

## What's live

Production: https://zlank.online (apex now primary, www redirects).

| Surface | URL |
|---------|-----|
| Landing (itself a Snap) | https://zlank.online |
| Builder | https://zlank.online/builder |
| Templates gallery (11 cards) | https://zlank.online/templates |
| Dashboard (My Snaps) | https://zlank.online/dashboard |
| Browser viewer | https://zlank.online/s/{id} |
| Chat-log dashboard | https://zlank.online/chat-log/{id} |

## Test snaps live on prod

Use these in the snap-emulator or cast on Farcaster.

| Snap | URL | Notes |
|------|-----|-------|
| Chatbot (clean, polished) | https://zlank.online/api/snap/i6MdaV | Real Minimax replies, no `<think>` leak |
| Chatbot w/ ZABAL coin | https://zlank.online/api/snap/v8-myn | Original; has Buy $ZABAL button |
| Token-gated (ZABAL) | https://zlank.online/api/snap/zn_uYK | Holders see content; non-holders see upsell |
| Multi-step form | https://zlank.online/api/snap/Wn73tl | 3 pages, Navigate buttons |
| Bug-report (feedback) | https://zlank.online/api/snap/yv4Igy | Composer pre-fills `@zaal bug for zlank: ...` |
| Fan-vote | https://zlank.online/api/snap/jwTj-v | Vote dedupe per FID; "Already voted" on 2nd |
| Music drop | https://zlank.online/api/snap/AuqMhE | Real Spotify URL |
| Top-of-week leaderboard | https://zlank.online/api/snap/CCzoAA | 7-bar chart |
| All-blocks demo | https://zlank.online/api/snap/qQE7TW | Header w/ badge, poll, toggle, slider, switch, progress, chart, etc |

## What shipped today (PRs)

| # | Title | What |
|---|-------|------|
| 44 | v1 base | Snap v2.0 envelope, JFS verify gate, view-guard, multi-step template |
| 45 | polish C | chatbot reply hygiene + grounding, drag-reorder, import-from-snap |
| 46 | template chunking | 4 broken templates fixed (root 7-child cap) |
| 47 | polish T1 | dashboard stats + inline error highlight + Cmd+S + dup + loading |
| 48 | polish T2 | rate limits + vote dedupe + chat cooldown + autosave + cast button |
| 49 | template content polish | no placeholders, real demo URLs |
| 50 | description tightening | visual consistency on cards |
| 52 | chatbot input label dedup | the v8-myn screenshot bug |
| 53 | R1 hunters (12 fixes) | coin admin auth, upload rate limit, image https-only, edit-draft restore, server maxLength, FID validation, page ID lints, audit residue, drag aria-label, picker tap targets |
| 54 | R2 hunters (6 fixes) | iOS touch DnD, contrast bump, theme enum, bumpStat MULTI, gate eval cache 5min, batch stats endpoint |
| 55 | owner FID auth | Quick Auth JWT verify, owner FID at save, /coin per-owner gate, per-FID upload cap |

## Manual action waiting on Zaal

Set `ZLANK_ADMIN_SECRET` on Vercel project env (any random 32+ chars). Without it the `/api/snaps/[id]/coin` endpoint can only be called by the snap's stored owner FID — admin-bypass path is closed. Builder + browser still work fine without it.

```
vercel env add ZLANK_ADMIN_SECRET production
```

Other env already in place: `REDIS_URL`, `NEYNAR_API_KEY`, `MINIMAX_API_KEY`, `BLOB_READ_WRITE_TOKEN`. Optional: `ZLANK_QUICK_AUTH_DOMAIN` (defaults to `zlank.online`), `ZLANK_UPLOAD_FID_DAY_MAX` (default 50).

## Test pass

`/tmp/clipboard.html` has a 28-test sheet across 7 sections. Persistent boxes via localStorage key `zlank-v1-test-v2`. Section list:

1. 5-min smoke (4 tests)
2. Snap emulator (6 tests)
3. Cast-in-feed (3 tests)
4. Owner auth (4 tests, NEW)
5. Negative tests / guards (5 tests)
6. Mobile + a11y (3 tests)
7. New endpoints + flows (3 tests)

If you re-open the file in a browser, your prior checks restore.

## Deferred / next-session candidates

Ranked by impact:

1. **Round 3 hunters** — diminishing returns expected (round 1 had 12 real fixes, round 2 had 6). 2-4 real bugs likely. Skip unless a specific surface needs scrutiny.
2. **Wallet-side coin launch** — at `/coin-launch?snap={id}`. Wagmi + Zora SDK on a single page, signs creator coin tx, auto-associates via `/api/snaps/{id}/coin`. Closes the loop on PR #31's deferred coin creation. Diff ~7.
3. **Public `/discover` page** — list public snaps sorted by views, drives organic traffic. Uses analytics counters already shipped. Diff ~3.
4. **Snap version history** — server keeps last N versions per snap, rollback button. Diff ~4.
5. **Recursive chatbot → coin launch** — LLM proposes coin params from chat, one-tap launch via Build 2 flow. Novel demo. Diff ~8.
6. **ZID integration** — gate snaps by ZAO identity claims (not just token balance). First ZAO ecosystem cross-app integration. Diff ~6.

## Architecture pointers

| Area | File |
|------|------|
| Block schema (17 types) | `lib/blocks.ts` |
| Block → Snap UI mapping | `lib/snap-spec.ts` |
| Snap save / load / vote / chat / stats | `lib/kv.ts` |
| LLM wrapper (Minimax + Anthropic fallback) | `lib/llm.ts` |
| Token-balance gate eval | `lib/gates.ts` |
| Owner FID auth | `lib/auth.ts` |
| Sliding-window rate limiter | `lib/rate-limit.ts` |
| Save-time validator (catalog + UX lint) | `lib/validate-snap.ts` |
| 11 starter templates | `lib/templates.ts` |
| Builder UI (single 1500+ line component) | `app/builder/page.tsx` |
| Snap render route | `app/api/snap/[encoded]/route.ts` |
| Save endpoint | `app/api/snaps/route.ts` |
| Coin endpoint (owner-gated) | `app/api/snaps/[id]/coin/route.ts` |
| Stats endpoint (per-snap + batch) | `app/api/snaps/[id]/stats/route.ts` + `app/api/snaps/stats/route.ts` |

## Audit scripts

- `scripts/audit-templates.ts` — local validation pass over all 11 templates
- `scripts/audit-templates-prod.ts` — saves each template via prod API, fetches back, confirms render. Respects rate limit.

Run anytime: `npx tsx scripts/audit-templates.ts`

## How to "continue" next session

Say "continue" — Claude reads `project_zlank.md` memory + this `STATUS.md` and picks up. No re-explanation needed.

If you have a specific direction in mind, just say it instead — e.g. "wallet-side coin launch" or "discover page" or "round 3 hunters".
