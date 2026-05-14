# Hypersub / Fabric

**Status:** CONSOLIDATED
**Last verified:** 2026-05-13 (planning research - re-verify specifics)
**zlank block:** `subscribeButton` | **template:** `hypersub-creator-subscription`

## What it is

Onchain subscriptions. Fabric's Subscription Token Protocol (STP) V2 - a
creator deploys a subscription contract, subscribers mint a subscription token
to gain access (gated content, airdrops). Cross-chain token payments
(any chain / any token, auto-settled). Farcaster-native; channel subscriptions
are common.

## Integration surface

- Docs: https://docs.withfabric.xyz (STP, fees)
- Reported scale: 600+ contracts deployed, ~168 ETH in flows.
- Fees: ~100 bps (1%) protocol fee + a configurable client fee (the planning
  research saw a 12.5% client cap referenced - verify).

## zlank `subscribeButton` block - today vs should do

**Today:** renders a display item (`label` + `durationDays`d / `priceCurrency`).
Carries `subContractAddress`, `chainId`, `durationDays`, `priceCurrency` in the
schema but does not trigger a real subscription mint.

**Should do:** wire the subscribe action - either a Snap client transaction
action against the STP contract, or `open_url` to the Hypersub subscribe page
for that contract.

## To verify

- The STP V2 contract interface for "subscribe / mint subscription".
- Whether Hypersub has a per-contract subscribe URL for a clean `open_url`.
- Exact protocol + client fee numbers in 2026.

## Sources

- https://docs.withfabric.xyz
- planning research (token/creator ecosystem pass, 2026-05-13)
