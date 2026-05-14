# Empire Builder

**Status:** NEEDS PASS
**Last verified:** 2026-05-13 (thin planning research - this file needs a real research pass)
**zlank blocks:** `chart`, `link` (no dedicated block) | **template:** `empirebuilder-treasury-board`

## What it is (thin - verify)

empirebuilder.world - a community hub with token leaderboards, treasuries,
staking, and rank-by-balance APIs. The planning research only found the landing
page; product specifics, economics, and FC integration depth are unconfirmed.

**Note:** the user confirmed `empirebuilder.world` is the intended project (not
a different "Empire Builder"). But this is the least-researched partner - treat
everything here as unverified until a real pass is done.

## Integration surface (unconfirmed)

- Site: https://www.empirebuilder.world
- Reportedly has external API / CSV rank integrations and token-holder
  leaderboards - not verified.

## zlank `empirebuilder-treasury-board` template - today vs should do

**Today:** built from generic `header` + `chart` + `link` + `share` blocks - a
static top-holders leaderboard with hardcoded sample bars and a link to the
treasury. No Empire Builder data integration.

**Should do:** if Empire Builder has a holder/leaderboard API, bind the `chart`
to a live `dataSource` so the leaderboard is real. First confirm the API exists
and its shape.

## To do - real research pass

1. Fetch empirebuilder.world and any docs - confirm what the product actually is.
2. Find the leaderboard / rank API (endpoint, auth, response shape).
3. Confirm token model / economics if relevant.
4. Confirm the Farcaster integration depth.
5. Decide: keep the generic-block template, or build a real `treasuryBoard` /
   `holderLeaderboard` block bound to their API.
6. Update this file to CONSOLIDATED or VERIFIED.

## Sources

- https://www.empirebuilder.world
- planning research (token/creator ecosystem pass, 2026-05-13 - thin)
