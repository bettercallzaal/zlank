# CLAUDE.md - Zlank

No-code Farcaster Snap builder. Stack blocks. Hit Deploy. Share to feed.

## Stack constraints

- Next.js 16 App Router + React 19 + Tailwind v4
- TypeScript strict mode. `any` BANNED.
- `@farcaster/snap` v2.1.1 + `@farcaster/snap-hono` v2.0.5
- `@farcaster/miniapp-sdk` v0.3.0
- Hono 4 for any non-Next route handler patterns
- Vercel Hobby tier deploy

## Voice + style

- No emojis. No em dashes (use hyphens).
- Mobile-first since Snaps render in feed.
- ZAO ecosystem: prefer Farcaster (not Warpcast).

## Architecture

- `app/page.tsx` - landing
- `app/builder/page.tsx` - block-based builder UI (client component, in-memory state)
- `app/api/snap/[encoded]/route.ts` - Snap JSON renderer (decodes URL config)
- `app/.well-known/farcaster.json/route.ts` - Mini App manifest
- `lib/blocks.ts` - block schema + clamp helpers
- `lib/encode.ts` - base64url Snap config codec
- `lib/snap-spec.ts` - blocks -> Snap UI JSON tree

## Adding a new block (pattern)

1. Add block interface to `lib/blocks.ts` (type + clampBlock case)
2. Add `BlockType` union member
3. Add render function in `lib/snap-spec.ts` `blockToElements`
4. Add picker option in `app/builder/page.tsx` BLOCK_OPTIONS
5. Add `newBlock` factory case
6. Add `BlockEditor` switch case for inline edit fields
7. Add `BlockPreview` switch case for live preview

## Hard limits to enforce in clamp

- Button label: 30 chars
- Text content: 320 chars
- Item title: 100 chars / description: 160 chars
- Badge label: 30 chars
- Image URL: HTTPS only
- compose_cast text: 1024 chars / embeds: 2 max

Theme accents (no custom hex): purple, amber, blue, green, red, pink, teal, gray.

## Don'ts

- Don't add a database in v1 (URL-encoded config is the design).
- Don't add auth in v1 (open access, sign-in comes in v0.5 with DB).
- Don't add tokens / Clanker / Empire Builder integration (deferred to v2 per project_zlank memory).
- Don't break the encode/decode round-trip - existing shared Snap URLs must keep resolving.
- Don't use `any`. Use `unknown` + narrow.
- Don't add `console.log` to production code paths.
- Don't commit `.env` or `.env.local`.

## Build steps

```bash
npm install
npm run dev          # http://localhost:3000
npm run build        # prod build, must pass
npm run typecheck    # tsc --noEmit
```

## QuadWork rules (when agents touch this repo)

Allowlist of paths agents may edit lives in `.quadwork-allowlist`. Agents MUST read both this CLAUDE.md and the allowlist before editing.

Skip:
- `next.config.ts`
- `tsconfig.json`
- `package.json` deps without explicit ticket
- `app/layout.tsx` global metadata without ticket
- `.well-known/**` (account association is sensitive)

Each PR adds ONE new block type or fixes ONE issue. No bundled refactors.

## Reference impls

- `/Users/zaalpanthaki/Documents/ZAO OS V1/duodo-snap/` - working FarCon Rome music Snap
- `/Users/zaalpanthaki/Documents/ZAO OS V1/nouns-snap/` - working Nouns explorer Snap
- `/Users/zaalpanthaki/Documents/zlank-snap-template/` - starter template

## Reference docs

- `/Users/zaalpanthaki/Documents/ZAO OS V1/research/farcaster/500-snaps-zlank-build-platform/`
- `/Users/zaalpanthaki/Documents/ZAO OS V1/research/farcaster/505-zlank-online-builder-spec/`
