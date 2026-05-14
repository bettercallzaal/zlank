# Building Snaps - alpha

**Status:** VERIFIED
**Last verified:** 2026-05-14

How to go from idea to a working, deployed Snap fast - plus the official demos,
dev links, and known client issues.

## The fastest path: agent workflow

From the official `@farcaster` launch thread (cast `0x94ede65c`, 2026):

> for devs:
> https://docs.farcaster.xyz/snap
> https://github.com/farcasterxyz/snap
> build from scratch or open your coding agent of choice (Claude Code, Codex, etc.) and say:
> "use https://docs.farcaster.xyz/snap/SKILL.md to make an app that..."
> it will read the spec, generate valid snap code, and deploy it to a live url.

And from the repo README quickstart:

> Tell your agent: `Read https://docs.farcaster.xyz/snap/SKILL.md and make a snap that ...`

So: point an agent at `SKILL.md`, describe the Snap, it generates valid code from
the template and deploys to `host.neynar.app`. See `snap-spec.md` for the distilled
SKILL.md content.

## Official demo apps (study these for patterns)

- **Kitchen sink** - https://snap-kitchen-sink.host.neynar.app/ - "explore what's
  possible": buttons, sliders, inputs, toggles, charts, grids, images, polls,
  games, transactions, all live in a cast. From the `@farcaster` "introducing
  snaps" cast.
- **Component catalog** - https://snap-catalog.host.neynar.app - a catalog of the
  current Snap components, kept updated as components improve. From `@obringer.eth`
  (cast `0x22e47994`) - he is shipping the component improvements.

## Official examples + template

In `github.com/farcasterxyz/snap`:
- `template/` - the deployable Hono starter (clone this to start)
- `examples/` - Hono example Snaps
- `apps/emulator/` - the local emulator source
- `apps/docs/` - the human docs (MDX), published at docs.farcaster.xyz/snap

## Emulators

- **Local:** `pnpm --filter @farcaster/snap-emulator dev` -> http://localhost:3000.
  Paste a Snap URL and interact. Does NOT sign payloads - only works with Snaps
  that skip signature verification.
- **With real JFS signing:** the Farcaster web app at
  https://farcaster.xyz/~/developers/snaps

## Community examples

- `@floar.eth` built an 8x8 territory game with the `cell grid` component on launch
  day - https://farcaster.xyz/floar.eth/0xd0da2dce

## Known client issues (from the launch thread, 2026 - may be fixed by now, re-check)

- "Farcaster" profile button on the actions page opens in the same tab and resets
  Snap state - should be `target=_blank` (reported by `@eggman.eth`)
- "View cast" button reported navigating to an empty page (`@beep.eth`)
- Confetti effect reported not firing (`@nounishprof`)
- "View Eth" / "Send Eth" / "Swap Eth" reported doing nothing on desktop browser
  (`@leewardbound`)
- Opening a Snap's Mini App sometimes kicked the user to a browser "install
  Farcaster" page even when tapped from inside Farcaster (`@drdeeks`)

If any of these still reproduce, they affect how zlank Snaps behave in the wild -
worth tracking.

## Who is shipping Snaps

- `@farcaster` (fid 1) - the protocol account, launched Snaps
- `@obringer.eth` (fid 296632) - shipping the component improvements + the catalog
- `@neynar` - hosting (`host.neynar.app`) + the JFS-signing emulator in-app

## Sources

- https://farcaster.xyz/farcaster/0x94ede65c (introducing snaps)
- https://farcaster.xyz/obringer.eth/0x22e47994 (snap components catalog)
- https://github.com/farcasterxyz/snap
- https://docs.farcaster.xyz/snap
