# Footy App

**Status:** CONSOLIDATED
**Last verified:** 2026-05-13 (planning research - re-verify specifics)
**zlank blocks:** `liveScore`, `oddsTicker` | **template:** `footy-match-day`
**Anchor partner** - see the project memory on the kmacb collaboration.

## What it is

A football (soccer) app on Farcaster. Live match data, fan experiences, team
affiliations. Building toward AI-powered fan experiences (match moments,
football channel posts, Fantasy EPL, banter). The `$SCORES` token is the Footy
App profile token.

## Who builds it

- **kmacb.eth** (FID 4163) - founder + lead engineer. GitHub handle `i001962`,
  X handle `@PublicProof` - all the same person. Top contributor to the repo.
- **gabedev.eth** (FID 420564, GitHub `gabrieltemtsen`) - co-engineer.
- **CassOnMars** (Cassie Heart, Quilibrium) - Hypersnap node infrastructure.

## Integration surface

- App: https://fc-footy.vercel.app
- GitHub org: `footy-fc`, main repo `footy-fc/FC-Footy` (plus `footy-bot`,
  `fc-footy-subgraph`)
- `$SCORES` token on Base: `0xac264447a1d86a3c775a05a60e768cf4120cb3ec`
- Footy runs a Hypersnap node for its data.

## zlank `liveScore` + `oddsTicker` blocks - today vs should do

**Today:** `footy-match-day` template binds `liveScore` to a `match` dataSource
and `oddsTicker` to an `odds` dataSource, both pointing at PLACEHOLDER URLs
(`https://fc-footy.vercel.app/api/match/REPLACE_ME`, `.../api/odds/REPLACE_ME`).
Until real endpoints are wired, `liveScore` renders "Home vs Away".

**Should do:** get the real Footy App match + odds API endpoints from kmacb,
swap the placeholder dataSource URLs, confirm the resolved JSON shape matches
what `liveScore` expects (`{ home, away, minute?, status? }`) and what
`oddsTicker` can consume.

## To verify (ask kmacb directly)

- The real `fc-footy.vercel.app` API: match-state endpoint, odds endpoint,
  their response shapes, rate limits, auth.
- Whether Footy exposes a public match-id scheme zlank can template against.
- Whether to route `$SCORES` settlement through the Footy/Snap flow.

## Sources

- https://fc-footy.vercel.app
- https://github.com/footy-fc/FC-Footy
- planning research (kmacb stack pass, 2026-05-13) + Footy authorship investigation
