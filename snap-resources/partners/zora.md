# Zora

**Status:** CONSOLIDATED
**Last verified:** 2026-05-13 (planning research - re-verify specifics)
**zlank block:** `coinPost` | **template:** `zora-coin-this-cast`

## What it is

"Coin a post" - every post becomes an ERC-20 with 1B supply and instant Uniswap
liquidity. Runs on Zora Network + Base. The creator gets ~10M coins; buyers and
sellers trade via the Uniswap pool; creators earn a share of trading fees.

## Integration surface

- Site: https://zora.co
- Farcaster Frame integration: in-feed "mint"/"buy" button. The Coinbase Base
  App bundles Zora + Farcaster minting.
- Need the per-coin / per-post URL or coin id to deep-link.

## zlank `coinPost` block - today vs should do

**Today:** renders an `open_url` button to `zoraUrl` (label "Buy this post" /
"View on Zora") or a display item with the raw `postId` when no URL is set.

**Should do:** resolve the coin's live stats (holders, price) via a Zora API and
show them; the buy action could use the Snap `swap_token` / `view_token` client
action against the coin's onchain address instead of a generic `open_url`.

## To verify

- Zora's current API for coin stats (holders, price, supply) by coin id.
- The canonical coin/post URL format for `zoraUrl`.
- Whether a Snap `swap_token` action can target a Zora coin directly.

## Sources

- https://zora.co
- planning research (token/creator-coin ecosystem pass, 2026-05-13)
