# Partner resources

One file per ecosystem partner zlank ships a signature template for. Each file
covers: what the partner does, their API / contract / integration surface, the
zlank block + template that wraps them, and what still needs research.

## Partner -> zlank block + template map

| Partner | zlank block(s) | Template id | File | Status |
|---------|----------------|-------------|------|--------|
| Clanker | `tokenDeploy` | `clanker-token-launch` | `clanker.md` | VERIFIED |
| Zora | `coinPost` | `zora-coin-this-cast` | `zora.md` | CONSOLIDATED |
| Hypersub / Fabric | `subscribeButton` | `hypersub-creator-subscription` | `hypersub.md` | CONSOLIDATED |
| Polymarket | `marketEmbed` | `polymarket-prediction` | `polymarket.md` | CONSOLIDATED |
| Bountycaster | `bountyEscrow` | `bountycaster-task-board` | `bountycaster.md` | CONSOLIDATED |
| Highlight | `mintButton` | `highlight-mint-drop` | `highlight.md` | CONSOLIDATED |
| Footy App | `liveScore`, `oddsTicker` | `footy-match-day` | `footy-app.md` | CONSOLIDATED |
| Defifa | (poll-based) | `defifa-prediction-game` | `defifa.md` | CONSOLIDATED |
| Empire Builder | `chart`, `link` | `empirebuilder-treasury-board` | `empire-builder.md` | NEEDS PASS |

Also relevant but not yet templated: Manifold, Sound.xyz, Snapshot.

## Open question across all partner blocks

The 10 partner blocks (`tokenDeploy`, `coinPost`, etc.) currently render as
display items or `open_url` buttons in the Snap. None of them do real onchain
execution yet - the Snap protocol has client actions (`swap_token` etc.) but
zlank's blocks do not wire them. Each partner file should record the *correct*
integration target (real API endpoint, SDK, deep-link format, or Snap client
action) so the blocks can be upgraded from "display + link" to "real action."

This is also why the builder cannot field-edit these blocks yet - the editor UI
was deferred until the integration shape per partner is known. Research the
partner, then build the editor against the real surface.
