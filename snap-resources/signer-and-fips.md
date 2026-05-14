# Signers, JFS, and the FIP situation

**Status:** CONSOLIDATED
**Last verified:** 2026-05-13 (planning research; re-verify FIP status against the live discussions before relying on it)

Why onchain settlement and delegated writes from a Snap are still blocked, and
what would unblock them.

## What works today

- **JFS (JSON Farcaster Signatures)** - on a Snap POST, the user FID is verified
  via JFS. `@farcaster/snap` exports `verifyJFS`. This is solid.
- **Quick Auth** - lightweight JWT over Sign In with Farcaster. zlank already
  verifies these server-side: `extractFid(req)` in `lib/auth.ts` uses
  `@farcaster/quick-auth`'s `verifyJwt`. Read auth + attribution work.
- **Read everything** - feed reads, pagination, rendering: no signer needed.

## What is blocked

- **Scoped / delegated signers** - there is no ratified FIP for granular signer
  permissions. FIP-7 (Onchain Signers) finalized *binary* signers: a signer can
  post on the user's behalf or it cannot - no "can like but not post" scope.
  Any write action (even a like) needs full signer authority.
- **Snap on an arbitrary publisher webpage** - no protocol spec for rendering a
  Snap outside a Farcaster client with signer/identity injection. zlank's
  `/api/snap/[encoded]/embed` route is a zlank invention, not protocol-backed.
  It works as an anonymous display + outbound-link surface; authed actions from
  it need a token bridge that has no spec yet.

## What this means for zlank

- `lib/signer.ts` ships the *authorization model* (allowlist gate, honest
  `delegateAction` that reports `unavailable`) but cannot execute writes. When a
  scoped-signer FIP lands + a managed signer exists, only `delegateAction`'s body
  changes.
- `docs/embed.md` documents the embed contract and the deferred token bridge.

## kmacb.eth's position

kmacb has been publicly lobbying for relaxed signer requirements on harmless
flows (pagination, sort, "next page" should not need signer infra) and asked
@neynar about a scoped-signer FIP + ETA. If zlank wants the settlement layer to
actually ship, co-authoring or backing that FIP is the path. See the project
memory on the kmacb collaboration.

## Where to re-check

- FIP discussions: https://github.com/farcasterxyz/protocol/discussions
- Snap auth docs: https://docs.farcaster.xyz/snap/auth
- Quick Auth: part of the Mini App SDK docs at https://miniapps.farcaster.xyz

## To deepen this file

Pull the actual FIP-7 discussion and search for any open scoped-signer / signer-
permissions PR or discussion. Record the number, author, status, and ETA here.
