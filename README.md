# Zlank

No-code builder for Farcaster Snaps. Stack blocks. Hit Deploy. Share to feed.

Live: [zlank.online](https://zlank.online)

## What it does

Build interactive in-feed Farcaster Snaps without writing code:

1. Open the builder
2. Pick blocks (header, text, link, music, artist, poll, bar chart, toggle, share, image, divider)
3. Edit fields inline with a live preview
4. Hit Deploy - your Snap goes live at `zlank.online/api/snap/<6-char-id>`
5. Share to feed - drops it as a cast embed, renders inline in Snap-aware Farcaster clients

Same URL serves:
- **Snap JSON** to clients that send `Accept: application/vnd.farcaster.snap+json` (renders inline UI in feed)
- **HTML** with OG tags + `Link rel="alternate"` for everything else (browsers, link previews)

No `fc:miniapp` meta tag - that forces the Mini App embed (image+button) render and prevents inline Snap rendering.

## Block types

| Block | What it does |
|---|---|
| **Header** | Title + subtitle in a styled item card |
| **Text** | Plain text content (max 320 chars) |
| **Link** | Button with URL + icon picker + primary/secondary variant |
| **Share** | Compose-cast button with prefilled text + embed |
| **Image** | HTTPS image with aspect ratio (1:1 / 16:9 / 4:3 / 9:16) |
| **Music** | Spotify / Tortoise / SoundCloud URL with icon |
| **Artist** | Farcaster FID + name -> view-profile button |
| **Poll** | Question + 2-4 options + submit button |
| **Bar chart** | Up to 6 bars with label + value (data viz) |
| **Toggle** | Toggle group with 2-6 options, horizontal or vertical |
| **Divider** | Visual separator |

Plus snap-level **Confetti effect** on render.

## Stack

- **Next.js 16** + React 19 + Tailwind v4
- **`@farcaster/snap`** v2.1.1 - Snap protocol types + spec
- **`@farcaster/snap-hono`** v2.0.5 - reference implementation (we use the schemas, ship our own handler)
- **`@farcaster/miniapp-sdk`** v0.3.0 - Mini App context detection + Quick Auth + composeCast
- **Vercel Marketplace Redis** (Upstash) - short-ID lookup via `nanoid(6)`
- **Vercel** - hosting (Hobby tier)

## Architecture

```
GET /api/snap/[id]
  - Accept: application/vnd.farcaster.snap+json -> Snap JSON inline render
  - Accept: text/html (default) -> HTML with OG + Link rel="alternate"

POST /api/snap/[id]
  - Always returns Snap JSON (for in-snap interactions like vote submit)

POST /api/snaps
  - Body: { doc: SnapDoc }
  - Stores in Redis with 6-char nanoid key
  - Returns: { id, short: true }

GET /s/[id]
  - HTML viewer page (Mini App webview / browser fallback)
  - Renders blocks visually for non-Snap-aware clients

GET /api/og/[id]
  - Dynamic OG image via placehold.co fallback (next/og has Turbopack edge issue)

GET /.well-known/farcaster.json
  - Mini App manifest (account association placeholder, sign for verified badge)
```

URL convention: 6-char `nanoid` short IDs after first deploy. Old URL-encoded base64 still resolves forever (resolveSnap tries KV first, falls back to base64 decode).

## Local dev

```bash
npm install
cp .env.example .env.local
npm run dev   # http://localhost:3000
```

Set `REDIS_URL` in `.env.local` for short URLs (or skip - falls back to base64-encoded URLs).

## Deploy

```bash
vercel              # link
vercel --prod       # ship
```

After first deploy, click "Storage" in Vercel project → add Marketplace Redis (free tier 256MB, 10k commands/day) → connect to project. `REDIS_URL` injected automatically.

## Roadmap

**Done (v0)**
- 11 block types + confetti effect
- Snap protocol + Mini App embed dual-render from same URL
- Short URLs via Redis
- Open access (any Farcaster FID can build)
- Live preview, drag-reorder via up/dn buttons
- Mini App context detection + Quick Auth fallback
- CORS for emulator + cross-origin clients
- OG image with title overlay

**Next (v0.5)**
- Sign In With Farcaster + dashboard
- Edit existing Snap (stable URL, change blocks, redeploy)
- Vote tallying for Poll + Toggle blocks (write to Redis)
- 7-day expiry + paid extension tier
- Custom domain (zlank.online)
- Dynamic OG image with logos / charts (when next/og + Turbopack edge fix lands)
- Mini App account association sign for verified badge + directory listing

**v1**
- Snap Gallery (public discovery)
- Cron Snaps (auto-post on schedule)
- Event-driven Snaps (react to onchain events)

**v2**
- Token block (Clanker integration)
- Empire Builder leaderboard block
- Multi-chain (Base + Solana + Arbitrum)
- XMTP DMs + Snapshot governance proposals
- Agent-authored Snaps

## License

MIT

## Acknowledgments

Snap UI patterns inspired by `duodo-snap` and `nouns-snap` (working Snap reference impls). Snap protocol research synthesized from official Farcaster docs + emulator testing.

Built by [@zaal](https://farcaster.xyz/zaal) for the ZAO ecosystem.
