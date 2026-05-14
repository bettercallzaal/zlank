# Highlight

**Status:** CONSOLIDATED
**Last verified:** 2026-05-13 (planning research - re-verify specifics)
**zlank block:** `mintButton` | **template:** `highlight-mint-drop`

## What it is

Permissionless NFT minting infrastructure. A creator deploys an ERC-721
collection on Highlight, shares a Farcaster Frame, and fans mint in-feed with a
wallet signature. Supports "mint with transaction", "mint with warps", and
auction modes. Highlight takes a small platform fee (exact % not recorded -
verify).

## Integration surface

- Site: https://highlight.xyz
- Farcaster KB: https://support.highlight.xyz/knowledge-base/for-creators/integrations-and-ecosystem/farcaster
- Collections explorer: https://highlight.xyz/explore/farcaster
- Mint is wallet-signature based; chain commonly Base.

## zlank `mintButton` block - today vs should do

**Today:** renders a display item (`label` + `Mint on chain <chainId>`). Carries
`contractAddress`, `chainId`, `tokenId`, `priceWei`, `partnerId`
(`highlight | manifold | sound | zora`) but does not trigger a mint.

**Should do:** wire a mint - the Snap protocol has client transaction actions;
a `mintButton` should construct the mint tx against `contractAddress` on
`chainId`, or `open_url` to the Highlight mint page for that collection.

## To verify

- Highlight's mint page URL pattern per collection (for a clean `open_url`).
- The mint call shape (function, args) for a Snap transaction action.
- Highlight's platform fee in 2026.
- Same questions apply to the other `mintButton` partners: Manifold, Sound.xyz.

## Sources

- https://support.highlight.xyz/knowledge-base/for-creators/integrations-and-ecosystem/farcaster
- https://highlight.xyz/explore/farcaster
- planning research (mint ecosystem pass, 2026-05-13)
