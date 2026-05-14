# Polymarket

**Status:** CONSOLIDATED
**Last verified:** 2026-05-13 (planning research - re-verify specifics)
**zlank block:** `marketEmbed` | **template:** `polymarket-prediction`

## What it is

The largest prediction market. Runs on Polygon PoS. Native to Farcaster - has a
live Frame so users can predict directly from a cast. The planning research saw
$2.1M+ in Farcaster-specific market volume and an X partnership (June 2025) that
embeds Polymarket into X posts with Grok surfacing live odds.

## Integration surface

- Site: https://polymarket.com
- Market URL pattern (used by the zlank block): `https://polymarket.com/event/<slug>`
- Polygon PoS; Farcaster Frames support Polygon transactions.
- Need: a public API for live odds + volume by market slug.

## zlank `marketEmbed` block - today vs should do

**Today:** renders an `open_url` button to the constructed market URL
(`polymarket.com/event/<slug>`, or kalshi / manifold equivalents). Carries
`showOdds`, `showVolume`, `betButton` flags but does not yet fetch live data.

**Should do:** bind a `dataSource` to a Polymarket odds API so `showOdds` /
`showVolume` render real numbers; the `betButton` could deep-link to the
market's bet UI or use a Snap transaction action.

## To verify

- Polymarket's public market API (odds, volume) and the exact endpoint by slug.
- Whether there is a Farcaster-native bet action or it is purely `open_url`.
- Kalshi and Manifold URL patterns (the block also supports those `source`s).

## Sources

- https://polymarket.com
- https://polymarket.com/predictions/farcaster
- planning research (sports adtech + prediction markets pass, 2026-05-13)
