# Embedding a Zlank Snap on any webpage

A Zlank Snap can render as an interactive ad unit on any publisher page via a
single iframe. No SDK, no build step.

## Embed URL

```
https://zlank.online/api/snap/<encoded-or-id>/embed
```

`<encoded-or-id>` is either a base64url-encoded SnapDoc or a short snap id -
the same identifier used by the Snap-native route. Optional `?page=<pageId>`
selects a page in a multi-page Snap (defaults to the first page).

## Iframe snippet

```html
<iframe
  src="https://zlank.online/api/snap/<id>/embed"
  style="width:100%;max-width:480px;min-height:480px;border:0;border-radius:12px"
  loading="lazy"
  title="Zlank Snap"
></iframe>
```

Recommended sizing: `max-width: 480px`, `min-height: 480px`. The document is
responsive and mobile-first; height varies with block count, so allow it to
grow rather than fixing a height.

## Response contract

The endpoint returns a complete, self-contained HTML document:

- `content-type: text/html; charset=utf-8`
- `content-security-policy: frame-ancestors *; default-src 'self'; img-src https: data:; style-src 'unsafe-inline'; script-src 'none'`
- `cache-control: public, max-age=30, s-maxage=30`
- `access-control-allow-origin: *`

`frame-ancestors *` lets any publisher embed it. The publisher controls their
own page CSP. `script-src 'none'` means the embed ships zero JavaScript - it is
a display and outbound-link surface.

Invalid or expired ids return `400` with a plain-text body.

## What renders

Display blocks render as semantic HTML: header, text, link, image, divider,
music, share, artist, chart, leaderboard, progress.

- `link` / `music` / `artist` -> `<a target="_blank" rel="noopener noreferrer">`. Non-HTTPS URLs are dropped.
- `share` -> link to the Farcaster compose intent (`farcaster.xyz/~/compose`).
- `image` -> `<img loading="lazy">`, HTTPS-only `src`.

Interactive blocks (poll, toggle, slider, switch, feedback, chatbot, navigate)
cannot run outside a Farcaster client - the Snap protocol actions (`submit`,
`compose_cast`, `swap_token`) need a client. They degrade to their prompt text
plus an "Open in Farcaster to interact" hint.

## Live data

`${data.<sourceId>}` placeholders in text and header blocks are substituted at
render time from the Snap's `dataSource` bindings (REST/webhook/static). The
embed resolves the same sources as the Snap-native route, with a per-instance
cache keyed by url + `refreshSec`.

## Attribution

When a Snap carries `partner.attribution = true`, a "Powered by <partner>"
badge renders at the foot of the embed. Publishers and forkers must keep the
attribution badge intact.

## Forbidden

Do not wrap the iframe in click-jacking overlays, pixel-tracking shims, or
iframe-busting scripts. Do not strip the partner attribution badge.

## Authentication (status)

Read rendering is fully anonymous - no auth needed to display a Snap.

Authenticated actions from an embedded Snap (follow, like, place a bet) are
**not yet available**. The pieces:

- Quick Auth JWT verification already exists server-side: `extractFid(req)` in
  `lib/auth.ts` verifies a `Authorization: Bearer <jwt>` Quick Auth token via
  `@farcaster/quick-auth` and returns the caller FID. The delegated-action
  endpoint (`POST /api/snaps/[id]/action`) uses it.
- What is missing is the **token bridge**: a way for a Farcaster client to
  hand the viewer's Quick Auth token to a Snap rendered inside a third-party
  publisher page. There is no protocol spec for this today (cross-origin Snap
  embeds are not standardized). A `postMessage` bridge - parent posts
  `{ type: 'farcaster:quick-auth', jwt: '...' }` to the iframe - is the likely
  shape, but it requires relaxing `script-src` and is deferred until the
  protocol direction is settled.

Until then, treat the embed as an anonymous display + outbound-link surface.
