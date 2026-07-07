# Snap protocol spec

**Status:** VERIFIED
**Last verified:** 2026-05-14 against https://docs.farcaster.xyz/snap/SKILL.md (SKILL.md itself dated 2026-04-17)
**Note:** the spec is in beta and changes fast. Re-fetch `https://docs.farcaster.xyz/snap/llms.txt` if this is more than a day or two stale.

## What a Snap is

A lightweight interactive app embedded directly inside a Farcaster cast.
Simpler and smaller than a full Mini App. The server returns JSON; the Farcaster
client renders it. No client-side code execution.

## Request / response basics

- Snap-aware clients request with header `Accept: application/vnd.farcaster.snap+json`.
- Every response must set `"version": "2.0"`.
- Serve the Snap JSON alongside a normal site via content negotiation on `Accept`
  (a browser without that header gets your normal HTML).
- CORS: `Access-Control-Allow-Origin: *` (on by default in `@farcaster/snap-hono`).

## UI format

Declarative, flat element map:

```
ui: {
  root: "<element id>",
  elements: { [id]: Element }
}
```

Each `Element` has:
- `type` - component type
- `props` - component-specific props
- `children` - optional array of child element IDs
- `on` - optional event bindings (e.g. `on.press` for buttons)

## Structural limits (hard, schema-enforced)

- Max **64 elements** per Snap
- Max **7** root children per container
- Max **6** children per non-root container
- Max **5** nesting depth

## The 16 components

Display / data / container / field types. Key ones:

- **text** - `weight` (`"bold"` for headings), `size` (`"md"` body, `"sm"` caption), `color` (theme-aware)
- **button** - `variant` (`"primary"` for the one main CTA per page, else `"secondary"`), `label`, `on.press`
- **item** - row layout: left `media` (supports `round: true`), center text, right `children` (actions slot). Avoid `chevron-right`/`arrow-right` icons in actions - they imply row navigation.
- **bar chart** - ranked/comparative data, 1-6 items, horizontal bars
- **cell grid** - game boards / matrices. `cols` (2-32), `rows` (2-16), `cellAspectRatio: "square"`, `select` (`"off"` default | `"single"` | `"multiple"`). Use `on.press`+`submit` with `select:"off"` for immediate POSTs OR `select` + a submit button - **never both** (`on.press` is ignored when `select` is on).
- **stack** (container) - `direction` (`"horizontal"`|`"vertical"`), `gap`, `equalWidth` (forces equal-width button rows). Gap defaults: horizontal 2 children -> `lg`, 3 -> `md`, 4+ -> `sm`; vertical default `md`, button-only `sm`.
- **image** - `src`, optional `round`. Respects container width.
- **input / form fields** - field `name` must match the key in the POST `inputs` object. Per-component character limits apply.

Full component reference: https://docs.farcaster.xyz/snap/elements

## The 10 action types

Bound via `on.press` with an `action` and `params` object.

| Action | Kind | Notes |
|--------|------|-------|
| `submit` | server round-trip | POST; includes JFS-verified user FID |
| `open_url` | navigation | external browser. HTTPS in prod; `http://` only on loopback |
| `open_snap` | navigation | open another Snap inline |
| `open_mini_app` | navigation | in-app Mini App navigation |
| `view_cast` | client | view a cast |
| `view_profile` | client | view a profile |
| `compose_cast` | client | open the composer |
| `view_token` | client | view token details |
| `send_token` | client | send token |
| `swap_token` | client | swap tokens |

Use **distinct submit target URLs per button** so the server can tell which was pressed.

## Auth / user context

- **POST:** `ctx.action.user.fid` is always present and JFS-verified.
- **GET:** `ctx.action.user` is best-effort, never guaranteed. Always render a
  working anonymous first load; treat GET-time user as a strict enhancement.
- Full auth detail: https://docs.farcaster.xyz/snap/auth

## Build + deploy

1. **Fetch latest docs:** `curl -fsSL https://docs.farcaster.xyz/snap/llms.txt`
2. **Use the template:** `github.com/farcasterxyz/snap/tree/main/template` (Hono-based).
3. **ESM rule (critical):** all local relative imports need the `.js` extension
   even though sources are `.ts` - `import { foo } from "./foo.js"`. Bare package
   imports (`hono`, `@farcaster/snap`) do not.
4. **Always `pnpm build` before deploying.**
5. **Local validation** - GET: `curl -sS -H 'Accept: application/vnd.farcaster.snap+json' http://localhost:<port>/`. POST: send a JFS-shaped body with base64url payload.
6. **Deploy to host.neynar.app** - fetch `https://host.neynar.app/SKILL.md` for the deploy skill. Params: `framework: "hono"`, stable `projectName`, `env` includes `{"SNAP_PUBLIC_BASE_URL":"https://<projectName>.host.neynar.app"}`. Exclude `src/server.ts` and `node_modules` from the archive. After deploy, the URL may 5xx briefly while routing propagates - wait and retry.
7. **Verify prod:** `curl -fsSL -H 'Accept: application/vnd.farcaster.snap+json' https://<projectName>.host.neynar.app/` -> expect HTTP 200, content type `application/vnd.farcaster.snap+json`.

## Packages (`@farcaster/*`)

- `@farcaster/snap` - core: schemas, types, page + POST validation, `verifyJFS`
- `@farcaster/snap/ui` - the json-render catalog (per-component subpaths like `@farcaster/snap/ui/button`)
- `@farcaster/snap-hono` - Hono adapter + conveniences
- `@farcaster/snap-emulator` - local emulator (paste a Snap URL; skips signature verification)
- `@farcaster/snap-turso` - persistent key-value store (`createTursoDataStore()`); Turso KV on host.neynar.app, in-memory locally

Get latest versions:
```bash
npm search @farcaster/snap --parseable | cut -f1 | grep '^@farcaster/snap' | \
  xargs -I{} sh -c 'echo "{}: $(npm view {} dist-tags.latest)"'
```

## Docs index (all under https://docs.farcaster.xyz)

| Page | Path |
|------|------|
| Introduction | `/snap/` |
| Building Snaps with AI | `/snap/agents` |
| Building a Snap | `/snap/building` |
| Integrating Snaps | `/snap/integrating` |
| Persistent State | `/snap/persistent-state` |
| Examples | `/snap/examples` |
| Spec Overview | `/snap/spec-overview` |
| HTTP Headers | `/snap/http-headers` |
| Elements (16 components) | `/snap/elements` |
| Buttons | `/snap/buttons` |
| Surfaces | `/snap/surfaces` |
| Actions (9-10 types) | `/snap/actions` |
| Effects (confetti, fireworks) | `/snap/effects` |
| Theme & Styling | `/snap/theme` |
| Color Palette | `/snap/colors` |
| Constraints | `/snap/constraints` |
| Authentication (JFS) | `/snap/auth` |
| Upgrading from v1.0 | `/snap/upgrading` |

## How this maps to zlank

zlank does not build standalone Snap servers - it generates Snap JSON from a
`SnapDoc` (`lib/blocks.ts`) via `lib/snap-spec.ts`, which already targets
`version: "2.0"`, the `ui.root`/`ui.elements` format, the structural limits
(see `chunkIntoStacks`), and the action types above. When the upstream spec
changes, `lib/snap-spec.ts` and `lib/validate-snap.ts` are what need updating.
