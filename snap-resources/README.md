# snap-resources

Reference material for building on the Farcaster Snap protocol and integrating
partner apps. **This folder is the first place to look** - check here before
searching online, and add what you learn back here.

## The workflow

1. **Researching anything Snap-related?** Read the relevant file here first.
2. **Found something online that isn't here?** Add it - a new file or a section
   in an existing one. Cite the source URL and the date.
3. **A file looks stale?** Each file has a `Last verified` date. If it is old,
   re-check against the canonical source before relying on it.

## Index

| File | What it covers |
|------|----------------|
| `snap-spec.md` | The Snap protocol: response format, the 16 components, 10 actions, structural limits, build + deploy. Distilled from the official `SKILL.md`. |
| `building-snaps.md` | How to actually build a Snap fast: the agent workflow, the official demo apps, dev links, known client bugs, community examples. |
| `signer-and-fips.md` | JFS auth, the scoped-signer FIP status, and why onchain settlement / delegated writes are still blocked. |
| `partners/` | One file per ecosystem partner zlank ships templates for: what they do, their API/contract surface, the zlank block that wraps them, research status. |

## Canonical upstream sources (always re-checkable)

- Snap docs: https://docs.farcaster.xyz/snap
- Agent skill spec: https://docs.farcaster.xyz/snap/SKILL.md
- Docs as llms.txt: https://docs.farcaster.xyz/snap/llms.txt
- Monorepo: https://github.com/farcasterxyz/snap (core pkgs, emulator, template, examples)
- Protocol FIPs: https://github.com/farcasterxyz/protocol/discussions
- In-app emulator with JFS signing: https://farcaster.xyz/~/developers/snaps

## Research status legend

Files use these markers so you know how much to trust them:

- **VERIFIED** - checked against the canonical source on the `Last verified` date.
- **CONSOLIDATED** - assembled from prior research; directionally right, but
  re-verify specifics (contract addresses, fees, API shapes) before building on it.
- **NEEDS PASS** - placeholder; do a real research pass before relying on it.
