# Bountycaster

**Status:** CONSOLIDATED
**Last verified:** 2026-05-13 (planning research - re-verify specifics)
**zlank block:** `bountyEscrow` | **template:** `bountycaster-task-board`

## What it is

P2P bounty posting and settlement on Farcaster. Tag `@bountybot` in a cast, the
AI parses it, the bounty gets listed. A hunter claims, completes, and is paid
peer-to-peer on Base. Uses EAS (Ethereum Attestation Service) for onchain
completion proofs. The planning research saw no platform fee (direct peer
payments).

## Integration surface

- Site: https://www.bountycaster.xyz
- FAQ: https://www.bountycaster.xyz/faq/en
- Bot-native: `@bountybot` cast parsing.
- Settlement: Base wallet, P2P.

## zlank `bountyEscrow` block - today vs should do

**Today:** renders a display item (`title - $amount`, description) plus an
optional `View bounty` button (`open_url` to `bountycasterUrl`).

**Should do:** the post-a-bounty action could `compose_cast` a `@bountybot`-
tagged cast with the title, description, and amount pre-filled - matching the
real Bountycaster flow - instead of just linking out.

## To verify

- The exact `@bountybot` cast format Bountycaster parses (amount syntax, etc.).
- Whether Bountycaster has a structured post API or it is cast-intent only.
- EAS attestation schema, if zlank ever wants to show completion status.

## Sources

- https://www.bountycaster.xyz/faq/en
- planning research (token/creator ecosystem pass, 2026-05-13)
