# Clanker

**Status:** VERIFIED
**Last verified:** 2026-05-14
**zlank block:** `tokenDeploy` | **template:** `clanker-token-launch`

## What it is

AI-agent-powered token launchpad on Base (L2). Deploys ERC-20 tokens. Farcaster
acquired Clanker (the AI token-launch platform) and is integrating it more
deeply into the app. CLANKER is the protocol token.

## How a token gets deployed

- **Via Farcaster:** tag `@clanker` in a cast with a token name, ticker, and
  optional image/gif in the body. The bot deploys.
- **Via X:** tag `@clanker_world` with the token details.
- **Mechanics:** a new Uniswap V4 pool is created (base token + quote token,
  WETH by default). The entire total supply is deposited as single-sided
  liquidity. Starting market cap is set to **10 WETH**.

## Integration surface

- **REST API:** `https://www.clanker.world/api`
- **SDK:** `clanker-sdk` on npm - a TypeScript library for deploying and managing
  Clanker tokens onchain. Includes:
  - V4 Clanker class - deploy, claim rewards, update metadata
  - V3 Clanker class - V3 deployment + management
  - V4 extensions - airdrops, presales, allowlist management
- **Docs:** https://clanker.gitbook.io/clanker-documentation
  - Farcaster bot deployments: `/general/token-deployments/farcaster-bot-deployments`
  - Deploying a token: `/general/token-deployments/deploying-a-token`
  - Changelog: `/changelog`
- **Docs repo:** https://github.com/clanker-devco/DOCS

## What the zlank `tokenDeploy` block does today vs should do

**Today:** renders a display item (`name ($SYMBOL)`) plus a `Deploy $SYMBOL`
button that `open_url`s to `https://clanker.world/deploy` generically. The
`clanker-token-launch` template ships with placeholder `name: "My Token"`,
`symbol: "MYTOK"` - and because the builder has no editor for this block yet,
that placeholder cannot be changed in the UI. **This is the known issue that
triggered creating this folder.**

**Should do (options, pick when building the editor):**
1. **Cast-intent deploy** - the canonical Clanker flow is tagging `@clanker` in a
   cast. The block could `compose_cast` with a pre-filled body:
   `@clanker deploy / Name: <name> / Symbol: <symbol>` plus the image. This
   matches how Clanker actually works and needs no API key.
2. **SDK / REST deploy** - use `clanker-sdk` or the `clanker.world/api` REST
   endpoint for a direct deploy. Heavier (needs a signer + the deploy tx), but
   no composer round-trip.
3. **Deep link** - `open_url` to a `clanker.world/deploy?name=...&symbol=...`
   prefilled form if Clanker supports query params (verify - the current block
   links to the bare `/deploy` page).

Recommended near-term: option 1 (`compose_cast` intent) - it is honest, needs no
secrets, and matches the real Clanker UX. Update the block + template + the
builder editor together once confirmed.

## To verify before building the editor

- Does `clanker.world/deploy` accept query params to prefill name/symbol/image?
- Exact `@clanker` cast-intent body format that the bot parses reliably.
- `clanker-sdk` current major version and the minimal deploy call.
- Protocol fee / deploy cost in 2026 (search results referenced fees but were
  not specific enough to record here).

## Sources

- https://thedefiant.io/news/nfts-and-web3/farcaster-acquires-clanker-tokenbot
- https://clanker.gitbook.io/clanker-documentation
- https://github.com/clanker-devco/DOCS
- https://www.quicknode.com/builders-guide/tools/clanker-world-by-farcaster
- https://www.gate.com/crypto-wiki/article/what-is-clanker-and-how-does-it-revolutionize-token-creation-on-base
